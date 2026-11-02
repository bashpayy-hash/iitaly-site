// Build with NEXT_PUBLIC_BACKEND_URL=https://example.invalid and the same
// NEXT_PUBLIC_STRIPE_ENABLED value as this script. All external calls are mocked.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'Set REVIEW_TOOLS to the isolated browser tools.');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const { default: axe } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.js')).href);
const stripe = process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true';
const root = resolve(process.env.REVIEW_OUT || 'out');
const output = resolve(`design-review/pricing-purchase/${stripe ? 'stripe' : 'manual'}`);
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return res.writeHead(403).end();
    for (const file of [path, `${path}.html`, resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }).end(await readFile(file));
        return;
      }
    }
    res.writeHead(404).end();
  } catch { res.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const results = [], errors = [];
const purchase = /Купить за 10\s*990\s*₸/;

async function overflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'No horizontal page overflow');
}
async function accessible(page, selector) {
  const violations = await page.evaluate(async selector => (await window.axe.run(document.querySelector(selector), {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
  })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), selector);
  assert.deepEqual(violations, [], `Accessibility: ${selector}`);
}

try {
  for (const [width, height] of [[320, 667], [390, 844], [768, 1024], [1440, 900]]) {
    const context = await browser.newContext({ viewport: { width, height }, locale: 'ru-RU', reducedMotion: 'reduce' });
    let calls = 0, release;
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      const json = (status, data) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
      if (url.pathname === (stripe ? '/api/stripe/checkout' : '/api/order')) {
        calls++;
        assert.deepEqual(request.postDataJSON(), {
          product: 'Поступление под ключ', name: 'Demo', surname: 'Testov', phone: '+7 700 000 00 00',
          ...(!stripe && { price: 10990 }),
        });
        if (calls === 1) {
          await new Promise(done => { release = done; });
          return json(503, { ok: false, error: 'Тест: связь прервалась. Попробуй ещё раз.' });
        }
        return json(200, stripe
          ? { ok: true, url: 'https://checkout.stripe.com/c/pay/iitaly-fixture', orderId: 'fixture-order', orderToken: 'fixture-token' }
          : { ok: true, orderId: 'fixture-order' });
      }
      if (url.hostname === 'checkout.stripe.com') return route.fulfill({ contentType: 'text/html', body: '<title>Test checkout</title><p>Mock payment destination. No charge.</p>' });
      if (url.pathname === '/api/event' || url.pathname === '/health/ai') return json(200, { ok: true });
      if (url.origin === origin || url.protocol === 'data:') return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    assert.equal((await page.goto(`${origin}/prices`, { waitUntil: 'networkidle' })).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: axe.source });
    const hero = page.locator('[data-pricing-buy="hero"]');
    assert.match(await hero.innerText(), purchase);
    assert.equal(await page.getByRole('button', { name: purchase }).count(), 2, 'Both entry points state the same price');
    const box = await hero.boundingBox();
    assert(box.y >= 60 && box.y + box.height < height - 8, 'Buy is visible in the first viewport');
    assert(box.height >= 44, 'Buy meets the touch target size');
    assert(await hero.evaluate(el => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    }), 'Artwork and the assistant do not cover Buy');
    await overflow(page);
    await accessible(page, 'main');
    if (width === 390 || width === 1440) await page.screenshot({ path: resolve(output, `prices-${width}.png`), animations: 'disabled' });
    if (width >= 768) {
      const heights = await page.locator('[data-price-comparison] > div').evaluateAll(els => els.map(el => el.getBoundingClientRect().height));
      assert(Math.abs(heights[0] - heights[1]) < 1, 'Comparison cards align');
    }

    // Each entry point opens the same product and returns focus on Escape.
    for (const location of ['package', 'hero']) {
      const trigger = page.locator(`[data-pricing-buy="${location}"]`);
      await trigger.click();
      const dialog = page.getByRole('dialog');
      assert.match(await dialog.innerText(), /10\s*990\s*₸/);
      assert.equal(await dialog.getByLabel('Имя', { exact: true }).evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').count(), 0);
      assert(await trigger.evaluate(el => el === document.activeElement));
    }
    await hero.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    const submit = () => dialog.getByRole('button', { name: stripe ? 'Перейти к оплате' : 'Оформить заказ', exact: true });
    await submit().click();
    await dialog.getByRole('alert').waitFor();
    assert.equal(calls, 0, 'Invalid form never submits');
    assert.equal(await dialog.locator('[aria-invalid=true]').count(), 3);
    await accessible(page, '[role=dialog]');
    if (width === 390 || width === 1440) await page.screenshot({ path: resolve(output, `checkout-error-${width}.png`), animations: 'disabled' });
    await dialog.getByLabel('Имя', { exact: true }).fill('Demo');
    await dialog.getByLabel('Фамилия', { exact: true }).fill('Testov');
    await dialog.getByLabel('Телефон', { exact: true }).fill('+7 700 000 00 00');
    await submit().click();
    await dialog.getByRole('status').waitFor();
    await page.keyboard.press('Tab');
    assert(await dialog.evaluate(el => el.contains(document.activeElement)), 'Loading keeps keyboard focus inside the dialog');
    assert.equal(calls, 1);
    release();
    await dialog.getByRole('alert').filter({ hasText: 'Тест: связь прервалась' }).waitFor();
    assert.equal(await dialog.getByLabel('Имя', { exact: true }).inputValue(), 'Demo');
    assert.equal(await dialog.getByLabel('Телефон', { exact: true }).inputValue(), '+7 700 000 00 00');
    await page.keyboard.press('Tab');
    assert(await dialog.evaluate(el => el.contains(document.activeElement)), 'Error recovery keeps keyboard focus inside the dialog');
    await submit().click();
    if (stripe) {
      await page.waitForURL('https://checkout.stripe.com/c/pay/iitaly-fixture');
    } else {
      await dialog.getByText('Заказ принят', { exact: true }).waitFor();
      assert.doesNotMatch(await dialog.innerText(), /✅/);
      assert.match(await dialog.getByRole('link', { name: 'Открыть WhatsApp' }).getAttribute('href'), /^https:\/\/wa\.me\//);
      assert((await dialog.getByRole('button', { name: 'Копировать', exact: true }).boundingBox()).height >= 44);
      assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1), false, 'Transfer details fit the dialog');
      await accessible(page, '[role=dialog]');
      if (width === 390) await page.screenshot({ path: resolve(output, 'transfer-390.png'), animations: 'disabled' });
    }
    assert.equal(calls, 2, 'Exactly one failed attempt and one explicit retry');
    results.push({ test: `${width}px: first-screen purchase, focus, validation, ${stripe ? 'mock Stripe redirect' : 'mock transfer instructions'}, no overflow`, passed: true });

    // Shared navigation/controls receive the same small polish on public pages.
    if (stripe && (width === 390 || width === 1440)) {
      for (const path of ['/', '/plan', '/guides', '/universities']) {
        await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await overflow(page);
        const header = page.locator('header').first();
        if (width === 390) {
          await header.getByText('Меню', { exact: false }).first().click();
          const menu = header.getByRole('navigation', { name: 'Мобильная навигация' });
          if (path !== '/') assert.equal(await menu.locator('[aria-current=page]').count(), 1);
          await page.screenshot({ path: resolve(output, `${path.slice(1) || 'home'}-menu-${width}.png`), animations: 'disabled' });
          await page.keyboard.press('Escape');
          assert.equal(await menu.isVisible(), false);
        } else {
          assert.equal(await header.getByRole('navigation', { name: 'Основная навигация' }).isVisible(), true);
          await page.screenshot({ path: resolve(output, `${path.slice(1) || 'home'}-${width}.png`), animations: 'disabled' });
        }
      }
      results.push({ test: `${width}px: public navigation and layout`, passed: true });
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ results, errors }, null, 2));
}
console.log(JSON.stringify(results, null, 2));
