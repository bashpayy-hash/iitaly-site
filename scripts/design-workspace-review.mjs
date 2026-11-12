import { editorialContrastFindings } from './portal-editorial-contrast.mjs';
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
const browser=await chromium.launch(process.env.REVIEW_CHROMIUM ? {executablePath:process.env.REVIEW_CHROMIUM,args:["--no-sandbox","--disable-dev-shm-usage"]} : {});
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
    async function actionPage() {
      const sections=page.getByRole('navigation',{name:'Разделы задачи',exact:true});
      if(await sections.count())await sections.locator('a[href$="part=action"]').click();
    }
    async function visit(path) {await page.goto(origin+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);}
    async function capture(name) {await page.screenshot({path:resolve(output,`after-${name}-${width}.png`),animations:'disabled'});}
    async function audit(name) {
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${name}: no overflow`);
      await page.addScriptTag({path:resolve(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});
      const issues=await page.evaluate(async()=> (await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
      assert.deepEqual(await editorialContrastFindings(page, issues),[],`${name}: accessibility`);
    }
    await visit('/portal?view=plan');
    await page.locator('[data-portal-task=profile]').waitFor();
    // Owner, 5 Nov: the overview names one step in «Сейчас» with one button; marking lives on the step page.
    assert.equal(await page.locator('[data-portal-now] [data-portal-task=profile]').count(),1,'Overview presents the questionnaire first');
    assert.equal(await page.locator('[data-task-check]').count(),0,'The overview carries no completion control');
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
    assert.equal(await page.locator('[data-plan-wizard] [data-flight-plan]').count(),0,'No progress bar over the questionnaire (owner, 4 Nov)');
    assert.equal(await page.locator('[data-plan-wizard] [role=progressbar]').getAttribute('aria-valuemax'),'10');
    assert.equal(await page.locator('#document-check [data-vespi]').count(),0,'Single mascot anchor: utility/report have no repeated portrait');
    await page.getByRole('link',{name:'Проверить документ',exact:true}).click();
    await page.getByRole('button',{name:'Проверить пример справки',exact:true}).click();
    await page.locator('[data-document-example]').waitFor();
    assert.match(await page.locator('[data-document-example]').innerText(),/Демонстрация интерфейса.*вымышленный пример/s);
    assert.equal(calls.length,0,'Example never calls AI or creates a review');
    await capture('workbench-example');
    await page.getByRole('link',{name:'Составить план',exact:true}).click();
    await page.getByRole('button').filter({hasText:'Осенью 2027'}).click();
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')));
    assert.equal(stored.answers.intake,'2027/28');assert.equal(stored.step,1);
    const peer=await context.newPage();await peer.goto(origin+'/portal',{waitUntil:'networkidle'});
    await peer.locator('[data-local-workspace]').waitFor();
    assert.match(await peer.locator('main').innerText(),/сентябрь 2027/,'Selected year appears in another tab');
    await peer.locator('[data-road-open]').click();
    await peer.getByRole('heading',{name:'Что заканчиваешь?',exact:true}).waitFor();
    await peer.close();
    for(const title of ['11 классов','4,7 и выше','Бакалавриат','До 3 млн ₸ в год','Инженерия, IT','Есть IELTS или TOEFL','Да, 18 или больше','В Казахстане','Пока не знаю']) {
      const button=page.locator('[data-plan-wizard] button').filter({hasText:title});
      await button.click();
    }
    await page.getByRole('button',{name:'Открыть мой план',exact:true}).click();
    await page.getByRole('link',{name:'Продолжить в личном кабинете',exact:true}).click();
    await page.locator('[data-local-workspace]').waitFor();
    await page.locator('[data-road-open]').first().click();
    await page.locator('[data-portal-universities]').waitFor();
    await page.getByRole('group',{name:'Карта Италии с университетами по городам',exact:true}).getByRole('button',{name:'Милан — показать университеты',exact:true}).click();
    await page.locator('[data-university-select="bocconi"]').check();
    await page.getByRole('navigation',{name:'Выбор университетов'}).getByRole('link',{name:'Сравнение',exact:true}).click();
    await page.getByRole('combobox',{name:'Университет 1',exact:true}).selectOption('bocconi');
    await page.getByRole('combobox',{name:'Университет 2',exact:true}).selectOption('polimi');
    await page.getByRole('button',{name:'Таблица',exact:true}).click();
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
    // Owner, 4 Nov («один блок, один поинт»): the stage page is one tile with the
    // current step and its pips; the route lives on the overview only.
    assert.equal(await page.locator('[data-flight-plan]').count(),0,'The local stage page carries no route strip');
    assert.equal(await page.locator('[data-portal-page=stage] [data-stage-switcher] a[data-story-pill]').count(),await page.locator('[data-portal-page=stage] [data-stage-switcher] a[data-stamp]').count(),'The step pips double as stamps');
    assert.equal(await page.locator('[aria-label="Пять этапов маршрута"],[data-workspace-ring]').count(),0);
    const checks=page.getByRole('checkbox',{name:/Отметить выполненным/});
    assert(await checks.count()>0,'The checklist exposes completion controls');
    await page.locator('[data-portal-task][data-current-task=true]').click();
    await actionPage();
    await page.getByRole('button',{name:'Готово',exact:true}).click();
    await page.reload({waitUntil:'networkidle'});
    assert(Object.keys(await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_local_workspace_v1')).done)).length>=2,'Self-report persists');
    // Before payment (owner, 5 Nov, after the funnel research): the first route
    // step is free; the next one is locked — the overview tile, the stage page
    // and the step page keep their structure, and the purchase button stands
    // where «Открыть разбор» was; it opens the same purchase form as /prices.
    await portalDestination(page, 'Обзор');
    assert.equal(await page.locator('[data-now-locked]').count(),1,'The step after the free one is locked');
    assert.equal(await page.locator('[data-portal-overview] [data-wall-buy][data-wall-place="portal-task"]').count(),1,'The current-step tile carries the wall');
    assert.equal(await page.locator('[data-task-ready]').count(),0,'A locked step cannot be self-reported');
    await page.locator('[data-road-stage][aria-current=step]').click();
    await page.locator('[data-portal-page=stage]').waitFor();
    assert.equal(await page.locator('[data-portal-page=stage] [data-wall-buy]').count(),1,'The stage page shows the wall for the locked step');
    assert.equal(await page.locator('[data-task-check][data-task-locked=true]').count(),1,'The locked step keeps its row and check mark, dashed');
    assert.match(await page.locator('[data-wall-buy]').innerText(),/10\s990\s₸/,'The wall names the one-time price');
    await page.locator('[data-wall-buy]').click();
    const buy=page.getByRole('dialog');await buy.waitFor();
    assert.match((await buy.innerText()).replace(/\s+/g,' '),/Поступление под ключ.*10 990 ₸/,'The wall opens the same purchase form as /prices');
    await page.keyboard.press('Escape');await buy.waitFor({state:'hidden'});
    await capture('portal-wall');await audit('guest wall');
    await portalDestination(page, 'Документы');
    assert.equal(await page.locator('[data-documents-free-note]').count(),1,'The vault names the one free check on /plan');
    await page.locator('[data-document="apostille"]').click();
    await page.locator('[data-task-locked][data-step-detail]').waitFor();
    assert.equal(await page.getByLabel('Выбрать документ для проверки').count(),0,'Locked file step cannot upload');
    assert.equal(await page.locator('[data-step-detail] [data-wall-buy]').count(),1,'The locked step page carries the wall');
    assert.doesNotMatch(await page.locator('[data-step-detail]').innerText(),/€|рабочих дней/,'Locked requirements stay behind the wall');
    await capture('portal-future');
    await portalDestination(page, 'Документы');
    await capture('portal-documents');await audit('guest document vault');
    // Owner, 5 Nov: five cards need no filter pills; each says what it is for and where to get it.
    assert.equal(await page.locator('input[name="local-document-purpose"]').count(),0,'No purpose filters');
    assert.match(await page.locator('[data-document="familyDocs"]').innerText(),/Нужен для стипендии DSU/);
    assert.match(await page.locator('[data-document="apostille"]').innerText(),/Нужен для вуза[\s\S]*Где взять: eGov/);
    assert.doesNotMatch(await page.locator('[data-document="apostille"]').innerText(),/Что сделать:/,'An untouched card repeats no generic instruction');
    await page.getByRole('link',{name:'Настройки',exact:true}).click();
    await capture('portal-settings');await audit('guest settings');
    // One free document check per device on /plan: the same file may be
    // checked again (another programme or year); a different file meets the
    // wall. Only a hashed fingerprint is stored — never the file name,
    // its text or the report.
    await visit('/plan#document-check');
    const doc=page.locator('#document-check');
    reviewResult={verdict:'warn',docTitle:'Синтетическая справка QA',summary:'Синтетический результат из изолированной фикстуры.',checks:[{status:'ok',label:'Читаемость',note:'Тестовая строка.'}],problems:[],nextSteps:['Сверь заявку.']};
    await page.waitForFunction(()=>!document.querySelector('[aria-label="Выбрать документ для проверки"]').disabled);
    await doc.getByLabel('Выбрать документ для проверки').setInputFiles({name:'synthetic-qa.txt',mimeType:'text/plain',buffer:Buffer.from('SYNTHETIC QA ONLY. NO PERSONAL DATA.')});
    await doc.getByRole('button',{name:'Проверить документ',exact:true}).click();
    await doc.getByRole('region',{name:'Синтетическая справка QA'}).waitFor();
    assert.equal(calls.filter(path=>path==='/api/check-document').length,1);
    assert.match(await page.evaluate(()=>localStorage.getItem('iitaly_free_check_v1')),/^\["[a-z0-9]{1,16}"\]$/,'The free check stores one hashed fingerprint');
    assert.doesNotMatch(JSON.stringify(await page.evaluate(()=>({...localStorage}))),/synthetic-qa|Синтетический результат|PERSONAL DATA/,'Raw files and report text are not persisted');
    assert.equal(await doc.locator('[data-wall-buy][data-wall-place="document-check"]').count(),0,'The checked file keeps its result and may be rechecked');
    // Owner, 12 Nov: the free check gives the verdict and the list of problems;
    // «что делать» and «что дальше» open with the route.
    assert.equal(await doc.locator('[data-document-fixes-locked] [data-wall-buy][data-wall-place="document-fixes"]').count(),1,'The next steps of a free check are behind the wall');
    assert.doesNotMatch(await doc.innerText(),/Сверь заявку/,'A guest does not read the next steps');
    assert(await doc.getByRole('button',{name:'Проверить ещё раз',exact:true}).isVisible());
    await doc.getByRole('button',{name:'Выбрать другой',exact:true}).click();
    await doc.locator('[data-wall-buy][data-wall-place="document-check"]').waitFor();
    assert.equal(await doc.getByLabel('Выбрать документ для проверки').count(),0,'A second document meets the wall');
    await capture('document-wall');await audit('document wall');
    assert.equal(calls.filter(path=>path.startsWith('/api/portal')).length,0,'Local inspection never calls paid portal endpoints');
    await visit('/portal');await page.locator('[data-local-workspace]').waitFor();
    await page.getByRole('link',{name:'Настройки',exact:true}).click();
    await page.getByRole('link',{name:'Изменить ответы анкеты',exact:true}).click();
    await page.getByRole('heading',{name:'Когда хочешь начать учёбу?',exact:true}).waitFor();
    assert.equal(await page.locator('[data-vespi] [data-vespi]').count(),0);
    assert.equal(await page.locator('img[data-vespi]').count(),0,'Editing the questionnaire has no repeated mascot portrait');
    await capture('portal-questionnaire');
    assert.equal(calls.filter(path=>path.startsWith('/api/portal')).length,0,'No protected API calls during guest questionnaire, selection or self-report');
    results.push({width,sharedDraft:true,guestWithoutAuth:true,persistentSelection:true,existingMapAndComparison:true,noFutureUpload:true,exampleHonest:true,singleMascot:true,accessWall:true,oneFreeCheck:true,noStoredFileOrReportContent:true});
    await context.close();
  }
  assert.deepEqual(errors,[],'No browser runtime errors');
  await writeFile(resolve(output,'results.json'),JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({results,errors},null,2));
} catch(error) { if(activePage)await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});throw error; }
finally {await browser.close();await new Promise(done=>server.close(done));}
