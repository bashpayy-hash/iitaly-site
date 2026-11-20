import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = process.env.REVIEW_TOOLS
  ? require(resolve(process.env.REVIEW_TOOLS, 'playwright')) : require('playwright');
const root = resolve('out'), output = resolve('design-review/admissions');
await mkdir(output, {recursive:true});
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.txt':'text/plain','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
const server = createServer(async (req,res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return res.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path,'index.html')]) {
      if (await stat(file).then(s=>s.isFile()).catch(()=>false)) {
        res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'});
        return res.end(await readFile(file));
      }
    }
    res.writeHead(404).end();
  } catch {res.writeHead(500).end();}
});
await new Promise(done => server.listen(0,'127.0.0.1',done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.REVIEW_CHROMIUM ? {executablePath:process.env.REVIEW_CHROMIUM,args:["--no-sandbox","--disable-dev-shm-usage"]} : {});
const errors = [];
try {
  for (const width of [1440,390,320]) {
    const context = await browser.newContext({viewport:{width,height:900}, reducedMotion:'reduce', locale:'ru-RU'});
    // No production API calls, payment requests or submitted contacts in this review.
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', e=>errors.push(e.message));
    async function visit(route) {
      const response = await page.goto(origin+route,{waitUntil:'networkidle'});
      if (response) assert.equal(response.status(),200);
      else assert(route.includes('#'),'Only same-document hash navigation has no response');
      await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth+1),false,route+' overflow at '+width);
    }
    for (const route of ['/','/changes-2026-27','/plan']) await visit(route);
    assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuemax'),'10');
    const choices = ['Осенью 2027','11 классов','4,7 и выше','Бакалавриат','Без стипендии будет сложно',
      'Экономика, бизнес','Есть IELTS или TOEFL','Ещё не будет 18','В Казахстане','Уже знаю регион или вуз','Пьемонт · EDISU'];
    for (const choice of choices) await page.getByRole('button').filter({hasText:choice}).click();
    await page.getByRole('button',{name:'Открыть мой план',exact:true}).click();
    const routeStops=page.locator('[data-plan-path] [data-plan-path-step]');
    await routeStops.first().waitFor();
    const count=await routeStops.count();
    // Owner, 20 Nov (screenshot of the plan): «очень громоздкие, большие
    // степы… не даёт понять весь масштаб пути»; the same evening, iPad:
    // «неровный и корявый… делай блочно, как на лендинге». The route is one
    // bento tray of step cells: every row runs from edge to edge (no holes),
    // only the next step may stand alone in its row, and the whole route
    // fits about one desktop screen. Each step opens on its own page.
    { const layout=await page.locator('[data-plan-path-grid]').evaluate(grid=>{
        const box=grid.getBoundingClientRect(), pad=parseFloat(getComputedStyle(grid).paddingLeft);
        const cells=[...grid.querySelectorAll('[data-plan-path-step]')].map(cell=>{const r=cell.getBoundingClientRect();return {n:+cell.dataset.planPathStep,state:cell.dataset.state,phase:cell.dataset.phase,left:r.left-box.left,right:box.right-r.right,top:Math.round(r.top+scrollY)};});
        const rows=[];for(const cell of cells){const row=rows.find(item=>Math.abs(item.top-cell.top)<2);if(row)row.cells.push(cell);else rows.push({top:cell.top,cells:[cell]});}
        return {pad,cells,rows:rows.map(row=>({top:row.top,left:Math.min(...row.cells.map(c=>c.left)),right:Math.min(...row.cells.map(c=>c.right)),cells:row.cells.map(c=>({n:c.n,state:c.state}))}))};
      });
      for (let i=1;i<layout.rows.length;i++) assert(layout.rows[i].top>layout.rows[i-1].top,'Rows go down the page');
      assert.deepEqual(layout.cells.map(c=>c.n),layout.cells.map((_,i)=>i+1),'Steps keep the plan order');
      for (const row of layout.rows) {
        assert(Math.abs(row.left-layout.pad)<1.5&&Math.abs(row.right-layout.pad)<1.5,`Row at ${row.top} runs edge to edge (${row.left}/${row.right})`);
        // On a phone the tray is one column: every row is a single cell by design.
        if (row.cells.length===1&&layout.rows.some(other=>other.cells.length>1)) assert.equal(row.cells[0].state,'current','Only the next step stands alone in its row');
      }
      if (width>=1024) assert((await page.locator('[data-plan-path]').boundingBox()).height<=900,'The whole route fits about one desktop screen');
      assert.deepEqual(await routeStops.evaluateAll(els=>els.map(el=>el.getAttribute('href'))),layout.cells.map((_,i)=>`/plan/${i+1}`),'Every step links to its own page');
      const phases=layout.cells.map(c=>c.phase).filter((phase,i,all)=>phase!==all[i-1]);
      assert.equal(phases[0],'Документы','The route starts with the education documents');
      assert.equal(phases.at(-1),'После приезда','The route ends after arrival');
      assert.equal(new Set(phases).size,phases.length,'Each stage appears once, in order'); }
    // Before payment (owner, 5 Nov): the first step opens in full, every later
    // step shows its title, one orienting line and the purchase.
    assert.equal(await page.locator('[data-plan-path-step][data-state=locked]').count(),count-1,'Every step after the first is locked');
    assert.equal(await page.locator('[data-plan-path-step="1"]').getAttribute('data-state'),'current','The first step is where to start');
    assert.match(await page.locator('[data-plan-path-count]').innerText(),new RegExp(`Разобрано 0 из ${count}`));
    const chapters=[await page.locator('main').textContent()];
    for (let index=0;index<count;index++) {
      await visit(`/plan/${index+1}`);
      const point=page.locator('[data-plan-step]');
      await point.waitFor();
      assert.equal(await point.getAttribute('data-plan-step'),String(index+1));
      if (index===0) { assert.equal(await point.locator('[data-assessment-next-action]').count(),1,'The first step shows its action and sources'); assert.equal(await point.locator('[data-wall-buy]').count(),0); }
      else { assert.equal(await point.locator('[data-wall-buy][data-wall-place="plan-step"]').count(),1,`Step ${index+1} shows the wall`); assert.equal(await point.locator('[data-assessment-next-action], details').count(),0,`Step ${index+1} hides its action and sources`); assert.match(await point.locator('[data-wall-buy]').innerText(),/10\s990\s₸/); }
      chapters.push(await point.textContent());
    }
    const result=chapters.join(' ');
    assert.match(result,/компенсацию 11-летней школы/);
    assert.match(result,/Документы несовершеннолетнего/);
    assert.match(result,/региональная стипендия с отдельной заявкой/,'A locked step keeps its orienting line');
    assert.doesNotMatch(result,/годы справок пока не назначаем/,'Locked requirements stay behind the wall');
    // The opened step is marked on the path; progress is counted.
    await visit('/plan#route');
    await page.locator('[data-plan-path]').waitFor();
    assert.equal(await page.locator('[data-plan-path-step="1"]').getAttribute('data-state'),'done','The read step turns green on the path');
    assert.match(await page.locator('[data-plan-path-count]').innerText(),new RegExp(`Разобрано 1 из ${count}`));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth+1),false,'Plan result overflow at '+width);
    await page.screenshot({path:resolve(output,`plan-${width}.png`),fullPage:true});
    for (const id of ['cimea','iseeu','visa']) {
      await visit('/guides#'+id);
      const body = page.locator(`[data-guide-panel="${id}"]`);
      // Same-document goto resolves before hashchange + React + the next frame.
      // Wait for the visible chapter, not font loading or an arbitrary delay.
      await body.waitFor({state:'visible'});
      const titles = {cimea:'DoV, CIMEA и ARDI', iseeu:'DSU и ISEEU', visa:'Виза D'};
      await body.getByRole('heading',{name:titles[id],exact:true}).waitFor({state:'visible'});
      assert.equal(await page.locator('[data-guide-timeline],[data-guide-select]').count(),0,'Reading has no repeated topic directory');
      assert.equal(await page.locator('[data-guide-panel]').count(),1,'One selected topic is shared across viewports');
      assert.equal(new URL(page.url()).pathname,'/guides/'+id);
      // User request 2026-10-18: one shared rules date in the guide header,
      // rather than a duplicate inside every selected article. Each article
      // must still expose its own real official sources below.
      const verified = page.locator('main time');
      assert.equal(await verified.count(),1,'Guides expose one shared verification date');
      assert.equal(await verified.getAttribute('datetime'),'2026-10-09');
      assert.match(await verified.innerText(),/9 октября 2026/);
      assert(await body.locator('a[href^="https://"]').count()>0,'Official sources are accessible');
      if (id==='visa') {
        // User-requested card UI has one topic body, so there is no hidden
        // mobile disclosure whose delayed toggle can overwrite the deep link.
        await page.locator('[data-visa-part=funds]').click();await page.locator('[data-guide-part=funds]').waitFor();
        const rate = body.getByLabel('Твой курс банка: тенге за €1');
        assert.equal(await rate.inputValue(),'');
        await rate.fill('550');
        assert.match(await body.innerText(),/5[\s\u00a0]598[\s\u00a0]918/);
        await rate.fill('-1');
        assert(await body.getByText('Укажи курс',{exact:true}).isVisible());
        await rate.fill('550,5');
        assert.doesNotMatch(await body.innerText(),/NaN|Infinity/);
        await page.screenshot({path:resolve(output,`visa-${width}.png`),fullPage:width>=1024});
      }
    }
    await context.close();
  }
  assert.deepEqual(errors,[],'Browser runtime errors');
  console.log('Admissions browser review passed at 1440, 390 and 320px: quiz, sources, deep links, annual calculator, no overflow/runtime errors.');
} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
}
