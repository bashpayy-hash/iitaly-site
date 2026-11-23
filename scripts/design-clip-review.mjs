import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fixture, upstreamProgress } from './portal-review-fixtures.mjs';

// Nothing on the site is cut by its container. Owner, 23 Nov, a screenshot of
// /plan/9: «Вот видишь, здесь, короче, неровность, и нужно вот такие
// неровности решать. Вот причеши весь сайт на такие вот… точка, она…
// обрезается, и это очень нехорошо». The current step's ring was cut flat on
// top by the row's scroller. A detector (review-clip-detector.js) went over
// every page at 1440, 768 and 390px, as it stands, under the mouse and under
// the keyboard; what it found is fixed and this review holds it on the pages
// that carry each kind of row, at 1440 (with :hover) and at 390 and 320px:
//   1. the step path (StoryPath): 8px of room round the circles, and on a
//      phone a dense row divides its own width, so twelve steps fit;
//   2. the guide categories and the universities filters: room for the
//      keyboard's ring of the first and last chip;
//   3. the cabinet road: a stage under the mouse gets a soft glow round its
//      medallion and title instead of a hard grey block (owner: «при наведении
//      как-то вот страшно все это обрезается. Лучше бы был бы такой легкий
//      блюр»), and the visa and scholarship medallions are the redrawn ones.
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out'), output = resolve('design-review/clip');
await mkdir(output, { recursive: true });
const detector = await readFile(resolve('scripts/review-clip-detector.js'), 'utf8');

const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.svg':'image/svg+xml', '.webp':'image/webp', '.avif':'image/avif', '.png':'image/png', '.woff2':'font/woff2' };
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

// The plan of an 11-class leaver under 18: twelve steps, the densest path.
const twelve = { goal: 'Бакалавриат', intake: '2026/27', education: '11 классов', grades: 'отличник', budget: 'Только со стипендией', field: 'Медицина', lang: 'нужно подтянуть', age: 'minor', residence: 'kz', dsuRegion: 'piemonte' };
const states = {
  empty: { pages: ['/', '/plan', '/guides', '/guides/apostille/2', '/guides/visa/documents', '/universities', '/prices', '/check'], hover: ['/', '/guides', '/universities', '/prices'] },
  plan: { answers: twelve, pages: ['/plan/1', '/plan/9', '/plan/12', '/portal', '/portal?stage=workspace-phase-2'], hover: ['/plan/9', '/portal'] },
  cabinet: { login: true, pages: ['/portal', '/portal?view=settings', '/portal?stage=docs', '/portal?view=plan&task=shortlist'], hover: ['/portal'] },
};
const found = [];
const results = [];

async function scan(page, width, state, route, hover) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const rows = await page.evaluate(() => window.__scanClips('static'));
  if (hover) {
    const plan = await page.evaluate(() => window.__scanClips('hover-plan'));
    for (const item of plan.slice(0, 60)) {
      try { await page.locator(`[data-clip-hover="${item.host}"]`).hover({ timeout: 1000, force: true }); } catch { continue; }
      await page.waitForTimeout(240);
      rows.push(...await page.evaluate(arg => window.__scanClips('hover-check', arg), item));
    }
    await page.mouse.move(1, 1);
  }
  await page.keyboard.press('Tab');
  rows.push(...await page.evaluate(() => window.__scanClips('focus')));
  for (const row of rows) found.push(`${state} ${route} @${width} ${row.why}: ${row.el} cut by ${row.by} ${JSON.stringify(row.cut)}${row.body ? ' shape ' + row.body + 'px' : ''}`);
}

