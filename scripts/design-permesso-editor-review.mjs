import { clickPermessoTool } from './permesso-review-interactions.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS || '/tmp/iitaly-browser/node_modules','playwright'));
const output=resolve('design-review/permesso-editor'); await mkdir(output,{recursive:true});
const prefix='https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/';
const assets=[
 ['0a9ea39b-6d11-49a1-9f44-1d8ac459a4d8.webp','f609784102d429bb79c2e747f56119dc6e69c2f506eca27394d57148640d86bd'],
 ['6197ee86-f592-42aa-b2f4-880ba25fa2d6.webp','a82548859c5f466b448165012d57b15277b8d316f9ce0890763b04068213355d'],
 ['651d4291-4411-47e0-a06c-c5660305144b.webp','e1c7c928c00d0b80bdb4ef073f790927f6c077ae3309232ea978c1fbab5f608c'],
];
const images=new Map();
for(const [name,hash] of assets){
 const r=await fetch(prefix+name,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200);
 const bytes=Buffer.from(await r.arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),hash);images.set(prefix+name,bytes);
}
const root=resolve('out');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
 try{const candidate=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 assert(candidate===root || candidate.startsWith(root+sep));
 for(const f of [candidate,candidate+'.html',resolve(candidate,'index.html')]) if((await stat(f).catch(()=>null))?.isFile()) {res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream'});res.end(await readFile(f));return;}
 res.writeHead(404).end();}catch{res.writeHead(500).end();}
});
await new Promise(done=>server.listen(4194,'127.0.0.1',done));
const browser=await chromium.launch(process.env.REVIEW_BROWSER?{executablePath:process.env.REVIEW_BROWSER,args:['--no-sandbox']}:{});const results=[];let activePage;
const key='iitaly:permesso-paper-editor:v1';
try{
 for(const width of [1440,1024,768,390,360]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',locale:'ru-RU'});
  const errors=[],unsafe=[];let failImage=false;
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(images.has(url.href)) return failImage ? route.abort() : route.fulfill({status:200,contentType:'image/webp',body:images.get(url.href)});
   if(url.hostname==='127.0.0.1') return route.continue();
   if(request.method()!=='GET' || request.postData()) unsafe.push({url:url.origin+url.pathname,method:request.method()});
   return route.abort();
  });
  const page=await context.newPage();activePage=page;page.on('pageerror',e=>errors.push(e.message));
  async function shot(name){
   await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});});
   await page.waitForTimeout(250);
   await page.screenshot({path:resolve(output,name),fullPage:true,animations:'disabled'});
  }
  await page.goto('http://127.0.0.1:4194/guides/permesso-modulo-1',{waitUntil:'networkidle'});
  assert.equal(await page.getByRole('tab',{name:'Оригинал',exact:true}).getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('#permesso-panel-original object[type="application/pdf"]').count(),1);
  await page.getByRole('tab',{name:'Заполнить с подсказками',exact:true}).click();
  const editor=page.locator('[data-permesso-editor]');
  const loaded=()=>editor.locator('[data-sheet-page][data-ready="true"]').waitFor();
  await loaded();await page.evaluate(()=>document.fonts.ready);
  const part=(id,i=0)=>editor.locator(`[data-editor-field="${id}"][data-part="${i}"] input`);
  const mark=(id,i=0)=>editor.locator(`[data-editor-field="${id}"][data-part="${i}"] button`);
  const pin=async id=>{if(await editor.getAttribute('data-pinned-field')!==id) await editor.locator(`[data-field-zone="${id}"]`).click();};
  const nav=editor.getByRole('navigation',{name:'Страницы электронного бланка'});
  const sheetPage=async n=>{await nav.getByRole('button').nth(n-1).click();await loaded();};
  const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`page overflow ${width}`);
  await noOverflow();
  assert.equal(await part('questore').getAttribute('placeholder'),'Квестору какого города');
  if([1440,390].includes(width)) await shot(`editor-initial-${width}.png`);
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),null,'No persistent personal data before explicit Save');
  assert.equal(await part('3').getAttribute('maxlength'),'30');
  assert.equal(await part('3',1).getAttribute('maxlength'),'30');
  await part('3').fill('');await part('3').pressSequentially('TEST STUDENT');
  assert.equal(await part('3').inputValue(),'TEST STUDENT','Space in a name must not disappear while typing');
  assert.equal(await editor.locator('[data-panel-input]').inputValue(),'TEST STUDENT');
  await part('3',1).fill('SECOND ROW');
  assert.equal((await part('3').inputValue()).trimEnd(),'TEST STUDENT');
  await page.getByRole('tab',{name:'Оригинал',exact:true}).click();
  await page.getByRole('tab',{name:'Заполнить с подсказками',exact:true}).click();
  assert.equal(await part('3',1).inputValue(),'SECOND ROW','Draft survives switching to original and back');
  const geometry=await editor.locator('[data-editor-field="3"][data-part="0"]').evaluate(el=>{const s=el.closest('[data-sheet-page]').getBoundingClientRect(),r=el.getBoundingClientRect();return {x:(r.x-s.x)/s.width*595,y:(r.y-s.y)/s.height*842,ratio:s.height/s.width};});
  assert(Math.abs(geometry.x-45.23)<.08 && Math.abs(geometry.y-220.14)<.08,'Inputs must be registered to original PDF points');
  assert(Math.abs(geometry.ratio-842/595)<.001);
  await clickPermessoTool(editor,'Увеличить лист');await noOverflow();
  await clickPermessoTool(editor,'Вместить лист');
  await pin('10');await mark('10').click();
  await editor.getByText(/^Дальше: Поле 14 —/).waitFor();
  await editor.locator('[data-next-field]').click();
  assert.equal(await editor.locator('[data-editor-field="14"][data-selected="true"]').count(),1,'Guidance resumes after the selected skipped field');
  await pin('29');await mark('29').click();await editor.locator('[data-next-field]').click();await loaded();
  assert.equal(await editor.locator('[data-sheet-page="2"]').count(),1,'Next moves across page boundaries');
  assert.equal(await editor.locator('[data-editor-field="31"][data-selected="true"]').count(),1);
  await sheetPage(1);
  await editor.getByRole('button',{name:/Продление Rinnovo/}).click();
  await part('20',0).fill('31');await part('20',1).fill('02');await part('20',2).fill('2026');
  await editor.locator('#permesso-value-error').filter({hasText:'Такой даты нет'}).waitFor();
  await part('20',0).fill('28');assert.equal(await editor.locator('#permesso-value-error').innerText(),'');
  if([1440,390].includes(width)) await shot(`editor-page1-${width}.png`);
  await sheetPage(2);
  assert.equal(await part('38',0).getAttribute('maxlength'),'25');assert.equal(await part('38',1).getAttribute('maxlength'),'30');
  assert.equal(await part('50').count(),0,'Renewal visa fields are annotation-only');
  await pin('37');await mark('37',0).click();await mark('37',1).click();
  assert.equal(await mark('37',0).getAttribute('aria-pressed'),'false');assert.equal(await mark('37',1).getAttribute('aria-pressed'),'true');
  await editor.getByRole('button',{name:/Первое ВНЖ Rilascio/}).click();
  assert.equal(await part('50').getAttribute('maxlength'),'8');assert.equal(await part('51').getAttribute('maxlength'),'2');
  await pin('52');await mark('52').click();await pin('53');await mark('53').click();
  assert.equal(await mark('52').getAttribute('aria-pressed'),'false');assert.equal(await mark('53').getAttribute('aria-pressed'),'true');
  await part('44').fill('TEST12345');
  if(width===1440) await shot('editor-page2-1440.png');
  await sheetPage(3);await part('69',0).fill('22');await part('69',1).fill('B');
  assert.equal(await part('69',1).getAttribute('maxlength'),'4');
  await part('73').fill('CaseSensitive@Example');assert.equal(await part('73').inputValue(),'CaseSensitive@Example');
  assert.equal(await part('73').getAttribute('maxlength'),'21');
  assert.equal(await part('74',0).getAttribute('maxlength'),'4');assert.equal(await part('74',1).getAttribute('maxlength'),'12');
  await part('72').fill('50129');
  if([1440,390].includes(width)) await shot(`editor-page3-${width}.png`);
  await clickPermessoTool(editor,'Сохранить');
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(saved.values['69'],'22/B');assert.equal(saved.values['72'],'50129');
  await page.reload({waitUntil:'networkidle'});await page.getByRole('tab',{name:'Заполнить с подсказками',exact:true}).click();await loaded();
  assert.equal(new URL(page.url()).searchParams.get('page'),'3');await sheetPage(1);
  assert.equal(await part('3').inputValue(),'','Personal data is not restored without an explicit action');
  await clickPermessoTool(editor,'Восстановить');assert.equal((await part('3').inputValue()).trimEnd(),'TEST STUDENT');
  if(width===1440){
   failImage=true;await nav.getByRole('button').nth(1).click();await editor.getByText(/Не удалось загрузить основу/).waitFor();
   assert.equal(await editor.locator('[data-editor-field]').count(),0,'Never show floating inputs without the original');
   failImage=false;await editor.getByRole('button',{name:'Повторить загрузку'}).click();await loaded();
  }
  await clickPermessoTool(editor,'Стереть');
  await editor.getByRole('button',{name:'Отмена',exact:true}).click();
  assert(await page.evaluate(k=>Boolean(localStorage.getItem(k)),key),'Cancel must keep the saved draft');
  await clickPermessoTool(editor,'Стереть');
  await editor.getByRole('button',{name:'Да, стереть',exact:true}).click();
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),null);
  await noOverflow();assert.deepEqual(errors,[],'No runtime/hydration errors');assert.deepEqual(unsafe,[],'Editor must not submit private data or hit production APIs');
  results.push({width,passed:true,checks:'original preserved; direct input; exact coordinates; spaces/multiline; mode retention; explicit pin; skipped-field and cross-page guidance; date format; radio/checkbox exclusivity; explicit save/restore/clear; URL reload; overflow/zoom; no real API calls'});
  await context.close();
 }
}catch(error){
 if(activePage && !activePage.isClosed()) await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});
 await writeFile(resolve(output,'failure.txt'),String(error.stack||error));throw error;
}finally{
 await writeFile(resolve(output,'results.json'),JSON.stringify(results,null,2));await browser.close();await new Promise(done=>server.close(done));
}
console.log(JSON.stringify(results,null,2));
