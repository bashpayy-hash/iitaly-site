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
    // Owner 2 Nov (apple.com home): every topic is a tile with its own
    // picture, «Подробнее» to the topic page and «Пошагово» to its first step.
    await page.goto(origin+'/guides',{waitUntil:'networkidle'});
    const tiles=page.locator('[data-guide-tile]');
    assert.equal(await tiles.count(),13);
    const art=await tiles.locator('img').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')));
    assert.equal(new Set(art).size,13,'Every topic has its own picture');
    // Owner 3 Nov (apple.com galleries): the topics go one after another in a
    // single row. Later the same day: «всё должно перераспределяться по всей
    // длине в зависимости от масштаба» — whole cards share the window width
    // (more cards on wider screens), none is cut at an edge.
    const tileBox=await tiles.first().boundingBox(),nextBox=await tiles.nth(1).boundingBox();
    assert(Math.abs(tileBox.y-nextBox.y)<1&&nextBox.x>tileBox.x+tileBox.width,'Topics go in one row');
    assert(Math.abs(tileBox.x-(width>760?32:20))<1,'The row starts at the window gutter');
    const cut=await tiles.evaluateAll((nodes,w)=>nodes.map(n=>n.getBoundingClientRect()).filter(r=>r.right>1&&r.left<w-1&&(r.left<-1||r.right>w+1)).length,width);
    assert.equal(cut,0,'No topic card is cut at the window edge');
    const visible=await tiles.evaluateAll((nodes,w)=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=w;}).length,width);
    assert(visible===(width>=1200?4:width>=900?3:width>=600?2:1),'Whole cards fill the width: '+visible);
    assert.equal(await page.locator('[data-carousel-dot]').count(),13,'One dot per topic');
    assert.equal(await page.locator('[data-carousel-dot][aria-current=true]').count(),1);
    // Reduced motion: the gallery stays put until the visitor presses play.
    assert.equal(await page.locator('[data-guide-carousel][data-playing]').count(),0);
    await page.locator('[data-carousel-dot="5"]').click();
    await page.waitForFunction(()=>{const t=document.querySelectorAll('[data-guide-tile]')[5];return Math.abs(t.getBoundingClientRect().left-(innerWidth>760?32:20))<2;});
    assert.equal(await page.locator('[data-carousel-dot="5"]').getAttribute('aria-current'),'true');
    await page.locator('[data-carousel-dot="0"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-guide-carousel] ul').scrollLeft===0);
    await check(page,'Guides '+width);
    await page.locator('[data-guide-tile=education]').screenshot({path:path.join(destination,`guides-${width}.png`)});
    await page.getByLabel('Найти тему',{exact:true}).fill('апостиль');
    assert((await page.locator('[data-guide-select]').count())>0);
    await page.getByRole('button',{name:'Сбросить поиск'}).click();
    await page.getByRole('button',{name:'После приезда',exact:true}).click();
    assert.equal(await page.locator('[data-guide-select]').count(),3);
    // Section pages: a compact row with previous/next arrows.
    const section=await context.newPage();section.on('pageerror',e=>errors.push(e.message));
    await section.goto(origin+'/guides/stages/prepare',{waitUntil:'networkidle'});
    const prev=section.locator('[data-carousel-prev]'),next=section.locator('[data-carousel-next]');
    assert(await prev.isDisabled()&&!(await next.isDisabled()),'Row starts at the first topic');
    await next.click();await section.waitForFunction(()=>document.querySelector('[data-guide-carousel] ul').scrollLeft>0);
    // The arrows follow the scroll position one frame later; wait for the state, not just the scroll (CI, 5 Nov).
    await section.waitForFunction(()=>!document.querySelector('[data-carousel-prev]').disabled);
    assert(!(await prev.isDisabled()));
    await check(section,'Guide section '+width);
    await section.close();
    // Step pages and old links are walked in a side tab that waits for URLs and
    // elements: quick in-page navigation leaves Next's background route checks
    // in flight, and a later network-idle wait on that tab could hang (PR #145).
    // «Подробнее» leads to the topic page (clicking tiles is covered by the
    // guides-vespi and UX reviews); the side tab starts there, hydrated.
    assert.equal(await page.locator('[data-guide-select=permesso]').getAttribute('href'),'/guides/permesso');
    const nav=await context.newPage();nav.on('pageerror',e=>errors.push(e.message));
    await nav.goto(origin+'/guides/permesso',{waitUntil:'networkidle'});
    // The topic page is a row of step cards; each step has its own page.
    const steps=nav.locator('[data-guide-step-card]');
    await steps.first().waitFor();
    assert((await steps.count())>1);
    // Owner, 4 Nov (phone screenshot): no «Шаг 01»-style labels or big numerals;
    // each card shows its pips, title and the first sentence of the step.
    assert.equal(await steps.locator('[data-step-pips]').count(),await steps.count(),'Every step card shows its pips');
    assert.doesNotMatch(await nav.locator('[data-guide-steps-row]').innerText(),/Шаг \d|\b0\d\b/,'Cards carry titles and teasers, not numerals');
    await steps.nth(1).click();await nav.waitForURL('**/guides/permesso/2');
    await nav.locator('[data-instruction-point="2"]').waitFor();
    assert.doesNotMatch(await nav.locator('article').innerText(),/Шаг 0\d|\bиз 0\d\b/,'The step page names the topic and the neighbouring steps, not zero-padded numbers');
    await check(nav,'Guide step '+width);
    await nav.locator('[data-guide-step-next]').click();await nav.waitForURL('**/guides/permesso/3');
    await nav.locator('[data-guide-step-prev]').click();await nav.waitForURL('**/guides/permesso/2');
    // Old links redirect after hydration: /guides#con and the former inspector's ?topic=.
    await nav.goto(origin+'/guides#con',{waitUntil:'domcontentloaded'});await nav.waitForURL('**/guides/con');await nav.locator('[data-guide-panel=con]').waitFor();
    await nav.goto(origin+'/guides?topic=codice',{waitUntil:'domcontentloaded'});await nav.waitForURL('**/guides/codice');await nav.locator('[data-guide-panel=codice]').waitFor();
    await nav.close();
    await page.goto(origin+'/universities',{waitUntil:'networkidle'});
    for(const id of ['unipd','unibo','polimi'])await page.locator(`[data-quick-compare=${id}]`).click();
    assert.equal(await page.locator('[data-deck-university]').count(),3);
    // Layout rows (offsetTop): the arc tilts side cards on purpose; the rows stay level.
    const rows=await page.locator('[data-deck-row=life]').evaluateAll(nodes=>nodes.map(n=>n.offsetTop));
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
    // Owner, 4 Nov: «прогресс-бар вообще убери» — nothing above the question
    // tile; each answer advances the questionnaire, which the tile's own
    // step label and the accessible progress value both report.
    assert.equal(await page.locator('[data-plan-wizard] [data-flight-plan], [data-plan-wizard] [data-flight-stop]').count(),0,'No progress bar over the questionnaire');
    for (let step = 0; step < 9; step++) {
      await page.locator('[data-plan-question] + div button[aria-pressed]').first().click();
      await page.waitForFunction(expected => Number(document.querySelector('[data-plan-wizard] [role=progressbar]')?.getAttribute('aria-valuenow')) === expected, step + 1);
      assert.match(await page.locator('[data-plan-step]').innerText(),new RegExp(`^Вопрос ${step + 2} из 10`,'i'),'The tile names its question number');
    }
    await check(page,'Plan last question '+width);
    await page.goto(origin+'/',{waitUntil:'networkidle'});
    // Owner, 3 Nov: the two scenes show their three themes at once as flat
    // tiles with the theme's object, not a dark window with switches and not
    // landscape photos (those belong in the cabinet).
    assert.equal(await page.locator('[data-scene-card]').count(),2);
    assert.equal(await page.locator('[data-scene-card] [data-scene-photo]').count(),6,'Three theme tiles per scene');
    assert.equal(await page.locator('[data-scene-card] button').count(),0,'Nothing to switch: every theme is visible');
    assert.match(await page.locator('[data-scene-card]').nth(1).innerText(),/Официальный налоговый код/);
    // The card images are lazy: bring the scenes on screen and decode them before checking.
    await page.locator('[data-section=feature]').scrollIntoViewIfNeeded();
    await page.evaluate(async()=>{const images=[...document.querySelectorAll('[data-scene-card] img')];for(const img of images)img.loading='eager';await Promise.all(images.map(img=>img.decode().catch(()=>{})));});
    assert.equal(await page.locator('[data-scene-card] [data-scene-photo] img').evaluateAll(nodes=>nodes.filter(img=>!img.complete||img.naturalWidth===0).length),0,'Theme objects load');
    assert.equal(await page.locator('[data-scene-card] [data-scene-object]').count(),6,'Every card shows its theme object (owner, 3 Nov)');
    assert.equal(await page.locator('[data-scene-card] img[src*="landscapes"]').count(),0,'Navigation cards carry no landscape photo (owner, 3 Nov: Vespi scenes belong in the cabinet)');
    assert.equal(await page.locator('[data-scene-photo=codice]').getAttribute('href'),'/guides/codice');
    await check(page,'Home '+width);
    await page.locator('[data-section=feature]').scrollIntoViewIfNeeded();
    await page.locator('[data-section=feature]').screenshot({path:path.join(destination,`scenes-${width}.png`)});
    results.push({width,guides:'tiles with own art, search, filters, step pages, old deep links',deck:'three aligned cards, choice persistence, table, plan handoff',home:'two scenes of three flat theme tiles with objects, no landscapes',accessibility:'passed'});
    await context.close();
  }
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(destination,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();server.close();}
