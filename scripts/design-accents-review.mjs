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
// Cache only the three explicitly approved Higgsfield results. No backend requests.
for (const [name, asset] of Object.entries(manifest)) {
  const response = await fetch(asset.src, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${name}: Higgsfield asset is available`);
  const body = Buffer.from(await response.arrayBuffer());
  assert(body.length < 150000, `${name}: decorative asset budget`);
  media.set(asset.src, { name, body });
  await writeFile(resolve(output, `${name}.webp`), body);
  results.push({ test: `${name} source`, passed: true, url: asset.src, bytes: body.length, sha256: createHash('sha256').update(body).digest('hex') });
}
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
async function settle(page, port) {
  const response = await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
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
    assert.equal(await accents.count(), 3);
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
    assert.equal(visible, width >= 1280 ? 3 : width >= 768 ? 2 : 1);
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
    await context.close();
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors }, null, 2));
  await browser.close();
  await Promise.all(servers.map(server => new Promise(done => server.close(done))));
}
console.log(JSON.stringify(results, null, 2));
