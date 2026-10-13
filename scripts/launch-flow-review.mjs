import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'REVIEW_TOOLS must point to the isolated Playwright installation.');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const root = resolve('out');
const output = resolve('design-review/launch-flows');
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer(async (request, response) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    for (const file of [path, `${path}.html`, resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        response.end(await readFile(file)); return;
      }
    }
    response.writeHead(404).end();
  } catch { response.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const results = [], errors = [];
const fixture = {
  ok: true,
  client: { name: 'Тестовый профиль', surname: 'Testov', intakeYear: 2027, onboardingComplete: true, profile: { onboardingDone: true } },
  roadmap: [{ id: 'documents', title: 'Документы', tasks: [{ id: 'statements', t: 'Банковские выписки', available: true }, { id: 'test-task', t: 'Тестовый шаг', available: true }] }],
  done: {}, docs: {}, progress: { done: 0, total: 2, pct: 0 },
};
const pending = { orderId: 'fixture-order', orderToken: 'fixture-token', product: 'Поступление под ключ', createdAt: '2026-10-13T00:00:00.000Z' };

async function makePage(width, options = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', locale: 'ru-RU' });
  const calls = { checkout: 0, check: 0, save: 0, task: 0, status: 0 };
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    const json = (status, data) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (url.origin === origin || url.protocol === 'data:') return route.continue();
    if (url.pathname === '/api/event') return json(200, { ok: true });
    if (url.pathname === '/health/ai') return json(200, { ok: true, code: 'AI_READY', retryable: true });
    if (url.pathname === '/api/stripe/checkout') {
      calls.checkout += 1;
      assert.deepEqual(request.postDataJSON(), { product: 'Поступление под ключ', name: 'Demo', surname: 'Testov', phone: '+7 700 000 00 00' });
      // Deliberately leave the fixture request pending to verify the client timeout.
      return;
    }
    if (url.pathname === '/api/order/status') {
      calls.status += 1;
      assert.deepEqual(request.postDataJSON(), { orderId: pending.orderId, orderToken: pending.orderToken });
      return json(200, { ok: true, status: 'pending', fulfillment: 'portal' });
    }
    if (url.pathname === '/api/portal/lookup') {
      assert.deepEqual(request.postDataJSON(), { code: 'TEST-01', surname: 'Testov' });
      return json(200, fixture);
    }
    if (url.pathname === '/api/check-document') {
      calls.check += 1;
      if (calls.check === 1 && options.failCheck) return json(503, { ok: false, error: 'Тест: проверка временно недоступна.', retryable: true });
      return json(200, { ok: true, result: { verdict: 'ok', summary: 'Тестовый результат: видимых ошибок нет.' } });
    }
    if (url.pathname === '/api/portal/TEST-01/doc') {
      calls.save += 1;
      if (calls.save === 1 && options.failSave) return json(503, { ok: false, error: 'Тест: соединение прервалось.' });
      const saved = route.request().postDataJSON();
      assert.deepEqual(saved.result, { verdict: 'ok', summary: 'Тестовый результат: видимых ошибок нет.' });
      return json(200, { ok: true, docs: { statements: { verdict: 'ok', summary: saved.result.summary, result: saved.result, fileName: saved.fileName, checkedAt: '2026-10-13T12:00:00.000Z' } }, done: { statements: true }, progress: { done: 1, total: 2, pct: 50 } });
    }
    if (url.pathname === '/api/portal/TEST-01/task') {
      calls.task += 1;
      if (calls.task === 1) return json(503, { ok: false, error: 'Тест: отметка не сохранена.' });
      return json(200, { ok: true, done: { statements: true, 'test-task': true }, progress: { done: 2, total: 2, pct: 100 } });
    }
    return route.abort(); // No production payment, login, document, analytics or lead requests.
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  return { context, page, calls };
}

try {
  for (const width of [390, 1440]) {
    const { context, page, calls } = await makePage(width);
    await page.goto(`${origin}/prices`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Оформить и оплатить', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Имя', { exact: true }).fill('Demo');
    await dialog.getByLabel('Фамилия', { exact: true }).fill('Testov');
    await dialog.getByLabel('Телефон', { exact: true }).fill('+7 700 000 00 00');
    assert.equal(await dialog.getByRole('button', { name: 'Перейти к оплате', exact: true }).count(), 1, 'Build must set NEXT_PUBLIC_STRIPE_ENABLED=true and NEXT_PUBLIC_BACKEND_URL; all API requests are intercepted.');
    await page.clock.install();
    await Promise.all([
      page.waitForRequest(request => new URL(request.url()).pathname === '/api/stripe/checkout'),
      dialog.getByRole('button', { name: 'Перейти к оплате', exact: true }).click(),
    ]);
    await dialog.getByText('Открываю Stripe…', { exact: true }).waitFor();
    await page.clock.fastForward(20_001);
    await dialog.getByRole('alert').filter({ hasText: 'Не удалось открыть оплату вовремя' }).waitFor();
    assert.equal(await dialog.getByLabel('Имя', { exact: true }).inputValue(), 'Demo');
    assert.equal(await dialog.getByLabel('Телефон', { exact: true }).inputValue(), '+7 700 000 00 00');
    assert.equal(calls.checkout, 1);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    results.push({ test: `${width}px: checkout timeout preserves fields and releases the dialog`, passed: true });
    await context.close();
  }

  {
    const { context, page, calls } = await makePage(320);
    await page.goto(`${origin}/payment/success`, { waitUntil: 'networkidle' });
    await page.getByText('В этой вкладке нет данных платёжной сессии.', { exact: false }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Вернуться к оплате', exact: true }).count(), 0);
    assert.match(await page.getByRole('link', { name: 'Написать в поддержку' }).getAttribute('href'), /^https:\/\/wa\.me\//);
    assert.equal(calls.status, 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.screenshot({ path: resolve(output, 'payment-recovery-320.png'), fullPage: true });
    await page.evaluate(value => sessionStorage.setItem('iitaly_pending_payment', JSON.stringify(value)), pending);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText('Ждём подтверждение платежа от Stripe.', { exact: false }).waitFor();
    assert.doesNotMatch(await page.locator('main').innerText(), /Оплата прошла|Оплата подтверждена|webhook/);
    results.push({ test: 'Missing and pending payment states do not assert success or promote a repeat payment', passed: true });
    await context.close();
  }

  {
    const { context, page, calls } = await makePage(390, { failCheck: true, failSave: true });
    await page.goto(`${origin}/portal?view=docs`, { waitUntil: 'networkidle' });
    await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
    await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
    await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
    await page.locator('[data-document-group=missing][open]').waitFor();
    const input = page.locator('input[type=file]');
    assert.equal(await page.locator('button').count(), 0, 'Document list has no buttons');
    await page.locator('[data-document=statements]').click();
    await page.locator('[data-step-detail=statements]').waitFor();
    assert.equal(await page.locator('button').count(), 1);
    await page.getByRole('button', { name: 'Выбрать файл', exact: true }).click();
    await input.setInputFiles({ name: 'unsupported.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('synthetic fixture') });
    await page.getByRole('link', { name: 'Выбрать другой файл', exact: true }).waitFor();
    assert.equal(calls.check, 0);
    await page.getByRole('link', { name: 'Выбрать другой файл', exact: true }).click();
    await input.setInputFiles({ name: 'fixture.txt', mimeType: 'text/plain', buffer: Buffer.from('SYNTHETIC TEST DOCUMENT. No personal data. Bank balance is 0 KZT on 31 December 2025.') });
    await page.getByRole('alert').filter({ hasText: 'Тест: проверка временно недоступна.' }).waitFor();
    await page.getByRole('link', { name: 'Проверить файл ещё раз', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'проверка завершена, но результат не сохранён' }).waitFor();
    assert.equal(calls.check, 2);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    });
    assert.equal(await page.locator('#chat-launcher').count(), 0, 'Portal helper lives only in its header');
    assert((await page.locator('button').count()) <= 1, 'Recovery does not add a second button');
    await page.screenshot({ path: resolve(output, 'portal-save-recovery-390.png'), fullPage: true });
    await page.getByRole('link', { name: 'Сохранить результат', exact: true }).click();
    const report = page.getByRole('region', { name: 'Разбор документа', exact: true });
    await report.waitFor();
    await report.getByRole('heading', { name: 'Проверка пройдена', exact: true }).waitFor();
    assert.match(await report.innerText(), /Тестовый результат: видимых ошибок нет\./);
    await report.getByRole('link', { name: '← К списку документов', exact: true }).click();
    await page.locator('[data-document-group=approved]').waitFor();
    const passedGroup = page.locator('[data-document-group=approved]');
    if (!(await passedGroup.evaluate(element => element.open))) await passedGroup.locator('summary').click();
    assert.match(await passedGroup.locator('summary').innerText(), /Проверка пройдена/);
    assert.equal(calls.check, 2, 'Retrying storage must not run another AI check');
    assert.equal(calls.save, 2);
    await page.getByRole('link', { name: 'План', exact: true }).filter({ visible: true }).first().click();
    assert.equal(calls.task, 0, 'File check and upload close the document step without a separate self-report');
    assert.equal(await page.locator('button').count(), 0);
    await page.locator('[data-portal-task="test-task"]').click();
    const detail = page.locator('[data-step-detail="test-task"]');
    await detail.waitFor();
    assert.equal(await page.locator('button').count(), 1);
    await detail.getByRole('button', { name: 'Готово', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Тест: отметка не сохранена.' }).waitFor();
    await page.getByRole('link', { name: 'Сохранить отметку ещё раз', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Тест: отметка не сохранена.' }).waitFor({ state: 'hidden' });
    await page.getByRole('link', { name: 'План', exact: true }).filter({ visible: true }).first().click();
    await page.locator('[data-portal-task="test-task"][data-done=true]').waitFor({ state: 'attached' });
    assert.equal(calls.task, 2);
    results.push({ test: 'Portal exposes file, check, storage and task errors with precise recovery; saved result retry does not recheck', passed: true });
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
