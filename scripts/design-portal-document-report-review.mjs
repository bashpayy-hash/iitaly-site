import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS, 'REVIEW_TOOLS must point to isolated browser tools.');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const root = resolve('out'), output = resolve('design-review/portal-document-report');
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
const titles = {
  statements: 'Банковские выписки', apostille: 'Аттестат или диплом с апостилем',
  translate: 'Официальный перевод на итальянский', familyDocs: 'Семейные справки для стипендии',
  cimea: 'Подтверждение квалификации (DoV / CIMEA)', insurance: 'Медицинская страховка',
};
const sourceUrl = 'https://www.unibocconi.it/en/current-students/funding/iseeu-parificato-certificate-ay-2026-27';
const review = { profile: 'general', profileLabel: 'Общая проверка', academicYear: 'unspecified', applicantScope: 'unspecified', rulesStatus: 'unspecified', referenceYear: null, rulesVersion: '2026-10-13', verifiedOn: '2026-10-13', notice: 'Для проверки требований выбери программу и учебный год.', sources: [{ id: 'B26', label: 'Официальный источник Bocconi', url: sourceUrl }] };
const clarify = {
  verdict: 'warn', docTitle: 'Банковская выписка', summary: 'Содержимое читается. Для проверки требований нужно уточнить программу.',
  checks: [{ status: 'ok', label: 'Читаемость', note: 'Текст распознан полностью.' }, { status: 'unknown', label: 'Применимость требований', note: 'Учебный год не выбран.' }],
  problems: [], nextSteps: ['Выбери программу и учебный год.'], review,
};
const incorrect = {
  verdict: 'error', docTitle: 'Синтетическая справка', summary: 'В тестовом документе обнаружено расхождение периода.',
  checks: [{ status: 'error', label: 'Период доходов', note: 'Указан 2025 год, выбранный профиль требует 2024.' }],
  problems: [{ severity: 'critical', text: 'В справке указан доход за 2025 год.', fix: 'Запроси справку о доходах за 2024 год.' }],
  nextSteps: ['Загрузи исправленную справку после получения.'],
  review: { ...review, profile: 'bocconi', profileLabel: 'Bocconi', academicYear: '2026/27', applicantScope: 'kz-family-abroad', rulesStatus: 'verified', referenceYear: 2024, notice: 'Синтетический пример проверки выбранного профиля.' },
};
const approved = { verdict: 'ok', docTitle: 'Перевод', summary: 'Тестовый перевод читается, видимых ошибок нет.', checks: [{ status: 'ok', label: 'Данные документа', note: 'Имена и даты совпадают.' }], problems: [], nextSteps: [] };
const unreadable = { verdict: 'unreadable', docTitle: 'Семейная справка', summary: 'Текст на тестовом снимке размыт.', checks: [{ status: 'unknown', label: 'Читаемость', note: 'Поля невозможно прочитать.' }], problems: [], nextSteps: ['Загрузи чёткий скан всех страниц.'] };
function record(result, fileName) { return { verdict: result.verdict, summary: result.summary, critical: result.problems?.filter(p => p.severity === 'critical').length || 0, checkedAt: '2026-10-13T12:00:00.000Z', fileName, result: structuredClone(result) }; }
function fixture() {
  return { ok: true, client: { name: 'Тестовый профиль', surname: 'Testov', intakeYear: 2027, onboardingComplete: true, profile: { onboardingDone: true } },
    roadmap: [{ id: 'documents', title: 'Документы', tasks: Object.entries(titles).map(([id, t]) => ({ id, t, available: true, owner: id === 'familyDocs' ? 'родители' : 'Ты' })) }],
    done: { translate: true }, progress: { done: 1, total: 6, pct: 17 },
    docs: { apostille: record(incorrect, 'income-test.pdf'), translate: record(approved, 'translation-test.pdf'), familyDocs: record(unreadable, 'family-blurred-test.png'), cimea: { verdict: 'warn', summary: 'Сохранена только краткая сводка старой проверки.', critical: 0, fileName: 'legacy-test.pdf', checkedAt: '2026-09-01T12:00:00.000Z' } },
  };
}
const report = page => page.getByRole('region', { name: 'Разбор документа', exact: true });
const row = (page, task) => page.locator(`[data-document="${task}"]`);
async function backToList(page) {
  await page.getByRole('link', { name: 'Назад', exact: true }).click();
  await report(page).waitFor({ state: 'hidden' });
  assert.equal(new URL(page.url()).searchParams.get('doc'), null);
}
async function openReport(page, task) {
  const target = row(page, task);
  const link = await target.evaluate(element => element.tagName === 'A') ? target : target.getByRole('link');
  assert.equal(await link.count(), 1, 'Document row has one navigation path');
  await link.click();
  await report(page).waitFor();
  assert.equal(new URL(page.url()).searchParams.get('doc'), task);
  assert.equal(await report(page).getByRole('heading', { level: 2 }).count(), 1);
}
async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, label);
}
async function noListButtons(page, label) {
  assert.equal(await page.locator('button').count(), 0, `${label}: document lists and navigation have zero buttons`);
  for (const document of await page.locator('[data-document]').all()) {
    assert.equal(await document.evaluate(element => element.tagName), 'A', 'The document row itself is a link');
    assert.equal(await document.locator('a, button').count(), 0, 'A document row contains no nested action');
  }
}
async function reportActionLimit(page, label) {
  const buttons = page.locator('button');
  assert((await buttons.count()) <= 1, `${label}: a report has at most one button`);
  if (await buttons.count()) assert.equal(await buttons.innerText(), 'Приложить файл', 'The only report action is file selection');
  assert.doesNotMatch(await report(page).innerText(), /Спросить про этот шаг|Продолжить маршрут|Открыть разбор/);
}

