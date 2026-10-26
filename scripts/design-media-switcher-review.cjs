const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const tools = process.env.REVIEW_TOOLS;
const { chromium } = require(path.join(tools, 'playwright'));
const out = path.resolve('out'), destination = path.resolve('design-review/media-switcher');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2', '.jpg':'image/jpeg' };
(async () => {
  await fs.mkdir(destination, { recursive:true });
  const server = createServer(async (req, res) => {
    const requested = path.resolve(out, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!requested.startsWith(out + path.sep) && requested !== out) return res.writeHead(403).end();
    for (const file of [requested, requested + '.html', path.join(requested, 'index.html')]) {
      try { if ((await fs.stat(file)).isFile()) { res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); return res.end(await fs.readFile(file)); } } catch {}
    }
    res.writeHead(404).end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ executablePath:process.env.REVIEW_CHROMIUM, args:['--no-sandbox', '--disable-dev-shm-usage'] });
  const errors = [], results = [];
  try {
    const context = await browser.newContext({ viewport:{ width:1440, height:900 }, reducedMotion:'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height:900 });
      for (const route of ['/', '/guides', '/guides/tests', '/guides/cimea', '/guides/stages/prepare', '/guides/visa', '/guides/visa/documents', '/guides/visa/timeline', '/prices']) {
        await page.goto(origin + route, { waitUntil:'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(async () => { for (const image of document.images) image.loading = 'eager'; await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, route + ' must not overflow');
        assert.equal(await page.locator('#main > [data-paper-grain]').evaluate(element => Number(getComputedStyle(element).opacity)), width <= 600 ? .07 : .08);
        for (const image of await page.locator('[data-story-art] img').all()) assert(await image.evaluate(element => element.naturalWidth > 0), 'Illustration must resolve');
        if (route === '/') {
          const switcher = page.locator('[data-university-switcher]');
          assert.match(await switcher.getByRole('tabpanel').innerText(), /Padova/);
          await switcher.getByRole('tab', { name:'LUISS Guido Carli' }).click();
          assert.match(await switcher.getByRole('tabpanel').innerText(), /LUISS/);
          assert.doesNotMatch(await switcher.getByRole('tabpanel').innerText(), /Padova/);
          await switcher.getByRole('tab', { name:'LUISS Guido Carli' }).press('Home');
          assert.equal(await switcher.getByRole('tab').first().getAttribute('aria-selected'), 'true');
          assert.equal(await page.locator('[data-vespi-intro=home]').count(), 1);
          for (const link of await page.locator('[data-public-bento] a').all()) assert.equal((await context.request.get(origin + await link.getAttribute('href'))).status(), 200);
        }
        if (route === '/guides/tests') {
          const switcher = page.locator('[data-media-switcher]');
          assert.equal(await switcher.locator('[data-instruction-point]').count(), 1);
          assert.doesNotMatch(await page.locator('article').innerText(), /Padova|Падов/);
          await switcher.getByRole('button', { name:'Далее', exact:true }).click();
          assert.equal(new URL(page.url()).searchParams.get('point'), '2');
          assert.match(await switcher.locator('[data-instruction-point]').innerText(), /Результат/);
          await page.reload({ waitUntil:'networkidle' });
          assert.equal(await page.locator('[data-instruction-point="2"]').count(), 1);
          await page.goBack();
          await page.locator('[data-instruction-point="1"]').waitFor();
          const first = page.locator('[data-story-pill="0"]');
          await first.focus(); await first.press('ArrowRight');
          await page.locator('[data-instruction-point="2"]').waitFor();
          assert.equal(await page.evaluate(() => document.activeElement.dataset.storyPill), '1');
          assert.equal(await page.locator('[data-instruction-point]').evaluate(element => getComputedStyle(element).animationName), 'none');
        }
        if (route === '/guides/visa/documents') {
          await page.getByRole('button', { name:'Отметить собранным' }).click();
          await page.getByRole('button', { name:'Далее', exact:true }).click();
          await page.getByRole('button', { name:'Назад', exact:true }).click();
          assert.equal(await page.getByRole('button', { name:'Собрано — снять отметку' }).getAttribute('aria-pressed'), 'true');
        }
        if (width !== 320) {
          await page.addScriptTag({ path:path.join(tools, 'axe-core/axe.min.js') });
          const violations = await page.evaluate(async () => (await axe.run(document, { runOnly:{ type:'tag', values:['wcag2a','wcag2aa','wcag21aa'] } })).violations.map(item => ({ id:item.id, nodes:item.nodes.map(node => ({ target:node.target, summary:node.failureSummary })) })));
          assert.deepEqual(violations, [], `${route}: accessibility`);
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path:path.join(destination, `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}-${width}.png`), fullPage:true });
        }
        results.push({ route, width }); console.log(width, route, 'passed');
      }
    }
    assert.deepEqual(errors, []);
    await fs.writeFile(path.join(destination, 'results.json'), JSON.stringify({ results, errors }, null, 2));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
