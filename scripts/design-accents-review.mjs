import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const tools = process.env.REVIEW_TOOLS;
assert(tools && process.env.BASELINE_OUT, 'Browser tools and exact baseline are required');
const { chromium } = await import(pathToFileURL(resolve(tools, 'playwright/index.mjs')).href);
const { default: pngjs } = await import(pathToFileURL(resolve(tools, 'pngjs/lib/png.js')).href);
const manifest = JSON.parse(await readFile('src/components/marketing/italian-accents.json', 'utf8'));
const output = resolve('design-review/italian-accents');
await mkdir(output, { recursive: true });
const media = new Map();
const results = [];
const errors = [];
// All artwork must ship with the static export, without a remote CDN request.
for (const [name, asset] of Object.entries(manifest)) {
  assert(asset.src.startsWith('/illustrations/editorial/'), `${name}: local delivery`);
  const body = await readFile(resolve('out', `.${asset.src}`));
  assert(body.length < 150000, `${name}: decorative asset budget`);
  media.set(asset.src, { name, body });
  await writeFile(resolve(output, `${name}.webp`), body);
  results.push({ test: `${name} source`, passed: true, url: asset.src, bytes: body.length, sha256: createHash('sha256').update(body).digest('hex') });
}

// Match every shipped derivative to the reviewed import manifest.
const catalog = JSON.parse(await readFile('docs/editorial-art-assets.json', 'utf8'));
let assetBytes = 0;
for (const asset of Object.values(catalog)) {
  for (const variant of asset.variants) {
    const bytes = await readFile(resolve('out/illustrations/editorial', variant.file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), variant.sha256, variant.file);
    assert.equal(bytes.length, variant.bytes);
    assetBytes += bytes.length;
  }
}
assert(assetBytes < 950000, 'All responsive artwork assets together stay under 950 KB');
results.push({ test: 'Locally exported artwork integrity and total budget', passed: true, bytes: assetBytes });

