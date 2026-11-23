import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

// The site is launched: no friends' test purchase. Owner, 23 Nov: «убери
// теперь опцию для друзей, сайт запустили!!». The 667 ₸ «Тестовый доступ ·
// для друзей» (22 Nov) is gone from the site: no /test page, no card on
// /prices, no link in the footer, no «667 ₸» anywhere; the server no longer
// sells it either (bashpayy-hash/iitaly). What a buyer meets on /prices is the
// full route at its price, and the order names that product.
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out');
const PRODUCT = 'Поступление под ключ';

const pages = [];
const walk = async dir => { for (const entry of await readdir(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) { if (entry.name !== '_next') await walk(path); } else if (entry.name.endsWith('.html')) pages.push(path); } };
await walk(root);
assert(!pages.some(file => file.endsWith(`${sep}test.html`) || file.endsWith(`${sep}test${sep}index.html`)), 'There is no /test page');
const left = [];
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  if (/href="\/test(?:[?#"])/.test(html) || /Тестовый доступ|Тест для друзей|667(?:&nbsp;|\u00a0| )₸/.test(html)) left.push(relative(root, file));
}
assert.deepEqual(left, [], 'No page links to /test or offers the 667 ₸ test');
assert.doesNotMatch(await readFile(join(root, 'sitemap.xml'), 'utf8'), /\/test</, 'The sitemap has no /test');

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
    // /test is the site's 404 now.
    const gone = await page.goto(origin + '/test', { waitUntil: 'load' });
    assert.equal(gone.status(), 404, `/test ${width}: the page is gone`);
    await page.goto(origin + '/prices', { waitUntil: 'load' });
    assert.equal(await page.locator('[data-test-offer-card], [data-test-buy], [data-test-badge]').count(), 0, `/prices ${width}: no test card`);
    assert.doesNotMatch(flat(await page.locator('body').innerText()), /Тестовый доступ|Тест для друзей|667 ₸/, `/prices ${width}: no test wording`);
    assert.equal(await page.locator('footer a[href="/test"]').count(), 0, `/prices ${width}: the footer has no test link`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `/prices ${width}: no sideways scroll`);
    // The main purchase is what is sold, at its price.
    await page.locator('[data-pricing-buy=package]').click();
    const dialog = page.getByRole('dialog');
    assert.match(flat(await dialog.innerText()), /10 990 ₸/, `/prices ${width}: the dialog sells the full route`);
    await dialog.getByLabel('Имя', { exact: true }).fill('Алия');
    await dialog.getByLabel('Фамилия', { exact: true }).fill('Тестова');
    await dialog.getByLabel('Телефон', { exact: true }).fill('+7 700 000 00 00');
    await dialog.getByRole('button', { name: 'Перейти к оплате', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    assert.deepEqual(orders.map(body => body.product), [PRODUCT], `/prices ${width}: the order names the full route`);
    assert.deepEqual(errors, [], `No page errors at ${width}`);
    results.push({ width, passed: true });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  server.close();
}
