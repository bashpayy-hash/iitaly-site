import { portalDestination } from './portal-review-navigation.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fixture, upstreamProgress } from './portal-review-fixtures.mjs';

// All account/document data is synthetic. No real API, AI or paid request.
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.REVIEW_TOOLS,'playwright'));
const sharp=require('sharp'),root=resolve('out'),output=resolve('design-review/handmade');
await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  try {const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(path!==root&&!path.startsWith(root+sep))return res.writeHead(403).end();
    for(const file of [path,path+'.html',resolve(path,'index.html')])if(await stat(file).then(s=>s.isFile()).catch(()=>false)){
      res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});return res.end(await readFile(file));
    }res.writeHead(404).end();
  }catch{res.writeHead(500).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch(),results=[],errors=[];
const scene=(page,pose)=>page.locator(`[data-vespi-scene=${pose}]`);
const capture=async(page,name)=>sharp(await page.screenshot({animations:'disabled'})).webp({quality:85}).toFile(resolve(output,name+'.webp'));
const summary=page=>page.locator('[data-portal-road]').evaluate(el=>({done:el.dataset.roadDone,ahead:el.dataset.roadAhead,total:el.querySelector('[role=progressbar]')?.getAttribute('aria-valuemax'),value:el.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow')}));
async function decoded(page,pose){const img=scene(page,pose).locator('img').first();await img.evaluate(e=>e.decode());assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0));}
async function layout(page,label){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,label+': no horizontal overflow');
  const visible=await page.locator('[data-vespi-scene]').evaluateAll(nodes=>nodes.filter(e=>{
    const r=e.getBoundingClientRect();return e.checkVisibility({checkVisibilityCSS:true,checkOpacity:true})&&r.bottom>0&&r.top<innerHeight;
  }).map(e=>e.dataset.vespiScene));
  assert(visible.length<=1,label+': at most one spatial scene in viewport: '+visible);
}
try {
  const manifest=JSON.parse(await readFile('design/mascot/vespi/handmade-v1.json','utf8'));
  assert.equal(manifest.production.length,18);
  assert(manifest.production.reduce((n,a)=>n+a.bytes,0)<600*1024,'Entire responsive series remains below 600 KiB');
  for(const asset of manifest.production){
    const bytes=await readFile(asset.file),meta=await sharp(bytes).metadata();
    assert.equal(bytes.length,asset.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
    assert(meta.hasAlpha,'Transparent cutout: '+asset.file);assert(meta.width<=640);
    assert.deepEqual(Buffer.from(await (await fetch(origin+asset.file.slice(6))).arrayBuffer()),bytes,'Export serves current asset');
  }
  for(const width of [1440,390,320]){
    const data=fixture('screenshot-parent'),calls=[];
    data.client.name='Айдана';data.done={profile:true,shortlist:true,chances:true};
    data.docs.apostille={verdict:'warn',fileName:'synthetic-attestat.pdf',result:{verdict:'warn',summary:'Видимых ошибок не найдено. Нужно уточнить требования заявки.',checks:[],problems:[],nextSteps:['Уточни требования выбранного вуза и повтори проверку.']}};
    const before=JSON.stringify(data),context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',locale:'ru-RU'});
    await context.route('**/*',async route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.pathname==='/api/event'||url.pathname==='/health/ai')return route.fulfill({json:{ok:true}});
      if(url.pathname==='/api/portal/lookup')return route.fulfill({json:{...data,progress:upstreamProgress(data)}});
      if(url.pathname.startsWith('/api/'))calls.push(url.pathname);
      return url.origin===origin&&!url.pathname.startsWith('/api/')?route.continue():route.abort();
    });
    const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
    await page.clock.install();
    await page.goto(origin+'/portal?auth=login',{waitUntil:'networkidle'});
    await page.getByLabel('Фамилия',{exact:true}).fill('Testov');await page.getByLabel('Код доступа',{exact:true}).fill('TEST-01');
    await page.getByRole('button',{name:'Войти в кабинет',exact:true}).click();
    await scene(page,'welcome').waitFor();await decoded(page,'welcome');await page.evaluate(()=>document.fonts.ready);
    const progress=await summary(page);await layout(page,'overview '+width);
    await page.clock.fastForward(45_100);
    await page.waitForFunction(()=>Boolean(document.querySelector('[data-vespi-resting]')));
    const rest=scene(page,'welcome').locator('img').last();await rest.evaluate(e=>e.decode());
    assert.equal(await rest.evaluate(e=>getComputedStyle(e).opacity),'1');
    assert.equal(await rest.evaluate(e=>getComputedStyle(e).transitionProperty),'none','Reduced motion removes crossfade even when the global duration remains defined');
    assert.deepEqual(await summary(page),progress);assert.equal(JSON.stringify(data),before);assert.deepEqual(calls,[],'Rest sends no mutation or AI request');
    await capture(page,'rest-'+width);
    await page.keyboard.press('Shift');assert.equal(await page.locator('[data-vespi-resting]').count(),0,'Keyboard wakes Vespi');
    await page.clock.fastForward(45_100);await page.waitForFunction(()=>Boolean(document.querySelector('[data-vespi-resting]')));
    await page.locator('h1').dispatchEvent('pointerdown');assert.equal(await page.locator('[data-vespi-resting]').count(),0,'Pointer wakes Vespi');
    await portalDestination(page, 'План');await decoded(page,'welcome');await layout(page,'plan '+width);
    await portalDestination(page, 'Документы');await decoded(page,'documents');await layout(page,'documents '+width);
    await page.locator('[data-document=apostille]').click();const report=page.getByRole('region',{name:'Разбор документа'});await report.waitFor();
    assert.equal(await report.locator('[data-vespi-scene=checking]').count(),0,'Stored clarification is never portrayed as active checking');
    assert.equal(await scene(page,'clarify').isVisible(),width===1440,'Narrow report preserves room for the action');
    await layout(page,'report '+width);
    if(width===1440){
      await report.locator('[data-document-prepare]').click();await decoded(page,'documents');
      let finishCheck;const pending=new Promise(resolve=>finishCheck=resolve);
      await context.route('**/api/check-document',async route=>{calls.push('check');await pending;return route.fulfill({json:{ok:true,result:{verdict:'warn',summary:'Разбор выполнен. Требования заявки нужно уточнить.',checks:[],problems:[],nextSteps:[]}}});});
      await context.route('**/api/portal/TEST-01/doc',async route=>{calls.push('save');const body=route.request().postDataJSON();data.docs.apostille={verdict:body.result.verdict,result:body.result,fileName:body.fileName};return route.fulfill({json:{ok:true,docs:data.docs,done:data.done,progress:upstreamProgress(data)}});});
      const form=page.locator('[data-document-upload-form]');
      await form.locator('input[type=file]').setInputFiles({name:'synthetic.txt',mimeType:'text/plain',buffer:Buffer.from('SYNTHETIC REVIEW, NOT A REAL DOCUMENT')});
      assert.deepEqual(calls,[],'Choosing file does not start checking');
      await form.getByRole('button',{name:'Проверить документ',exact:true}).click();await scene(page,'checking').waitFor();
      assert(await form.locator('[data-document-operation=checking]').isVisible());await decoded(page,'checking');
      finishCheck();await scene(page,'saved').waitFor();assert.deepEqual(calls,['check','save']);
      assert.match(await report.innerText(),/Нужно уточнить/,'Acknowledging a saved report never changes its verdict');
      assert.deepEqual(await summary(page),progress,'Saving clarification leaves completion unchanged');
      await decoded(page,'saved');await layout(page,'saved '+width);
    }
    await context.close();results.push({width,restIsDecorative:true,noOverflow:true,contextualPoses:true});
  }
  // The existing home introduction and guide invitation attach to the edge.
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.pathname==='/api/event'||u.pathname==='/health/ai')return r.fulfill({json:{ok:true}});return u.origin===origin?r.continue():r.abort();});
    const page=await context.newPage();page.setDefaultTimeout(15000);
    await page.goto(origin,{waitUntil:'networkidle'});await page.locator('[data-vespi-editorial]').scrollIntoViewIfNeeded();await decoded(page,'peek');await layout(page,'home '+width);await capture(page,'home-peek-'+width);
    await page.goto(origin+'/guides#education',{waitUntil:'networkidle'});await page.locator('[data-guide-invite]').scrollIntoViewIfNeeded();await decoded(page,'peek');await layout(page,'guide '+width);await capture(page,'guide-peek-'+width);
    await context.close();
  }
  assert.deepEqual(errors,[]);await writeFile(resolve(output,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
}finally{await browser.close();server.close();}
