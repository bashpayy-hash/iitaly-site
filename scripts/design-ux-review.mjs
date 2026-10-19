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
    let aiAvailable = false;
    await context.route('**/*', route => {
      const req = route.request(), url = new URL(req.url());
      if (url.pathname === '/health/ai') return route.fulfill({status:aiAvailable?200:503,contentType:'application/json',body:JSON.stringify(aiAvailable?{ok:true,code:'AI_READY',retryable:true}:{ok:false,code:'AI_AUTH_INVALID',retryable:false,error:'Требуется исправление настроек сервиса.'})});
      if (url.pathname === '/api/check-document') {
        documentRequests.push(req.postDataJSON());
        if(documentRequests.length===2) aiAvailable = false;
        const result = documentRequests.length===1 ? {ok:false,error:'Сервис временно недоступен'}
          : documentRequests.length===2 ? {ok:false,code:'AI_AUTH_INVALID',retryable:false,error:'Требуется исправление настроек сервиса.'}
          : {ok:true,result:{verdict:'ok',docTitle:'Тестовый документ',summary:'Проверка завершена',review:{
            ...req.postDataJSON().context, profileLabel:'EDISU Piemonte',
            rulesStatus: req.postDataJSON().context.academicYear === '2026/27' ? 'verified' : 'unverified',
            referenceYear: req.postDataJSON().context.academicYear === '2026/27' ? 2025 : null,
            verifiedOn:'2026-10-13',rulesVersion:'2026-10-13',notice:'Синтетический результат выбранного профиля.',
            sources:[{id:'P26',label:'EDISU Piemonte · официальный источник',url:'https://www.edisu.piemonte.it/en/international-students'}],
          }}};
        return route.fulfill({status:result.ok?200:503,contentType:'application/json',body:JSON.stringify(result)});
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
    await page.getByText('Проверка документов пока недоступна',{exact:true}).waitFor();
    assert(await page.getByLabel('Выбрать документ для проверки').isDisabled());
    assert.equal(documentRequests.length,0,'No document is sent while provider credentials are invalid');
    aiAvailable = true;
    await page.getByRole('button',{name:'Проверить доступность',exact:true}).click();
    await page.waitForFunction(()=>!document.querySelector('input[type="file"]').disabled);
    await page.getByRole('button').filter({hasText:'Осенью 2027'}).click();
    await page.getByRole('button').filter({hasText:'11 классов'}).click();
    await visit('/guides');
    const search = page.getByLabel('Найти тему');
    await search.fill('cimea');
    const results = page.locator('[data-guide-select]');
    assert(await results.count()>0);
    assert(await page.locator('[data-guide-select="cimea"]').isVisible(),'Search spans all three stages');
    await search.fill('несуществующая-тема-123');
    assert(await page.getByRole('heading',{name:'Такой темы не нашли'}).isVisible());
    await page.getByRole('button',{name:'Сбросить поиск'}).click();
    assert.equal(await results.count(),2,'Reset returns to the route stage');
    // The numbered timeline keeps the same keyboard-operable topics and one
    // readable article at every viewport.
    const chapterIds = new Set();
    const stages = page.getByRole('navigation',{name:'Этапы справочника'});
    for(const [name,count] of [['education',2],['apostille',8],['permesso',3]]) {
      await stages.locator(`a[href="#${name}"]`).click();
      assert.equal(await results.count(),count);
      for(const id of await results.evaluateAll(nodes=>nodes.map(node=>node.dataset.guideSelect))) chapterIds.add(id);
    }
    assert.equal(chapterIds.size,13,'All reviewed chapters remain available across the stage filters');
    await stages.locator('a[href="#apostille"]').click();
    await page.locator('[data-guide-select="cimea"]').click();
    await page.waitForFunction(()=>document.activeElement?.id==='active-guide-title');
    assert.equal(await page.locator('#active-guide-title').evaluate(el=>document.activeElement===el),true);
    assert.equal(await page.locator('[data-guide-panel]').filter({visible:true}).count(),1,'Only one chapter is expanded');
    assert.equal(await page.locator('[data-guide-select="cimea"]').getAttribute('aria-expanded'),'true');
    await search.fill('CIMEA');
    assert.equal(await page.locator('[data-guide-panel]').filter({visible:true}).count(),0,'Search shows results without an obsolete article');
    await page.getByRole('button',{name:'Сбросить поиск',exact:true}).click();
    assert.equal(await search.evaluate(el=>document.activeElement===el),true);
    await search.fill('CIMEA');
    await page.locator('[data-guide-select="cimea"]').click();
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
    await doc.getByText('Проверка документов пока недоступна',{exact:true}).waitFor();
    assert(await doc.getByRole('button',{name:'Повторить проверку',exact:true}).isDisabled(),'A revoked key stops document retries');
    assert(await doc.getByText('example.txt',{exact:true}).isVisible(),'File survives a provider authorization failure');
    assert.equal(documentRequests.length,2);
    aiAvailable = true;
    await doc.getByRole('button',{name:'Проверить доступность',exact:true}).click();
    await page.waitForFunction(()=>!Array.from(document.querySelectorAll('#document-check button')).find(b=>b.textContent==='Повторить проверку')?.disabled);
    assert.equal(documentRequests.length,2,'Availability check does not resend a document');
    assert.deepEqual(documentRequests[0].context,{profile:'general',academicYear:'unspecified',applicantScope:'unspecified'},'Wizard answers must not silently choose scholarship rules');
    await doc.getByRole('combobox',{name:'Программа',exact:true}).selectOption('piemonte');
    await doc.getByRole('combobox',{name:'Учебный год заявки',exact:true}).selectOption('2026/27');
    await doc.getByRole('checkbox',{name:/Моя ситуация/}).check();
    assert.equal(documentRequests.length,2,'Changing the context does not upload the file');
    await doc.getByRole('button',{name:'Проверить документ',exact:true}).click();
    await doc.getByText('Проверка завершена',{exact:true}).waitFor();
    assert.equal(documentRequests.length,3);
    assert.equal(documentRequests[0].text,documentRequests[1].text);
    assert.equal(documentRequests[1].text,documentRequests[2].text);
    assert.deepEqual(documentRequests[2].context,{profile:'piemonte',academicYear:'2026/27',applicantScope:'kz-family-abroad'});
    await doc.getByText('Официальные источники · сверены 13.10.2026',{exact:true}).click();
    assert.equal(await doc.getByRole('link',{name:'EDISU Piemonte · официальный источник',exact:true}).getAttribute('href'),'https://www.edisu.piemonte.it/en/international-students');
    await checkA11y('document result '+width);
    await doc.screenshot({path:resolve(output,`document-${width}.png`)});
    await doc.getByRole('combobox',{name:'Учебный год заявки',exact:true}).selectOption('2027/28');
    assert.equal(await doc.getByText('Проверка завершена',{exact:true}).count(),0,'Changing context clears an obsolete verdict');
    assert(await doc.getByText('example.txt',{exact:true}).isVisible(),'Changing context retains the local file');
    assert.equal(documentRequests.length,3,'Changing context requires an explicit recheck');
    await doc.getByRole('button',{name:'Проверить документ',exact:true}).click();
    await doc.getByText('Проверка завершена',{exact:true}).waitFor();
    assert.equal(documentRequests[3].context.academicYear,'2027/28');
    assert.equal(await doc.getByText('Год доходов:',{exact:false}).count(),0,'Unverified years do not show a default reference year');
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
  console.log('UX review passed: provider readiness blocks upload and recovers, guide search/recovery, one expanded bento chapter, stage filters, preserved plan draft, optional contact, first action, file retry, city shortcut and axe checks at 1440/768/390/320px.');
} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
}
