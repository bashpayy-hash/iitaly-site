import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = process.env.REVIEW_TOOLS
  ? require(resolve(process.env.REVIEW_TOOLS, 'playwright')) : require('playwright');
const root = resolve('out'), output = resolve('design-review/ux-simplification');
await mkdir(output, {recursive:true});
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.txt':'text/plain','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
const server = createServer(async (req,res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return res.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path,'index.html')]) {
      if (await stat(file).then(s=>s.isFile()).catch(()=>false)) {
        res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'});
        return res.end(await readFile(file));
      }
    }
    res.writeHead(404).end();
  } catch {res.writeHead(500).end();}
});
await new Promise(done => server.listen(0,'127.0.0.1',done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const errors = [];
try {
  for (const width of [1440,768,390,320]) {
    const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',locale:'ru-RU'});
    const documentRequests = [], leads = [];
    await context.route('**/*', route => {
      const req = route.request(), url = new URL(req.url());
      if (url.pathname === '/api/check-document') {
        documentRequests.push(req.postDataJSON());
        return route.fulfill({status:documentRequests.length===1?503:200,contentType:'application/json',body:JSON.stringify(documentRequests.length===1?{ok:false,error:'Сервис временно недоступен'}:{ok:true,result:{verdict:'ok',docTitle:'Тестовый документ',summary:'Проверка завершена'}})});
      }
      if (url.pathname === '/api/lead') { leads.push(req.postDataJSON()); return route.abort(); }
      if (url.pathname === '/api/event') return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});
      return url.origin === origin ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', e=>errors.push(e.message));
    async function visit(path) { await page.goto(origin+path,{waitUntil:'networkidle'}); await page.evaluate(()=>document.fonts.ready); }
    async function checkA11y(where) {
      await page.addScriptTag({path:resolve(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});
      const violations = await page.evaluate(async()=> (await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
      assert.deepEqual(violations,[],where+' accessibility');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,where+' overflow');
    }
    await visit('/plan');
    await page.getByRole('button').filter({hasText:'Осенью 2027'}).click();
    await page.getByRole('button').filter({hasText:'11 классов'}).click();
    await visit('/guides');
    const search = page.getByLabel('Найти тему');
    await search.fill('cimea');
    const results = width>=1024 ? page.getByRole('navigation',{name:'Главы справочника'}).getByRole('button') : page.locator('details[name="guide-chapter"] > summary');
    assert(await results.count()>0);
    await search.fill('несуществующая-тема-123');
    assert(await page.getByRole('heading',{name:'Такой темы не нашли'}).isVisible());
    await page.getByRole('button',{name:'Показать все темы'}).click();
    assert.equal(await results.count(),13,'All reviewed chapters remain available');
    if(width<1024){
      await page.locator('#education > summary').click();
      await page.locator('#cimea > summary').click();
      assert.equal(await page.locator('#education').evaluate(el=>el.open),false);
      await page.locator('#cimea').getByRole('button',{name:'К списку тем'}).click();
      assert.equal(await search.evaluate(el=>document.activeElement===el),true);
    } else {
      await results.filter({hasText:'DoV, CIMEA и ARDI'}).click();
      assert.equal(await page.locator('#active-guide-title').evaluate(el=>document.activeElement===el),true);
    }
    await page.locator('#guide-topics').scrollIntoViewIfNeeded();
    await checkA11y('guides '+width);
    await page.screenshot({path:resolve(output,`guides-${width}.png`)});
    await visit('/plan');
    await page.getByRole('heading',{name:'Какой средний балл?'}).waitFor();
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('heading',{name:'Какой средний балл?'}).waitFor();
    const choices=['4,7 и выше','Бакалавриат','Без стипендии будет сложно','Экономика, бизнес','Есть IELTS или TOEFL','Ещё не будет 18','В Казахстане','Пьемонт · EDISU'];
    for (const choice of choices) await page.getByRole('button').filter({hasText:choice}).click();
    assert.equal(await page.getByRole('textbox',{name:'Номер телефона для WhatsApp'}).isVisible(),false,'Phone is optional disclosure');
    await page.getByText('Оставить номер для связи',{exact:true}).click();
    await page.getByRole('textbox',{name:'Номер телефона для WhatsApp'}).fill('+77001234567');
    await page.getByRole('button',{name:'Открыть мой план',exact:true}).click();
    const steps=page.locator('#questionnaire details').filter({has:page.locator('summary > span')});
    assert.equal(await steps.evaluateAll(nodes=>nodes.filter(n=>n.open).length),1,'Only the first action is expanded');
    await checkA11y('plan result '+width);
    await page.screenshot({path:resolve(output,`plan-${width}.png`)});
    await page.getByRole('link',{name:'Открыть разбор аттестата и диплома'}).click();
    await page.waitForURL('**/guides#education');
    await visit('/plan');
    await page.getByRole('heading',{name:'С чего начать'}).waitFor();
    const draft=await page.evaluate(()=>sessionStorage.getItem('iitaly_plan_draft_v1'));
    assert(!draft.includes('77001234567')&&!draft.includes('file'),'No contact or file in draft');
    assert.equal(leads.length,0,'No contact submission is required');
    await page.getByRole('button',{name:'Изменить ответы',exact:true}).click();
    assert.equal(await page.getByRole('button').filter({hasText:'Осенью 2027'}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button',{name:'Начать заново',exact:true}).click();
    assert.equal(await page.getByRole('button').filter({hasText:'Осенью 2027'}).getAttribute('aria-pressed'),'false');
    await page.getByLabel('Выбрать документ для проверки').setInputFiles({name:'example.txt',mimeType:'text/plain',buffer:Buffer.from('Синтетический тест: доход семьи за указанный год.')});
    const doc=page.locator('#document-check');
    await doc.getByRole('button',{name:'Проверить документ',exact:true}).click();
    await doc.getByRole('button',{name:'Повторить проверку',exact:true}).waitFor();
    assert(await doc.getByText('example.txt',{exact:true}).isVisible(),'File survives a server error');
    await doc.getByRole('button',{name:'Повторить проверку',exact:true}).click();
    await doc.getByText('Проверка завершена',{exact:true}).waitFor();
    assert.equal(documentRequests.length,2);
    assert.equal(documentRequests[0].text,documentRequests[1].text);
    await checkA11y('document result '+width);
    await visit('/universities');
    await page.getByLabel('Сразу к городу').selectOption('milano');
    assert(await page.locator('#selected-city').getByRole('heading',{name:'Милан',exact:true}).isVisible());
    assert.equal(await page.locator('svg[aria-label="Карта Италии с университетами по городам"]').getAttribute('role'),'group');
    await checkA11y('universities '+width);
    if(width<1024) assert((await page.locator('#selected-city').boundingBox()).y<200,'City result moves into view on mobile');
    if(width===1440 || width===390) {
      for(const path of ['/','/prices','/portal','/changes-2026-27','/guides/permesso-modulo-1']) {
        await visit(path);
        await checkA11y(path+' '+width);
      }
    }
    await context.close();
  }
  assert.deepEqual(errors,[],'No runtime errors');
  console.log('UX review passed: guide search/recovery, one mobile chapter, preserved plan draft, optional contact, first action, file retry, city shortcut and axe checks at 1440/768/390/320px.');
} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
}
