import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fixture, upstreamProgress } from './portal-review-fixtures.mjs';

// Compact previews preserve the route and saved task contracts; instructions stay in the detail.
// Preserve task, upload, save, focus and reduced-motion behavior coverage.
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.REVIEW_TOOLS,'playwright'));
const output=resolve(process.env.ROAD_DESIGN_REVIEW_OUTPUT||'design-review/portal-focus');
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
const road=page=>page.locator('[data-portal-road]');

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
try {
  for (const width of [1440,390]) {
    const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});
    await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
    const page=await context.newPage();activePage=page;page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/portal',{waitUntil:'networkidle'});await page.locator('[data-portal-focus]').waitFor();await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('[data-road-count]').innerText(),'0 из 2 шагов');
    assert.equal(await page.locator('[data-road-locked]').count(),4);
    assert.deepEqual(await page.locator('[data-road-locked]').evaluateAll(nodes=>nodes.map(el=>el.getAttribute('aria-label').replace(/^\d+\. |\. После анкеты$/g,''))),['Язык и тесты','Документы','Финансы и DSU','Виза и переезд'],'Locked stages are the phases the questionnaire really opens');
    assert.match(await page.locator('[data-now-stage-label]').textContent(),/^Этап 1 из 5 · /,'The plate counts the same stages as the route');
    assert.equal(await page.locator('[data-road-locked] a,[data-road-locked] button').count(),0,'Preview stages cannot change stored progress');
    assert.equal(await page.locator('[data-stamp-count]').innerText(),'0 / 2');
    assert.match(await page.locator('[data-portal-now] blockquote').innerText(),/Ответь на 10 вопросов/,'Quote reflects the existing questionnaire');
    await page.locator('[data-stage-souvenir] img').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{const img=document.querySelector('[data-stage-souvenir] img');return img.complete&&img.naturalWidth>0;});
    assert.equal(await page.locator('[data-stage-souvenir]').getAttribute('data-earned'),'false');
    assert.notEqual(await page.locator('[data-stage-souvenir]').evaluate(el=>getComputedStyle(el).boxShadow),'none');
    // Owner 2026-10-25: gradients only for the terracotta glow behind Vespi and the current step's kraft.
    assert.deepEqual(await page.locator('[data-portal-focus]').evaluate(el=>[...el.querySelectorAll('*')].filter(node=>getComputedStyle(node).backgroundImage.includes('gradient')).map(node=>node.hasAttribute('data-portal-now')?'now':node.hasAttribute('data-focus-task')?'step':node.tagName)),['now','step']);
    await page.evaluate(()=>document.fonts.load('500 16px "Inter Tight"','Привет, Қазақстан!'));
    assert.equal(await page.evaluate(()=>document.fonts.check('500 16px "Inter Tight"','Привет, Қазақстан!')),true);
    const hit=await page.locator('[data-task-check=profile]').boundingBox();assert(hit.width>=44&&hit.height>=44);
    await noOverflow(page);await axe(page,`New local profile ${width}`);
    await page.screenshot({path:resolve(output,`guest-${width}.png`),fullPage:true,animations:'disabled'});
    await page.locator('[data-task-ready=profile]').click();await page.locator('[data-plan-wizard]').waitFor();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')||'{}').complete===true),false,'Completion opens the real questionnaire rather than faking saved answers');
    results.push({width,guest:true,lockedStages:4,realQuestionnaire:true});await context.close();
  }
  for(const width of [1440,1024,768,390,320]) {
    const {page,context,calls}=await open({width,height:900},'screenshot-parent',{docsCurrent:true,translationCurrent:true});
    assert.equal(await page.locator('[data-portal-welcome] h1').innerText(),'Привет, Demo!');
    assert.match(await page.locator('[data-saved-universities]').innerText(),/Università di Padova/);
    assert.match(await page.locator('[data-saved-universities]').innerText(),/LUISS Guido Carli/);
    assert.match(await page.locator('[data-road-count]').innerText(),/4 из 26 шагов\s*заранее: 2/);
    assert.equal(await road(page).getAttribute('data-road-ahead'),'2');
    assert.equal(await page.locator('[data-portal-welcome] a,[data-portal-welcome] button').count(),0,'Greeting metadata is plain text');
    assert.equal(await page.locator('[data-portal-now] [data-vespi-scene]').count(),1,'Vespi lives in the Now column');
    // User request 2026-10-25: the Now plate wears the current stage costume.
    assert.equal(await page.locator('[data-portal-now] [data-vespi-scene]').getAttribute('data-vespi-scene'),'stage-'+(await page.locator('[data-portal-now]').getAttribute('data-now-stage')).replace('education12','education'));
    assert.match(await page.locator('[data-now-deadline]').innerText(),/98\s*дней до ориентира/);
    assert.equal(await page.locator('[data-now-ahead] li').count(),2);
    assert.equal(await page.locator('[data-portal-overview] [data-expanded=true]').count(),1,'Only the current task expands');
    assert.equal(await page.locator('[data-road-stage]').count(),6);
    assert.equal(await page.locator('[data-task-check]').count(),5);
    assert.equal(await page.locator('[data-task-check]:disabled').count(),0);
    const editorial=await page.evaluate(()=>{
      const style=q=>getComputedStyle(document.querySelector(q));
      const task=style('[data-focus-task=translate]');
      return {greeting:style('[data-portal-welcome] h1').fontFamily,title:style('[data-focus-task=translate] strong').fontFamily,
        greetingWeight:style('[data-portal-welcome] h1').fontWeight,count:style('[data-road-count]>span').fontFamily,countWeight:style('[data-road-count]>span').fontWeight,
        paper:style('[data-portal-editorial]').backgroundColor,texture:style('[data-portal-editorial]').backgroundImage,
        left:task.borderLeftWidth,leftColor:task.borderLeftColor,radius:task.borderRadius,background:task.backgroundColor};
    });
    // Owner's zhol kit, 2026-10-25: the kit's Inter Tight everywhere, no serif headline.
    assert.match(editorial.greeting,/Inter Tight/);assert.doesNotMatch(editorial.greeting,/Charter|Georgia|Spectral/);assert.equal(editorial.count,editorial.title);assert.match(editorial.title,/Inter Tight/);
    assert.equal(editorial.greetingWeight,'600');assert.equal(editorial.countWeight,'600');
    assert.equal(await page.locator('[data-focus-row] strong').evaluateAll(nodes=>nodes.every(el=>getComputedStyle(el).fontWeight==='600')),true);
    assert.equal(await page.locator('[data-road-fill],[data-road-scooter]').count(),0,'Only the checkpoint route remains');
    assert.equal(await page.getByRole('progressbar',{name:'Выполненные шаги маршрута'}).count(),1);
    assert.equal(await page.locator('[data-portal-overview] [data-higgsfield-visual],[data-portal-overview] [data-micro-steps],[data-portal-rubric]').count(),0,'Preview contains no illustration, microsteps or rubric');
    if(width>1100)assert.equal(await page.getByRole('navigation',{name:'Основная навигация',exact:true}).getByRole('link').count(),3);
    else { await page.getByLabel('Открыть меню',{exact:true}).click();assert(await page.getByRole('navigation',{name:'Мобильная навигация'}).getByRole('link',{name:'Гайды и виза'}).isVisible());await page.getByLabel('Открыть меню',{exact:true}).press('Escape'); }
    assert.equal(editorial.paper,'rgb(247, 244, 234)');assert.match(editorial.texture,/zhol-paper\.webp/,'zhol paper texture');
    assert.equal(editorial.left,'2px');assert.equal(editorial.leftColor,'rgb(53, 43, 40)');assert.equal(editorial.radius,'20px');assert.equal(editorial.background,'rgb(251, 249, 243)');
    // Owner 2026-10-25: visible tactile grain as background layers, never a fixed full-screen filter.
    assert.equal(await page.locator('[data-portal-grain]').count(),0,'No fixed full-screen grain overlay');
    const tactile=await page.evaluate(()=>{const s=q=>getComputedStyle(document.querySelector(q));const root=s('[data-portal-navigation]'),step=s('[data-focus-task=translate]'),grain=s('[data-portal-now] [data-dark-grain]');
      return {root:root.backgroundImage,rootBlend:root.backgroundBlendMode,step:step.backgroundImage,stepShadow:step.boxShadow,grain:grain.opacity,grainBlend:grain.mixBlendMode};});
    assert.match(tactile.root,/^url\("data:image\/svg\+xml.*feTurbulence.*opacity='0\.06'/,'Paper grain at 6%');assert.match(tactile.rootBlend,/^multiply/);
    assert.match(tactile.step,/feTurbulence.*baseFrequency='0\.9'.*opacity='0\.07'/,'Kraft grain on the current step');assert.match(tactile.step,/linear-gradient\(135deg/);assert.match(tactile.stepShadow,/inset/);
    assert.equal(tactile.grain,'0.08');assert.equal(tactile.grainBlend,'overlay');
    assert(await page.locator('[data-task-ready=translate]').isVisible());
    assert.equal(await page.locator('header a.logo-link').getAttribute('href'),'/');
    const fill=await road(page).evaluate(el=>Number(el.style.getPropertyValue('--route-fill')));
    assert(Math.abs(fill-4/26)<0.0001,'Visible rail excludes the two tasks completed ahead');
    assert.equal(await page.locator('[data-road-stage=arrival]').getAttribute('data-road-stage-state'),'future');
    assert.equal(await page.locator('[data-road-stage=arrival] [data-stage-ahead]').innerText(),'заранее');
    assert.match(await page.locator('article').filter({has:page.locator('[data-focus-row=notary]')}).innerText(),/03/,'Future task retains its chronological index');
    if(width>600){
      const points=await page.locator('[data-road-stage]>span:first-child').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().y));
      assert(Math.max(...points)-Math.min(...points)<1,'Every checkpoint uses the same axis');
      assert.equal(await page.locator('[data-road-stage=docs]').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)','Current stage has no box');
    }else assert.equal(await page.getByRole('navigation',{name:'Этапы маршрута'}).evaluate(el=>el.scrollWidth>el.clientWidth),true,'Only the mobile stage chips scroll horizontally');

    const surface=await page.locator('[data-portal-focus]').evaluate(el=>getComputedStyle(el).backgroundColor);
    assert.equal(surface,'rgba(0, 0, 0, 0)','The complete page is not enclosed in a white card');
    const route=await page.locator('[data-route-card]').boundingBox(),work=await page.locator('[data-portal-overview]').boundingBox();
    assert(Math.abs(work.y-route.y-route.height-(width<=600?16:20))<1,'Route and checklist share a compact grid');
    const header=await page.locator('[data-portal-welcome]').boundingBox();assert(header.y+header.height<=route.y+1);
    const now=await page.locator('[data-portal-now]').boundingBox();
    if(width>1100){assert(now.x>=route.x+route.width+23);assert(Math.abs(now.y-route.y)<1);
      // User request 2026-10-25: the dark plate hugs its content, no empty middle.
      assert(now.height<=route.height+work.height+20,'Now plate is not stretched beyond the work area');
      const gap=await page.locator('[data-portal-now]').evaluate(el=>{const pic=el.querySelector('[data-vespi-scene]').getBoundingClientRect();const text=[...el.children].filter(c=>c.tagName!=='svg'&&!c.contains(el.querySelector('[data-vespi-scene]'))).map(c=>c.getBoundingClientRect().bottom);return pic.top-Math.max(...text);});
      assert(gap<48,`No hole between the text and Vespi (${Math.round(gap)}px)`);}
    else assert(now.y+now.height<=route.y,'Now column moves above the route');
    const card=await page.locator('[data-focus-task=translate]').boundingBox(),copy=await page.locator('[data-focus-row=translate] h3').boundingBox();
    const ready=await page.locator('[data-task-ready=translate]').boundingBox(),openButton=await page.locator('[data-portal-task=translate]').boundingBox();
    assert(ready.height>=44&&openButton.height>=44,'Actions keep 44px hit targets');
    if(width>600){assert(card.height<=220,`Compact task height ${card.height} at ${width}px`);assert(openButton.x>=copy.x+copy.width+10);}
    else {assert(Math.abs(openButton.width-(card.width-28))<2,'Mobile primary action spans the card');assert(Math.abs(ready.width-openButton.width)<1);}
    assert.equal(await page.locator('[data-portal-task=translate]').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(184, 58, 39)');
    assert.equal(await page.locator('[data-task-ready=translate]').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)','Completion is a quiet text action');
    assert.equal(await page.locator('[data-task-check=translate] svg').evaluate(el=>el.getBoundingClientRect().width),26);
    assert.equal(await page.locator('[data-focus-task=translate] [data-step-short-explainer]').innerText(),'Получателю может понадобиться перевод документа и его приложений.');
    assert.equal(await page.locator('[data-focus-task=translate] [data-road-meta]>*').count(),2);
    assert.equal(await page.locator('[data-focus-task=translate] [data-road-meta]>*').evaluateAll(nodes=>nodes.every(el=>getComputedStyle(el).backgroundColor==='rgba(0, 0, 0, 0)')),true,'Dates and durations are text, not pills');
    assert.doesNotMatch(await page.locator('[data-portal-focus]').innerText(),/Главный фокус сейчас|Что сделать:|Нужно уточнить|Ориентир подготовки|Пройденные этапы|Все документы|Правила поступления/);
    assert.equal(await page.locator('main [data-vespi-scene]').count(),1,'One mascot on the overview');
    await noOverflow(page);await page.screenshot({path:resolve(output,`overview-${width}.png`),fullPage:true,animations:'disabled'});await axe(page,`Modular ${width}`);
    await page.locator('[data-focus-row=notary] a').click();await page.locator('[data-step-detail=notary]').waitFor();
    await page.getByRole('link',{name:'Назад',exact:true}).click();await page.locator('[data-portal-focus]').waitFor();
    assert.equal(await page.locator('[data-portal-overview] [data-expanded=true]').count(),1);assert(await page.locator('[data-portal-task=translate]').isVisible());
    await page.locator('[data-portal-task=translate]').click();await page.locator('[data-step-detail=translate]').waitFor();
    assert.match(await page.locator('#portal-step-heading').evaluate(el=>getComputedStyle(el).fontFamily),/Inter Tight/);
    assert.equal(await page.locator('[data-step-detail=translate] [data-micro-steps] li').count(),3,'Detailed instructions remain inside the breakdown');
    await noOverflow(page);await page.screenshot({path:resolve(output,`task-${width}.png`),fullPage:true,animations:'disabled'});
    await page.getByRole('link',{name:'Назад',exact:true}).click();await page.locator('[data-portal-focus]').waitFor();
    await page.locator('[data-portal-assistant]').click();await page.locator('[data-portal-chat=true]').waitFor();await page.waitForTimeout(400);
    assert.equal(await page.locator('[data-portal-now] [data-vespi-scene]').isVisible(),false,'Overview mascot retires behind the route');
    assert.equal(await page.locator('[data-vespi-scene=chat]').count(),1);
    assert.equal(await page.locator('[data-portal-now] [data-vespi-scene]').evaluate(el=>getComputedStyle(el).transform),'matrix(1, 0, 0, 1, 0, 20)');
    const panel=await page.locator('[data-portal-chat=true]').boundingBox();
    if(width<=1100)assert.equal(Math.round(panel.width),width);else{const main=await page.locator('[data-portal-design]').boundingBox();assert(main.x+main.width<=panel.x);}
    await page.screenshot({path:resolve(output,`chat-${width}.png`),animations:'disabled'});
    await axe(page,`Chat ${width}`);
    await page.getByRole('button',{name:'Закрыть чат',exact:true}).click();await page.locator('[data-portal-chat=true]').waitFor({state:'detached'});
    if(width===1440){
      for(const part of ['svg','span']){
        await page.locator('header a.logo-link').locator(part).first().click();await page.waitForURL(origin+'/');
        await page.goBack({waitUntil:'networkidle'});await page.locator('[data-portal-focus]').waitFor();
        assert.match(await page.locator('[data-road-count]').innerText(),/4 из 26 шагов\s*заранее: 2/);
      }
    }
    assert.equal(calls.length,0);results.push({width,compactHeight:card.height,checkboxes:5,instructionsOnlyInDetail:true,singleVisibleMascot:true,axeOtherRules:true,consistentFonts:true});await context.close();
  }
  for(const failTask of [false,true]) {
    const {page,context,calls,data}=await open({width:1440,height:900},'screenshot-parent',{docsCurrent:true,motion:true,failTask});
    await page.locator('[data-task-check=translate]').click();
    if(failTask){await page.locator('#portal-panel [role=alert]').waitFor();assert.equal(await page.locator('[data-task-check=translate]').getAttribute('aria-checked'),'false');assert.equal(await page.evaluate(()=>window.__notes),0);assert.equal(await road(page).getAttribute('data-road-done'),'3');await page.getByRole('link',{name:'Сохранить отметку ещё раз',exact:true}).click();}
    await page.waitForFunction(()=>document.querySelector('[data-task-check=translate]')?.getAttribute('aria-checked')==='true');
    await page.waitForFunction(()=>document.querySelector('[data-portal-road]')?.getAttribute('data-road-done')==='4');
    await page.waitForFunction(()=>window.__notes===3);
    assert.deepEqual(await page.evaluate(()=>window.__frequencies),[587.33,880,1174.66]);
    assert.equal(data.docs.translate,undefined,'A manual task mark does not manufacture a reviewed document');
    assert.equal(await page.locator('[data-stamp=translate]').getAttribute('data-stamped'),'true');
    assert.equal(await page.locator('[data-stamp-count]').innerText(),'1 / 5');
    const order=await page.locator('[data-focus-row]').evaluateAll(nodes=>nodes.map(el=>el.dataset.focusRow));
    assert.deepEqual(order,['translate','apostille','notary','cimea','checkDocs'],'Completed tasks precede current and future, preserving chronology within groups');
    const completed=page.locator('article[data-completed=true]').first();assert.match(await completed.innerText(),/Выполнено/);assert.doesNotMatch(await completed.innerText(),/31 янв/);assert.equal(await completed.locator('strong').evaluate(el=>getComputedStyle(el).color),'rgb(92, 96, 86)');
    assert.equal(calls.length,failTask?2:1);
    await page.locator('[data-task-ready=apostille]').press('Space');
    await page.waitForFunction(()=>document.querySelector('[data-portal-road]')?.getAttribute('data-road-done')==='5');
    assert.equal(data.docs.apostille,undefined);
    await page.reload({waitUntil:'networkidle'});assert.equal(await road(page).getAttribute('data-road-done'),'5');assert.equal(await page.locator('[data-portal-completion][data-visible=true]').count(),0);assert.equal(await page.evaluate(()=>window.__notes),0);
    await page.getByRole('link',{name:'Настройки',exact:true}).click();await page.getByLabel('Звук при выполнении шага').uncheck();
    await page.locator('[data-road-stage][aria-current="step"]').click();
    await page.locator('[data-task-check=notary]').click();await page.waitForFunction(()=>document.querySelector('[data-portal-road]')?.getAttribute('data-road-done')==='6');
    assert.equal(await page.evaluate(()=>window.__notes),0);
    results.push({failTask,savedOnly:true,fileOutcomeIndependent:true,keyboard:true,sound:true,reloadQuiet:true,mute:true});await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
  await writeFile(resolve(output,'report.json'),JSON.stringify({results},null,2));console.log(JSON.stringify({passed:results.length,output}));
}catch(error){if(activePage&&!activePage.isClosed())await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});throw error;}
finally{await browser.close();server.close();}
