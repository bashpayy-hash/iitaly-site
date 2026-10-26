import { portalRoadState } from './portal-review-navigation.mjs';
import { editorialContrastFindings } from './portal-editorial-contrast.mjs';
// User-requested regression review: choose universities inside the existing
// portal step, keep the complete map/comparison, and continue the real route.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'REVIEW_TOOLS must point to isolated browser tools.');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const root = resolve('out'), output = resolve('design-review/portal-university-selection');
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
const results = [], errors = [], unexpectedApi = [];
const accounts = { 'TEST-01': 'Testov', 'TEST-02': 'Drugoy' };
const picker = page => page.locator('[data-portal-universities]');
const save = page => page.locator('[data-shortlist-save]');
const nav = (page, name) => page.getByRole('link', { name, exact: true }).filter({ visible: true });
const select = (page, id) => page.locator(`[data-university-select="${id}"]`);
function fixture(surname) {
  return { ok: true, client: { name: 'Синтетический профиль', surname, intakeYear: 2027, onboardingComplete: true, profile: { education: 'NIS Grade 12', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', educationPath: 'university_kz', onboardingDone: true } },
    roadmap: [{ id: 'start', title: 'Старт', tasks: [
      { id: 'profile', t: 'Заполнить профиль', available: true, owner: 'Ты' },
      { id: 'shortlist', t: 'Выбрать программы', explain: 'Сравни программы и выбери подходящие.', available: true, owner: 'Ты', time: '15 мин' },
      { id: 'family-budget', t: 'Обсудить бюджет', available: true, owner: 'Ты + родители' },
    ] }, { id: 'documents', title: 'Документы', tasks: [{ id: 'statements', t: 'Подготовить банковскую выписку', available: false, owner: 'Ты', timingLabel: 'Сначала выбрать программы' }] }],
    done: { profile: true }, docs: {}, progress: { done: 1, total: 4, pct: 25 } };
}
async function setup(width, { failSave = false, blockedStorage = false, height = width === 390 ? 844 : 900 } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', locale: 'ru-RU' });
  const data = Object.fromEntries(Object.entries(accounts).map(([code, surname]) => [code, fixture(surname)]));
  const calls = [], lookups = [];
  let failuresRemaining = failSave ? 1 : 0;
  if (blockedStorage) await context.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (/shortlist|university|universities/i.test(key)) throw new DOMException('Synthetic storage quota failure', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/api/event') return json({ ok: true });
    if (url.pathname === '/health/ai') return json({ ok: true, code: 'AI_READY' });
    if (url.pathname === '/api/portal/lookup') {
      const body = request.postDataJSON();
      assert.equal(body.surname, accounts[body.code]);
      lookups.push(body);
      return json(data[body.code]);
    }
    const profile = url.pathname.match(/^\/api\/portal\/(TEST-0[12])\/profile$/);
    if (profile) {
      const code=profile[1], body=request.postDataJSON();
      assert.equal(body.surname,accounts[code]);
      assert(Array.isArray(body.universityIds));
      data[code].client.profile.universityIds=body.universityIds;
      return json(data[code]);
    }
    const match = url.pathname.match(/^\/api\/portal\/(TEST-0[12])\/task$/);
    if (match) {
      const code = match[1], body = request.postDataJSON();
      assert.deepEqual(body, { surname: accounts[code], task: 'shortlist', value: true }, 'Existing completion contract has no unimplemented university/profile fields');
      calls.push({ code, body });
      if (failuresRemaining > 0) { failuresRemaining -= 1; return json({ ok: false, error: 'Синтетический сбой сохранения' }, 503); }
      data[code].done.shortlist = true;
      data[code].progress = { done: 2, total: 4, pct: 50 };
      return json({ ok: true, done: data[code].done, progress: data[code].progress });
    }
    if (url.pathname.startsWith('/api/')) unexpectedApi.push(url.pathname);
    if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    return route.abort(); // Synthetic fixtures only. No real account or paid service.
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await login(page, 'TEST-01');
  return { page, context, calls, data, lookups };
}
async function login(page, code) {
  await page.goto(`${origin}/portal?auth=login`, { waitUntil: 'networkidle' });
  // The explicit auth URL opens login after client hydration; wait for its field.
  await page.getByLabel('Фамилия', { exact: true }).fill(accounts[code]);
  await page.getByLabel('Код доступа', { exact: true }).fill(code);
  await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
  await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
}
async function openPicker(page) {
  await page.goto(`${origin}/portal?view=plan&task=shortlist`, { waitUntil: 'networkidle' });
  await picker(page).waitFor();
  await page.locator('[data-portal-university-picker]').waitFor();
  assert.equal(new URL(page.url()).pathname, '/portal');
  assert.equal(new URL(page.url()).searchParams.get('task'), 'shortlist');
  assert.equal(await page.getByRole('banner').count(), 1, 'Embedded catalogue does not duplicate the site header');
  assert.equal(await picker(page).locator('a[href="/universities"]').count(), 0, 'The picker has no detour to the public catalogue');
  assert.equal(await save(page).count(), 1, 'Only one explicit action saves the selected universities');
}
async function chooseMilan(page) {
  await picker(page).getByRole('combobox', { name: 'Сразу к городу', exact: true }).selectOption('milano');
  await select(page, 'bocconi').waitFor();
}
async function assertNoOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, label);
}
async function assertSaveVisible(page) {
  const visible = await save(page).evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.width >= 44 && box.height >= 44 && box.top >= 0 && box.bottom <= innerHeight &&
      box.left >= 0 && box.right <= innerWidth && element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
  });
  assert(visible, 'Save is visible, unobstructed and at least 44px at every scroll position');
}
async function logout(page) {
  await nav(page, 'Настройки').click();
  await nav(page, 'Выйти').click();
  await page.locator('[data-local-workspace]').waitFor();
}

