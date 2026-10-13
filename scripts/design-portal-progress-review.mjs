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
    { id: 'shortlist', ai: true, t: 'Выбрать программы', explain: 'Сравни программы и сохрани подходящие.', time: '15 мин', available: true, owner: 'Ты', deadline: '2026-11-15', deadlineKind: 'application', daysLeft: 30 },
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
  if (mode === 'profile') { data.client.profile.education = 'НИШ / 12 лет'; delete data.client.profile.educationPath; }
  if (mode === 'complete') data.done = Object.fromEntries([...ids, 'obsolete-task'].map(id => [id, true]));
  if (mode === 'empty') { data.roadmap = []; data.done = {}; }
  if (mode === 'blocked') data.roadmap.forEach(stage => stage.tasks.forEach(task => { task.available = false; }));
  if (mode === 'near') data.roadmap[0].tasks[1].daysLeft = 3;
  if (mode === 'parents') data.done.shortlist = true;
  if (mode === 'parent-file') { data.roadmap = [{ id: 'documents', title: 'Документы', tasks: [{ id: 'familyDocs', t: 'Собрать семейные справки', owner: 'родители', available: true }, { id: 'insurance', t: 'Подготовить страховку', owner: 'Ты', available: true }] }]; data.done = {}; }
  if (mode === 'manual') { data.roadmap[0].tasks[1] = { id: 'manual-task', t: 'Подготовить сведения', explain: 'Подготовь сведения для выбранной программы.', available: true, owner: 'Ты' }; }
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
async function openPortal(viewport, mode = 'partial', reducedMotion = 'reduce', captureAssistantEvent = true) {
  const data = fixture(mode), calls = [], chatCalls = [], profileCalls = [], fileCalls = { check: 0, save: 0 };
  const context = await browser.newContext({ viewport, reducedMotion, locale: 'ru-RU' });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    const json = body => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/api/event') return json({ ok: true });
    if (url.pathname === '/health/ai') return json({ ok: true, code: 'AI_READY' });
    if (url.pathname === '/api/check-document' && mode === 'parent-file') {
      fileCalls.check += 1;
      return json({ ok: true, result: { verdict: 'ok', summary: 'Синтетическая семейная справка прошла проверку.' } });
    }
    if (url.pathname === '/api/portal/TEST-01/doc' && mode === 'parent-file') {
      fileCalls.save += 1;
      const body = request.postDataJSON();
      assert.equal(body.task, 'familyDocs');
      assert.equal(body.surname, 'Testov');
      data.docs.familyDocs = { verdict: body.result.verdict, summary: body.result.summary, result: body.result, fileName: body.fileName };
      data.done.familyDocs = true;
      return json({ ok: true, docs: data.docs, done: data.done, progress: upstreamProgress(data) });
    }
    if (url.pathname === '/api/chat') { chatCalls.push(request.postDataJSON()); return json({ reply: `Тестовый ответ ${chatCalls.length}.` }); }
    if (url.pathname === '/api/portal/lookup') {
      assert.deepEqual(request.postDataJSON(), { code: 'TEST-01', surname: 'Testov' });
      return json({ ...data, progress: upstreamProgress(data) });
    }
    if (url.pathname === '/api/portal/TEST-01/profile') {
      const body = request.postDataJSON();
      profileCalls.push(body);
      const { surname, ...profile } = body;
      assert.equal(surname, 'Testov');
      data.client.profile = { ...data.client.profile, ...profile };
      return json({ ...data, progress: upstreamProgress(data) });
    }
    if (url.pathname === '/api/portal/TEST-01/task') {
      const body = request.postDataJSON();
      assert.equal(body.surname, 'Testov');
      assert(data.roadmap.some(stage => stage.tasks.some(task => task.id === body.task)) && typeof body.value === 'boolean');
      calls.push(body);
      data.done[body.task] = body.value;
      return json({ ok: true, done: data.done, progress: upstreamProgress(data) });
    }
    if (url.pathname.startsWith('/api/')) unexpectedApi.push(url.pathname);
    if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    return route.abort(); // Only synthetic local fixtures; never call a live account or service.
  });
  const page = await context.newPage();
  if (captureAssistantEvent) await page.addInitScript(() => { window.addEventListener('iitaly:open-chat', event => { window.__portalAssistantEvent = event.detail; event.stopImmediatePropagation(); }, true); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/portal`, { waitUntil: 'networkidle' });
  await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
  await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
  await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
  await page.locator('[data-portal-overview]').waitFor();
  return { context, page, calls, chatCalls, profileCalls, fileCalls };
}
const overview = page => page.locator('[data-portal-overview]');
const currentStage = page => page.locator('[data-current-stage]');
const detail = page => page.locator('[data-step-detail]');
const navigation = page => page.locator('nav[aria-label="Разделы личного кабинета"], [aria-label="Разделы кабинета"]').filter({ visible: true });
const assistant = page => page.locator('a[data-portal-assistant]');
async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, label);
}
async function noButtons(page, label) {
  assert.equal(await page.locator('button').count(), 0, `${label}: no buttons exist, including navigation and hidden launchers`);
  assert.equal(await page.locator('[role="button"]').count(), 0, `${label}: links must not disguise secondary buttons`);
  assert.doesNotMatch(await page.locator('main').innerText(), /Спросить про этот шаг|Не понятно — спросить|Открыть план|Открыть разбор|Загрузить документ/);
}
async function checkStage(page, title, done, total) {
  const text = await currentStage(page).innerText();
  assert.match(text, new RegExp(`${title}[\\s,·]*${done}\\s*из\\s*${total}(?!\\d)`));
  assert.equal(await page.getByRole('progressbar').count(), 0, 'There is no global percentage or long progress bar');
  assert.doesNotMatch(await overview(page).innerText(), /\d+\s*%|Проверены:|Не загружены:|Параллельно|Следом|Telegram/);
  assert.doesNotMatch(await page.locator('main').innerText(), new RegExp(`\\d+\\s*из\\s*${ids.length}(?!\\d)`), 'Overview must not show the total-route counter');
  const rows = overview(page).locator(':scope > a');
  assert((await rows.count()) <= 3, 'Overview contains at most three navigation rows');
  for (const row of await rows.all()) {
    assert.equal(await row.evaluate(el => el.tagName), 'A', 'Every overview row is a single link');
    assert.equal(await row.locator('a, button').count(), 0, 'A row has no nested actions');
  }
  await noOverflow(page, 'Overview does not overflow');
}
async function checkNavigation(page, afterScroll = false) {
  const nav = navigation(page);
  assert.equal(await nav.count(), 1, 'One primary navigation is visible');
  assert.deepEqual((await nav.getByRole('link').allTextContents()).map(label => label.trim()), ['Обзор', 'План', 'Документы']);
  assert.equal(await nav.evaluate(el => el.scrollWidth > el.clientWidth + 1), false, 'All three sections fit without horizontal scrolling');
  assert.equal(await page.getByRole('link', { name: 'Настройки', exact: true }).filter({ visible: true }).count(), 1);
  assert.equal(await assistant(page).count(), 1, 'The only assistant entry is in the header');
  if (page.viewportSize().width <= 768 && afterScroll) {
    const box = await nav.boundingBox();
    assert(box && box.y >= -1 && box.y + box.height <= page.viewportSize().height + 1, 'The three mobile sections remain visible after scrolling');
  }
}
async function checkSettings(page) {
  await page.getByRole('heading', { name: 'Настройки', exact: true }).waitFor();
  assert.equal(await page.getByRole('heading', { name: 'Данные для маршрута', exact: true }).isVisible(), true);
  assert.equal(await page.getByText('NIS Grade 12', { exact: true }).isVisible(), true);
  assert.equal(await page.locator('#notifications').getAttribute('data-telegram-status'), 'disconnected');
  assert.equal(await page.locator('#notifications').getByRole('link', { name: 'Подключить Telegram', exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Выйти', exact: true }).count(), 1);
  assert((await page.locator('button').count()) <= 1, 'Settings obey the page button limit');
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
  const art = await mascot.boundingBox(), action = await page.locator('[data-current-step]').boundingBox();
  assert(art && action && !(art.x < action.x + action.width && art.x + art.width > action.x && art.y < action.y + action.height && art.y + art.height > action.y), 'Mascot never overlaps the current row');
}
async function go(page, name) {
  await navigation(page).getByRole('link', { name, exact: true }).click();
}
async function openStep(page, locator, id, screen = 'plan') {
  const link = await locator.evaluate(element => element.tagName === 'A') ? locator : locator.getByRole('link');
  assert.equal(await link.count(), 1, 'A task has exactly one navigation path');
  const href = new URL(await link.getAttribute('href'), origin);
  assert.equal(href.pathname, '/portal');
  assert.equal(href.searchParams.get('view'), screen);
  assert.equal(href.searchParams.get(screen === 'docs' ? 'doc' : 'task'), id);
  await link.click();
  await page.locator(`[data-step-detail="${id}"]`).waitFor();
  assert.equal(new URL(page.url()).searchParams.get(screen === 'docs' ? 'doc' : 'task'), id);
  assert.equal(await assistant(page).getAttribute('data-step-id'), id, 'Header assistant receives the open step ID');
}

try {
  for (const viewport of process.env.NAVIGATION_REVIEW_LATE_ONLY ? [] : [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 390, height: 667 }, { width: 320, height: 740 }]) {
    const { context, page, calls } = await openPortal(viewport);
    const label = `${viewport.width}x${viewport.height}`;
    await checkStage(page, 'Старт', 1, 3);
    await checkNavigation(page);
    await noButtons(page, `Overview ${label}`);
    await checkMascot(page);
    assert.equal(await page.getByRole('link', { name: 'Выйти', exact: true }).count(), 0, 'Logout belongs to settings');
    const current = page.locator('[data-current-step="shortlist"]');
    assert.equal(await current.count(), 1, 'A near-dated future stage cannot replace the current step');
    assert.match(await current.innerText(), /Сейчас/);
    assert.match(await current.innerText(), /Ориентир.*15 ноя 2026/);
    assert.equal(await overview(page).locator('[data-overview-document]').count(), 0, 'No document line is shown when no document exists');
    await page.evaluate(() => document.fonts.ready);
    const rowBox = await current.boundingBox();
    assert(rowBox && rowBox.y >= 0 && rowBox.y + rowBox.height <= viewport.height, `The current action verb is above the fold at ${label}`);
    assert.match(await current.innerText(), /Выбрать программы/);
    await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[data-portal-overview]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
    assert.deepEqual(violations, [], `${label} overview accessibility`);
    await page.screenshot({ path: resolve(output, `portal-overview-${label}.png`), fullPage: true });
    await openStep(page, current, 'shortlist');
    assert((await page.locator('button').count()) <= 1, 'Program choice obeys the page button limit');
    assert.equal(await detail(page).locator('a[href="/universities"]').count(), 1, 'The existing program-selection destination has exactly one path');
    assert.equal(calls.length, 0, 'Opening a step cannot complete it');
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-step-detail="shortlist"]').waitFor();
    assert.equal(await assistant(page).getAttribute('data-step-id'), 'shortlist');
    await assistant(page).click();
    assert.equal(await page.evaluate(() => window.__portalAssistantEvent?.taskId), 'shortlist', 'The helper event includes the exact open step ID');
    await go(page, 'План');
    await page.locator('#portal-stage-start').waitFor();
    assert.equal(await detail(page).count(), 0);
    await noButtons(page, `Plan ${label}`);
    assert.equal(await page.locator('#portal-stage-start').evaluate(element => element.matches('details') ? element.open : element.querySelector('details')?.open), true);
    const stages = page.locator('details[id^=portal-stage-]');
    if (await stages.count()) assert.equal(await stages.evaluateAll(elements => elements.filter(element => element.open).length), 1, 'Only the current stage starts open');
    assert.equal(await page.locator('[data-current-task=true]').count(), 1, 'Exactly one task is labelled current');
    const currentRow = page.locator('[data-portal-task="shortlist"]');
    assert.match(await page.locator('[data-portal-task="family-budget"]').innerText(), /Потом/);
    for (const task of await page.locator('[data-portal-task]').all()) {
      const tag = await task.evaluate(element => element.tagName);
      assert.equal(tag === 'A' ? 1 : await task.getByRole('link').count(), 1, 'Each plan row is a single link');
    }
    await page.screenshot({ path: resolve(output, `portal-plan-${label}.png`), fullPage: true });
    await openStep(page, currentRow, 'shortlist');
    await page.goBack();
    await noButtons(page, 'Back restores plan list');
    const documents = page.locator('#portal-stage-documents');
    await documents.locator('summary').click();
    const blocked = page.locator('[data-portal-task="statements"]');
    await openStep(page, blocked, 'statements', 'docs');
    await noButtons(page, 'Future document step');
    assert.match(await detail(page).innerText(), /Сначала выбрать программы/);
    await page.goBack();
    if (!(await documents.evaluate(element => element.open))) await documents.locator('summary').click();
    await openStep(page, page.locator('[data-portal-task="familyDocs"]'), 'familyDocs');
    await noButtons(page, 'Parent step');
    assert.match(await detail(page).innerText(), /родител/i);
    assert.match(await detail(page).innerText(), /Сначала выбрать программы/);
    await go(page, 'План');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await checkNavigation(page, true);
    await noOverflow(page, `Plan ${label}`);
    await go(page, 'Обзор');
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
      await page.getByRole('link', { name: 'Выйти', exact: true }).click();
      await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).waitFor();
      assert.deepEqual(await page.evaluate(() => [localStorage.getItem('iitaly_portal_code'), localStorage.getItem('iitaly_portal_surname')]), [null, null]);
    }
    results.push({ viewport, stageCountOnly: true, currentVerbAboveFold: true, listsHaveZeroButtons: true, rowIsOnlyNavigationPath: true, helperHasStepContext: true, futureAndParentHaveZeroButtons: true, navigation: '3 sticky links + settings and helper links', historyAndReload: 'pass', overflow: false, axe: 'pass' });
    await context.close();
  }
  for (const mode of process.env.NAVIGATION_REVIEW_LATE_ONLY ? [] : ['zero', 'complete', 'blocked', 'empty', 'near', 'parents', 'manual']) {
    const { context, page, calls } = await openPortal({ width: 390, height: 844 }, mode);
    assert.equal(await page.getByRole('progressbar').count(), 0);
    assert.equal(calls.length, 0, 'Rendering never mutates route data');
    await noButtons(page, `${mode} overview`);
    if (mode === 'zero') await checkStage(page, 'Старт', 0, 3);
    if (mode === 'near') assert.match(await overview(page).innerText(), /Сейчас/);
    if (mode === 'parents') {
      await checkStage(page, 'Старт', 2, 3);
      assert.match(await overview(page).innerText(), /Попросить родителей/);
      await openStep(page, page.locator('[data-current-step="family-budget"]'), 'family-budget');
      await noButtons(page, 'Even a current parent-owned step has no buttons');
      await detail(page).getByRole('checkbox', { name: 'Родители сделали этот шаг', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[data-step-detail] input[type=checkbox]')?.checked);
      assert.deepEqual(calls.map(call => [call.task, call.value]), [['family-budget', true]], 'Parent confirmation can advance the existing route without a button');
      await noButtons(page, 'Parent confirmation remains button-free');
    }
    if (mode === 'manual') {
      await openStep(page, page.locator('[data-current-step="manual-task"]'), 'manual-task');
      assert.equal(await page.locator('button').count(), 1, 'Manual self-report has one explicit action');
      await page.getByRole('button', { name: 'Готово', exact: true }).click();
      await detail(page).getByRole('checkbox').waitFor();
      assert.equal(await detail(page).getByRole('checkbox').isChecked(), true, 'Completed self-report can be reviewed');
      assert.deepEqual(calls.map(call => [call.task, call.value]), [['manual-task', true]]);
      await go(page, 'Обзор');
      await checkStage(page, 'Старт', 2, 3);
      await go(page, 'План');
      await openStep(page, page.locator('[data-portal-task=manual-task]'), 'manual-task');
      await detail(page).getByRole('checkbox').uncheck();
      await page.getByRole('button', { name: 'Готово', exact: true }).click();
      await detail(page).getByRole('checkbox').waitFor({ state: 'hidden' });
      assert.deepEqual(calls.map(call => [call.task, call.value]), [['manual-task', true], ['manual-task', false]], 'One save action also preserves undo for an old self-report');
      await go(page, 'Обзор');
      await checkStage(page, 'Старт', 1, 3);
    }
    await noOverflow(page, `${mode} state`);
    results.push({ state: mode, passed: true });
    await context.close();
  }
  if (!process.env.NAVIGATION_REVIEW_LATE_ONLY) {
    const { context, page } = await openPortal({ width: 390, height: 844 }, 'partial', 'no-preference');
    await checkMascot(page, false);
    results.push({ motion: 'normal', finiteOrStatic: true, passed: true });
    await context.close();
  }
  if (!process.env.NAVIGATION_REVIEW_LATE_ONLY) {
    const { context, page, chatCalls } = await openPortal({ width: 390, height: 844 }, 'partial', 'reduce', false);
    await openStep(page, page.locator('[data-current-step="shortlist"]'), 'shortlist');
    await assistant(page).click();
    const chat = page.getByRole('dialog', { name: 'ИИ-консультант', exact: true });
    await chat.waitFor();
    assert.equal(await chat.locator('button').count(), 1, 'The portal helper has only its send button');
    await page.waitForLoadState('networkidle');
    assert.equal(chatCalls.length, 0, 'Opening the assistant never spends a request without a question');
    await chat.getByLabel('Вопрос ИИ-консультанту', { exact: true }).fill('С чего начать этот шаг?');
    await chat.getByRole('button', { name: 'Отправить', exact: true }).click();
    await chat.getByText('Тестовый ответ 1.', { exact: true }).waitFor();
    assert.equal(chatCalls.length, 1);
    const scopedQuestion = chatCalls[0].messages.at(-1).content;
    assert.match(scopedQuestion, /Открытый шаг IITALY: shortlist/);
    assert.match(scopedQuestion, /название: Выбрать программы/);
    assert.match(scopedQuestion, /С чего начать этот шаг\?/);
    await go(page, 'Обзор');
    assert.equal(await assistant(page).getAttribute('data-step-id'), '', 'The list does not retain an old open-step ID');
    await chat.waitFor();
    assert.equal(chatCalls.length, 1, 'Changing views while the helper is open waits for a question');
    await chat.getByLabel('Вопрос ИИ-консультанту', { exact: true }).fill('Что сейчас видно в кабинете?');
    await chat.getByRole('button', { name: 'Отправить', exact: true }).click();
    await chat.getByText('Тестовый ответ 2.', { exact: true }).waitFor();
    const unscopedQuestion = chatCalls[1].messages.at(-1).content;
    assert.match(unscopedQuestion, /шаг сейчас не открыт/);
    assert.doesNotMatch(unscopedQuestion, /Открытый шаг IITALY: shortlist/);
    await chat.getByLabel('Вопрос ИИ-консультанту', { exact: true }).focus();
    await page.keyboard.press('Escape');
    await chat.waitFor({ state: 'hidden' });
    await noButtons(page, 'Closing the helper restores a button-free overview');
    results.push({ helper: 'one header entry', stepContextSentOnlyOnUserQuestion: true, oldContextClearedOnList: true });
    await context.close();
  }
  if (!process.env.NAVIGATION_REVIEW_LATE_ONLY) {
    const { context, page, profileCalls } = await openPortal({ width: 390, height: 844 }, 'profile');
    await page.getByRole('link', { name: 'Настройки', exact: true }).click();
    await page.getByRole('link', { name: 'Изменить профиль', exact: true }).click();
    const form = page.locator('[data-portal-profile]');
    await form.waitFor();
    assert.equal(await page.locator('button').count(), 1, 'Profile editor has one save button');
    assert.equal(await form.locator('input[name=education][value="НИШ / 12 лет"]').isChecked(), true, 'Stored education enum remains selected');
    assert.equal(await form.locator('input[name=goal][value="Бакалавриат"]').isChecked(), true);
    assert.equal(await form.locator('input[name=budget][value="До 3 млн ₸/год"]').isChecked(), true);
    assert.doesNotMatch(await form.innerText(), /Telegram/);
    await form.locator('input[name=education][value="11 классов"]').check();
    await page.getByRole('link', { name: 'Вернуться в настройки', exact: true }).click();
    assert.equal(profileCalls.length, 0, 'Cancel does not save an edited profile');
    await page.getByText('НИШ / 12 лет', { exact: true }).waitFor();
    await page.getByRole('link', { name: 'Изменить профиль', exact: true }).click();
    await form.locator('input[name=education][value="11 классов"]').check();
    await form.getByRole('button', { name: 'Сохранить', exact: true }).click();
    await form.getByRole('alert').filter({ hasText: 'Выбери путь после 11 классов' }).waitFor();
    assert.equal(profileCalls.length, 0, 'Eleven-year education cannot save without its required path');
    await form.locator('input[name=educationPath][value=foundation]').check();
    await noOverflow(page, 'Profile form at 390px');
    await page.screenshot({ path: resolve(output, 'portal-profile-edit-390.png'), fullPage: true });
    await form.getByRole('button', { name: 'Сохранить', exact: true }).click();
    await form.waitFor({ state: 'hidden' });
    assert.deepEqual(profileCalls, [{ surname: 'Testov', education: '11 классов', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', educationPath: 'foundation', onboardingDone: true }], 'The consolidated form preserves the existing API field names and enum values');
    results.push({ profile: 'native fields with one Save', storedEnums: true, requiredPathValidated: true, cancelDoesNotSave: true, existingApiPayload: true });
    await context.close();
  }
  if (!process.env.NAVIGATION_REVIEW_LATE_ONLY) {
    const { context, page, calls, fileCalls } = await openPortal({ width: 390, height: 844 }, 'parent-file');
    await openStep(page, page.locator('[data-current-step=familyDocs]'), 'familyDocs');
    await noButtons(page, 'Parent-owned step information');
    assert.equal(await detail(page).getByRole('checkbox').count(), 0, 'Document preparation has no separate self-report');
    const fileLink = detail(page).locator('a[href="/portal?view=docs&doc=familyDocs"]');
    assert.equal(await fileLink.count(), 1, 'The parent step has one canonical file destination');
    await openStep(page, fileLink, 'familyDocs', 'docs');
    assert.equal(await page.locator('button').count(), 1, 'A family-prepared current document can still be uploaded');
    await page.getByRole('button', { name: 'Выбрать файл', exact: true }).click();
    await page.locator('input[type=file]').setInputFiles({ name: 'synthetic-family.txt', mimeType: 'text/plain', buffer: Buffer.from('SYNTHETIC FAMILY DOCUMENT. No personal data.') });
    await page.getByRole('region', { name: 'Разбор документа', exact: true }).getByRole('heading', { name: 'Проверка пройдена', exact: true }).waitFor();
    assert.deepEqual(fileCalls, { check: 1, save: 1 });
    assert.equal(calls.length, 0, 'File upload never requires a separate task completion request');
    await go(page, 'Обзор');
    await page.locator('[data-current-step=insurance]').waitFor();
    await checkStage(page, 'Документы', 1, 2);
    results.push({ parentDocument: 'one canonical document screen', parentStepHasZeroButtons: true, uploadClosesTaskAutomatically: true });
    await context.close();
  }
  const lateFailures = [];
  for (const viewport of [{ width: 390, height: 667 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
    const { context, page } = await openPortal(viewport, 'late-current');
    const current = page.locator('[data-current-step="statements"]');
    const action = await current.boundingBox();
    const visible = action && action.y >= 0 && action.y + action.height <= viewport.height;
    if (!visible) lateFailures.push({ viewport, action });
    await noButtons(page, 'Late-current overview');
    await go(page, 'План');
    await noButtons(page, 'Late-current plan');
    await page.screenshot({ path: resolve(output, `portal-plan-late-${viewport.width}x${viewport.height}.png`), fullPage: true });
    await openStep(page, page.locator('[data-portal-task="statements"]'), 'statements', 'docs');
    assert.equal(await page.locator('button').count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Выбрать файл', exact: true }).count(), 1);
    results.push({ viewport, lateCurrentActionAboveFold: Boolean(visible), documentStepHasOnlyFileAction: true });
    await context.close();
  }
  assert.deepEqual(lateFailures, [], 'The current step stays visible after completed tasks');
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedApi, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors, unexpectedApi }, null, 2));
  console.log(JSON.stringify({ results, errors, unexpectedApi }, null, 2));
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
