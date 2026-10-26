import { editorialContrastFindings } from './portal-editorial-contrast.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fixture, upstreamProgress } from './portal-review-fixtures.mjs';

// Targeted portal fixes: keep the existing design and verify the user's actual flow.
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.REVIEW_TOOLS,'playwright'));
const sharp=require('sharp');
const output=resolve(process.env.ROAD_DESIGN_REVIEW_OUTPUT||'design-review/portal-route-action');
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
async function capture(page,name){await sharp(await page.screenshot({animations:'disabled'})).webp({quality:82}).toFile(resolve(output,name+'.webp'));}
async function noOverflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No page-wide horizontal scrolling');}
async function axe(page,label){
  await page.addScriptTag({path:resolve(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
  assert.deepEqual(await editorialContrastFindings(page, violations),[],label+': axe');
}
async function open(viewport,mode='partial',options={}){
  const data=options.data || fixture(mode),calls=[],fileCalls=[];let failTask=Boolean(options.failTask);
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
    if(url.pathname==='/api/portal/TEST-01/profile') {
      const body=req.postDataJSON();assert.equal(body.surname,'Testov');
      if(options.failProfile)return route.abort();
      data.client.profile={...data.client.profile,...Object.fromEntries(Object.entries(body).filter(([key])=>key!=='surname'))};
      return json({...data,progress:upstreamProgress(data)});
    }
    if(url.pathname.startsWith('/api/'))unexpected.push(url.pathname);
    return url.origin===origin&&!url.pathname.startsWith('/api/')?route.continue():route.abort();
  });
  const page=await context.newPage();activePage=page;page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/portal?auth=login',{waitUntil:'networkidle'});
  await page.getByLabel('Фамилия',{exact:true}).fill('Testov');await page.getByLabel('Код доступа',{exact:true}).fill('TEST-01');
  await page.getByRole('button',{name:'Войти в кабинет',exact:true}).click();
  await page.locator(mode==='onboarding'?'[data-portal-profile]':'[data-portal-overview]').waitFor({state:'attached'});
  await page.evaluate(()=>document.fonts.ready);return {page,context,data,calls,fileCalls};
}
try {
  for (const width of [1440, 1101, 1024, 761, 760, 390, 320]) {
    const data=fixture('screenshot-parent');
    data.client.name='Demo';
    data.done={profile:true,shortlist:true,chances:true,apostille:true,translate:true,notary:true,kit:true,codice:true};
    Object.assign(data.roadmap.find(s=>s.id==='docs').tasks.find(t=>t.id==='cimea'),{deadline:'2027-02-15',time:'~30–60 дней',daysLeft:112});
    const {page,context,fileCalls}=await open({width,height:900},'partial',{data});
    assert.equal(await road(page).getAttribute('data-road-done'),'6');
    assert.equal(await road(page).getAttribute('data-road-total'),'26');
    assert.equal(await road(page).getAttribute('data-road-ahead'),'2');
    assert.equal(await page.locator('[data-route-stage-number]').innerText(),'02');
    assert.doesNotMatch(await road(page).innerText(),/Будущие этапы пока/);
    const design=await road(page).evaluate(el=>{
      const marker=el.querySelector('[data-route-stage-number]'), fill=el.querySelector('[data-route-fill]');
      const s=getComputedStyle(marker), line=getComputedStyle(fill.parentElement), card=getComputedStyle(el.closest('[data-route-card]'));
      return {size:s.fontSize,weight:s.fontWeight,accent:s.color,line:line.height,fill:getComputedStyle(fill).backgroundColor,background:card.backgroundColor,border:card.borderWidth,radius:card.borderRadius,shadow:card.boxShadow,ratio:Number(el.style.getPropertyValue('--route-fill'))};
    });
    assert.deepEqual({...design,ratio:0},{size:'40px',weight:'600',accent:'rgb(163, 52, 33)',line:'2px',fill:'rgb(184, 58, 39)',background:'rgba(0, 0, 0, 0)',border:'0px',radius:'0px',shadow:'none',ratio:0});
    assert(Math.abs(design.ratio-6/26)<.00001);
    assert.equal(await page.locator('[data-portal-now] strong').first().evaluate(el=>getComputedStyle(el).color),'rgb(242, 154, 137)');
    assert.equal(await road(page).locator('[class*=checkpoint]').count(),0);
    const nav=page.locator('[aria-label="Этапы маршрута"]');
    assert.equal(await nav.isVisible(),width>760);
    if(width>760){
      const links=await nav.locator('a').evaluateAll(nodes=>nodes.map(el=>({y:el.getBoundingClientRect().y,font:getComputedStyle(el).fontSize,current:el.getAttribute('aria-current'),rule:getComputedStyle(el).borderBottomColor})));
      assert.equal(links.length,6);assert(links.every(l=>l.font==='13px'));
      assert(Math.max(...links.map(l=>l.y))-Math.min(...links.map(l=>l.y))<1);
      assert.equal(links.find(l=>l.current)?.rule,'rgb(184, 58, 39)');
    }else assert.equal(await page.locator('[data-route-current-name]').innerText(),'Документы');
    await noOverflow(page);
    if([1440,390].includes(width)){await axe(page,'Route '+width);await capture(page,'route-'+width);}
    await page.locator('[data-portal-task=cimea]').click();
    await page.getByRole('navigation',{name:'Разделы задачи'}).getByRole('link',{name:'Проверка документа'}).click();
    const action=page.locator('[data-task-action-page]:visible');
    assert.equal(await action.locator('h2,h3,img,[data-portal-document-coach],details').count(),0,'Action has no repeated heading, illustration, coach or accordion');
    assert.equal(await action.locator('button:visible').count(),1);
    assert.equal(await action.locator('select').count(),2);
    await action.getByRole('combobox',{name:'Стипендиальная программа',exact:true}).selectOption('bocconi');
    await action.getByRole('combobox',{name:'Учебный год заявки',exact:true}).selectOption('2026/27');
    await action.getByRole('checkbox').check();
    const fields=await action.locator('select').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().top));
    assert(Math.abs(fields[0]-fields[1])<1,'Both fields share one row');
    const button=action.getByRole('button',{name:'Выбрать файл',exact:true}), box=await button.boundingBox(), area=await action.boundingBox();
    assert(box.width<area.width-20&&box.height>=44,'File control is content sized');
    assert.equal(await action.locator('[data-primary-action]:visible').count(),1);
    assert.equal(await page.locator('[data-portal-road]').count(),0,'No dashboard route on a task');
    await noOverflow(page);
    if([1440,390].includes(width)){await axe(page,'Action '+width);await capture(page,'action-'+width);}
    await action.locator('input[type=file]').setInputFiles({name:'fixture.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic test document. No personal data.')});
    await action.locator('[data-selected-document]').waitFor();assert.equal(fileCalls.length,0);
    await page.getByRole('navigation',{name:'Разделы задачи'}).getByRole('link',{name:'Как выполнить'}).click();
    assert.equal(await page.locator('[data-instruction-point]').count(),1,'One reading point per page');
    await page.getByText('Все пункты',{exact:true}).click();
    await page.getByRole('link',{name:'Проверь читаемость файла',exact:true}).click();
    assert.equal(await page.locator('[data-portal-step-guide] [data-portal-document-coach]').count(),1);
    await page.getByRole('navigation',{name:'Разделы задачи'}).getByRole('link',{name:'Проверка документа'}).click();
    assert.match(await action.locator('[data-selected-document]').innerText(),/fixture.txt/);
    assert.equal(await action.getByRole('combobox',{name:'Стипендиальная программа',exact:true}).inputValue(),'bocconi');
    assert.equal(await action.getByRole('checkbox').isChecked(),true);
    if(width===1440){
      await action.getByRole('button',{name:'Проверить документ',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('[data-portal-road]')?.dataset.roadDone==='7');
      assert.deepEqual(fileCalls,['check','save']);
      assert.equal(await road(page).getAttribute('data-road-ahead'),'2');
    }
    results.push({width,orderedProgress:true,flatRoute:true,compactAction:true,fileAndContextPreserved:true});
    await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
} catch(error){errors.push(error.stack||String(error));if(activePage&&!activePage.isClosed())await capture(activePage,'failure').catch(()=>{});throw error;}
finally{await browser.close();await new Promise(done=>server.close(done));await writeFile(resolve(output,'report.json'),JSON.stringify({results,errors,unexpected},null,2));}
console.log(JSON.stringify(results,null,2));
