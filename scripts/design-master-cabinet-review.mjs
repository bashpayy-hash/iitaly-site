import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { portalStage } from './portal-review-navigation.mjs';

// A master's applicant in the paid cabinet. Owner, 23 Nov, on the first
// version of the master's track: «Нет, ты уже в вопросе должен понять, что
// типа вот человек магистр, и… перенаправлять его автоматически на магистрский
// трек… если когда человек в вопросе первоначально нажимает на магистратуру,
// ты должен понять, что это уже магистратура… Не должны быть такие детского
// формата вопросы, это уже серьезный человек, который закончил или
// заканчивает бакалавр».
// What this review holds:
//   1. The profile form asks the level first and shows nothing else before
//      that tap; after «Магистратура» it asks about the diploma and the
//      applicant's own budget, never about school, a family's comfort or a
//      path after 11 classes.
//   2. The answers it sends are the ones the server accepts.
//   3. The roadmap the server sends is written for a school leaver («аттестат»,
//      «вступительный тест (TOLC, IMAT…)»): a master's profile reads its own
//      words for those steps, and a bachelor's profile reads them as before.
//   4. Settings name the diploma, not «Студент вуза КЗ» and «Путь 12 лет».
//   5. «…И все данные потом через код ты и пополни»: someone who answered the
//      questionnaire on the site opens the form on her own level with those
//      answers marked, and a line says where they came from.
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out'), output = resolve('design-review/master-cabinet');
await mkdir(output, { recursive: true });

const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.svg':'image/svg+xml', '.webp':'image/webp', '.avif':'image/avif', '.png':'image/png', '.woff2':'font/woff2' };
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

// The server's own texts (roadmap.js), as it sends them to every profile.
const step = (id, t, explain, more = {}) => ({ id, t, explain, owner: 'Ты', available: true, ...more });
const serverRoadmap = () => [
  { id: 'start', title: 'Старт', tasks: [
    step('profile', 'Расскажи о себе', 'Этап учёбы, цель и бюджет помогают убрать лишние шаги и расставить задачи по порядку.'),
    step('shortlist', 'Выбрать программы и вузы', 'Соберём короткий список программ под твои оценки, бюджет и направление.', { ai: true }),
  ] },
  { id: 'docs', title: 'Документы', tasks: [
    step('apostille', 'Поставить апостиль на аттестат или диплом', 'Апостиль подтверждает документ для использования за границей. Его делают на оригинал до перевода.', { warn: 'Сначала оригинал и апостиль, потом перевод.' }),
    step('cimea', 'Получить признание аттестата (CIMEA)', 'CIMEA подтверждает уровень иностранного образования для части итальянских вузов.', { note: 'Начинай только когда на руках есть финальный документ об образовании.' }),
  ] },
  { id: 'apply', title: 'Поступление', tasks: [
    step('test', 'Подготовиться и зарегистрироваться на вступительный тест', 'У программы может быть TOLC, IMAT или собственный тест. Подготовка идёт параллельно с документами.', { short_explainer: 'У каждой программы свои условия экзамена и записи на него.' }),
    step('uniApply', 'Подать заявки в выбранные вузы', 'У каждого вуза свой портал и свой набор документов.'),
  ] },
  { id: 'arrival', title: 'После приезда', tasks: [step('codice', 'Получить codice fiscale', 'Итальянский налоговый код нужен для многих бытовых процедур.')] },
];
// The lists the server accepts (server.js, PROFILE_VALUES): anything else is a 400.
const accepted = { education: ['11 классов', 'НИШ / 12 лет', 'Студент вуза КЗ', 'Бакалавр'], goal: ['Бакалавриат', 'Магистратура'], budget: ['Только со стипендией', 'До 1 млн ₸/год', 'До 3 млн ₸/год', 'Без ограничений'] };
const progress = data => { const tasks = data.roadmap.flatMap(stage => stage.tasks); const done = tasks.filter(task => data.done[task.id]).length; return { done, total: tasks.length, pct: Math.round(done / tasks.length * 100) }; };