try {
  for (const width of [1440, 390]) {
    const { context, page, calls, data } = await setup(width);
    await openPicker(page);
    assert.equal(await save(page).isDisabled(), true, 'An empty shortlist cannot complete the step');
    await assertSaveVisible(page);
    await page.evaluate(() => document.fonts.ready);
    const initialChoice = await picker(page).getByRole('combobox', { name: 'Сразу к городу', exact: true }).evaluate(element => {
      const box = element.getBoundingClientRect(), saveBar = document.querySelector('[data-shortlist-selection]').getBoundingClientRect(), save = document.querySelector('[data-shortlist-save]').getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, viewport: innerHeight, saveTop: saveBar.top, saveButton: { x: save.x, y: save.y, width: save.width, height: save.height, bottom: save.bottom } };
    });
    assert(initialChoice.bottom < initialChoice.viewport - 70 && initialChoice.bottom < initialChoice.saveTop, 'The first city choice is visible and not covered by Save');
    await page.screenshot({ path: resolve(output, `selection-initial-${width}.png`), fullPage: false });
    const map = picker(page).getByRole('group', { name: 'Карта Италии с университетами по городам', exact: true });
    await map.getByRole('button', { name: 'Милан — показать университеты', exact: true }).focus();
    await page.keyboard.press('Enter');
    await select(page, 'bocconi').waitFor();
    assert.equal(await map.getByRole('button', { name: 'Милан — показать университеты', exact: true }).getAttribute('aria-pressed'), 'true', 'Keyboard map selection opens the existing city panel');
    await picker(page).getByRole('button', { name: 'Технические', exact: true }).click();
    assert.equal(await select(page, 'bocconi').count(), 0, 'Existing catalogue filters still work in the portal');
    assert.equal(await select(page, 'polimi').count(), 1);
    await picker(page).getByRole('button', { name: 'Все вузы', exact: true }).click();
    const selectionPosition = await select(page, 'bocconi').evaluate(element => {
      const label = element.closest('label').getBoundingClientRect();
      const details = element.closest('[data-uni-card]').querySelector('dl').getBoundingClientRect();
      return { height: label.height, beforeDetails: label.bottom <= details.top };
    });
    assert(selectionPosition.beforeDetails && selectionPosition.height >= 44, 'The clearly named shortlist action comes before the card details');
    if (width === 1440) {
      const rows = await picker(page).locator('[data-uni-card] dl').evaluateAll(lists => lists.slice(0, 2).map(list => [...list.querySelectorAll('dt')].map(row => row.getBoundingClientRect().top)));
      assert(rows.length === 2 && rows[0].every((top, index) => Math.abs(top - rows[1][index]) < 1), 'Cost, exams and scholarship rows align across neighbouring cards');
    }
    await select(page, 'bocconi').check();
    await page.waitForFunction(() => !document.querySelector('[data-shortlist-save]').disabled);
    await assertSaveVisible(page);
    await page.screenshot({ path: resolve(output, `selection-chosen-${width}.png`), fullPage: false });
    assert.equal(await save(page).isEnabled(), true);
    assert.equal(calls.length, 0, 'Selecting a city or university never silently completes the step');
    await picker(page).getByRole('navigation', { name: 'Выбор университетов' }).getByRole('link', { name: 'Сравнение', exact: true }).click();
    await picker(page).getByRole('combobox', { name: 'Университет 1', exact: true }).selectOption('bocconi');
    await picker(page).getByRole('combobox', { name: 'Университет 2', exact: true }).selectOption('polimi');
    const table = picker(page).locator('[data-university-comparison]');
    assert.equal(await table.locator('[data-comparison-row]').count(), 12, 'The full existing comparison is retained');
    const budget = table.locator('[data-comparison-row=period]');
    const twelveMonths = await budget.innerText();
    await table.getByRole('combobox', { name: 'Бюджет жизни за', exact: true }).selectOption('10');
    assert.notEqual(await budget.innerText(), twelveMonths, 'The 10/12 month budget comparison remains interactive');
    await table.getByRole('checkbox', { name: 'Только различия', exact: true }).check();
    assert((await table.locator('[data-comparison-row]').count()) < 12, 'The existing differences filter works');
    assert.equal(await select(page, 'polimi').isChecked(), false, 'Comparison candidates are separate from the saved shortlist');
    assert.equal(await select(page, 'bocconi').isChecked(), true);
    await assertSaveVisible(page);
    await assertNoOverflow(page, `Embedded map/comparison at ${width}px`);
    await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[data-portal-universities]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
    assert.deepEqual(await editorialContrastFindings(page, violations), [], `Embedded selection accessibility ${width}px`);
    await page.screenshot({ path: resolve(output, `selection-comparison-${width}.png`), fullPage: true });
    await save(page).click();
    await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
    assert.equal(new URL(page.url()).pathname, '/portal', 'Save continues inside the portal');
    assert.equal((await portalRoadState(page)).current, 'family-budget', 'The next real route step appears after server confirmation');
    assert.equal(calls.length, 1);
    assert.equal(data['TEST-01'].done.shortlist, true);
    await page.screenshot({ path: resolve(output, `next-step-${width}.png`), fullPage: true });
    await openPicker(page);
    await chooseMilan(page);
    assert.equal(await select(page, 'bocconi').isChecked(), true, 'Completed shortlist remains editable');
    assert.equal(await page.locator('[data-portal-road]').count(),0,'University selection has no global route');
    assert.equal(await save(page).isDisabled(), true, 'An unchanged completed list cannot trigger a redundant save');
    assert.equal(await select(page, 'polimi').isChecked(), false, 'Comparison is never promoted to selection');
    await select(page, 'polimi').check();
    await save(page).click();
    await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
    assert.equal(calls.length, 1, 'Editing an already completed shortlist does not send a redundant task mutation');
    await page.reload({ waitUntil: 'networkidle' });
    await openPicker(page);
    await chooseMilan(page);
    assert.equal(await select(page, 'bocconi').isChecked(), true);
    assert.equal(await select(page, 'polimi').isChecked(), true, 'Saved selection survives a complete reload');
    await logout(page);
    await login(page, 'TEST-02');
    await openPicker(page);
    await chooseMilan(page);
    assert.equal(await select(page, 'bocconi').isChecked(), false, 'Another account on the same browser cannot inherit the previous shortlist');
    assert.equal(await select(page, 'polimi').isChecked(), false);
    assert.equal(await save(page).isDisabled(), true);
    await logout(page);
    await login(page, 'TEST-01');
    await openPicker(page);
    await chooseMilan(page);
    assert.equal(await select(page, 'bocconi').isChecked(), true, 'Returning to the original account restores only its own shortlist');
    assert.equal(await select(page, 'polimi').isChecked(), true);
    results.push({ width, initialChoice, embeddedMapAndFilters: true, fullComparison: true, comparisonSeparateFromSelection: true, singleExplicitSave: true, nextStepAfterConfirmation: true, completedSelectionEditable: true, reloadPersistsSelection: true, sameBrowserAccountIsolation: true, overflow: false, axe: 'pass' });
    await context.close();
  }
  {
    const { context, page } = await setup(390, { height: 667 });
    await openPicker(page);
    await assertSaveVisible(page);
    const city = picker(page).getByRole('combobox', { name: 'Сразу к городу', exact: true });
    const usable = await city.evaluate(element => {
      const box = element.getBoundingClientRect();
      return box.top > 0 && box.bottom < innerHeight - 70 && document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2) === element;
    });
    assert(usable, 'A 390×667 phone can choose a city immediately without scrolling or an overlapping Save bar');
    await page.screenshot({ path: resolve(output, 'selection-initial-390x667.png'), fullPage: false });
    results.push({ viewport: '390×667', cityChoiceAboveFoldAndUnobstructed: true });
    await context.close();
  }
  for (const failure of ['server', 'storage']) {
    const { context, page, calls, data } = await setup(390, { failSave: failure === 'server', blockedStorage: failure === 'storage' });
    await openPicker(page);
    await chooseMilan(page);
    await select(page, 'bocconi').check();
    await save(page).click();
    if(failure==='storage') {
      await page.locator('[data-portal-overview]').waitFor();
      assert.deepEqual(data['TEST-01'].client.profile.universityIds,['bocconi'],'Backend persistence works even if the local fallback is unavailable');
      assert.equal(data['TEST-01'].done.shortlist,true);
      assert.equal(calls.length,1);
      results.push({failure,backendPersistence:true});
      await context.close();continue;
    }
    await page.locator('#portal-panel [role=alert]').waitFor();
    assert.equal(data['TEST-01'].done.shortlist, undefined, 'A failed save never completes the step');
    assert.equal(await select(page, 'bocconi').isChecked(), true, 'A failed save preserves the selected draft');
    assert.equal((await portalRoadState(page)).current, 'shortlist');
    {
      assert.equal(calls.length, 1);
      await page.reload({ waitUntil: 'networkidle' });
      await picker(page).waitFor();
      await chooseMilan(page);
      assert.equal(await select(page, 'bocconi').isChecked(), true, 'A server failure retains the durable local selection for retry');
      await save(page).click();
      await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
      assert.equal(calls.length, 2, 'An explicit retry alone repeats the completion request');
      assert.equal((await portalRoadState(page)).current, 'family-budget');
    }
    results.push({ failure, noFalseCompletion: true, selectedDraftPreserved: true, explicitRetryOnly: true });
    await context.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedApi, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors, unexpectedApi }, null, 2));
  console.log(JSON.stringify({ results, errors, unexpectedApi }, null, 2));
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
