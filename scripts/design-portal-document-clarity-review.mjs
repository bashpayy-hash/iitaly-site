import { portalDestination } from './portal-review-navigation.mjs';
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
const output=resolve(process.env.ROAD_DESIGN_REVIEW_OUTPUT||'design-review/portal-clarity');
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
const results=[],errors=[],unexpected=[];
const road=page=>page.locator('[data-portal-road]');
async function go(page,name){await portalDestination(page,name);}
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
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/portal?auth=login',{waitUntil:'networkidle'});
  await page.getByLabel('Фамилия',{exact:true}).fill('Testov');await page.getByLabel('Код доступа',{exact:true}).fill('TEST-01');
  await page.getByRole('button',{name:'Войти в кабинет',exact:true}).click();
  await page.locator(mode==='onboarding'?'[data-portal-profile]':'[data-portal-overview]').waitFor({state:'attached'});
  await page.evaluate(()=>document.fonts.ready);return {page,context,data,calls,fileCalls};
}

const review={profile:'general',profileLabel:'Общая проверка',academicYear:'unspecified',applicantScope:'unspecified',rulesStatus:'unspecified',referenceYear:null,rulesVersion:'synthetic-clarity',verifiedOn:'2026-10-09',notice:'Требования конкретной заявки не выбраны. Итог не подтверждает соответствие требованиям вуза.',sources:[{id:'source',label:'Официальный источник из сохранённого отчёта',url:'https://www.universitaly.it/studenti-stranieri'}]};
const original={verdict:'warn',summary:'Видимых ошибок в содержании не найдено. Соответствие требованиям заявки пока не подтверждено.',checks:[{label:'Читаемость',status:'ok',note:'Текст виден.'}],problems:[],nextSteps:['Уточни требования выбранного вуза и повтори проверку.'],review};
try {
 for(const width of [1440,390,320]) {
  const data=fixture('screenshot-parent');data.done={profile:true,shortlist:true,chances:true,kit:true,codice:true};
  data.client.name='Айдана';data.client.profile.universityIds=['bocconi'];
  const task=data.roadmap.flatMap(s=>s.tasks).find(t=>t.id==='apostille');
  Object.assign(task,{t:'Поставить апостиль на аттестат или диплом',time:'до 15 рабочих дней',deadline:'2027-05-01',deadlineKind:'Ориентир',daysLeft:189});
  data.docs.apostille={verdict:'warn',fileName:'attestat.pdf',checkedAt:'2026-10-20T10:00:00Z',result:structuredClone(original)};
  const {page,context}=await open({width,height:900},'partial',{data});
  assert.equal(await road(page).getAttribute('data-road-done'),'3');assert.equal(await road(page).getAttribute('data-road-ahead'),'2');
  assert.match(await page.locator('[data-road-open]').innerText(),/Открыть разбор/);
  await capture(page,`overview-${width}`);
  await go(page,'План');await noOverflow(page);await capture(page,`plan-${width}`);
  await go(page,'Документы');await capture(page,`documents-${width}`);
  await page.locator('[data-document=apostille]').click();const report=page.getByRole('region',{name:'Разбор документа'});await report.waitFor();
  await page.evaluate(()=>document.fonts.ready);
  assert.match(await report.innerText(),/Нужно уточнить/);assert.doesNotMatch(await report.innerText(),/На проверке/);
  assert.match(await report.innerText(),/Видимых ошибок в содержании не найдено/);

  const sizes=await report.evaluate(el=>({scale:visualViewport.scale,width:el.getBoundingClientRect().width,body:parseFloat(getComputedStyle(el.querySelector('[data-portal-document-inspector] p')).fontSize),chrome:document.querySelector('[data-portal-chrome]').getBoundingClientRect().height}));
  assert.equal(sizes.scale,1);assert.equal(sizes.body,16);
  const action=report.locator('[data-document-prepare]');const bounds=await action.boundingBox();
  if(width===1440)assert(bounds.y+bounds.height<900,'The next action fits in the first desktop viewport');
  await capture(page,`document-${width}`);await axe(page,`result ${width}`);await noOverflow(page);
  for(const value of ['attestat.pdf','20 октября 2026','до 15 рабочих дней','1 мая','Это не срок конкретного вуза'])assert((await report.innerText()).includes(value),value+' retained');
  await report.getByText('Что проверено: полный разбор',{exact:true}).click();
  assert.match(await report.innerText(),/Текст виден/);
  await report.getByText('Источники и дата сверки правил',{exact:true}).click();
  assert.equal(await report.locator('a[href="https://www.universitaly.it/studenti-stranieri"]').count(),1);
  await report.getByText('Все рекомендации из разбора',{exact:true}).click();
  assert.match(await report.innerText(),/Уточни требования выбранного вуза и повтори проверку/);
  await action.click();const form=page.locator('[data-document-upload-form]');await form.waitFor();
  assert(await form.locator('details').evaluate(el=>el.open),'Context is open before starting');
  const programme=form.getByRole('combobox',{name:'Стипендиальная программа'}),year=form.getByRole('combobox',{name:'Учебный год заявки'});
  await programme.selectOption('piemonte');await year.selectOption('2026/27');await form.getByRole('checkbox').check();
  await report.getByRole('link',{name:'К документам',exact:true}).click();await page.locator('[data-document=apostille]').click();await action.click();
  assert.equal(await programme.inputValue(),'piemonte','Unsubmitted context survives view navigation');
  assert.equal(await year.inputValue(),'2026/27');assert(await form.getByRole('checkbox').isChecked());
  await report.getByRole('link',{name:'К документам',exact:true}).click();
  await page.goBack();await report.waitFor();await action.click();
  assert.equal(await programme.inputValue(),'piemonte','Browser Back preserves the draft context');
  assert.equal(await year.inputValue(),'2026/27');
  let checks=0,saves=0;
  await context.route('**/api/check-document',async route=>{checks++;assert.deepEqual(route.request().postDataJSON().context,{profile:'piemonte',academicYear:'2026/27',applicantScope:'kz-family-abroad'});await new Promise(resolve=>setTimeout(resolve,350));return route.fulfill({json:{ok:true,result:original}});});
  await context.route('**/api/portal/TEST-01/doc',async route=>{
    saves++;if(saves===1)return route.fulfill({status:503,json:{ok:false,error:'Синтетический сбой сохранения'}});
    const body=route.request().postDataJSON();assert.deepEqual(body.result,original);
    data.docs[body.task]={verdict:body.result.verdict,result:body.result,fileName:body.fileName,checkedAt:'2026-10-24T10:00:00Z'};
    return route.fulfill({json:{ok:true,docs:data.docs,done:data.done,progress:upstreamProgress(data)}});
  });
  await form.locator('input[type=file]').setInputFiles({name:'unsupported.exe',mimeType:'application/octet-stream',buffer:Buffer.from('SYNTHETIC')});
  assert.equal(checks,0);await form.getByRole('button',{name:'Проверить документ',exact:true}).click();
  await form.getByRole('alert').waitFor();assert.equal(checks,0);assert.match(await form.innerText(),/Поддерживаем/);
  await form.locator('input[type=file]').setInputFiles({name:'synthetic-attestat.txt',mimeType:'text/plain',buffer:Buffer.from('SYNTHETIC DOCUMENT FOR UX TESTING ONLY. No personal data.')});
  assert.equal(checks,0,'Selection alone never starts AI');assert.equal(await form.getByRole('alert').count(),0,'Changing the file clears the previous error');
  assert.match(await form.locator('[data-selected-document]').innerText(),/synthetic-attestat.txt/);
  await form.scrollIntoViewIfNeeded();await capture(page,`upload-${width}`);await axe(page,`upload ${width}`);await noOverflow(page);
  await form.getByRole('button',{name:'Проверить документ',exact:true}).click();
  await form.locator('[data-document-operation=checking]').waitFor();assert.match(await form.innerText(),/На проверке/);
  await form.getByRole('alert').waitFor();assert.match(await form.getByRole('alert').innerText(),/проверка завершена, но результат не сохранён/);
  assert.match(await report.innerText(),/attestat.pdf/,'Existing saved report survives the failure');
  assert.equal(checks,1);assert.equal(saves,1);
  await form.getByRole('button',{name:'Сохранить результат',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[aria-label="Файл и сроки"]')?.textContent.includes('synthetic-attestat.txt'));
  assert.equal(checks,1,'Retry saves the result without another AI charge');assert.equal(saves,2);
  assert.equal(await page.locator('[data-document-operation-error]').count(),0,'Saved result has no stale error');
  assert.equal(await road(page).getAttribute('data-road-done'),'3','Clarification does not change progress');
  await page.reload({waitUntil:'networkidle'});await report.waitFor();assert.equal(checks,1);assert.match(await report.innerText(),/synthetic-attestat.txt/);
  await report.getByRole('link',{name:'К документам',exact:true}).click();
  data.docs.apostille={verdict:'warn',summary:'Сохранённый краткий итог без полного отчёта.'};
  await page.reload({waitUntil:'networkidle'});await page.locator('[data-document=apostille]').click();
  assert.match(await report.innerText(),/Подробности старого разбора восстановить нельзя/);
  assert.match(await report.innerText(),/Исходный файл не хранится/);
  await road(page).locator('[data-road-stage=arrival]').click();assert.equal(await page.locator('[data-document-upload-form]').count(),0);
  results.push({width,sizes,sourceDataPreserved:true,progressUnchanged:true,contextRetained:true,selectionRequiresConfirmation:true,saveOnlyRetry:true,legacyLimitHonest:true});
  await context.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
 await writeFile(resolve(output,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
} finally {await browser.close();server.close();}
