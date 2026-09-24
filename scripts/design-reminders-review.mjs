import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'REVIEW_TOOLS is required');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const output = resolve('design-review/reminders');
await mkdir(output, { recursive: true });
const results = [], errors = [];
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.ico':'image/x-icon' };
const root = resolve('out');

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        response.end(await readFile(file)); return;
      }
    }
    response.writeHead(404).end();
  } catch { response.writeHead(500).end(); }
});

await new Promise(done => server.listen(4187, '127.0.0.1', done));
const browser = await chromium.launch();
const origin = 'http://127.0.0.1:4187';
let activePage;

async function settle(page) { await page.evaluate(async () => { await document.fonts.ready; }); }
async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, label);
}

try {
  const source = await readFile('src/components/plan/PlanResult.tsx', 'utf8');
  assert.doesNotMatch(source, /Claude|Anthropic|Клод/i);
  assert.doesNotMatch(source, /docStates|setTimeout|Найдена ошибка:/, 'Free plan must not simulate document verdicts');

  for (const width of [1440, 1280, 1024, 768, 390, 320]) {
    const ctx = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'reduce', locale: 'ru-RU' });
    let linked = false, notify = false, lookupFails = false, linkFails = false;
    const writes = [], linkRequests = [], unexpected = [];
    const safeToken = 'A'.repeat(43);

    await ctx.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());

      if (url.pathname === '/api/portal/lookup') {
        assert.equal(request.method(), 'POST');
        assert.deepEqual(request.postDataJSON(), { code: 'TEST-01', surname: 'Testov' });
        const data = lookupFails ? { ok: false, error: 'Тестовая ошибка соединения' } : {
          ok: true,
          client: {
            name: 'Тестовый профиль',
            surname: 'Testov',
            intakeYear: 2027,
            tgLinked: linked,
            notify: { telegram: notify, email: false },
            onboardingComplete: true,
            profile: {
              education: 'НИШ / 12 лет',
              goal: 'Бакалавриат',
              budget: 'До 3 млн ₸/год',
              onboardingDone: true
            }
          },
          roadmap: [],
          done: {},
          docs: {},
          progress: { done: 0, total: 0, pct: 0 }
        };
        return route.fulfill({ status: lookupFails ? 503 : 200, contentType: 'application/json', body: JSON.stringify(data) });
      }

      if (url.pathname === '/api/portal/TEST-01/telegram-link') {
        linkRequests.push(request.postDataJSON());
        const data = linkFails
          ? { ok: false, error: 'Тестовая ошибка ссылки' }
          : { ok: true, url: 'https://t.me/IitalyReminderTestBot?start=' + safeToken, expiresAt: '2026-09-19T12:30:00Z' };
        return route.fulfill({ status: linkFails ? 503 : 200, contentType: 'application/json', body: JSON.stringify(data) });
      }

      if (url.pathname === '/api/portal/TEST-01/notify') {
        writes.push(request.postDataJSON());
        linked = false; notify = false;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, tgLinked: false, notify: { telegram: false } }) });
      }

      if (url.pathname === '/api/event') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      if (['127.0.0.1', 'localhost'].includes(url.hostname) || request.url().startsWith('data:')) return route.continue();
      unexpected.push(url.origin + url.pathname);
      return route.abort();
    });

    const page = await ctx.newPage(); activePage = page;
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(origin + '/plan', { waitUntil: 'networkidle' });
    const choices = ['11 классов', '4,7 и выше', 'Бакалавриат', 'Без стипендии будет сложно', 'Экономика, бизнес', 'Есть IELTS или TOEFL'];
    for (const choice of choices) await page.getByRole('button').filter({ hasText: choice }).click();
    await page.getByRole('button', { name: 'Пропустить и посмотреть план', exact: true }).click();
    await page.getByRole('heading', { name: 'Напоминания на телефоне', exact: true }).waitFor();
    await settle(page);

    const mainText = await page.locator('#main').innerText();
    assert.doesNotMatch(mainText, /Claude|Anthropic|Клод/i);
    assert.match(mainText, /План собран по твоим ответам/);
    assert.match(mainText, /Это чек-лист, а не результат проверки файла/);

    const settings = page.getByRole('link', { name: 'Настроить напоминания', exact: true });
    assert.equal(await settings.getAttribute('href'), '/portal?view=help');
    await noOverflow(page, 'plan result ' + width);
    if ([1440, 390].includes(width)) {
      await page.locator('section[aria-labelledby="plan-reminders-heading"]').screenshot({ path: resolve(output, 'plan-reminders-' + width + '.png') });
    }

    await settings.click();
    await page.waitForURL('**/portal?view=help');
    await page.getByRole('heading', { name: 'Продолжить маршрут', exact: true }).waitFor();
    assert.equal(await page.locator('#notifications').count(), 0, 'No anonymous subscription');

    await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
    await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
    await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();

    const panel = page.locator('#notifications');
    await panel.waitFor();
    assert.equal(await panel.getAttribute('data-telegram-status'), 'disconnected');
    assert.match(await panel.innerText(), /Подключение занимает около минуты/);
    assert.doesNotMatch(await panel.innerText(), /Почта|email|SMS/i);
    assert.equal(writes.length, 0, 'Viewing settings must not opt users in');
    assert.equal(await panel.getByRole('button', { name: /провер/i }).count(), 0, 'No connection check before a handoff URL exists');

    await panel.getByRole('button', { name: 'Подключить Telegram', exact: true }).click();
    const open = panel.getByRole('link', { name: 'Открыть Telegram', exact: true });
    await open.waitFor();
    assert.equal(await open.getAttribute('href'), 'https://t.me/IitalyReminderTestBot?start=' + safeToken);
    assert(!String(await open.getAttribute('href')).includes('TEST-01'), 'Access code must not enter Telegram URL');
    assert.equal(await open.getAttribute('rel'), 'noopener noreferrer');
    assert.equal(await open.getAttribute('referrerpolicy'), 'no-referrer');
    assert.deepEqual(linkRequests, [{ surname: 'Testov' }]);

    const confirm = panel.getByRole('button', { name: 'Я запустил бота', exact: true });
    await confirm.click();
    await panel.getByRole('alert').filter({ hasText: 'Подключение пока не подтверждено' }).waitFor();

    linked = true; notify = true;
    await confirm.click();
    await page.locator('#notifications[data-telegram-status="connected"]').waitFor();
    await panel.getByRole('alert').filter({ hasText: 'Telegram подключён' }).waitFor();

    await panel.getByRole('button', { name: 'Отключить', exact: true }).click();
    await page.locator('#notifications[data-telegram-status="disconnected"]').waitFor();
    assert.deepEqual(writes, [{ surname: 'Testov', notifyTelegram: false }]);

    await panel.getByRole('button', { name: 'Подключить Telegram', exact: true }).click();
    lookupFails = true;
    await panel.getByRole('button', { name: 'Я запустил бота', exact: true }).click();
    await panel.getByRole('alert').filter({ hasText: 'Тестовая ошибка соединения' }).waitFor();
    lookupFails = false;

    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#notifications[data-telegram-status="disconnected"]').waitFor();
    linkFails = true;
    await panel.getByRole('button', { name: 'Подключить Telegram', exact: true }).click();
    await panel.getByRole('alert').filter({ hasText: 'Тестовая ошибка ссылки' }).waitFor();

    await noOverflow(page, 'settings ' + width);
    if ([1440, 390].includes(width)) await panel.screenshot({ path: resolve(output, 'telegram-settings-' + width + '.png') });

    assert.deepEqual(unexpected, [], 'No unmocked external requests');
    results.push({ test: width + 'px: honest plan, addressable reminder view, gated connect/confirm/disable/error states', passed: true });
    await ctx.close();
  }

  assert.deepEqual(errors, []);
} catch (error) {
  errors.push(error.stack || error.message);
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors, scope: 'UI and API fixtures only; real Telegram delivery and backend scheduler are not tested or changed.' }, null, 2));
  await browser.close();
  await new Promise(done => server.close(done));
}
console.log(JSON.stringify(results, null, 2));
