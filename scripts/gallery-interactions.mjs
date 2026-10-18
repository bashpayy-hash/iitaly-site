import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.REVIEW_TOOLS||'/tmp/iitaly-browser/node_modules','playwright'));
const root=resolve('out'),output=resolve('design-review/gallery-interactions');
await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.txt':'text/plain'};
const browser=await chromium.launch();const results=[];
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});
  const calls=[],errors=[];
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.hostname!=='gallery.test') {
    if(u.pathname==='/health/ai'||u.pathname==='/api/event')return route.fulfill({json:{ok:true,code:'AI_READY'}});
    calls.push({path:u.pathname,body:route.request().postDataJSON()});
    if(u.pathname==='/api/chat')return route.fulfill({json:{reply:'Синтетический ответ без обращения к модели.'}});
    return route.abort();
   }
   const path=resolve(root,'.'+decodeURIComponent(u.pathname));
   for(const f of [path,path+'.html',path+'/index.html'])if(await stat(f).then(v=>v.isFile()).catch(()=>false))return route.fulfill({contentType:mime[extname(f)]||'application/octet-stream',body:await readFile(f)});
   return route.fulfill({status:404,body:'missing'});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  async function visit(path){await page.goto('https://gallery.test'+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);}
  async function noOverflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
  await visit('/');
  const tab=page.getByRole('tab',{name:'Документы',exact:true});await tab.focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:'DSU',exact:true}).getAttribute('aria-selected'),'true');
  assert.match(await page.getByRole('tabpanel').innerText(),/ISEEU/);
  await page.keyboard.press('ArrowRight');assert.match(await page.getByRole('tabpanel').innerText(),/Universitaly/);
  const menu=page.locator('header summary');await menu.click();
  const nav=page.getByRole('navigation',{name:'Основная навигация',exact:true});
  assert.equal(await nav.getByRole('link').count(),5);await noOverflow();
  await page.keyboard.press('Escape');assert.equal(await menu.evaluate(e=>e.parentElement.open),false);
  await menu.click();await nav.getByRole('link',{name:'Гайды и виза',exact:false}).click();
  await page.locator('[data-guide-scenario]').first().waitFor();
  assert.equal(await page.locator('[data-guide-scenario]').count(),4);
  const routes={education:['education','tests','minors','military'],documents:['apostille','translation','cimea'],scholarship:['con','iseeu'],visa:['visa','permesso','codice','health-travel']};
  const seen=new Set();
  for(const [id,topics]of Object.entries(routes)){
   await visit('/guides');await page.locator(`[data-guide-scenario="${id}"]`).click();
   for(let index=0;index<topics.length;index++){
    const topic=topics[index];seen.add(topic);const article=page.locator(`[data-guide-panel="${topic}"]`);await article.waitFor();
    assert.equal(await page.locator('[data-guide-panel]').count(),1);assert.equal(new URL(page.url()).hash,'#'+topic);
    assert(await article.locator('a[target="_blank"]').count()>0,'Every article retains official sources');
    await page.waitForFunction(id=>document.querySelector(`[data-guide-panel="${id}"] h2`)===document.activeElement,topic,{timeout:5000}); // Focus is intentionally assigned on the next animation frame.
    await noOverflow();
    if(index===0){await page.addScriptTag({path:resolve(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});const issues=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));assert.deepEqual(issues,[],`${id} guide accessible`);}
    if(index<topics.length-1)await article.getByRole('button',{name:/^Далее:/}).click();
    else assert.equal(await article.getByRole('link',{name:'Перейти к своему плану',exact:true}).getAttribute('href'),'/plan#questionnaire');
   }
  }
  assert.equal(seen.size,13);assert.equal(calls.length,0,'Reading never sends AI, payment or protected account requests');
  await visit('/guides#apostille');await page.locator('[data-guide-panel="apostille"]').waitFor();
  await page.getByRole('button',{name:/^Далее:/}).click();await page.locator('[data-guide-panel="translation"]').waitFor();
  await page.goBack();await page.locator('[data-guide-panel="apostille"]').waitFor();
  await page.goForward();await page.locator('[data-guide-panel="translation"]').waitFor();
  await page.screenshot({path:resolve(output,`guide-reading-${width}.png`),fullPage:true});
  await page.getByRole('button',{name:'Открыть ИИ-помощника',exact:true}).click();
  await page.locator('[data-chat-guide-context="translation"]').waitFor();
  await page.getByRole('link',{name:'Что проверить в переводе для вуза и для визы?',exact:true}).click();
  assert.equal(calls.length,0,'Suggested question only prefills');
  await page.getByRole('button',{name:'Отправить',exact:true}).click();
  await page.getByText('Синтетический ответ без обращения к модели.',{exact:true}).waitFor();
  assert.equal(calls.length,1);assert.match(JSON.stringify(calls[0].body),/translation/);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Изменить ситуацию',exact:true}).click();
  await page.getByText('Найти конкретную тему',{exact:true}).click();
  await page.getByRole('searchbox').fill('CIMEA');await page.getByRole('button',{name:/DoV, CIMEA/}).click();
  await page.locator('[data-guide-panel="cimea"]').waitFor();
  await visit('/universities');
  const cities=page.getByRole('group',{name:'Карта Италии с университетами по городам',exact:true}).getByRole('button');
  assert.equal(await cities.count(),30);
  for(let i=0;i<await cities.count();i++){await cities.nth(i).focus();await page.keyboard.press('Enter');assert.equal(await cities.nth(i).getAttribute('aria-pressed'),'true');}
  await noOverflow();assert.deepEqual(errors,[]);
  results.push({width,previewKeyboard:true,oneHeaderMenu:true,guideTopics:seen.size,guideHistoryAndFocus:true,guideContextExplicitSend:true,allMapCities:30});
  await context.close();
 }
 // Test motion and crossing room boundaries separately from reduced-motion captures.
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='gallery.test')return route.fulfill({json:{ok:true}});const path=resolve(root,'.'+u.pathname);for(const f of [path,path+'.html',path+'/index.html'])if(await stat(f).then(v=>v.isFile()).catch(()=>false))return route.fulfill({contentType:mime[extname(f)]||'application/octet-stream',body:await readFile(f)});return route.fulfill({status:404,body:''});});
 const page=await context.newPage();await page.goto('https://gallery.test/',{waitUntil:'networkidle'});
 await page.locator('h1.gallery-revealed').waitFor();
 await page.evaluate(()=>window.scrollTo({top:document.querySelector('[data-gallery-room="ink"]').offsetTop+100,behavior:'instant'}));
 await page.waitForFunction(()=>document.querySelector('[data-gallery-header]').getAttribute('data-inverted')==='true');
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.waitForFunction(()=>document.querySelector('[data-gallery-header]').getAttribute('data-inverted')==='false');
 await page.locator('[data-gallery-parallax]').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('[data-gallery-parallax]').style.getPropertyValue('--painting-shift')!=='');
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('.gallery-motion-ready').count(),0,'Reduced motion does not hide titles or add parallax');
 await context.close();
 await writeFile(resolve(output,'results.json'),JSON.stringify({results,motionAndHeader:true},null,2));
 console.log(JSON.stringify({results,motionAndHeader:true},null,2));
}finally{await browser.close();}