try {
  for (const width of [1440, 390, 320]) {
    const phone = width < 600;
    for (const [state, setup] of Object.entries(states)) {
      if (width === 320 && state !== 'plan') continue;
      const context = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, isMobile: phone, hasTouch: phone, reducedMotion: 'reduce', locale: 'ru-RU' });
      const data = fixture('full-route');
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.pathname === '/api/event') return route.fulfill({ json: { ok: true } });
        if (url.pathname === '/health/ai') return route.fulfill({ json: { ok: true, code: 'AI_READY' } });
        if (url.pathname === '/api/portal/lookup') return route.fulfill({ json: { ...data, progress: upstreamProgress(data) } });
        return url.origin === origin && !url.pathname.startsWith('/api/') ? route.continue() : route.abort();
      });
      await context.addInitScript(detector);
      if (setup.answers) await context.addInitScript(answers => { try { localStorage.setItem('iitaly_plan_draft_v1', JSON.stringify({ answers, step: 10, complete: true })); } catch {} }, setup.answers);
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      if (setup.login) {
        await page.goto(origin + '/portal?auth=login', { waitUntil: 'networkidle' });
        await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
        await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
        await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
        await page.locator('[data-portal-overview]').waitFor({ state: 'attached' });
      }
      for (const route of setup.pages) {
        await page.goto(origin + route, { waitUntil: 'load' });
        await page.locator('#main').waitFor();
        await scan(page, width, state, route, !phone && setup.hover.includes(route));

        // The owner's page: the current step's ring is whole and the row fits its column.
        if (route === '/plan/9') {
          const ring = await page.locator('[data-story-path]').evaluate(path => {
            const box = path.querySelector('[class*=scroller]'), node = path.querySelector('[aria-current] [class*=node]');
            const B = box.getBoundingClientRect(), N = node.getBoundingClientRect();
            return { room: N.top - (B.top + box.clientTop) - 5, fits: box.scrollWidth <= box.clientWidth + 1, stops: path.querySelectorAll('[data-path-stop]').length };
          });
          assert.equal(ring.stops, 12, `${width}: the densest plan has twelve steps`);
          assert(ring.room >= 0, `${width}: the current step's ring has room above it (${ring.room.toFixed(1)}px)`);
          assert(ring.fits, `${width}: the twelve steps fit their column without a circle cut at the edge`);
          if (width !== 1440) await page.locator('[data-story-path]').screenshot({ path: resolve(output, `path-${width}.png`) });
        }
        // The road: a soft glow under the mouse, not a block; the redrawn medallions.
        if (route === '/portal' && !phone) {
          const head = page.locator('[data-portal-road] a[data-road-stage]').first();
          await head.scrollIntoViewIfNeeded();
          await head.hover();
          await page.waitForTimeout(300);
          const look = await head.evaluate(el => ({ ground: getComputedStyle(el).backgroundColor, glow: getComputedStyle(el, '::before').opacity, image: getComputedStyle(el, '::before').backgroundImage }));
          assert.equal(look.ground, 'rgba(0, 0, 0, 0)', `${state}: a stage under the mouse gets no block behind it`);
          assert.equal(look.glow, '1', `${state}: it gets the soft glow`);
          assert.match(look.image, /radial-gradient/, `${state}: the glow fades out on every side`);
          await page.screenshot({ path: resolve(output, `road-hover-${state}.png`), clip: await head.evaluate(el => { const r = el.getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top - 40), width: innerWidth, height: r.height + 80 }; }) });
          await page.mouse.move(1, 1);
          const marks = await page.locator('[data-stage-mark]').evaluateAll(images => images.map(image => image.getAttribute('src')));
          if (state === 'cabinet') {
            assert(marks.some(src => /\/visa-kz-mosaic-128\.webp$/.test(src)), 'The visa stage shows the passport of Kazakhstan');
            assert(marks.some(src => /\/dsu-aureus-mosaic-128\.webp$/.test(src)), 'The scholarship stage shows Vespi on a coin');
            assert(!marks.some(src => /\/(visa|dsu)-mosaic-/.test(src)), 'The old visa and scholarship medallions are gone');
            assert(await page.locator('[data-stage-mark]').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'Every medallion loads');
          }
        }
      }
      assert.deepEqual(errors, [], `${state} @${width}: no page errors`);
      results.push({ width, state, pages: setup.pages.length });
      await context.close();
    }
  }
  assert.deepEqual(found, [], `Nothing is cut by its container:\n${found.join('\n')}`);
  console.log(JSON.stringify(results));
  console.log('Clip review passed: no ring, shadow or mark is cut on the checked pages at 1440 (with hover), 390 and 320px.');
} finally {
  await browser.close();
  server.close();
}
