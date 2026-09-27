import { reviewLightWorkbench } from './permesso-light-checks.mjs';
import { clickPermessoTool } from './permesso-review-interactions.mjs';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.REVIEW_TOOLS||'/tmp/iitaly-browser/node_modules','playwright'));
const out=resolve('design-review/permesso-answer');await mkdir(out,{recursive:true});
const source=await readFile('src/components/guides/permesso/permessoOriginalGeometry.ts','utf8');
const prefix=source.match(/const CDN = "([^"]+)"/)[1];
const assets=[...source.matchAll(/url: CDN \+ "([^"]+)", sha256: "([^"]+)"/g)],images=new Map();
await Promise.all(assets.map(async([,name,hash])=>{const r=await fetch(prefix+name,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200);const b=Buffer.from(await r.arrayBuffer());assert.equal(createHash('sha256').update(b).digest('hex'),hash);images.set(prefix+name,b);}));
const ts=require('typescript'),tmp=resolve('/tmp/permesso-answer-model');await mkdir(tmp,{recursive:true});
for(const name of ['permessoData','permessoOriginalGeometry','permessoFieldAnswer']){const input=await readFile(`src/components/guides/permesso/${name}.ts`,'utf8');const result=ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});await writeFile(`${tmp}/${name}.js`,result.outputText);}
const M=require(tmp+'/permessoOriginalGeometry.js'),A=require(tmp+'/permessoFieldAnswer.js');
const f32=M.EDITOR_FIELDS.find(f=>f.id==='32'),f35=M.EDITOR_FIELDS.find(f=>f.id==='35');
assert.equal(A.fieldAnswer(f32,'rilascio').answer,'A / B','Unknown marital status is not inferred');
assert.equal(A.fieldAnswer(f32,'rilascio','A').answer,'A');assert.equal(A.fieldAnswer(f32,'rinnovo','B').answer,'B');
assert.equal(A.fieldAnswer(f35,'rilascio','',true).status,'verify');assert.equal(A.fieldAnswer(f35,'rilascio','',true).value,'','Country examples do not imply verified personal facts');
assert.equal(A.fieldAnswer(f32,'rilascio','',true).example,true);assert.equal(M.normalizedRuns(f32)[0].x,131.76/595);
assert.equal(new Set(M.ALL_GUIDANCE_FIELDS.map(f=>f.id)).size,M.ALL_GUIDANCE_FIELDS.length,'Unique official field IDs');
const root=resolve('out'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));assert(path===root||path.startsWith(root+sep));for(const f of[path,path+'.html',resolve(path,'index.html')])if((await stat(f).catch(()=>null))?.isFile()){res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream'});res.end(await readFile(f));return;}res.writeHead(404).end();}catch{res.writeHead(500).end();}});
await new Promise(r=>server.listen(4199,'127.0.0.1',r));
const browser=await chromium.launch(process.env.REVIEW_BROWSER?{executablePath:process.env.REVIEW_BROWSER,args:['--no-sandbox']}:{});
const results=[];let activePage;
try{
 for(const[width,touch]of[[1440,false],[1024,false],[768,false],[390,true],[360,true]]){
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:touch,isMobile:touch,locale:'ru-RU',reducedMotion:'reduce'});
  const errors=[],writes=[];
  await context.route('**/*',route=>{const r=route.request(),u=new URL(r.url());if(images.has(u.href))return route.fulfill({status:200,contentType:'image/webp',body:images.get(u.href)});if(u.hostname==='127.0.0.1')return route.continue();if(r.method()!=='GET'||r.postData())writes.push(u.origin+u.pathname);return route.abort();});
  const p=await context.newPage();activePage=p;p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4199/guides/permesso-modulo-1?scenario=rilascio&page=2&field=31',{waitUntil:'networkidle'});
  const editor=p.locator('[data-permesso-editor]'),sheet=()=>editor.locator('[data-ready="true"]');
  const group=id=>editor.locator(`[data-zone-field="${id}"]`),zone=id=>editor.locator(`[data-field-zone="${id}"]`),help=id=>p.locator(`[data-permesso-hover="${id}"]`);
  const panel=editor.locator('aside[aria-label="Подсказка и ввод выбранного поля"]');
  await sheet().waitFor();await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.getByRole('tab',{name:'Заполнить с подсказками',exact:true}).getAttribute('aria-selected'),'true');
  const countHistory=()=>p.evaluate(()=>history.length),query=()=>new URL(p.url()).searchParams.get('field');
  const noOverlap=async id=>{const box=await help(id).boundingBox(),cells=await group(id).locator('[data-cell-outline]').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}));assert(box);const viewport=await p.evaluate(()=>({w:innerWidth,h:innerHeight}));assert(box.x>=0&&box.y>=0&&box.x+box.width<=viewport.w+1&&box.y+box.height<=viewport.h+1,'Help fits the viewport');for(const c of cells)assert(Math.max(0,Math.min(box.x+box.width,c.x+c.w)-Math.max(box.x,c.x))*Math.max(0,Math.min(box.y+box.height,c.y+c.h)-Math.max(box.y,c.y))<1,`Help covers field ${id}`);};
  const actual=await group('32').locator('[data-cell-outline]').evaluate(n=>{const a=n.getBoundingClientRect(),s=n.closest('[data-sheet-page]').getBoundingClientRect();return{x:(a.left-s.left)/s.width*595,y:(a.top-s.top)/s.height*842};});
  assert(Math.abs(actual.x-131.76)<.1&&Math.abs(actual.y-196.41)<.1,'32 is STATO CIVILE, not the neighbour');
  const start=p.url(),h=await countHistory();
  if(!touch){
   await group('32').hover();await help('32').waitFor({state:'visible'});assert.equal(p.url(),start);assert.equal(await countHistory(),h);assert.equal(await editor.getAttribute('data-pinned-field'),'31');
   assert.equal(await help('32').locator('[data-quick-answer]').innerText(),'A / B');await noOverlap('32');
   await p.mouse.move(3,3);await help('32').waitFor({state:'detached'});assert.equal(query(),'31');await group('32').hover();await help('32').waitFor({state:'visible'});
   await help('32').hover();await p.waitForTimeout(250);assert(await help('32').isVisible());await p.keyboard.press('Escape');await help('32').waitFor({state:'detached'});
   await zone('33').focus();await help('33').waitFor({state:'visible'});assert.equal(query(),'31');assert.equal(await zone('33').getAttribute('aria-describedby'),await help('33').getAttribute('id'));
   await p.keyboard.press('Escape');await zone('32').press('Enter');assert.equal(query(),'32');
   await panel.getByRole('radio',{name:'A — Не в браке',exact:true}).check();await group('32').hover();await help('32').waitFor({state:'visible'});
   assert.equal(await help('32').locator('[data-quick-answer]').innerText(),'A');assert.equal(await panel.locator('[data-quick-answer]').innerText(),'A');await noOverlap('32');
   if(width===1440)await p.screenshot({path:resolve(out,'answer-stato-1440.png'),animations:'disabled'});
   await p.keyboard.press('Escape');await zone('32').focus();await zone('32').press('ArrowDown');assert.equal(query(),'33');
   await p.goBack();await p.waitForFunction(()=>new URL(location.href).searchParams.get('field')==='32');await p.goForward();await p.waitForFunction(()=>new URL(location.href).searchParams.get('field')==='33');
   await group('35').hover();await help('35').waitFor({state:'visible'});assert.match(await help('35').innerText(),/УТОЧНИ/);assert.doesNotMatch(await help('35').innerText(),/KAZ/);await p.keyboard.press('Escape');
  }else{
   await zone('32').scrollIntoViewIfNeeded();const before=await p.evaluate(()=>scrollY);await zone('32').tap();await help('32').waitFor({state:'visible'});
   assert.equal(query(),'32');assert.equal(await help('32').getAttribute('role'),'dialog');assert.equal(await p.evaluate(()=>scrollY),before,'Tap does not move the paper');assert((await zone('32').boundingBox()).height>=44);await noOverlap('32');
   assert.equal(await editor.locator('[data-editor-field="32"] input').inputValue(),'','Tap does not invent a personal code');
   if(width===390)await p.screenshot({path:resolve(out,'answer-tap-390.png'),animations:'disabled'});
   await help('32').getByRole('button',{name:'Закрыть подсказку'}).tap();const b=await zone('34').boundingBox(),old=p.url();
   await zone('34').dispatchEvent('pointerdown',{pointerId:44,pointerType:'touch',clientX:b.x+2,clientY:b.y+2});await zone('34').dispatchEvent('pointerup',{pointerId:44,pointerType:'touch',clientX:b.x+2,clientY:b.y+62});
   assert.equal(p.url(),old,'A drag is not a pin');assert.equal(await p.locator('[data-permesso-hover]').count(),0);
  }
  await clickPermessoTool(editor,'Стр. 7');await sheet().waitFor();if(touch)await zone('144').tap();else await group('144').hover();await help('144').waitFor({state:'visible'});
  assert.equal(await help('144').locator('[data-quick-answer]').innerText(),'Весь блок пустой');assert.match(await help('144').innerText(),/ПРОПУСТИ/);assert.equal(await group('145').locator('input').count(),0,'Child fields are annotation-only');await noOverlap('144');
  if(width===1440)await p.screenshot({path:resolve(out,'answer-children-1440.png'),animations:'disabled'});
  if(touch)await help('144').getByRole('button',{name:'Закрыть подсказку'}).tap();else await p.keyboard.press('Escape');
  await editor.getByRole('navigation',{name:'Страницы электронного бланка'}).getByRole('button').nth(0).click();await sheet().waitFor();
  assert.equal(await zone('3').count(),1,'A multiline name is one zone');assert.equal(await group('3').locator('input[tabindex="-1"]').count(),2);
  await zone('3').focus();assert.notEqual(query(),'3','Focus is preview only');await zone('3').press('Enter');assert.equal(query(),'3');
  if(!touch){await p.keyboard.press('Escape');await editor.locator('[data-editor-field="3"][data-part="0"] input').fill('TEST STUDENT');}else await panel.getByRole('textbox',{name:'Ввести: Фамилия',exact:true}).fill('TEST STUDENT');
  await clickPermessoTool(editor,'Показать пример');assert.match(await panel.innerText(),/Пример — не твои данные/);assert.equal(await editor.locator('[data-editor-field="3"][data-part="0"] input').inputValue(),'TEST STUDENT');
  await clickPermessoTool(editor,'Мои данные');await p.getByRole('tab',{name:'Оригинал',exact:true}).click();assert.equal(await p.locator('[data-permesso-hover]').count(),0);
  await p.getByRole('tab',{name:'Заполнить с подсказками',exact:true}).click();await sheet().waitFor();assert.equal(await editor.locator('[data-editor-field="3"][data-part="0"] input').inputValue(),'TEST STUDENT');
  assert.equal(await p.evaluate(()=>localStorage.getItem('iitaly:permesso-paper-editor:v1')),null);
  await editor.getByRole('button',{name:'Больше не показывать подсказку',exact:true}).click();await p.reload({waitUntil:'networkidle'});await sheet().waitFor();assert.equal(await editor.getByRole('button',{name:'Больше не показывать подсказку',exact:true}).count(),0);
  await reviewLightWorkbench({page:p,editor,model:M,width,touch,output:out});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  results.push({width,touch,passed:true,checks:'exact field32; single zone; inert hover/focus; pin/URL/back; source-backed A/B; no occlusion; touch44/no jump/drag; child skip; ghost example isolation; explicit storage; six primary controls; accessible tools; uniform outline and exact glyph centers at two zoom levels'});await context.close();
 }
}catch(e){if(activePage&&!activePage.isClosed())await activePage.screenshot({path:resolve(out,'failure.png'),fullPage:true}).catch(()=>{});await writeFile(resolve(out,'failure.txt'),String(e.stack||e));throw e;}
finally{await writeFile(resolve(out,'results.json'),JSON.stringify(results,null,2));await browser.close();await new Promise(r=>server.close(r));}
console.log(JSON.stringify(results,null,2));
