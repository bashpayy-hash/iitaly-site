import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS || '/tmp/iitaly-audit-tools/node_modules', 'playwright'));
const root = resolve('out');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = process.env.REVIEW_ORIGIN ? null : createServer(async (request, response) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return response.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        return response.end(await readFile(file));
      }
    }
    response.writeHead(404).end();
  } catch { response.writeHead(500).end(); }
});
if (server) await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = process.env.REVIEW_ORIGIN || `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const events = [], requests = [], chatRequests = [], pageErrors = [];
    let acceptLead = false, chatMode = 'offline', heldChat;
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      if (url.pathname === '/api/event') {
        events.push(request.postDataJSON());
        return route.fulfill({ status: 200, json: { ok: true } });
      }
      if (url.pathname === '/health/ai') return route.fulfill({ status: 200, json: { ok: true, code: 'AI_READY' } });
      if (url.pathname === '/api/lead') {
        requests.push(request.postDataJSON());
        return route.fulfill({ status: acceptLead ? 200 : 503, json: { ok: acceptLead } });
      }
      if (url.pathname === '/api/chat') {
        chatRequests.push(request.postDataJSON());
        if (chatMode === 'timeout') { heldChat = route; return; }
        return chatMode === 'success' ? route.fulfill({ status: 200, json: { reply: 'Тестовый ответ без внешнего запроса.' } }) : route.abort();
      }
      // All other external traffic, including messages/payments, is blocked.
      return url.origin === origin ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    await page.clock.install();
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(origin + '/', { waitUntil: 'networkidle' });
    const launcher = page.getByRole('button', { name: 'Открыть ИИ-помощника', exact: true });
    await launcher.focus();
    await page.keyboard.press('Enter');
    const question = page.getByRole('textbox', { name: 'Вопрос ИИ-консультанту' });
    await page.waitForFunction(() => document.activeElement?.id === 'chat-input');
    assert(await page.getByRole('button', { name: 'Отправить', exact: true }).isDisabled());
    await page.keyboard.press('Escape');
    await page.getByRole('dialog', { name: 'ИИ-консультант' }).waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.activeElement?.id === 'chat-launcher');
    if (width < 800) {
      const menu = page.locator('header summary');
      await menu.click();
      await page.getByRole('button', { name: 'Задать вопрос', exact: true }).click();
      await page.waitForFunction(() => document.activeElement?.id === 'chat-input');
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.activeElement?.tagName === 'SUMMARY');
      assert.equal(await menu.evaluate(el => el.parentElement.open), false);
    }
    await launcher.click();
    await question.fill('Тестовый вопрос для повторной отправки');
    await question.press('Enter');
    await page.getByText('Не удалось получить ответ. Вопрос не списан — попробуй отправить его ещё раз.', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_asked')), null);
    assert.equal(await question.inputValue(), 'Тестовый вопрос для повторной отправки');
    chatMode = 'success';
    await question.press('Enter');
    await page.getByText('Тестовый ответ без внешнего запроса.', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_asked')), '1');
    assert.equal(chatRequests.length, 2);
    assert.equal(chatRequests[1].messages.length, 1, 'Retry does not duplicate a failed question in model history');

    chatMode = 'timeout';
    await question.fill('Тестовый вопрос с зависшим соединением');
    await Promise.all([page.waitForRequest('**/api/chat'), question.press('Enter')]);
    await page.clock.fastForward(90001);
    await page.waitForFunction(() => document.getElementById('chat-input')?.value === 'Тестовый вопрос с зависшим соединением');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_asked')), '1');
    assert.equal(await page.getByRole('button', { name: 'Отправить', exact: true }).isEnabled(), true);
    await heldChat?.abort().catch(() => {});
    chatMode = 'success';
    await question.press('Enter');
    await page.waitForFunction(() => sessionStorage.getItem('iitaly_asked') === '2');
    assert.equal(chatRequests.length, 4);
    assert.equal(chatRequests[3].messages.length, 3, 'Timeout retry includes only the previous successful exchange');
    await page.evaluate(() => sessionStorage.setItem('iitaly_asked', '10'));
    await question.fill('Тестовый вопрос без отправки в ИИ');
    await question.press('Enter');
    const phone = page.getByRole('textbox', { name: 'Номер телефона для WhatsApp' });
    await phone.fill('----------');
    await page.getByRole('button', { name: 'Отправить номер', exact: true }).click();
    await page.getByText('Проверь номер телефона.', { exact: true }).waitFor();
    assert.equal(requests.length, 0);
    await phone.fill('+7 777 000 00 00');
    await page.getByRole('button', { name: 'Отправить номер', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Не удалось отправить номер' }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_lead')), null);
    assert.equal(events.filter(e => e.event === 'lead_captured').length, 0);
    assert.equal(await page.getByText('Записали', { exact: true }).count(), 0);
    assert.equal(await phone.inputValue(), '+7 777 000 00 00');
    acceptLead = true;
    await page.getByRole('button', { name: 'Отправить номер', exact: true }).click();
    await page.getByText('Записали', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_lead')), '1');
    assert.equal(requests.length, 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.getByRole('button', { name: 'Закрыть чат' }).click();

    // A failed optional contact submission must not prevent the free plan.
    acceptLead = false;
    await page.goto(origin + '/plan', { waitUntil: 'networkidle' });
    const wizard = page.locator('[data-plan-wizard]');
    for (let step = 0; step < 20; step += 1) {
      const options = wizard.locator('button[aria-pressed]');
      if (!await options.count()) break;
      await options.first().click();
    }
    await wizard.getByText('Оставить номер для связи', { exact: true }).click();
    await wizard.getByRole('textbox', { name: 'Номер телефона для WhatsApp' }).fill('+7 777 000 00 00');
    await wizard.getByRole('button', { name: 'Отправить номер', exact: true }).click();
    await wizard.getByRole('alert').filter({ hasText: 'Не удалось отправить номер' }).waitFor();
    assert.equal(events.filter(e => e.event === 'lead_submitted' || (e.event === 'lead_captured' && e.props?.from === 'wizard')).length, 0);
    await wizard.getByRole('button', { name: 'Открыть мой план', exact: true }).click();
    await wizard.waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('iitaly_plan_draft_v1')).complete), true);
    assert.deepEqual(pageErrors, []);
    results.push({ width, keyboardAndFocus: true, failedQuestionRetry: true, timeoutRetry: true, failedLeadRetry: true, noFalseLeadSuccess: true, freePlanAfterFailure: true });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  if (server) await new Promise(done => server.close(done));
}