async function open(width, profile, answers) {
  const data = { ok: true, client: { name: 'Алия', surname: 'Testov', intakeYear: 2027, tgLinked: false, notify: { telegram: false }, onboardingComplete: Boolean(profile), profile: profile || {} }, roadmap: serverRoadmap(), done: profile ? { profile: true } : {}, docs: {} };
  const saved = [], unexpected = [];
  const phone = width < 600;
  const context = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, hasTouch: phone, isMobile: phone, reducedMotion: 'reduce', locale: 'ru-RU' });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url()), json = value => route.fulfill({ json: value });
    if (url.pathname === '/api/event') return json({ ok: true });
    if (url.pathname === '/health/ai') return json({ ok: true, code: 'AI_READY' });
    if (url.pathname === '/api/portal/lookup') return json({ ...data, progress: progress(data) });
    if (url.pathname === '/api/portal/TEST-01/profile') {
      const body = request.postDataJSON();
      saved.push(body);
      for (const [key, values] of Object.entries(accepted)) if (body[key] !== undefined && !values.includes(body[key])) return route.fulfill({ status: 400, json: { ok: false, error: `Недопустимое значение: ${key}` } });
      data.client.profile = { education: body.education, goal: body.goal, budget: body.budget, onboardingDone: true };
      data.client.onboardingComplete = true; data.done.profile = true;
      return json({ ...data, progress: progress(data) });
    }
    if (url.pathname.startsWith('/api/')) unexpected.push(url.pathname);
    return url.origin === origin && !url.pathname.startsWith('/api/') ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  // The questionnaire answered on the site before the purchase, if any.
  if (answers) await page.addInitScript(draft => localStorage.setItem('iitaly_plan_draft_v1', draft), JSON.stringify({ answers, step: 10, complete: true }));
  await page.goto(origin + '/portal?auth=login', { waitUntil: 'networkidle' });
  await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
  await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
  await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
  await page.locator(profile ? '[data-portal-overview]' : '[data-portal-profile]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  return { page, context, saved, unexpected, errors };
}
const words = async locator => (await locator.allTextContents()).join(' ').replace(/\s+/g, ' ');
const school = /11 класс|NIS|школ|аттестат|комфортен семье|Foundation|вступительн|TOLC|IMAT|экзамен/i;

