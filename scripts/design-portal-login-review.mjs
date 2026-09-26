import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS || '/tmp/iitaly-browser/node_modules', 'playwright'));
const root = resolve('out');
const output = resolve('design-review/portal-login');
await mkdir(output, { recursive: true });
const assets = [
  ['https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/fe1a7012-e883-4026-a630-67bb8babf92e.webp', 'a5128666c6136fc4dbdae8212992fc205edf52184634ae218cf1980144f5a4f6'],
  ['https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/9273dd44-3498-4309-9c30-d763a10345b6.webp', 'df968d42507c936fcc2a73125acdd00f94dff01cdee8bddaaacb1b6048c1fb92'],
];
const imageBytes = new Map();
for (const [url, expectedHash] of assets) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  assert.equal(res.status, 200, 'The approved image must be publicly available');
  const bytes = Buffer.from(await res.arrayBuffer());
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash, 'Artwork content must remain unchanged');
  imageBytes.set(url, bytes);
}
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    const candidate = resolve(root, '.' + pathname);
    assert(candidate === root || candidate.startsWith(root + sep));
    for (const file of [candidate, candidate + '.html', resolve(candidate, 'index.html')]) {
      if ((await stat(file).catch(() => null))?.isFile()) {
        res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        res.end(await readFile(file));
        return;
      }
    }
    res.writeHead(404); res.end('Not found');
  } catch { res.writeHead(500); res.end('Server error'); }
});
await new Promise((done) => server.listen(4178, '127.0.0.1', done));
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 1024, 768, 390, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, locale: 'ru-RU', reducedMotion: 'reduce' });
    const errors = [];
    const auth = [];
    let acceptLogin = false;
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (imageBytes.has(url.href)) return route.fulfill({ status: 200, contentType: 'image/webp', body: imageBytes.get(url.href) });
      if (url.pathname === '/api/portal/lookup') {
        assert.equal(route.request().method(), 'POST');
        auth.push(route.request().postDataJSON());
        await new Promise((done) => setTimeout(done, 250));
        if (acceptLogin) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
          ok: true,
          client: { name: 'Проверка', surname: 'Login Test', intakeYear: 2027, onboardingComplete: true, profile: { onboardingDone: true } },
          roadmap: [{ id: 'start', title: 'Начало маршрута', tasks: [{ id: 'profile', t: 'Проверить профиль', available: true }] }],
          done: {}, docs: {}, progress: { done: 0, total: 1, pct: 0 },
        }) });
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Тестовая ошибка входа' }) });
      }
      if (['127.0.0.1', 'localhost'].includes(url.hostname) || url.protocol === 'data:') return route.continue();
      return route.abort(); // Never call production auth, payment, analytics or other external services.
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    assert.equal((await page.goto('http://127.0.0.1:4178/portal', { waitUntil: 'networkidle' })).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[data-portal-login-art]').evaluate((image) => image.decode());
    assert(await page.locator('[data-portal-login-art]').evaluate((image) => image.naturalWidth >= 640));
    assert.equal(await page.locator('[data-portal-login]').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Overflow at ${width}px`);
    const submit = page.getByRole('button', { name: 'Войти в кабинет', exact: true });
    const surname = page.getByLabel('Фамилия', { exact: true });
    const code = page.getByLabel('Код доступа', { exact: true });
    const buttonBounds = await submit.boundingBox();
    assert(buttonBounds.height >= 44);
    assert.equal(await page.getByRole('link', { name: 'Посмотреть тарифы' }).getAttribute('href'), '/prices');
    await page.screenshot({ path: resolve(output, `login-${width}.png`), fullPage: true, animations: 'disabled' });
    await submit.click();
    await page.getByRole('alert').waitFor();
    assert.match(await page.getByRole('alert').innerText(), /Введи фамилию/);
    assert.equal(auth.length, 0);
    assert(await surname.evaluate((el) => document.activeElement === el));
    await surname.fill('  Login Test  ');
    await surname.press('Enter');
    assert.match(await page.getByRole('alert').innerText(), /Введи код/);
    assert.equal(auth.length, 0);
    await code.fill(' abcd-1234 ');
    await code.press('Enter');
    await page.getByRole('button', { name: 'Проверяю…' }).waitFor();
    assert(await page.getByRole('button', { name: 'Проверяю…' }).isDisabled());
    await page.locator('form[aria-labelledby="portal-login-heading"]').evaluate((form) => form.requestSubmit());
    await page.getByText('Тестовая ошибка входа', { exact: true }).waitFor();
    assert.equal(auth.length, 1, 'Repeated submit must not duplicate requests');
    assert.deepEqual(auth[0], { code: 'ABCD-1234', surname: 'Login Test' });
    assert.equal(await code.inputValue(), ' abcd-1234 ', 'Errors must retain entered values');
    await page.screenshot({ path: resolve(output, `login-error-${width}.png`), fullPage: true, animations: 'disabled' });
    acceptLogin = true;
    await submit.click();
    await page.locator('[data-portal-login]').waitFor({ state: 'detached' });
    assert.equal(auth.length, 2);
    assert.equal(await page.evaluate(() => localStorage.getItem('iitaly_portal_code')), 'ABCD-1234');
    assert.deepEqual(errors, [], 'No runtime or hydration errors');
    results.push({ width, passed: true, checks: 'approved image decoded, no overflow, form validation, Enter, one in-flight request, error recovery, fixture-only successful login' });
    await context.close();
  }
  await writeFile(resolve(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
