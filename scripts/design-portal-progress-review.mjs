import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'REVIEW_TOOLS must point to the isolated browser tools.');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const root = resolve('out'), output = resolve('design-review/portal-progress');
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer(async (request, response) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return response.writeHead(403).end();
    for (const file of [path, `${path}.html`, resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        return response.end(await readFile(file));
      }
    }
    response.writeHead(404).end();
  } catch { response.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const errors = [], unexpectedApi = [], results = [];

const roadmap = [
  { id: 'start', title: 'Старт', tasks: [
    { id: 'profile', t: 'Заполнить профиль', available: true, owner: 'Ты' },
    { id: 'shortlist', t: 'Выбрать программы', explain: 'Сравни программы и сохрани подходящие.', time: '15 мин', available: true, owner: 'Ты', deadline: '2026-11-15', deadlineKind: 'application', daysLeft: 30 },
    { id: 'family-budget', t: 'Обсудить бюджет', explain: 'Уточни сумму на учёбу и жизнь.', time: '10 мин', available: true, owner: 'Ты + родители' },
  ] },
  { id: 'documents', title: 'Документы', tasks: [
    { id: 'statements', t: 'Подготовить банковскую выписку', available: false, owner: 'Ты', timingLabel: 'Сначала выбрать программы' },
    { id: 'familyDocs', t: 'Собрать справки о доходах', available: false, owner: 'родители', timingLabel: 'Сначала выбрать программы' },
  ] },
  { id: 'visa', title: 'Виза', tasks: [{ id: 'visa-task', t: 'Собрать визовый пакет', available: true, owner: 'Ты', deadline: '2026-10-16', daysLeft: 3 }] },
  { id: 'arrival', title: 'Переезд', tasks: [{ id: 'arrival-task', t: 'Подготовиться к приезду', available: false, owner: 'Ты', timingLabel: 'После получения визы' }] },
];
const ids = roadmap.flatMap(stage => stage.tasks.map(task => task.id));
function fixture(mode = 'partial') {
  const data = { ok: true, client: { name: 'Тестовый профиль', surname: 'Testov', intakeYear: 2027, tgLinked: false, notify: { telegram: false }, onboardingComplete: true, profile: { education: 'NIS Grade 12', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', educationPath: 'university_kz', onboardingDone: true } }, roadmap: structuredClone(roadmap), done: { profile: true, 'obsolete-task': true }, docs: {} };
  if (mode === 'zero') data.done = {};
  if (mode === 'complete') data.done = Object.fromEntries([...ids, 'obsolete-task'].map(id => [id, true]));
  if (mode === 'empty') { data.roadmap = []; data.done = {}; }
  if (mode === 'blocked') data.roadmap.forEach(stage => stage.tasks.forEach(task => { task.available = false; }));
  if (mode === 'near') data.roadmap[0].tasks[1].daysLeft = 3;
  if (mode === 'parents') data.done.shortlist = true;
  if (mode === 'late-current') {
    data.roadmap = [{ id: 'documents', title: 'Документы', tasks: [
      { id: 'apostille', t: 'Поставить апостиль на аттестат', available: true, owner: 'Ты' },
      { id: 'translate', t: 'Заказать официальный перевод на итальянский', available: true, owner: 'Ты' },
      { id: 'notary', t: 'Заверить перевод', available: true, owner: 'Ты' },
      { id: 'cimea', t: 'Подтвердить квалификацию', available: true, owner: 'Ты' },
      { id: 'statements', t: 'Подготовить банковскую выписку', available: true, owner: 'Ты', time: '10 мин' },
    ] }, ...structuredClone(roadmap.slice(2))];
    data.done = { apostille: true, translate: true, notary: true, cimea: true, 'obsolete-task': true };
  }
  return data;
}
function upstreamProgress(data) {
  const tasks = data.roadmap.flatMap(stage => stage.tasks), total = tasks.length;
  const done = tasks.filter(task => data.done[task.id]).length;
  return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
}
async function openPortal(viewport, mode = 'partial', reducedMotion = 'reduce') {
  const data = fixture(mode), calls = [];
  const context = await browser.newContext({ viewport, reducedMotion, locale: 'ru-RU' });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    const json = body => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/api/event') return json({ ok: true });
    if (url.pathname === '/health/ai') return json({ ok: true, code: 'AI_READY' });
    if (url.pathname === '/api/portal/lookup') {
      assert.deepEqual(request.postDataJSON(), { code: 'TEST-01', surname: 'Testov' });
      return json({ ...data, progress: upstreamProgress(data) });
    }
    if (url.pathname === '/api/portal/TEST-01/task') {
      const body = request.postDataJSON();
      assert.equal(body.surname, 'Testov');
      assert(ids.includes(body.task) && typeof body.value === 'boolean');
      calls.push(body);
      data.done[body.task] = body.value;
      return json({ ok: true, done: data.done, progress: upstreamProgress(data) });
    }
    if (url.pathname.startsWith('/api/')) unexpectedApi.push(url.pathname);
    if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    return route.abort(); // Only synthetic local fixtures; never call a live account or service.
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/portal`, { waitUntil: 'networkidle' });
  await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
  await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
  await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
  await page.locator('[data-portal-overview]').waitFor();
  return { context, page, calls };
}
const overview = page => page.locator('[data-portal-overview]');
const currentStage = page => page.locator('[data-current-stage]');
const primary = page => page.locator('[data-primary-action]').filter({ visible: true });
const navigation = page => page.locator('nav[aria-label="Разделы личного кабинета"], [aria-label="Разделы кабинета"]').filter({ visible: true });
async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, label);
}
async function checkStage(page, title, done, total) {
  const text = await currentStage(page).innerText();
  assert.match(text, new RegExp(`${title}[\\s,·]*${done}\\s*из\\s*${total}(?!\\d)`));
  assert.equal(await page.getByRole('progressbar').count(), 0, 'There is no global percentage or long progress bar');
  assert.doesNotMatch(await overview(page).innerText(), /\d+\s*%|Проверены:|Не загружены:|Параллельно|Следом/);
  assert.doesNotMatch(await page.locator('main').innerText(), new RegExp(`\\d+\\s*из\\s*${ids.length}(?!\\d)`), 'Overview must not show the total-route counter');
  await noOverflow(page, 'Overview does not overflow');
}
async function checkNavigation(page, afterScroll = false) {
  const nav = navigation(page);
  assert.equal(await nav.count(), 1, 'One primary navigation is visible');
  assert.deepEqual((await nav.getByRole('button').allTextContents()).map(label => label.trim()), ['Обзор', 'План', 'Документы']);
  assert.equal(await nav.evaluate(el => el.scrollWidth > el.clientWidth + 1), false, 'All three sections fit without horizontal scrolling');
  assert.equal(await page.getByRole('link', { name: 'Настройки', exact: true }).filter({ visible: true }).count(), 1);
  if (page.viewportSize().width <= 768 && afterScroll) {
    const box = await nav.boundingBox();
    assert(box && box.y >= -1 && box.y + box.height <= page.viewportSize().height + 1, 'The three mobile sections remain visible after scrolling');
  }
}
async function checkOneFilledAction(page, label) {
  const filled = await page.locator('button, a').evaluateAll(elements => elements.filter(element => {
    const box = element.getBoundingClientRect(), style = getComputedStyle(element);
    if (!box.width || !box.height || style.visibility === 'hidden' || element.closest('nav,[aria-label="Разделы кабинета"]')) return false;
    const color = style.backgroundColor.match(/[\d.]+/g)?.map(Number);
    return color && (color[3] ?? 1) > 0.7 && Math.min(...color.slice(0, 3)) < 170;
  }).map(element => ({ text: element.textContent.trim(), background: getComputedStyle(element).backgroundColor })));
  assert.equal(filled.length, 1, `${label}: exactly one filled action (${JSON.stringify(filled)})`);
  assert.equal(await primary(page).count(), 1, `${label}: one explicit primary action`);
}
async function checkSettings(page) {
  await page.getByRole('heading', { name: 'Настройки', exact: true }).waitFor();
  assert.equal(await page.getByRole('heading', { name: 'Данные для маршрута', exact: true }).isVisible(), true);
  assert.equal(await page.getByText('NIS Grade 12', { exact: true }).isVisible(), true);
  assert.equal(await page.locator('#notifications').getAttribute('data-telegram-status'), 'disconnected');
  assert.equal(await page.locator('#notifications').getByRole('button', { name: 'Подключить Telegram', exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: 'Выйти', exact: true }).count(), 1);
  await noOverflow(page, 'Settings have no horizontal overflow');
  await checkNavigation(page);
}
async function checkMascot(page, reduced = true) {
  const mascot = page.locator('[data-progress-mascot]');
  assert.equal(await mascot.getAttribute('aria-hidden'), 'true');
  const image = mascot.locator('img');
  await image.evaluate(async image => { await image.decode(); });
  const animation = await image.evaluate(element => ({ name: getComputedStyle(element).animationName, duration: getComputedStyle(element).animationDuration, iterations: getComputedStyle(element).animationIterationCount }));
  if (reduced) assert.equal(animation.name, 'none', 'Reduced motion disables mascot animation');
  else if (animation.name !== 'none') {
    assert(animation.duration.split(',').every(value => parseFloat(value) <= 1), 'Mascot motion is short');
    assert(animation.iterations.split(',').every(value => Number(value) === 1), 'Mascot does not loop');
  }
  const art = await mascot.boundingBox(), action = await primary(page).boundingBox();
  assert(art && action && !(art.x < action.x + action.width && art.x + art.width > action.x && art.y < action.y + action.height && art.y + art.height > action.y), 'Mascot never overlaps the current action');
}
async function go(page, name) {
  await navigation(page).getByRole('button', { name, exact: true }).click();
}

try {
  for (const viewport of process.env.NAVIGATION_REVIEW_LATE_ONLY ? [] : [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 390, height: 667 }, { width: 320, height: 740 }]) {
    const { context, page, calls } = await openPortal(viewport);
    const label = `${viewport.width}x${viewport.height}`;
    await checkStage(page, 'Старт', 1, 3);
    await checkNavigation(page);
    await checkOneFilledAction(page, `Overview ${label}`);
    await checkMascot(page);
    assert.equal(await page.getByRole('button', { name: 'Выйти', exact: true }).count(), 0, 'Logout belongs to settings');
    assert.equal(await page.locator('[data-current-step="shortlist"]').count(), 1, 'A near-dated future stage cannot replace the current step');
    assert.match(await overview(page).innerText(), /Ориентир.*15 ноя 2026/);
    assert.equal(await overview(page).locator('[data-current-step]').getByText(/^Сейчас(?:\s|$)/).count(), 1, 'A distant non-blocking action is labelled Сейчас');
    assert.equal(await overview(page).getByText('Сделай сегодня', { exact: true }).count(), 0);
    assert.equal(await overview(page).locator('[data-document]').count(), 0, 'No document line is shown when no document exists');
    await page.evaluate(() => document.fonts.ready);
    const button = await primary(page).boundingBox();
    assert(button && button.y >= 0 && button.y + button.height <= viewport.height, `The current action verb is above the fold at ${label}`);
    assert.match(await primary(page).innerText(), /Выбрать программы/);
    await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[data-portal-overview]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
    assert.deepEqual(violations, [], `${label} overview accessibility`);
    await page.screenshot({ path: resolve(output, `portal-overview-${label}.png`), fullPage: true });

    await go(page, 'План');
    await page.locator('#portal-stage-start').waitFor();
    assert.equal(await page.locator('[data-portal-overview]').count(), 0, 'The current-step card appears only on Overview');
    assert.equal(await page.locator('#portal-stage-start button[aria-expanded]').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.getByText('Весь маршрут', { exact: true }).count(), 1);
    assert.equal(await page.locator('#portal-stage-visa').isVisible(), false, 'Later stages are hidden under Весь маршрут');
    const currentRow = page.locator('[data-portal-task="shortlist"]');
    assert.equal(await page.locator('[data-current-task=true]').count(), 1, 'Exactly one task is labelled as current');
    assert.match(await page.locator('[data-portal-task="family-budget"]').innerText(), /Потом/, 'The next task is explicitly labelled as later');
    assert.equal(await currentRow.getAttribute('role'), null, 'The entire step row is not a toggle');
    await currentRow.getByText('Выбрать программы', { exact: true }).first().click();
    assert.equal(calls.length, 0, 'Clicking step text cannot change completion');
    assert.equal(await currentRow.getByRole('button', { name: 'Я это сделал', exact: true }).count(), 1);
    await checkOneFilledAction(page, `Plan ${label}`);
    await page.getByText('Весь маршрут', { exact: true }).click();
    await page.locator('#portal-stage-documents button[aria-expanded]').click();
    const blocked = page.locator('[data-portal-task="statements"]');
    assert.match(await blocked.innerText(), /Сначала выбрать программы/);
    assert.equal(await blocked.getByRole('button', { name: /Загрузить|Я это сделал/ }).count(), 0, 'Blocked steps offer neither upload nor self-report');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await checkNavigation(page, true);
    await noOverflow(page, `Plan ${label}`);
    await page.screenshot({ path: resolve(output, `portal-plan-${label}.png`), fullPage: true });

    if (viewport.width === 1440) {
      await currentRow.getByRole('button', { name: 'Я это сделал', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[data-portal-task="family-budget"] [data-primary-action]'));
      assert.deepEqual(calls.map(call => [call.task, call.value]), [['shortlist', true]]);
      assert.match(await page.locator('[data-portal-task="family-budget"]').innerText(), /Попросить родителей/);
      await go(page, 'Обзор');
      await checkStage(page, 'Старт', 2, 3);
      assert.equal(await page.locator('[data-current-step="family-budget"]').count(), 1);
    } else await go(page, 'Обзор');
    await page.getByRole('link', { name: 'Настройки', exact: true }).click();
    await checkSettings(page);
    await page.goBack();
    await overview(page).waitFor();
    await page.goForward();
    await checkSettings(page);
    await go(page, 'Обзор');
    if (viewport.width === 320) {
      for (const view of ['help', 'profile']) {
        await page.goto(`${origin}/portal?view=${view}`, { waitUntil: 'networkidle' });
        await checkSettings(page);
        await page.waitForURL(url => url.searchParams.get('view') === 'settings' && (view !== 'help' || url.hash === '#notifications'));
      }
      assert.deepEqual(await page.evaluate(() => [localStorage.getItem('iitaly_portal_code'), localStorage.getItem('iitaly_portal_surname')]), ['TEST-01', 'Testov']);
      await page.getByRole('button', { name: 'Выйти', exact: true }).click();
      await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).waitFor();
      assert.deepEqual(await page.evaluate(() => [localStorage.getItem('iitaly_portal_code'), localStorage.getItem('iitaly_portal_surname')]), [null, null]);
    }
    results.push({ viewport, stageCountOnly: true, currentVerbAboveFold: true, oneFilledAction: true, futureCannotBecomeCurrent: true, explicitSelfReport: true, navigation: '3 sticky sections + settings link', history: 'pass', overflow: false, axe: 'pass' });
    await context.close();
  }
  for (const mode of process.env.NAVIGATION_REVIEW_LATE_ONLY ? [] : ['zero', 'complete', 'blocked', 'empty', 'near', 'parents']) {
    const { context, page, calls } = await openPortal({ width: 390, height: 844 }, mode);
    assert.equal(await page.getByRole('progressbar').count(), 0);
    assert.equal(calls.length, 0, 'Rendering never mutates route data');
    if (mode === 'zero') await checkStage(page, 'Старт', 0, 3);
    if (mode === 'near') assert.match(await overview(page).innerText(), /Сделай сегодня/);
    if (mode === 'parents') {
      await checkStage(page, 'Старт', 2, 3);
      assert.match(await overview(page).innerText(), /Попросить родителей/);
    }
    if (mode === 'blocked') assert.equal(await overview(page).getByRole('button', { name: /Загрузить|Я это сделал/ }).count(), 0);
    await noOverflow(page, `${mode} overview`);
    results.push({ state: mode, passed: true });
    await context.close();
  }
  if (!process.env.NAVIGATION_REVIEW_LATE_ONLY) {
    const { context, page } = await openPortal({ width: 390, height: 844 }, 'partial', 'no-preference');
    await checkMascot(page, false);
    results.push({ motion: 'normal', finiteOrStatic: true, passed: true });
    await context.close();
  }
  const lateFailures = [];
  for (const viewport of [{ width: 390, height: 667 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
    const { context, page } = await openPortal(viewport, 'late-current');
    await go(page, 'План');
    const current = page.locator('[data-portal-task="statements"]');
    await current.waitFor();
    const title = await current.getByRole('heading').boundingBox(), action = await primary(page).boundingBox();
    const visible = title && action && title.y >= 0 && action.y >= 0 && title.y + title.height <= viewport.height && action.y + action.height <= viewport.height;
    if (!visible) lateFailures.push({ viewport, title, action });
    await page.screenshot({ path: resolve(output, `portal-plan-late-${viewport.width}x${viewport.height}.png`), fullPage: true });
    results.push({ viewport, lateCurrentActionAboveFold: Boolean(visible) });
    await context.close();
  }
  assert.deepEqual(lateFailures, [], 'A current step remains above the fold after completed steps');
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedApi, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors, unexpectedApi }, null, 2));
  console.log(JSON.stringify({ results, errors, unexpectedApi }, null, 2));
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
