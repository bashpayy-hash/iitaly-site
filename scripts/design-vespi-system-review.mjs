import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { extname, resolve, sep } from 'node:path';

// User-requested cross-site assistant review. Only synthetic local data is
// served: no paid model calls, real accounts, uploads, or payment requests.
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const baseline = process.env.VESPI_CAPTURE_BASELINE === '1';
const sectionsOnly = process.env.VESPI_CAPTURE_SECTIONS_ONLY === '1';
const reportOnly = process.env.VESPI_CAPTURE_REPORT_ONLY === '1';
const finalCapture = process.env.VESPI_CAPTURE_FINAL_ONLY === '1';
const captureOnly = sectionsOnly || reportOnly || finalCapture;
const root = resolve(baseline ? process.env.BASELINE_OUT : 'out');
const output = resolve(process.env.VESPI_REVIEW_OUTPUT || 'design-review/vespi-system');
const baseRef = process.env.VESPI_BASE_REF || process.env.BASE_SHA || 'b106963';
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer(async (request, response) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return response.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
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
const results = [], brands = {};
let activePage;

// Mirrors the review's partial / late-current situations, without importing
// its executable test suite or contacting the backend.
function fixture(documentStep = false) {
  return {
    ok: true,
    client: { name: 'Тестовый профиль', surname: 'Testov', intakeYear: 2027, tgLinked: false, notify: { telegram: false }, onboardingComplete: true, profile: { education: 'NIS Grade 12', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', educationPath: 'university_kz', onboardingDone: true } },
    roadmap: documentStep ? [
      { id: 'documents', title: 'Документы', tasks: [
        { id: 'statements', t: 'Подготовить банковскую выписку', available: true, owner: 'Ты', time: '10 мин' },
        { id: 'familyDocs', t: 'Собрать справки о доходах', available: false, owner: 'родители', timingLabel: 'Сначала подготовить банковскую выписку' },
      ] },
      { id: 'visa', title: 'Виза', tasks: [{ id: 'visa-task', t: 'Собрать визовый пакет', available: false, owner: 'Ты', timingLabel: 'После подготовки документов' }] },
    ] : [
      { id: 'start', title: 'Старт', tasks: [
        { id: 'profile', t: 'Заполнить профиль', available: true, owner: 'Ты' },
        { id: 'shortlist', t: 'Выбрать программы', explain: 'Сравни программы и выбери подходящие.', available: true, owner: 'Ты', time: '15 мин', deadline: '2026-11-15', deadlineKind: 'application', daysLeft: 30 },
        { id: 'family-budget', t: 'Обсудить бюджет', available: true, owner: 'Ты + родители' },
      ] },
      { id: 'documents', title: 'Документы', tasks: [
        { id: 'statements', t: 'Подготовить банковскую выписку', available: false, owner: 'Ты', timingLabel: 'Сначала выбрать программы' },
        { id: 'familyDocs', t: 'Собрать справки о доходах', available: false, owner: 'родители', timingLabel: 'Сначала выбрать программы' },
      ] },
      { id: 'visa', title: 'Виза', tasks: [{ id: 'visa-task', t: 'Собрать визовый пакет', available: true, owner: 'Ты', deadline: '2026-10-16', daysLeft: 3 }] },
      { id: 'arrival', title: 'Переезд', tasks: [{ id: 'arrival-task', t: 'Подготовиться к приезду', available: false, owner: 'Ты', timingLabel: 'После получения визы' }] },
    ],
    done: documentStep ? {} : { profile: true, 'obsolete-task': true },
    docs: {},
  };
}

function progress(data) {
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  const done = tasks.filter(task => data.done[task.id]).length;
  return { done, total: tasks.length, pct: tasks.length ? Math.round(done / tasks.length * 100) : 0 };
}

function savedReport(data) {
  data.docs.statements = {
    verdict: 'warn', summary: 'Содержимое читается. Для проверки требований нужно уточнить программу.',
    fileName: 'statement-test.pdf', checkedAt: '2026-10-13T12:00:00.000Z',
    result: { verdict: 'warn', docTitle: 'Банковская выписка', summary: 'Содержимое читается. Для проверки требований нужно уточнить программу.', checks: [{ status: 'unknown', label: 'Применимость требований', note: 'Учебный год не выбран.' }], problems: [], nextSteps: ['Выбери программу и учебный год.'] },
  };
}

async function brand(page) {
  return page.evaluate(() => {
    const style = getComputedStyle(document.body);
    const root = getComputedStyle(document.documentElement);
    const heading = document.querySelector('h1');
    const logo = document.querySelector('header a[aria-label^="IITALY"]');
    const values = node => node ? { color: getComputedStyle(node).color, fontFamily: getComputedStyle(node).fontFamily, fontWeight: getComputedStyle(node).fontWeight, backgroundColor: getComputedStyle(node).backgroundColor } : null;
    return {
      body: { color: style.color, backgroundColor: style.backgroundColor, fontFamily: style.fontFamily },
      heading: values(heading), logo: values(logo),
      tokens: Object.fromEntries([...root].filter(name => /^--(?:color-|font-apple|font-onest|font-display|font-sans)/.test(name)).sort().map(name => [name, root.getPropertyValue(name).trim()])),
    };
  });
}

async function noDuplicatePortraits(page, where) {
  assert.equal(await page.locator('#chat-launcher img').count(),0, `${where}: floating launcher never repeats a portrait`);
  assert.equal(await page.locator('img[src*="vespi-avatar-"]').count(),0, `${where}: legacy cropped heads are absent`);
  const visible = await page.locator('img[data-vespi]').evaluateAll(elements => elements.filter(element => {
    const rect = element.getBoundingClientRect();
    return rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth
      && element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  }).map(element => ({ role: element.closest('[data-vespi-variant]')?.getAttribute('data-vespi-variant'), layout: element.closest('[data-vespi-assistant]')?.getAttribute('data-vespi-assistant'), src: element.getAttribute('src') })));
  assert(visible.length <= 1, `${where}: at most one portrait in the viewport: ${JSON.stringify(visible)}`);
}

const ROLE_ARTWORK = {
  'inspector:portrait': ['vespi-avatar-inspector-v1', [96, 192]],
  'inspector:figure': ['vespi-inspector-v1', [160, 320]],
  'copilot:portrait': ['vespi-avatar-copilot-v1', [96, 192]],
  'route:figure': ['vespi-ride-route', [160, 320, 640]],
};

// A role label alone must not pass while the original fallback is displayed.
// Check the selected responsive resource after it is visible and decoded.
async function noLegacyPortraits(container, where) {
  assert.equal(await container.locator('img[data-vespi], img[src*="vespi-avatar-"]').count(),0, `${where}: utility content has no hanging mascot head`);
}

async function documentCoach(page, where) {
  const coach=page.locator('[data-portal-document-coach]');
  assert.equal(await coach.count(),1, `${where}: one contextual document coach`);
  const image=coach.locator('img');
  assert.equal(await image.getAttribute('src'),'/mascot/vespi-document-coach.webp');
  await coach.scrollIntoViewIfNeeded();
  if (await image.isVisible()) {
    await page.waitForFunction(() => {
      const image=document.querySelector('[data-portal-document-coach] img');
      return image?.complete && image.naturalWidth > 0;
    }, null, { timeout: 10000 });
  } else {
    assert(page.viewportSize().width <= 380, `${where}: only narrow screens omit the decorative pose`);
    assert(await coach.getByRole('heading', {name:'Подготовим файл к разбору'}).isVisible(), `${where}: the preparation guidance stays visible`);
  }
}

async function roleAssetBudget() {
  const manifest = JSON.parse(await readFile('design/mascot/vespi/roles/provenance.json', 'utf8'));
  const production = manifest.assets.flatMap(asset => asset.production);
  const expected = Object.entries(ROLE_ARTWORK).filter(([key]) => !key.startsWith('route:'))
    .flatMap(([, [prefix, widths]]) => widths.map(width => `public/mascot/vespi/${prefix}-${width}.webp`)).sort();
  assert.deepEqual(production.map(asset => asset.file).sort(), expected, 'Role provenance lists each shipped responsive asset exactly once');
  const sizes = await Promise.all(production.map(async asset => {
    const source = await readFile(asset.file);
    const response = await fetch(origin + asset.file.slice('public'.length));
    assert.equal(response.status, 200, `${asset.file}: exported asset is served`);
    assert.match(response.headers.get('content-type') || '', /^image\/webp/, `${asset.file}: exported asset is a WebP`);
    const served = Buffer.from(await response.arrayBuffer());
    assert.deepEqual(served, source, `${asset.file}: static export serves the production asset, not stale artwork`);
    assert.equal(served.byteLength, asset.bytes, `${asset.file}: provenance records the actual byte size`);
    assert(served.byteLength > 0, `${asset.file}: production asset is not empty`);
    return served.byteLength;
  }));
  const bytes = sizes.reduce((sum, size) => sum + size, 0);
  assert(bytes <= 64 * 1024, `Role artwork stays within 64 KiB for all responsive variants, received ${bytes} bytes`);
  const contextual=JSON.parse(await readFile('design/mascot/vespi/contextual-assets.json','utf8')).assets;
  assert.deepEqual(contextual.map(asset=>asset.file).sort(),['public/mascot/vespi-document-coach.webp','public/mascot/vespi-guide-invite.webp','public/mascot/vespi-search-avatar.webp']);
  for(const asset of contextual){
    const source=await readFile(asset.file);
    assert.equal(source.length,asset.bytes);
    assert.equal(createHash('sha256').update(source).digest('hex'),asset.sha256,'The shipped contextual asset matches its provenance');
    const response=await fetch(origin+asset.file.slice('public'.length));
    assert.equal(response.status,200);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),source);
  }
  assert(contextual.reduce((sum,asset)=>sum+asset.bytes,0)<=128*1024,'Three contextual images stay small enough for mobile');
}

// The user's follow-up explicitly replaces the heavy IITALY. wordmark with
// iItaly. Preserve its inherited palette and font, while allowing new weight.
function preservedBrand(value) {
  // Explicit 18 October brief replaces the palette; typography is still frozen.
  const typography = node => node && Object.fromEntries(Object.entries(node).filter(([key]) => /^font/.test(key)));
  return { body: typography(value.body), heading: typography(value.heading), logo: typography(value.logo), fonts: Object.fromEntries(Object.entries(value.tokens).filter(([key]) => /^--font/.test(key))) };
}

async function checkWordmark(page) {
  const wordmark = page.locator('header [data-brand-logo]');
  assert.equal(await wordmark.count(), 1, 'The header has one shared wordmark');
  assert.equal(await wordmark.locator('[data-brand-initial]').innerText(), 'i');
  assert.equal(await wordmark.locator('[data-brand-word]').innerText(), 'iItaly');
  assert.equal((await wordmark.innerText()).replace(/\s+/g, ''), 'iItaly', 'The shared wordmark has no trailing dot');
  assert.equal(await wordmark.locator('[data-brand-initial]').evaluate(element => getComputedStyle(element).color), 'rgb(230, 57, 70)', 'The initial uses the shared coral signal on every surface');
}

try {
  if (!baseline) {
    await roleAssetBudget();
    // Mascot placement changes preserve the established typography and palette.
    const fonts = source => source.match(/--font-[^;]+;/g);
    const before = execFileSync('git', ['show', `${baseRef}:src/app/globals.css`], { encoding: 'utf8' });
    assert.deepEqual(fonts(await readFile('src/app/globals.css', 'utf8')), fonts(before), 'Typography tokens remain unchanged');
    assert.doesNotMatch(await readFile('src/components/mascot/vespi-assistant.module.css', 'utf8'), /#[\da-f]{3,8}\b|(?:rgb|hsl|oklch)a?\(/i, 'The shared assistant consumes existing tokens instead of introducing a new palette');
  }
  const beforeBrands = baseline ? {} : JSON.parse(await readFile(resolve(output, 'before-brands.json'), 'utf8').catch(() => '{}'));
  for (const width of baseline || captureOnly ? [1440, 390] : [1440, 768, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, reducedMotion: 'reduce', locale: 'ru-RU' });
    const errors = [], unexpected = [], assistantCalls = [];
    let data = fixture();
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      if (url.pathname === '/api/event') return route.fulfill({ json: { ok: true } });
      if (url.pathname === '/__review/brand-icons') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="ru"><meta charset="utf-8"><title>Проверка иконок iItaly</title><body style="margin:40px;background:white;color:#222;font:16px sans-serif"><h1>Иконки iItaly</h1><p>SVG · 32 / 64 px</p><img src="/icon.svg" width="32" height="32" alt="Иконка 32px"> <img src="/icon.svg" width="64" height="64" alt="Иконка 64px"><p>Apple touch icon · 180 px</p><img src="/apple-icon.png" width="180" height="180" alt="Иконка Apple"></body></html>' });
      if (url.pathname === '/health/ai') return route.fulfill({ json: { ok: true, code: 'AI_READY' } });
      if (url.pathname === '/api/portal/lookup') return route.fulfill({ json: { ...data, progress: progress(data) } });
      if (url.pathname === '/api/chat') assistantCalls.push(request.postDataJSON());
      if (url.pathname.startsWith('/api/')) unexpected.push(url.pathname);
      return url.origin === origin && !url.pathname.startsWith('/api/') ? route.continue() : route.abort();
    });
    const page = await context.newPage(); activePage = page;
    page.on('pageerror', error => errors.push(error.message));
    const visit = async path => { await page.goto(origin + path, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); };
    const capture = async name => {
      if (width !== 1440 && width !== 390) return;
      await page.screenshot({ path: resolve(output, `${baseline ? 'before' : 'after'}-${name}-${width}.png`) });
    };
    async function audit(where) {
      if (finalCapture) return; // A color-only asset refresh does not rerun the completed axe gate.
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${where}: no horizontal scrolling`);
      await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], `${where}: accessibility`);
    }
    for (const [path, name] of [['/', 'home'], ['/prices', 'prices'], ['/universities', 'universities'], ['/plan', 'plan'], ['/guides', 'guides']]) {
      if (reportOnly) continue;
      if (sectionsOnly && !['home', 'prices', 'universities'].includes(name)) continue;
      await visit(path);
      brands[`${name}-${width}`] = await brand(page);
      if (!baseline && beforeBrands[`${name}-${width}`]) assert.deepEqual(preservedBrand(brands[`${name}-${width}`]), preservedBrand(beforeBrands[`${name}-${width}`]), `${name} ${width}: preserve typography while applying the authorized warm palette`);
      if (!baseline && name === 'home') {
        const entry = page.locator('[data-section="hero"]');
        const action = entry.getByRole('link', { name: 'Составить план бесплатно', exact: true });
        const box = await action.boundingBox();
        assert(box && box.y + box.height <= (width < 600 ? 844 : 1000), 'The real starting action stays in the first viewport');
        await noLegacyPortraits(entry, 'home hero');
        assert.equal(await page.locator('[data-vespi-intro="home"]').count(),1,'The dedicated home introduction is retained');
        assert.equal(await page.locator('[data-section="how"]').count(),0,'How-it-works facts moved to FAQ');
        assert.equal(await page.getByText('Как проходит работа с iItaly?',{exact:true}).count(),1);
        await noDuplicatePortraits(page, `home entry ${width}`);
      }
      if (!sectionsOnly) await capture(name);
      // Capture the changed sections, not just their unchanged page heroes.
      // Baseline anchors are real containers that also existed before Vespi.
      if (width === 1440 || width === 390) {
        if (name === 'home') {
          await page.locator(baseline ? '[data-section="how"]' : '[data-vespi-intro="home"]').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
          await capture('home-introduction');
          const priceBand = page.locator('section').filter({ has: page.getByRole('link', { name: 'Смотреть, что входит', exact: true }) });
          await priceBand.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
          await capture('home-price-band');
        } else if (name === 'prices') {
          const target = page.locator('#main-package').getByRole('button', { name: 'Оформить и оплатить', exact: true });
          await target.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
          if (!baseline) {
            await noLegacyPortraits(page.locator('main'),'pricing');
            await noDuplicatePortraits(page, `pricing ${width}`);
          }
          await capture('prices-insight');
        } else if (name === 'universities') {
          const target = baseline ? page.getByRole('region', { name: 'Карта и каталог университетов', exact: true }) : page.locator('[data-university-navigator]');
          await target.evaluate((element, isBaseline) => element.scrollIntoView({ block: isBaseline ? 'start' : 'center', behavior: 'instant' }), baseline);
          await capture('universities-navigator');
        }
      }
      if (finalCapture && name === 'home') {
        if (width === 390) {
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
          await page.locator('header summary').click();
          await capture('brand-mobile-menu');
          await page.locator('header summary').click();
        }
        await page.locator('footer').last().evaluate(element => element.scrollIntoView({ block: 'end', behavior: 'instant' }));
        await capture('brand-footer');
        if (width === 390) {
          await page.goto(origin + '/__review/brand-icons', { waitUntil: 'networkidle' });
          await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
          await capture('brand-icons');
        }
        await visit('/');
      }
      if (!baseline && !sectionsOnly) {
        await checkWordmark(page);
        assert.equal(await page.locator('#chat-launcher').count(),1, `${name}: one functional assistant entry remains`);
        const roles = await page.locator('[data-vespi-assistant]').evaluateAll(elements => elements.map(element => ({ role: element.dataset.vespiVariant, layout: element.dataset.vespiAssistant })));
        assert(roles.every(({ role, layout }) => ['route', 'inspector', 'celebrate', 'copilot'].includes(role) && ['inline-pill', 'editorial-callout', 'portal-copilot', 'floating-bar'].includes(layout)), `${name}: role and layout stay within the shared public contract`);
        await audit(`${name} ${width}`);
      }
    }
    if (sectionsOnly) { results.push({ width, targetedSectionCaptures: true }); await context.close(); continue; }
    if (reportOnly) {
      data = fixture(true); savedReport(data);
      await visit('/portal?auth=login');
      // Guest workspace is the default; explicitly connect the cloud fixture.
    if (!await page.getByLabel('Фамилия', { exact: true }).count()) await page.getByRole('link', { name: 'Подключить облачный кабинет ↗', exact: true }).click();
    await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
      await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
      await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
      await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
      await visit('/portal?view=docs&doc=statements');
      await page.getByRole('region', { name: 'Разбор документа', exact: true }).waitFor();
      if (!baseline) await noLegacyPortraits(page.locator('[data-portal-document-inspector]'), `saved report ${width}`);
      await capture('portal-inspector-report');
      results.push({ width, savedReportCapture: true }); await context.close(); continue;
    }
    await visit('/guides#apostille');
    await page.locator('[data-guide-panel="apostille"]').waitFor();
    const advice = page.locator('[data-vespi-tip]').filter({ visible: true });
    await advice.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    if (!baseline) {
      await page.locator('[data-guide-sticky]').waitFor({ state: 'hidden' });
      assert.equal(await advice.getAttribute('data-guide-next'), 'apostille', 'Advice follows the selected topic');
      // Reading advice is plain content; the requested illustrations sit at search and timeline.
      assert.equal(await advice.locator('[data-vespi]').count(), 0);
      assert.equal(await advice.locator('img[data-vespi]').count(), 0);
      await noDuplicatePortraits(page, `guide insight ${width}`);
      await audit(`guide insight ${width}`);
    }
    await capture('guides-insight');
    if (finalCapture) {
      await visit('/guides#visa');
      await page.locator('[data-guide-panel="visa"]').waitFor();
      await page.waitForFunction(() => document.activeElement?.id === 'active-guide-title');
      const checklist = page.getByRole('button', { name: 'Чек-лист документов', exact: true });
      if (await checklist.getAttribute('aria-expanded') === 'false') await checklist.click();
      await page.locator('#active-guide-title').focus();
      await page.locator('#active-guide-title').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
      assert.equal(await page.locator('[data-guide-sticky]').count(),0);
      await capture('guides-reading');
    }

    await visit('/plan');
    if (!baseline) {
      assert.equal(await page.locator('[data-plan-question] img').count(),0,'Questionnaire content stays portrait-free');
      assert.equal(await page.locator('#document-check [data-vespi]').count(), 0, 'The document workbench uses a utility icon, preserving the single mascot anchor');
    }
    await page.getByRole('button').filter({ hasText: 'Осенью 2027' }).click();
    if (!baseline) {
      const explanation = page.locator('[data-vespi-question-reason]');
      assert(await explanation.isVisible(), 'Each question gives a short reason');
      assert.match(await explanation.innerText(), /аттестат|лет|образован|допуск/i, 'Education context explains why the qualification matters');
      await noLegacyPortraits(page.locator('[data-plan-question]'), `plan questionnaire ${width}`);
    }
    await capture('plan-question');
    await page.getByRole('button').filter({ hasText: '11 классов' }).click();
    const draft = await page.evaluate(() => sessionStorage.getItem('iitaly_plan_draft_v1'));
    await visit('/guides#education');
    await page.locator('[data-guide-inline-action]').filter({ visible: true }).click();
    await page.getByRole('heading', { name: 'Какой средний балл?', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_plan_draft_v1')), draft, 'Assistant context preserves the quiz draft');
    await page.locator('#document-check').scrollIntoViewIfNeeded();
    if (!baseline) assert.equal(await page.locator('#document-check [data-vespi]').count(), 0, 'No repeated portrait in the document workbench or report');
    await capture('plan-document');

    await visit('/portal?auth=login');
    // Guest workspace is the default; explicitly connect the cloud fixture.
    if (!await page.getByLabel('Фамилия', { exact: true }).count()) await page.getByRole('link', { name: 'Подключить облачный кабинет ↗', exact: true }).click();
    await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
    await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
    await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
    await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
    await page.locator('[data-portal-road]').waitFor();
    brands[`portal-${width}`] = await brand(page);
    if (!baseline && beforeBrands[`portal-${width}`]) assert.deepEqual(preservedBrand(brands[`portal-${width}`]), preservedBrand(beforeBrands[`portal-${width}`]), `portal ${width}: preserve typography while applying the authorized warm palette`);
    await capture('portal-overview');
    if (!baseline) {
      await checkWordmark(page);
      assert.equal(await page.locator('[data-portal-road] img').count(),0,'Progress has no mascot image');
      assert.equal(await page.locator('[data-portal-overview] button').count(), 0, 'Overview adds no competing action buttons');
      assert.equal(await page.locator('[data-portal-road]').getAttribute('data-road-done'), '1', 'Progress only counts real route tasks');
      assert.equal(await page.locator('[data-portal-road]').getAttribute('data-road-total'), '7');
      await noLegacyPortraits(page.locator('[data-portal-road]'), `portal focus ${width}`);
      await noDuplicatePortraits(page, `portal overview ${width}`);
      await audit(`portal overview ${width}`);
    }
    await visit('/portal?view=plan&task=familyDocs');
    await page.locator('[data-step-detail="familyDocs"]').waitFor();
    assert.equal(await page.locator('[data-step-detail] button').count(), 0, 'Future parent-owned step cannot be completed or uploaded');
    await capture('portal-future');
    if (!baseline) {
      assert(await page.locator('[data-step-detail] [data-portal-step-guide]').count() > 0, 'Future step explains its dependency in the assistant context');
      await audit(`portal future ${width}`);
    }
    await visit('/portal?view=docs');
    await page.locator('[data-document-list]').waitFor();
    assert.equal(await page.locator('[data-document-list] button').count(), 0, 'Document rows remain single navigation links');
    await capture('portal-documents');
    await visit('/portal?view=settings');
    await capture('portal-settings');

    data = fixture(true);
    await visit('/portal?view=plan&task=statements');
    await page.locator('[data-step-detail="statements"]').waitFor();
    assert.equal(await page.locator('[data-step-detail] [data-primary-action]').count(), 1, 'Current file step offers exactly one upload action');
    if (!baseline) {
      assert(await page.locator('[data-step-detail] [data-portal-step-guide]').isVisible(), 'Current file step shows its action instructions');
      await noLegacyPortraits(page.locator('[data-step-detail] [data-portal-step-guide]'), `portal upload ${width}`);
      await documentCoach(page, `portal upload ${width}`);
      await noDuplicatePortraits(page, `portal upload ${width}`);
      await audit(`portal upload ${width}`);
    }
    await capture('portal-upload');
    savedReport(data);
    await visit('/portal?view=docs&doc=statements');
    const report = page.getByRole('region', { name: 'Разбор документа', exact: true });
    await report.waitFor();
    assert(await report.getByRole('heading', { name: 'Нужно уточнить', exact: true }).isVisible(), 'Missing application context keeps the clarification status');
    assert(await report.getByText(data.docs.statements.result.summary, { exact: true }).isVisible(), 'The saved summary is shown verbatim');
    assert(await report.getByText('Выбери программу и учебный год.', { exact: true }).isVisible(), 'The saved next action stays visible');
    if (!baseline) {
      assert(await page.locator('[data-portal-document-inspector]').isVisible(), 'The saved report decision remains readable');
      await noLegacyPortraits(page.locator('[data-portal-document-inspector]'), `saved report ${width}`);
      await noDuplicatePortraits(page, `saved report ${width}`);
      await audit(`saved report ${width}`);
    }
    await capture('portal-inspector-report');
    assert.deepEqual(errors, [], `Runtime errors at ${width}`);
    assert.deepEqual(unexpected, [], 'Review navigation cannot upload, mutate a user, or pay');
    assert.deepEqual(assistantCalls, [], 'Assistant messages never auto-send a paid AI request');
    results.push({ width, warmPalette: true, navigationPreservesDraft: true, futureStepReadOnly: true, currentFileOneAction: true, noAutomaticAI: true, a11y: !baseline && !finalCapture, finalAssetCapture: finalCapture });
    await context.close();
  }
  if (!captureOnly) {
    await writeFile(resolve(output, baseline ? 'before-brands.json' : 'after-brands.json'), JSON.stringify(brands, null, 2));
    await writeFile(resolve(output, baseline ? 'before-results.json' : 'results.json'), JSON.stringify(results, null, 2));
  }
  if (finalCapture) await writeFile(resolve(output, 'final-assets-results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(output, `${baseline ? 'before-' : ''}failure.png`) }).catch(() => {});
  throw error;
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
