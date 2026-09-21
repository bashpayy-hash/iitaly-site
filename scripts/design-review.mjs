import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const tools = process.env.REVIEW_TOOLS;
assert(tools, 'REVIEW_TOOLS must point to the isolated browser-tool installation.');
const { chromium } = await import(pathToFileURL(resolve(tools, 'playwright/index.mjs')).href);
const output = resolve('design-review');
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon' };
function serve(root, port) {
  root = resolve(root);
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const path = resolve(root, `.${pathname}`);
      if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
      let file;
      for (const candidate of [path, `${path}.html`, resolve(path, 'index.html')]) {
        if (await stat(candidate).then(s => s.isFile()).catch(() => false)) { file = candidate; break; }
      }
      if (!file) { response.writeHead(404).end(); return; }
      response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
      response.end(await readFile(file));
    } catch { response.writeHead(500).end(); }
  });
  return new Promise(resolveReady => server.listen(port, '127.0.0.1', () => resolveReady(server)));
}
const servers = [await serve('out', 4173), await serve(process.env.BASELINE_OUT, 4174)];
const browser = await chromium.launch();
const results = [];
const pageErrors = [];
async function makePage(width, reducedMotion = 'reduce') {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion, deviceScaleFactor: 1, locale: 'ru-RU', timezoneId: 'Europe/Rome' });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return ['127.0.0.1', 'localhost'].includes(url.hostname) || url.protocol === 'data:' ? route.continue() : route.abort();
  });
  if (reducedMotion === 'reduce') {
    // Playwright's screenshot animation switch does not pause CSS inside an
    // SVG loaded through <img>. Freeze that legacy mascot animation equally
    // in base/head responses; no element is masked and no source is changed.
    await context.route('**/mascot/source/*.svg', async route => {
      const response = await route.fetch();
      const svg = (await response.text()).replace('</svg>', '<style>* { animation: none !important; }</style></svg>');
      await route.fulfill({ response, body: svg });
    });
  }
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  return page;
}
async function settle(page) {
  await page.evaluate(async () => { await document.fonts.ready; for (const image of document.images) image.loading = 'eager'; await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
  await page.waitForTimeout(350);
}
async function visit(page, route, port = 4173) {
  const response = await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, `${route}: document status`);
  await settle(page);
}
async function shot(page, name, fullPage = false) {
  return page.screenshot({ path: resolve(output, `${name}.png`), fullPage, animations: 'disabled', caret: 'hide' });
}
// Surrounding controls and the fixed paper overlay intentionally changed.
// Retain visual evidence, but compare the actual SVG structure and computed
// presentation rather than asserting the old page chrome remains unchanged.
async function mapShot(page, name) {
  const map = page.getByRole('img', { name: 'Карта Италии с университетами по городам' });
  await map.screenshot({ path: resolve(output, `${name}.png`), animations: 'disabled' });
  return map.evaluate(svg => ({
    viewBox: svg.getAttribute('viewBox'),
    markup: svg.innerHTML,
    presentation: [...svg.querySelectorAll('*')].map(el => {
      const s = getComputedStyle(el);
      return [el.tagName, s.fontFamily, s.fontSize, s.fontWeight, s.fill, s.stroke, s.strokeWidth, s.opacity];
    }),
  }));
}
function compareImages(base, actual, name) {
  assert.deepEqual(actual, base, name + ': SVG data, structure and computed presentation unchanged');
  results.push({ test: name, passed: true, comparison: 'SVG DOM and computed presentation; surrounding chrome intentionally updated' });
}
try {
  for (const width of [1440, 390]) {
    const page = await makePage(width);
    for (const route of ['/', '/plan', '/prices', '/guides', '/portal']) {
      await visit(page, route);
      assert.equal(await page.locator('main').count(), 1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, `${route} horizontal overflow at ${width}`);
      await shot(page, `${route === '/' ? 'home' : route.slice(1)}-${width}`, route === '/');
      results.push({ test: `${route} ${width}px smoke`, passed: true });
    }
    // Compare direct entry, then entry via the redesigned client-side navigation.
    await visit(page, '/universities', 4174);
    const baseline = await mapShot(page, `universities-map-baseline-${width}`);
    await visit(page, '/universities');
    assert.equal(await page.locator('[data-marketing-surface]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('lenis')), false);
    compareImages(baseline, await mapShot(page, `universities-map-head-${width}`), `university SVG ${width}px direct`);
    await visit(page, '/');
    await page.getByRole('link', { name: 'Смотреть университеты', exact: true }).click();
    await page.waitForURL('**/universities');
    await settle(page);
    assert.equal(await page.locator('[data-marketing-surface]').count(), 0);
    compareImages(baseline, await mapShot(page, `universities-map-navigation-${width}`), `university SVG ${width}px client navigation`);
    await page.context().close();
  }
  const page = await makePage(1440);
  await visit(page, '/plan');
  const quizBox = await page.locator('#questionnaire').boundingBox();
  const documentBox = await page.locator('#document-check').boundingBox();
  assert(quizBox && documentBox && quizBox.y < documentBox.y, 'Free plan starts before the separate document tool');
  assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuemax'), '6');
  const fileInput = page.getByLabel('Выбрать документ для проверки');
  await fileInput.focus();
  assert.equal(await fileInput.evaluate(el => document.activeElement === el), true, 'Document picker remains keyboard accessible');
  const choices = ['11 классов', '4,7 и выше', 'Бакалавриат', 'Без стипендии будет сложно', 'Экономика, бизнес', 'Есть IELTS или TOEFL'];
  for (const name of choices) await page.getByRole('button', { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
  await page.getByRole('button', { name: 'Пропустить и посмотреть план', exact: true }).click();
  await settle(page);
  assert.equal(await page.getByText('Что заканчиваешь?', { exact: true }).count(), 0);
  await shot(page, 'plan-complete', true);
  results.push({ test: 'Six-question quiz completes without contact submission', passed: true });
  await visit(page, '/prices');
  await page.getByRole('button', { name: 'Оформить и оплатить', exact: true }).click();
  assert.equal(await page.getByRole('dialog').isVisible(), true);
  await page.getByRole('textbox', { name: 'Фамилия', exact: true }).pressSequentially('Тестов');
  assert.equal(await page.getByRole('textbox', { name: 'Фамилия', exact: true }).inputValue(), 'Тестов');
  assert.equal(await page.getByRole('textbox', { name: 'Фамилия', exact: true }).evaluate(el => document.activeElement === el), true, 'Typing does not move focus to another field');
  await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();
  assert.equal(await page.getByRole('dialog').getByRole('alert').innerText(), 'Проверь имя, фамилию и телефон.');
  assert.equal(await page.getByRole('textbox', { name: 'Телефон', exact: true }).getAttribute('aria-invalid'), 'true');
  await shot(page, 'checkout-open');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Оформить и оплатить', exact: true }).evaluate(el => document.activeElement === el), true, 'Closing restores focus to the purchase button');
  results.push({ test: 'Checkout retains typing focus, validates locally, and restores focus on Escape; no order submitted', passed: true });
  await visit(page, '/guides#visa');
  assert.match(await page.locator('#guide-chapter-content').innerText(), /Виза/i);
  results.push({ test: 'Desktop visa deep link opens the relevant chapter', passed: true });
  await visit(page, '/payment/success');
  await page.waitForTimeout(50);
  assert.match(await page.locator('main').innerText(), /нет данных платёжной сессии|нет данных платежной сессии/i);
  await shot(page, 'payment-success-missing');
  results.push({ test: 'Stripe return page handles a missing local checkout token safely', passed: true });
  await visit(page, '/');
  const summary = page.locator('summary').filter({ hasText: 'Можно вернуть деньги?' });
  await summary.click();
  assert.equal(await summary.evaluate(el => el.parentElement.open), true);
  results.push({ test: 'FAQ opens', passed: true });
  await page.context().close();
  const mobile = await makePage(390);
  await visit(mobile, '/');
  await mobile.getByLabel('Открыть меню').click();
  assert.equal(await mobile.getByRole('navigation', { name: 'Мобильная навигация' }).isVisible(), true);
  await shot(mobile, 'mobile-menu');
  await mobile.keyboard.press('Escape');
  assert.equal(await mobile.getByRole('navigation', { name: 'Мобильная навигация' }).isVisible(), false);
  await mobile.getByLabel('Открыть меню').click();
  await mobile.locator('[data-journey-preview]').click({ position: { x: 8, y: 8 } });
  assert.equal(await mobile.getByRole('navigation', { name: 'Мобильная навигация' }).isVisible(), false, 'Outside tap closes mobile navigation');
  await visit(mobile, '/guides#visa');
  assert.equal(await mobile.locator('details#visa').evaluate(el => el.open), true, 'Mobile visa deep link opens its disclosure');
  await shot(mobile, 'guide-visa-mobile');
  results.push({ test: 'Mobile menu closes on Escape/outside tap; guide deep links open the correct disclosure', passed: true });
  await mobile.context().close();
  const motionPage = await makePage(1440, 'no-preference');
  await visit(motionPage, '/');
  await motionPage.evaluate(() => window.scrollTo(0, 800));
  await motionPage.waitForTimeout(600);
  await shot(motionPage, 'home-motion');
  await motionPage.emulateMedia({ reducedMotion: 'reduce' });
  await motionPage.waitForTimeout(200);
  assert.equal(await motionPage.locator('[data-journey-preview]').evaluate(el => el.style.transform), '');
  await motionPage.emulateMedia({ reducedMotion: 'no-preference' });
  await visit(motionPage, '/');
  await motionPage.getByRole('link', { name: 'Смотреть университеты', exact: true }).click();
  await motionPage.waitForURL('**/universities');
  await settle(motionPage);
  assert.equal(await motionPage.evaluate(() => document.documentElement.classList.contains('lenis')), false);
  assert.equal(await motionPage.locator('.pin-spacer').count(), 0);
  await motionPage.mouse.move(1200, 300);
  await motionPage.mouse.wheel(0, 600);
  await motionPage.waitForTimeout(600);
  assert.equal(await motionPage.evaluate(() => scrollY > 0), true, 'Native scrolling works after leaving Lenis');
  results.push({ test: 'Native university scroll restored after animated homepage navigation', passed: true });
  await motionPage.context().close();
  results.push({ test: 'Desktop motion cleans up on reduced-motion change', passed: true });
  assert.deepEqual(pageErrors, [], 'Browser runtime errors');
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, pageErrors }, null, 2));
  await browser.close();
  await Promise.all(servers.map(server => new Promise(done => server.close(done))));
}
console.log(JSON.stringify(results, null, 2));