try {
  for (const width of [1440, 390, 320]) {
    const data = fixture(), calls = { check: 0, save: 0 };
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', locale: 'ru-RU' });
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      const json = body => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      if (url.pathname === '/api/event') return json({ ok: true });
      if (url.pathname === '/health/ai') return json({ ok: true, code: 'AI_READY', retryable: true });
      if (url.pathname === '/api/portal/lookup') {
        assert.deepEqual(request.postDataJSON(), { code: 'TEST-01', surname: 'Testov' });
        return json(data);
      }
      if (url.pathname === '/api/check-document') {
        calls.check += 1;
        assert.deepEqual(request.postDataJSON().context, { profile: 'general', academicYear: 'unspecified', applicantScope: 'unspecified' }, 'Intake year does not silently choose document rules');
        return json({ ok: true, result: clarify });
      }
      if (url.pathname === '/api/portal/TEST-01/doc') {
        calls.save += 1;
        const body = request.postDataJSON();
        assert.equal(body.surname, 'Testov');
        assert.equal(body.task, 'statements');
        assert.deepEqual(body.result, clarify, 'Save the full result, including findings, next steps and source context');
        data.docs.statements = record(body.result, body.fileName);
        return json({ ok: true, docs: data.docs, done: data.done, progress: data.progress });
      }
      if (url.pathname.startsWith('/api/')) unexpectedApi.push(url.pathname);
      if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/portal?view=docs`, { waitUntil: 'networkidle' });
    await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
    await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
    await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
    await page.locator('[data-document-list]').waitFor();
    assert.equal(await page.locator('[data-document]').count(), 6, 'All required documents are visible without opening status groups');
    assert.deepEqual(await page.locator('[data-document-filter]').evaluateAll(elements => elements.map(element => element.dataset.documentFilter)), ['all', 'approved', 'fix', 'clarify', 'unreadable', 'missing']);
    assert.deepEqual(await page.locator('[data-document]').evaluateAll(elements => elements.map(element => element.dataset.document)), ['statements', 'apostille', 'cimea', 'familyDocs', 'insurance', 'translate'], 'Current file first, then documents needing action, then approved');
    assert.match(await page.locator('[data-document-filter=all]').innerText(), /Все 6/);
    assert.match(await page.locator('[data-document-filter=missing]').innerText(), /Не загружен 2/);
    await page.locator('[data-document-filter=fix]').click();
    assert.equal(await page.locator('[data-document]').count(), 1);
    assert.equal(await row(page, 'apostille').isVisible(), true);
    await page.locator('[data-document-filter=all]').click();
    await noListButtons(page, `Document list ${width}px`);
    await row(page, 'statements').click();
    await page.locator('[data-step-detail=statements]').waitFor();
    assert.equal(new URL(page.url()).searchParams.get('doc'), 'statements');
    assert.equal(await page.locator('button').count(), 1, 'Current document exposes only file selection');
    await page.getByText('Параметры следующей проверки', { exact: true }).click();
    assert.equal(await page.getByRole('combobox', { name: /^Стипендиальная программа/ }).inputValue(), 'general');
    assert.equal(await page.getByRole('combobox', { name: /^Учебный год заявки/ }).inputValue(), 'unspecified');
    await page.getByText('Параметры следующей проверки', { exact: true }).click();
    await page.getByRole('button', { name: 'Приложить файл', exact: true }).click();
    await page.locator('input[type=file]').setInputFiles({ name: 'test-bank-statement-' + 'long-filename-'.repeat(12) + '.txt', mimeType: 'text/plain', buffer: Buffer.from('SYNTHETIC DOCUMENT: bank balance is zero KZT on 31 December 2025. Test fixture without personal data.') });
    await report(page).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('doc'), 'statements', 'The saved result opens automatically and has an address');
    assert.match(await report(page).innerText(), /Нужно уточнить/);
    assert.match(await report(page).innerText(), /Учебный год не выбран/);
    assert.match(await report(page).innerText(), /Выбери программу и учебный год/);
    assert.doesNotMatch(await report(page).innerText(), /Нужно исправить|Критических ошибок:/);
    await noOverflow(page, `Clarification report ${width}px`);
    await reportActionLimit(page, `Clarification report ${width}px`);
    if (width === 390) await page.screenshot({ path: resolve(output, 'portal-document-clarify-390.png'), fullPage: true });
    await page.reload({ waitUntil: 'networkidle' });
    await report(page).waitFor();
    assert.match(await report(page).innerText(), /Учебный год не выбран/);
    assert.match(await report(page).innerText(), /Выбери программу и учебный год/);
    assert.deepEqual(calls, { check: 1, save: 1 }, 'Reload uses the stored report without another AI check');
    await backToList(page);
    assert.match(await row(page, 'statements').innerText(), /Нужно уточнить/);
    const clarifyColor = await page.locator('[data-document=statements] [data-outcome=clarify]').evaluate(element => getComputedStyle(element).color);
    const fixColor = await page.locator('[data-document=apostille] [data-outcome=fix]').evaluate(element => getComputedStyle(element).color);
    assert.notEqual(clarifyColor, fixColor, 'Clarification is not coloured as a document error');
    assert.match(await page.locator('[data-document-filter=clarify]').innerText(), /Нужно уточнить 2/);
    assert.match(await page.locator('[data-document-filter=missing]').innerText(), /Не загружен 1/);
    assert.equal(await row(page, 'translate').isVisible(), true, 'Approved files stay discoverable in the complete list');
    await noListButtons(page, `Document list ${width}px`);
    await noOverflow(page, `Document list ${width}px`);
    if (width === 390) await page.screenshot({ path: resolve(output, 'portal-document-list-390.png'), fullPage: true });
    await openReport(page, 'statements');
    await backToList(page);

    await openReport(page, 'apostille');
    assert.equal(await page.locator('button').count(), 0, 'A future document report is readable without a competing upload action');
    assert.match(await report(page).innerText(), /В справке указан доход за 2025 год/);
    assert.match(await report(page).innerText(), /Запроси справку о доходах за 2024 год/);
    assert.match(await report(page).innerText(), /Загрузи исправленную справку после получения/);
    assert.equal(await report(page).locator(`a[href="${sourceUrl}"]`).count(), 1);
    await noOverflow(page, `Full report ${width}px`);
    await reportActionLimit(page, `Full report ${width}px`);
    const sources = report(page).locator('details').filter({ hasText: 'Источники и дата сверки правил' });
    assert.equal(await sources.evaluate(element => element.open), false, 'Sources remain available in a closed disclosure');
    const nextStep = report(page).getByRole('heading', { name: 'Следующий шаг', exact: true });
    const checks = report(page).getByRole('heading', { name: 'Что проверено', exact: true });
    assert((await nextStep.boundingBox()).y < (await checks.boundingBox()).y, 'The next action is shown before supporting checks');
    await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[aria-label="Разбор документа"]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary })) })));
    await page.screenshot({ path: resolve(output, `portal-document-report-${width}.png`), fullPage: true });
    await backToList(page);
    for (const [task, summary] of [['translate', approved.summary], ['familyDocs', unreadable.summary], ['cimea', data.docs.cimea.summary]]) {
      await openReport(page, task);
      assert((await report(page).innerText()).includes(summary));
      if (task === 'translate') {
        assert.doesNotMatch(await report(page).innerText(), /Нужно исправить/);
        assert.equal(await page.locator('button').count(), 0, 'Completed file has no upload action');
      }
      if (task === 'familyDocs') {
        assert.match(await report(page).innerText(), /Загрузи чёткий скан всех страниц/);
        assert.equal(await page.locator('button').count(), 0, 'Parent-owned reports contain no student action');
      }
      if (task === 'cimea') {
        await report(page).getByRole('heading', { name: 'Для полного разбора нужна новая проверка', exact: true }).waitFor();
        assert.match(await report(page).innerText(), /От этой проверки сохранился только краткий итог\./);
      }
      await noOverflow(page, `${task} ${width}px`);
      await reportActionLimit(page, `${task} report ${width}px`);
      await backToList(page);
    }
    await page.getByRole('link', { name: 'Обзор', exact: true }).filter({ visible: true }).click();
    assert.equal(await page.getByText(/^Проверены:/).count(), 0, 'Overview no longer repeats document aggregate counters');
    const overview = page.locator('[data-portal-overview]');
    assert.match(await overview.innerText(), /Нужно уточнить/);
    assert.match(await overview.innerText(), /Банковские выписки/, 'Overview identifies the document rather than an opaque filename');
    assert((await overview.innerText()).includes(data.docs.statements.summary), 'Overview includes the saved review reason');
    await noOverflow(page, `Document summary ${width}px`);
    await page.getByRole('link', { name: 'План', exact: true }).filter({ visible: true }).click();
    const plan = page.locator('#portal-stage-documents');
    assert.match(await plan.innerText(), /Нужно уточнить/);
    assert.equal(await page.locator('button').count(), 0, 'Plan has no action buttons');
    const statement = plan.locator('[data-portal-task=statements]');
    await (await statement.evaluate(element => element.tagName === 'A') ? statement : statement.getByRole('link')).click();
    await report(page).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('doc'), 'statements');
    assert.deepEqual(calls, { check: 1, save: 1 });
    results.push({ width, fullReportAndReload: true, clarificationIsNotAnError: true, fiveExactOutcomes: true, visibleListAndCountedFilters: true, consistentStatus: true, listsHaveZeroButtons: true, reportHasAtMostOneFileAction: true, planReopensReport: true, overflow: false, seriousAxe: violations });
    await context.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedApi, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors, unexpectedApi }, null, 2));
  console.log(JSON.stringify({ results, errors, unexpectedApi }, null, 2));
  for (const result of results) assert.deepEqual(result.seriousAxe, [], `Report accessibility ${result.width}px`);
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