try {
  for (const width of [1440, 390]) {
    // 1. The profile form: the level first.
    const { page, context, saved, unexpected, errors } = await open(width);
    const form = page.locator('[data-portal-profile] form');
    const question = id => form.locator(`[data-profile-question="${id}"]`);
    assert.equal(await form.locator('[data-profile-prefilled]').count(), 0, `${width}: with no questionnaire on the device nothing is marked for the applicant`);
    assert.deepEqual(await form.locator('fieldset legend').allInnerTexts(), ['Куда поступаешь?'], `${width}: before the first tap the form asks only the level`);
    assert.doesNotMatch(await words(form), /11 класс|NIS|комфортен семье/, `${width}: nothing about school before the applicant says who she is`);
    assert.match(await words(question('goal')), /диплом бакалавра есть или скоро будет/, `${width}: the master's answer says whom it is for`);

    // A school leaver is asked as before, with the path after 11 classes.
    await question('goal').getByText('Бакалавриат', { exact: true }).click();
    assert.deepEqual(await form.locator('fieldset legend').allInnerTexts(), ['Куда поступаешь?', 'Что у тебя с образованием?', 'Какой бюджет комфортен семье?']);
    await question('education').getByText('11 классов', { exact: true }).click();
    await form.getByText('Выбери путь после 11 классов', { exact: true }).waitFor();

    // The level changed: the master's own two questions, and the school answer is not carried over.
    await question('goal').getByText('Магистратура', { exact: true }).click();
    assert.deepEqual(await form.locator('fieldset legend').allInnerTexts(), ['Куда поступаешь?', 'Диплом бакалавра уже получен?', 'Какой бюджет на год учёбы и жизни?'], `${width}: a master's applicant is asked about her diploma and her budget`);
    assert.equal(await question('education').getAttribute('data-profile-track'), 'master');
    assert.deepEqual(await question('education').locator('strong').allInnerTexts(), ['Да, диплом на руках', 'Пока нет, заканчиваю учёбу']);
    assert.equal(await question('education').locator('input:checked').count(), 0, `${width}: a school answer does not stay marked in a master's profile`);
    assert.doesNotMatch(`${await words(question('education'))} ${await words(question('budget'))}`, school, `${width}: the master's questions are not worded for a school leaver`);
    assert.equal(await form.getByText('Выбери путь после 11 классов', { exact: true }).count(), 0, `${width}: no path after 11 classes for a graduate`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `${width}: the form has no sideways scroll`);

    // The school answer is not sent either: the form asks for the diploma.
    await question('budget').getByText('До 3 млн ₸ в год', { exact: true }).click();
    await form.getByRole('button', { name: 'Построить маршрут', exact: true }).click();
    assert.equal(await form.getByRole('alert').innerText(), 'Ответь про диплом и бюджет.');
    assert.deepEqual(saved, [], `${width}: nothing is saved without the diploma answer`);
    await page.screenshot({ path: resolve(output, `profile-${width}.png`), fullPage: true });

    // 2. What is sent is what the server accepts.
    await question('education').getByText('Пока нет, заканчиваю учёбу', { exact: true }).click();
    await form.getByRole('button', { name: 'Построить маршрут', exact: true }).click();
    await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
    assert.deepEqual(saved, [{ surname: 'Testov', education: 'Студент вуза КЗ', goal: 'Магистратура', budget: 'До 3 млн ₸/год', educationPath: null, onboardingDone: true }], `${width}: the saved profile`);

    // 3. The roadmap in the master's words.
    const main = page.locator('#main');
    await portalStage(page, 'docs');
    const docs = await words(main);
    assert.match(docs, /Поставить апостиль на диплом и приложение/, `${width}: the apostille step names the diploma`);
    assert.match(docs, /Готовишь диплом и приложение с оценками для Италии/, `${width}: the stage line names the diploma`);
    assert.doesNotMatch(docs, /аттестат/i, `${width}: no school certificate on a master's documents stage`);
    await page.screenshot({ path: resolve(output, `docs-${width}.png`), fullPage: true });
    await portalStage(page, 'apply');
    const apply = await words(main);
    assert.match(apply, /Выполнить условия отбора программы/, `${width}: the selection step is the master's own`);
    assert.match(apply, /Узнаёшь, как программа отбирает в магистратуру/, `${width}: the stage line is the master's own`);
    assert.doesNotMatch(apply, /вступительн|TOLC|IMAT|экзамен/i, `${width}: no entrance exam on a master's admission stage`);
    await page.screenshot({ path: resolve(output, `apply-${width}.png`), fullPage: true });
    // The step's own page: the title, the short line and the detail.
    await page.goto(`${origin}/portal?view=plan&task=test`, { waitUntil: 'networkidle' });
    await page.locator('#portal-step-heading').waitFor();
    assert.equal(await page.locator('#portal-step-heading').innerText(), 'Выполнить условия отбора программы');
    const detail = await words(main);
    assert.match(detail, /как программа отбирает в магистратуру|условия отбора/, `${width}: the step explains the master's selection`);
    assert.doesNotMatch(detail, /вступительн|TOLC|IMAT/i, `${width}: the step's page has no school test`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `${width}: the step's page has no sideways scroll`);

    // 4. Settings name the diploma.
    await page.goto(`${origin}/portal?view=settings`, { waitUntil: 'networkidle' });
    const tile = page.locator('[data-settings-tile=profile]');
    await tile.waitFor();
    const profile = (await tile.innerText()).replace(/\s+/g, ' ');
    assert.match(profile, /Диплом бакалавра Будет до начала магистратуры/, `${width}: settings name the diploma`);
    assert.doesNotMatch(profile, /Студент вуза КЗ|Путь 12 лет/, `${width}: no school rows in a master's settings`);
    // Editing the profile opens the same form already on the master's questions.
    await tile.getByRole('link', { name: 'Изменить профиль', exact: true }).click();
    await page.locator('[data-portal-profile] form').waitFor();
    assert.deepEqual(await page.locator('[data-portal-profile] form fieldset legend').allInnerTexts(), ['Куда поступаешь?', 'Диплом бакалавра уже получен?', 'Какой бюджет на год учёбы и жизни?']);
    assert.equal(await page.locator('[data-portal-profile] [data-profile-question=education] input:checked').getAttribute('value'), 'Студент вуза КЗ', `${width}: the saved answer is marked`);
    assert.deepEqual(unexpected, [], `${width}: no other server call`);
    assert.deepEqual(errors, [], `${width}: no page errors`);
    await context.close();

    // 3, the other side: a bachelor's profile reads the server's words as before.
    const school11 = await open(width, { education: 'НИШ / 12 лет', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', onboardingDone: true });
    await portalStage(school11.page, 'apply');
    const bachelor = await words(school11.page.locator('#main'));
    assert.match(bachelor, /вступительный тест/, `${width}: a bachelor's applicant still reads about the entrance test`);
    assert.doesNotMatch(bachelor, /Выполнить условия отбора программы|отбирает в магистратуру/, `${width}: and nothing of the master's wording`);
    assert.deepEqual(school11.errors, [], `${width}: no page errors (bachelor)`);
    await school11.context.close();
    // 5. The questionnaire's answers open the form on the applicant's level.
    const answered = await open(width, undefined, { goal: 'Магистратура', education: 'Бакалавр', major: 'same', field: 'Инженерия и IT', grades: 'хорошист', intake: '2027/28', lang: 'есть сертификат', budget: 'До 1 млн ₸/год', residence: 'kz', dsuRegion: 'other' });
    const filled = answered.page.locator('[data-portal-profile] form');
    assert.deepEqual(await filled.locator('fieldset legend').allInnerTexts(), ['Куда поступаешь?', 'Диплом бакалавра уже получен?', 'Какой бюджет на год учёбы и жизни?'], `${width}: the form opens on the master's questions`);
    assert.deepEqual(await filled.locator('input:checked').evaluateAll(inputs => inputs.map(input => input.value)), ['Магистратура', 'Бакалавр', 'До 1 млн ₸/год'], `${width}: the questionnaire's answers are marked`);
    assert.match(await filled.locator('[data-profile-prefilled]').innerText(), /из твоей анкеты/, `${width}: a line says where the marked answers came from`);
    assert.deepEqual(answered.saved, [], `${width}: nothing is saved before «Построить маршрут»`);
    await answered.page.screenshot({ path: resolve(output, `prefilled-${width}.png`), fullPage: true });
    await filled.getByRole('button', { name: 'Построить маршрут', exact: true }).click();
    await answered.page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
    assert.deepEqual(answered.saved, [{ surname: 'Testov', education: 'Бакалавр', goal: 'Магистратура', budget: 'До 1 млн ₸/год', educationPath: null, onboardingDone: true }], `${width}: one tap saves them`);
    assert.deepEqual(answered.errors, [], `${width}: no page errors (prefilled)`);
    await answered.context.close();
    // A school leaver's answer with no profile value («Колледж») leaves that question open.
    const college = await open(width, undefined, { goal: 'Бакалавриат', intake: '2027/28', education: 'Колледж', budget: 'До 3 млн ₸/год' });
    assert.deepEqual(await college.page.locator('[data-portal-profile] form input:checked').evaluateAll(inputs => inputs.map(input => input.value)), ['Бакалавриат', 'До 3 млн ₸/год'], `${width}: an answer the profile cannot hold is asked`);
    await college.context.close();
    // A profile the server already holds is never overwritten by the device's answers.
    const kept = await open(width, { education: 'НИШ / 12 лет', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', onboardingDone: true }, { goal: 'Магистратура', education: 'Бакалавр', budget: 'До 1 млн ₸/год' });
    await kept.page.goto(`${origin}/portal?view=settings`, { waitUntil: 'networkidle' });
    await kept.page.locator('[data-settings-tile=profile]').getByRole('link', { name: 'Изменить профиль', exact: true }).click();
    assert.deepEqual(await kept.page.locator('[data-portal-profile] form input:checked').evaluateAll(inputs => inputs.map(input => input.value)), ['Бакалавриат', 'НИШ / 12 лет', 'До 3 млн ₸/год'], `${width}: the saved profile wins over the device's answers`);
    assert.equal(await kept.page.locator('[data-profile-prefilled]').count(), 0);
    await kept.context.close();
    results.push({ width, passed: true });
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  server.close();
}
