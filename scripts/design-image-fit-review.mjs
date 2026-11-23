import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

// A phone is not sent pictures larger than it shows. Measured 21 Nov with the
// performance skill of addyosmani/agent-skills (owner: «установи и используй
// для улучшения сайта»): the covers of the home page, /check and /plan went to
// a phone as 1600–1920px files because nothing stood between 960 and 1600px;
// cabinet tiles declared «100vw» and took 1600px for a 360px box; a topic page
// pulled the stage page's tiles in advance through its breadcrumb. On a
// throttled phone profile the largest paint came 1.1–2.1 s sooner after the
// fix. This review keeps those three causes from coming back.
const require = createRequire(import.meta.url);
const { chromium, devices } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2', '.mp4':'video/mp4', '.webm':'video/webm' };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return res.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        return res.end(await readFile(file));
      }
    }
    res.writeHead(404).end();
  } catch { res.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.REVIEW_CHROMIUM ? { executablePath: process.env.REVIEW_CHROMIUM, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {});
const results = [];
// The width is in the file's name; since 23 Nov a cover may come as AVIF (/plan).
const fileWidth = url => Number((url.match(/-(\d{3,4})\.(?:webp|avif)$/) || [])[1] || 0);

try {
  for (const [name, device] of [['Pixel 5', devices['Pixel 5']], ['iPhone 13', devices['iPhone 13']]]) {
    const context = await browser.newContext({ ...device, reducedMotion: 'reduce', locale: 'ru-RU' });
    const requested = [];
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === origin && !url.pathname.startsWith('/api/')) { requested.push(url.pathname); return route.continue(); }
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/health')) return route.fulfill({ json: { ok: true } });
      return route.abort();
    });
    const page = await context.newPage();
    const visit = async path => { requested.length = 0; await page.goto(origin + path, { waitUntil: 'networkidle' }); await page.waitForTimeout(600); };
    const shown = selector => page.locator(selector).first().evaluate(img => ({ file: img.currentSrc.split('/').pop(), need: Math.round(img.getBoundingClientRect().width * devicePixelRatio) }));

    // 1. The cover — the largest paint of the page — comes at the step just
    //    above what the screen can show, never the desktop file.
    for (const [path, selector] of [['/', '[data-hero-landscape]'], ['/check', '[data-check-scene]'], ['/plan', '[data-plan-scene]']]) {
      await visit(path);
      const cover = await shown(selector);
      assert(fileWidth(cover.file) >= cover.need * .98, `${name} ${path}: the cover is not upscaled (${JSON.stringify(cover)})`);
      assert(fileWidth(cover.file) <= 1200, `${name} ${path}: the cover comes as the 1200px file or smaller, not ${cover.file}`);
    }
    // 2. The cabinet's two tiles say how wide they really are.
    await visit('/portal');
    await page.locator('[data-cabinet-features] [data-stage-scene] img').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    for (const file of await page.locator('[data-cabinet-features] [data-stage-scene] img').evaluateAll(imgs => imgs.map(img => img.currentSrc.split('/').pop())))
      assert(fileWidth(file) <= 1200, `${name} cabinet: a tile's scene comes as 1200px or smaller, not ${file}`);
    // 3. A topic and a step fetch their own cartouche once, and nobody else's:
    //    the path above the title does not pull the stage page in advance.
    for (const path of ['/guides/apostille', '/guides/apostille/1']) {
      await visit(path);
      const cartouches = [...new Set(requested.filter(url => url.startsWith('/illustrations/cartouche/')))];
      assert.equal(cartouches.length, 1, `${name} ${path}: one cartouche file is fetched (${cartouches.join(', ')})`);
      assert(fileWidth(cartouches[0]) <= 360, `${name} ${path}: the 120px cartouche comes as 360px, not ${cartouches[0]}`);
      assert.equal(requested.filter(url => /\/guides\/stages\//.test(url)).length, 0, `${name} ${path}: the stage page is not fetched in advance`);
    }
    results.push({ device: name, passed: true });
    await context.close();
  }
  // A desktop at 1× does not take phone-retina files for the directory's tiles.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', locale: 'ru-RU' });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto(origin + '/guides', { waitUntil: 'networkidle' });
  const tiles = await page.locator('[data-guide-tile] img').evaluateAll(imgs => imgs.filter(img => img.currentSrc).map(img => img.currentSrc.split('/').pop()));
  assert(tiles.length >= 4 && tiles.every(file => fileWidth(file) === 240), `Desktop /guides: a 180px tile takes the 240px cartouche (${[...new Set(tiles.map(fileWidth))]})`);
  results.push({ device: 'desktop 1x', passed: true });
  await context.close();
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  server.close();
}
