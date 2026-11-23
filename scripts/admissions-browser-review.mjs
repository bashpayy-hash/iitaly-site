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
    const choices = ['Бакалавриат','Осенью 2027','11 классов','4,7 и выше','Без стипендии будет сложно',
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

    // The master's track. Owner, 23 Nov: «подруга сказала, что когда она нажала
    // на магистратуру, дальше идут все равно вопросы, будто она школьница…
    // сделать для магистратуры отдельный трек со всеми особенностями». A fresh
    // visitor answers «Магистратура» and is then asked about her diploma,
    // its profile and her GPA; nothing about school or being 18.
    // The same evening, on the first version: «если когда человек в вопросе
    // первоначально нажимает на магистратуру, ты должен понять, что это уже
    // магистратура… не должны быть такие детского формата вопросы, это уже
    // серьезный человек, который закончил или заканчивает бакалавр». The
    // level is the first tap, and every later screen is worded for a graduate.
    { const context = await browser.newContext({viewport:{width,height:900}, reducedMotion:'reduce', locale:'ru-RU'});
      await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on('pageerror', e=>errors.push(e.message));
      await page.goto(origin+'/plan',{waitUntil:'networkidle'});
      const tile = page.locator('[data-plan-tile]');
      const asked = [];
      const answer = async choice => {
        // The folded «Зачем спрашиваю» is part of the screen: read the document.
        asked.push({id:await tile.getAttribute('data-plan-tile'), question:(await tile.locator('h2').innerText()).replace(/\s+/g,' '), label:await tile.locator('[data-plan-step]').innerText(), words:(await tile.textContent()).replace(/\s+/g,' ')});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth+1),false,`Master's question ${asked.length} overflow at ${width}`);
        await tile.getByRole('button').filter({hasText:choice}).click();
      };
      for (const choice of ['Магистратура','Да, диплом на руках','Нет, меняю направление','Инженерия, IT','3,0 – 3,4','Осенью 2027','Есть IELTS, TOEFL или другой сертификат','До 3 млн ₸ в год','В Казахстане','Пока не знаю']) await answer(choice);
      assert.deepEqual(asked.map(item=>item.id),['goal','education','major','field','grades','intake','lang','budget','residence','dsuRegion'],'The level first, then the master\'s own questions, in order');
      assert.equal(asked[0].label,'Вопрос 1 из 10 · Уровень');
      assert.equal(asked[1].label,'Вопрос 2 из 10 · Диплом','The second screen already speaks to a graduate');
      assert.deepEqual(asked.slice(1,9).map(item=>item.question),['Диплом бакалавра уже получен?','Магистратура по профилю диплома?','Какое направление магистратуры?','Какой средний балл диплома (GPA)?','Когда планируешь начать магистратуру?','Чем подтверждаешь язык обучения?','Какой бюджет на год учёбы и жизни?','В какой стране живёшь постоянно?']);
      assert.match(asked[4].words,/шкале 4,0/,'Grades are asked on the university scale');
      assert.doesNotMatch(asked.slice(1).map(item=>item.words).join(' '),/11 классов|NIS|Колледж|школ|аттестат|будет 18|несовершеннолетн|4,7 и выше|отличник|хорошист|подтягивать|семья может|поможем выбрать/i,'After the first tap nothing is worded for a school leaver');
      await page.getByRole('button',{name:'Открыть мой план',exact:true}).waitFor();
      assert.doesNotMatch(await page.locator('[data-plan-finished]').textContent(),/меньше 18/,'A graduate is not asked to fill the form with a guardian');
      await page.getByRole('button',{name:'Открыть мой план',exact:true}).click();
      const stops = page.locator('[data-plan-path] [data-plan-path-step]');
      await stops.first().waitFor();
      const route = (await stops.allInnerTexts()).join(' ').replace(/\s+/g,' ');
      assert.match(route,/Проверь доступ в магистратуру/);
      assert.match(route,/Сверь предметы диплома с программой/,'Changing the field adds its own step');
      assert.match(route,/Выбери программу и узнай, как она отбирает/);
      assert.doesNotMatch(route,/11-летн|тест и язык|до 18 лет/,'No school steps on the master\'s route');
      await page.goto(origin+'/plan/1',{waitUntil:'networkidle'});
      const first = page.locator('[data-plan-step]');
      await first.waitFor();
      // The conditions and sources are a folded part of the page: read the document, not the screen.
      assert.match(await first.textContent(),/120 кредитов/,'The first step opens in full');
      assert(await first.locator('a[href^="https://"]').count()>0,'Its official sources are linked');
      // The level changed in the list of answers leads through the other
      // track's own questions; answers both tracks share are kept.
      await page.goto(origin+'/plan?answers=1',{waitUntil:'networkidle'});
      await page.locator('[data-plan-answers]').waitFor();
      assert.equal(await page.locator('[data-plan-answer]').count(),10,'Ten answers of the master\'s track');
      assert.equal(await page.locator('[data-plan-answer=age]').count(),0);
      await page.locator('[data-plan-answer=goal]').click();
      await page.locator('[data-plan-answer-edit=goal]').getByRole('button').filter({hasText:'после школы'}).click();
      await tile.waitFor();
      // «Диплом на руках» is an answer of both tracks, so it stays; the
      // bachelor's track still has to ask what the master's never does.
      assert.equal(await tile.getAttribute('data-plan-tile'),'age','The bachelor\'s own question is asked once the level changes');
      const kept = await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')));
      assert.equal(await page.locator('[data-plan-path]').count(),0,'The plan waits for the new track\'s answers');
      assert.equal(kept.answers.goal,'Бакалавриат');
      assert.equal(kept.answers.budget,'До 3 млн ₸/год','A shared answer is kept');
      assert.equal(kept.answers.education,'Бакалавр','The diploma is an answer of both tracks');
      // And back: a school answer does not stay in a master's draft.
      await page.evaluate(()=>localStorage.setItem('iitaly_plan_draft_v1',JSON.stringify({answers:{intake:'2027/28',goal:'Магистратура',education:'11 классов',grades:'отличник',age:'minor',budget:'До 3 млн ₸/год'},step:9,complete:true})));
      await page.goto(origin+'/plan',{waitUntil:'networkidle'});
      await tile.waitFor();
      assert.equal(await tile.getAttribute('data-plan-tile'),'education','A school answer is asked again as the master\'s question');
      assert.match(await tile.innerText(),/Диплом бакалавра уже получен\?/);
      // Owner, 23 Nov, a phone screenshot of question 9 with «Уже в Италии»
      // marked: «Почему здесь по дефолту будто уже нажали». It was an earlier
      // answer: after a changed level the questionnaire led through every
      // later question, and the answered ones arrived marked. Now only the
      // questions without an answer are asked, and none arrives marked.
      await page.evaluate(()=>localStorage.setItem('iitaly_plan_draft_v1',JSON.stringify({answers:{intake:'2027/28',goal:'Бакалавриат',education:'11 классов',grades:'отличник',budget:'До 3 млн ₸/год',field:'Инженерия и IT',lang:'есть сертификат',age:'adult',residence:'italy',dsuRegion:'other'},step:10,complete:true})));
      await page.goto(origin+'/plan?answers=1',{waitUntil:'networkidle'});
      await page.locator('[data-plan-answer=goal]').click();
      await page.locator('[data-plan-answer-edit=goal]').getByRole('button').filter({hasText:'Магистратура'}).click();
      const arrived = [];
      for (let guard=0; guard<10 && await tile.count(); guard++) {
        const id = await tile.getAttribute('data-plan-tile');
        arrived.push(id);
        assert.equal(await tile.locator('button[aria-pressed=true]').count(),0,`«${id}» arrives with no answer marked`);
        await tile.locator('button[aria-pressed]').first().click();
        await page.waitForFunction(previous=>document.querySelector('[data-plan-tile]')?.getAttribute('data-plan-tile')!==previous,id);
      }
      assert.deepEqual(arrived,['education','major'],'Only the master\'s own questions are asked after the level changes');
      await page.getByRole('button',{name:'Открыть мой план',exact:true}).waitFor();
      const after = await page.evaluate(()=>JSON.parse(localStorage.getItem('iitaly_plan_draft_v1')).answers);
      assert.equal(after.residence,'italy','An answer both tracks share is kept');
      assert.equal(after.age,undefined,'The other track\'s answer is not');
      // The same within a first run: back to an earlier question, a new answer, and on to where the applicant was.
      await page.evaluate(()=>localStorage.setItem('iitaly_plan_draft_v1',JSON.stringify({answers:{intake:'2027/28',goal:'Бакалавриат',education:'11 классов',grades:'отличник'},step:4,complete:false})));
      await page.goto(origin+'/plan',{waitUntil:'networkidle'});
      await tile.waitFor();
      assert.equal(await tile.getAttribute('data-plan-tile'),'budget');
      await page.getByRole('button',{name:'Назад',exact:true}).click();
      await page.getByRole('button',{name:'Назад',exact:true}).click();
      assert.equal(await tile.getAttribute('data-plan-tile'),'education');
      assert.equal(await tile.locator('button[aria-pressed=true]').count(),1,'Going back shows the answer given');
      await tile.locator('button[aria-pressed=false]').first().click();
      await page.waitForFunction(()=>document.querySelector('[data-plan-tile]')?.getAttribute('data-plan-tile')==='budget');
      assert.equal(await tile.locator('button[aria-pressed=true]').count(),0,'A changed answer leads to the next question without one');
      if (width===390) await page.screenshot({path:resolve(output,'master-390.png')});
      await context.close(); }
  }
  assert.deepEqual(errors,[],'Browser runtime errors');
  console.log('Admissions browser review passed at 1440, 390 and 320px: quiz, the master\'s track, sources, deep links, annual calculator, no overflow/runtime errors.');
} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
}
