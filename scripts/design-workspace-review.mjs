import { portalDestination } from './portal-review-navigation.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const output = resolve('design-review/workspace');
await mkdir(output, { recursive:true });
const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.ico':'image/x-icon' };
let root = resolve('out');
const server=createServer(async(req,res)=>{
  const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(path!==root&&!path.startsWith(root+sep))return res.writeHead(403).end();
  for(const file of [path,path+'.html',resolve(path,'index.html')])if(await stat(file).then(s=>s.isFile()).catch(()=>false)){res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});return res.end(await readFile(file));}
  res.writeHead(404).end();
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch();
const results=[], errors=[];
let activePage;
try {
  for(const width of [1440,390]) {
    if(process.env.WORKSPACE_BASELINE_OUT) {
      root=resolve(process.env.WORKSPACE_BASELINE_OUT);
      const before=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
      await before.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
      const page=await before.newPage();
      for(const path of ['/plan','/guides','/universities','/portal']) { await page.goto(origin+path,{waitUntil:'networkidle'}); await page.evaluate(()=>document.fonts.ready); await page.screenshot({path:resolve(output,`before-${path.slice(1)}-${width}.png`)}); }
      await before.close(); root=resolve('out');
    }
    const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',locale:'ru-RU'});
    const calls=[];
    let reviewResult = null;
    await context.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.pathname==='/api/event')return route.fulfill({json:{ok:true}});
      if(url.pathname==='/health/ai')return route.fulfill({json:{ok:true,code:'AI_READY'}});
      if(url.pathname === '/api/check-document' && reviewResult) { calls.push(url.pathname); return route.fulfill({json:{ok:true,result:reviewResult}}); }
      if(url.pathname.startsWith('/api/')) { calls.push(url.pathname); return route.fulfill({status:503,json:{ok:false,error:'Synthetic review only'}}); }
      return url.origin===origin?route.continue():route.abort();
    });
    const page=await context.newPage();activePage=page;page.on('pageerror',e=>errors.push(e.message));
    async function visit(path) {await page.goto(origin+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);}
    async function capture(name) {await page.screenshot({path:resolve(output,`after-${name}-${width}.png`),animations:'disabled'});}
    async function audit(name) {
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${name}: no overflow`);
      await page.addScriptTag({path:resolve(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});
      const issues=await page.evaluate(async()=> (await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
      assert.deepEqual(issues,[],`${name}: accessibility`);
    }
    await visit('/portal?view=plan');
    await page.locator('[data-portal-task=profile]').waitFor();
    assert.equal(await page.locator('[data-task-check]:enabled').count(),0,'Profile and shortlist cannot be bypassed by a checklist mark');
    assert((await page.locator('main details summary').allTextContents()).every(text=>!/0\s*из\s*0/.test(text)),'Unconfigured stages are never labelled completed');
    for(const path of ['/plan','/guides','/universities','/portal']) {
      await visit(path); if(path==='/portal')await page.locator('[data-local-workspace]').waitFor();
      const logo=page.locator('header [data-brand-logo]');
      assert.equal((await logo.innerText()).replace(/\s+/g,''),'iItaly');
      assert.equal(await logo.locator('svg[data-brand-mark]').count(),1);
      const ids=await page.locator('[data-brand-logo] defs [id]').evaluateAll(nodes=>nodes.map(n=>n.id));
      assert.equal(new Set(ids).size,ids.length,'Gradient IDs are unique across header and footer');
      await audit(`${path} ${width}`);await capture(path.slice(1));
    }
    assert.equal(calls.filter(p=>p.startsWith('/api/portal')).length,0,'Guest workspace never calls protected portal APIs');
    await visit('/plan#questionnaire');
    await page.locator('[data-plan-wizard]').waitFor();
    const geometry=await page.locator('#questionnaire').evaluate(el=>({top:el.getBoundingClientRect().top,header:document.querySelector('header').getBoundingClientRect().bottom}));
    assert(geometry.top>=geometry.header,`Questionnaire heading clears the header: ${JSON.stringify(geometry)}`);
    assert.equal(await page.locator('[data-plan-wizard] [role=progressbar] > span').count(),10);
    assert.equal(await page.locator('#document-check [data-vespi]').count(),0,'Single mascot anchor: utility/report have no repeated portrait');
    await page.getByRole('button',{name:'Проверить пример справки',exact:true}).click();
    await page.locator('[data-document-example]').waitFor();
    assert.match(await page.locator('[data-document-example]').innerText(),/Демонстрация интерфейса.*вымышленный пример/s);
    assert.equal(calls.length,0,'Example never calls AI or creates a review');
    await capture('workbench-example');
    await page.getByRole('button').filter({hasText:'Осенью 2027'}).click();
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')));
    assert.equal(stored.answers.intake,'2027/28');assert.equal(stored.step,1);
    const peer=await context.newPage();await peer.goto(origin+'/portal',{waitUntil:'networkidle'});
    await peer.locator('[data-local-workspace]').waitFor();
    assert.match(await peer.locator('main').innerText(),/сентябрь 2027/,'Selected year appears in another tab');
    await peer.locator('[data-road-open]').click();
    await peer.getByRole('heading',{name:'Что заканчиваешь?',exact:true}).waitFor();
    await peer.close();
    for(const title of ['11 классов','4,7 и выше','Бакалавриат','До 3 млн ₸ в год','Инженерия, IT','Есть IELTS или TOEFL','Да, 18 или больше','В Казахстане','Другой регион / пока не знаю']) {
      const button=page.locator('[data-plan-wizard] button').filter({hasText:title});
      await button.click();
    }
    await page.getByRole('button',{name:'Открыть мой план',exact:true}).click();
    await page.getByRole('link',{name:'Продолжить в личном кабинете ↗',exact:true}).click();
    await page.locator('[data-local-workspace]').waitFor();
    await page.locator('[data-road-open]').first().click();
    await page.locator('[data-portal-universities]').waitFor();
    await page.getByRole('group',{name:'Карта Италии с университетами по городам',exact:true}).getByRole('button',{name:'Милан — показать университеты',exact:true}).click();
    await page.locator('[data-university-select="bocconi"]').check();
    await page.getByRole('combobox',{name:'Университет 1',exact:true}).selectOption('bocconi');
    await page.getByRole('combobox',{name:'Университет 2',exact:true}).selectOption('polimi');
    assert.equal(await page.locator('[data-university-comparison] [data-comparison-row]').count(),12,'Existing comparison stays intact in the guest portal');
    await capture('portal-selection');
    await page.locator('[data-shortlist-save]').click();
    await page.locator('[data-saved-universities]').waitFor();
    await page.reload({waitUntil:'networkidle'});
    assert.match(await page.locator('main').innerText(),/Bocconi/,'Saved university survives reload');
    const local=await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_local_workspace_v1')));
    assert.deepEqual(local.selectedIds,['bocconi']);assert.equal(local.done.shortlist,true);
    assert.equal(await page.evaluate(()=>localStorage.getItem('iitaly_portal_code')),null,'Guest actions create no authentication credentials');
    await capture('portal-profile');await audit('guest overview');
    await portalDestination(page, 'План');
    assert.equal(await page.locator('[aria-label="Этапы маршрута"]').count(),1);
    assert.equal(await page.locator('[aria-label="Пять этапов маршрута"],[data-workspace-ring]').count(),0);
    const checks=page.getByRole('checkbox',{name:/Отметить выполненным/});
    assert.equal(await checks.count(),1,'The current manual task offers one checklist completion control');
    await page.locator('[data-portal-task][data-current-task=true]').click();
    await page.getByRole('button',{name:'Готово',exact:true}).click();
    await page.reload({waitUntil:'networkidle'});
    assert(Object.keys(await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_local_workspace_v1')).done)).length>=2,'Self-report persists');
    await portalDestination(page, 'Документы');
    await page.locator('[data-document="apostille"]').click();
    assert.equal(await page.getByLabel('Выбрать документ для проверки').count(),0,'Future file step cannot upload');
    assert.match(await page.locator('main').innerText(),/Сначала:/);
    await capture('portal-future');
    await portalDestination(page, 'Документы');
    await capture('portal-documents');await audit('guest document vault');
    await page.getByRole('radio',{name:'Для DSU',exact:true}).check();
    assert.equal(await page.locator('[data-document="familyDocs"]').count(),1);
    assert.equal(await page.locator('[data-document="apostille"]').count(),0);
    await page.getByRole('link',{name:'Настройки',exact:true}).click();
    await capture('portal-settings');await audit('guest settings');
    await portalDestination(page, 'Обзор');
    for(let step=0;step<12;step++) {
      await page.locator('[data-road-open]').first().click();
      if(await page.getByLabel('Выбрать документ для проверки').count())break;
      await page.getByRole('button',{name:'Готово',exact:true}).click();
    }
    const upload=page.getByLabel('Выбрать документ для проверки');
    await upload.waitFor();
    const currentDoc=new URL(page.url()).searchParams.get('doc') || new URL(page.url()).searchParams.get('task');
    const fixtureReview=(verdict,year,status)=>({verdict,docTitle:'Синтетическая справка QA',summary:'Синтетический результат из изолированной фикстуры.',checks:[{status:'ok',label:'Читаемость',note:'Тестовая строка.'}],problems:[],nextSteps:['Сверь заявку.'],review:{profile:'bocconi',profileLabel:'Тестовый конкурс',academicYear:year,rulesStatus:status,referenceYear:null,rulesVersion:'synthetic-fixture',verifiedOn:'2026-10-18',notice:'Изолированная фикстура, не действующие правила.',sources:[]}});
    async function review(result) {
      reviewResult=result;
      const prepare=page.locator('[data-document-prepare]');
      if(await prepare.count())await prepare.click();
      await page.waitForFunction(()=>!document.querySelector('[aria-label="Выбрать документ для проверки"]').disabled);
      await page.getByLabel('Выбрать документ для проверки').setInputFiles({name:'synthetic-qa.txt',mimeType:'text/plain',buffer:Buffer.from('SYNTHETIC QA ONLY. NO PERSONAL DATA.')});
      await page.getByRole('button',{name:'Проверить документ',exact:true}).click();
      await page.locator('[data-portal-focus]').waitFor();
      await page.waitForFunction(()=>!new URLSearchParams(location.search).has('doc')&&!new URLSearchParams(location.search).has('task'));
    }
    await review(fixtureReview('warn','2027/28','unspecified'));
    let storedState=await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_local_workspace_v1')));
    assert.equal(storedState.done[currentDoc],false,'An uncertain review cannot complete a file task');
    assert.equal(storedState.reviews[currentDoc],'clarify');
    assert.doesNotMatch(JSON.stringify(storedState),/synthetic-qa|Синтетический результат|PERSONAL DATA/,'Raw files and report text are not persisted');
    await page.reload({waitUntil:'networkidle'});
    await page.locator('[data-road-open]').first().click();
    await review(fixtureReview('ok','2026/27','verified'));
    storedState=await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_local_workspace_v1')));
    assert.equal(storedState.done[currentDoc],false,'A verified review from another intake cannot close this route task');
    assert.equal(storedState.reviews[currentDoc],'clarify');
    await page.locator('[data-road-open]').first().click();
    await review(fixtureReview('ok','2027/28','verified'));
    storedState=await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_local_workspace_v1')));
    assert.equal(storedState.done[currentDoc],true,'Only an applicable passed review closes the file task');
    assert.equal(storedState.reviews[currentDoc],'approved');
    await portalDestination(page, 'Документы');
    await page.locator(`[data-document="${currentDoc}"]`).click();
    await page.locator('[data-document-prepare]').click();
    assert.equal(await page.locator('[data-portal-inspector]').count(),1,'The saved file keeps its inspector when reopened for a new version');
    assert.equal(await page.locator('section[aria-label="Твой следующий шаг"] [data-vespi]').count(),0,'The route yields its portrait while the saved file owns the inspector');
    assert.equal(calls.filter(path=>path.startsWith('/api/portal')).length,0,'Local inspection never calls paid portal endpoints');
    await page.getByRole('link',{name:'Настройки',exact:true}).click();
    await page.getByRole('link',{name:'Изменить ответы анкеты',exact:true}).click();
    await page.getByRole('heading',{name:'Когда хочешь начать учёбу?',exact:true}).waitFor();
    assert.equal(await page.locator('[data-vespi] [data-vespi]').count(),0);
    assert.equal(await page.locator('img[data-vespi]').count(),0,'Editing the questionnaire has no repeated mascot portrait');
    await capture('portal-questionnaire');
    assert.equal(calls.filter(path=>path.startsWith('/api/portal')).length,0,'No protected API calls during guest questionnaire, selection or self-report');
    results.push({width,sharedDraft:true,guestWithoutAuth:true,persistentSelection:true,existingMapAndComparison:true,noFutureUpload:true,exampleHonest:true,singleMascot:true,applicableReviewYearOnly:true,noStoredFileOrReportContent:true});
    await context.close();
  }
  assert.deepEqual(errors,[],'No browser runtime errors');
  await writeFile(resolve(output,'results.json'),JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({results,errors},null,2));
} catch(error) { if(activePage)await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});throw error; }
finally {await browser.close();await new Promise(done=>server.close(done));}
