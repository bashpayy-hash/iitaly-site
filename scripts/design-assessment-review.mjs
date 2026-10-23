// Focused regression for the post-questionnaire transition and readable results.
// All account and service traffic is synthetic; this never contacts a live user.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'Set REVIEW_TOOLS to isolated Playwright/axe tools.');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const root = resolve('out'), output = resolve('design-review/assessment');
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
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
const errors = [], unexpected = [], results = [];
const sampleAnswers = { intake: '2027/28', education: '11 классов', grades: 'отличник', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', field: 'Инженерия и IT', lang: 'есть сертификат', age: 'adult', residence: 'kz' };
let activePage;

async function setup({ width = 1440, reducedMotion = 'no-preference', cloud = false, lastQuestion = false } = {}) {
  const calls = [], profileCalls = [];
  const tasks = [
    { id: 'profile', t: 'Заполнить профиль', owner: 'Ты', available: true },
    { id: 'shortlist', t: 'Выбрать университеты', owner: 'Ты', available: true },
    // Retain the legacy server owner as a regression fixture, not display copy.
    { id: 'chances', t: 'Оценить шансы на стипендию', owner: 'родители', available: true },
    { id: 'apostille', t: 'Подготовить аттестат с апостилем', owner: 'Ты', available: true },
  ];
  const data = { ok: true, client: { name: 'Тестовый профиль', surname: 'Testov', intakeYear: 2027, onboardingComplete: true, profile: { education: 'НИШ / 12 лет', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', onboardingDone: true } }, roadmap: [{ id: 'start', title: 'Старт', tasks }], done: { profile: true, shortlist: true }, docs: {} };
  const response = () => ({ ...data, progress: { done: Object.values(data.done).filter(Boolean).length, total: tasks.length, pct: Object.values(data.done).filter(Boolean).length / tasks.length * 100 } });
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, reducedMotion, locale: 'ru-RU' });
  if (cloud || lastQuestion) await context.addInitScript(({ cloud, lastQuestion, answers }) => {
    if (cloud) { localStorage.setItem('iitaly_portal_code', 'TEST-01'); localStorage.setItem('iitaly_portal_surname', 'Testov'); }
    if (lastQuestion && !localStorage.getItem('iitaly_plan_draft_v1')) localStorage.setItem('iitaly_plan_draft_v1', JSON.stringify({ answers, step: 9, complete: false }));
  }, { cloud, lastQuestion, answers: sampleAnswers });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    const json = body => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/api/event') return json({ ok: true });
    if (url.pathname === '/health/ai') return json({ ok: true, code: 'AI_READY' });
    if (cloud && url.pathname === '/api/portal/lookup') return json(response());
    if (cloud && url.pathname === '/api/portal/TEST-01/task') {
      const body = request.postDataJSON();
      calls.push(body);
      assert.deepEqual(Object.keys(body).sort(), ['surname', 'task', 'value']);
      assert.equal(body.surname, 'Testov');
      data.done[body.task] = body.value;
      return json({ ok: true, done: data.done, progress: response().progress });
    }
    if (cloud && url.pathname === '/api/portal/TEST-01/profile') { profileCalls.push(request.postDataJSON()); return json(response()); }
    if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    unexpected.push(`${url.origin}${url.pathname}`);
    return route.abort();
  });
  const page = await context.newPage();
  activePage = page;
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__assessmentTransitionSeen = false;
    new MutationObserver(() => {
      if (document.querySelector('[data-assessment-preparing]')) window.__assessmentTransitionSeen = true;
    }).observe(document, { subtree: true, childList: true });
  });
  return { page, context, calls, profileCalls, data };
}

