import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fixture, upstreamProgress } from './portal-review-fixtures.mjs';

// User refinement: real counts and explicit stage states replace mascot-led progress.
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
  assert.deepEqual(violations,[],label+': axe');
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
  await page.addInitScript(() => {
    window.__notes = 0;
    const Native = window.AudioContext;
    if (Native) window.AudioContext = class extends Native { createOscillator() { window.__notes++; return super.createOscillator(); } };
  });
  await page.goto(origin+'/portal?auth=login',{waitUntil:'networkidle'});
  await page.getByLabel('Фамилия',{exact:true}).fill('Testov');await page.getByLabel('Код доступа',{exact:true}).fill('TEST-01');
  await page.getByRole('button',{name:'Войти в кабинет',exact:true}).click();
  await page.locator(mode==='onboarding'?'[data-portal-profile]':'[data-portal-overview]').waitFor({state:'attached'});
  await page.evaluate(()=>document.fonts.ready);return {page,context,data,calls,fileCalls};
}

try {
  for (const width of [1440, 390, 320]) {
    const {page,context,calls}=await open({width,height:900},'screenshot-parent');
    assert.equal(await page.locator('[data-portal-focus]').count(),1);
    assert.equal(await page.locator('aside,nav[aria-label="Разделы кабинета"]').count(),0,'No duplicate sidebar or bottom navigation');
    assert.equal(await page.locator('[data-portal-assistant] img').count(),0);
    assert.equal(await page.locator('[data-portal-assistant] [data-vespi-outline]').count(),1);
    assert.equal(await page.locator('[data-road-stage]').count(),6);
    assert.equal(await page.locator('[data-road-next]').count(),1);
    assert.equal(await page.locator('[data-portal-welcome] h1').innerText(),'Привет, Тестовый!');
    assert.equal(await page.locator('[data-road-count]').innerText(),'2 из 26 шагов');
    const blocks=await page.locator('[data-portal-welcome],[data-portal-road],[data-portal-overview]').evaluateAll(nodes=>nodes.map(n=>({y:n.getBoundingClientRect().y,b:n.getBoundingClientRect().bottom})));
    assert(blocks[0].b<=blocks[1].y+1 && blocks[1].b<=blocks[2].y+1,'Greeting, route and focus are one vertical flow');
    await page.screenshot({path:resolve(output,`overview-${width}.png`),fullPage:true,animations:'disabled'});
    await noOverflow(page);await axe(page,`Focus ${width}`);
    await page.locator('[data-road-stage="docs"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-portal-focus]')?.getAttribute('data-selected-stage')==='docs');
    assert.match(page.url(),/stage=docs/);
    assert.equal(await page.locator('[data-road-stage="docs"]').getAttribute('aria-current'),'step');
    assert.equal(await page.locator('[data-focus-complete]').count(),0,'Future document cannot be self-approved');
    assert.match(await page.locator('[data-road-next]').innerText(),/Сначала:/);
    await page.locator('[data-focus-row="translate"] > summary').click();
    assert(await page.locator('[data-focus-row="translate"] a').isVisible());
    await page.locator('[data-focus-row="translate"] a').click();
    await page.locator('[data-step-detail="translate"]').waitFor();
    assert.equal(await page.locator('[data-road-stage="docs"]').getAttribute('aria-current'),'step');
    await page.goBack();await page.locator('[data-portal-focus]').waitFor();
    await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-portal-focus]').getAttribute('data-selected-stage'),'docs');
    await page.locator('[data-portal-assistant]').click();
    await page.locator('[data-portal-chat="true"]').waitFor();
    assert.equal(await page.locator('[data-portal-chat="true"] [data-vespi-scene]').count(),1,'Detailed original Vespi is in the chat header');
    await page.waitForTimeout(350);
    const box=await page.locator('[data-portal-chat="true"]').boundingBox();
    if(width<=1100)assert.equal(Math.round(box.width),width,'Mobile drawer uses full screen');
    else {const main=await page.locator('[data-portal-design]').boundingBox();assert(main.x+main.width<=box.x,'Desktop content does not sit below the chat');}
    await page.screenshot({path:resolve(output,`chat-${width}.png`),animations:'disabled'});
    await page.getByRole('button',{name:'Закрыть чат',exact:true}).click();
    await page.locator('[data-portal-chat="true"]').waitFor({state:'detached'});
    await page.waitForFunction(()=>document.activeElement?.hasAttribute('data-portal-assistant')); 
    assert.equal(calls.length,0);
    results.push({width,stages:6,noSidebar:true,readOnlyFuture:true,deepLinks:true,chatResponsive:true,axe:true});await context.close();
  }
  for (const failTask of [false,true]) {
    const {page,context,calls}=await open({width:1440,height:900},'manual',{motion:true,failTask});
    assert.equal(await page.locator('[data-portal-completion][data-visible="true"]').count(),0);
    const before=Number(await road(page).getAttribute('data-road-done'));
    await page.locator('[data-focus-complete]').click();
    if(failTask){
      await page.locator('#portal-panel [role=alert]').waitFor();assert.match(await page.locator('#portal-panel [role=alert]').innerText(),/Синтетический сбой/);
      assert.equal(await page.locator('[data-portal-completion][data-visible="true"]').count(),0,'Failed save earns no positive acknowledgement');
      assert.equal(Number(await road(page).getAttribute('data-road-done')),before);
      assert.equal(await page.evaluate(()=>window.__notes),0,'No sound on error');
      await page.getByRole('link',{name:'Сохранить отметку ещё раз',exact:true}).click();
    }
    await page.locator('[data-portal-completion="manual-task"][data-visible="true"]').waitFor();
    assert.equal(Number(await road(page).getAttribute('data-road-done')),before+1);
    await page.waitForFunction(()=>window.__notes===6);
    await page.waitForFunction(()=>document.querySelector('[data-focus-task]')?.getAttribute('data-focus-task')!=='manual-task');
    assert.equal(calls.length,failTask?2:1);
    assert.equal(await page.locator('[data-focus-row="manual-task"]').getAttribute('open'),null);
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-portal-completion][data-visible="true"]').count(),0,'Restoring saved data produces no celebration');
    await page.getByRole('link',{name:'Настройки',exact:true}).click();
    await page.getByLabel('Звук при выполнении шага').uncheck();
    await page.reload({waitUntil:'networkidle'});assert.equal(await page.getByLabel('Звук при выполнении шага').isChecked(),false);
    await page.locator('[data-road-stage="start"]').click();
    await page.locator('[data-focus-complete]').click();
    await page.locator('[data-portal-completion][data-visible="true"]').waitFor();
    assert.equal(await page.evaluate(()=>window.__notes),0,'Muted completion still updates visually');
    results.push({failTask,confirmedOnly:true,chord:true,nextTask:true,reloadQuiet:true,mutePersists:true});await context.close();
  }
  for(const mode of ['empty','complete','blocked','late-current','parent-file']){
    const {page,context,fileCalls}=await open({width:390,height:844},mode);
    await noOverflow(page);
    if(['empty','complete'].includes(mode))assert.equal(await page.locator('[data-road-open]').count(),0);
    if(mode==='parent-file'){
      assert.equal(await page.locator('[data-focus-complete]').count(),0);
      await page.locator('[data-road-open]').click();await page.locator('[data-portal-upload-zone]').waitFor();
      const transfer=await page.evaluateHandle(()=>{const d=new DataTransfer();d.items.add(new File(['SYNTHETIC DOCUMENT ONLY. NO PERSONAL DATA. SAMPLE FOR UI VERIFICATION.'],'synthetic-review.txt',{type:'text/plain'}));return d;});
      await page.locator('[data-portal-upload-zone]').dispatchEvent('drop',{dataTransfer:transfer});
      assert.deepEqual(fileCalls,[]);
      await page.getByRole('button',{name:'Проверить документ',exact:true}).click();
      await page.locator('[data-portal-completion="familyDocs"][data-visible="true"]').waitFor();
      assert.deepEqual(fileCalls,['check','save']);
      assert.equal(await page.locator('[data-road-count]').innerText(),'1 из 2 шагов');
      assert.equal(await page.locator('[data-portal-completion] svg path').evaluate(n=>getComputedStyle(n).animationName),'none','Reduced motion draws the completed check without animation');
    }
    results.push({mode,overflow:false});await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
  await writeFile(resolve(output,'report.json'),JSON.stringify({results},null,2));
  console.log(JSON.stringify({passed:results.length,output}));
}catch(error){if(activePage&&!activePage.isClosed())await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});throw error;}
finally{await browser.close();server.close();}
