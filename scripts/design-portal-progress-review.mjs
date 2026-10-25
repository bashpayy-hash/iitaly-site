import { editorialContrastFindings } from './portal-editorial-contrast.mjs';
import { portalDestination } from './portal-review-navigation.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fixture, upstreamProgress } from './portal-review-fixtures.mjs';

// User refinement: real counts and explicit stage states replace mascot-led progress.
// Preserve task, upload, save, focus and reduced-motion behavior coverage.
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.REVIEW_TOOLS,'playwright'));
const sharp=require('sharp');
const output=resolve(process.env.ROAD_DESIGN_REVIEW_OUTPUT||'design-review/portal-progress');
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
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch();
const results=[],errors=[],unexpected=[];let activePage;
const road=page=>page.locator('[data-portal-road]');
const detail=page=>page.locator('[data-step-detail]');
async function go(page,name){await portalDestination(page,name);}
async function capture(page,name){await sharp(await page.screenshot({animations:'disabled'})).webp({quality:82}).toFile(resolve(output,name+'.webp'));}
async function noOverflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No page-wide horizontal scrolling');}
async function axe(page,label){
  await page.addScriptTag({path:resolve(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
  assert.deepEqual(await editorialContrastFindings(page, violations),[],label+': axe');
}
async function oneFace(page,label){
  assert.equal(await page.locator('img[src*="vespi-avatar-"], #chat-launcher img').count(),0,`${label}: no repeated cropped heads`);
  assert(await page.locator('[data-portal-document-coach]').count()<=1,`${label}: at most one contextual document illustration`);
}
async function open(viewport,mode='partial',options={}){
  const data=fixture(mode),calls=[],fileCalls=[];let failTask=Boolean(options.failTask);
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
  await page.addInitScript(()=>window.addEventListener('iitaly:open-chat',event=>{window.__portalEvent=event.detail;event.stopImmediatePropagation();},true));
  await page.goto(origin+'/portal?auth=login',{waitUntil:'networkidle'});
  await page.getByLabel('Фамилия',{exact:true}).fill('Testov');await page.getByLabel('Код доступа',{exact:true}).fill('TEST-01');
  await page.getByRole('button',{name:'Войти в кабинет',exact:true}).click();
  await page.locator(mode==='onboarding'?'[data-portal-profile]':'[data-portal-overview]').waitFor({state:'attached'});
  await page.evaluate(()=>document.fonts.ready);return {page,context,data,calls,fileCalls};
}
async function railContract(page,data,compact){
  assert.equal(await road(page).count(),1,'Exactly one global route');
  assert.equal(await page.getByRole('navigation',{name:'Этапы маршрута',exact:true}).count(),1,'One actual-stage navigator');
  assert.equal(await page.locator('[aria-label="Пять этапов маршрута"],[data-workspace-ring]').count(),0,'No second taxonomy/ring');
  assert.equal(await page.locator('main [data-portal-road]').count(),compact?0:1,'The overview route follows the greeting; other views keep one compact chrome route');
  assert.equal(await page.locator('[data-portal-welcome]').count(),compact?0:1,'The personal welcome appears only on the overview');
  const fileIds=new Set(['apostille','translate','notary','cimea','familyDocs','iseeu','statements','insurance','housing','universitaly']);
  const complete=t=>Boolean(data.done[t.id])||(fileIds.has(t.id)&&data.docs[t.id]?.verdict==='ok');
  const tasks=data.roadmap.flatMap(s=>s.tasks);
  let current=data.roadmap.findIndex(s=>s.tasks.some(t=>!complete(t)&&t.available!==false));
  if(current<0)current=data.roadmap.findIndex(s=>s.tasks.some(t=>!complete(t)));
  const openStages=current<0?data.roadmap:data.roadmap.slice(0,current+1);
  const done=openStages.flatMap(s=>s.tasks).filter(complete).length;
  assert.equal(Number(await road(page).getAttribute('data-road-done')),done);assert.equal(Number(await road(page).getAttribute('data-road-total')),tasks.length,'Ignore obsolete done IDs');
  assert.equal(await road(page).locator('[data-road-stage]').count(),data.roadmap.filter(s=>s.tasks.length).length,'Real stages, no fixed demo phases');
  const progress=road(page).getByRole('progressbar',{name:'Выполненные шаги маршрута'});
  assert.equal(Number(await progress.getAttribute('aria-valuenow')),done,'Accessible progress counts completed real tasks');
  assert.equal(Number(await progress.getAttribute('aria-valuemax')),tasks.length||1);
  assert.equal(await progress.getAttribute('aria-valuetext'),`${done} из ${tasks.length} шагов`);
  assert.equal(await road(page).locator('img').count(),0,'Progress is data, not a repeated mascot');
  for(const link of await road(page).locator('[data-road-stage]').all()){
    const id=await link.getAttribute('data-road-stage'),stage=data.roadmap.find(row=>row.id===id);
    const stageDone=stage.tasks.filter(complete).length;
    assert((await link.innerText()).includes(`${stageDone} / ${stage.tasks.length} шагов`),'Each stage shows its own real completed/total count');
    assert.equal(await link.getAttribute('data-road-stage-state'),openStages.includes(stage)&&stageDone===stage.tasks.length?'done':await link.getAttribute('aria-current')==='step'?'current':'future');
    assert.equal(await link.evaluate(n=>n.tagName),'A');assert(await link.evaluate(n=>n.getBoundingClientRect().height>=44),'Touchable stage link');assert.match(await link.getAttribute('href'),/^\/portal\?stage=/);
  }
  if(compact){assert.equal(await road(page).getAttribute('data-road-navigation-only'),'true');assert.equal(await road(page).locator('[data-road-step-title],[data-road-open],img[data-vespi]').count(),0,'Header repeats no task/face');assert((await road(page).boundingBox()).height<=await page.evaluate(()=>innerHeight*.4),'Counts and navigation leave most of the viewport for the task');}
  await noOverflow(page);await oneFace(page,'Route');
}
async function arrivalOrder(page,data) {
  const welcome=page.locator('[data-portal-welcome]');
  assert.equal(await welcome.getByRole('heading',{level:1}).innerText(),`Привет, ${data.client.name.trim().split(/\s+/)[0]}!`,'The greeting uses the actual account first name');
  assert.equal(await welcome.locator('[data-vespi-scene=welcome]').count(),1,'Vespi rests above the separate route card');
  assert.equal(await road(page).getAttribute('data-road-navigation-only'),'true');
  const greetingBox=await welcome.boundingBox(),roadBox=await road(page).boundingBox();
  const progressBox=await road(page).getByRole('progressbar').boundingBox();
  const nextBox=await page.locator('[data-road-next]').boundingBox();
  const detailsBox=await page.locator('[data-portal-overview]').boundingBox();
  assert(greetingBox.y+greetingBox.height<=roadBox.y+1,'Welcome precedes the route');
  assert(progressBox.y+progressBox.height<=nextBox.y+1,'Progress precedes the current task details');
  assert(roadBox.y+roadBox.height<=detailsBox.y+1,'Overview details follow the route');
  assert(greetingBox.y>=0 && progressBox.y+progressBox.height<=await page.evaluate(()=>innerHeight),'Greeting and progress remain in the first viewport');
}
async function sticky(page){
  const chrome=page.locator('[data-portal-chrome]'),before=await chrome.boundingBox(),available=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
  if(available>80){await page.evaluate(()=>window.scrollTo(0,Math.min(400,document.documentElement.scrollHeight-innerHeight)));const after=await chrome.boundingBox();assert(Math.abs(before.y-after.y)<1,'Chrome stays pinned');await page.evaluate(()=>window.scrollTo(0,0));}
}
try{
  const base=process.env.BASE_SHA||'4ee084f';
  // The user explicitly replaced the brand mark on 24 October. The portal's
  // global palette, typography, progress and interaction contracts stay fixed.
  for(const file of ['src/app/globals.css'])assert.equal(await readFile(file,'utf8'),execFileSync('git',['show',`${base}:${file}`],{encoding:'utf8'}),file+' unchanged');
  for(const viewport of [{width:1440,height:900},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:390,height:667},{width:320,height:740}]){
    const {page,context,data,calls}=await open(viewport);await railContract(page,data,false);
    await arrivalOrder(page,data);
    assert.equal(await page.locator('[data-road-open]').count(),1,'The real current task remains one action after progress');
    assert(await page.locator('[data-road-open]').isVisible(),'The active task has one right-side breakdown action');
    if([1440,390].includes(viewport.width)&&viewport.height!==667)await capture(page,`portal-overview-${viewport.width}`);
    await go(page,'План');await page.locator('[data-portal-task="shortlist"]').waitFor();await railContract(page,data,false);
    assert.equal(await page.locator('[data-portal-task="shortlist"]').count(),1,'Current task written once');
    assert.equal(await page.locator('main [data-vespi-scene]').count(),1,'The greeting owns the single overview mascot');
    assert.equal(await page.locator('[data-portal-task] img[data-vespi], [data-road-stage] img').count(),0,'Tasks and stage navigation never repeat a mascot');assert.equal(await page.locator('[data-task-check]').count(),data.roadmap[0].tasks.length,'Each task keeps a check control');
    assert.equal(await page.locator('[data-portal-focus]').getAttribute('data-selected-stage'),'start','Current stage opens');
    if([1440,390].includes(viewport.width)&&viewport.height!==667)await capture(page,`portal-plan-${viewport.width}`);
    await sticky(page);await axe(page,'Plan '+viewport.width);
    if(viewport.width===1440){
      await road(page).locator('[aria-current=step]').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-road-stage')),'documents','Stage links follow native keyboard order');
      await page.keyboard.press('Enter');
    }else await road(page).locator('[data-road-stage="documents"]').click();
    await page.locator('[data-portal-focus][data-selected-stage=documents]').waitFor();
    await page.locator('[data-road-open]').click();
    await detail(page).waitFor();await railContract(page,data,true);
    assert.equal(await detail(page).getAttribute('data-step-detail'),'statements');assert.match(await detail(page).innerText(),/Сначала:/);
    assert.equal(await detail(page).locator('button,[data-portal-upload-zone]').count(),0,'Future document cannot upload/complete');
    await page.locator('[data-portal-assistant]').click();assert.equal(await page.evaluate(()=>window.__portalEvent.taskId),'statements','Assistant receives open task ID');assert.equal(calls.length,0,'Navigation/helper never complete tasks');
    await page.goBack();await page.locator('[data-portal-focus][data-selected-stage=documents]').waitFor();
    await go(page,'Обзор');await page.locator('[data-portal-overview]').waitFor({state:'attached'});
    await page.getByRole('link',{name:'Настройки',exact:true}).click();await page.getByRole('heading',{name:'Данные для маршрута',exact:true}).waitFor();await railContract(page,data,true);
    assert.equal(await page.getByRole('link',{name:'Настройки',exact:true}).getAttribute('aria-current'),'page');assert(await page.locator('[data-settings-back]').isVisible());
    assert.equal(await page.locator('#notifications').locator('summary').innerText(),'Напоминания выключены');assert.equal(await page.locator('aside').count(),0,'No duplicate sidebar');
    await axe(page,'Settings '+viewport.width);results.push({viewport,singleActualRoute:true,personalWelcomeBeforeProgress:true,detailsAfterProgress:true,noRepeatedTaskInPlan:true,noStageFaces:true,futureReadOnly:true,helperContext:true,sticky:true,axe:true});await context.close();
  }
  for(const width of [1440,390])for(const mode of ['zero','complete','empty','blocked','near','dates','parents','manual','last','full-route','screenshot-parent','late-current','parent-file','help']){
    const {page,context,data,calls,fileCalls}=await open({width,height:width===390?844:900},mode);await railContract(page,data,false);
    if(['complete','empty'].includes(mode))assert.equal(await page.locator('[data-road-open]').count(),0,'Finished/empty route has no invented action');
    if(mode==='dates')assert((await page.locator('[data-orientir-task]').count())<=2);
    if(['near','dates'].includes(mode))assert.doesNotMatch(await road(page).innerText(),/Дедлайн:/);
    if(mode==='blocked'){await page.locator('[data-road-open]').click();await detail(page).waitFor();assert.equal(await detail(page).locator('button').count(),0);assert.match(await detail(page).innerText(),/Сначала|появ|рано|услов|программ|позже/i);}
    if(['manual','last'].includes(mode)){
      await page.locator('[data-road-open]').click();await detail(page).waitFor();assert.equal(await detail(page).locator('button').count(),1);await page.getByRole('button',{name:'Готово',exact:true}).click();
      await page.locator('[data-portal-overview]').waitFor({state:'attached'});assert.equal(calls.length,1);assert.equal(calls[0].value,true);
      assert.equal(await road(page).locator('[data-road-feedback][data-visible=true]').innerText(),mode==='last'?'Все шаги сохранены':'Шаг сохранён');assert.equal(await road(page).getAttribute('data-road-done'),mode==='manual'?'2':'1');
      await page.reload({waitUntil:'networkidle'});assert.equal(await road(page).locator('[data-road-feedback][data-visible=true]').count(),0,'Reload announces no fresh completion');
    }
    if(['parent-file','late-current'].includes(mode)){
      await page.locator('[data-road-open]').click();await detail(page).waitFor();assert.equal(await detail(page).locator('button[data-primary-action]').count(),1,'Current file has one action');
      if(mode==='parent-file')assert.equal(await detail(page).locator('h2').innerText(),'Собрать справки о составе и доходах семьи для DSU');
      await oneFace(page,'File inspector');await axe(page,'File '+mode+' '+width);
      if(mode==='parent-file'){
        const transfer=await page.evaluateHandle(()=>{const d=new DataTransfer();d.items.add(new File(['SYNTHETIC DOCUMENT ONLY. NO PERSONAL DATA.'],'synthetic-review.txt',{type:'text/plain'}));return d;});
        await page.locator('[data-portal-upload-zone]').dispatchEvent('drop',{dataTransfer:transfer});
        assert.deepEqual(fileCalls,[],'Dropping selects a file without starting a check');
        await page.getByRole('button',{name:'Проверить документ',exact:true}).click();
        await page.locator('[data-portal-overview]').waitFor({state:'attached'});assert.deepEqual(fileCalls,['check','save']);assert.equal(calls.length,0,'No separate uploaded self-report');
      }
    }
    if(mode==='screenshot-parent'){await go(page,'План');await page.locator('[data-current-task=true]').waitFor();assert.equal(await page.locator('[data-road-step-title]').count(),1);assert.equal(await page.getByText('Рассчитать бюджет и оценить шансы на стипендию DSU',{exact:true}).count(),1,'Direct budget task appears once');await capture(page,`portal-plan-parent-${width}`);}
    if(mode==='late-current')await capture(page,`portal-document-${width}`);
    assert.doesNotMatch(await page.locator('#portal-panel').innerText(),/родител/i,'Saved owner roles must not reintroduce delegated task copy');
    await noOverflow(page);results.push({width,mode,passed:true});await context.close();
  }
  for(const motion of [false,true]){
    const {page,context,calls}=await open({width:390,height:844},'manual',{motion,failTask:true});await page.locator('[data-road-open]').click();await detail(page).waitFor();await page.getByRole('button',{name:'Готово',exact:true}).click();
    await page.locator('#portal-panel [role=alert]').waitFor();assert.equal(await road(page).getAttribute('data-road-done'),'1');assert.equal(await road(page).locator('[data-road-feedback][data-visible=true]').count(),0,'Failed save cannot announce success');
    await page.locator('#portal-panel [role=alert]').locator('..').getByRole('link').click();await page.locator('[data-portal-overview]').waitFor({state:'attached'});assert.equal(calls.length,2);
    if(motion){await page.waitForFunction(()=>document.querySelector('[data-portal-road]')?.dataset.roadTransition==='true');await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('[data-portal-road]')?.dataset.traveling==='false');}
    const geometry=await road(page).evaluate(node=>{const f=node.querySelector('[data-road-fill]'),m=node.querySelector('[data-road-location]');return {fill:f.getBoundingClientRect().width,marker:new DOMMatrix(getComputedStyle(m).transform).m41,transition:getComputedStyle(f).transitionDuration};});
    assert(Math.abs(geometry.fill-geometry.marker)<1);assert(geometry.transition.split(',').every(v=>parseFloat(v)===0));results.push({motion,errorRetry:true,confirmedFeedbackOnly:true,reducedMotionImmediate:true});await context.close();
  }
  for(const width of [1440,390]){
    const {page,context}=await open({width,height:844},'onboarding');assert.equal(await page.locator('[data-vespi-intro=portal]').count(),0);assert.equal(await page.locator('main img[data-vespi]').count(),0,'Onboarding has no repeated portrait');assert.equal(await road(page).count(),0);await noOverflow(page);await oneFace(page,'Onboarding');await axe(page,'First-entry introduction '+width);await capture(page,`portal-onboarding-${width}`);await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
  await writeFile(resolve(output,'results.json'),JSON.stringify({results,errors,unexpected},null,2));console.log(JSON.stringify({results,errors,unexpected},null,2));
}catch(e){if(activePage&&!activePage.isClosed())await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});throw e;}
finally{await browser.close();await new Promise(done=>server.close(done));}
