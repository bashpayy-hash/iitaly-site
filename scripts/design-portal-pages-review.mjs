import assert from 'node:assert/strict';
import { portalDestination, portalStage } from './portal-review-navigation.mjs';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fixture, upstreamProgress } from './portal-review-fixtures.mjs';

// Compact previews preserve the route and saved task contracts; instructions stay in the detail.
// Preserve task, upload, save, focus and reduced-motion behavior coverage.
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.REVIEW_TOOLS,'playwright'));
const output=resolve(process.env.ROAD_DESIGN_REVIEW_OUTPUT||'design-review/portal-pages');
await mkdir(output,{recursive:true});
const root=resolve('out'),mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(path!==root&&!path.startsWith(root+sep))return res.writeHead(403).end();
    for(const file of [path,path+'.html',resolve(path,'index.html')])if(await stat(file).then(s=>s.isFile()).catch(()=>false)){
      res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});return res.end(await readFile(file));
    }res.writeHead(404).end();
  }catch{res.writeHead(500).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch(process.env.REVIEW_CHROMIUM ? {executablePath:process.env.REVIEW_CHROMIUM,args:["--no-sandbox","--disable-dev-shm-usage"]} : {});
const results=[],errors=[],unexpected=[];let activePage;

async function noOverflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No page-wide horizontal scrolling');}
async function axe(page,label){
  await page.addScriptTag({path:resolve(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
  assert.deepEqual(violations,[],label+': axe');
}
async function open(viewport,mode='partial',options={}){
  const data=fixture(mode),calls=[],fileCalls=[];let failTask=Boolean(options.failTask);
  if(options.docsCurrent){data.client.name='Demo';data.client.profile={...data.client.profile,universityIds:['unipd','luiss']};data.done={profile:true,shortlist:true,chances:true};for(const row of data.roadmap.find(s=>s.id==='docs').tasks){row.deadline='2027-01-31';row.time='1–3 недели';}for(const row of data.roadmap.find(s=>s.id==='docs').tasks)row.t=({apostille:'Поставить апостиль на аттестат или диплом',translate:'Сделать официальный перевод на итальянский',notary:'Заверить перевод у нотариуса',checkDocs:'Проверить комплект документов'})[row.id]||row.t;}
  if(options.translationCurrent){data.done.apostille=true;data.done.kit=true;data.done.codice=true;Object.assign(data.roadmap.find(s=>s.id==='docs').tasks.find(t=>t.id==='translate'),{time:'~3–7 дней',daysLeft:98});data.roadmap.find(s=>s.id==='arrival').tasks.forEach(t=>{t.t=({kit:'Подготовить Kit Giallo',codice:'Получить codice fiscale',questura:'Прийти в Questura'})[t.id];});}
  if(options.report) data.docs.translate={fileName:'translation.txt',checkedAt:'2026-10-25T12:00:00Z',verdict:'warn',result:{verdict:'warn',summary:'Нужно уточнить требования получателя.',checks:[{status:'warn',label:'Заверение',note:'Сверить способ заверения.'}],problems:[{text:'Требования пока не подтверждены.',fix:'Уточнить у получателя.'}],nextSteps:['Сверь требования получателя.']}};
  const context=await browser.newContext({viewport,reducedMotion:options.motion?'no-preference':'reduce',locale:'ru-RU'});
  await context.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url()),json=value=>route.fulfill({json:value});
    if(url.pathname==='/api/event')return json({ok:true});
    if(url.pathname==='/health/ai')return json({ok:true,code:'AI_READY'});
    if(url.pathname==='/api/portal/lookup'){assert.deepEqual(req.postDataJSON(),{code:'TEST-01',surname:'Testov'});return json({...data,progress:upstreamProgress(data)});}
    if(url.pathname==='/api/portal/TEST-01/task'){
      const body=req.postDataJSON();calls.push(body);assert.equal(body.surname,'Testov');
      if(failTask){failTask=false;return route.fulfill({status:503,json:{ok:false,error:'Синтетический сбой сохранения'}});}
      data.done[body.task]=body.value;return json({ok:true,done:data.done,progress:upstreamProgress(data)});
    }
    if(url.pathname==='/api/check-document'){fileCalls.push('check');return json({ok:true,result:{verdict:'ok',summary:'Синтетическая справка прошла внутреннюю проверку.',checks:[],problems:[],nextSteps:[]}});}
    if(url.pathname==='/api/portal/TEST-01/doc'){
      fileCalls.push('save');const body=req.postDataJSON();assert.equal(body.surname,'Testov');
      data.docs[body.task]={fileName:body.fileName,result:body.result,verdict:body.result.verdict};data.done[body.task]=true;
      return json({ok:true,done:data.done,docs:data.docs,progress:upstreamProgress(data)});
    }
    if(url.pathname.startsWith('/api/'))unexpected.push(url.pathname);
    return url.origin===origin&&!url.pathname.startsWith('/api/')?route.continue():route.abort();
  });
  const page=await context.newPage();activePage=page;page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(() => {
    window.__notes = 0; window.__frequencies = [];
    const Native = window.AudioContext;
    if (Native) window.AudioContext = class extends Native { createOscillator() { window.__notes++; const osc=super.createOscillator(); const set=osc.frequency.setValueAtTime.bind(osc.frequency); osc.frequency.setValueAtTime=(value,time)=>{ window.__frequencies.push(value); return set(value,time); }; return osc; } };
  });
  await page.goto(origin+'/portal?auth=login',{waitUntil:'networkidle'});
  await page.getByLabel('Фамилия',{exact:true}).fill('Testov');await page.getByLabel('Код доступа',{exact:true}).fill('TEST-01');
  await page.getByRole('button',{name:'Войти в кабинет',exact:true}).click();
  await page.locator(mode==='onboarding'?'[data-portal-profile]':'[data-portal-overview]').waitFor({state:'attached'});
  await page.evaluate(()=>document.fonts.ready);return {page,context,data,calls,fileCalls};
}
const taskNav = page => page.getByRole('navigation',{name:'Разделы задачи',exact:true});
const crumbs = page => page.getByRole('navigation',{name:'Путь по кабинету',exact:true});
try {
 for(const width of [1440,390,320]) {
  const {page,context,data,calls,fileCalls}=await open({width,height:900},'screenshot-parent',{docsCurrent:true,translationCurrent:true});
  assert.equal(await page.locator('[data-task-check]').count(),1);
  assert.match(await page.locator('[data-road-count]').innerText(),/4 из 26 шагов\s*заранее: 2/);
  const initialCount = await page.locator('[data-road-count]').innerText();
  await page.locator('[data-road-stage=arrival]').click();
  await page.locator('[data-flight-stage-preview=arrival]').waitFor();
  assert.equal(await page.locator('[data-road-count]').innerText(), initialCount, 'Preview does not change completion');
  assert.equal(calls.length, 0, 'Preview never writes a task');
  await page.locator('[data-road-stage=docs]').click();
  await noOverflow(page);await axe(page,`Overview ${width}`);
  await page.screenshot({path:resolve(output,`overview-${width}.png`),fullPage:true});
  for(const stage of data.roadmap) {
   await portalStage(page,stage.id);
   await page.locator('[data-portal-page=stage]').waitFor();
   assert.equal(new URL(page.url()).searchParams.get('stage'),stage.id);
   assert.equal(await page.locator('#portal-overview-heading').innerText(),stage.title);
   assert.equal(await page.locator('[data-task-check]').count(),1);
   assert.equal(await page.locator('[data-stage-switcher] [data-story-pill]').count(),stage.tasks.length);
   if(stage.tasks.length>1){await page.locator('[data-stage-switcher] [data-story-pill]').last().click();assert.equal(new URL(page.url()).searchParams.get('step'),stage.tasks.at(-1).id);assert.equal(await page.locator('[data-task-check]').count(),1);}
   assert.equal(await page.locator('[data-portal-now]').count(),0);
   assert.equal(await page.locator('[data-portal-road] [data-flight-plan][data-compact=true]').count(),1);
   await noOverflow(page);
  }
  await portalStage(page,'docs');
  await page.screenshot({path:resolve(output,`stage-${width}.png`),fullPage:true});await axe(page,`Stage ${width}`);
  await page.locator('[data-portal-task=translate]').click();
  await page.locator('[data-task-page=overview]').waitFor();
  assert.equal(await page.locator('[data-portal-road]').count(),0,'One task at a time, no repeated route');
  assert.equal(await page.locator('[data-micro-steps] li').count(),0,'The brief does not repeat the instruction');
  assert.equal(await page.locator('[data-step-instructions]').count(),0);
  assert.equal(await page.locator('[data-document-upload-form]').isVisible(),false);
  assert.equal(await page.locator('[data-higgsfield-visual]').count(),0);
  await noOverflow(page);await axe(page,`Brief ${width}`);
  await page.screenshot({path:resolve(output,`brief-${width}.png`),fullPage:true});
  await taskNav(page).getByRole('link',{name:'Как выполнить',exact:true}).click();
  await page.locator('[data-task-page=guide]').waitFor();
  assert.match(await page.title(),/Собери оригиналы/);
  assert.equal(await page.locator('[data-instruction-point]').count(),1,'Only one instruction point is rendered');
  assert.equal(await page.locator('[data-document-upload-form]').isVisible(),false);
  await page.waitForFunction(()=>document.activeElement?.id==='portal-instruction-heading');
  await page.locator('[data-instruction-next]').click();
  assert.equal(new URL(page.url()).searchParams.get('item'),'2');
  assert.equal(await page.locator('#portal-instruction-heading').innerText(),'Передай переводчику');
  await page.goBack();await page.locator('[data-instruction-point="1"]').waitFor();
  await page.goForward();await page.locator('[data-instruction-point="2"]').waitFor();
  assert.equal(await page.locator('[data-instruction-point]').count(),1);
  const guideUrl=page.url();
  await page.screenshot({path:resolve(output,`guide-${width}.png`),fullPage:true});await axe(page,`Guide ${width}`);
  await taskNav(page).getByRole('link',{name:'Проверка документа',exact:true}).click();
  const form=page.locator('[data-document-upload-form]');await form.waitFor();
  await form.locator('input[type=file]').setInputFiles({name:'unsent-translation.txt',mimeType:'text/plain',buffer:Buffer.from('SYNTHETIC FILE. No personal data.')});
  assert.match(await form.locator('[data-selected-document]').innerText(),/unsent-translation/);
  await taskNav(page).getByRole('link',{name:'Как выполнить',exact:true}).click();
  await page.goBack();await form.waitFor();
  assert.match(await form.locator('[data-selected-document]').innerText(),/unsent-translation/,'Back preserves the selected file');
  await page.goForward();await page.locator('[data-task-page=guide]').waitFor();
  await taskNav(page).getByRole('link',{name:'Проверка документа',exact:true}).click();
  assert.match(await form.locator('[data-selected-document]').innerText(),/unsent-translation/,'In-page links preserve the selected file');
  assert.equal(fileCalls.length,0,'Reading and file selection never start AI');
  await noOverflow(page);await axe(page,`Action ${width}`);
  await page.screenshot({path:resolve(output,`action-${width}.png`),fullPage:true});
  await page.goto(guideUrl,{waitUntil:'networkidle'});await page.locator('[data-task-page=guide]').waitFor();
  assert.equal(await page.locator('#portal-instruction-heading').innerText(),'Передай переводчику','A copied point URL restores the same content');
  assert.equal(await taskNav(page).getByRole('link',{name:'Как выполнить',exact:true}).getAttribute('aria-current'),'page');
  await crumbs(page).getByRole('link',{name:'Документы',exact:true}).click();
  await page.locator('[data-portal-page=stage]').waitFor();
  await crumbs(page).getByRole('link',{name:'Мой план',exact:true}).click();
  await page.locator('[data-portal-page=overview]').waitFor();
  assert.equal(await page.locator('[data-task-check]').count(),1);assert.equal(calls.length,0);
  await portalStage(page,'docs');
  await portalDestination(page,'Обзор');
  assert.equal(new URL(page.url()).search,'','The main menu returns to the overview URL and view together');
  assert.equal(await page.locator('[data-task-check]').count(),1);
  await page.goto(guideUrl,{waitUntil:'networkidle'});await page.locator('[data-task-page=guide]').waitFor();
  await portalDestination(page,'Обзор');
  assert.equal(new URL(page.url()).search,'','The main menu remains reachable on inner pages');
  results.push({width,allStages:6,directLinks:true,backForward:true,mainMenuReturnsHome:true,selectedFilePreserved:true,noFalseCompletion:true});await context.close();
 }
 for(const width of [1440,390]) {
  const {page,context,data,fileCalls}=await open({width,height:900},'screenshot-parent',{docsCurrent:true,translationCurrent:true,report:true});
  data.done.translate=true;data.done.notary=true;
  await page.goto(origin+'/portal?view=plan&task=cimea',{waitUntil:'networkidle'});await page.locator('[data-task-page=overview]').waitFor();
  assert.equal(await page.locator('[data-portal-road],[data-micro-steps]').count(),0,'The CIMEA brief has no global plan or generic repeated instructions');
  assert((await page.locator('[data-task-page=overview]').boundingBox()).width<=1040);await noOverflow(page);await axe(page,`CIMEA ${width}`);
  await page.screenshot({path:resolve(output,`cimea-${width}.png`),fullPage:true});
  await page.goto(origin+'/portal?view=docs&doc=translate',{waitUntil:'networkidle'});
  const report=page.getByRole('region',{name:'Разбор документа',exact:true});await report.waitFor();
  const navigation=page.getByRole('navigation',{name:'Разделы разбора документа'});
  assert.equal(await report.locator('[data-report-details-page]').isVisible(),false);
  assert.equal(await report.locator('[data-report-upload-page]').isVisible(),false);
  assert.match(await report.innerText(),/Нужно уточнить/);
  await noOverflow(page);await axe(page,`Report summary ${width}`);await page.screenshot({path:resolve(output,`result-${width}.png`),fullPage:true});
  await navigation.getByRole('link',{name:'Полный разбор',exact:true}).click();
  assert.match(await report.innerText(),/Уточнить у получателя/);
  assert.equal(await report.locator('[data-report-details-page] [data-instruction-point]').count(),1);
  await report.getByText('Файл и сроки',{exact:true}).click();assert.match(await report.innerText(),/translation.txt/);
  await report.locator('[data-instruction-next]').click();assert.equal(new URL(page.url()).searchParams.get('finding'),'2');
  assert.match(await report.locator('[data-report-details-page]').innerText(),/Заверение/);
  await page.reload({waitUntil:'networkidle'});assert.equal(await report.locator('[data-report-details-page]').isVisible(),true);
  await navigation.getByRole('link',{name:'Новая проверка',exact:true}).click();
  const form=report.locator('[data-document-upload-form]');await form.waitFor();
  await form.locator('input[type=file]').setInputFiles({name:'unsent.txt',mimeType:'text/plain',buffer:Buffer.from('SYNTHETIC')});
  await navigation.getByRole('link',{name:'Результат',exact:true}).click();
  await page.goBack();await form.waitFor();assert.match(await form.innerText(),/unsent.txt/);
  assert.equal(fileCalls.length,0);await noOverflow(page);await axe(page,`Report upload ${width}`);
  results.push({width,reportSections:true,noReviewOnNavigation:true});await context.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
 await writeFile(resolve(output,'report.json'),JSON.stringify({results},null,2));console.log(JSON.stringify({passed:results.length,output}));
}catch(error){if(activePage&&!activePage.isClosed())await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});throw error;}
finally{await browser.close();server.close();}
