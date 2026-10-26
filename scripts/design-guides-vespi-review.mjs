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
    assert.equal(await page.locator('[data-guide-panel], [data-guide-timeline], [data-guide-sticky]').count(),0,'The directory contains no mounted articles, timeline or sales bar');
    assert.equal(await page.locator('[data-guide-stage]').count(),3);
    assert.equal(await page.locator('main time').count(),1);
    assert(await page.locator('#guide-search').evaluate(input=>input.getBoundingClientRect().height>=44));
    await audit('directory '+width);await screenshot('guides-top');
    await page.locator('[data-guide-stage=choose]').click();
    await page.waitForURL('**/guides/stages/choose');
    assert.equal(await page.locator('[data-guide-select]').count(),2);
    await page.locator('[data-guide-select=education]').click();
    await page.waitForURL('**/guides/education');
    assert.match(await page.locator('main').innerText(),/Foundation не заменяет выпускной аттестат/);
    assert.equal(await page.locator('[data-guide-panel]').count(),1);
    assert.equal(await page.locator('[data-guide-stage],[data-guide-select],[data-guide-timeline]').count(),0,'Reading shows only the current question, with breadcrumbs');
    await page.locator('[data-guide-inline-action]').click();
    await page.locator('[data-guide-origin=education]').waitFor();
    await page.getByRole('heading',{name:'Какой средний балл?',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('iitaly_plan_draft_v1')),draft);
    await screenshot('plan-continuation');

    // Old shared hashes resolve to durable pages, including on first load.
    await visit('/guides#apostille');
    await page.waitForURL('**/guides/apostille');
    await page.locator('[data-guide-panel=apostille]').waitFor();
    await page.getByText('Официальные источники',{exact:true}).click();
    const refs=page.locator('main a[target=_blank]').filter({visible:true});
    assert(await refs.count()>0);
    for(const ref of await refs.all())assert.match(await ref.getAttribute('rel'),/noopener/);
    await audit('article '+width);await screenshot('guides-apostille');
    const documentAction=page.locator('[data-guide-inline-action]');
    await documentAction.scrollIntoViewIfNeeded();
    assert(await documentAction.evaluate(action=>{
      const r=action.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth&&action.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
    }),'The main action is visible and reachable');
    await documentAction.click();await page.locator('[data-guide-origin=apostille]').waitFor();
    assert.equal(await page.getByRole('combobox',{name:'Программа',exact:true}).inputValue(),'general');
    assert.equal(await page.getByRole('combobox',{name:'Учебный год заявки',exact:true}).inputValue(),'unspecified');
    await page.getByRole('link',{name:'Вернуться к теме',exact:true}).click();
    await page.waitForURL('**/guides/apostille');

    await visit('/guides/translation');await openHelper();
    const question=page.getByRole('textbox',{name:'Вопрос ИИ-консультанту'});
    assert.equal(await page.locator('[data-chat-guide-context]').getAttribute('data-chat-guide-context'),'translation');
    await page.getByRole('link',{name:'Что проверить в переводе для вуза и для визы?',exact:true}).click();
    assert.equal(chats.length,0,'Reading and suggested questions never start an AI request');
    assert.equal(await question.inputValue(),'Что проверить в переводе для вуза и для визы?');
    await audit('contextual helper '+width);await screenshot('guides-helper');
    await addProviderBadge();
    assert(await page.getByRole('button',{name:'Отправить',exact:true}).evaluate(button=>{const r=button.getBoundingClientRect();return button.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'The hosting badge cannot intercept Send');
    if(width===390){await page.setViewportSize({width,height:390});assert(await page.getByRole('button',{name:'Отправить',exact:true}).evaluate(button=>{const r=button.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&button.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));await page.setViewportSize({width,height:844});}
    await page.getByRole('button',{name:'Отправить',exact:true}).click();
    await page.getByText('Синтетический ответ 1.',{exact:true}).waitFor();
    assert.match(chats[0].messages.at(-1).content,/Открытая тема справочника IITALY: translation/);
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('iitaly_asked')),'1');
    await question.fill('Мой незаконченный вопрос');await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({state:'hidden'});
    assert(await page.locator('#chat-launcher').evaluate(button=>button.getBoundingClientRect().bottom<document.getElementById('nl-badge-frame').getBoundingClientRect().top));
    await page.locator('#nl-badge-frame').evaluate(badge=>badge.remove());
    // Native links keep the global assistant draft; the topic context changes.
    await page.getByRole('navigation',{name:'Путь по справочнику'}).getByRole('link',{name:'Гайды и виза',exact:true}).click();
    await page.locator('[data-guide-stage=arrival]').click();
    await page.locator('[data-guide-select=permesso]').click();await openHelper();
    assert.equal(await question.inputValue(),'Мой незаконченный вопрос');
    assert.equal(await page.locator('[data-chat-guide-context]').getAttribute('data-chat-guide-context'),'permesso');
    await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
    assert.equal(await page.locator('[data-guide-inline-action]').getAttribute('href'),'/guides/permesso-modulo-1');
    await page.getByRole('navigation',{name:'Путь по справочнику'}).getByRole('link',{name:'Гайды и виза',exact:true}).click();
    const search=page.getByRole('searchbox',{name:'Найти тему'});
    await search.fill('вопрос-без-совпадения-123');
    await page.getByRole('button',{name:'Спросить Веспи',exact:true}).click();
    await page.waitForFunction(()=>document.activeElement===document.getElementById('chat-input'));
    assert.equal(chats.length,1);assert.equal(await question.inputValue(),'Мой незаконченный вопрос');
    await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
    await page.getByRole('button',{name:'Сбросить поиск',exact:true}).click();
    assert(await search.evaluate(el=>document.activeElement===el));
    await search.fill('CIMEA');assert(await page.locator('[data-guide-select=cimea]').isVisible());
    await page.locator('[data-guide-select=cimea]').click();await page.waitForURL('**/guides/cimea');
    await page.goBack();await search.waitFor();assert.equal(await search.inputValue(),'CIMEA','Back restores the directory query');
    await page.goForward();await page.locator('[data-guide-panel=cimea]').waitFor();
    await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-guide-panel]').count(),1);

    // Every topic has a shareable page, its own sources/date, and no full route.
    const chapterIds=new Set();
    for(const [stage,expected] of [['choose',2],['prepare',8],['arrival',3]]){
      await visit('/guides/stages/'+stage);assert.equal(await page.locator('[data-guide-select]').count(),expected);
      const ids=await page.locator('[data-guide-select]').evaluateAll(nodes=>nodes.map(n=>n.dataset.guideSelect));
      for(const id of ids){
        chapterIds.add(id);await page.locator('[data-guide-select="'+id+'"]').click();await page.locator('[data-guide-panel="'+id+'"]').waitFor();
        assert.equal(new URL(page.url()).pathname,'/guides/'+id);
        assert.match(await page.locator('link[rel=canonical]').getAttribute('href'),new RegExp('/guides/'+id+'$'));
        assert.equal(await page.locator('main time').getAttribute('datetime'),'2026-10-09');
        assert.equal(await page.locator('[data-guide-select],[data-guide-stage],[data-guide-timeline]').count(),0);
        assert(await page.locator('main details a[href^="https://"]').count()>0);
        await audit('topic '+id+' '+width);
        if(id==='con')await screenshot('guides-family');
        await page.goBack();await page.locator('[data-guide-select]').first().waitFor();
      }
    }
    assert.equal(chapterIds.size,13);
    await visit('/guides/visa');await screenshot('guides-visa');
    assert.equal(await page.locator('[data-visa-part]').count(),4);
    for(const part of ['timeline','funds','documents','before-application']){
      await page.locator('[data-visa-part="'+part+'"]').click();await page.locator('[data-guide-part="'+part+'"]').waitFor();
      assert.equal(await page.locator('[data-visa-part]').count(),0,'A visa detail shows one question at a time');
      if(part==='documents'){
        const item=page.locator('[data-guide-part=documents] button[aria-pressed]').first();await item.click();assert.equal(await item.getAttribute('aria-pressed'),'true');await item.click();assert.equal(await item.getAttribute('aria-pressed'),'false');
      }
      await audit('visa '+part+' '+width);await page.reload({waitUntil:'networkidle'});await page.locator('[data-guide-part="'+part+'"]').waitFor();
      await page.getByRole('link',{name:'К вопросам о визе',exact:true}).click();
    }
    assert(events.some(e=>e.event==='guide_next_action'&&e.props.topic==='apostille'));
    assert(!events.some(e=>JSON.stringify(e).includes('вопрос-без-совпадения')));
    assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
    results.push({width,categoryPages:3,topicPages:13,visaParts:4,legacyLinks:true,backForward:true,draftPreserved:true,explicitAIOnly:true,sources:true,a11y:true,overflow:false});
    await context.close();
  }
  await writeFile(resolve(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(output, 'failure.png') }).catch(() => {});
  throw error;
} finally { await browser.close(); await new Promise(done => server.close(done)); }
