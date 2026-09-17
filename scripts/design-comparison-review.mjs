import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS);
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const output = resolve('design-review/comparison');
await mkdir(output, { recursive: true });
const results = [], errors = [];
const manifest = JSON.parse(await readFile('docs/selected-accents-assets.json', 'utf8'));
assert.deepEqual(Object.keys(manifest).sort(), ['lemon-postcard', 'tomato-bowl', 'travel-paperwork']);
let bytesTotal = 0;
for (const entry of Object.values(manifest)) for (const asset of entry.variants) {
  const bytes = await readFile(resolve('out', `.${asset.src}`));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  assert.equal(bytes.length, asset.bytes);
  bytesTotal += bytes.length;
}
assert(bytesTotal < 600000, 'New full set including both resolutions below 600 KB');
results.push({ test: 'Exactly three approved cutouts; first scene excluded; local assets intact', passed: true, bytes: bytesTotal });
const root = resolve('out');
const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.ico':'image/x-icon' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    for (const candidate of [path, `${path}.html`, resolve(path, 'index.html')]) {
      if (await stat(candidate).then(s => s.isFile()).catch(() => false)) {
        response.writeHead(200, { 'Content-Type':mime[extname(candidate)] || 'application/octet-stream' });
        response.end(await readFile(candidate)); return;
      }
    }
    response.writeHead(404).end();
  } catch { response.writeHead(500).end(); }
});
await new Promise(done => server.listen(4177, '127.0.0.1', done));
const browser = await chromium.launch();
async function visit(page, path) {
  const response = await page.goto(`http://127.0.0.1:4177${path}`, { waitUntil:'networkidle' });
  assert.equal(response.status(), 200);
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const image of document.images) image.loading = 'eager';
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  });
}
async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, label);
}
try {
  for (const width of [1440,1280,1024,768,390,320]) {
    const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',deviceScaleFactor:1,locale:'ru-RU'});
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return ['127.0.0.1','localhost'].includes(url.hostname) || url.protocol === 'data:' ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await visit(page, '/universities');
    assert.equal(await page.getByText('Скетчбук городов', {exact:true}).count(), 0);
    assert.equal(await page.locator('[data-marketing-surface]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('lenis')), false);
    await noOverflow(page, `universities empty ${width}`);
    const workbench = page.locator('#compare-universities');
    await page.waitForFunction(() => document.querySelector('#compare-universities')?.getAttribute('data-comparison-ready') === 'true');
    const lemon = page.locator('[data-selected-accent="lemon-postcard"]');
    assert.equal(await lemon.isVisible(), width >= 768);
    if (width >= 768) {
      assert(await lemon.locator('img').evaluate(img => img.complete && img.naturalWidth > 0));
      const overlap = await lemon.evaluate(el => {
        const a = el.getBoundingClientRect();
        return [...el.closest('section').querySelectorAll('h2,p,button,select')].some(node => {
          const b = node.getBoundingClientRect();
          return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        });
      });
      assert.equal(overlap, false, 'Postcard does not overlap comparison controls/copy');
    }
    for (const [index, id] of ['bocconi', 'polimi', 'polito'].entries()) {
      await workbench.getByLabel(`Университет ${index + 1}`, {exact:true}).selectOption(id);
      await page.waitForFunction(({ index, id }) => {
        const select = document.querySelector(`#compare-universities select[aria-label="Университет ${index + 1}"]`);
        const status = document.querySelector('#compare-universities [role="status"]');
        return select?.value === id && status?.textContent === `Выбрано ${index + 1} из 3`;
      }, { index, id });
    }
    results.push({ test: `${width}px: all three selections committed`, passed: true });
    assert.equal(await workbench.locator('[data-comparison-row]').count(), 12);
    assert.equal(await workbench.getByLabel('Университет 2', {exact:true}).locator('option[value="bocconi"]').isDisabled(), true);
    assert.match(await workbench.locator('[data-comparison-row="period"]').innerText(), /14\s400/);
    assert.match(await workbench.locator('[data-comparison-row="period"]').innerText(), /от €8\s400/);
    await workbench.getByLabel('Бюджет жизни за').selectOption('10');
    assert.match(await workbench.locator('[data-comparison-row="period"]').innerText(), /12\s000/);
    assert.match(await workbench.locator('[data-comparison-row="period"]').innerText(), /от €7\s000/);
    await workbench.getByLabel('Только различия').check();
    const differences = await workbench.locator('[data-comparison-row]').count();
    assert(differences > 0 && differences < 12);
    assert.equal(await workbench.locator('[data-comparison-row="english"]').count(), 0);
    await workbench.getByLabel('Только различия').uncheck();
    assert.equal(await workbench.locator('[data-comparison-row]').count(), 12);
    await noOverflow(page, `comparison ${width}`);
    if ([1440,390].includes(width)) {
      await workbench.screenshot({path:resolve(output,`comparison-${width}.png`),animations:'disabled'});
    }
    await workbench.getByRole('button', {name:'Открыть в отдельном окне'}).click();
    const modal = page.getByRole('dialog', {name:'Сравнение университетов',exact:true});
    assert(await modal.isVisible());
    assert.equal(await modal.locator('[data-comparison-row]').count(),12);
    await page.keyboard.press('Escape');
    assert.equal(await modal.count(),0);
    if (width <= 390) {
      const scroll = workbench.getByRole('region', {name:'Подробное сравнение университетов'});
      assert(await scroll.evaluate(el => el.scrollWidth > el.clientWidth));
      await scroll.focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(180);
      assert(await scroll.evaluate(el => el.scrollLeft > 0), 'Keyboard horizontal scroll');
    }
    await workbench.getByRole('button', {name:'Очистить выбор',exact:true}).click();
    assert.equal(await workbench.locator('[data-comparison-row]').count(),0);
    await page.getByRole('button', {name:'Начать с Рима'}).click();
    assert(await page.getByRole('heading', {name:'Рим',exact:true}).isVisible());
    await page.getByRole('button', {name:'Частные',exact:true}).click();
    assert.equal(await page.getByRole('button', {name:'Частные',exact:true}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button', {name:'Все вузы',exact:true}).click();
    await page.getByRole('button', {name:'На английском',exact:true}).click();
    assert.equal(await page.getByRole('button', {name:'На английском',exact:true}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button', {name:'На английском',exact:true}).click();
    results.push({test:`Comparison ${width}px: 3 selections, 12 rows, differences, 10/12-month calculation, modal, reset, map/filters`,passed:true});
    for (const [route, selector, assetName] of [
      ['/plan','[data-editorial-atmosphere]','travel-paperwork-640.webp'],
      ['/prices','[data-editorial-spot="tomatoes"]','tomato-bowl-320.webp'],
    ]) {
      await visit(page,route);
      const accent = page.locator(selector);
      assert.equal(await accent.isVisible(),width>=1280);
      assert((await accent.locator('img').getAttribute('src')).endsWith(assetName));
      assert.equal(await page.locator('h1').evaluate(el=>getComputedStyle(el).filter),'none');
      await noOverflow(page, `${route} ${width}`);
      if ([1440,390].includes(width)) await page.screenshot({path:resolve(output,`${route.slice(1)}-${width}.png`),animations:'disabled'});
    }
    if (width === 1440) {
      for (const [name, entry] of Object.entries(manifest)) {
        const src=entry.variants[1].src;
        const transparent = await page.evaluate(async src => {
          const image=new Image();image.src=src;await image.decode();
          const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
          const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
          const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
          let count=0;for(let i=3;i<rgba.length;i+=4)if(rgba[i]===0)count++;
          return count/(canvas.width*canvas.height);
        },src);
        assert(transparent>.1,`${name}: actual transparent pixels`);
        results.push({test:`${name} real transparent alpha`,passed:true,fraction:transparent});
      }
    }
    await context.close();
  }
  assert.deepEqual(errors,[]);
} catch(error) {
  errors.push(error.stack || error.message); throw error;
} finally {
  await writeFile(resolve(output,'results.json'),JSON.stringify({results,errors},null,2));
  await browser.close();
  await new Promise(done=>server.close(done));
}
console.log(JSON.stringify(results,null,2));
