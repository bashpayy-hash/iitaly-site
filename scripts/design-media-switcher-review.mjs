import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const tools = process.env.REVIEW_TOOLS;
const { chromium } = await import(pathToFileURL(path.join(tools, 'playwright/index.mjs')).href);
const out = path.resolve('out'), destination = path.resolve('design-review/media-switcher');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2', '.jpg':'image/jpeg' };
(async () => {
  await fs.mkdir(destination, { recursive:true });
  const server = createServer(async (req, res) => {
    const requested = path.resolve(out, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!requested.startsWith(out + path.sep) && requested !== out) return res.writeHead(403).end();
    for (const file of [requested, requested + '.html', path.join(requested, 'index.html')]) {
      try { if ((await fs.stat(file)).isFile()) { res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); return res.end(await fs.readFile(file)); } } catch {}
    }
    res.writeHead(404).end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ executablePath:process.env.REVIEW_CHROMIUM, args:['--no-sandbox', '--disable-dev-shm-usage'] });
  const errors = [], results = [];
  try {
    const context = await browser.newContext({ viewport:{ width:1440, height:900 }, reducedMotion:'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height:900 });
      for (const route of ['/', '/guides', '/guides/tests', '/guides/cimea', '/guides/stages/prepare', '/guides/visa', '/guides/visa/documents', '/guides/visa/timeline', '/prices', '/plan', '/universities']) {
        await page.goto(origin + route, { waitUntil:'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(async () => { for (const image of document.images) image.loading = 'eager'; await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, route + ' must not overflow');
        assert.equal(await page.locator('body').evaluate(element => Number(getComputedStyle(element, '::after').opacity)), .08);
        assert.match(await page.locator('body').evaluate(element => getComputedStyle(element, '::before').backgroundImage), /cream-texture/);
        assert.equal(await page.locator('[data-media-switcher] [data-story-art]').count(), 0);
        if (route.startsWith('/guides')) assert.equal(await page.locator('[data-story-art]').count(), 0, 'No large illustrations in guide lists');
        for (const image of await page.locator('[data-story-art] img').all()) assert(await image.evaluate(element => element.naturalWidth > 0), 'Illustration must resolve');
        if (route === '/') {
          assert.equal(await page.locator('[data-vespi-intro=home]').count(), 1);
          assert.equal(await page.locator('[data-public-bento], [data-university-switcher]').count(), 0);
        }
        if (route === '/plan') {
          await page.evaluate(() => { localStorage.removeItem('iitaly_plan_draft_v1'); sessionStorage.removeItem('iitaly_plan_draft_v1'); });
          await page.reload({ waitUntil:'networkidle' });
          assert.equal(await page.locator('[data-editorial-atmosphere]').count(), 0);
          assert.equal(await page.locator('[data-section=plan-header]').evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)');
          // Owner, 6–7 Nov: Vespi does something, animated, in the plan header;
          // the text sits in the middle over the scene, the scene softly blurred behind it.
          const scene = page.locator('[data-section=plan-header] [data-plan-hero-scene]');
          assert.equal(await scene.count(), 1, 'The plan header has its living scene');
          assert.equal(await scene.locator('img[data-plan-scene=loggia]').evaluate(element => element.naturalWidth > 0), true);
          assert.equal(await scene.locator('video[data-living-landscape=plan-loggia]').count(), 1);
          assert.equal(await scene.evaluate(element => getComputedStyle(element.parentElement).borderRadius), width <= 640 ? '24px' : '28px');
          const [tile, title] = await Promise.all([scene.boundingBox(), page.locator('[data-section=plan-header] h1').boundingBox()]);
          assert(title.y > tile.y && title.y + title.height < tile.y + tile.height * .6, 'The heading sits inside the scene, above Vespi');
          assert(Math.abs((title.x + title.width / 2) - (tile.x + tile.width / 2)) < 2, 'The heading is centred over the scene');
          if (width === 1440) assert((await page.locator('#questionnaire').boundingBox()).width >= 1100, 'Plan must use the full workspace');
          await page.getByRole('link', { name:'Проверить документ', exact:true }).click();
          assert.equal(await page.locator('#questionnaire').isVisible(), false);
          assert.equal(await page.locator('#document-check').isVisible(), true);
          await page.goBack();
          await page.locator('[data-plan-question]').waitFor();
          if (width !== 320) { await page.evaluate(() => scrollTo(0,0)); await page.screenshot({path:path.join(destination, `plan-question-${width}.png`),fullPage:true}); }
          // All real questions remain one at a time; no fixture changes to the builder.
          for (let question = 0; question < 10; question++) {
            assert.equal(await page.locator('[data-plan-question]').count(), 1);
            await page.locator('[data-plan-question] + div button[aria-pressed]').first().click();
          }
          const skip = page.getByRole('button', { name:/Показать|Пропустить/ });
          if (await skip.count()) await skip.first().click();
          await page.getByRole('button', { name:'Открыть мой план', exact:true }).click();
          assert.equal(await page.locator('[data-assessment-route] [data-instruction-point]').count(), 1);
          assert((await page.locator('[data-assessment-route] [data-flight-stop]').count()) > 5);
          await page.locator('[data-assessment-route] [data-instruction-next]').click();
          assert.equal(new URL(page.url()).searchParams.get('step'), '2');
          await page.reload({ waitUntil:'networkidle' });
          await page.locator('[data-assessment-route] [data-instruction-point="2"]').waitFor();
          await page.goBack();
          await page.locator('[data-assessment-route] [data-instruction-point="1"]').waitFor();
        }
        if (route === '/universities') {
          await page.evaluate(() => localStorage.removeItem('iitaly_university_choice_v1'));
          await page.reload({ waitUntil:'networkidle' });
          const comparison = page.locator('#compare-universities');
          assert.equal(await page.locator('[data-university-page]').evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)');
          // Owner 2026-11-03: an empty place offers no «Выбрать» button and stands straight.
          assert.equal(await comparison.locator('[data-deck-choose]').count(), 0, 'Nothing to choose before a university is added');
          assert.deepEqual(await comparison.locator('[data-deck-empty]').evaluateAll(nodes => nodes.map(n => getComputedStyle(n).transform)), ['none', 'none', 'none'], 'Empty places are not tilted');
          await comparison.getByLabel('Университет 1', { exact:true }).selectOption('unipd');
          await comparison.locator('[data-deck-choose=unipd]').click();
          assert.match(await comparison.locator('[data-university-decision]').innerText(), /Основной вуз.*Padova/s);
          await comparison.getByLabel('Университет 2', { exact:true }).selectOption('unibo');
          await comparison.getByRole('button', { name:'Таблица', exact:true }).click();
          await comparison.locator('tfoot').getByRole('button', { name:/Bologna/ }).click();
          assert.equal(await comparison.locator('thead [data-primary=true]').count(), 1);
          assert.match(await comparison.locator('thead [data-primary=true]').innerText(), /Bologna.*Выбран основной вуз/s);
          await page.reload({ waitUntil:'networkidle' });
          await comparison.getByRole('button', { name:'Таблица', exact:true }).click();
          await page.locator('thead [data-primary=true]').waitFor();
          assert.equal(await comparison.getByLabel('Университет 1', { exact:true }).inputValue(), 'unipd');
          assert.equal(await comparison.getByLabel('Университет 2', { exact:true }).inputValue(), 'unibo');
          const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('iitaly_university_choice_v1')));
          assert.equal(stored.primaryId, 'unibo');
          await comparison.getByRole('button', { name:'Открыть в отдельном окне' }).click();
          const dialog = page.getByRole('dialog');
          await dialog.locator('tfoot').getByRole('button', { name:/Padova/ }).click();
          await dialog.getByRole('button', { name:'Закрыть сравнение' }).click();
          assert.match(await comparison.locator('thead [data-primary=true]').innerText(), /Padova/);
          // Owner brief 2026-11-02: the decision plaque says «Перейти в Мой план».
          await comparison.getByRole('link', { name:/Перейти в Мой план/ }).click();
          await page.locator('[data-plan-university=unipd]').waitFor();
          assert.equal(new URL(page.url()).pathname, '/plan');
          await page.goto(origin + '/universities', { waitUntil:'networkidle' });
          assert.equal(await page.locator('[data-deck-university][data-primary=true]').count(), 1);
        }
        if (route === '/guides/tests') {
          // Owner 2 Nov (apple.com «Learn all about»): the topic page is a row of
          // step cards and every point has its own page; nothing is cut.
          const cards = page.locator('[data-guide-step-card]');
          assert.equal(await cards.count(), 3);
          assert.equal(await page.locator('[data-instruction-point]').count(), 0, 'Step text lives on step pages');
          assert.doesNotMatch(await page.locator('article').innerText(), /Padova|Падов/);
          // Step pages are walked in a separate tab that waits for URLs and
          // elements. Quick in-page navigation leaves Next's background route
          // checks in flight, so a network-idle wait on this tab afterwards
          // could hang; closing the side tab ends them.
          const steps = await context.newPage();
          steps.on('pageerror', error => errors.push(error.message));
          await steps.setViewportSize({ width, height:900 });
          await steps.goto(origin + route, { waitUntil:'networkidle' }); // fresh tab: hydrated before the clicks
          const stepCards = steps.locator('[data-guide-step-card]');
          await stepCards.nth(1).click();
          await steps.waitForURL('**/guides/tests/2');
          const point = steps.locator('[data-instruction-point="2"]');
          assert.match(await point.innerText(), /Результат/);
          assert.equal(await point.evaluate(element => getComputedStyle(element).animationName), 'none');
          await steps.reload({ waitUntil:'load' });
          assert.equal(await steps.locator('[data-instruction-point="2"]').count(), 1);
          await steps.goBack();
          await steps.waitForURL(url => url.pathname === '/guides/tests');
          await stepCards.first().waitFor();
          // Keyboard: the cards are plain links in reading order.
          await stepCards.first().focus(); await steps.keyboard.press('Tab');
          assert.equal(await steps.evaluate(() => document.activeElement.dataset.guideStepCard), '2');
          await steps.keyboard.press('Enter');
          await steps.waitForURL('**/guides/tests/2');
          await steps.close();
          // Old inline-switcher links keep working (the page redirects itself after
          // hydration). Opened in a fresh tab: a document navigation started while
          // Next's client navigation above is still settling can be aborted by it.
          const old = await context.newPage(); old.on('pageerror', error => errors.push(error.message));
          await old.goto(origin + '/guides/tests?point=3', { waitUntil:'domcontentloaded' });
          await old.waitForURL('**/guides/tests/3');
          await old.locator('[data-instruction-point="3"]').waitFor();
          await old.close();
        }
        if (route === '/guides/visa/documents') {
          await page.getByRole('button', { name:'Отметить собранным' }).click();
          await page.getByRole('button', { name:'Далее', exact:true }).click();
          await page.getByRole('button', { name:'Назад', exact:true }).click();
          assert.equal(await page.getByRole('button', { name:'Собрано — снять отметку' }).getAttribute('aria-pressed'), 'true');
        }
        if (width !== 320) {
          await page.addScriptTag({ path:path.join(tools, 'axe-core/axe.min.js') });
          const violations = await page.evaluate(async () => (await axe.run(document, { runOnly:{ type:'tag', values:['wcag2a','wcag2aa','wcag21aa'] } })).violations.map(item => ({ id:item.id, nodes:item.nodes.map(node => ({ target:node.target, summary:node.failureSummary })) })));
          assert.deepEqual(violations, [], `${route}: accessibility`);
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path:path.join(destination, `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}-${width}.png`), fullPage:true });
        }
        results.push({ route, width }); console.log(width, route, 'passed');
      }
    }
    assert.deepEqual(errors, []);
    await fs.writeFile(path.join(destination, 'results.json'), JSON.stringify({ results, errors }, null, 2));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
