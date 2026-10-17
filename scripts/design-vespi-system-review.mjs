import assert from 'node:assert/strict';
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
  const contentVisible = await page.locator('img[data-vespi]').evaluateAll(images => images.some(image => {
    if (image.closest('#chat-launcher, #iitaly-chat')) return false;
    const rect = image.getBoundingClientRect();
    return rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth
      && image.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  }));
  if (contentVisible && await page.locator('#chat-launcher').count()) {
    // Content and the launcher update through separate observers; their real
    // rendered state must settle before the invariant is sampled on CI.
    await page.locator('#chat-launcher[data-vespi-launcher-mode="indicator"]').waitFor({ state: 'attached' });
  }
  const visible = await page.locator('img[data-vespi]').evaluateAll(elements => elements.filter(element => {
    const rect = element.getBoundingClientRect();
    return rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth
      && element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  }).map(element => ({ role: element.closest('[data-vespi-variant]')?.getAttribute('data-vespi-variant'), layout: element.closest('[data-vespi-assistant]')?.getAttribute('data-vespi-assistant'), src: element.getAttribute('src') })));
  assert(visible.length <= 1, `${where}: at most one portrait in the viewport: ${JSON.stringify(visible)}`);
}

// The user's follow-up explicitly replaces the heavy IITALY. wordmark with
// iItaly. Preserve its inherited palette and font, while allowing new weight.
function preservedBrand(value) {
  return { ...value, logo: value.logo && { color: value.logo.color, fontFamily: value.logo.fontFamily, backgroundColor: value.logo.backgroundColor } };
}

