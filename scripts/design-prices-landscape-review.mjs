import assert from 'node:assert/strict';
import { textInventory, assertContentPreserved } from './design-content.mjs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.REVIEW_TOOLS && process.env.BASELINE_OUT);
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'playwright/index.mjs')).href);
const output = resolve('design-review/prices-landscape');
await mkdir(output, { recursive: true });
const results = [], errors = [];
const { default: axe } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.js')).href);
const overlays = JSON.parse(await readFile('docs/botanical-prices/assets.json', 'utf8'));
assert(overlays.assets.reduce((sum,a)=>sum+a.bytes,0)<280000,'All new responsive overlays stay below 280 KB combined');
for(const a of overlays.assets){const bytes=await readFile(resolve('out',a.path.replace(/^public\//,'')));assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);}
const manifest = JSON.parse(await readFile('docs/prices-landscape-asset.json', 'utf8'));
assert.equal(manifest.sourceSha256, '023c232b561e78c3087d9b13d53d899cc954dbec7f39ce6128eca51022aa6b6c');
for (const asset of manifest.assets) {
  const bytes = await readFile(resolve('out', asset.path.replace(/^public\//, '')));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  assert.equal(bytes.length, asset.bytes);
}
assert(manifest.assets.reduce((sum, asset) => sum + asset.bytes, 0) < 200000);
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.ico':'image/x-icon'};
async function serve(root, port) {
  root = resolve(root);
  const server = createServer(async (req, res) => {
    try {
      const path = resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
      if (path !== root && !path.startsWith(root + sep)) return res.writeHead(403).end();
      for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
        if (await stat(file).then(s => s.isFile()).catch(() => false)) {
          res.writeHead(200, {'Content-Type': mime[extname(file)] || 'application/octet-stream'}).end(await readFile(file)); return;
        }
      }
      res.writeHead(404).end();
    } catch { res.writeHead(500).end(); }
  });
  await new Promise(done => server.listen(port, '127.0.0.1', done));
  return server;
}
const servers = [await serve('out', 4187), await serve(process.env.BASELINE_OUT, 4188)];
const browser = await chromium.launch();
let activePage;
async function visit(page, port) {
  assert.equal((await page.goto(`http://127.0.0.1:${port}/prices`, {waitUntil:'networkidle'})).status(), 200);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
}
async function layout(page) {
  return page.locator('[data-section="prices-header"]').evaluate(section => ({
    height: section.getBoundingClientRect().height,
    items: [...section.querySelectorAll('h1,p,[data-editorial-spot]')].map(el => {
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      return [el.textContent, r.x, r.y, r.width, r.height, s.fontSize, s.fontFamily, s.color, s.display];
    }),
  }));
}
try {
  const dense=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,reducedMotion:'reduce'});
  await dense.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
  const densePage=await dense.newPage();await visit(densePage,4187);
  assert.match(await densePage.locator('[data-botanical-layer=canopy]').evaluate(i=>i.currentSrc),/canopy-640\.webp$/,'A high-DPR phone still receives the small decorative overlay');
  await dense.close();
  for (const width of [320,390,768,1024,1279,1280,1366,1440,1551,1552,1600,1920]) {
    const context = await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce',deviceScaleFactor:1,locale:'ru-RU'});
    let chatCalls=0;
    await context.route('**/*', route => { const url=new URL(route.request().url()); if(url.pathname==='/api/chat'){chatCalls++;return route.fulfill({status:503,json:{ok:false,error:'Synthetic test only'}});} if(url.pathname==='/health/ai')return route.fulfill({json:{ok:true,code:'AI_READY'}}); return ['127.0.0.1','localhost'].includes(url.hostname)||url.protocol==='data:'?route.continue():route.abort(); });
    const head = await context.newPage(), base = await context.newPage(); activePage = head;
    for (const page of [head,base]) page.on('pageerror', error => errors.push(error.message));
    await visit(head, 4187); await visit(base, 4188);
    assertContentPreserved(await textInventory(base), await textInventory(head), 'Pricing copy');
    await writeFile(resolve(output, `layout-${width}.json`), JSON.stringify({before: await layout(base), after: await layout(head)}, null, 2));
    assert.equal(await head.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    const art = head.locator('[data-prices-landscape]');
    assert.equal(await art.count(),1);
    assert.equal(await art.isVisible(),width>=768);
    assert.equal(await art.getAttribute('aria-hidden'),'true');
    assert.equal(await art.locator('img').getAttribute('alt'),'');
    const canvas=head.locator('[data-botanical-canvas]');
    assert.equal(await canvas.count(),1,'One continuous decorative canvas');
    assert.equal(await canvas.getAttribute('aria-hidden'),'true');
    assert.equal(await canvas.locator('button,a,input').count(),0,'Decorations do not contain controls');
    assert.equal(await canvas.evaluate(el=>getComputedStyle(el).pointerEvents),'none');
    const ambient=canvas.locator('[data-botanical-layer=ambient]');
    assert.equal(await ambient.evaluate(el=>getComputedStyle(el).opacity),'0.14');
    assert.equal(await ambient.evaluate(el=>getComputedStyle(el).mixBlendMode),'multiply');
    for(const layer of ['canopy','left','right']) {
      const mask=await canvas.locator('[data-botanical-layer='+layer+']').evaluate(el=>getComputedStyle(el).maskImage);
      assert.notEqual(mask,'none','Side and canopy edges dissolve without hard rectangles');
    }
    for(const image of await canvas.locator('img').all()) assert(await image.evaluate(i=>i.complete&&i.naturalWidth>0),'All scene images decode locally');
    const protectedCopy=head.locator('[data-protected-typography]');
    assert.match(await protectedCopy.evaluate(el=>getComputedStyle(el,'::before').backgroundImage),/radial-gradient/,'Text has a cream matte above the paint');
    const type=page=>page.locator('[data-section=prices-header] h1').evaluate(el=>{const s=getComputedStyle(el);return ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color'].map(k=>s[k]);});
    assert.deepEqual(await type(head),await type(base),'Heading type and color are preserved');
    const packageStyle=page=>page.locator('#main-package').evaluate(el=>{const s=getComputedStyle(el);return ['fontFamily','color','backgroundColor','borderRadius','boxShadow','borderColor','padding'].map(k=>s[k]);});
    assert.deepEqual(await packageStyle(head),await packageStyle(base),'Pricing card design is preserved');
    const gap=page=>page.evaluate(()=>document.querySelector('[data-price-comparison],main [data-section=prices-header] + section > div > div').getBoundingClientRect().top-document.querySelector('[aria-label="На странице цен"]').getBoundingClientRect().bottom);
    const spacing=await gap(head),oldSpacing=await gap(base);
    assert(spacing>=20&&spacing<=64,'The first comparison cards follow the links without a large void');
    assert(spacing<=oldSpacing-16,'The redundant header-to-card gap is reduced');
    const card=await head.locator('[data-price-comparison]').boundingBox(),field=await canvas.boundingBox();
    assert(Math.abs(field.y+field.height-card.y-12)<2,'The scene overlaps only the upper 12px of the comparison cards');
    for(const link of await head.locator('[aria-label="На странице цен"] a').all()) assert((await link.boundingBox()).height>=44,'Anchor links remain touch targets');
    if(width===390) assert.match(await canvas.locator('[data-botanical-layer=canopy]').evaluate(i=>i.currentSrc),/canopy-640\.webp$/,'Phone receives the small overlay');
    if(width===1440||width===390||width===768){
      await head.addScriptTag({content:axe.source});
      const violations=await head.evaluate(async()=> (await window.axe.run(document.querySelector('[data-section=prices-header]'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,impact:v.impact})));
      assert.deepEqual(violations,[],'Hero accessibility');
    }
    const artWidth=width>=768?(await art.boundingBox()).width:0;
    if ([390,768,1440,1920].includes(width)) {
      await head.screenshot({path:resolve(output, `prices-${width}.png`),animations:'disabled'});
      await head.locator('[data-section="prices-header"]').screenshot({path:resolve(output, `hero-${width}.png`),animations:'disabled'});
      await base.locator('[data-section="prices-header"]').screenshot({path:resolve(output, `hero-before-${width}.png`),animations:'disabled'});
    }
    const launcher=head.locator('#chat-launcher');
    assert.equal(await launcher.getAttribute('data-launcher-labelled'),'true','Pricing has a named assistant capsule');
    assert.match(await launcher.innerText(),/Спросить Веспи/);
    assert.match(await launcher.getAttribute('aria-label'),/Спросить Веспи/,'Visible action is included in its accessible name');
    if(width===1440){
      assert((await launcher.boundingBox()).height>=44);
      await launcher.click();await head.getByRole('dialog').waitFor();
      assert.equal(chatCalls,0,'Opening the assistant never sends an AI request');
      await head.keyboard.press('Escape');await head.getByRole('dialog').waitFor({state:'hidden'});
    }
    await head.getByRole('button',{name:'Оформить и оплатить',exact:true}).click();
    assert(await head.getByRole('dialog').isVisible());
    await head.keyboard.press('Escape'); assert.equal(await head.getByRole('dialog').count(),0);
    await head.emulateMedia({forcedColors:'active'}); assert.equal(await canvas.isVisible(),false);
    await head.emulateMedia({forcedColors:'none',media:'print'}); assert.equal(await canvas.isVisible(),false);
    results.push({test:`${width}px: preserved pricing content, layered local art, protected type, preserved cards, 12px bridge, no overflow, checkout/Escape, print/forced-colors`,artWidth,passed:true});
    await context.close();
  }
  assert.deepEqual(errors, []);
} catch (error) {
  errors.push(error.stack || String(error));
  if(activePage && !activePage.isClosed()) await activePage.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(() => {});
  throw error;
} finally {
  await writeFile(resolve(output,'results.json'), JSON.stringify({results,errors},null,2));
  await browser.close(); await Promise.all(servers.map(s => new Promise(done => s.close(done))));
}
console.log(JSON.stringify(results,null,2));
