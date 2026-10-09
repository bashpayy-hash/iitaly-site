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
const browser = await chromium.launch();
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
      'Экономика, бизнес','Есть IELTS или TOEFL','Ещё не будет 18','В Казахстане','Пьемонт · EDISU'];
    for (const choice of choices) await page.getByRole('button').filter({hasText:choice}).click();
    await page.getByRole('button',{name:'Открыть мой план',exact:true}).click();
    const result = await page.locator('main').textContent();
    assert.match(result,/компенсацию 11-летней школы/);
    assert.match(result,/Документы несовершеннолетнего/);
    assert.match(result,/Для 2027\/28 годы справок пока не назначаем/);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth+1),false,'Plan result overflow at '+width);
    await page.screenshot({path:resolve(output,`plan-${width}.png`),fullPage:true});
    for (const id of ['cimea','iseeu','visa']) {
      await visit('/guides#'+id);
      const body = width >= 1024 ? page.locator('#guide-chapter-content') : page.locator('details#'+id);
      if (width < 1024) assert(await body.evaluate(el=>el.open),'Mobile deep link opens '+id);
      assert.match(await body.innerText(),/9 октября 2026/);
      assert(await body.locator('a[href^="https://"]').count()>0,'Official sources are accessible');
      if (id==='visa') {
        await body.getByText('Годовой минимум и пересчёт в тенге',{exact:true}).click();
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
