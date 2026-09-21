import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'Use the isolated Playwright installation');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const output = resolve('checkout-review');
await mkdir(output, { recursive: true });
const root = resolve('out');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(root + sep)) return response.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        return response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }).end(await readFile(file));
      }
    }
    response.writeHead(404).end();
  } catch { response.writeHead(500).end(); }
});
await new Promise(done => server.listen(4191, '127.0.0.1', done));
const origin = 'http://127.0.0.1:4191';
const browser = await chromium.launch();
const errors = [], results = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', locale: 'ru-RU' });
    const orders = [], statusRequests = [];
    let checkoutFails = false, paid = false, fulfillment = 'portal';
    // Every external request is either an explicit fixture or aborted. These
    // scenarios never create a Stripe Session, charge, real order or real lead.
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.hostname === '127.0.0.1') return route.continue();
      const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
      if (url.origin === 'https://example.invalid' && url.pathname === '/api/stripe/checkout') {
        assert.equal(request.method(), 'POST');
        orders.push(request.postDataJSON());
        if (checkoutFails) return json({ ok: false, error: 'Не удалось открыть Stripe Checkout.' }, 503);
        return json({ ok: true, url: 'https://checkout.stripe.com/c/pay/cs_test_fixture', orderId: 'ord_fixture', orderToken: 'synthetic-order-token' });
      }
      if (url.origin === 'https://example.invalid' && url.pathname === '/api/order/status') {
        const fields = request.postDataJSON();
        statusRequests.push(fields);
        assert.deepEqual(fields, { orderId: 'ord_fixture', orderToken: 'synthetic-order-token' });
        return json(paid ? { ok: true, status: fulfillment === 'portal' ? 'activated' : 'paid', fulfillment, ...(fulfillment === 'portal' ? { portal: { code: 'TEST-ONLY', surname: 'Тестов' } } : {}) } : { ok: true, status: 'checkout_created', fulfillment });
      }
      if (url.href === 'https://checkout.stripe.com/c/pay/cs_test_fixture') {
        return route.fulfill({ contentType: 'text/html', body: `<h1>Isolated Checkout fixture</h1><a href="${origin}/payment/success">Return</a>` });
      }
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/prices');
    await page.getByRole('button', { name: 'Оформить и оплатить', exact: true }).click();
    const dialog = page.getByRole('dialog');
    assert.match(await dialog.innerText(), /Безопасная оплата через Stripe/);
    const pay = dialog.getByRole('button', { name: 'Перейти к оплате', exact: true });
    await pay.click();
    await dialog.getByRole('alert').waitFor({ state: 'visible' });
    assert.equal(orders.length, 0, 'Invalid form never submits an order');
    await dialog.getByRole('textbox', { name: 'Имя', exact: true }).fill('Тест');
    await dialog.getByRole('textbox', { name: 'Фамилия', exact: true }).fill('Тестов');
    await dialog.getByRole('textbox', { name: 'Телефон', exact: true }).fill('+77000000000');
    checkoutFails = true;
    await pay.click();
    await dialog.getByText('Не удалось открыть Stripe Checkout.', { exact: true }).waitFor({ state: 'visible' });
    assert.equal(await dialog.getByRole('textbox', { name: 'Фамилия', exact: true }).inputValue(), 'Тестов');
    checkoutFails = false;
    await page.screenshot({ path: resolve(output, `checkout-${width}.png`) });
    await pay.click();
    await page.waitForURL('https://checkout.stripe.com/c/pay/cs_test_fixture');
    assert.deepEqual(orders.at(-1), { product: 'Поступление под ключ', name: 'Тест', surname: 'Тестов', phone: '+77000000000' });
    assert(!('price' in orders.at(-1)), 'Server remains the authority for pricing');
    await page.getByRole('link', { name: 'Return', exact: true }).click();
    await page.getByText('Ждём подтверждение оплаты от Stripe…', { exact: true }).waitFor({ state: 'visible' });
    assert.equal(await page.getByText('Оплата подтверждена', { exact: true }).count(), 0, 'Return alone never claims payment succeeded');
    assert.equal(await page.getByRole('link', { name: 'Открыть кабинет', exact: true }).count(), 0);
    paid = true;
    await page.getByRole('heading', { name: 'Кабинет уже готов', exact: true }).waitFor({ state: 'visible' });
    assert(statusRequests.length >= 2);
    assert.equal(await page.getByRole('link', { name: 'Открыть кабинет', exact: true }).getAttribute('href'), '/portal');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_pending_payment')), null);
    await page.screenshot({ path: resolve(output, `activated-${width}.png`) });
    await page.reload();
    await page.getByText(/В этой вкладке нет данных платёжной сессии/).waitFor({ state: 'visible' });
    assert.equal(await page.getByRole('link', { name: 'Открыть кабинет', exact: true }).count(), 0);
    results.push({ width, passed: true, scenario: 'Validation, retry, server-priced checkout, token-bound pending/confirmed return and safe refresh' });
    await context.close();
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors }, null, 2));
  await browser.close();
  await new Promise(done => server.close(done));
}
console.log(JSON.stringify(results, null, 2));