async function checkWordmark(page) {
  const wordmark = page.locator('header [data-brand-logo]');
  assert.equal(await wordmark.count(), 1, 'The header has one shared wordmark');
  assert.equal(await wordmark.locator('[data-brand-initial]').innerText(), 'i');
  assert.equal(await wordmark.locator('[data-brand-word]').innerText(), 'Italy');
  assert.equal((await wordmark.innerText()).replace(/\s+/g, ''), 'iItaly', 'The shared wordmark has no trailing dot');
  assert.equal(await wordmark.locator('[data-brand-initial]').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(252, 28, 70)', 'The initial uses the existing site signal color on every surface');
}

try {
  if (!baseline) {
    // Palette and font declarations are deliberately outside this refactor.
    for (const file of ['src/app/globals.css', 'src/components/marketing/marketing.module.css', 'src/components/marketing/editorial-art.module.css']) {
      const before = execFileSync('git', ['show', `${baseRef}:${file}`], { encoding: 'utf8' });
      assert.equal(await readFile(file, 'utf8'), before, `${file}: preserve the existing visual tokens and surfaces`);
    }
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
      if (!baseline && beforeBrands[`${name}-${width}`]) assert.deepEqual(preservedBrand(brands[`${name}-${width}`]), preservedBrand(beforeBrands[`${name}-${width}`]), `${name} ${width}: preserve body, typography, and shared palette`);
      if (!sectionsOnly) await capture(name);
      // Capture the changed sections, not just their unchanged page heroes.
      // Baseline anchors are real containers that also existed before Vespi.
      if (width === 1440 || width === 390) {
        if (name === 'home') {
          await page.locator('[data-section="how"]').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
          await capture('home-how');
          const priceBand = page.locator('section').filter({ has: page.getByRole('link', { name: 'Смотреть, что входит', exact: true }) });
          await priceBand.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
          await capture('home-price-band');
        } else if (name === 'prices') {
          const target = baseline ? page.locator('#main-package').getByRole('button', { name: 'Оформить и оплатить', exact: true }) : page.locator('#main-package [data-vespi-assistant]');
          await target.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
          if (!baseline) {
            // The observer publishes after the scroll frame. Capture its real
            // settled state, not the preceding launcher's portrait frame.
            await page.locator('#chat-launcher[data-vespi-launcher-mode="indicator"]').waitFor({ state: 'attached' });
            await page.waitForFunction(() => {
              const launcher = document.getElementById('chat-launcher');
              if (!launcher) return false;
              const rect = launcher.getBoundingClientRect();
              return launcher.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
                && Number(getComputedStyle(launcher).opacity) >= 0.99 && rect.top < innerHeight && rect.bottom > 0;
            });
            await noDuplicatePortraits(page, `prices insight ${width}`);
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
        assert(await page.locator('[data-vespi-assistant], [data-vespi-indicator]').count() > 0, `${name}: shared assistant system is integrated`);
        const roles = await page.locator('[data-vespi-assistant]').evaluateAll(elements => elements.map(element => ({ role: element.dataset.vespiVariant, layout: element.dataset.vespiAssistant })));
        assert(roles.every(({ role, layout }) => ['route', 'inspector', 'celebrate', 'copilot'].includes(role) && ['inline-pill', 'editorial-callout', 'portal-copilot', 'floating-bar'].includes(layout)), `${name}: role and layout stay within the shared public contract`);
        await audit(`${name} ${width}`);
      }
    }
    if (sectionsOnly) { results.push({ width, targetedSectionCaptures: true }); await context.close(); continue; }
    if (reportOnly) {
      data = fixture(true); savedReport(data);
      await visit('/portal');
      await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
      await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
      await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
      await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
      await visit('/portal?view=docs&doc=statements');
      await page.getByRole('region', { name: 'Разбор документа', exact: true }).waitFor();
      await capture('portal-inspector-report');
      results.push({ width, savedReportCapture: true }); await context.close(); continue;
    }
    await visit('/guides#apostille');
    await page.locator('[data-guide-panel="apostille"]').waitFor();
    const advice = page.locator('[data-vespi-tip]').filter({ visible: true });
    await advice.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    if (!baseline) {
      await page.locator('[data-guide-sticky]').waitFor({ state: 'hidden' });
      assert.equal(await advice.getAttribute('data-vespi-variant'), 'inspector', 'Apostille advice uses inspector context');
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
      await page.locator('[data-guide-sticky]').waitFor({ state: 'visible' });
      await capture('guides-sticky');
    }

    await visit('/plan');
    if (!baseline) {
      assert(await page.locator('[data-vespi-variant="copilot"]').count() > 0, 'Questionnaire uses a copilot');
      assert(await page.locator('#document-check [data-vespi-variant="inspector"]').count() > 0, 'Document check uses inspector context');
    }
    await page.getByRole('button').filter({ hasText: 'Осенью 2027' }).click();
    if (!baseline) {
      const explanation = page.locator('[data-vespi-question-reason]');
      assert(await explanation.isVisible(), 'Each question gives a short reason');
      assert.match(await explanation.innerText(), /аттестат|лет|образован|допуск/i, 'Education context explains why the qualification matters');
    }
    await capture('plan-question');
    await page.getByRole('button').filter({ hasText: '11 классов' }).click();
    const draft = await page.evaluate(() => sessionStorage.getItem('iitaly_plan_draft_v1'));
    await visit('/guides#education');
    await page.locator('[data-guide-inline-action]').filter({ visible: true }).click();
    await page.getByRole('heading', { name: 'Какой средний балл?', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_plan_draft_v1')), draft, 'Assistant context preserves the quiz draft');
    await page.locator('#document-check').scrollIntoViewIfNeeded();
    await capture('plan-document');

    await visit('/portal');
    await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
    await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
    await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
    await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
    await page.locator('[data-portal-road]').waitFor();
    brands[`portal-${width}`] = await brand(page);
    if (!baseline && beforeBrands[`portal-${width}`]) assert.deepEqual(preservedBrand(brands[`portal-${width}`]), preservedBrand(beforeBrands[`portal-${width}`]), `portal ${width}: preserve shared palette and typography`);
    await capture('portal-overview');
    if (!baseline) {
      await checkWordmark(page);
      assert.equal(await page.locator('[data-portal-road] [data-vespi]').count(), 1, 'Overview keeps Vespi on the existing next-action road');
      assert.equal(await page.locator('[data-portal-overview] button').count(), 0, 'Overview adds no competing action buttons');
      assert.equal(await page.locator('[data-portal-road]').getAttribute('data-road-done'), '1', 'Progress only counts real route tasks');
      assert.equal(await page.locator('[data-portal-road]').getAttribute('data-road-total'), '7');
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
      assert(await page.locator('[data-step-detail] [data-vespi-variant="inspector"]').count() > 0, 'Current file step uses inspector context');
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
      assert.equal(await page.locator('[data-portal-document-inspector]').getAttribute('data-vespi-variant'), 'inspector');
      await noDuplicatePortraits(page, `saved report ${width}`);
      await audit(`saved report ${width}`);
    }
    await capture('portal-inspector-report');
    assert.deepEqual(errors, [], `Runtime errors at ${width}`);
    assert.deepEqual(unexpected, [], 'Review navigation cannot upload, mutate a user, or pay');
    assert.deepEqual(assistantCalls, [], 'Assistant messages never auto-send a paid AI request');
    results.push({ width, palettePreserved: true, navigationPreservesDraft: true, futureStepReadOnly: true, currentFileOneAction: true, noAutomaticAI: true, a11y: !baseline && !finalCapture, finalAssetCapture: finalCapture });
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
