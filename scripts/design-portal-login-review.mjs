import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { loadLoginArtwork } from './portal-login-art-fixtures.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS || '/tmp/iitaly-browser/node_modules', 'playwright'));
const root = resolve('out');
const output = resolve('design-review/portal-login');
await mkdir(output, { recursive: true });
const imageBytes = await loadLoginArtwork();
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
let activePage;
try {
  for (const width of [1440, 1024, 768, 390, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, locale: 'ru-RU', reducedMotion: 'reduce' });
    const errors = [];
    const auth = [];
    const recovery = [];
    // 360 px plays an older server without the route: the form must fall back to WhatsApp.
    const recoveryRoute = width !== 360;
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
      if (url.pathname === '/api/portal/recover') {
        assert.equal(route.request().method(), 'POST');
        recovery.push(route.request().postDataJSON());
        await new Promise((done) => setTimeout(done, 150));
        if (!recoveryRoute) return route.fulfill({ status: 404, contentType: 'text/html', body: '<!DOCTYPE html><pre>Cannot POST /api/portal/recover</pre>' });
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      }
      if (['127.0.0.1', 'localhost'].includes(url.hostname) || url.protocol === 'data:') return route.continue();
      return route.abort(); // Never call production auth, payment, analytics or other external services.
    });
    const page = await context.newPage();
    activePage = page;
    page.on('pageerror', (error) => errors.push(error.message));
    assert.equal((await page.goto('http://127.0.0.1:4178/portal?view=login', { waitUntil: 'networkidle' })).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[data-portal-login-art]').evaluate((image) => image.decode());
    // With w-descriptors naturalWidth is density-corrected, so check the chosen file instead.
    const art = await page.locator('[data-portal-login-art]').evaluate((image) => ({ loaded: image.complete && image.naturalWidth > 0, file: new URL(image.currentSrc).pathname }));
    assert(art.loaded, 'Login artwork decoded');
    assert.match(art.file, width <= 760 ? /\/campus-arrival-480\.webp$/ : /\/campus-arrival-(960|1168)\.webp$/);
    // The login sits on the site: the shared header and its navigation are present.
    assert.equal(await page.getByRole('link', { name: 'IITALY — главная', exact: true }).count(), 1);
    assert.equal(await page.locator('header nav[aria-label="Основная навигация"] a[href="/universities"]').count(), 1);
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('[data-portal-login]').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Overflow at ${width}px`);
    const form = page.locator('form[aria-labelledby="portal-login-heading"]');
    const alert = form.getByRole('alert'); // Do not match Next.js' route announcer.
    const submit = form.getByRole('button', { name: 'Войти в кабинет', exact: true });
    const surname = form.getByLabel('Фамилия', { exact: true });
    const code = form.getByLabel('Код доступа', { exact: true });
    const buttonBounds = await submit.boundingBox();
    assert(buttonBounds.height >= 44);
    assert.equal(await form.getByRole('link', { name: 'Посмотреть цену' }).getAttribute('href'), '/prices');
    await page.screenshot({ path: resolve(output, `login-${width}.png`), fullPage: true, animations: 'disabled' });
    await submit.click();
    await alert.waitFor();
    assert.match(await alert.innerText(), /Введи фамилию/);
    assert.equal(auth.length, 0);
    assert(await surname.evaluate((el) => document.activeElement === el));
    await surname.fill('  Login Test  ');
    await surname.press('Enter');
    assert.match(await alert.innerText(), /Введи код/);
    assert.equal(auth.length, 0);
    await code.fill(' abcd-1234 ');
    await code.press('Enter');
    await form.getByRole('button', { name: 'Проверяю…' }).waitFor();
    assert(await form.getByRole('button', { name: 'Проверяю…' }).isDisabled());
    await form.evaluate((element) => element.requestSubmit());
    await form.getByText('Тестовая ошибка входа', { exact: true }).waitFor();
    assert.equal(auth.length, 1, 'Repeated submit must not duplicate requests');
    assert.deepEqual(auth[0], { code: 'ABCD-1234', surname: 'Login Test' });
    assert.equal(await code.inputValue(), ' abcd-1234 ', 'Errors must retain entered values');
    await page.screenshot({ path: resolve(output, `login-error-${width}.png`), fullPage: true, animations: 'disabled' });

    // «Не помню код» (owner, 20 Nov): the card turns into a recovery form. The
    // code never reaches the browser; WhatsApp stays as the fallback.
    assert.equal(await form.getByRole('link', { name: /WhatsApp/ }).count(), 0, 'The login card no longer sends people to WhatsApp first');
    await form.getByRole('button', { name: 'восстановить', exact: true }).click();
    const recoverForm = page.locator('form[aria-labelledby="portal-recover-heading"]');
    await recoverForm.waitFor();
    assert(await page.locator('#portal-recover-heading').evaluate((el) => document.activeElement === el), 'Focus moves to the recovery heading');
    const recoverSurname = recoverForm.getByLabel('Фамилия', { exact: true });
    const recoverPhone = recoverForm.getByLabel('Телефон', { exact: true });
    assert.equal(await recoverSurname.inputValue(), '  Login Test  ', 'The surname carries over from the login card');
    assert.equal(await recoverPhone.getAttribute('type'), 'tel');
    const send = recoverForm.getByRole('button', { name: 'Прислать код', exact: true });
    assert((await send.boundingBox()).height >= 44);
    await send.click();
    assert.match(await recoverForm.getByRole('alert').innerText(), /телефон/);
    assert.equal(recovery.length, 0, 'An empty phone never reaches the server');
    assert(await recoverPhone.evaluate((el) => document.activeElement === el));
    await recoverPhone.fill('+7 700 000 00 01');
    await recoverPhone.press('Enter');
    const status = recoverForm.locator('[data-portal-recover-status]');
    await status.waitFor();
    assert.deepEqual(recovery, [{ surname: 'Login Test', phone: '+7 700 000 00 01' }]);
    assert.equal(await status.getAttribute('data-portal-recover-status'), recoveryRoute ? 'sent' : 'manual');
    assert.equal(await status.getAttribute('role'), 'status');
    assert(await status.evaluate((el) => document.activeElement === el), 'Focus moves to the result');
    assert.doesNotMatch(await status.innerText(), /ABCD|Код:/, 'The page never shows a code');
    const whatsapp = status.getByRole('link', { name: 'Написать в WhatsApp', exact: true });
    const waHref = decodeURIComponent(await whatsapp.getAttribute('href'));
    assert.match(waHref, /^https:\/\/wa\.me\/\d+\?text=/);
    assert.match(waHref, /Фамилия: Login Test, телефон: \+7 700 000 00 01/);
    assert((await whatsapp.boundingBox()).height >= 44);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Recovery overflow at ${width}px`);
    await page.screenshot({ path: resolve(output, `recover-${width}.png`), fullPage: true, animations: 'disabled' });
    await recoverForm.getByRole('button', { name: 'Ввести код', exact: true }).click();
    await form.waitFor();
    assert(await code.evaluate((el) => document.activeElement === el), 'Back on the login card, focus is on the code');
    assert.equal(await code.inputValue(), ' abcd-1234 ', 'Switching cards keeps what was typed');

    acceptLogin = true;
    await submit.click();
    await page.locator('[data-portal-login]').waitFor({ state: 'detached' });
    assert.equal(auth.length, 2);
    assert.equal(await page.evaluate(() => localStorage.getItem('iitaly_portal_code')), 'ABCD-1234');
    assert.deepEqual(errors, [], 'No runtime or hydration errors');
    results.push({ width, passed: true, checks: `approved image decoded, no overflow, form validation, Enter, one in-flight request, error recovery, code recovery (${recoveryRoute ? 'sent' : 'older server → WhatsApp'}), fixture-only successful login` });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
  await new Promise((done) => server.close(done));
}
