import assert from 'node:assert/strict';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const sharp = require('sharp');
const output = resolve('design-review/brand');
await mkdir(output, { recursive: true });
const mark = JSON.parse(await readFile('src/components/brand/mark.json', 'utf8'));
for (const file of ['public/brand/iitaly-mark.svg', 'public/brand/iitaly-mark-mono.svg', 'src/app/icon.svg']) {
  const source = await readFile(file, 'utf8');
  for (const path of [mark.fold, mark.arc]) assert(source.includes(path), file + ': exported geometry matches the component');
  assert(!/gradient|filter|<image|<script/i.test(source), file + ': self-contained flat vector');
}
const icon = await readFile('src/app/icon.svg');
for (const size of [16, 24, 32, 180]) await sharp(icon).resize(size, size).png().toFile(resolve(output, `icon-${size}.png`));
const apple = await sharp('src/app/apple-icon.png').metadata();
assert.equal(apple.width, 180); assert.equal(apple.height, 180);
const root = resolve('out');
const mime = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + new URL(req.url, 'http://local').pathname);
  if (path !== root && !path.startsWith(root + sep)) return res.writeHead(403).end();
  for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
    if (await stat(file).then(s => s.isFile()).catch(() => false)) return res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'}).end(await readFile(file));
  }
  res.writeHead(404).end();
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const results = [], errors = [];
try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin || url.pathname.startsWith('/api/')) return route.fulfill({json:{ok:false}});
      return route.continue();
    });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    for (const path of ['/', '/guides', '/universities', '/plan', '/prices', '/portal']) {
      await page.goto(origin + path, {waitUntil:'networkidle'});
      await page.evaluate(() => document.fonts.ready);
      const logo = page.locator('header [data-brand-logo]').first();
      assert.equal(await logo.getAttribute('data-brand-version'), 'low-arc');
      assert.equal(await logo.innerText(), 'iItaly');
      assert.equal(await logo.locator('svg path').count(), 2);
      assert.equal(await logo.locator('svg').evaluate(e => getComputedStyle(e).filter), 'none');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, path + ': no overflow');
      if (path === '/') {
        const link = page.locator('header').getByRole('link', {name:'IITALY — главная', exact:true});
        assert((await link.boundingBox()).height >= 44, 'Home link has a 44px touch target');
        await link.focus(); assert(await link.evaluate(e => e === document.activeElement));
        assert.notEqual(await link.evaluate(e => getComputedStyle(e).outlineStyle), 'none', 'Keyboard focus remains visible');
        const footer = page.locator('footer [data-brand-logo]');
        const colors = await footer.evaluate(e => ({word:getComputedStyle(e).color,background:getComputedStyle(e.closest('footer')).backgroundColor}));
        assert.equal(colors.word, 'rgb(20, 20, 19)', 'The public footer retains the same monochrome wordmark on paper');
        await page.screenshot({path:resolve(output, `home-${width}.png`),animations:'disabled'});
        await footer.screenshot({path:resolve(output, `footer-${width}.png`)});
      }
      results.push({path,width,brand:'low-arc',overflow:false});
    }
    await page.emulateMedia({forcedColors:'active'});
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-brand-mark] path')).fill === 'rgb(0, 0, 0)');
    const forced = await page.locator('[data-brand-mark] path').first().evaluate(e => getComputedStyle(e).fill);
    assert.equal(forced, 'rgb(0, 0, 0)', 'Forced-colour mode uses the system foreground');
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({results,errors,exportParity:true,iconSizes:[16,24,32,180]}, null, 2));
  console.log('Brand review: 18 route/viewport pairs, focus, forced colours and exported icons passed.');
} finally { await browser.close(); await new Promise(done => server.close(done)); }
