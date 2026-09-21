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
  for (const width of [320,390,768,1024,1279,1280,1366,1440,1551,1552,1600,1920]) {
    const context = await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce',deviceScaleFactor:1,locale:'ru-RU'});
    await context.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname) || route.request().url().startsWith('data:') ? route.continue() : route.abort());
    const head = await context.newPage(), base = await context.newPage(); activePage = head;
    for (const page of [head,base]) page.on('pageerror', error => errors.push(error.message));
    await visit(head, 4187); await visit(base, 4188);
    assertContentPreserved(await textInventory(base), await textInventory(head), 'Pricing copy');
    await writeFile(resolve(output, `layout-${width}.json`), JSON.stringify({before: await layout(base), after: await layout(head)}, null, 2));
    assert.equal(await head.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    const art = head.locator('[data-prices-landscape]');
    assert.equal(await art.count(), 1);
    assert.equal(await art.isVisible(), width >= 1280);
    assert.equal(await art.getAttribute('aria-hidden'), 'true');
    assert.equal(await art.locator('img').getAttribute('alt'), '');
    let artWidth = 0;
    if (width >= 1280) {
      const details = await art.evaluate(el => {
        const r = el.getBoundingClientRect(), host = el.closest('section'), h = host.getBoundingClientRect(), img = el.querySelector('img');
        // h1 is a 900px centered block: its blank outer margins are not text.
        // Protect real text line rectangles with an additional 24px clear zone.
        // Controls and the right artwork keep their full hit/layout rectangles.
        const boxes = [];
        for (const node of host.querySelectorAll('h1,p')) {
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent.trim()) continue;
            const range = document.createRange(); range.selectNodeContents(walker.currentNode);
            for (const b of range.getClientRects()) boxes.push({left:b.left-24,right:b.right+24,top:b.top-24,bottom:b.bottom+24,label:node.textContent});
          }
        }
        for (const node of host.querySelectorAll('button,a,[data-editorial-spot]')) {
          const b = node.getBoundingClientRect();
          if (b.width && b.height) boxes.push({left:b.left,right:b.right,top:b.top,bottom:b.bottom,label:node.textContent});
        }
        const overlaps = boxes.filter(b => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top).map(b => b.label);
        return { overlaps, contained: r.left >= h.left && r.top >= h.top && r.right <= h.right && r.bottom <= h.bottom, x: r.x, width: r.width, src: new URL(img.currentSrc).pathname, loaded: img.complete && img.naturalWidth > 0, pointerEvents: getComputedStyle(el).pointerEvents, filter: getComputedStyle(img).filter };
      });
      assert.deepEqual(details.overlaps, []);
      assert(details.contained && details.loaded);
      assert(details.x + details.width < width / 2);
      const expected = Math.min(330, Math.max(208, width * .45 - 368));
      assert(Math.abs(details.width - expected) < 1, 'Larger responsive width is rendered');
      artWidth = details.width;
      assert.equal(details.pointerEvents, 'none'); assert.equal(details.filter, 'none');
      assert.match(details.src, /^\/illustrations\/editorial\/coastal-terrace-/);
      const alpha = await art.locator('img').evaluate(img => {
        const canvas = document.createElement('canvas'); canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0);
        const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
        let clear=0, painted=0; for(let i=3;i<data.length;i+=4) { if(data[i]===0)clear++; if(data[i]>240)painted++; }
        return {clear,painted};
      });
      assert(alpha.clear > 100 && alpha.painted > 100);
    }
    if ([390,1280,1366,1440,1600,1920].includes(width)) {
      await head.screenshot({path:resolve(output, `prices-${width}.png`),animations:'disabled'});
      await head.locator('[data-section="prices-header"]').screenshot({path:resolve(output, `hero-${width}.png`),animations:'disabled'});
      await base.locator('[data-section="prices-header"]').screenshot({path:resolve(output, `hero-before-${width}.png`),animations:'disabled'});
    }
    await head.getByRole('button',{name:'Оформить и оплатить',exact:true}).click();
    assert(await head.getByRole('dialog').isVisible());
    await head.keyboard.press('Escape'); assert.equal(await head.getByRole('dialog').count(),0);
    await head.emulateMedia({forcedColors:'active'}); assert.equal(await art.isVisible(),false);
    await head.emulateMedia({forcedColors:'none',media:'print'}); assert.equal(await art.isVisible(),false);
    results.push({test:`${width}px: preserved pricing content, responsive local art, 24px text clearance, no overflow, checkout/Escape, print/forced-colors`,artWidth,passed:true});
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
