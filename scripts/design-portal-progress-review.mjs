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

const stages = [
  ['Подготовка', ['Заполнить профиль', 'Выбрать направление', 'Проверить паспорт', 'Составить бюджет']],
  ['Выбор университета', ['Сравнить программы', 'Проверить язык обучения', 'Изучить вступительный тест', 'Сверить сроки', 'Выбрать университеты']],
  ['Документы и поступление', ['Получить аттестат', 'Заказать перевод', 'Проверить оформление', 'Подать заявку', 'Получить решение']],
  ['Стипендия', ['Уточнить конкурс', 'Собрать доходы семьи', 'Подготовить сведения об имуществе', 'Подать заявку на стипендию']],
  ['Виза', ['Подать предварительную заявку', 'Подготовить визовый пакет', 'Записаться на подачу', 'Получить паспорт с визой']],
  ['Переезд', ['Найти жильё', 'Купить билет', 'Подготовить kit', 'Завершить зачисление']],
];
const roadmap = stages.map(([title, tasks], stage) => ({ id: `stage-${stage + 1}`, title, tasks: tasks.map((t, task) => ({ id: `step-${stage + 1}-${task + 1}`, t, owner: 'Ты', available: true })) }));
const ids = roadmap.flatMap(stage => stage.tasks.map(task => task.id));
assert.equal(ids.length, 26);
function fixture(mode = 'partial') {
  const data = { ok: true, client: { name: 'Тестовый профиль', surname: 'Testov', intakeYear: 2027, onboardingComplete: true, profile: { onboardingDone: true } }, roadmap: structuredClone(roadmap), done: { [ids[0]]: true, 'obsolete-task': true }, docs: {} };
  if (mode === 'zero') data.done = {};
  if (mode === 'complete') data.done = Object.fromEntries([...ids, 'obsolete-task'].map(id => [id, true]));
  if (mode === 'empty') { data.roadmap = []; data.done = {}; }
  if (mode === 'blocked') data.roadmap.forEach(stage => stage.tasks.forEach(task => { task.available = false; }));
  if (mode === 'urgent') data.roadmap[4].tasks[0].daysLeft = 3;
  return data;
}
// Mirror the server contract: stale completion keys never contribute to progress.
function upstreamProgress(data) {
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  const total = tasks.length;
  const done = tasks.filter(task => data.done[task.id]).length;
  return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
}

async function openPortal(width, mode = 'partial') {
  const data = fixture(mode), calls = [];
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', locale: 'ru-RU' });
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
    return route.abort(); // Never submit credentials, task mutations, leads or payments to a real service.
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/portal`, { waitUntil: 'networkidle' });
  await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
  await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
  await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
  await page.getByRole('region', { name: 'Прогресс по плану', exact: true }).waitFor();
  return { context, page, calls };
}
const progressRegion = page => page.getByRole('region', { name: 'Прогресс по плану', exact: true });
async function checkProgress(page, done, total = 26) {
  const region = progressRegion(page), bar = region.getByRole('progressbar', { name: 'Выполнение плана', exact: true });
  await page.waitForFunction(({ done, total }) => {
    const bar = document.querySelector('[role="progressbar"][aria-label="Выполнение плана"]');
    return bar?.getAttribute('aria-valuenow') === String(done) && bar.getAttribute('aria-valuemax') === String(total);
  }, { done, total });
  assert.equal(await bar.getAttribute('aria-valuemin'), '0');
  assert.equal(await bar.getAttribute('aria-valuetext'), `Выполнено ${done} из ${total} шагов`);
  const text = await region.innerText();
  assert.match(text, new RegExp(`${done}\\s*(?:из|/)\\s*${total}(?!\\d)`));
  assert.match(text, new RegExp(`(?:^|\\D)${Math.round(done / total * 100)}\\s*%`));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Portal has no horizontal overflow');
}
async function openPlanWithKeyboard(page, stageId) {
  const button = progressRegion(page).getByRole('button', { name: 'Открыть план', exact: true });
  await button.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(id => {
    const summary = document.querySelector(`#portal-stage-${id} button[aria-expanded]`);
    return summary?.getAttribute('aria-expanded') === 'true' && document.activeElement === summary;
  }, stageId);
  assert.equal(await progressRegion(page).getByRole('button', { name: 'Открыть план', exact: true }).count(), 0);
}

try {
  for (const width of [1440, 768, 390, 320]) {
    const { context, page, calls } = await openPortal(width);
    await checkProgress(page, 1);
    await page.evaluate(() => document.fonts.ready);
    const regionBox = await progressRegion(page).boundingBox(), actionBox = await page.getByRole('region', { name: 'Главное действие', exact: true }).boundingBox();
    assert(regionBox && actionBox && regionBox.y + regionBox.height <= actionBox.y + 1, 'Progress appears above the main action');
    assert.match(await progressRegion(page).innerText(), /Этап:\s*Подготовка/);
    await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[aria-label="Прогресс по плану"]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
    assert.deepEqual(violations, [], `${width}px progress accessibility`);
    await page.screenshot({ path: resolve(output, `portal-progress-${width}.png`), fullPage: true });
    await openPlanWithKeyboard(page, 'stage-1');
    await checkProgress(page, 1);
    if (width === 1440) {
      const task = page.locator('#portal-stage-stage-1').getByRole('button', { name: /Выбрать направление/ });
      await task.click();
      await checkProgress(page, 2);
      await task.click();
      await checkProgress(page, 1);
      assert.deepEqual(calls.map(call => [call.task, call.value]), [['step-1-2', true], ['step-1-2', false]]);
      await page.getByRole('button', { name: 'Обзор', exact: true }).filter({ visible: true }).click();
      await checkProgress(page, 1);
    }
    results.push({ width, count: '1/26', staleKeyIgnored: true, keyboardFocus: true, overflow: false, axe: 'pass' });
    await context.close();
  }
  for (const mode of ['zero', 'complete', 'blocked', 'empty', 'urgent']) {
    const { context, page } = await openPortal(390, mode);
    if (mode === 'empty') {
      assert.equal(await progressRegion(page).getByRole('progressbar').count(), 0);
      assert.match(await progressRegion(page).innerText(), /В плане пока нет шагов/);
    } else {
      await checkProgress(page, mode === 'zero' ? 0 : mode === 'complete' ? 26 : 1);
      if (mode === 'complete') assert.match(await progressRegion(page).innerText(), /Все шаги маршрута отмечены/);
      if (mode === 'blocked') assert.match(await progressRegion(page).innerText(), /Остальные шаги будут доступны позже/);
      if (mode === 'urgent') {
        assert.match(await progressRegion(page).innerText(), /Этап:\s*Виза/);
        await openPlanWithKeyboard(page, 'stage-5');
      }
    }
    results.push({ state: mode, passed: true });
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
