import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const require=createRequire(import.meta.url);
const { chromium }=require(resolve(process.env.REVIEW_TOOLS || '/tmp/iitaly-browser/node_modules','playwright'));
const output=resolve('design-review/permesso-hover');await mkdir(output,{recursive:true});
const prefix='https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/';
const assets=[
 ['0a9ea39b-6d11-49a1-9f44-1d8ac459a4d8.webp','f609784102d429bb79c2e747f56119dc6e69c2f506eca27394d57148640d86bd'],
 ['6197ee86-f592-42aa-b2f4-880ba25fa2d6.webp','a82548859c5f466b448165012d57b15277b8d316f9ce0890763b04068213355d'],
 ['651d4291-4411-47e0-a06c-c5660305144b.webp','e1c7c928c00d0b80bdb4ef073f790927f6c077ae3309232ea978c1fbab5f608c'],
];
const images=new Map();
for(const [name,hash] of assets){const r=await fetch(prefix+name,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200);const bytes=Buffer.from(await r.arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),hash);images.set(prefix+name,bytes);}
const root=resolve('out'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));assert(path===root||path.startsWith(root+sep));for(const f of [path,path+'.html',resolve(path,'index.html')])if((await stat(f).catch(()=>null))?.isFile()){res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream'});res.end(await readFile(f));return;}res.writeHead(404).end();}catch{res.writeHead(500).end();}});
await new Promise(done=>server.listen(4197,'127.0.0.1',done));
const browser=await chromium.launch(),results=[];let activePage;
try{
 for(const [width,touch] of [[1440,false],[1024,false],[768,false],[390,true],[360,true]]){
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:touch,isMobile:touch,reducedMotion:'reduce',locale:'ru-RU'});
  const errors=[],writes=[];
  await context.route('**/*',async route=>{const request=route.request(),url=new URL(request.url());if(images.has(url.href))return route.fulfill({status:200,contentType:'image/webp',body:images.get(url.href)});if(url.hostname==='127.0.0.1')return route.continue();if(request.method()!=='GET'||request.postData())writes.push(url.origin+url.pathname);return route.abort();});
  const page=await context.newPage();activePage=page;page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4197/guides/permesso-modulo-1',{waitUntil:'networkidle'});
  await page.getByRole('tab',{name:'Заполнить с подсказками',exact:true}).click();
  const editor=page.locator('[data-permesso-editor]');
  await editor.locator('[data-ready="true"]').waitFor();await page.evaluate(()=>document.fonts.ready);
  const field=id=>editor.locator(`[data-editor-field="${id}"][data-part="0"] input`);
  const mark=id=>editor.locator(`[data-editor-field="${id}"][data-part="0"] button`);
  const help=id=>page.locator(`[data-permesso-hover="${id}"]`);
  const surname=field('3');
  const inspector=editor.locator('aside[aria-label="Подсказка и ввод выбранного поля"]');
  const bounded=async locator=>{const r=await locator.boundingBox(),v=await page.evaluate(()=>({x:visualViewport?.offsetLeft||0,y:visualViewport?.offsetTop||0,w:visualViewport?.width||innerWidth,h:visualViewport?.height||innerHeight}));assert(r&&r.x>=v.x-1&&r.y>=v.y-1&&r.x+r.width<=v.x+v.w+1&&r.y+r.height<=v.y+v.h+1,'Help must fit the visible viewport');};
  const geometry=await surname.locator('..').evaluate(el=>el.getAttribute('style'));
  if(!touch){
   const before=await inspector.locator('h2').innerText();
   await surname.hover();await help('3').waitFor({state:'visible'});
   assert.equal(await inspector.locator('h2').innerText(),before,'Hover must not select a different editing field');
   assert.equal(await surname.inputValue(),'');assert.equal(await help('3').getAttribute('role'),'tooltip');
   assert(await help('3').locator('dd').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=14));
   assert.equal(await help('3').locator('[data-hover-magnifier]').count(),1);
   await bounded(help('3'));
   await help('3').hover();await page.waitForTimeout(400);assert(await help('3').isVisible(),'Hoverable help must not disappear under the pointer');
   await page.keyboard.press('Escape');await page.locator('[data-permesso-hover]').waitFor({state:'detached'});
   await surname.focus();await help('3').waitFor({state:'visible'});
   const tooltipId=await help('3').getAttribute('id');assert((await surname.getAttribute('aria-describedby')).includes(tooltipId));
   await page.keyboard.press('Escape');assert(await surname.evaluate(el=>el===document.activeElement),'Escape keeps the caret in the field');
   await page.keyboard.type('TEST');
   await field('4').hover();await help('4').waitFor({state:'visible'});
   assert(await surname.evaluate(el=>el===document.activeElement),'Reading another field does not steal focus');
   await page.keyboard.type('X');assert.equal(await surname.inputValue(),'TESTX');assert.equal(await field('4').inputValue(),'');
   if(width===1440)await page.screenshot({path:resolve(output,'hover-1440.png'),animations:'disabled'});
   await page.keyboard.press('Escape');await surname.evaluate(el=>el.blur());
   await mark('10').hover();await help('10').waitFor({state:'visible'});assert.match(await help('10').innerText(),/Пропусти/);assert.equal(await mark('10').getAttribute('aria-pressed'),'false');
   await page.keyboard.press('Escape');
   await field('16').hover();await help('16').waitFor({state:'visible'});await bounded(help('16'));
   await page.keyboard.press('Escape');
   const nav=editor.getByRole('navigation',{name:'Страницы электронного бланка'});
   await nav.getByRole('button').nth(1).click();await editor.locator('[data-sheet-page="2"][data-ready="true"]').waitFor();
   await field('44').hover();await help('44').waitFor({state:'visible'});assert.match(await help('44').innerText(),/Номер паспорта/);await bounded(help('44'));
   await page.keyboard.press('Escape');
   await nav.getByRole('button').nth(2).click();await editor.locator('[data-sheet-page="3"][data-ready="true"]').waitFor();
   await field('72').hover();await help('72').waitFor({state:'visible'});await bounded(help('72'));
   await page.keyboard.press('Escape');
   await nav.getByRole('button').nth(0).click();await editor.locator('[data-ready="true"]').waitFor();
  }else{
   await surname.tap();await help('3').waitFor({state:'visible'});assert.equal(await help('3').getAttribute('role'),'dialog');
   assert.equal(await surname.inputValue(),'');assert(await page.evaluate(()=>!(document.activeElement instanceof HTMLInputElement)),'Tap explains before opening the keyboard');
   await bounded(help('3'));
   if(width===390)await page.screenshot({path:resolve(output,'tap-390.png'),animations:'disabled'});
   await help('3').getByRole('button',{name:'Ввести крупно',exact:true}).tap();
   await page.locator('[data-permesso-hover]').waitFor({state:'detached'});
   await inspector.locator('h2').filter({hasText:'Фамилия'}).waitFor();
   const large=inspector.getByRole('textbox',{name:'Ввести: Фамилия',exact:true});
   assert(await large.evaluate(el=>el===document.activeElement));await large.fill('TOUCHTEST');assert.equal(await surname.inputValue(),'TOUCHTEST');
   await mark('14').tap();await help('14').waitFor({state:'visible'});assert.equal(await mark('14').getAttribute('aria-pressed'),'false','First tap reads; it does not accidentally check a box');
   await help('14').getByRole('button',{name:'Закрыть подсказку',exact:true}).tap();
   await page.locator('[data-permesso-hover]').waitFor({state:'detached'});
  }
  assert.equal(await surname.locator('..').getAttribute('style'),geometry,'Hover enhancement does not change PDF coordinates');
  await page.getByRole('tab',{name:'Оригинал',exact:true}).click();assert.equal(await page.locator('[data-permesso-hover]').count(),0);
  await page.getByRole('tab',{name:'Заполнить с подсказками',exact:true}).click();assert.equal(await page.locator('[data-permesso-hover]').count(),0);
  assert.equal(await surname.inputValue(),touch?'TOUCHTEST':'TESTX','Reading the original keeps the draft');
  assert.equal(await page.evaluate(()=>localStorage.getItem('iitaly:permesso-paper-editor:v1')),null,'Hover must not persist personal values');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  results.push({width,touch,passed:true,checks:'hover/focus or tap, readable crop, viewport bounds, no stolen caret or implicit checkbox, original preserved, draft retained, no storage/API writes'});
  await context.close();
 }
}catch(error){if(activePage&&!activePage.isClosed())await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});await writeFile(resolve(output,'failure.txt'),String(error.stack||error));throw error;
}finally{await writeFile(resolve(output,'results.json'),JSON.stringify(results,null,2));await browser.close();await new Promise(done=>server.close(done));}
console.log(JSON.stringify(results,null,2));