async function capture(page, name, preview = false) {
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${name}: no horizontal overflow`);
  await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.filter(item => ['serious', 'critical'].includes(item.impact)).map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) })));
  assert.deepEqual(violations, [], `${name}: accessibility`);
  const target = preview ? page.getByRole('button', { name: 'Открыть мой план', exact: true }) : page.locator('[data-assessment-result]').first();
  // Frame the result below the real sticky chrome, rather than centering a
  // multi-screen section and accidentally photographing only its middle.
  await target.evaluate(element => {
    const header = document.querySelector('header');
    const chrome = document.querySelector('[data-portal-chrome]') || (document.querySelector('[data-local-workspace]') ? header?.parentElement : header);
    const inset = chrome?.getBoundingClientRect().height || 0;
    window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - inset - 20, behavior: 'instant' });
  });
  await page.screenshot({ path: resolve(output, `${name}.png`), animations: 'disabled' });
}

async function answerPublic(page, count = 10) {
  const wizard = page.locator('[data-plan-wizard]');
  for (let index = 0; index < count; index++) {
    const question = wizard.locator('[data-plan-question]');
    const id = await question.getAttribute('data-plan-question');
    await wizard.locator('button[aria-pressed]').first().click();
    await page.waitForFunction(previous => document.querySelector('[data-plan-question]')?.getAttribute('data-plan-question') !== previous, id);
  }
}

async function assertTransition(page, { skip = false, reduced = false, preview = false } = {}) {
  const ready = preview ? page.getByRole('button', { name: 'Открыть мой план', exact: true }) : page.locator('[data-assessment-result]');
  const preparing = page.locator('[data-assessment-preparing]');
  if (reduced) {
    await ready.waitFor();
    assert.equal(await page.evaluate(() => window.__assessmentTransitionSeen), false, 'Reduced motion bypasses the animated transition');
  } else {
    await preparing.waitFor({ timeout: 1000 });
    assert.doesNotMatch(await preparing.innerText(), /\d+\s*%|проверя[юем]+\s+(?:вузы|документы)|рассчитыва[юем]+\s+шансы/i, 'Transition does not invent verification or probability');
    if (skip) await preparing.getByRole('button', { name: 'Показать план', exact: true }).click();
    await ready.waitFor({ timeout: 3000 });
    assert.equal(await preparing.count(), 0, 'Transition yields to the result');
  }
}

try {
  for (const width of (process.env.ASSESSMENT_ONLY === 'cloud' ? [] : [1440, 390])) {
    const { page, context } = await setup({ width });
    await page.goto(`${origin}/plan#questionnaire`, { waitUntil: 'networkidle' });
    await answerPublic(page);
    await assertTransition(page, { preview: true });
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')).complete), false, 'Preview does not silently complete the questionnaire');
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Открыть мой план', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.__assessmentTransitionSeen), false, 'Restored preview never repeats the transition');
    await page.getByRole('button', { name: 'Открыть мой план', exact: true }).click();
    await page.locator('[data-assessment-next-action]').waitFor();
    assert((await page.locator('[data-assessment-next-action]').innerText()).length > 30, 'A concrete first action is visible without opening an accordion');
    assert(await page.locator('[data-assessment-route]').isVisible(), 'Later route remains available');
    await capture(page, `public-result-${width}`);
    await page.getByRole('button', { name: 'Изменить ответы', exact: true }).click();
    assert.equal(await page.locator('[data-plan-question]').getAttribute('data-plan-question'), 'intake');
    await page.locator('[data-plan-wizard] button[aria-pressed]').nth(1).click();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')).answers.intake), '2026/27', 'Editing the first answer updates the persisted draft');
    results.push({ surface: 'public', width, automaticTransition: true, reloadWithoutTransition: true, editableAnswers: true });
    await context.close();
  }

  if (process.env.ASSESSMENT_ONLY !== 'cloud') {
    const { page, context } = await setup({ width: 390, lastQuestion: true });
    await page.goto(`${origin}/portal?view=plan&task=profile`, { waitUntil: 'networkidle' });
    await page.locator('[data-plan-question="dsuRegion"]').waitFor();
    await answerPublic(page, 1);
    await assertTransition(page, { skip: true, preview: true });
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')).complete), false, 'Skipping animation does not mark the local profile completed');
    await capture(page, 'local-preview-390', true);
    await page.getByRole('button', { name: 'Открыть мой план', exact: true }).click();
    await page.locator('[data-local-workspace]').waitFor();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')).complete), true, 'Only the explicit action completes the local profile');
    assert.equal(await page.evaluate(() => localStorage.getItem('iitaly_portal_code')), null, 'Local completion creates no cloud credentials');
    results.push({ surface: 'local', width: 390, skipWorks: true, explicitCompletion: true });
    await context.close();
  }

  for (const width of [1440, 390]) {
    const reduced = width === 390;
    const { page, context, calls, profileCalls, data } = await setup({ width, cloud: true, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await page.goto(`${origin}/portal?view=plan&task=chances`, { waitUntil: 'networkidle' });
    const assessment = page.locator('[data-portal-assessment]');
    await assessment.waitFor();
    const questions = [];
    while (await assessment.locator('[data-assessment-question]').count()) {
      assert(questions.length < 11, 'Questionnaire cannot loop');
      const id = await assessment.locator('[data-assessment-question]').getAttribute('data-assessment-question');
      questions.push(id);
      await assessment.getByRole('radio').first().check();
      await assessment.locator('[data-assessment-continue]').click();
      await page.waitForFunction(previous => document.querySelector('[data-assessment-question]')?.getAttribute('data-assessment-question') !== previous, id);
    }
    assert.deepEqual(questions, ['education', 'grades', 'goal', 'budget', 'field', 'lang', 'age', 'residence', 'dsuRegion'], 'The known intake is prefilled; all remaining questions are answered explicitly');
    await assertTransition(page, { reduced });
    assert.deepEqual(calls, [], 'Reading the assessment never calls task completion');
    assert.deepEqual(profileCalls, [], 'Assessment never overwrites the cloud profile');
    assert(await assessment.locator('[data-assessment-next-action]').isVisible(), 'Cloud assessment opens with an actionable first step');
    assert.doesNotMatch(await page.locator('main').innerText(), /попрос(?:ить|и)\s+родител|исполнитель\s*:?\s*родител/i, 'Legacy owner metadata no longer creates patronizing instructions');
    await capture(page, `cloud-result-${width}`);
    if (process.env.ASSESSMENT_AVATAR === '1') {
      const helper = page.locator('[data-portal-assistant]').filter({ visible: true });
      assert(await helper.locator('[data-vespi-assistant-avatar]').isVisible(), 'Portal helper uses the supplied Vespi avatar');
      await helper.click();
      const dialog = page.getByRole('dialog', { name: 'ИИ-консультант', exact: true });
      await dialog.waitFor();
      const avatar = dialog.locator('[data-vespi-assistant-avatar]');
      assert(await avatar.isVisible(), 'Chat header shows the same functional avatar');
      assert(await avatar.evaluate(image => image.complete && image.naturalWidth > 0), 'Avatar image loads');
      await page.screenshot({ path: resolve(output, `chat-avatar-${width}.png`), animations: 'disabled' });
      await dialog.getByLabel('Закрыть чат', { exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
    }
    await assessment.getByRole('button', { name: 'Изменить ответы', exact: true }).click();
    assert.equal(await assessment.locator('[data-assessment-question]').getAttribute('data-assessment-question'), 'intake');
    assert.equal(await assessment.getByRole('radio').first().isChecked(), true, 'Returning to edit preserves supplied answers');
    for (let index = 0; index < 10; index++) {
      const id = await assessment.locator('[data-assessment-question]').getAttribute('data-assessment-question');
      await assessment.locator('[data-assessment-continue]').click();
      await page.waitForFunction(previous => document.querySelector('[data-assessment-question]')?.getAttribute('data-assessment-question') !== previous, id);
    }
    await assessment.locator('[data-assessment-result]').waitFor();
    await assessment.locator('[data-assessment-complete]').click();
    await page.locator('[data-portal-overview]').waitFor();
    assert.deepEqual(calls, [{ surname: 'Testov', task: 'chances', value: true }], 'Only «Готово» completes exactly the current cloud task');
    assert.equal(data.done.chances, true);
    results.push({ surface: 'cloud', width, reducedMotion: reduced, noAutomaticMutation: true, preservedAnswers: true, explicitCompletion: true });
    await context.close();
  }
  assert.deepEqual(errors, [], 'No browser errors');
  assert.deepEqual(unexpected, [], 'No live services or unexpected APIs');
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors, unexpected }, null, 2));
  console.log(JSON.stringify({ ok: true, scenarios: results.length, results }, null, 2));
} catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
