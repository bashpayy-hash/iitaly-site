import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(path.join(process.env.REVIEW_TOOLS,'playwright/index.mjs')).href);
const root = path.resolve('out'), destination = path.resolve('design-review/flight-explorers');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  const candidate=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(candidate!==root&&!candidate.startsWith(root+path.sep))return res.writeHead(403).end();
  for(const file of [candidate,candidate+'.html',path.join(candidate,'index.html')])try{if((await fs.stat(file)).isFile()){res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');return res.end(await fs.readFile(file));}}catch{}
  res.writeHead(404).end();
});
await fs.mkdir(destination,{recursive:true});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.REVIEW_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],results=[];
async function check(page,label){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,label+' overflow');
  await page.addScriptTag({path:path.join(process.env.REVIEW_TOOLS,'axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
  assert.deepEqual(violations,[],label+' accessibility');
}
try{
  for(const width of [1440,390,320]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/guides',{waitUntil:'networkidle'});
    await page.locator('[data-guide-select=codice]').click();
    await page.locator('[data-guide-preview=codice]').waitFor();
    assert.equal(new URL(page.url()).pathname,'/guides');assert.equal(new URL(page.url()).searchParams.get('topic'),'codice');
    await page.locator('[data-guide-select=codice]').press('ArrowUp');
    await page.locator('[data-guide-preview=permesso]').waitFor();
    await page.goBack();await page.locator('[data-guide-preview=codice]').waitFor();
    await page.reload({waitUntil:'networkidle'});await page.locator('[data-guide-preview=codice]').waitFor();
    await check(page,'Guides '+width);
    await page.locator('[data-guide-explorer]').screenshot({path:path.join(destination,`guides-${width}.png`)});
    await page.getByLabel('Найти тему',{exact:true}).fill('апостиль');
    assert((await page.locator('[data-guide-select]').count())>0);
    await page.getByRole('button',{name:'Сбросить поиск'}).click();
    await page.getByRole('button',{name:'После приезда',exact:true}).click();
    assert.equal(await page.locator('[data-guide-select]').count(),3);
    await page.locator('[data-guide-select=permesso]').click();
    await page.getByRole('link',{name:'Открыть подробный наглядный разбор'}).click();
    await page.waitForURL('**/guides/permesso');
    await page.goto(origin+'/guides#con',{waitUntil:'networkidle'});await page.waitForURL('**/guides/con');
    await page.goto(origin+'/universities',{waitUntil:'networkidle'});
    for(const id of ['unipd','unibo','polimi'])await page.locator(`[data-quick-compare=${id}]`).click();
    assert.equal(await page.locator('[data-deck-university]').count(),3);
    const rows=await page.locator('[data-deck-row=life]').evaluateAll(nodes=>nodes.map(n=>Math.round(n.getBoundingClientRect().top)));
    assert(rows.every(value=>value===rows[0]),'Deck metric rows must align');
    assert.equal(await page.locator('[data-comparison-deck] small').filter({hasText:'Ниже диапазон расходов'}).count(),2);
    await page.locator('[data-deck-choose=unibo]').click();
    assert.equal(await page.locator('[data-deck-university=unibo]').getAttribute('data-primary'),'true');
    await check(page,'Deck '+width);
    await page.locator('#compare-universities').scrollIntoViewIfNeeded();
    await page.locator('#compare-universities').screenshot({path:path.join(destination,`universities-${width}.png`)});
    await page.reload({waitUntil:'networkidle'});
    await page.locator('[data-deck-university=unibo][data-primary=true]').waitFor();
    await page.getByRole('button',{name:'Таблица',exact:true}).click();
    assert.equal(await page.locator('[data-university-comparison] [data-comparison-row]').count(),12);
    await page.getByLabel('Только различия').check();
    assert((await page.locator('[data-comparison-row]').count())<12);
    await page.getByRole('button',{name:'Сетка',exact:true}).click();
    await page.locator('[data-university-decision]').getByRole('link').click();
    await page.locator('[data-plan-university=unibo]').waitFor();
    assert.match(await page.locator('[data-plan-university-context]').innerText(),/Bologna/);
    await check(page,'Plan '+width);
    await page.screenshot({path:path.join(destination,`plan-${width}.png`),fullPage:true});
    // The aircraft follows actual tab positions, including the overflowing rail.
    for (let step = 0; step < 9; step++) {
      await page.locator('[data-plan-question] + div button[aria-pressed]').first().click();
      await page.waitForFunction(() => {
        const plane = document.querySelector('[data-plan-wizard] [data-flight-plane]')?.getBoundingClientRect();
        const stop = document.querySelector('[data-plan-wizard] [data-flight-selected=true]')?.getBoundingClientRect();
        return plane && stop && Math.abs(plane.x - stop.x) < 2;
      });
    }
    await check(page,'Plan last question '+width);
    await page.goto(origin+'/',{waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-scene-card]').count(),2);
    await page.getByRole('button',{name:'В Италии'}).click();
    await page.getByRole('button',{name:'Codice fiscale',exact:true}).click();
    assert.match(await page.locator('[data-scene-card]').nth(1).innerText(),/Официальный налоговый код/);
    await check(page,'Home '+width);
    await page.locator('[data-section=feature]').scrollIntoViewIfNeeded();
    await page.locator('[data-section=feature]').screenshot({path:path.join(destination,`scenes-${width}.png`)});
    results.push({width,guides:'selection, search, filters, history, deep links',deck:'three aligned cards, choice persistence, table, plan handoff',home:'two interactive scenes',accessibility:'passed'});
    await context.close();
  }
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(destination,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();server.close();}
