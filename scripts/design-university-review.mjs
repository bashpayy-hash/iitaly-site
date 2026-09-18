import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const output = resolve('design-review/university-refresh');
await mkdir(output, { recursive: true });
const results = [], errors = [];
const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.ico':'image/x-icon' };
function serve(root, port) {
  root = resolve(root);
  const server = createServer(async (request,response) => {
    try {
      const path = resolve(root, `.${decodeURIComponent(new URL(request.url,'http://localhost').pathname)}`);
      if (path !== root && !path.startsWith(root+sep)) { response.writeHead(403).end(); return; }
      for (const file of [path,`${path}.html`,resolve(path,'index.html')]) if (await stat(file).then(s=>s.isFile()).catch(()=>false)) {
        response.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});response.end(await readFile(file));return;
      }
      response.writeHead(404).end();
    } catch { response.writeHead(500).end(); }
  });
  return new Promise(done=>server.listen(port,'127.0.0.1',()=>done(server)));
}
const servers = [await serve('out',4183),await serve(process.env.BASELINE_OUT,4184)];
const browser = await chromium.launch();
async function context(width) {
  const ctx = await browser.newContext({viewport:{width,height:960},deviceScaleFactor:1,reducedMotion:'reduce',locale:'ru-RU'});
  await ctx.route('**/*',route=>['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname)||route.request().url().startsWith('data:')?route.continue():route.abort());
  ctx.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  return ctx;
}
async function visit(page,port=4183) {
  assert.equal((await page.goto(`http://127.0.0.1:${port}/universities`,{waitUntil:'networkidle'})).status(),200);
  await page.waitForFunction(()=>document.querySelector('#compare-universities')?.getAttribute('data-comparison-ready')==='true');
  await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
}
const mapName='Карта Италии с университетами по городам';
async function pick(page,label) {
  const pin=page.getByRole('img',{name:mapName}).getByRole('button',{name:label,exact:true});
  await pin.focus();await pin.press('Enter');
  await page.waitForFunction(label=>[...document.querySelectorAll('svg [role="button"]')].some(el=>el.getAttribute('aria-label')===label&&el.getAttribute('aria-pressed')==='true'),label);
}
async function panelData(page,label) {
  const name=label.replace(' — показать университеты','');
  const panel=page.getByRole('heading',{name,exact:true}).locator('..').locator('..');
  return panel.locator('button').evaluateAll(nodes=>nodes.map(el=>el.textContent.trim().replace(/\s+/g,' ')));
}
async function resultText(page) {
  // innerText includes CSS text-transform (the old design used uppercase).
  // Compare the exact DOM wording and numbers, normalizing whitespace only.
  // The separate control assertions below still verify the new presentation.
  const text=await page.locator('#main [aria-live="polite"]').first().textContent();
  assert.notEqual(text,null,'Filter result summary exists');
  return text.trim().replace(/\s+/g,' ');
}
async function noOverflow(page,where) {
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,where);
}
let activePage;
try {
  const ctx=await context(1440),head=await ctx.newPage(),base=await ctx.newPage();
  activePage=head;
  await visit(head);await visit(base,4184);
  const labels=await base.getByRole('img',{name:mapName}).locator('[role="button"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')));
  assert.equal(labels.length,30);
  for(const label of labels) {
    await pick(base,label);await pick(head,label);
    assert.deepEqual(await panelData(head,label),await panelData(base,label),label+': same universities and types');
  }
  results.push({test:'All 30 keyboard city selections return the same university cards as base',passed:true});
  const milan='Милан — показать университеты';
  await pick(base,milan);await pick(head,milan);
  for(const type of ['Все вузы','Государственные','Частные','Технические']) for(const eng of [false,true]) {
    for(const p of [base,head]) {
      await p.getByRole('button',{name:type,exact:true}).click();
      const toggle=p.getByRole('button',{name:'На английском',exact:true});
      if((await toggle.getAttribute('aria-pressed')==='true')!==eng)await toggle.click();
      await p.waitForFunction(({type,eng})=>{
        const buttons=[...document.querySelectorAll('button')];
        return buttons.some(el=>el.textContent.trim()===type&&el.getAttribute('aria-pressed')==='true')&&buttons.some(el=>el.textContent.trim()==='На английском'&&(el.getAttribute('aria-pressed')==='true')===eng);
      },{type,eng});
    }
    assert.equal(await resultText(head),await resultText(base),`${type}, English ${eng}: identical result content`);
    assert.deepEqual(await panelData(head,milan),await panelData(base,milan));
  }
  results.push({test:'All eight type/English filter combinations match base counts and Milan cards',passed:true});
  await ctx.close();
  for(const width of [1440,1280,1024,768,390,320]) {
    const ctx=await context(width),page=await ctx.newPage();activePage=page;
    const imageRequests=[];
    page.on('request',r=>{if(r.resourceType()==='image')imageRequests.push(r.url());});
    await visit(page);await noOverflow(page,`initial ${width}`);
    assert.equal(await page.locator('.paper-layer-global').count(),0);
    assert.equal(await page.locator('[data-university-page]').count(),1);
    assert.equal(await page.getByRole('link',{name:'IITALY — главная',exact:true}).count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('lenis')),false);
    for(const art of await page.locator('[data-university-art]').all()) {
      assert(await art.isVisible());
      assert(await art.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0));
      const overlaps=await art.evaluate(el=>{
        const a=el.getBoundingClientRect();
        return [...el.closest('section').querySelectorAll('h1,h2,p,button,select')].some(node=>{
          const b=node.getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
        });
      });
      assert.equal(overlaps,false,`${width}: artwork has its own space`);
    }
    assert.equal(imageRequests.some(url=>/\/illustrations\/(venice|coast|rome)-/.test(url)),false,'Old illustrations are not requested');
    const filters=page.getByRole('group',{name:'Тип университета'}).getByRole('button');
    for(const button of await filters.all()) {
      const style=await button.evaluate(el=>{const s=getComputedStyle(el);return {border:s.borderTopWidth,radius:parseFloat(s.borderRadius),case:s.textTransform,height:el.getBoundingClientRect().height};});
      assert.equal(style.border,'1px');assert(style.radius>=980);assert.equal(style.case,'none');assert(style.height>=40);
    }
    if([1440,390,320].includes(width))await page.screenshot({path:resolve(output,`universities-${width}.png`),animations:'disabled'});
    if(width===1440)await page.locator('[data-city-empty]').screenshot({path:resolve(output,'city-empty-1440.png'),animations:'disabled'});
    const menu=page.getByLabel('Открыть меню');
    if(await menu.isVisible()) {await menu.click();assert(await page.getByRole('navigation',{name:'Мобильная навигация'}).isVisible());await page.keyboard.press('Escape');assert.equal(await page.getByRole('navigation',{name:'Мобильная навигация'}).isVisible(),false);}
    await pick(page,milan);await noOverflow(page,`Milan ${width}`);
    const card=page.locator('[data-uni-card="bocconi"]');
    assert(await card.isVisible());
    assert.equal(await card.evaluate(el=>getComputedStyle(el).borderTopWidth),'1px');
    if([1440,390].includes(width))await page.locator('[data-city-panel]').screenshot({path:resolve(output,`city-milan-${width}.png`),animations:'disabled'});
    await card.getByRole('checkbox',{name:'Сравнить',exact:true}).check();
    assert.equal(await page.locator('#compare-universities select').first().inputValue(),'bocconi');
    await card.getByRole('button').click();
    const modal=page.getByRole('dialog',{name:'Bocconi',exact:true});
    assert(await modal.isVisible());
    assert.equal(await modal.evaluate(el=>getComputedStyle(el).borderTopWidth),'1px');
    if([1440,390].includes(width))await page.screenshot({path:resolve(output,`university-details-${width}.png`),animations:'disabled'});
    await page.keyboard.press('Escape');assert.equal(await modal.count(),0);
    await page.locator('#compare-universities').getByRole('button',{name:'Очистить выбор',exact:true}).click();
    await page.getByRole('button',{name:'Подобрать город под ритм',exact:true}).click();
    const picker=page.getByRole('dialog',{name:'Подбор города под ритм',exact:true});
    for(let i=0;i<4;i++)await picker.locator('ul button').first().click();
    await picker.getByRole('button',{name:'Открыть на карте',exact:true}).first().click();
    assert.equal(await picker.count(),0);
    await page.getByRole('button',{name:'Показать все города',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Показать все города',exact:true}).count(),0);
    await noOverflow(page,`after picker ${width}`);
    results.push({test:`${width}px: new local artwork, thin pill controls, no overlap/overflow, city details, linked comparison, picker and menu`,passed:true});
    await ctx.close();
  }
  assert.deepEqual(errors,[]);
} catch(error) {
  errors.push(error.stack||error.message);
  if(activePage&&!activePage.isClosed())await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});
  throw error;
} finally {
  await writeFile(resolve(output,'results.json'),JSON.stringify({results,errors},null,2));
  await browser.close();await Promise.all(servers.map(s=>new Promise(done=>s.close(done))));
}
console.log(JSON.stringify(results,null,2));
