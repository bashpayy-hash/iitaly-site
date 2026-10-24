import { portalDestination, portalTask } from './portal-review-navigation.mjs';
// User-requested regression: every IITALY tool stays in the authenticated
// portal. Official sources and Telegram remain explicit external destinations.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'REVIEW_TOOLS must point to isolated browser tools.');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const root = resolve('out'), output = resolve('design-review/portal-contained-flow');
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer(async (request, response) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return response.writeHead(403).end();
    for (const file of [path, `${path}.html`, resolve(path, 'index.html')]) {
      if (await stat(file).then(value => value.isFile()).catch(() => false)) {
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
const results = [], errors = [], unexpectedApi = [], unexpectedService = [];
let activePage;
const nav = (page, name) => page.getByRole('link', { name, exact: true }).filter({ visible: true });
const detail = page => page.locator('[data-step-detail]');
const overview = page => page.locator('[data-portal-overview]');
const roadmap = [
  { id: 'start', title: 'Старт', tasks: [
    { id: 'profile', t: 'Заполнить профиль', owner: 'Ты', available: true },
    { id: 'shortlist', t: 'Выбрать университеты', owner: 'Ты', available: true, time: '15 мин' },
    { id: 'chances', t: 'Оценить шансы на стипендию', owner: 'родители', available: true, time: '5 мин' },
  ] },
  { id: 'documents', title: 'Документы', tasks: [
    { id: 'apostille', t: 'Подготовить аттестат с апостилем', owner: 'Ты', available: true },
    { id: 'checkDocs', t: 'Проверить комплект документов', owner: 'Ты', available: true },
  ] },
  { id: 'arrival', title: 'После приезда', tasks: [
    { id: 'kit', t: 'Подготовить заявление на вид на жительство', owner: 'Ты', available: true },
    { id: 'codice', t: 'Получить налоговый код', owner: 'Ты', available: true },
  ] },
];
const allTasks = roadmap.flatMap(stage => stage.tasks);
function progress(data) {
  const total = allTasks.length, done = allTasks.filter(task => data.done[task.id]).length;
  return { done, total, pct: Math.round(done / total * 100) };
}
function fixture(current) {
  const currentIndex = allTasks.findIndex(task => task.id === current);
  const data = {
    ok: true,
    client: { name: 'Синтетический профиль', surname: 'Testov', intakeYear: 2027, onboardingComplete: true, profile: { education: 'НИШ / 12 лет', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', onboardingDone: true } },
    roadmap: structuredClone(roadmap),
    done: Object.fromEntries(allTasks.slice(0, currentIndex).map(task => [task.id, true])),
    docs: {},
  };
  if (currentIndex > allTasks.findIndex(task => task.id === 'apostille')) {
    const result = { verdict: 'ok', summary: 'Синтетический аттестат прошёл проверку.', checks: [{ label: 'Читаемость', status: 'ok', note: 'Тестовый сохранённый разбор.' }], problems: [], nextSteps: ['Сверь требования получателя.'] };
    data.docs.apostille = { verdict: 'ok', fileName: 'synthetic-certificate.pdf', summary: result.summary, result };
  }
  return data;
}
async function setup(width, current = 'shortlist') {
  const data = fixture(current), calls = [], profileCalls = [], navigations = [], popups = [];
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce', locale: 'ru-RU' });
  let page;
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (page && request.isNavigationRequest() && request.frame() === page.mainFrame()) navigations.push(url.pathname);
    const json = body => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/api/event') return json({ ok: true });
    if (url.pathname === '/health/ai') return json({ ok: true, code: 'AI_READY' });
    if (url.pathname === '/api/portal/lookup') {
      assert.deepEqual(request.postDataJSON(), { code: 'TEST-01', surname: 'Testov' });
      return json({ ...data, progress: progress(data) });
    }
    if (url.pathname === '/api/portal/TEST-01/task') {
      const body = request.postDataJSON();
      assert.equal(body.surname, 'Testov');
      assert(allTasks.some(task => task.id === body.task));
      assert.equal(typeof body.value, 'boolean');
      assert.deepEqual(Object.keys(body).sort(), ['surname', 'task', 'value']);
      calls.push(body);
      data.done[body.task] = body.value;
      return json({ ok: true, done: data.done, progress: progress(data) });
    }
    if (url.pathname === '/api/portal/TEST-01/profile') {
      const body = request.postDataJSON();
      profileCalls.push(body);
      assert.equal(body.surname, 'Testov');
      const profile = { ...body };
      delete profile.surname;
      data.client.profile = { ...data.client.profile, ...profile };
      return json({ ...data, progress: progress(data) });
    }
    if (url.pathname.startsWith('/api/')) unexpectedApi.push(url.pathname);
    if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    unexpectedService.push(`${url.origin}${url.pathname}`);
    return route.abort(); // No live accounts, lead capture, document AI, or external services.
  });
  page = await context.newPage();
  activePage = page;
  page.on('pageerror', error => errors.push(error.message));
  page.on('popup', popup => popups.push(popup.url()));
  await page.goto(`${origin}/portal?auth=login`, { waitUntil: 'networkidle' });
  // Guest workspace is the default; explicitly connect the cloud fixture.
    if (!await page.getByLabel('Фамилия', { exact: true }).count()) await page.getByRole('link', { name: 'Подключить облачный кабинет ↗', exact: true }).click();
    await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
  await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
  await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
  await overview(page).waitFor({ state: 'attached' });
  await page.evaluate(() => { window.__containedFlowDocument = true; });
  function contained(label) {
    assert.equal(new URL(page.url()).pathname, '/portal', label);
    assert.deepEqual(navigations, ['/portal'], `${label}: no second top-level document request`);
    assert.deepEqual(popups, [], `${label}: no new tab`);
    assert.equal(context.pages().length, 1, `${label}: one browser tab`);
  }
  return { page, context, data, calls, profileCalls, contained };
}
async function openTask(page, id) {
  await portalDestination(page, 'План');
  await portalTask(page, id);
  await page.locator(`[data-step-detail="${id}"]`).waitFor();
}
async function checkAndCapture(page, name, width, { axe = true } = {}) {
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${name} at ${width}px has no horizontal overflow`);
  assert.equal(await page.evaluate(() => window.__containedFlowDocument), true, 'The original portal document and session remain mounted');
  if (axe) {
    if (!await page.evaluate(() => Boolean(window.axe))) await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
    assert.deepEqual(violations, [], `${name} accessibility at ${width}px`);
  }
  // A fixed modal is a viewport surface; a full-document shot would shrink it
  // into the middle of a very long university list and hide the useful review.
  await page.screenshot({ path: resolve(output, `${name}-${width}.png`), fullPage: name !== 'university-rules' });
}
async function assertFuture(page, id) {
  await openTask(page, id);
  assert.match(await detail(page).innerText(), /Сначала:/);
  assert.equal(await detail(page).locator('button, input, select, [data-primary-action], [data-portal-assessment], [data-permesso-editor]').count(), 0, `Future ${id} has no executable tool or completion control`);
}

try {
  for (const width of [1440, 390]) {
    {
      const { page, context, calls, contained } = await setup(width);
      for (const id of ['chances', 'checkDocs', 'kit']) await assertFuture(page, id);
      assert.equal(calls.length, 0, 'Opening future tasks does not report completion');
      await openTask(page, 'shortlist');
      const picker = page.locator('[data-portal-university-picker]');
      await picker.waitFor();
      await picker.getByRole('combobox', { name: 'Сразу к городу', exact: true }).selectOption('milano');
      await page.locator('[data-university-select="bocconi"]').check();
      await page.locator('[data-uni-card="bocconi"]').getByRole('button').first().focus();
      await page.keyboard.press('Enter');
      const modal = page.getByRole('dialog');
      await modal.waitFor();
      const rules = modal.locator('[data-portal-rules-disclosure]');
      await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement));
      // Chromium may restore focus to the selected checkbox on a narrow
      // viewport. Both valid entry points must lead to the rules by keyboard.
      if (!await rules.locator(':scope > summary').evaluate(element => document.activeElement === element)) await page.keyboard.press('Shift+Tab');
      assert.equal(await rules.locator(':scope > summary').evaluate(element => document.activeElement === element), true, 'The inline rules disclosure is reachable from initial modal focus');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await modal.getByRole('button', { name: 'Понятно', exact: true }).evaluate(element => document.activeElement === element), true, 'Shift+Tab wraps from the rules disclosure to the last modal action');
      await page.keyboard.press('Tab');
      assert.equal(await rules.locator(':scope > summary').evaluate(element => document.activeElement === element), true, 'Tab wraps back to the native disclosure summary');
      await page.keyboard.press('Enter');
      await rules.locator('[data-portal-rules]').waitFor();
      assert.equal(await rules.getAttribute('open') !== null, true, 'Rules open inside the university modal');
      assert.equal(await modal.locator('a[href="/changes-2026-27"]').count(), 0);
      await checkAndCapture(page, 'university-rules', width);
      await page.keyboard.press('Escape');
      await modal.waitFor({ state: 'hidden' });
      assert.equal(await page.locator('[data-uni-card="bocconi"]').getByRole('button').first().evaluate(element => document.activeElement === element), true, 'Escape closes the modal and restores its opening control');
      assert.equal(await page.locator('[data-university-select="bocconi"]').isChecked(), true, 'Reading the rules preserves the unsaved shortlist');
      assert.equal(calls.length, 0, 'Reading rules does not save or complete the shortlist');
      await nav(page, 'IITALY — личный кабинет').click();
      await overview(page).waitFor({ state: 'attached' });
      assert.equal(new URL(page.url()).search, '', 'The portal logo returns to its own overview');
      await page.goBack();
      await page.locator('[data-portal-universities]').waitFor();
      await page.goForward();
      await overview(page).waitFor({ state: 'attached' });
      contained('Shortlist, rules, logo and browser history');
      await portalDestination(page, 'План');
      assert.equal(await page.locator('[data-portal-focus] [data-portal-rules-disclosure]').count(), 0, 'The task card has no footer rules disclosure; university-specific rules remain in the university dialog');
      await checkAndCapture(page, 'plan-tasks', width);
      contained('Plan tasks');
      results.push({ width, futureStepsReadOnly: true, universityRulesInline: true, rulesKeyboardFocusTrap: true, unsavedSelectionPreserved: true, logoReturnsOverview: true, browserHistory: true, noTaskFooter: true });
      await context.close();
    }
    {
      const { page, context, calls, profileCalls, data, contained } = await setup(width, 'chances');
      await page.locator('[data-road-open]').click();
      const assessment = page.locator('[data-portal-assessment]');
      await assessment.waitFor();
      assert.equal(await assessment.locator('input[type="tel"], a[href="/plan"], a[href="/prices"]').count(), 0, 'The inline assessment has no lead gate or sales detour');
      await checkAndCapture(page, 'assessment-initial', width);
      let answered = 0;
      // The existing questionnaire supplies the choices. Choose a visible
      // option and explicitly continue; there is no silent profile mutation.
      while (!await assessment.locator('[data-assessment-result]').count()) {
        assert(answered < 20, 'Assessment must finish without a loop');
        const questionId = await assessment.locator('[data-assessment-question]').getAttribute('data-assessment-question');
        await assessment.getByRole('radio').first().check();
        await assessment.locator('[data-assessment-continue]').click();
        await page.waitForFunction(previous => document.querySelector('[data-assessment-question]')?.getAttribute('data-assessment-question') !== previous, questionId);
        answered += 1;
      }
      assert(answered > 0, 'The existing questionnaire is available inline');
      assert.equal(calls.length, 0, 'Finishing the questionnaire alone does not close the route step');
      assert.equal(profileCalls.length, 0, 'Assessment answers do not silently overwrite the saved profile');
      assert.match(await assessment.innerText(), /стипенд|DSU|Справки/);
      assert.equal(await assessment.locator('input[type="tel"], a[href="/prices"]').count(), 0);
      await checkAndCapture(page, 'assessment-result', width);
      await detail(page).getByRole('button', { name: 'Готово', exact: true }).click();
      await overview(page).waitFor({ state: 'attached' });
      assert.deepEqual(calls, [{ surname: 'Testov', task: 'chances', value: true }]);
      assert.equal(data.done.chances, true);
      assert.equal(await page.locator('[data-portal-road]').getAttribute('data-current-step'), 'apostille');
      contained('Assessment and explicit completion');
      results.push({ width, assessmentInline: true, questionsAnswered: answered, noLeadOrProfileMutation: true, completionAfterExplicitDone: true });
      await context.close();
    }
    {
      const { page, context, calls, contained } = await setup(width, 'checkDocs');
      await page.locator('[data-road-open]').click();
      await page.locator('[data-step-detail="checkDocs"] [data-document-list]').waitFor();
      await checkAndCapture(page, 'check-documents', width);
      await detail(page).locator('[data-document="apostille"]').click();
      await page.getByRole('region', { name: 'Разбор документа', exact: true }).waitFor();
      assert.equal(new URL(page.url()).searchParams.get('doc'), 'apostille');
      await checkAndCapture(page, 'saved-report', width);
      await page.getByRole('region', { name: 'Разбор документа', exact: true }).getByRole('link', { name: 'Назад', exact: true }).click();
      await page.locator('[data-step-detail="checkDocs"]').waitFor();
      assert.equal(new URL(page.url()).searchParams.get('task'), 'checkDocs', 'Report Back returns to the exact checkDocs task');
      // The document's Back action now traverses history instead of appending
      // another task entry. Forward reopens the report; Back returns to its task.
      await page.goForward();
      await page.getByRole('region', { name: 'Разбор документа', exact: true }).waitFor();
      await page.goBack();
      await page.locator('[data-step-detail="checkDocs"]').waitFor();
      assert.equal(calls.length, 0, 'Opening and reviewing saved files never completes a task');
      await detail(page).getByRole('button', { name: 'Готово', exact: true }).click();
      await overview(page).waitFor({ state: 'attached' });
      assert.deepEqual(calls, [{ surname: 'Testov', task: 'checkDocs', value: true }]);
      contained('Saved report roundtrip and checklist completion');
      results.push({ width, checkDocsInline: true, reportReturnsToTask: true, reportBrowserHistory: true, savedReportUnchanged: true });
      await context.close();
    }
    {
      const { page, context, calls, contained } = await setup(width, 'kit');
      await page.locator('[data-road-open]').click();
      const trainer = page.locator('[data-portal-permesso] [data-permesso-editor]');
      await trainer.waitFor();
      await trainer.getByRole('button', { name: 'Продление Rinnovo · карточка уже есть', exact: true }).click();
      await page.waitForFunction(() => new URLSearchParams(location.search).get('scenario') === 'rinnovo');
      await trainer.getByRole('button', { name: /^Страница 2:/ }).click();
      await page.waitForFunction(() => new URLSearchParams(location.search).get('page') === '2');
      const trainerLocation = new URL(page.url());
      assert.equal(trainerLocation.searchParams.get('view'), 'plan');
      assert.equal(trainerLocation.searchParams.get('task'), 'kit');
      assert.equal(trainerLocation.searchParams.get('scenario'), 'rinnovo');
      assert.equal(await trainer.getAttribute('data-scenario'), 'rinnovo');
      await page.goBack();
      await page.waitForFunction(() => new URLSearchParams(location.search).get('page') === '1');
      assert.equal(await trainer.getAttribute('data-scenario'), 'rinnovo');
      await page.goForward();
      await page.waitForFunction(() => new URLSearchParams(location.search).get('page') === '2');
      assert.equal(await page.locator('[data-step-detail="kit"]').count(), 1, 'Trainer history never replaces the portal shell');
      assert.equal(calls.length, 0, 'Editing the training scenario or page never completes the route task');
      await checkAndCapture(page, 'permesso-inline', width);
      contained('MOD. 209 page/scenario and browser history');
      results.push({ width, permessoInline: true, trainerUrlPreservesTask: true, trainerBrowserHistory: true, trainerDoesNotAutoComplete: true });
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedApi, []);
  assert.deepEqual(unexpectedService, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors, unexpectedApi, unexpectedService }, null, 2));
  console.log(JSON.stringify({ results, errors, unexpectedApi, unexpectedService }, null, 2));
} catch (error) {
  const focus = activePage && !activePage.isClosed() ? await activePage.evaluate(() => ({
    active: document.activeElement?.outerHTML,
    scripts: performance.getEntriesByType('resource').map(item => item.name).filter(name => /\/_next\/.*\.js/.test(name)),
    modal: [...document.querySelectorAll('[role="dialog"] a[href], [role="dialog"] summary, [role="dialog"] button, [role="dialog"] input')].map(element => ({ tag: element.tagName, text: element.textContent?.slice(0, 80), offsetParent: Boolean(element.offsetParent), tabIndex: element.tabIndex, display: getComputedStyle(element).display })),
  })).catch(() => null) : null;
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => {});
  await writeFile(resolve(output, 'failure.json'), JSON.stringify({ error: String(error), focus, results, errors, unexpectedApi, unexpectedService }, null, 2));
  throw error;
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
