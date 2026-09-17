import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const tools = process.env.REVIEW_TOOLS;
assert(tools, 'REVIEW_TOOLS must point to the isolated browser-tool installation.');
const { chromium } = await import(pathToFileURL(resolve(tools, 'playwright/index.mjs')).href);
const { default: pngjs } = await import(pathToFileURL(resolve(tools, 'pngjs/lib/png.js')).href);
const { PNG } = pngjs;
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
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  return page;
}
async function settle(page) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
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
function compareImages(base, actual, name) {
  const a = PNG.sync.read(base), b = PNG.sync.read(actual);
  assert.equal(a.width, b.width, name + ': width');
  assert.equal(a.height, b.height, name + ': height');
  let changed = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2] || a.data[i + 3] !== b.data[i + 3]) changed++;
  }
  results.push({ test: name, changedPixels: changed, pixels: a.width * a.height });
  assert.equal(changed, 0, name + ': the protected route must remain pixel-identical');
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
    const baseline = await shot(page, `universities-baseline-${width}`, true);
    await visit(page, '/universities');
    assert.equal(await page.locator('[data-marketing-surface]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('lenis')), false);
    compareImages(baseline, await shot(page, `universities-head-${width}`, true), `universities ${width}px direct`);
    await visit(page, '/');
    await page.getByRole('link', { name: 'Смотреть университеты', exact: true }).click();
    await page.waitForURL('**/universities');
    await settle(page);
    assert.equal(await page.locator('[data-marketing-surface]').count(), 0);
    compareImages(baseline, await shot(page, `universities-navigation-${width}`, true), `universities ${width}px client navigation`);
    await page.context().close();
  }
  const page = await makePage(1440);
  await visit(page, '/plan');
  const choices = ['11 классов', '4,7 и выше', 'Бакалавриат', 'Без стипендии будет сложно', 'Экономика, бизнес', 'Есть IELTS или TOEFL'];
  for (const name of choices) await page.getByRole('button', { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
  await page.getByRole('button', { name: 'Пропустить и посмотреть план', exact: true }).click();
  await settle(page);
  assert.equal(await page.getByText('Что заканчиваешь?', { exact: true }).count(), 0);
  await shot(page, 'plan-complete', true);
  results.push({ test: 'Six-question quiz completes without contact submission', passed: true });
  await visit(page, '/prices');
  await page.getByRole('button', { name: 'Оплатить и начать', exact: true }).click();
  assert.equal(await page.getByRole('dialog').isVisible(), true);
  await shot(page, 'checkout-open');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  results.push({ test: 'Checkout opens and Escape closes; no order submitted', passed: true });
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
  await mobile.context().close();
  const motionPage = await makePage(1440, 'no-preference');
  await visit(motionPage, '/');
  await motionPage.evaluate(() => window.scrollTo(0, 800));
  await motionPage.waitForTimeout(600);
  await shot(motionPage, 'home-motion');
  await motionPage.emulateMedia({ reducedMotion: 'reduce' });
  await motionPage.waitForTimeout(200);
  assert.equal(await motionPage.locator('[data-journey-preview]').evaluate(el => el.style.transform), '');
  await motionPage.context().close();
  results.push({ test: 'Desktop motion cleans up on reduced-motion change', passed: true });
  assert.deepEqual(pageErrors, [], 'Browser runtime errors');
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, pageErrors }, null, 2));
  await browser.close();
  await Promise.all(servers.map(server => new Promise(done => server.close(done))));
}
console.log(JSON.stringify(results, null, 2));
