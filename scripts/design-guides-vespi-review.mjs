import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out'), output = resolve('design-review/vespi-guides');
await mkdir(output, { recursive: true });
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2' };
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
const browser = await chromium.launch();
const results = [];
let activePage;
try {
  for (const width of [1440, 768, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, reducedMotion: 'reduce', locale: 'ru-RU' });
    const chats = [], events = [], unexpected = [], errors = [];
    await context.route('**/*', route => {
      const req = route.request(), url = new URL(req.url());
      if (url.pathname === '/api/event') { events.push(req.postDataJSON()); return route.fulfill({ json: { ok: true } }); }
      if (url.pathname === '/health/ai') return route.fulfill({ json: { ok: true, code: 'AI_READY' } });
      if (url.pathname === '/api/chat') { chats.push(req.postDataJSON()); return route.fulfill({ json: { reply: `Синтетический ответ ${chats.length}.` } }); }
      if (url.pathname.startsWith('/api/')) unexpected.push(url.pathname);
      return url.origin === origin ? route.continue() : route.abort();
    });
    const page = await context.newPage(); activePage = page;
    page.on('pageerror', error => errors.push(error.message));
    async function visit(path) { await page.goto(origin + path, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); }
    async function screenshot(name) { if (width === 1440 || width === 390) await page.screenshot({ path: resolve(output, `${name}-${width}.png`) }); }
    async function audit(where) {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${where}: no horizontal scrolling`);
      await page.addScriptTag({ path: resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], `${where}: accessibility`);
    }
    function currentNext(id) { return page.locator(`[data-guide-next="${id}"]`).filter({ visible: true }); }
    async function readingSurfaceContrast() {
      // An unresolved surface token silently makes these controls transparent.
      // Verify the painted number, not its intentionally transparent stage link.
      const stageNumber = page.locator('[data-guide-timeline] a[aria-current="step"] > span[aria-hidden="true"]');
      const nextTopic = page.locator('[data-guide-next-topic]').filter({ visible: true });
      for (const [label, control] of [['Current stage number', stageNumber], ['Next topic', nextTopic]]) {
        assert.equal(await control.count(), 1, `${label}: one active control`);
        const colors = await control.evaluate(element => {
          const style = getComputedStyle(element);
          return { background: style.backgroundColor, text: style.color };
        });
        assert.deepEqual(colors, { background: 'rgb(20, 20, 19)', text: 'rgb(255, 255, 255)' }, `${label}: opaque ink surface preserves readable white text`);
      }
    }
    async function addProviderBadge() {
      await page.evaluate(() => {
        const badge = document.createElement('iframe');
        badge.id = 'nl-badge-frame'; badge.title = 'Hosting badge fixture';
        badge.style.cssText = 'position:fixed;right:16px;bottom:16px;width:185px;height:44px;border:0;z-index:2147483647';
        badge.srcdoc = '<body style="margin:0;background:#122a30;color:white;font:13px sans-serif;display:grid;place-items:center;height:44px;border-radius:24px">Hosting badge fixture</body>';
        document.body.append(badge);
      });
    }
    async function openHelper() {
      await page.getByRole('button', { name: 'Есть вопрос? Спроси Веспи', exact: true }).click();
      await page.getByRole('dialog', { name: 'ИИ-консультант' }).waitFor();
      await page.waitForFunction(() => document.activeElement === document.getElementById('chat-input'));
    }

    // A real partial local quiz draft must survive a reading detour.
    await visit('/plan');
    await page.getByRole('button').filter({ hasText: 'Осенью 2027' }).click();
    await page.getByRole('button').filter({ hasText: '11 классов' }).click();
    const draft = await page.evaluate(() => sessionStorage.getItem('iitaly_plan_draft_v1'));
    await visit('/guides');
    await page.locator('[data-section="guides-header"] [data-editorial-art] img').evaluate(img => img.decode());
    const avatar = page.locator('#guide-command [data-vespi-search-avatar]');
    assert.equal(await avatar.count(), 1, 'Search has one deliberate compact avatar');
    assert.equal(await avatar.getAttribute('src'), '/mascot/vespi-search-avatar.webp');
    await avatar.evaluate(image => image.decode());
    assert.equal(await page.locator('[data-vespi-intro="guides"]').count(), 0, 'Guides have no duplicated promotional introduction');
    assert.equal(await page.locator('#chat-launcher img').count(), 0, 'Floating help remains a text-and-icon entry');
    assert.equal(await page.locator('main time').count(),1,'The common rule-verification date appears once');
    assert.equal(await page.locator('[data-guide-sticky]').count(), 0, 'Reading has no competing floating sales offer');
    assert.equal(await page.locator('[data-guide-current] [data-vespi]').count(), 0, 'Stage navigation remains text-only');
    assert(await page.locator('#guide-search').evaluate(input => input.getBoundingClientRect().height >= 44), 'The search field has a 44px touch target');
    await screenshot('guides-top');
    await page.locator('[data-guide-select="education"]').click();
    assert.equal(new URL(page.url()).hash, '#education');
    assert.equal(await page.getByRole('navigation', { name: 'Этапы справочника' }).locator('[aria-current="step"]').getAttribute('href'), '#education');
    assert.match(await page.locator('[data-vespi-tip]').filter({ visible: true }).innerText(), /Foundation не заменяет выпускной аттестат/);
    assert.equal(await page.locator('[data-vespi-tip]').filter({ visible: true }).locator('img').count(), 0, 'Action advice is readable without a repeated mascot');
    assert.equal(await page.locator('[data-guide-panel]').filter({ visible: true }).count(), 1, 'Only the selected topic is expanded');
    assert.equal(await page.locator('[data-guide-select="education"]').getAttribute('aria-expanded'), 'true');
    await readingSurfaceContrast();
    assert(await currentNext('education').getByRole('link', { name: 'Разобраться с моим аттестатом', exact: true }).isVisible());
    await currentNext('education').getByRole('link', { name: 'Разобраться с моим аттестатом', exact: true }).click();
    await page.locator('[data-guide-origin="education"]').waitFor();
    await page.getByRole('heading', { name: 'Какой средний балл?', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_plan_draft_v1')), draft, 'Guide context cannot rewrite quiz answers');
    await screenshot('plan-continuation');

    await visit('/guides#apostille');
    await page.locator('[data-guide-panel="apostille"]').waitFor();
    await page.waitForFunction(() => {
      const heading = document.querySelector('[data-guide-panel="apostille"] #active-guide-title');
      if (!heading) return false;
      const rect = heading.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight;
    });
    const refs = page.locator('a[target="_blank"]').filter({ visible: true });
    assert(await refs.count() > 1, 'Official sources remain immediately available');
    for (const ref of await refs.all()) assert.match(await ref.getAttribute('rel'), /noopener/);
    await audit('guide chapter ' + width);
    await screenshot('guides-apostille');
    const inlineAdvice = page.locator('[data-vespi-tip]').filter({ visible: true });
    await inlineAdvice.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.locator('[data-guide-sticky]').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#chat-launcher img').count(), 0, 'The helper launcher never repeats a head');
    assert.equal(await inlineAdvice.getAttribute('data-guide-next'), 'apostille', 'Document advice stays tied to the selected topic');
    assert(await page.locator('img[data-vespi]').evaluateAll(images => images.filter(image => {
      const rect = image.getBoundingClientRect();
      return image.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
        && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    }).length <= 1), 'Visible contextual advice does not compete with another Vespi portrait');
    const documentAction = currentNext('apostille').locator('[data-guide-inline-action]');
    await documentAction.evaluate(action => action.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.locator('[data-guide-sticky]').waitFor({ state: 'hidden' });
    assert(await documentAction.evaluate(action => {
      const rect = action.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight
        && rect.width >= 44 && rect.height >= 44
        && action.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
    }), 'The inline document action is fully visible, reachable, and replaces the sticky offer');
    await screenshot('guides-next-action');
    await documentAction.click();
    await page.locator('[data-guide-origin="apostille"]').waitFor();
    assert.equal(await page.getByRole('combobox', { name: 'Программа', exact: true }).inputValue(), 'general');
    assert.equal(await page.getByRole('combobox', { name: 'Учебный год заявки', exact: true }).inputValue(), 'unspecified');
    assert.equal(unexpected.length, 0, 'Reading and navigating do not upload, pay or mutate an account');
    await screenshot('document-continuation');

    await visit('/guides#translation');
    await openHelper();
    assert.equal(await page.locator('[data-guide-sticky]').count(), 0, 'No sales bar is mounted behind the open helper');
    const question = page.getByRole('textbox', { name: 'Вопрос ИИ-консультанту' });
    assert.equal(await page.locator('[data-chat-guide-context]').getAttribute('data-chat-guide-context'), 'translation');
    await page.getByRole('link', { name: 'Что проверить в переводе для вуза и для визы?', exact: true }).click();
    assert.equal(chats.length, 0, 'A suggested question is a draft, not an automatic AI request');
    assert.equal(await question.inputValue(), 'Что проверить в переводе для вуза и для визы?');
    await audit('contextual helper ' + width);
    await screenshot('guides-helper');
    // The hosting badge exists only on production; reproduce its observed frame.
    await addProviderBadge();
    assert(await page.getByRole('button', { name: 'Отправить', exact: true }).evaluate(button => {
      const rect = button.getBoundingClientRect();
      return button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
    }), 'The provider badge cannot intercept Send');
    await screenshot('guides-helper-with-provider');
    if (width === 390) {
      await page.setViewportSize({ width, height:390 });
      assert(await page.getByRole('button', { name:'Отправить', exact:true }).evaluate(button => {
        const rect=button.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= innerHeight && button.contains(document.elementFromPoint(rect.x+rect.width/2, rect.y+rect.height/2));
      }), 'Send remains reachable in a short viewport');
      await page.setViewportSize({ width, height:844 });
    }
    await page.getByRole('button', { name: 'Отправить', exact: true }).click();
    await page.getByText('Синтетический ответ 1.', { exact: true }).waitFor();
    assert.match(chats[0].messages.at(-1).content, /Открытая тема справочника IITALY: translation/);
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_asked')), '1');
    await question.fill('Мой незаконченный вопрос');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    const launcher = page.locator('#chat-launcher');
    assert(await launcher.evaluate(button => button.getBoundingClientRect().bottom < document.getElementById('nl-badge-frame').getBoundingClientRect().top), 'The launcher also stays above the badge');
    await page.locator('#nl-badge-frame').evaluate(badge => badge.remove());
    // A topic change updates helper context but preserves the user's draft.
    await page.getByRole('navigation', { name: 'Этапы справочника' }).locator('a[href="#permesso"]').click();
    await openHelper();
    assert.equal(await question.inputValue(), 'Мой незаконченный вопрос');
    assert.equal(await page.locator('[data-chat-guide-context]').getAttribute('data-chat-guide-context'), 'permesso');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(await currentNext('permesso').getByRole('link', { name: 'Открыть тренажёр Modulo 1', exact: true }).getAttribute('href'), '/guides/permesso-modulo-1');
    assert.equal(await page.locator('[data-guide-panel]').filter({ visible: true }).count(), 1, 'One expanded topic at every viewport');
    assert.equal(await page.locator('[data-guide-select][aria-expanded="true"]').count(), 1);
    assert(await page.locator('[data-guide-select], [data-guide-panel], [data-guide-sticky]').evaluateAll(elements => elements.every(element => {
      const style = getComputedStyle(element);
      return [style.transitionDuration, style.animationDuration].every(value => value.split(',').every(duration => parseFloat(duration) <= 0.01));
    })), 'Reduced motion removes card and conversion-bar movement');
    assert.equal(await page.locator('[data-guide-current]').getAttribute('data-guide-current'), 'permesso', 'The chapter indicator tracks the selected topic');

    const search = page.getByRole('searchbox', { name: 'Найти тему' });
    await search.fill('вопрос-без-совпадения-123');
    await page.getByRole('button', { name: 'Спросить Веспи', exact: true }).click();
    // Opening focuses the field in rAF. A preserved value can be read earlier;
    // wait for the real keyboard target before testing Escape.
    await page.waitForFunction(() => document.activeElement === document.getElementById('chat-input'));
    assert.equal(chats.length, 1, 'Empty-search help does not consume a question');
    assert.equal(await question.inputValue(), 'Мой незаконченный вопрос', 'An empty search cannot replace an existing chat draft');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Сбросить поиск', exact: true }).click();
    // Timeline stages intentionally filter 2 / 8 / 3 cards instead of listing all
    // thirteen native disclosures at once. Search still spans every stage.
    const stageNavigation = page.getByRole('navigation', { name: 'Этапы справочника' });
    assert.equal(await page.locator('[data-guide-select]').count(), 2, 'Reset returns to the first stage');
    const chapterIds = new Set();
    for (const [stageLabel, expected] of [['education', 2], ['apostille', 8], ['permesso', 3]]) {
      await stageNavigation.locator(`a[href="#${stageLabel}"]`).click();
      const cards = page.locator('[data-guide-select]');
      assert.equal(await cards.count(), expected, stageLabel + ': correct chapter count');
      for (const id of await cards.evaluateAll(nodes => nodes.map(node => node.dataset.guideSelect))) chapterIds.add(id);
      assert.equal(await stageNavigation.locator('[aria-current="step"]').getAttribute('href'), '#'+stageLabel);
      await readingSurfaceContrast();
    }
    assert.equal(chapterIds.size, 13, 'All reviewed topics remain available across the three stages');
    assert(chapterIds.has('visa') && chapterIds.has('permesso'), 'Visa and the original trainer entry remain available');
    await search.fill('CIMEA');
    assert(await page.locator('[data-guide-select="cimea"]').isVisible(), 'Search finds topics outside the selected stage');
    await page.locator('[data-guide-select="cimea"]').click();
    await page.waitForFunction(() => document.activeElement?.id === 'active-guide-title');
    assert.equal(await page.locator('#active-guide-title').evaluate(el => document.activeElement === el), true, 'Selecting a topic moves keyboard focus to its heading');
    await search.fill('CIMEA');
    assert.equal(await page.locator('[data-guide-panel]').filter({visible:true}).count(),0,'Searching suspends reading without duplicated content');
    await page.getByRole('button',{name:'Сбросить поиск',exact:true}).click();
    assert.equal(await search.evaluate(el=>document.activeElement===el),true,'Reset returns focus to search');
    await page.locator('[data-guide-panel="education"]').waitFor();
    await visit('/guides#visa');
    await search.fill('CIMEA');
    assert.equal(await page.locator('[data-guide-panel]').filter({visible:true}).count(),0);
    await search.fill('');
    await page.locator('[data-guide-panel="visa"]').waitFor();
    assert.equal(new URL(page.url()).hash,'#visa','Erasing search restores the same reading topic');
    // The timeline's next action traverses all reviewed chapters, including stage boundaries.
    await visit('/guides#education');
    const orderedTopics = ['education','tests','apostille','translation','cimea','con','iseeu','visa','minors','military','permesso','codice','health-travel'];
    for (let index = 0; index < orderedTopics.length; index++) {
      const id = orderedTopics[index];
      await page.locator(`[data-guide-panel="${id}"]`).filter({visible:true}).waitFor();
      assert.equal(new URL(page.url()).hash, '#'+id);
      assert.equal(await page.locator('[data-guide-panel]').filter({visible:true}).count(),1);
      if (index < orderedTopics.length-1) await page.locator('[data-guide-next-topic]').filter({visible:true}).click();
    }
    const invite = page.locator('[data-guide-invite]');
    assert.equal(await invite.count(),1,'One contextual invitation replaces the promotional banner');
    assert.equal(await invite.locator('[data-vespi-guide-invite]').getAttribute('src'),'/mascot/vespi-guide-invite.webp');
    await invite.locator('img').evaluate(image=>image.decode());
    assert.equal(await page.locator('[data-guide-sticky]').count(),0);
    assert(events.some(e => e.event === 'guide_next_action' && e.props.topic === 'apostille'));
    assert(!events.some(e => JSON.stringify(e).includes('вопрос-без-совпадения')), 'Search text is not sent to analytics');
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpected, []);
    results.push({ width, stageFiltering:true, timelineNextAcrossStages:true, oneExpandedCard:true, contextualInsight:true, inlineActionVisibleAndReachable:true, draftPreserved:true, reviewContextUnchanged:true, guideAwareChat:true, noAutomaticQuestion:true, thirteenTopics:true, officialSourcesVisible:true, reducedMotion:true, providerBadgeSafe:true, noFloatingSalesOffer:true, a11y:true, overflow:false });
    await context.close();
  }
  await writeFile(resolve(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(output, 'failure.png') }).catch(() => {});
  throw error;
} finally { await browser.close(); await new Promise(done => server.close(done)); }
