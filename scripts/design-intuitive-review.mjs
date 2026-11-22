import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

// Nothing a visitor gave the site is lost by one stray tap, and the way on is
// one obvious control. Owner, 21 Nov, about the phone flows: «чтобы юзеру было
// максимально интуитивно без потери данных». Before this pass «Начать заново»
// erased ten answers at once, «Изменить ответы» hid the plan behind ten taps,
// a tap beside the purchase sheet wiped the typed fields, and on a 320px phone
// a few controls lay over or outside their neighbours (DESIGN_GUIDE.md §8).
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out');
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
const KEY = 'iitaly_plan_draft_v1';

try {
  for (const width of [1440, 390, 320]) {
    const phone = width < 600;
    const context = await browser.newContext({ viewport: { width, height: width === 320 ? 640 : phone ? 844 : 900 }, hasTouch: phone, isMobile: phone, reducedMotion: 'reduce', locale: 'ru-RU' });
    // The service that checks documents does not answer here: /check shows its
    // «пока недоступна» state, which is one of the states under review.
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const visit = async path => { await page.goto(origin + path, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready); };
    const draft = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);
    const tall = locator => locator.evaluate(el => el.getBoundingClientRect().height);
    const overflows = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);

    // 1. The questionnaire. An answered question can be passed with «Дальше»:
    //    after «Назад» the only way forward was to tap the same answer again.
    await visit('/plan');
    const wizard = page.locator('[data-plan-wizard]');
    const question = () => page.locator('[data-plan-question]').getAttribute('data-plan-question');
    const answer = async () => { const id = await question(); await wizard.locator('button[aria-pressed]').first().click(); await page.waitForFunction(previous => document.querySelector('[data-plan-question]')?.getAttribute('data-plan-question') !== previous, id); };
    assert.equal(await page.locator('[data-plan-next]').count(), 0, 'An unanswered question has no «Дальше»');
    await answer();
    await page.getByRole('button', { name: 'Назад', exact: true }).click();
    const next = page.locator('[data-plan-next]');
    await next.waitFor();
    assert(await tall(next) >= 44, `«Дальше» is a full-size target at ${width}`);
    await next.click();
    assert.equal(await question(), 'education', '«Дальше» goes to the next question');
    assert.equal((await draft()).answers.intake, '2027/28', '…and keeps the answer');
    for (let index = 1; index < 10; index++) await answer();
    // The first step's title in the hand-off never breaks after a hyphen («12-/й год»).
    const title = await wizard.locator('[data-plan-preview-title]').textContent();
    assert.doesNotMatch(title, /\d-\p{L}/u, `The step title keeps «12‑й» together (${title})`);
    await page.getByRole('button', { name: 'Открыть мой план', exact: true }).click();
    await page.getByRole('heading', { name: 'Твой маршрут' }).waitFor();

    // 2. «Изменить ответы» shows the ten answers and keeps the plan.
    await page.getByRole('button', { name: 'Изменить ответы', exact: true }).click();
    const answers = page.locator('[data-plan-answers]');
    await answers.waitFor();
    assert.equal(await answers.locator('[data-plan-answer]').count(), 10, 'Ten answers in one list');
    assert.equal((await draft()).complete, true, 'Looking at the answers does not take the plan apart');
    assert((await answers.locator('[data-plan-answer]').evaluateAll(rows => rows.map(row => row.getBoundingClientRect().height))).every(height => height >= 44), 'Each answer is a full-size target');
    const back = page.locator('[data-plan-answers-back]');
    await page.waitForFunction(() => { const box = document.querySelector('[data-plan-answers-back]').getBoundingClientRect(); return box.top >= 0 && box.bottom <= innerHeight; });
    assert(await tall(back) >= 44, 'The way back to the plan is on the first screen of the list');
    assert.equal(await overflows(), false, `The list of answers fits ${width}px`);
    // One answer opens, changes and returns to the list with focus on its row.
    await answers.locator('[data-plan-answer=education]').click();
    const edit = page.locator('[data-plan-answer-edit=education]');
    await edit.waitFor();
    assert.equal(await edit.locator('button[aria-pressed=true]').count(), 1, 'The opened question shows the given answer');
    await edit.locator('button[aria-pressed=false]').first().click();
    await answers.waitFor();
    const changed = await draft();
    assert.notEqual(changed.answers.education, '11 классов', 'The new answer is saved');
    assert.equal(changed.complete && Object.keys(changed.answers).length === 10, true, 'The plan stays complete with all ten answers');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-plan-answer')), 'education', 'Focus returns to the changed row');
    // A reload in the middle lands on the plan built from the new answers.
    await page.reload(); await page.getByRole('heading', { name: 'Твой маршрут' }).waitFor();
    await page.getByRole('button', { name: 'Изменить ответы', exact: true }).click();
    await answers.waitFor();

    // 3. «Начать заново» asks first; the safe answer has the focus.
    const footer = page.locator('[data-plan-footer]');
    await footer.getByRole('button', { name: 'Начать заново', exact: true }).click();
    const confirm = page.locator('[data-plan-restart-confirm]');
    await confirm.waitFor();
    assert.equal(Object.keys((await draft()).answers).length, 10, 'One tap on «Начать заново» erases nothing');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Оставить', 'The safe answer is focused');
    assert((await confirm.locator('button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().height))).every(height => height >= 44), 'Both answers are full-size targets');
    assert.equal(await overflows(), false, `The question fits ${width}px`);
    await confirm.getByRole('button', { name: 'Оставить', exact: true }).click();
    assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Начать заново', 'Focus returns to the button');
    assert.equal(Object.keys((await draft()).answers).length, 10, '«Оставить» keeps every answer');
    await page.locator('[data-plan-answers-done]').click();
    await page.getByRole('heading', { name: 'Твой маршрут' }).waitFor();
    await page.getByRole('button', { name: 'Изменить ответы', exact: true }).click();
    await footer.getByRole('button', { name: 'Начать заново', exact: true }).click();
    await confirm.getByRole('button', { name: 'Стереть', exact: true }).click();
    await wizard.waitFor();
    assert.deepEqual((await draft()).answers, {}, '«Стереть» starts the questionnaire again');
    assert.equal(await question(), 'intake');

    // 4. The purchase sheet keeps what was typed when it is closed by mistake.
    await visit('/prices');
    await page.locator('[data-pricing-buy=hero]').click();
    const sheet = page.getByRole('dialog');
    await sheet.getByLabel('Имя', { exact: true }).fill('Алия');
    await sheet.getByLabel('Телефон', { exact: true }).fill('+7 700 000 00 00');
    await sheet.getByLabel('Почта (по желанию)', { exact: true }).fill('aliya@example.com');
    await page.keyboard.press('Escape');
    await sheet.waitFor({ state: 'hidden' });
    assert.doesNotMatch(await page.evaluate(() => JSON.stringify([{ ...localStorage }, { ...sessionStorage }])), /Алия|aliya@|700 000/, 'The typed contact is kept in memory only, never in storage');
    await page.locator('[data-pricing-buy=hero]').click();
    assert.equal(await sheet.getByLabel('Имя', { exact: true }).inputValue(), 'Алия', 'The name survives a closed sheet');
    assert.equal(await sheet.getByLabel('Телефон', { exact: true }).inputValue(), '+7 700 000 00 00', 'The phone survives');
    assert.equal(await sheet.getByLabel('Почта (по желанию)', { exact: true }).inputValue(), 'aliya@example.com', 'The e-mail survives');
    await page.keyboard.press('Escape');
    await sheet.waitFor({ state: 'hidden' });

    // 5. /prices on the narrowest phone: «Спросить Веспи» does not lie over the
    //    links under the price.
    if (width === 320) {
      await visit('/prices');
      await page.waitForFunction(() => document.querySelector('#chat-launcher'));
      const covered = await page.evaluate(async () => {
        await new Promise(done => setTimeout(done, 400));
        const fab = document.querySelector('#chat-launcher'), box = fab.getBoundingClientRect(), away = fab.getAttribute('aria-hidden') === 'true';
        return [...document.querySelectorAll('nav[aria-label="На странице цен"] a')].filter(link => { const b = link.getBoundingClientRect(); return !away && b.left < box.right && b.right > box.left && b.top < box.bottom && b.bottom > box.top; }).map(link => link.textContent);
      });
      assert.deepEqual(covered, [], '/prices at 320: the chat button covers no link under the price');
    }

    // 6. /check. «Перетащи сюда» is for a mouse; the example opens in view; the
    //    unavailable state names the payment once.
    await visit('/check');
    const check = page.locator('#document-check');
    await check.getByText('Проверка документов пока недоступна', { exact: true }).waitFor();
    assert.equal(await check.getByText('или перетащи сюда').isVisible(), !phone, `/check at ${width}: the drag hint is shown only where a file can be dragged`);
    assert.equal((await check.innerText()).split('не связано с оплатой').length - 1, 1, '/check: «не связано с оплатой» is said once');
    await check.getByRole('button', { name: /Проверить пример/ }).click();
    const example = check.locator('[data-document-example]');
    await example.waitFor();
    await page.waitForFunction(() => { const box = document.querySelector('[data-document-example]').getBoundingClientRect(); return box.top < innerHeight - 80 && box.bottom > 80; });
    assert.equal(await example.isVisible(), true, '/check: the example opens where it can be seen');

    // 7. The cabinet's sign-in: the ways out are full-size targets that do not
    //    overlap each other.
    await visit('/portal?auth=login');
    const recover = page.locator('[data-portal-recover-open]');
    await recover.waitFor();
    const prices = page.locator('form a[href="/prices"]');
    const boxes = await Promise.all([recover, prices].map(target => target.boundingBox()));
    assert(boxes.every(box => box.height >= 44), `Sign-in at ${width}: «восстановить» and «Посмотреть цену» are 44px targets (${boxes.map(box => Math.round(box.height))})`);
    assert(boxes[0].y + boxes[0].height <= boxes[1].y + .5, 'Sign-in: the two targets do not overlap');
    await recover.click();
    const code = page.locator('[data-portal-recover-back]');
    await code.waitFor();
    assert((await code.boundingBox()).height >= 44, 'Recovery: «Ввести код» is a 44px target');
    assert.equal(await overflows(), false, `Sign-in fits ${width}px`);

    // 8. The guides road on the narrowest phone: a station's status stays inside
    //    the road's tile.
    if (phone) for (const path of ['/guides', '/guides/stages/prepare']) {
      await visit(path);
      const out = await page.locator('[data-road-status]').evaluateAll(statuses => statuses.flatMap(status => {
        const unit = status.closest('[data-road-unit]').getBoundingClientRect();
        return [...status.children].filter(part => { const box = part.getBoundingClientRect(); return box.width > 0 && (box.left < unit.left - 1 || box.right > unit.right + 1); }).map(part => part.textContent);
      }));
      assert.deepEqual(out, [], `${path} at ${width}: every station status stays inside its tile`);
    }

    assert.deepEqual(errors, [], `No page errors at ${width}`);
    results.push({ width, passed: true });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  server.close();
}
