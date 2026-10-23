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
const output=resolve(process.env.ROAD_DESIGN_REVIEW_OUTPUT||'design-review/portal-targeted');
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
const nav=page=>page.locator('nav[aria-label="Разделы личного кабинета"],nav[aria-label="Разделы кабинета"]').filter({visible:true});
async function go(page,name){await nav(page).getByRole('link',{name,exact:true}).click();}
async function capture(page,name){await sharp(await page.screenshot({animations:'disabled'})).webp({quality:82}).toFile(resolve(output,name+'.webp'));}
async function noOverflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No page-wide horizontal scrolling');}
async function axe(page,label){
  await page.addScriptTag({path:resolve(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
  assert.deepEqual(violations,[],label+': axe');
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
  for(const width of [1440,390,320]) {
    const data=fixture('screenshot-parent');
    data.done={profile:true,shortlist:true,chances:true,kit:true,codice:true};
    data.client.profile.universityIds=['bocconi'];
    const options={data};
    const {page,context}=await open({width,height:900},'partial',options);
    const total=data.roadmap.flatMap(stage=>stage.tasks).length;
    assert.equal(await road(page).getAttribute('data-road-done'),'3');
    assert.equal(await road(page).getAttribute('data-road-ahead'),'2');
    assert.match(await road(page).locator('[data-road-count]').innerText(),/заранее: 2/);
    assert.equal(await road(page).locator('[data-road-stage="arrival"] svg').count(),0,'Future stages use an ordinal, never a lock');
    const transform=await road(page).locator('[data-road-fill]').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a);
    assert(Math.abs(transform-3/total)<.001,'Progress position uses actual eligible fraction');
    assert.match(await page.locator('[data-portal-welcome] [data-saved-universities]').innerText(),/Bocconi/);
    assert.doesNotMatch(await page.locator('main').innerText(),/Выбраны в этом браузере|До подачи в/);
    const instruction=road(page).locator('[data-road-open]');
    assert.match(await instruction.innerText(),/Как поставить апостиль/);
    assert.match(await instruction.getAttribute('href'),/view=plan&task=apostille/);
    assert.equal(await road(page).locator('[data-road-upload]').innerText(),'У меня уже есть, загрузить');
    await capture(page,`overview-${width}`);
    await instruction.click();await detail(page).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('view'),'plan');
    assert(await page.locator('[data-step-instructions]').isVisible());
    const guideBox=await page.locator('[data-step-instructions]').boundingBox();
    const uploadBox=await page.locator('[data-portal-upload-zone]').boundingBox();
    assert(guideBox.y<uploadBox.y,'Instructions precede file upload');
    await page.locator('[data-portal-assistant]').click();
    const chat=page.locator('#iitaly-chat');await chat.waitFor();
    await chat.getByRole('link',{name:'Что такое апостиль и где его поставить в Казахстане?',exact:true}).waitFor();
    await page.evaluate(()=>{const badge=document.createElement('iframe');badge.id='nl-badge-frame';badge.title='Synthetic hosting badge';badge.style.cssText='position:fixed;bottom:16px;right:16px;width:190px;height:44px;z-index:2147483647';document.body.append(badge);});
    assert.equal(await page.locator('#nl-badge-frame').isVisible(),false,'Hosting badge is hidden in the portal');
    await page.waitForTimeout(350);
    const box=await chat.boundingBox();
    if(width>1100){const content=await page.locator('main').boundingBox();assert(content.x+content.width<=box.x,'Assistant owns a separate desktop column');}
    else {assert.equal(Math.round(box.width),width);assert.equal(Math.round(box.height),900);assert.equal(await chat.getAttribute('aria-modal'),'true');assert(await page.locator('[data-portal-design]').evaluate(el=>el.inert));}
    const input=chat.locator('#chat-input');const inputBox=await input.boundingBox();
    assert(inputBox.y+inputBox.height<=900);assert(inputBox.width>140);
    await noOverflow(page);await axe(page,`chat ${width}`);await capture(page,`chat-${width}`);
    await chat.getByRole('button',{name:'Закрыть чат',exact:true}).click();await chat.waitFor({state:'hidden'});
    assert.equal(await page.locator('[data-portal-design]').evaluate(el=>el.inert),false);
    await road(page).locator('[data-road-stage="start"]').click();await page.locator('[data-saved-profile]').waitFor();
    assert.match(await page.locator('[data-saved-profile]').innerText(),/Этап учёбы|Бакалавриат|До 3 млн/);
    assert(await page.locator('[data-saved-profile]').getByRole('link',{name:'Изменить',exact:true}).isVisible());
    assert.equal(await road(page).locator('[aria-current="step"]').getAttribute('data-road-stage'),'start');
    assert.equal(await nav(page).locator('[aria-current=page]').innerText(),'План');
    await page.locator('[data-portal-assistant]').click();await chat.waitFor();
    await chat.getByRole('link',{name:'Что дальше?',exact:true}).waitFor();
    assert.equal(await chat.getByRole('link',{name:'С чего начать этот шаг?',exact:true}).count(),0);
    await chat.getByRole('button',{name:'Закрыть чат',exact:true}).click();await chat.waitFor({state:'hidden'});
    await detail(page).getByRole('link',{name:'Назад',exact:true}).click();
    await page.locator('[data-step-detail=apostille]').waitFor();
    await road(page).locator('[data-road-stage="arrival"]').click();await detail(page).waitFor();
    assert.equal(await detail(page).getByRole('button').count(),0,'Future stage is a read-only preview');
    data.docs.apostille={verdict:'ok',fileName:'synthetic.txt'};
    data.docs.translate={verdict:'warn',summary:'Требования заявки не подтверждены.'};
    await page.goto(origin+'/portal',{waitUntil:'networkidle'});await page.locator('[data-portal-overview]').waitFor();
    assert.equal(await road(page).getAttribute('data-road-done'),'4','Ready document counts even without a done flag');
    assert.match(await road(page).locator('[data-road-stage=docs]').innerText(),/1 \/ 5 шагов/);
    await go(page,'Документы');await page.locator('[data-document-list]').waitFor();
    assert.equal(await page.getByRole('heading',{name:'Твои документы',exact:true}).count(),1);
    assert.match(await page.locator('[data-document=apostille]').innerText(),/Готово/);
    assert.match(await page.locator('[data-document=translate]').innerText(),/На проверке/);
    assert.match(await page.locator('[data-document=translate]').innerText(),/Что сделать:/);
    assert.doesNotMatch(await page.locator('[data-document=translate]').innerText(),/Нужно уточнить|мы сообщим/);
    await axe(page,`documents ${width}`);await noOverflow(page);await capture(page,`documents-${width}`);
    if(width!==320) {
      await go(page,'Обзор');await page.locator('[data-saved-universities]').getByRole('link',{name:'изменить',exact:true}).click();
      await page.locator('[data-portal-universities]').waitFor();
      await page.getByRole('group',{name:'Карта Италии с университетами по городам',exact:true}).getByRole('button',{name:'Милан — показать университеты',exact:true}).click();
      await page.locator('[data-university-select=polimi]').check();options.failProfile=true;
      await page.locator('[data-shortlist-save]').click();await page.locator('[data-portal-overview]').waitFor();
      await page.getByRole('button',{name:'Повторить синхронизацию',exact:true}).waitFor();
      assert.deepEqual(data.client.profile.universityIds,['bocconi'],'Offline save cannot claim a remote write');
      options.failProfile=false;await page.getByRole('button',{name:'Повторить синхронизацию',exact:true}).click();
      await page.getByRole('button',{name:'Повторить синхронизацию',exact:true}).waitFor({state:'hidden'});
      assert.deepEqual(data.client.profile.universityIds,['bocconi','polimi']);
      const peer=await open({width,height:900},'partial',{data});
      assert.match(await peer.page.locator('[data-saved-universities]').innerText(),/Politecnico di Milano/,'Fresh browser restores the backend list');
      await peer.context.close();
    }
    results.push({width,progress:true,documents:true,instructions:true,profile:true,contextChat:true,remoteShortlist:width!==320});await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
  await writeFile(resolve(output,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
} catch(error) { if(activePage&&!activePage.isClosed())await capture(activePage,'failure');throw error; }
finally { await browser.close();server.close(); }
