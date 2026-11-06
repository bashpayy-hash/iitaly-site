import { portalDestination, portalRoadState, portalStage } from './portal-review-navigation.mjs';
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
    assert.equal(await page.locator('[data-road-count]').innerText(),'Сделано 0 из 2 шагов');
    assert.equal(await page.locator('[data-road-locked]').count(),5);
    assert.equal(await page.locator('[data-road-locked] a,[data-road-locked] button').count(),0,'Preview stages cannot change stored progress');
    assert.equal(await page.locator('[data-stamp-count]').count(),0,'Overview leaves detailed stamps on the stage page');
    assert.match(await page.locator('[data-portal-now] [data-step-short-explainer]').innerText(),/10 коротких вопросов/,'The line reflects the existing questionnaire');
    assert.equal(await page.locator('[data-portal-now] a,[data-portal-now] button').count(),1,'The «Now» block has exactly one action (owner, 5 Nov: «минимализм, поменьше кнопок»)');
    assert.equal(await page.locator('[data-stage-souvenir]').count(),0,'Stage headers contain no decorative souvenir');
    assert.equal(await page.locator('[data-portal-focus]').evaluate(el=>[...el.querySelectorAll('*')].filter(node=>getComputedStyle(node).backgroundImage.includes('gradient')).length),0);
    // Inter Tight comes from next/font in layout.tsx (the family keeps its name here;
    // older Next versions hashed it), not from a second self-hosted copy in /zhol/fonts.
    const cabinetFace=await page.locator('[data-portal-welcome] h1').evaluate(el=>getComputedStyle(el).fontFamily);
    assert.match(cabinetFace,/Inter[ _]Tight/);
    // Only the first family: next/font's size-adjusted fallback is a local() face that the review Linux lacks.
    const cabinetFamily=cabinetFace.split(',')[0].trim();
    await page.evaluate(face=>document.fonts.load('500 16px '+face,'Привет, Қазақстан!'),cabinetFamily);
    assert.equal(await page.evaluate(face=>document.fonts.check('500 16px '+face,'Привет, Қазақстан!'),cabinetFamily),true);
    assert(await page.evaluate(()=>[...document.fonts].some(font=>/Inter[ _]Tight/.test(font.family)&&font.status==='loaded')),'Inter Tight is loaded through next/font');
    assert.equal(await page.evaluate(()=>[...document.styleSheets].some(sheet=>{try{return [...sheet.cssRules].some(rule=>rule.type===CSSRule.FONT_FACE_RULE&&/zhol\/fonts/.test(rule.style.getPropertyValue('src')));}catch{return false;}})),false,'No second self-hosted Inter Tight (/zhol/fonts) remains');
    const hit=await page.locator('[data-now-open]').boundingBox();assert(hit.width>=44&&hit.height>=44);
    assert.equal(await page.locator('[data-task-check]').count(),0,'The overview marks nothing: completion lives on the step and stage pages');
    await noOverflow(page);await axe(page,`New local profile ${width}`);
    await page.screenshot({path:resolve(output,`guest-${width}.png`),fullPage:true,animations:'disabled'});
    assert.equal((await page.locator('[data-now-open]').innerText()).replace(/\s+/g,' '),'Ответить на вопросы');
    await page.locator('[data-now-open]').click();await page.locator('[data-plan-wizard]').waitFor();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')||'{}').complete===true),false,'Completion opens the real questionnaire rather than faking saved answers');
    results.push({width,guest:true,lockedStages:5,realQuestionnaire:true});await context.close();
  }
  for(const width of [1440,1024,768,390,320]) {
    const {page,context,calls}=await open({width,height:900},'screenshot-parent',{docsCurrent:true,translationCurrent:true});
    assert.equal(await page.locator('[data-portal-welcome] h1').innerText(),'Привет, Demo!');
    assert.match(await page.locator('[data-saved-universities]').innerText(),/Università di Padova/);
    assert.match(await page.locator('[data-saved-universities]').innerText(),/LUISS Guido Carli/);
    assert.equal(await page.locator('[data-road-count]').innerText(),'Сделано 4 из 26 шагов · заранее 2');
    assert.equal(await road(page).getAttribute('data-road-ahead'),'2');
    assert.equal(await page.locator('[data-portal-welcome] a,[data-portal-welcome] button').count(),0,'Greeting metadata is plain text');
    assert.equal(await page.locator('[data-portal-hero] [data-vespi-scene], [data-portal-cabin]').count(),0,'No mascot figure on the hero landscape (owner, 3 Nov: «смотрится топорно»)');
    assert.equal(await page.locator('[data-porthole],[data-flight-manifest],[data-flight-plane]').count(),0,'No porthole, manifest or aircraft (owner, 3 Nov: no aviation theme)');
    assert.equal(await page.locator('[data-portal-hero] [data-portal-landscape]').count(),1,'The hero stands on an Italian landscape');
    assert.match(await page.locator('[data-now-deadline]').innerText(),/Лучше успеть до .*осталось 98 дней/);
    assert.match(await page.locator('[data-now-deadline]').innerText(),/Займёт ~3–7 дней/);
    assert.equal(await page.locator('[data-now-deadline] img,[data-now-deadline] svg').count(),0,'Facts are words, no emoji-like icons (owner, 6 Nov)');
    assert.equal(await page.locator('[data-now-ahead],[data-step-tile],[data-road-board],[data-stage-lineup],[data-flight-stop]').count(),0,'No dark board, duplicate step tile, lineup or flight line (owner, 5 Nov)');
    assert.equal(await page.locator('[data-road-stage]').count(),6);
    assert.equal(await page.locator('[data-task-check]').count(),0,'Overview shows the next task once, without a second completion control');
    assert.equal(await page.locator('[data-portal-now] a,[data-portal-now] button').count(),1,'One action in «Now»');
    assert.match(await page.locator('[data-portal-now] [data-road-step-title]').innerText(),/перевод/i,'«Now» names the current step');
    const editorial=await page.evaluate(()=>{
      const style=q=>getComputedStyle(document.querySelector(q));
      const tile=style('[data-portal-road]');
      return {greeting:style('[data-portal-welcome] h1').fontFamily,title:style('[data-portal-now] [data-road-step-title]').fontFamily,
        greetingWeight:style('[data-portal-welcome] h1').fontWeight,count:style('[data-road-count]>strong').fontFamily,countWeight:style('[data-road-count]>strong').fontWeight,
        paper:style('[data-portal-editorial]').backgroundColor,grain:style('[data-portal-editorial]').backgroundImage,grainBlend:style('[data-portal-editorial]').backgroundBlendMode,
        tileRadius:tile.borderRadius,tileBackground:tile.backgroundColor,featureRadius:style('[data-cabinet-features] a').borderRadius};
    });
    assert.match(editorial.greeting,/Inter[ _]Tight/);assert.equal(editorial.count,editorial.title);assert.match(editorial.title,/Inter[ _]Tight/);
    assert.equal(editorial.greetingWeight,'600');assert.equal(editorial.countWeight,'600');
    assert.equal(await page.locator('[data-road-stage] strong').evaluateAll(nodes=>nodes.every(el=>getComputedStyle(el).fontWeight==='600')),true);
    assert.equal(await page.locator('[data-road-fill],[data-road-scooter]').count(),0,'Only the single route rule remains');
    assert.equal(await page.getByRole('progressbar',{name:'Выполненные шаги маршрута'}).count(),1);
    assert.equal(await page.locator('[data-portal-overview] [data-higgsfield-visual],[data-portal-overview] [data-micro-steps],[data-portal-rubric]').count(),0,'Preview contains no illustration, microsteps or rubric');
    if(width>1100)assert.equal(await page.getByRole('navigation',{name:'Основная навигация',exact:true}).getByRole('link').count(),3);
    else { await page.getByLabel('Открыть меню',{exact:true}).click();assert(await page.getByRole('navigation',{name:'Мобильная навигация'}).getByRole('link',{name:'Гайды и виза'}).isVisible());await page.getByLabel('Открыть меню',{exact:true}).press('Escape'); }
    assert.equal(editorial.paper,'rgb(247, 244, 234)');
    // Owner 2026-10-25: visible 6% grain as a background layer, not a fixed full-screen filter (repaints on scroll on cheap Androids).
    assert.match(editorial.grain,/^url\("data:image\/svg\+xml.*feTurbulence.*opacity='0\.06'/);assert.match(editorial.grainBlend,/^multiply/);
    // Owner, 5 Nov: «Весь путь» and «Ещё в кабинете» are light 28px tiles like the hero.
    assert.equal(editorial.tileRadius,width>640?'28px':'24px','The path tile shares the cabinet tile radius');assert.equal(editorial.tileBackground,'rgb(255, 253, 249)');
    assert.equal(editorial.featureRadius,width>640?'28px':'24px','Feature tiles share the cabinet tile radius');
    assert.equal(await page.locator('[data-portal-grain]').count(),0,'No fixed full-screen grain overlay');
    assert.equal(await page.locator('header a.logo-link').getAttribute('href'),'/');
    const fill=await road(page).evaluate(el=>Number(el.style.getPropertyValue('--route-fill')));
    assert(Math.abs(fill-4/26)<0.0001,'Visible rail excludes the two tasks completed ahead');
    assert.equal(await page.locator('[data-road-stage=arrival]').getAttribute('data-road-stage-state'),'future');
    assert.equal(await page.locator('[data-road-stage=arrival] [data-stage-ahead]').innerText(),'заранее');
    assert.equal(await page.locator('[data-focus-row=notary]').count(),0,'Future tasks live on their stage page');
    // Owner 5 Nov («минимализм Apple, один поток»): every stage is one row of
    // «Весь путь» — object, name, one plain line, status in words and its count;
    // the whole row is one link, rows stack in one column and nothing spills.
    const rows=await page.locator('[data-portal-road] [data-road-stage]').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,height:r.height,right:r.right,bottom:r.bottom,controls:el.querySelectorAll('a,button').length};}));
    assert(rows.every((row,index)=>index===0||row.y>=rows[index-1].bottom-1),'Stage rows stack in one column');
    assert(rows.every(row=>row.height>=56&&row.controls===0),'Each row is one roomy link with nothing clickable inside');
    assert.equal(await page.locator('[data-portal-road] [data-road-stage]').evaluateAll(nodes=>nodes.filter(el=>{const r=el.closest('li').getBoundingClientRect();return [...el.querySelectorAll('strong,span,img')].some(n=>{const b=n.getBoundingClientRect();return b.width&&(b.left<r.left-1||b.right>r.right+1);});}).length),0,'Nothing in a row spills past its edge');
    assert.deepEqual(await page.locator('[data-road-stage] [data-state]').evaluateAll(nodes=>nodes.map(n=>n.querySelector('span').innerText.trim())),['Готово','Сейчас','Дальше','Дальше','Дальше','Начат заранее'],'Status words, sentence case');
    assert.doesNotMatch(await road(page).innerText(),/Этап\s*0\d|\b0[1-9]\b|ЭТАП/,'No stage codes like «01»');
    // Owner, 6 Nov: «проверка документов должна выйти на первые планы… главная
    // фишка наряду с уведомлениями». Two tiles right under «Сейчас»: documents
    // first, reminders second, each a Vespi scene, a status and one action.
    assert.deepEqual(await page.locator('[data-cabinet-features] a').evaluateAll(links=>links.map(a=>a.dataset.feature)),['documents','reminders'],'Documents, then reminders');
    assert.deepEqual(await page.locator('[data-cabinet-features] [data-stage-scene]').evaluateAll(nodes=>nodes.map(n=>n.dataset.stageScene)),['stamp','alarm'],'Each feature has its own Vespi scene (owner, 6 Nov: reminders on a different background than the documents desk)');
    assert.equal(await page.locator('[data-cabinet-features] [data-feature-action]').count(),2,'One action per feature');
    assert.match(await page.locator('[data-feature=documents] [data-feature-action]').innerText(),/^Проверить документ$/);
    assert.match(await page.locator('[data-feature=documents]').innerText(),/Проверено \d+ из \d+/);
    assert.match(await page.locator('[data-feature=reminders]').innerText(),/Напоминания о сроках/);
    assert.equal(await page.locator('[data-cabinet-more]').count(),0,'No separate «Ещё в кабинете» list');
    // Owner, 6 Nov (phone screenshot «Доку/мент/ы»): text never squeezes into a sliver.
    assert.deepEqual(await page.locator('[data-cabinet-features] a').evaluateAll(links=>links.filter(a=>{const text=a.querySelector('strong').parentElement.getBoundingClientRect().width,row=a.getBoundingClientRect().width;return text<row*.7;}).map(a=>a.dataset.feature)),[],'Feature text spans its tile');
    assert.deepEqual(await page.locator('[data-cabinet-features] strong').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().height>parseFloat(getComputedStyle(n).lineHeight)*1.6).map(n=>n.innerText)),[],'Feature titles stay on one line');
    assert(await page.getByRole('region',{name:'Весь путь до учёбы в Италии'}).isVisible());
    assert.equal(await page.locator('[data-road-stage=docs]').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)','Current stage has no separate box');


    const surface=await page.locator('[data-portal-focus]').evaluate(el=>getComputedStyle(el).backgroundColor);
    assert.equal(surface,'rgba(0, 0, 0, 0)','The complete page is not enclosed in a white card');
    // Hero tile: greeting as the label, the next step as the headline, one
    // plain line, facts as words, one button — all on a solid paper panel.
    // Owner, 6 Nov: «иллюстрация должна быть на фоне, и Веспи должен реально
    // ехать»: the landscape (a loop where Vespi rides along the road) is the
    // background of the whole tile; on phones it sits on top and the panel
    // overlaps it like a sheet. No white haze or gradient over the photo.
    // Then the two feature tiles, then «Весь путь», 12px apart.
    const route=await road(page).boundingBox(),features=await page.locator('[data-cabinet-features]').boundingBox();
    const hero=await page.locator('[data-portal-hero]').boundingBox(),header=await page.locator('[data-portal-welcome]').boundingBox();
    const now=await page.locator('[data-portal-now]').boundingBox(),heroPanel=await page.locator('[data-portal-hero-panel]').boundingBox();
    assert(header.y>=hero.y&&header.y+header.height<=now.y+1,'The greeting labels the hero above the step');
    assert(now.y>=heroPanel.y-1&&now.y+now.height<=heroPanel.y+heroPanel.height+1,'The step and its button stand on the panel');
    assert(hero.y+hero.height<=features.y+1&&features.y-(hero.y+hero.height)<=13,'Hero tile, then the features 12px below');
    assert(features.y+features.height<=route.y+1&&route.y-(features.y+features.height)<=13,'Then «Весь путь» 12px below');
    const panelStyle=await page.locator('[data-portal-hero-panel]').evaluate(el=>{const s=getComputedStyle(el);return {bg:s.backgroundColor,image:s.backgroundImage};});
    assert.deepEqual(panelStyle,{bg:'rgb(255, 253, 249)',image:'none'},'Solid paper panel, no haze');
    const landscape=await page.locator('[data-portal-landscape]').boundingBox(),scene=await page.locator('[data-portal-hero-scene]').boundingBox();
    if(width>640){
      assert(scene.y<=hero.y+1&&scene.y+scene.height>=hero.y+hero.height-1&&scene.x<=hero.x+1&&scene.x+scene.width>=hero.x+hero.width-1,'The landscape is the background of the whole tile');
      assert(hero.y+hero.height-(heroPanel.y+heroPanel.height)>=120,'The road under the panel stays in view');
    }else{
      assert(Math.abs(scene.y-hero.y)<=1&&scene.width>=hero.width-1&&scene.height>=hero.width*.7,'On a phone the landscape sits on top of the tile');
      assert(heroPanel.y<scene.y+scene.height&&heroPanel.y>=scene.y+scene.height-40,'The panel overlaps the landscape like a sheet');
    }
    assert(landscape.y<=scene.y+2&&landscape.y+landscape.height>=scene.y+scene.height-2&&landscape.x<=scene.x+2&&landscape.x+landscape.width>=scene.x+scene.width-2,'The landscape fills its scene');
    assert.match(await page.locator('[data-portal-hero-scene]').evaluate(el=>getComputedStyle(el).overflow),/^(hidden|clip)$/,'The scene clips its landscape');
    assert.match(await page.locator('[data-portal-hero]').evaluate(el=>getComputedStyle(el).overflow),/^(hidden|clip)$/,'The hero tile clips its landscape');
    assert.equal(await page.locator('[data-living-landscape=tuscany-ride]').count(),1,'Vespi rides through the hero (a loop)');
    assert.equal(await page.locator('[data-portal-landscape]').evaluate(img=>img.complete&&img.naturalWidth>0),true,'The landscape loads');
    assert.equal(await page.locator('[data-portal-hero]').evaluate(el=>getComputedStyle(el).borderRadius),width>640?'28px':'24px');
    assert.equal(await page.locator('[data-now-open]').count(),1,'The hero leads to the step breakdown');
    assert.doesNotMatch(await page.locator('[data-portal-focus]').innerText(),/Главный фокус сейчас|Что сделать:|Нужно уточнить|Ориентир подготовки|Пройденные этапы|Все документы|Правила поступления/);
    assert.equal(await page.locator('[data-vespi-scene=welcome]').count(),0,'No welcome figure on the overview (owner, 3 Nov)');
    await noOverflow(page);await page.screenshot({path:resolve(output,`overview-${width}.png`),fullPage:true,animations:'disabled'});await axe(page,`Modular ${width}`);
    await page.locator('[data-road-stage][aria-current=step]').click();
    assert.equal(await page.locator('[data-portal-page=stage]').count(),1);
    assert.equal(await page.locator('[data-task-check]').count(),1);
    // The current step's card on its stage page: one plain line, facts as words, one button and a quiet «Уже сделано».
    const work=await page.locator('[data-portal-overview]').boundingBox();
    const card=await page.locator('[data-focus-task=translate]').boundingBox(),copy=await page.locator('[data-focus-row=translate] h3').boundingBox();
    const ready=await page.locator('[data-task-ready=translate]').boundingBox(),openButton=await page.locator('[data-portal-task=translate]').boundingBox();
    assert(ready.height>=44&&openButton.height>=44,'Actions keep 44px hit targets');
    if(width>600){assert(card.height<=420,`Step card height ${card.height} at ${width}px`);assert(openButton.y>=copy.y+copy.height,'The button follows the step text');}
    else {assert(Math.abs(openButton.width-card.width)<2,'Mobile primary action spans the card');assert(Math.abs(ready.width-openButton.width)<1);}
    assert.equal(await page.locator('[data-portal-task=translate]').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(184, 58, 39)');
    assert.equal(await page.locator('[data-task-ready=translate]').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)','Completion is a quiet text action');
    assert.equal(await page.locator('[data-task-check=translate] svg').evaluate(el=>el.getBoundingClientRect().width),26);
    assert.equal(await page.locator('[data-focus-task=translate] [data-step-short-explainer]').innerText(),'Получателю может понадобиться перевод документа и его приложений.');
    assert.equal(await page.locator('[data-focus-task=translate] [data-road-meta]>*').count(),2);assert.equal(await page.locator('[data-focus-task=translate] [data-road-meta] img,[data-focus-task=translate] [data-road-meta] svg').count(),0,'Date and duration are words (owner, 6 Nov: no emoji-like icons)');assert.equal(await page.locator('[data-task-ready=translate]').innerText(),'Уже сделано');assert.equal((await page.locator('[data-portal-task=translate]').innerText()).replace(/\s+/g,' '),'Как подготовить');
    assert.equal(await page.locator('[data-focus-task=translate] [data-road-meta]>*').evaluateAll(nodes=>nodes.every(el=>getComputedStyle(el).backgroundColor==='rgba(0, 0, 0, 0)')),true,'Dates and durations are text, not pills');
    assert.equal(await page.locator('[data-next-stage],[aria-label="Соседние этапы"]').count(),0,'Mid-stage pages link only to the neighbouring steps');
    assert.equal(await page.locator('[data-stage-switcher] [data-story-pill]').count(),5);
    await page.locator('[data-stage-switcher] [data-story-pill="2"]').click();
    assert.equal(await page.locator('[data-portal-now]').count(),0,'Stage pages focus on their own tasks');
    assert.equal(await page.locator('[data-focus-row=notary]').count(),1);
    await page.locator('[data-portal-task=notary]').click();await page.locator('[data-step-detail=notary]').waitFor();
    assert.equal(await page.locator('[data-step-detail=notary] [data-higgsfield-visual]').count(),0,'Notary instructions have no unrelated folder illustration');
    assert.equal(await page.locator('[data-micro-steps]').count(),0,'Brief does not repeat the full instruction');
    await page.getByRole('navigation',{name:'Разделы задачи'}).getByRole('link',{name:'Как выполнить',exact:true}).click();
    assert.equal(await page.locator('[data-instruction-point]').count(),1);
    assert.equal(await page.locator('#portal-instruction-heading').innerText(),'Уточни способ');
    await noOverflow(page);
    if(width===1440||width===390)await page.screenshot({path:resolve(output,`notary-${width}.png`),fullPage:true,animations:'disabled'});
    await page.getByRole('navigation',{name:'Путь по кабинету'}).getByRole('link',{name:'Документы',exact:true}).click();await page.locator('[data-portal-focus]').waitFor();
    assert.equal(await page.locator('[data-portal-overview] [data-expanded=true]').count(),1);assert(await page.locator('[data-portal-task=translate]').isVisible());
    await page.locator('[data-portal-task=translate]').click();await page.locator('[data-step-detail=translate]').waitFor();
    assert.match(await page.locator('#portal-step-heading').evaluate(el=>getComputedStyle(el).fontFamily),/Inter[ _]Tight/);
    assert.equal(await page.locator('[data-micro-steps]').count(),0);
    await page.getByRole('navigation',{name:'Разделы задачи'}).getByRole('link',{name:'Как выполнить',exact:true}).click();
    assert.equal(await page.locator('[data-instruction-point]').count(),1);
    assert.equal(await page.locator('#portal-instruction-heading').innerText(),'Собери оригиналы');
    await noOverflow(page);await page.screenshot({path:resolve(output,`task-${width}.png`),fullPage:true,animations:'disabled'});
    await page.getByRole('navigation',{name:'Путь по кабинету'}).getByRole('link',{name:'Мой план',exact:true}).click();await page.locator('[data-portal-focus]').waitFor();
    await page.locator('[data-portal-assistant]').click();await page.locator('[data-portal-chat=true]').waitFor();await page.waitForTimeout(400);
    assert.equal(await page.locator('[data-vespi-scene=chat]').count(),1,'Vespi lives in the chat');
    assert.equal(await page.locator('main [data-vespi-scene]').count(),0,'The overview itself carries no mascot figure');
    const panel=await page.locator('[data-portal-chat=true]').boundingBox();
    if(width<=1100)assert.equal(Math.round(panel.width),width);else{const main=await page.locator('[data-portal-design]').boundingBox();assert(main.x+main.width<=panel.x);}
    await page.screenshot({path:resolve(output,`chat-${width}.png`),animations:'disabled'});
    await axe(page,`Chat ${width}`);
    await page.getByRole('button',{name:'Закрыть чат',exact:true}).click();await page.locator('[data-portal-chat=true]').waitFor({state:'detached'});
    if(width===1440){
      for(const part of ['svg','span']){
        await page.locator('header a.logo-link').locator(part).first().click();await page.waitForURL(origin+'/');
        await page.goBack({waitUntil:'networkidle'});await page.locator('[data-portal-focus]').waitFor();
        assert.equal(await page.locator('[data-road-count]').innerText(),'Сделано 4 из 26 шагов · заранее 2');
      }
    }
    assert.equal(calls.length,0);results.push({width,compactHeight:card.height,checkboxes:5,instructionsOnlyInDetail:true,singleVisibleMascot:true,axeOtherRules:true,consistentFonts:true});await context.close();
  }
  for(const failTask of [false,true]) {
    const {page,context,calls,data}=await open({width:1440,height:900},'screenshot-parent',{docsCurrent:true,motion:true,failTask});
    await page.locator('[data-road-stage][aria-current=step]').click();
    await page.locator('[data-stage-switcher] [data-story-pill="1"]').click();
    await page.locator('[data-task-check=translate]').click();
    if(failTask){await page.locator('#portal-panel [role=alert]').waitFor();assert.equal(await page.locator('[data-task-check=translate]').getAttribute('aria-checked'),'false');assert.equal(await page.evaluate(()=>window.__notes),0);assert.equal((await portalRoadState(page)).done,'3');await page.getByRole('link',{name:'Сохранить отметку ещё раз',exact:true}).click();}
    assert.equal((await portalRoadState(page,'4')).done,'4');
    await portalStage(page,'docs');
    await page.locator('[data-stage-switcher] [data-story-pill="0"]').click();
    assert.equal(await page.locator('[data-task-check=translate]').getAttribute('aria-checked'),'true');
    await page.waitForFunction(()=>window.__notes===3);
    assert.deepEqual(await page.evaluate(()=>window.__frequencies),[587.33,880,1174.66]);
    assert.equal(data.docs.translate,undefined,'A manual task mark does not manufacture a reviewed document');
    assert.equal(await page.locator('[data-stamp=translate]').getAttribute('data-stamped'),'true');
    assert.equal(await page.locator('[data-stamp-count]').innerText(),'1 / 5');
    assert.equal(await page.locator('[data-focus-row]').count(),1,'Only the selected task is expanded');
    assert.match(await page.locator('[data-stage-switcher] [data-story-pill]').first().getAttribute('title'),/перевод/,'Completed task leads the stage navigation');
    const completed=page.locator('article[data-completed=true]').first();assert.match(await completed.innerText(),/Выполнено/);assert.doesNotMatch(await completed.innerText(),/31 янв/);assert.equal(await completed.locator('strong').evaluate(el=>getComputedStyle(el).color),'rgb(92, 96, 86)');
    assert.equal(calls.length,failTask?2:1);
    await page.locator('[data-stage-switcher] [data-story-pill="1"]').click();
    // A step change moves focus to its heading on the next frame; let that frame
    // pass so the keyboard press lands on the button, not between keydown and keyup.
    await page.locator('[data-task-ready=apostille]').waitFor();
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.locator('[data-task-ready=apostille]').press('Space');
    assert.equal((await portalRoadState(page,'5')).done,'5');
    await portalStage(page,'docs');
    await page.locator('[data-stage-switcher] [data-story-pill="0"]').click();
    assert.equal(await page.locator('[data-task-check=apostille]').getAttribute('aria-checked'),'true');
    assert.equal(data.docs.apostille,undefined);
    await page.reload({waitUntil:'networkidle'});assert.equal((await portalRoadState(page,'5')).done,'5');assert.equal(await page.locator('[data-portal-completion][data-visible=true]').count(),0);assert.equal(await page.evaluate(()=>window.__notes),0);
    await page.getByRole('link',{name:'Настройки',exact:true}).click();await page.getByLabel('Звук при выполнении шага').uncheck();
    await portalDestination(page,'План');
    await page.locator('[data-stage-switcher] [data-story-pill="2"]').click();
    await page.locator('[data-task-check=notary]').click();assert.equal((await portalRoadState(page,'6')).done,'6');
    assert.equal(data.done.notary,true);
    assert.equal(await page.evaluate(()=>window.__notes),0);
    results.push({failTask,savedOnly:true,fileOutcomeIndependent:true,keyboard:true,sound:true,reloadQuiet:true,mute:true});await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
  await writeFile(resolve(output,'report.json'),JSON.stringify({results},null,2));console.log(JSON.stringify({passed:results.length,output}));
}catch(error){if(activePage&&!activePage.isClosed())await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});throw error;}
finally{await browser.close();server.close();}
