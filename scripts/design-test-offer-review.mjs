import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

// The friends' test purchase. Owner, 22 Nov: «Сделай еще тестовое отдельное
// отделение моим друзьям за 667 тенге, пометь что оно тестовое». /test sells
// the server's «Тестовый доступ · для друзей» (bashpayy-hash/iitaly, 667 ₸,
// the same cabinet). It says it is a test before anything else, no page links
// to it, it is not in the sitemap and search engines are asked not to index it.
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out');
const PRODUCT = 'Тестовый доступ · для друзей';

const html = await readFile(join(root, 'test.html'), 'utf8');
assert.match(html, /<meta name="robots" content="noindex, nofollow"/, '/test asks not to be indexed');
assert.doesNotMatch(await readFile(join(root, 'sitemap.xml'), 'utf8'), /<loc>https:\/\/iitaly\.net\/test<\/loc>/, '/test is not in the sitemap');
const pages = [];
const walk = async dir => { for (const entry of await readdir(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) { if (entry.name !== '_next') await walk(path); } else if (entry.name.endsWith('.html')) pages.push(path); } };
await walk(root);
const linking = [];
for (const file of pages) if (!file.endsWith(`${sep}test.html`) && /href="\/test(?:[?#"])/.test(await readFile(file, 'utf8'))) linking.push(relative(root, file));
assert.deepEqual(linking, [], 'No page links to /test');

const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return res.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        return res.end(await readFile(file));
      }
    }
    res.writeHead(404).end();
  } catch { res.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.REVIEW_CHROMIUM ? { executablePath: process.env.REVIEW_CHROMIUM, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {});
const results = [];
const flat = text => text.replace(/\s+/g, ' ').trim();

try {
  for (const width of [1440, 390]) {
    const phone = width < 600;
    const context = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, hasTouch: phone, isMobile: phone, reducedMotion: 'reduce', locale: 'ru-RU' });
    const orders = [];
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === origin) return route.continue();
      if (url.pathname === '/api/stripe/checkout') { orders.push(request.postDataJSON()); return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Оплата картой пока не настроена.' }) }); }
      if (url.pathname === '/api/event') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      return route.abort();
    });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/test', { waitUntil: 'load' });
    const card = page.locator('[data-test-offer]');
    // It says «test» first: the badge stands above the heading, and the heading and the price say it again.
    const order = await card.evaluate(node => [...node.querySelectorAll('[data-test-badge], h1')].map(element => element.tagName));
    assert.deepEqual(order, ['P', 'H1'], `/test ${width}: the badge comes before the heading`);
    assert.equal(flat(await card.locator('[data-test-badge]').innerText()), 'Тест');
    assert.match(flat(await card.locator('h1').innerText()), /^Тестовый доступ/);
    assert.match(flat(await card.innerText()), /667 ₸ вместо 10 990 ₸/);
    assert.match(flat(await card.innerText()), /Это тестовая покупка/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `/test ${width}: no sideways scroll`);
    // The purchase form is the site's own, for the test product.
    await card.locator('[data-test-buy]').click();
    const dialog = page.getByRole('dialog');
    assert.match(flat(await dialog.innerText()), new RegExp(`${PRODUCT} 667 ₸`));
    await dialog.getByLabel('Имя', { exact: true }).fill('Друг');
    await dialog.getByLabel('Фамилия', { exact: true }).fill('Тестов');
    await dialog.getByLabel('Телефон', { exact: true }).fill('+7 700 000 00 00');
    await dialog.getByRole('button', { name: 'Перейти к оплате', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    assert.deepEqual(orders.map(body => body.product), [PRODUCT], `/test ${width}: the order names the test product`);
    assert.deepEqual(errors, [], `No page errors at ${width}`);
    results.push({ width, passed: true });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  server.close();
}
