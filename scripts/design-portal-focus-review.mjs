import { editorialContrastFindings } from './portal-editorial-contrast.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fixture, upstreamProgress } from './portal-review-fixtures.mjs';

// Editorial refinement preserves the existing modular layout and saved task contracts.
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
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch();
const results=[],errors=[],unexpected=[];let activePage;
const road=page=>page.locator('[data-portal-road]');

async function noOverflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No page-wide horizontal scrolling');}
async function axe(page,label){
  await page.addScriptTag({path:resolve(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
  assert.deepEqual(await editorialContrastFindings(page, violations),[],label+': axe');
}
async function open(viewport,mode='partial',options={}){
  const data=fixture(mode),calls=[],fileCalls=[];let failTask=Boolean(options.failTask);
  if(options.docsCurrent){data.client.name='Demo';data.client.profile={...data.client.profile,universityIds:['unipd','luiss']};data.done={profile:true,shortlist:true,chances:true};for(const row of data.roadmap.find(s=>s.id==='docs').tasks){row.deadline='2027-01-31';row.time='1–3 недели';}for(const row of data.roadmap.find(s=>s.id==='docs').tasks)row.t=({apostille:'Поставить апостиль на аттестат или диплом',translate:'Сделать официальный перевод на итальянский',notary:'Заверить перевод у нотариуса',checkDocs:'Проверить комплект документов'})[row.id]||row.t;}
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
  for(const width of [1440,1024,390,320]) {
    const {page,context,calls}=await open({width,height:900},'screenshot-parent',{docsCurrent:true});
    assert.equal(await page.locator('[data-portal-welcome] h1').innerText(),'Привет, Demo!');
    assert.match(await page.locator('[data-saved-universities]').innerText(),/Università di Padova/);
    assert.match(await page.locator('[data-saved-universities]').innerText(),/LUISS Guido Carli/);
    assert.equal(await page.locator('[data-road-count]').innerText(),'3 из 26 шагов');
    assert.equal(await page.locator('[data-road-stage]').count(),6);
    assert.equal(await page.locator('[data-task-check]').count(),5);
    assert.equal(await page.locator('[data-task-check]:disabled').count(),0);
    const editorial=await page.evaluate(()=>{
      const style=q=>getComputedStyle(document.querySelector(q));
      const task=style('[data-focus-task=apostille]');
      return {greeting:style('[data-portal-welcome] h1').fontFamily,title:style('[data-focus-task=apostille] strong').fontFamily,
        paper:style('[data-portal-editorial]').backgroundColor,noise:style('[data-portal-grain]').opacity,noisePointer:style('[data-portal-grain]').pointerEvents,
        left:task.borderLeftWidth,leftColor:task.borderLeftColor,radius:task.borderRadius,background:task.backgroundColor};
    });
    assert.match(editorial.greeting,/Spectral/);assert.match(editorial.title,/Spectral/);
    assert.equal(editorial.paper,'rgb(246, 243, 236)');assert.equal(editorial.noise,'0.035');assert.equal(editorial.noisePointer,'none');
    assert.equal(editorial.left,'4px');assert.equal(editorial.leftColor,'rgb(200, 75, 49)');assert.equal(editorial.radius,'12px');assert.equal(editorial.background,'rgb(250, 248, 243)');
    assert.equal(await page.locator('[data-portal-grain] feTurbulence').getAttribute('baseFrequency'),'0.75');
    assert.match(await page.locator('[data-focus-task=apostille] [data-portal-rubric]').innerText(),/ШАГ 01 ИЗ 05 · ТЕКУЩИЙ ФОКУС/i);
    assert(await page.locator('[data-task-ready=apostille]').isVisible());
    assert.equal(await page.locator('header a.logo-link').getAttribute('href'),'/');
    const line=await page.locator('[data-road-stage=start]').evaluate(el=>{const css=getComputedStyle(el,'::after');return [css.borderTopStyle,css.borderTopWidth,css.borderTopColor]});
    assert.deepEqual(line,['solid','2px','rgb(27, 94, 85)']);
    const future=await page.locator('[data-road-stage=docs]').evaluate(el=>{const css=getComputedStyle(el,'::after');return [css.borderTopStyle,css.borderTopColor]});
    assert.deepEqual(future,['dashed','rgb(213, 207, 196)']);

    const surface=await page.locator('[data-portal-focus]').evaluate(el=>getComputedStyle(el).backgroundColor);
    assert.equal(surface,'rgba(0, 0, 0, 0)','The complete page is not enclosed in a white card');
    const route=await page.locator('[data-route-card]').boundingBox(),work=await page.locator('[data-portal-overview]').boundingBox();
    assert(Math.abs(work.y-route.y-route.height-20)<1,'The two white cards are separated by 20px');
    const header=await page.locator('[data-portal-welcome]').boundingBox();assert(header.y+header.height<=route.y+1);
    const copy=await page.locator('[data-focus-row=apostille]').boundingBox(),cta=await page.locator('[data-road-open]').boundingBox();
    if(width>700){assert(cta.x>=copy.x+copy.width,'Main action is opposite the left text');assert(cta.y>=copy.y&&cta.y<copy.y+copy.height);}
    assert.equal(await page.locator('[data-task-check=apostille] svg').evaluate(el=>el.getBoundingClientRect().width),28);
    assert.equal(await page.locator('[data-task-check=translate] svg').evaluate(el=>el.getBoundingClientRect().width),22);
    if(width>=1024)assert.equal(Math.round((await page.locator('[data-focus-row=translate]').boundingBox()).height),62);
    assert.doesNotMatch(await page.locator('[data-portal-focus]').innerText(),/Главный фокус сейчас|Что сделать:|Нужно уточнить|Ориентир подготовки|Пройденные этапы|Все документы|Правила поступления/);
    assert.equal(await page.locator('[data-vespi-scene=welcome]').count(),1);
    await noOverflow(page);await axe(page,`Modular ${width}`);
    await page.screenshot({path:resolve(output,`overview-${width}.png`),fullPage:true,animations:'disabled'});
    await page.locator('[data-focus-row=translate] summary').click();assert(await page.locator('[data-portal-task=translate]').isVisible());
    await page.locator('[data-portal-task=translate]').click();await page.locator('[data-step-detail=translate]').waitFor();
    await page.getByRole('link',{name:'Назад',exact:true}).click();await page.locator('[data-portal-focus]').waitFor();
    await page.locator('[data-portal-assistant]').click();await page.locator('[data-portal-chat=true]').waitFor();await page.waitForTimeout(400);
    assert.equal(await page.locator('[data-vespi-scene=welcome]').isVisible(),false,'Overview mascot retires behind the route');
    assert.equal(await page.locator('[data-vespi-scene=chat]').count(),1);
    assert.equal(await page.locator('[data-vespi-scene=welcome]').evaluate(el=>getComputedStyle(el).transform),'matrix(1, 0, 0, 1, 0, 20)');
    const panel=await page.locator('[data-portal-chat=true]').boundingBox();
    if(width<=1100)assert.equal(Math.round(panel.width),width);else{const main=await page.locator('[data-portal-design]').boundingBox();assert(main.x+main.width<=panel.x);}
    await page.screenshot({path:resolve(output,`chat-${width}.png`),animations:'disabled'});
    await axe(page,`Chat ${width}`);
    await page.getByRole('button',{name:'Закрыть чат',exact:true}).click();await page.locator('[data-portal-chat=true]').waitFor({state:'detached'});
    if(width===1440){
      for(const part of ['svg','span']){
        await page.locator('header a.logo-link').locator(part).first().click();await page.waitForURL(origin+'/');
        await page.goBack({waitUntil:'networkidle'});await page.locator('[data-portal-focus]').waitFor();
        assert.equal(await page.locator('[data-road-count]').innerText(),'3 из 26 шагов');
      }
    }
    assert.equal(calls.length,0);results.push({width,modular:true,checkboxes:5,rightAction:true,singleVisibleMascot:true,editorial:true,axeOtherRules:true,knownRubricContrastException:true});await context.close();
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
