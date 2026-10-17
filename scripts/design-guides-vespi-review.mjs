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
    async function openHelper() {
      if (width >= 1024) await page.getByRole('button', { name: 'Разобрать тему с Веспи', exact: true }).click();
      else if (await page.locator('header summary').isVisible()) {
        await page.locator('header summary').click();
        await page.getByRole('button', { name: 'Задать вопрос', exact: true }).click();
      } else {
        await page.getByRole('button', { name: 'Задать вопрос ИИ-консультанту', exact: true }).click();
      }
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
    assert.equal(await page.locator('[data-section="guides-header"] [data-vespi]').count(), 0, 'The guide hero leaves the character for personal help');
    assert.equal(await page.locator('[data-guide-current] [data-vespi], [data-vespi-tip] [data-vespi]').count(), 0, 'Navigation and reviewed warnings do not repeat the mascot');
    await screenshot('guides-top');
    await page.getByRole('link', { name: 'У меня 11 классов. С чего начать?', exact: true }).click();
    assert.equal(new URL(page.url()).hash, '#education');
    assert.equal(await page.getByRole('navigation', { name: 'Этапы справочника' }).locator('[aria-current="step"]').innerText(), 'Выбрать маршрут');
    assert.match(await page.locator('[data-vespi-tip]').filter({ visible: true }).innerText(), /Foundation не заменяет выпускной аттестат/);
    assert.equal(await page.locator('main [data-vespi]').filter({ visible: true }).count(), 1, 'One character at the selected chapter’s next action');
    assert.match(await currentNext('education').locator('[data-vespi]').getAttribute('src'), /vespi-avatar-route-/);
    assert(await currentNext('education').getByRole('link', { name: 'Составить план', exact: true }).isVisible());
    await currentNext('education').getByRole('link', { name: 'Составить план', exact: true }).click();
    await page.locator('[data-guide-origin="education"]').waitFor();
    await page.getByRole('heading', { name: 'Какой средний балл?', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('iitaly_plan_draft_v1')), draft, 'Guide context cannot rewrite quiz answers');
    await screenshot('plan-continuation');

    await visit('/guides#apostille');
    const refs = page.locator('a[target="_blank"]').filter({ visible: true });
    assert(await refs.count() > 1, 'Official sources remain immediately available');
    for (const ref of await refs.all()) assert.match(await ref.getAttribute('rel'), /noopener/);
    await audit('guide chapter ' + width);
    await screenshot('guides-apostille');
    await currentNext('apostille').scrollIntoViewIfNeeded();
    await screenshot('guides-next-action');
    await currentNext('apostille').getByRole('link', { name: 'Проверить документ', exact: true }).click();
    await page.locator('[data-guide-origin="apostille"]').waitFor();
    assert.equal(await page.getByRole('combobox', { name: 'Программа', exact: true }).inputValue(), 'general');
    assert.equal(await page.getByRole('combobox', { name: 'Учебный год заявки', exact: true }).inputValue(), 'unspecified');
    assert.equal(unexpected.length, 0, 'Reading and navigating do not upload, pay or mutate an account');
    await screenshot('document-continuation');

    await visit('/guides#translation');
    await openHelper();
    const question = page.getByRole('textbox', { name: 'Вопрос ИИ-консультанту' });
    assert.equal(await page.locator('[data-chat-guide-context]').getAttribute('data-chat-guide-context'), 'translation');
    await page.getByRole('link', { name: 'Что проверить в переводе для вуза и для визы?', exact: true }).click();
    assert.equal(chats.length, 0, 'A suggested question is a draft, not an automatic AI request');
    assert.equal(await question.inputValue(), 'Что проверить в переводе для вуза и для визы?');
    await audit('contextual helper ' + width);
    await screenshot('guides-helper');
    // The hosting badge exists only on production; reproduce its observed frame.
    await page.evaluate(() => {
      const badge = document.createElement('iframe');
      badge.id = 'nl-badge-frame'; badge.title = 'Hosting badge fixture';
      badge.style.cssText = 'position:fixed;right:16px;bottom:16px;width:185px;height:44px;border:0;z-index:2147483647';
      badge.srcdoc = '<body style="margin:0;background:#122a30;color:white;font:13px sans-serif;display:grid;place-items:center;height:44px;border-radius:24px">Hosting badge fixture</body>';
      document.body.append(badge);
    });
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
    await page.getByRole('navigation', { name: 'Этапы справочника' }).getByRole('link', { name: 'После приезда', exact: true }).click();
    await openHelper();
    assert.equal(await question.inputValue(), 'Мой незаконченный вопрос');
    assert.equal(await page.locator('[data-chat-guide-context]').getAttribute('data-chat-guide-context'), 'permesso');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(await currentNext('permesso').getByRole('link', { name: 'Открыть тренажёр Modulo 1', exact: true }).getAttribute('href'), '/guides/permesso-modulo-1');
    if (width < 1024) assert.equal(await page.locator('details[name="guide-chapter"][open]').count(), 1, 'Only one chapter is open on mobile');
    assert.equal(await page.locator('[data-guide-stage-marker]').evaluate(marker => getComputedStyle(marker).transitionDuration), '0s', 'Reduced motion removes topic-indicator travel');
    assert.equal(await page.locator('[data-guide-current]').getAttribute('data-guide-current'), 'permesso', 'The quiet indicator still tracks the selected topic');

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
    await page.getByRole('button', { name: 'Показать все темы', exact: true }).click();
    const chapters = width >= 1024 ? page.getByRole('navigation', { name: 'Главы справочника' }).locator('button[aria-controls]') : page.locator('details[name="guide-chapter"] > summary');
    assert.equal(await chapters.count(), 13, 'All reviewed topics remain available');
    assert(events.some(e => e.event === 'guide_next_action' && e.props.topic === 'apostille'));
    assert(!events.some(e => JSON.stringify(e).includes('вопрос-без-совпадения')), 'Search text is not sent to analytics');
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpected, []);
    results.push({ width, draftPreserved:true, reviewContextUnchanged:true, guideAwareChat:true, noAutomaticQuestion:true, thirteenTopics:true, officialSourcesVisible:true, reducedMotion:true, providerBadgeSafe:true, a11y:true, overflow:false });
    await context.close();
  }
  await writeFile(resolve(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(output, 'failure.png') }).catch(() => {});
  throw error;
} finally { await browser.close(); await new Promise(done => server.close(done)); }
