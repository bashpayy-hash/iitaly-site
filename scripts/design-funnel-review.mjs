import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

// One story from the first screen to the purchase. Owner, 22 Nov, after the
// list of what the intuitiveness pass had left for his decision: «сделай все
// так, чтобы все было последовательным и воронка была максимально эффективной
// сразу». Before this pass the plan's result opened with a price instead of
// the promised free step, a free guide showed two offers before its first
// line, the purchase had three names and the route three sizes (11 on the
// plan, 28 on the price page), and «Возврат 7 дней» stood without its
// condition. DESIGN_GUIDE.md §4 holds the rules; this review holds them.
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
const BUY = 'Открыть маршрут за 10 990 ₸';
const flat = text => text.replace(/\s+/g, ' ').trim();

try {
  for (const width of [1440, 390]) {
    const phone = width < 600;
    const context = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, hasTouch: phone, isMobile: phone, reducedMotion: 'reduce', locale: 'ru-RU' });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const visit = async path => { await page.goto(origin + path, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready); };
    const labels = new Map();
    const collect = async place => { for (const text of await page.locator('[data-wall-buy], [data-pricing-buy]').filter({ visible: true }).allInnerTexts()) labels.set(`${place}: ${flat(text)}`, flat(text)); };

    // 1. /prices before any plan exists on the device: the route's size is the
    //    range the plan builder gives, not a figure kept from the old site.
    await visit('/prices');
    const figure = page.locator('[data-price-figure="шагов в маршруте"]');
    assert.equal(flat(await figure.innerText()), '9–12', '/prices: without a plan the route is 9–12 steps, as the plan builder makes it');

    // 2. The questionnaire, then the result: the free step is on the first
    //    screen; the offer follows the route it speaks about; one filled button.
    await visit('/plan');
    const wizard = page.locator('[data-plan-wizard]');
    for (let index = 0; index < 10; index++) {
      const id = await page.locator('[data-plan-question]').getAttribute('data-plan-question');
      await wizard.locator('button[aria-pressed]').first().click();
      await page.waitForFunction(previous => document.querySelector('[data-plan-question]')?.getAttribute('data-plan-question') !== previous, id);
    }
    // The hand-off names the first step and says what the plan holds. It used to
    // print the step's whole action (repeated on the result and on the step's
    // page) and promise that the other steps «откроются по кнопке ниже».
    const handoff = flat(await wizard.innerText());
    assert.match(handoff, /Первый шаг открыт целиком\. В плане ещё \d+ шаг\S* и список из \d+ документ/, 'Hand-off: says what the plan holds');
    assert.doesNotMatch(handoff, /откроются по кнопке/, 'Hand-off: does not promise that locked steps open by the button');
    await page.getByRole('button', { name: 'Открыть мой план', exact: true }).click();
    const result = page.locator('[data-assessment-result]');
    await result.getByRole('heading', { name: 'Твой маршрут' }).waitFor();
    const start = result.locator('[data-plan-path-step][data-state=current]');
    await page.waitForFunction(() => { const box = document.querySelector('[data-plan-path-step][data-state=current]')?.getBoundingClientRect(); return box && box.top >= 0 && box.bottom <= innerHeight; });
    assert.match(await start.innerText(), /Начни здесь/, `Plan at ${width}: the free step with «Начни здесь» is on the first screen after the questionnaire`);
    const order = await result.evaluate(root => { const path = root.querySelector('[data-plan-path]'), offer = root.querySelector('[data-plan-offer]'); return Boolean(path.compareDocumentPosition(offer) & Node.DOCUMENT_POSITION_FOLLOWING); });
    assert.equal(order, true, 'Plan: the offer follows the route');
    assert.equal(await result.locator('[data-wall-buy]').count(), 1, 'Plan: one purchase button on the result');
    assert.equal(await result.locator('[data-plan-offer] a[href="/portal"]').evaluate(link => { const style = getComputedStyle(link); return style.borderTopWidth === '0px' && style.backgroundColor === 'rgba(0, 0, 0, 0)'; }), true, 'Plan: the cabinet is a text link, not a second button');
    const steps = await result.locator('[data-plan-path-step]').count();
    assert.match(flat(await result.locator('[data-plan-offer]').innerText()), new RegExp(`ещё ${steps - 1} шаг`), 'Plan: the offer counts the steps the route shows');
    await collect('/plan');

    // 3. The same count on /prices for this visitor; the same purchase label;
    //    the refund's condition and a way to ask under the button.
    await visit('/prices');
    await page.waitForFunction(expected => document.querySelector('[data-price-figure="шагов в маршруте"]')?.textContent.trim() === expected, String(steps));
    assert.equal(flat(await figure.innerText()), String(steps), '/prices: with a finished plan the figure is that plan\'s own count');
    await collect('/prices');
    assert.equal(await page.locator('[data-pricing-buy]').count(), 2, '/prices: two entry points');
    const refund = page.locator('[data-pricing-refund]');
    assert.match(flat(await refund.innerText()), /Возврат 7 дней, пока не .+ Вопросы и возврат — в WhatsApp\./, '/prices: the refund states its condition and where to ask');
    assert.match(await refund.locator('a').getAttribute('href'), /^https:\/\/wa\.me\/\d+$/, '/prices: the way to ask is a WhatsApp link');
    await page.evaluate(() => scrollTo(0, 0));
    const fold = await page.evaluate(() => { const buy = document.querySelector('[data-pricing-buy=hero]').getBoundingClientRect(), note = document.querySelector('[data-pricing-refund]').getBoundingClientRect(); return { under: note.top >= buy.bottom && note.top - buy.bottom < 40, visible: note.bottom <= innerHeight }; });
    assert.deepEqual(fold, { under: true, visible: true }, `/prices at ${width}: the refund line stands under the button on the first screen`);
    const main = flat(await page.locator('main').innerText());
    assert.doesNotMatch(main, /Проверить шансы|проверь шансы|Купить за/, '/prices: the free way in is «Составить план», the purchase «Открыть маршрут»');
    assert.equal(flat(await page.locator('nav[aria-label="На странице цен"] a').first().innerText()), 'Что включено', '/prices: the first link is named as the heading it leads to');
    assert.equal(await page.getByRole('button', { name: 'Составить план бесплатно', exact: true }).count(), 1, '/prices: the free way in carries the name it has on the home page');
    // The form is headed by the name the site uses for what is sold.
    await page.locator('[data-pricing-buy=hero]').click();
    const sheet = page.getByRole('dialog');
    assert.equal(flat(await sheet.getByRole('heading').first().innerText()), 'Весь маршрут поступления', 'The purchase form names the route');
    await page.keyboard.press('Escape'); await sheet.waitFor({ state: 'hidden' });

    // 3a. The free cabinet built from the same answers counts the plan's steps
    //     under their own name and as the same number; the rest has a name too.
    await visit('/portal');
    const count = page.locator('[data-road-count]');
    await count.waitFor();
    assert.equal(flat(await count.locator('[data-road-count-group=plan]').innerText()), `Шаги плана: 0 из ${steps}`, 'Cabinet: the plan\'s steps are counted as on /plan');
    assert.match(flat(await count.locator('[data-road-count-group=prep]').innerText()), /^Подготовка и документы: \d+ из \d+$/, 'Cabinet: what it adds to the plan is counted under its own name');
    assert.doesNotMatch(flat(await count.innerText()), /Сделано \d+ из \d+ шаг/, 'Cabinet: no second total of «шагов» beside the plan\'s');

    // 3b. The guest cabinet says what it is and leads back to the plan; what
    //     comes only with the route is not offered as a button that connects it.
    const status = page.locator('[data-local-status]');
    assert.match(flat(await status.innerText()), /^Бесплатный кабинет: план сохранён на этом устройстве/, 'Guest cabinet: named as the free one kept on the device');
    assert.equal(await status.locator('[data-local-plan]').getAttribute('href'), '/plan#route', 'Guest cabinet: a way back to the plan');
    const cabinet = flat(await page.locator('main').innerText());
    assert.match(cabinet, /Напоминания о сроках Подключаются с маршрутом/, 'Guest cabinet: reminders are named as part of the route');
    assert.doesNotMatch(cabinet, /Подключить Telegram/, 'Guest cabinet: no button promises to connect what the route brings');

    // 4. A locked plan step and the walls of the guides carry the same label.
    await visit('/plan/2'); await page.locator('[data-wall-buy]').first().waitFor(); await collect('/plan/2');
    await page.locator('[data-wall-buy]').first().click();
    assert.equal(flat(await sheet.getByRole('heading').first().innerText()), 'Весь маршрут поступления', 'A wall opens the same form under the same name');
    await page.keyboard.press('Escape'); await sheet.waitFor({ state: 'hidden' });

    // 4a. Where a wall shows, the purchase is the one filled button: the pager
    //     is two quiet cards, and a label never says «Дальше» over a wall or
    //     «Готово» over a step that was not read.
    const quiet = locator => locator.evaluate(card => getComputedStyle(card).backgroundColor === 'rgba(0, 0, 0, 0)');
    assert.equal(await quiet(page.locator('[data-plan-step-next]')), true, '/plan/2: the pager is quiet under the wall');
    await visit('/plan/1'); await page.locator('[data-plan-step-next]').waitFor();
    assert.match(flat(await page.locator('[data-plan-step-next] small').innerText()), /^Дальше · с маршрутом$/, '/plan/1: the way on says the next step comes with the route');
    assert.equal(await quiet(page.locator('[data-plan-step-next]')), false, '/plan/1: an open step keeps its way on');
    await visit(`/plan/${steps}`); await page.locator('[data-wall-buy]').first().waitFor();
    assert.match(flat(await page.locator('nav[aria-label="Соседние шаги"]').innerText()), /К плану Весь маршрут$/, 'The locked last step leads back to the plan, not to «Готово»');
    assert.equal(await page.getByRole('link', { name: 'Продолжить в личном кабинете', exact: true }).count(), 0, 'The locked last step does not close the route with a cabinet button');
    await visit('/guides/codice/1'); await page.locator('[data-wall-buy]').first().waitFor();
    assert.equal(await quiet(page.locator('[data-guide-step-next]')), true, 'A locked guide step: the pager is quiet under the wall');
    assert.match(flat(await page.locator('[data-guide-step-next] small').innerText()), /^Дальше · с маршрутом$/);
    await visit('/guides/codice/2'); await page.locator('[data-wall-buy]').first().waitFor();
    assert.match(flat(await page.locator('nav[aria-label="Соседние шаги"]').innerText()), /К теме Codice fiscale$/, 'The locked last step of a topic leads back to the topic');
    await visit('/guides/apostille/1');
    assert.equal(flat(await page.locator('[data-guide-step-next] small').innerText()), 'Дальше', 'A free topic: the way on carries no «с маршрутом»');
    await visit('/guides/apostille');
    assert.match(flat(await page.locator('[data-guide-next-topic]').innerText()), /^Следующая тема: /, 'A topic names its bottom link as the next topic');

    // 5. A guide topic reads first: the facts, the topic itself and its steps
    //    stand before any offer, free topic or paid.
    for (const path of ['/guides/apostille', '/guides/codice', '/guides/visa']) {
      await visit(path);
      await page.locator('[data-guide-after] [data-wall-buy]').waitFor();
      await collect(path);
      const layout = await page.evaluate(() => {
        const buy = document.querySelector('main [data-wall-buy]'), before = [...document.querySelectorAll('[data-guide-overview], [data-guide-brief], [data-guide-road], [data-path-road], main h2')].filter(el => el.compareDocumentPosition(buy) & Node.DOCUMENT_POSITION_FOLLOWING);
        return { offersInFacts: document.querySelectorAll('[data-guide-overview] [data-wall-buy], [data-guide-overview] [data-guide-next]').length, headingsBefore: before.filter(el => el.tagName === 'H2').map(el => el.textContent.trim()), buys: document.querySelectorAll('main [data-wall-buy]').length };
      });
      assert.equal(layout.offersInFacts, 0, `${path}: the facts above the reading carry no offer`);
      assert.equal(layout.buys, 1, `${path}: one purchase button on the page`);
      assert(layout.headingsBefore.some(title => /Разбор по шагам|Путь по визе/.test(title)), `${path}: the steps stand before the offer (${layout.headingsBefore.join(' · ')})`);
      if (path === '/guides/apostille') assert(layout.headingsBefore.includes('Вся тема коротко'), `${path}: the whole free topic is read before the offer`);
    }
    assert.deepEqual([...new Set(labels.values())], [BUY], `One purchase label on every wall and on /prices (${[...labels.keys()].join(' | ')})`);

    // 6. One time for the questionnaire, on the page itself and in the answer
    //    that sends people to it.
    await visit('/');
    assert.doesNotMatch(await page.locator('main').evaluate(node => node.textContent), /за 10 минут/, 'Home: the questionnaire is not «10 минут» in one place and «~2 минуты» in another');
    assert.match(await page.locator('main').evaluate(node => node.textContent), /за 2 минуты пройди опрос/, 'Home: the answer names the two minutes the questionnaire takes');
    const intro = page.locator('[data-vespi-intro=home] a');
    assert.deepEqual([flat(await intro.innerText()), await intro.getAttribute('href')], ['Составить план с Веспи', '/plan#questionnaire'], 'Home: the button under Vespi names where it leads');
    if (phone) {
      // The trust line under the first buttons is not read through the chat button.
      await page.waitForFunction(() => document.querySelector('#chat-launcher'));
      const covered = await page.evaluate(async () => {
        await new Promise(done => setTimeout(done, 400));
        const fab = document.querySelector('#chat-launcher'), box = fab.getBoundingClientRect(), away = fab.getAttribute('aria-hidden') === 'true';
        const range = document.createRange(); range.selectNodeContents(document.querySelector('[data-hero-trust]'));
        return !away && [...range.getClientRects()].some(line => line.left < box.right && line.right > box.left && line.top < box.bottom && line.bottom > box.top);
      });
      assert.equal(covered, false, 'Home at 390: the chat button covers no word of the trust line');
    }

    // 7. The same field carries the same name in the cabinet and on /check; a
    //    lost code has a named way back before the form is sent.
    await visit('/check');
    assert.equal(await page.locator('#document-check').getByRole('combobox', { name: 'Стипендиальная программа', exact: true }).count(), 1, '/check: the scholarship field is named as in the cabinet');
    await visit('/portal?auth=login');
    assert.equal(await page.locator('form a[href="/prices"]').innerText(), 'Посмотреть цену', 'Sign-in: the price is not «тарифы», which /prices says it is not');
    await page.locator('[data-portal-recover-open]').click();
    assert.match(flat(await page.locator('[data-portal-recover]').getByText(/Код придёт/).innerText()), /пришлём вручную через WhatsApp/, 'Recovery: the manual way back is named before sending');

    assert.deepEqual(errors, [], `No page errors at ${width}`);
    results.push({ width, passed: true, steps, labels: labels.size });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  server.close();
}