const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
function serve(root, port) {
  root = resolve(root);
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      for (const value of media.values()) {
        if (pathname === `/__accents/${value.name}.webp`) { response.writeHead(200, { 'Content-Type': 'image/webp' }).end(value.body); return; }
      }
      const path = resolve(root, `.${pathname}`);
      if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
      for (const candidate of [path, `${path}.html`, resolve(path, 'index.html')]) {
        if (await stat(candidate).then(s => s.isFile()).catch(() => false)) {
          response.writeHead(200, { 'Content-Type': mime[extname(candidate)] || 'application/octet-stream' });
          response.end(await readFile(candidate)); return;
        }
      }
      response.writeHead(404).end();
    } catch { response.writeHead(500).end(); }
  });
  return new Promise(done => server.listen(port, '127.0.0.1', () => done(server)));
}
const servers = [await serve('out', 4175), await serve(process.env.BASELINE_OUT, 4176)];
const browser = await chromium.launch();
async function settle(page, port, route = '/') {
  const response = await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const image of document.images) image.loading = 'eager';
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  });
  await page.waitForTimeout(350);
}
try {
  for (const width of [1440, 1280, 1024, 768, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1, locale: 'ru-RU', timezoneId: 'Europe/Rome' });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      const cached = media.get(url.href);
      if (cached) { await route.fulfill({ status: 200, contentType: 'image/webp', body: cached.body }); return; }
      if (['127.0.0.1', 'localhost'].includes(url.hostname) || url.protocol === 'data:') await route.continue();
      else await route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await settle(page, 4176);
    const baseText = (await page.locator('main').innerText()).replace(/\s+/g, ' ').trim();
    const heroBefore = await page.locator('[data-section="hero"] > div').first().screenshot({ animations: 'disabled' });
    await settle(page, 4175);
    const headText = (await page.locator('main').innerText()).replace(/\s+/g, ' ').trim();
    assert.equal(headText, baseText, `Unchanged homepage content at ${width}`);
    const heroAfter = await page.locator('[data-section="hero"] > div').first().screenshot({ path: resolve(output, `hero-unchanged-${width}.png`), animations: 'disabled' });
    const a = pngjs.PNG.sync.read(heroBefore), b = pngjs.PNG.sync.read(heroAfter);
    assert.equal(a.width, b.width); assert.equal(a.height, b.height);
    assert(a.data.equals(b.data), `Hero must stay pixel-identical at ${width}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${width}: horizontal overflow`);
    const accents = page.locator('[data-italian-accent]');
    assert.equal(await accents.count(), 2);
    let visible = 0;
    for (const accent of await accents.all()) {
      assert.equal(await accent.getAttribute('aria-hidden'), 'true');
      assert.equal(await accent.locator('img').getAttribute('alt'), '');
      if (!await accent.isVisible()) continue;
      visible++;
      assert.equal(await accent.locator('img').evaluate(img => img.complete && img.naturalWidth > 0), true, 'Visible asset loads');
      const check = await accent.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const section = el.closest('section');
        const overlaps = [...section.querySelectorAll('h1,h2,h3,p,a,button,summary,input')].filter(node => {
          const box = node.getBoundingClientRect();
          return box.width && box.height && rect.left < box.right - 1 && rect.right > box.left + 1 && rect.top < box.bottom - 1 && rect.bottom > box.top + 1;
        }).map(node => node.textContent?.slice(0, 80));
        return { kind: el.dataset.italianAccent, width: rect.width, pointerEvents: getComputedStyle(el).pointerEvents, overlaps };
      });
      assert(check.width <= 224, 'Only small supplementary illustrations');
      assert.equal(check.pointerEvents, 'none');
      assert.deepEqual(check.overlaps, [], `${width}: ${check.kind} must not cover text or controls`);
    }
    assert.equal(visible, width >= 768 ? 2 : 1);
    if (width === 1440) {
      for (const [name, asset] of Object.entries(manifest)) {
        const alpha = await page.evaluate(async ({ name }) => {
          const image = new Image(); image.src = `/__accents/${name}.webp`; await image.decode();
          const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
          const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let transparent = 0;
          for (let i = 3; i < data.length; i += 4) if (data[i] === 0) transparent++;
          return { width: canvas.width, height: canvas.height, transparentFraction: transparent / (canvas.width * canvas.height) };
        }, { name });
        assert.equal(alpha.width, asset.width); assert.equal(alpha.height, asset.height);
        assert(alpha.transparentFraction > .5, `${name} must have a real transparent background`);
        results.push({ test: `${name} transparent alpha`, passed: true, ...alpha });
      }
    }
    if ([1440, 390].includes(width)) {
      await page.screenshot({ path: resolve(output, `home-${width}.png`), fullPage: true, animations: 'disabled' });
      for (const name of ['how', 'feature']) {
        await page.locator(`[data-section="${name}"]`).screenshot({ path: resolve(output, `${name}-${width}.png`), animations: 'disabled' });
      }
      await page.locator('[data-italian-accent="lemon"]').locator('..').screenshot({ path: resolve(output, `pricing-${width}.png`), animations: 'disabled' });
    }
    results.push({ test: `${width}px: same hero/content, no overflow or illustration overlap`, passed: true, visibleAccents: visible });

    // Foreground imagery is always confined to an image slot or an empty margin.
    async function inspectArtwork() {
      for (const art of await page.locator('[data-editorial-art], [data-editorial-spot]').all()) {
        assert.equal(await art.getAttribute('aria-hidden'), 'true');
        assert.equal(await art.locator('img').getAttribute('alt'), '');
        if (!await art.isVisible()) continue;
        const image = await art.locator('img').evaluate(img => ({loaded: img.complete && img.naturalWidth > 0, src: new URL(img.currentSrc).pathname}));
        assert(image.loaded, 'Local illustration loaded');
        assert(image.src.startsWith('/illustrations/editorial/'));
        if (width <= 390 && await art.getAttribute('data-editorial-art')) assert(image.src.includes('-480.webp'), 'Phone selects the smaller source');
        const overlaps = await art.evaluate(el => {
          const box = el.getBoundingClientRect();
          return [...el.closest('section').querySelectorAll('h1,h2,h3,p,a,button,input,summary')].filter(node => {
            const r = node.getBoundingClientRect();
            return r.width && r.height && box.left < r.right - 1 && box.right > r.left + 1 && box.top < r.bottom - 1 && box.bottom > r.top + 1;
          }).map(el => el.textContent?.slice(0, 70));
        });
        assert.deepEqual(overlaps, [], `${width}: art cannot cover content`);
        assert.equal(await art.evaluate(el => getComputedStyle(el).pointerEvents), 'none');
      }
    }
    await inspectArtwork();
    for (const route of ['/guides', '/plan', '/prices']) {
      await settle(page, 4176, route);
      const beforeText = (await page.locator('main').innerText()).replace(/\s+/g, ' ').trim();
      await settle(page, 4175, route);
      assert.equal((await page.locator('main').innerText()).replace(/\s+/g, ' ').trim(), beforeText, `${route}: original copy at ${width}px`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${route} overflow at ${width}`);
      await inspectArtwork();
      assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).filter), 'none', 'Blur never affects the heading');
      if (route === '/plan') {
        const wash = page.locator('[data-editorial-atmosphere]');
        assert.equal(await wash.isVisible(), width >= 1280);
        if (width >= 1280) {
          assert.equal(await wash.evaluate(el => getComputedStyle(el).pointerEvents), 'none');
          assert.match(await wash.locator('img').evaluate(el => getComputedStyle(el).filter), /blur/);
          assert(Number(await wash.locator('img').evaluate(el => getComputedStyle(el).opacity)) <= .3);
        }
      }
      if ([1440,390].includes(width)) {
        await page.screenshot({path:resolve(output, `${route.slice(1)}-${width}.png`), animations:'disabled'});
        await page.locator('main > section').first().screenshot({path:resolve(output, `${route.slice(1)}-header-${width}.png`), animations:'disabled'});
      }
      if (route === '/guides') {
        if (width >= 1024) {
          await page.getByRole('navigation', {name:'Главы справочника'}).getByRole('button', {name:'CIMEA'}).click();
          assert(await page.getByText('03 · CIMEA', {exact:true}).isVisible());
        } else {
          const detail = page.locator('main details').filter({has:page.locator('summary').filter({hasText:'CIMEA'})}).first();
          await detail.locator('summary').click();
          assert(await detail.evaluate(el => el.open));
        }
      }
      results.push({test:`${route} ${width}px: unchanged copy, loaded art, no overlap/overflow`,passed:true});
    }
    await page.emulateMedia({forcedColors:'active'});
    assert.equal(await page.locator('[data-editorial-spot]').isVisible(), false);
    await page.emulateMedia({forcedColors:'none',media:'print'});
    assert.equal(await page.locator('[data-editorial-spot]').isVisible(), false);

    await context.close();
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors }, null, 2));
  await browser.close();
  await Promise.all(servers.map(server => new Promise(done => server.close(done))));
}
console.log(JSON.stringify(results, null, 2));
