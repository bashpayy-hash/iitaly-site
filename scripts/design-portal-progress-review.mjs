import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'REVIEW_TOOLS must point to the isolated browser tools.');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const root = resolve('out'), output = resolve(process.env.PORTAL_RELEASE_CAPTURE ? 'design-review/after' : 'design-review/portal-progress');
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
let activePage;

const roadmap = [
  { id: 'start', title: 'Старт', tasks: [
    { id: 'profile', t: 'Заполнить профиль', available: true, owner: 'Ты' },
    { id: 'shortlist', ai: true, t: 'Выбрать программы', explain: 'Сравни программы и выбери подходящие.', time: '15 мин', available: true, owner: 'Ты', deadline: '2026-11-15', deadlineKind: 'application', daysLeft: 30 },
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
  if (mode === 'onboarding') { data.client.onboardingComplete = false; data.client.profile = {}; data.done = {}; }
  if (mode === 'profile') { data.client.profile.education = 'НИШ / 12 лет'; delete data.client.profile.educationPath; }
  if (mode === 'complete') data.done = Object.fromEntries([...ids, 'obsolete-task'].map(id => [id, true]));
  if (mode === 'empty') { data.roadmap = []; data.done = {}; }
  if (mode === 'blocked') data.roadmap.forEach(stage => stage.tasks.forEach(task => { task.available = false; }));
  if (mode === 'near') data.roadmap[0].tasks[1].daysLeft = 3;
  if (mode === 'dates') {
    data.roadmap[1].tasks[0].deadline = '2026-10-15'; data.roadmap[1].tasks[0].daysLeft = 2;
    data.roadmap[1].tasks[1].daysLeft = -1; // Missing date must not become an invented deadline.
    data.roadmap[3].tasks[0].deadline = '2026-10-19'; data.roadmap[3].tasks[0].daysLeft = 6;
  }
  if (mode === 'parents') data.done.shortlist = true;
  if (mode === 'parent-file') { data.roadmap = [{ id: 'documents', title: 'Документы', tasks: [{ id: 'familyDocs', t: 'Собрать семейные справки', owner: 'родители', available: true }, { id: 'insurance', t: 'Подготовить страховку', owner: 'Ты', available: true }] }]; data.done = {}; }
  if (mode === 'manual') { data.roadmap[0].tasks[1] = { id: 'manual-task', t: 'Подготовить сведения', explain: 'Подготовь сведения для выбранной программы.', available: true, owner: 'Ты' }; }
  if (mode === 'last') { data.roadmap = [{ id: 'arrival', title: 'Переезд', tasks: [{ id: 'manual-task', t: 'Подготовить сведения', available: true, owner: 'Ты' }] }]; data.done = {}; }
  if (mode === 'full-route') {
    // Real backend stage names and conditional first-year route distribution.
    // Keep this a local synthetic fixture, never import or call the live backend.
    data.roadmap = [
      ['start', 'Старт', ['profile', 'shortlist', 'chances']],
      ['education12', '12 лет образования', ['path12', 'enroll12']],
      ['docs', 'Документы', ['apostille', 'translate', 'notary', 'cimea', 'checkDocs']],
      ['apply', 'Поступление', ['test', 'uniApply', 'universitaly', 'checkpoint1']],
      ['dsu', 'Стипендия и льготы (DSU)', ['familyDocs', 'iseeu', 'dsuApply', 'checkpoint2']],
      ['visa', 'Виза', ['money', 'statements', 'insurance', 'housing', 'blsSlot', 'visaSubmit', 'checkpoint3']],
      ['arrival', 'После приезда', ['kit', 'codice', 'questura']],
    ].map(([id, title, taskIds]) => ({ id, title, tasks: taskIds.map(taskId => ({ id: taskId, t: taskId === 'shortlist' ? 'Выбрать программы и вузы' : `Подготовить шаг: ${title}`, owner: 'Ты', available: true })) }));
  }
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
async function siteBrand(page, contentSelector) {
  await page.evaluate(() => document.fonts.ready);
  const logo = page.getByRole('link', { name: 'IITALY — главная', exact: true });
  assert.equal(await logo.count(), 1, 'The shared site logo appears once, including after login');
  return logo.evaluate((element, selector) => {
    const style = getComputedStyle(element), dot = element.querySelector('span');
    return {
      logo: { fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, letterSpacing: style.letterSpacing, color: style.color },
      dot: { text: dot?.textContent, color: dot && getComputedStyle(dot).color },
      headerHeight: element.closest('header').getBoundingClientRect().height,
      bodyFont: getComputedStyle(document.querySelector(selector)).fontFamily,
    };
  }, contentSelector);
}
async function checkSharedBrand(page, loginBrand, contentSelector) {
  // User-requested site continuity: compare the actual shared login chrome,
  // rather than duplicating marketing tokens in this review.
  assert.deepEqual(await siteBrand(page, contentSelector), loginBrand, 'Portal and onboarding keep the site logo, header proportions and text font after login');
  const header = page.locator('[data-portal-header]');
  assert.equal(await header.count(), 1, 'Authenticated screens use one shared site header');
  assert.equal(await page.getByRole('banner').count(), 1, 'No duplicate global header is introduced');
  assert.equal(await header.locator('nav, details, button').count(), 0, 'The shared portal header does not add public-site navigation or competing buttons');
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
  activePage = page;
  if (captureAssistantEvent) await page.addInitScript(() => { window.addEventListener('iitaly:open-chat', event => { window.__portalAssistantEvent = event.detail; event.stopImmediatePropagation(); }, true); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/portal`, { waitUntil: 'networkidle' });
  const loginBrand = await siteBrand(page, '[data-portal-login]');
  assert.equal(loginBrand.dot.text, '.', 'The site wordmark retains its literal red dot');
  await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
  await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
  await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
  if (mode === 'onboarding') await page.locator('[data-portal-profile]').waitFor();
  else await waitForOverview(page);
  assert.equal(await page.evaluate(() => window.scrollY), 0, 'The login form scroll position does not hide the new current step');
  await checkSharedBrand(page, loginBrand, mode === 'onboarding' ? '[data-portal-profile]' : '[data-portal-overview]');
  if (mode === 'onboarding') assert.equal(await road(page).count(), 0, 'A route guide appears only after the initial route is built');
  else await checkPersistentRoad(page);
  if (mode !== 'onboarding') await checkArtwork(page, 'study');
  return { context, page, calls, chatCalls, profileCalls, fileCalls, loginBrand };
}
const overview = page => page.locator('[data-portal-overview]');
const road = page => page.locator('[data-portal-road]');
const detail = page => page.locator('[data-step-detail]');
const navigation = page => page.locator('nav[aria-label="Разделы личного кабинета"], [aria-label="Разделы кабинета"]').filter({ visible: true });
const assistant = page => page.locator('a[data-portal-assistant]');
async function waitForOverview(page) {
  // A completed or empty route has no optional overview rows. The visible
  // route guide now lives in shared chrome, so do not require an empty section
  // to have artificial height just to observe the navigation transition.
  await overview(page).waitFor({ state: 'attached' });
  await road(page).waitFor();
}
async function checkArtwork(page, expectedScene) {
  // Decode only the visible responsive variant; hidden desktop/mobile copies
  // stay lazy. A missing asset must fail the review rather than make a blank shot.
  const images = page.locator('[data-portal-art] img').filter({ visible: true });
  // A newly mounted lazy image may not have selected its responsive source yet.
  // Wait for that load before decode(), which otherwise races the srcSet change.
  await page.waitForFunction(() => [...document.querySelectorAll('[data-portal-art] img')]
    .filter(image => image.getBoundingClientRect().width > 0 && image.getBoundingClientRect().height > 0)
    .every(image => image.complete && image.naturalWidth > 0 && image.currentSrc), { }, { timeout: 10000 });
  const visible = await images.evaluateAll(async elements => Promise.all(elements.map(async image => {
    await image.decode();
    const artwork = image.closest('[data-portal-art]');
    return {
      scene: artwork.dataset.portalArt,
      hidden: artwork.getAttribute('aria-hidden'),
      alt: image.getAttribute('alt'),
      width: Number(image.getAttribute('width')),
      height: Number(image.getAttribute('height')),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      src: image.getAttribute('src'),
      selectedSrc: new URL(image.currentSrc).pathname,
      srcSet: image.getAttribute('srcset'),
      sizes: image.getAttribute('sizes'),
      lazy: image.loading,
      pointerEvents: getComputedStyle(artwork).pointerEvents,
      inSidebar: Boolean(artwork.closest('aside')),
      inMain: Boolean(artwork.closest('main')),
      inChrome: Boolean(artwork.closest('[data-portal-chrome]')),
      objectFit: getComputedStyle(image).objectFit,
      interactive: Boolean(artwork.closest('a, button')) || Boolean(artwork.querySelector('a, button, [tabindex]')),
    };
  })));
  for (const image of visible) {
    assert.equal(image.hidden, 'true', 'Portal artwork is decorative and hidden from assistive technology');
    assert.equal(image.alt, '', 'Decorative images do not repeat page content');
    assert(image.width > 0 && image.height > 0, 'Artwork reserves intrinsic dimensions before loading');
    const expectedRatio = ['study', 'route'].includes(image.scene) ? 4 / 3 : 1;
    assert(['study', 'route', 'campus', 'documents'].includes(image.scene), 'Artwork uses an approved contextual scene');
    assert.equal(image.width, 512);
    assert.equal(image.height, expectedRatio === 1 ? 512 : 384, 'The intrinsic box reserves the actual scene ratio');
    assert(image.naturalWidth > 0 && image.naturalHeight > 0 && Math.abs(image.naturalWidth / image.naturalHeight - image.width / image.height) < 0.005, 'The loaded responsive asset matches its intrinsic ratio without distortion');
    assert.equal(image.objectFit, 'contain', 'The full illustration remains visible without cropping');
    assert([256, 512].some(size => image.selectedSrc === `/illustrations/editorial/portal-${image.scene}-${size}.webp`), 'The browser selected a local responsive WebP');
    assert.equal(image.src, `/illustrations/editorial/portal-${image.scene}-256.webp`);
    assert.equal(image.srcSet, `/illustrations/editorial/portal-${image.scene}-256.webp 256w, /illustrations/editorial/portal-${image.scene}-512.webp 512w`, 'Artwork uses local responsive assets');
    assert(image.sizes, 'The browser can choose the appropriately sized asset');
    assert.equal(image.lazy, 'lazy');
    assert.equal(image.pointerEvents, 'none', 'Artwork cannot intercept the current action');
    assert.equal(image.interactive, false, 'Artwork introduces no additional action');
    assert.equal(image.inMain, true, 'Contextual artwork belongs to the current screen content');
    assert.equal(image.inSidebar, false, 'An unrelated illustration no longer repeats below the navigation');
    assert.equal(image.inChrome, false, 'Decorative imagery does not enlarge the persistent progress guide');
  }
  assert.equal(visible.length, expectedScene ? 1 : 0, 'Each main screen has one contextual scene; detail and settings screens do not repeat it');
  if (expectedScene) {
    const expected = visible.filter(image => image.scene === expectedScene);
    assert.equal(expected.length, 1, `One ${expectedScene} illustration is visible`);
  }
}
async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, label);
}
async function noButtons(page, label) {
  assert.equal(await page.locator('button').count(), 0, `${label}: no buttons exist, including navigation and hidden launchers`);
  assert.equal(await page.locator('[role="button"]').count(), 0, `${label}: links must not disguise secondary buttons`);
  assert.doesNotMatch(await page.locator('main').innerText(), /Спросить про этот шаг|Не понятно — спросить|Открыть план|Открыть разбор|Загрузить документ/);
}
async function checkPersistentRoad(page, { currentOpen = false, afterScroll = false } = {}) {
  const shell = page.locator('[data-portal-progress-shell]');
  assert.equal(await shell.count(), 1, 'One shared progress guide remains on every authenticated route screen');
  assert.equal(await road(page).count(), 1, 'The overview and current screen must not duplicate the global guide');
  assert.equal(await shell.locator('[data-portal-road]').count(), 1, 'The guide lives in the shared top chrome');
  assert.equal(await page.locator('main [data-portal-road]').count(), 0, 'The overview no longer repeats the road in its content');
  const layout = await shell.evaluate(element => {
    const chrome = element.closest('[data-portal-chrome]');
    const header = chrome?.querySelector('[data-portal-header]');
    const box = element.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, height: box.height,
      headerBottom: header?.getBoundingClientRect().bottom,
      chromeTop: chrome?.getBoundingClientRect().top,
      position: chrome && getComputedStyle(chrome).position,
      cssTop: chrome && parseFloat(getComputedStyle(chrome).top),
      scrollY: window.scrollY,
    };
  });
  assert.equal(layout.position, 'sticky', 'Header and progress share one sticky container');
  assert.equal(layout.cssTop, 0, 'The shared chrome pins to the top without a guessed header offset');
  assert(Math.abs(layout.chromeTop) <= 1, 'The shared header remains at the viewport top');
  assert(layout.top >= layout.headerBottom - 1 && layout.top <= layout.headerBottom + 1, 'Progress sits directly below the site header');
  assert(layout.height <= 210, 'The persistent progress guide stays compact even when a parent task title wraps');
  assert(layout.bottom <= page.viewportSize().height * 0.5, 'The guide leaves at least half of a short phone viewport for the actual screen');
  if (afterScroll) assert(layout.scrollY >= 80, 'Sticky positioning is checked after a real content scroll');
  if (currentOpen) {
    assert.equal(await road(page).evaluate(element => element.tagName), 'DIV', 'An open current step has a static guide instead of a second action');
    assert.equal(await road(page).getAttribute('href'), null);
    assert.equal(await road(page).locator('a, button, [role="button"]').count(), 0, 'The static guide has no hidden competing action');
    assert.equal(await road(page).getAttribute('data-road-static'), 'true');
  }
  await noOverflow(page, 'The persistent progress guide does not cause horizontal scrolling');
}
async function checkStickyScroll(page, label, { currentOpen = false, requireScroll = true, capture = false } = {}) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await checkPersistentRoad(page, { currentOpen });
  const before = await page.locator('[data-portal-progress-shell]').boundingBox();
  const available = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  if (requireScroll) assert(available >= 80, `${label} has enough real content to exercise sticky positioning`);
  if (available >= 80) {
    await page.evaluate(() => window.scrollTo({ top: Math.min(480, document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }));
    await page.waitForFunction(() => window.scrollY >= 80);
    await checkPersistentRoad(page, { currentOpen, afterScroll: true });
    const after = await page.locator('[data-portal-progress-shell]').boundingBox();
    assert(Math.abs(before.y - after.y) <= 1 && Math.abs(before.height - after.height) <= 1, `${label}: progress remains visible in the same position while the content scrolls`);
    if (capture) await page.screenshot({ path: resolve(output, `portal-sticky-${label}.png`), fullPage: false });
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}
async function checkRoad(page, title, done, total) {
  const card = road(page);
  await checkPersistentRoad(page);
  assert.match(await card.innerText(), new RegExp(title));
  assert.equal(Number(await card.getAttribute('data-road-done')), done, 'Only existing route steps contribute to completion');
  assert.equal(Number(await card.getAttribute('data-road-total')), total, 'The denominator comes from this user’s real roadmap');
  assert.match(await card.innerText(), new RegExp(`сделано ${done} из ${total}(?!\\d)`, 'i'));
  assert.equal(await page.getByRole('progressbar').count(), 0, 'The road replaces the generic percentage bar');
  assert.doesNotMatch(await overview(page).innerText(), /\d+\s*%|Проверены:|Не загружены:|Параллельно|Следом|Telegram/);
  const current = page.locator('[data-current-step]');
  assert.equal(await page.locator('button').count(), 0, 'The whole road is a navigation link, with no overview buttons');
  if (await current.count()) {
    assert.equal(await current.evaluate(element => element.tagName), 'A');
    assert.equal(await current.locator('a, button').count(), 0, 'No secondary action is nested on the road');
    assert.match(await current.getAttribute('aria-label'), /^Дальше: .+\. Открыть этот шаг\.$/);
  }
  const links = overview(page).locator('a:not([data-portal-road])');
  assert((await links.count()) <= 1, 'Only the optional document clarification is a link below the road');
  assert.equal(await overview(page).locator('a').filter({ hasText: 'Потом' }).count(), 0, 'The next step is plain text');
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
    assert(box && box.y >= page.viewportSize().height * 0.75 && box.y + box.height <= page.viewportSize().height + 1, 'The three mobile sections remain visible at the bottom after scrolling');
  }
}
async function checkSettings(page) {
  await page.getByRole('heading', { name: 'Настройки', exact: true }).waitFor();
  assert.equal(await page.getByRole('heading', { name: 'Данные для маршрута', exact: true }).isVisible(), true);
  assert.equal(await page.getByText('NIS Grade 12', { exact: true }).isVisible(), true);
  assert.equal(await page.locator('#notifications').getAttribute('data-telegram-status'), 'disconnected');
  assert.equal(await page.locator('#notifications').locator('summary').innerText(), 'Напоминания выключены');
  assert.equal(await page.locator('#notifications').getByRole('button', { name: 'Подключить Telegram', exact: true, includeHidden: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Выйти', exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Настройки', exact: true }).getAttribute('aria-current'), 'page');
  assert.equal(await page.locator('[data-settings-back]').isVisible(), true);
  assert((await page.locator('button').count()) <= 1, 'Settings obey the page button limit');
  await noOverflow(page, 'Settings have no horizontal overflow');
  await checkNavigation(page);
  await checkPersistentRoad(page);
}
async function checkRoadMotion(page, reduced = true) {
  const card = road(page);
  assert.equal(await card.getAttribute('data-traveling'), 'false', 'Initial presentation never drives the scooter');
  const motion = await card.locator('[data-road-scooter], [data-road-fill], [data-road-spokes], [data-road-body], [data-road-text]').evaluateAll(elements => elements.map(element => ({
    animation: getComputedStyle(element).animationName,
    transition: getComputedStyle(element).transitionDuration,
  })));
  assert(motion.length >= 2, 'The scooter and fill are independently inspectable');
  if (reduced) for (const style of motion) {
    assert.equal(style.animation, 'none', 'Reduced motion disables every road animation');
    assert(style.transition.split(',').every(value => parseFloat(value) === 0), 'Reduced motion updates immediately');
  }
}
async function go(page, name) {
  await navigation(page).getByRole('link', { name, exact: true }).click();
  await checkPersistentRoad(page);
  await checkArtwork(page, { 'Обзор': 'study', 'План': 'route', 'Документы': 'documents' }[name]);
}
async function openStep(page, locator, id, screen = 'plan') {
  if (await locator.evaluate(element => element.tagName === 'BUTTON')) {
    assert.equal(await locator.getAttribute('data-current-step'), id, 'The road opens its named current step');
    await locator.click();
  } else {
    const link = await locator.evaluate(element => element.tagName === 'A') ? locator : locator.getByRole('link');
    assert.equal(await link.count(), 1, 'A task has exactly one navigation path');
    const href = new URL(await link.getAttribute('href'), origin);
    assert.equal(href.pathname, '/portal');
    assert.equal(href.searchParams.get('view'), screen);
    assert.equal(href.searchParams.get(screen === 'docs' ? 'doc' : 'task'), id);
    await link.click();
  }
  await page.locator(`[data-step-detail="${id}"]`).waitFor();
  assert.equal(new URL(page.url()).searchParams.get(screen === 'docs' ? 'doc' : 'task'), id);
  assert.equal(await assistant(page).getAttribute('data-step-id'), id, 'Header assistant receives the open step ID');
  const isCurrent = await road(page).getAttribute('data-current-step') === id;
  await checkPersistentRoad(page, { currentOpen: isCurrent });
  if (!isCurrent && await road(page).getAttribute('data-current-step')) {
    assert.equal(await road(page).evaluate(element => element.tagName), 'A', 'A future or completed step still points to the actual next action');
    assert.notEqual(new URL(await road(page).getAttribute('href'), origin).searchParams.get(screen === 'docs' ? 'doc' : 'task'), id, 'The persistent guide never calls a future or completed step current');
  }
}

try {
  if (process.env.PORTAL_RELEASE_CAPTURE) {
    async function capture(page, name, mode, width) {
      await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); await new Promise(requestAnimationFrame); });
      await page.mouse.move(0, 0);
      await checkArtwork(page, { overview: 'study', plan: 'route', documents: 'documents' }[name]);
      await noOverflow(page, `${name} ${mode} ${width}px`);
      await page.screenshot({ path: resolve(output, `${name}-${mode}-${width}.png`), fullPage: true });
      results.push({ name, mode, width, overflow: false, buttons: await page.locator('button').count() });
    }
    for (const width of [1440, 390]) {
      const viewport = { width, height: width === 390 ? 844 : 900 };
      const { context, page } = await openPortal(viewport);
      await capture(page, 'overview', 'partial', width);
      await go(page, 'План');
      await capture(page, 'plan', 'partial', width);
      await page.locator('[data-portal-task=shortlist]').click();
      await detail(page).waitFor();
      await capture(page, 'step', 'partial', width);
      await go(page, 'Документы');
      await capture(page, 'documents', 'partial', width);
      await page.getByRole('link', { name: 'Настройки', exact: true }).click();
      await capture(page, 'settings', 'partial', width);
      await context.close();
      for (const mode of ['onboarding', 'near', 'parent-file', 'late-current']) {
        const { context, page } = await openPortal(viewport, mode);
        if (mode === 'onboarding') assert.equal(await page.getByRole('button', { name: 'Построить маршрут', exact: true }).count(), 1);
        await capture(page, mode === 'onboarding' ? 'onboarding' : 'overview', mode, width);
        await context.close();
      }
    }
  } else {
  for (const viewport of process.env.NAVIGATION_REVIEW_LATE_ONLY ? [] : [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 390, height: 667 }, { width: 320, height: 740 }]) {
    const { context, page, calls } = await openPortal(viewport);
    const label = `${viewport.width}x${viewport.height}`;
    await checkRoad(page, 'Старт', 1, ids.length);
    await checkNavigation(page);
    assert.match(await page.locator('main').innerText(), /Привет, Тестовый профиль/);
    assert.match(await page.locator('main').innerText(), /Поступление: сентябрь 2027/);
    await checkRoadMotion(page);
    assert.deepEqual(await road(page).locator('[data-road-stage]').evaluateAll(elements => elements.map(element => ({ id: element.dataset.roadStage, state: element.dataset.roadStageState, position: parseFloat(element.style.left) }))), [
      { id: 'start', state: 'current', position: 8 },
      { id: 'documents', state: 'future', position: 44 },
      { id: 'visa', state: 'future', position: 68 },
      { id: 'arrival', state: 'future', position: 80 },
    ], 'Stage points start at the actual cumulative task offset, independent of completion');
    const scooterPosition = await road(page).locator('[data-road-scooter]').evaluate(element => parseFloat(element.style.transform.match(/translateX\(([^%]+)/)[1]));
    assert.equal(scooterPosition, 20, 'The scooter uses 8% + (real done / total) × 84%');
    assert.equal(await page.getByRole('link', { name: 'Выйти', exact: true }).count(), 0, 'Logout belongs to settings');
    const current = page.locator('[data-current-step="shortlist"]');
    assert.equal(await current.count(), 1, 'A near-dated future stage cannot replace the current step');
    assert.match(await current.innerText(), /Дальше/);
    assert.match(await current.innerText(), /Ориентир.*15 ноя 2026/);
    assert.match(await page.locator('[data-near-orientirs]').innerText(), /Ближайшие сроки/);
    assert.match(await page.locator('[data-orientir-task=visa-task]').innerText(), /Собрать визовый пакет.*Ориентир:/s);
    assert.equal(await page.locator('[data-near-orientirs] a, [data-near-orientirs] button').count(), 0, 'Nearby dates do not create competing future-step actions');
    assert.equal(await page.locator('[data-orientir-task=shortlist]').count(), 0, 'The current date appears once, on the road');
    assert.equal(await overview(page).locator('[data-overview-document]').count(), 0, 'No document line is shown when no document exists');
    await page.evaluate(() => document.fonts.ready);
    const rowBox = await current.boundingBox();
    assert(rowBox && rowBox.y >= 0 && rowBox.y + rowBox.height <= viewport.height, `The current action verb is above the fold at ${label}`);
    assert.match(await current.innerText(), /Выбрать программы/);
    // The user now wants a compact guide that stays at the top on every
    // screen, replacing the oversized overview hero. Preserve readable type
    // without requiring a 26px title that makes the pinned chrome too tall.
    const hierarchy = await page.locator('[data-road-step-title]').evaluate(element => ({
      action: parseFloat(getComputedStyle(element).fontSize),
      greeting: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      metadata: parseFloat(getComputedStyle(element.closest('[data-road-text]').lastElementChild).fontSize),
    }));
    assert(hierarchy.action >= 18 && hierarchy.action >= hierarchy.greeting, `${label}: the compact current action is readable and at least as prominent as the identity line (${JSON.stringify(hierarchy)})`);
    assert(hierarchy.metadata >= 13, 'Current-step guidance is readable without zoom');
    await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await window.axe.run({ include: [['[data-portal-chrome]'], ['[data-portal-overview]']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
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
    assert.match(await page.locator('[data-portal-task="family-budget"]').innerText(), /родител/i);
    for (const task of await page.locator('[data-portal-task]').all()) {
      const tag = await task.evaluate(element => element.tagName);
      assert.equal(tag === 'A' ? 1 : await task.getByRole('link').count(), 1, 'Each plan row is a single link');
    }
    await page.screenshot({ path: resolve(output, `portal-plan-${label}.png`), fullPage: true });
    if (viewport.width === 390 && viewport.height === 844) {
      await page.emulateMedia({ forcedColors: 'active' });
      const activeTab = await navigation(page).locator('[aria-current=page]').evaluate(element => {
        const style = getComputedStyle(element);
        return { width: parseFloat(style.borderBottomWidth), style: style.borderBottomStyle, color: style.borderBottomColor };
      });
      assert(activeTab.width >= 2 && activeTab.style === 'solid' && activeTab.color !== 'rgba(0, 0, 0, 0)', 'The active tab stays marked when forced colors remove shadows');
      const toggles = page.locator('#portal-panel details > summary').filter({ visible: true });
      const marks = await toggles.evaluateAll(elements => elements.map(element => {
        const mark = element.querySelector('[aria-hidden=true]') || element;
        const style = getComputedStyle(mark, '::before');
        return { width: parseFloat(style.borderTopWidth), style: style.borderTopStyle, color: style.borderTopColor };
      }));
      assert(marks.length >= 3 && marks.every(mark => mark.width >= 1 && mark.style === 'solid' && mark.color !== 'rgba(0, 0, 0, 0)'), 'Expanders keep visible strokes when forced colors remove backgrounds');
      await page.emulateMedia({ forcedColors: 'none' });
    }
    await openStep(page, currentRow, 'shortlist');
    await page.goBack();
    await noButtons(page, 'Back restores plan list');
    const documents = page.locator('#portal-stage-documents');
    await documents.locator('summary').click();
    const blocked = page.locator('[data-portal-task="statements"]');
    await openStep(page, blocked, 'statements', 'docs');
    await noButtons(page, 'Future document step');
    assert.match(await detail(page).innerText(), /Сначала:.*Выбрать программы/);
    await page.goBack();
    if (!(await documents.evaluate(element => element.open))) await documents.locator('summary').click();
    await openStep(page, page.locator('[data-portal-task="familyDocs"]'), 'familyDocs', 'docs');
    await noButtons(page, 'Parent step');
    assert.match(await detail(page).innerText(), /родител/i);
    assert.match(await detail(page).innerText(), /Сначала:.*Выбрать программы/);
    await go(page, 'План');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await checkNavigation(page, true);
    await noOverflow(page, `Plan ${label}`);
    await go(page, 'Документы');
    await checkArtwork(page, 'documents');
    assert.deepEqual(await page.locator('[data-document-filter]').evaluateAll(elements => elements.map(element => element.dataset.documentFilter)), ['all', 'missing'], 'Empty status filters are hidden');
    assert.equal(await page.locator('[data-document]').count(), 2);
    for (const filter of await page.locator('[data-document-filter]').all()) {
      const box = await filter.boundingBox();
      assert(box && box.width >= 44 && box.height >= 44, 'Every document filter has a 44px touch target, including All');
    }
    await noButtons(page, 'Document list');
    await go(page, 'Обзор');
    await page.getByRole('link', { name: 'Настройки', exact: true }).click();
    await checkSettings(page);
    await page.goBack();
    await waitForOverview(page);
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
    results.push({ viewport, sharedSiteBrand: true, decorativeArtwork: true, realRouteCountIgnoresStaleKeys: true, currentVerbAboveFold: true, compactGlobalGuideOnEveryView: true, currentDetailGuideIsStatic: true, planListsHaveZeroButtons: true, overviewHasOnlyRoadLink: true, rowIsOnlyNavigationPath: true, helperHasStepContext: true, futureAndParentHaveZeroButtons: true, navigation: '3 bottom links on mobile + settings and helper links', historyAndReload: 'pass', overflow: false, axe: 'pass' });
    await context.close();
  }
  for (const mode of process.env.NAVIGATION_REVIEW_LATE_ONLY ? [] : ['zero', 'complete', 'blocked', 'empty', 'near', 'dates', 'parents', 'manual', 'last']) {
    const { context, page, calls } = await openPortal({ width: 390, height: 844 }, mode);
    assert.equal(await page.getByRole('progressbar').count(), 0);
    assert.equal(calls.length, 0, 'Rendering never mutates route data');
    assert((await page.locator('button').count()) <= 1, `${mode}: overview has at most the one whole-road action`);
    if (mode === 'zero') await checkRoad(page, 'Старт', 0, ids.length);
    if (mode === 'complete') {
      assert.match(await road(page).innerText(), /Готово/);
      assert.equal(await page.locator('[data-near-orientirs]').count(), 0, 'Completed dates are hidden');
      assert.equal(await page.locator('[data-current-step]').count(), 0, 'A finished route cannot reopen a completed task as current');
    }
    if (mode === 'blocked') assert.doesNotMatch(await road(page).innerText(), /Готово/, 'Unavailable unfinished steps must not claim completion');
    if (mode === 'near') {
      assert.match(await road(page).innerText(), /Дальше/);
      assert.equal(await page.locator('[data-orientir-task=shortlist]').count(), 0);
      assert.equal(await page.locator('[data-orientir-task]').count(), 1);
    }
    if (mode === 'dates') {
      assert.deepEqual(await page.locator('[data-orientir-task]').evaluateAll(elements => elements.map(element => element.dataset.orientirTask)), ['statements', 'visa-task'], 'Show at most two real dates, ordered by daysLeft across stages');
      assert.equal(await page.locator('[data-current-step=shortlist]').count(), 1, 'Nearby dates never change route availability or order');
    }
    if (mode === 'parents') {
      await checkRoad(page, 'Старт', 2, ids.length);
      assert.match(await road(page).innerText(), /Попросить родителей/);
      await openStep(page, page.locator('[data-current-step="family-budget"]'), 'family-budget');
      assert.equal(await page.locator('button').count(), 1, 'A current parent self-report has exactly one necessary action');
      await detail(page).getByRole('button', { name: 'Готово', exact: true }).click();
      await waitForOverview(page);
      assert.deepEqual(calls.map(call => [call.task, call.value]), [['family-budget', true]], 'Parent confirmation advances the existing route');
    }
    if (mode === 'manual') {
      assert.equal(await road(page).evaluate(element => element === document.activeElement), false, 'Initial login does not move focus onto the road');
      await openStep(page, page.locator('[data-current-step="manual-task"]'), 'manual-task');
      assert.equal(await page.locator('button').count(), 1, 'Manual self-report has one explicit action');
      await page.getByRole('button', { name: 'Готово', exact: true }).focus();
      await page.keyboard.press('Enter');
      await waitForOverview(page);
      assert.equal(await road(page).evaluate(element => element === document.activeElement), true, 'Confirmed completion focuses the next step instead of losing focus to body');
      assert.deepEqual(calls.map(call => [call.task, call.value]), [['manual-task', true]]);
      await checkRoad(page, 'Старт', 2, ids.length);
      await checkRoadMotion(page);
      await go(page, 'План');
      await openStep(page, page.locator('[data-portal-task=manual-task]'), 'manual-task');
      await noButtons(page, 'Completed steps contain no buttons');
      assert.match(await detail(page).innerText(), /Этот шаг уже сделан\./);
      await detail(page).getByRole('link', { name: 'Снять отметку', exact: true }).click();
      await waitForOverview(page);
      assert.deepEqual(calls.map(call => [call.task, call.value]), [['manual-task', true], ['manual-task', false]], 'The quiet undo link preserves the old self-report action');
      await checkRoad(page, 'Старт', 1, ids.length);
    }
    if (mode === 'last') {
      await openStep(page, page.locator('[data-current-step="manual-task"]'), 'manual-task');
      await page.getByRole('button', { name: 'Готово', exact: true }).focus();
      await page.keyboard.press('Enter');
      await waitForOverview(page);
      assert.match(await road(page).innerText(), /Готово/);
      assert.equal(await road(page).evaluate(element => element === document.activeElement), true, 'Completing the final task focuses the static route summary');
      assert.equal(await road(page).getAttribute('tabindex'), '-1', 'The completed summary is programmatically focusable without becoming another tab stop');
    }
    await noOverflow(page, `${mode} state`);
    results.push({ state: mode, passed: true });
    await context.close();
  }
  if (!process.env.NAVIGATION_REVIEW_LATE_ONLY) {
    const { context, page, calls } = await openPortal({ width: 390, height: 844 }, 'manual', 'no-preference');
    await checkRoadMotion(page, false);
    const idle = await road(page).locator('[data-road-body]').evaluate(element => ({ name: getComputedStyle(element).animationName, duration: getComputedStyle(element).animationDuration }));
    assert.notEqual(idle.name, 'none');
    assert.equal(idle.duration, '2.8s', 'Only the scooter body quietly idles');
    await openStep(page, page.locator('[data-current-step=manual-task]'), 'manual-task');
    await detail(page).getByRole('button', { name: 'Готово', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-portal-road]')?.getAttribute('data-traveling') === 'true');
    const traveling = await road(page).evaluate(element => {
      const scooter = element.querySelector('[data-road-scooter]');
      const fill = element.querySelector('[data-road-fill]');
      const text = element.querySelector('[data-road-text]');
      const wheel = element.querySelector('[data-road-spokes]');
      return { current: element.dataset.currentStep, done: element.dataset.roadDone,
        title: text.textContent, live: element.querySelector('[data-road-next]').getAttribute('aria-live'),
        transition: getComputedStyle(scooter).transitionDuration, easing: getComputedStyle(scooter).transitionTimingFunction,
        left: new DOMMatrix(getComputedStyle(scooter).transform).m41, destination: scooter.parentElement.clientWidth * parseFloat(scooter.style.transform.match(/translateX\(([^%]+)/)[1]) / 100,
        fillWidth: fill.getBoundingClientRect().width, wheelAnimation: getComputedStyle(wheel).animationName,
        copyAnimation: getComputedStyle(text).animationDuration,
      };
    });
    assert.equal(traveling.current, 'family-budget');
    assert.equal(traveling.done, '2');
    assert.match(traveling.title, /Попросить родителей/);
    assert.doesNotMatch(traveling.title, /Подготовить сведения/, 'The old completed step never remains on the moving road');
    assert.equal(traveling.live, 'polite');
    assert.equal(traveling.transition, '0.92s');
    assert.equal(traveling.easing, 'cubic-bezier(0.22, 1, 0.36, 1)');
    assert(traveling.left < traveling.destination, 'The scooter interpolates instead of snapping to the destination');
    assert(Math.abs(traveling.fillWidth - traveling.left) < 2, 'The fill travels with the scooter');
    assert.notEqual(traveling.wheelAnimation, 'none', 'Spokes rotate only while driving');
    assert.equal(traveling.copyAnimation, '0.42s');
    await page.waitForFunction(() => document.querySelector('[data-portal-road]')?.getAttribute('data-traveling') === 'false');
    const settled = await road(page).locator('[data-road-scooter]').evaluate(element => ({ actual: new DOMMatrix(getComputedStyle(element).transform).m41, expected: element.parentElement.clientWidth * parseFloat(element.style.transform.match(/translateX\(([^%]+)/)[1]) / 100 }));
    assert(Math.abs(settled.actual - settled.expected) < 1, 'The scooter reaches its real completion position');
    assert.equal(await road(page).locator('[data-road-spokes]').first().evaluate(element => getComputedStyle(element).animationName), 'none');
    await page.reload({ waitUntil: 'networkidle' });
    await waitForOverview(page);
    await checkRoadMotion(page, false);
    assert.equal(calls.length, 1, 'Reload never repeats the completion action');
    results.push({ motion: 'normal', initialAndReloadDoNotDrive: true, confirmedCompletionDrives: true, newStepImmediate: true, fillAndScooterTravelTogether: true, reducedMotionCovered: true });
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
    await checkRoad(page, 'Старт', 1, ids.length);
    results.push({ helper: 'one header entry', stepContextSentOnlyOnUserQuestion: true, oldContextClearedOnList: true });
    await context.close();
  }
  if (!process.env.NAVIGATION_REVIEW_LATE_ONLY) {
    const { context, page, profileCalls, loginBrand } = await openPortal({ width: 390, height: 844 }, 'profile');
    await page.getByRole('link', { name: 'Настройки', exact: true }).click();
    await page.getByRole('link', { name: 'Изменить профиль', exact: true }).click();
    const form = page.locator('[data-portal-profile]');
    await form.waitFor();
    await checkSharedBrand(page, loginBrand, '[data-portal-profile]');
    await checkPersistentRoad(page, { currentOpen: true });
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
    await openStep(page, page.locator('[data-current-step=familyDocs]'), 'familyDocs', 'docs');
    assert.equal(await detail(page).getByRole('checkbox').count(), 0, 'Document preparation has no separate self-report');
    assert.equal(await page.locator('button').count(), 1, 'A family-prepared current document can still be uploaded');
    await page.getByRole('button', { name: 'Приложить файл', exact: true }).click();
    await page.locator('input[type=file]').setInputFiles({ name: 'synthetic-family.txt', mimeType: 'text/plain', buffer: Buffer.from('SYNTHETIC FAMILY DOCUMENT. No personal data.') });
    await waitForOverview(page);
    assert.deepEqual(fileCalls, { check: 1, save: 1 });
    assert.equal(calls.length, 0, 'File upload never requires a separate task completion request');
    await page.locator('[data-current-step=insurance]').waitFor();
    assert.equal(await road(page).evaluate(element => element === document.activeElement), true, 'A server-confirmed file completion focuses the next step');
    await checkRoad(page, 'Документы', 1, 2);
    results.push({ parentDocument: 'one canonical document screen', parentCurrentFileHasOneAction: true, uploadClosesTaskAndReturnsAutomatically: true });
    await context.close();
  }
  const labelFailures = [];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 667 }]) {
    const { context, page, calls } = await openPortal(viewport, 'full-route');
    const label = `${viewport.width}x${viewport.height}`;
    await checkRoad(page, 'Старт', 1, 28);
    assert.equal(await road(page).locator('[data-road-stage]').count(), 7);
    const labelBoxes = await road(page).locator('[data-road-stage-label]').evaluateAll(elements => elements.map(element => {
      const label = element;
      const range = document.createRange();
      range.selectNodeContents(label);
      return { title: label.textContent, visible: getComputedStyle(label).display !== 'none', lines: Array.from(range.getClientRects()).map(box => ({ x: box.x, y: box.y, right: box.right, bottom: box.bottom })) };
    }).filter(label => label.visible));
    const routeBox = await road(page).boundingBox();
    for (const stageLabel of labelBoxes) {
      assert(stageLabel.lines.every(line => line.x >= routeBox.x - 1 && line.right <= routeBox.x + routeBox.width + 1 && line.y >= routeBox.y - 1 && line.bottom <= routeBox.y + routeBox.height + 1), `${label}: the complete visible stage label “${stageLabel.title}” fits inside the compact road`);
    }
    for (let index = 0; index < labelBoxes.length - 1; index++) {
      const left = labelBoxes[index], right = labelBoxes[index + 1];
      if (left.lines.some(a => right.lines.some(b => a.right > b.x + 1 && a.x < b.right - 1 && a.y < b.bottom - 1 && a.bottom > b.y + 1))) labelFailures.push({ viewport, left, right });
    }
    assert.equal(labelBoxes.length, viewport.width <= 900 ? 0 : 7, 'Stage names are visible on desktop and landscape tablets and hidden on narrow screens');
    await noOverflow(page, 'The real seven-stage route does not overflow');
    await page.screenshot({ path: resolve(output, `portal-road-real-stages-${viewport.width}x${viewport.height}.png`), fullPage: true });
    await go(page, 'План');
    // Expand the existing route disclosures through their real controls so
    // sticky checks scroll meaningful screen content, not an injected spacer.
    for (const disclosure of await page.locator('#portal-panel details').all()) {
      if (await disclosure.isVisible() && !(await disclosure.evaluate(element => element.open))) await disclosure.locator(':scope > summary').click();
    }
    await checkStickyScroll(page, `plan-${label}`, { capture: true });
    await checkRoadMotion(page);
    await noButtons(page, 'A fully expanded route still has no row buttons');
    await go(page, 'Документы');
    await checkStickyScroll(page, `documents-${label}`, { capture: true });
    await checkRoadMotion(page);
    await noButtons(page, 'The full document list has no row buttons');
    await openStep(page, page.locator('[data-document=translate]'), 'translate', 'docs');
    await noButtons(page, 'A future document remains read-only with a global next-step link');
    await checkStickyScroll(page, `future-step-${label}`, { requireScroll: false });
    await openStep(page, road(page), 'shortlist');
    await checkStickyScroll(page, `current-step-${label}`, { currentOpen: true, requireScroll: false });
    assert.equal(await detail(page).locator('a[href="/universities"]').count(), 1, 'Only the step itself offers the program-selection action');
    await page.getByRole('link', { name: 'Назад', exact: true }).click();
    assert.equal(new URL(page.url()).searchParams.get('view'), 'docs', 'The persistent guide returns to the Documents screen it was opened from');
    await page.getByRole('link', { name: 'Настройки', exact: true }).click();
    await checkSettings(page);
    await page.locator('#notifications > summary').click();
    await checkStickyScroll(page, `settings-${label}`, { capture: true });
    await openStep(page, road(page), 'shortlist');
    await page.getByRole('link', { name: 'Назад', exact: true }).click();
    await checkSettings(page);
    assert.equal(calls.length, 0, 'Using the persistent guide, disclosures and settings never marks a step done');
    results.push({ viewport, realSevenStageRoute: true, realTotal: 28, labelsDoNotOverlap: !labelFailures.some(failure => failure.viewport === viewport), guidePinsAfterRealScroll: ['plan', 'documents', 'settings'], currentDetailGuideIsStatic: true, guideOpensCurrentStepFromOtherScreens: true });
    await context.close();
  }
  assert.deepEqual(labelFailures, [], 'Labels for the real route must not overlap');
  const lateFailures = [];
  for (const viewport of [{ width: 390, height: 667 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
    const { context, page } = await openPortal(viewport, 'late-current');
    const current = page.locator('[data-current-step="statements"]');
    const action = await current.boundingBox();
    const visible = action && action.y >= 0 && action.y + action.height <= viewport.height;
    if (!visible) lateFailures.push({ viewport, action });
    await checkRoad(page, 'Документы', 4, 7);
    await go(page, 'План');
    await noButtons(page, 'Late-current plan');
    await page.screenshot({ path: resolve(output, `portal-plan-late-${viewport.width}x${viewport.height}.png`), fullPage: true });
    await openStep(page, page.locator('[data-portal-task="statements"]'), 'statements', 'docs');
    assert.equal(await page.locator('button').count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Приложить файл', exact: true }).count(), 1);
    results.push({ viewport, lateCurrentActionAboveFold: Boolean(visible), documentStepHasOnlyFileAction: true });
    await context.close();
  }
  assert.deepEqual(lateFailures, [], 'The current step stays visible after completed tasks');
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedApi, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors, unexpectedApi }, null, 2));
  console.log(JSON.stringify({ results, errors, unexpectedApi }, null, 2));
} catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
