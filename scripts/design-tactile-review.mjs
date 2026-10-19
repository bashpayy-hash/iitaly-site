import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const sharp = require('sharp');
const baseline = process.env.TACTILE_BASELINE_OUT;
const output = resolve('design-review/tactile');
await mkdir(output, { recursive: true });
const paletteBefore = execFileSync('git', ['show', `${process.env.TACTILE_BASE_REF || 'aa9520a'}:src/app/globals.css`], { encoding: 'utf8' });
assert.equal(await readFile('src/app/globals.css', 'utf8'), paletteBefore, 'All global color and font tokens are byte-for-byte unchanged');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2', '.txt':'text/plain' };
let root = resolve('out');
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return res.writeHead(403).end();
    for (const file of [path, `${path}.html`, resolve(path, 'index.html')]) {
      if (await stat(file).then(value => value.isFile()).catch(() => false)) {
        res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        return res.end(await readFile(file));
      }
    }
    res.writeHead(404).end();
  } catch { res.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const results = [], errors = [];
let activePage;

function fixture(documentCurrent = false) {
  return {
    ok: true,
    client: { name: 'Тестовый профиль', surname: 'Testov', intakeYear: 2027, tgLinked: false, notify: { telegram:false }, onboardingComplete:true, profile: { education:'NIS Grade 12', goal:'Бакалавриат', budget:'До 3 млн ₸/год', educationPath:'university_kz', onboardingDone:true } },
    roadmap: documentCurrent ? [{ id:'documents', title:'Документы', tasks:[
      { id:'statements', t:'Подготовить банковскую выписку', available:true, owner:'Ты', time:'10 мин' },
      { id:'familyDocs', t:'Собрать справки о доходах', available:false, owner:'родители' },
    ] }] : [{ id:'start', title:'Старт', tasks:[
      { id:'profile', t:'Заполнить профиль', available:true, owner:'Ты' },
      { id:'shortlist', t:'Выбрать программы', explain:'Сравни программы и выбери подходящие.', time:'15 мин', available:true, owner:'Ты', deadline:'2026-11-15', daysLeft:30 },
    ] }, { id:'documents', title:'Документы', tasks:[{ id:'statements', t:'Подготовить банковскую выписку', available:false, owner:'Ты' }] }],
    done: documentCurrent ? {} : { profile:true }, docs:{},
  };
}
function progress(data) {
  const tasks = data.roadmap.flatMap(stage => stage.tasks), done = tasks.filter(task => data.done[task.id]).length;
  return { done, total:tasks.length, pct:tasks.length ? Math.round(done / tasks.length * 100) : 0 };
}
async function environment(width, data) {
  const context = await browser.newContext({ viewport:{ width, height: width < 600 ? 844 : 900 }, locale:'ru-RU', reducedMotion:'reduce' });
  const calls = [];
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (url.pathname === '/api/event') return route.fulfill({ json:{ ok:true } });
    if (url.pathname === '/health/ai') return route.fulfill({ json:{ ok:true, code:'AI_READY' } });
    if (data && url.pathname === '/api/portal/lookup') return route.fulfill({ json:{ ...data, progress:progress(data) } });
    if (data && url.pathname === '/api/check-document') {
      calls.push('check');
      return route.fulfill({ json:{ ok:true, result:{ verdict:'ok', summary:'Синтетический документ прошёл внутреннюю проверку.', checks:[], problems:[], nextSteps:[] } } });
    }
    if (data && url.pathname === '/api/portal/TEST-01/doc') {
      calls.push('save');
      const body = request.postDataJSON();
      assert.equal(body.task, 'statements');
      assert.equal(body.surname, 'Testov');
      data.docs.statements = { result:body.result, verdict:body.result.verdict, fileName:body.fileName };
      data.done.statements = true;
      return route.fulfill({ json:{ ok:true, docs:data.docs, done:data.done, progress:progress(data) } });
    }
    if (url.pathname.startsWith('/api/')) throw new Error(`Unexpected API: ${url.pathname}`);
    return url.origin === origin ? route.continue() : route.abort();
  });
  const page = await context.newPage(); activePage = page;
  page.on('pageerror', error => errors.push(error.message));
  return { context, page, calls };
}
async function visit(page, path) {
  await page.goto(origin + path, { waitUntil:'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}
async function capture(page, name) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${name}: no horizontal overflow`);
  await sharp(await page.screenshot({ animations:'disabled' })).webp({ quality:82 }).toFile(resolve(output, `${name}.webp`));
}
async function login(page) {
  await visit(page, '/portal?auth=login');
  await page.getByLabel('Фамилия', { exact:true }).fill('Testov');
  await page.getByLabel('Код доступа', { exact:true }).fill('TEST-01');
  await page.getByRole('button', { name:'Войти в кабинет', exact:true }).click();
  await page.locator('[data-portal-road]').waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function oneMascot(page, name) {
  const count = await page.locator('img[data-vespi]').evaluateAll(images => images.filter(image => {
    if (image.closest('#chat-launcher, #iitaly-chat')) return false;
    const r = image.getBoundingClientRect();
    return image.checkVisibility({ checkOpacity:true, checkVisibilityCSS:true }) && r.width && r.height && r.top < innerHeight && r.bottom > 0;
  }).length);
  assert(count <= 1, `${name}: one visible content character, found ${count}`);
}
try {
  for (const width of [1440, 390]) {
    const areas = {};
    for (const version of baseline ? ['before', 'after'] : ['after']) {
      root = resolve(version === 'before' ? baseline : 'out');
      const { page, context } = await environment(width);
      await visit(page, '/guides');
      const art = page.locator('[data-section="guides-header"] [data-editorial-art]');
      areas[version] = await art.evaluate(node => { const r=node.parentElement.getBoundingClientRect(); return r.width * r.height; });
      await capture(page, `${version}-guides-${width}`);
      if (version === 'after') {
        await visit(page, '/');
        await page.locator('[data-vespi-editorial]').scrollIntoViewIfNeeded();
        const scene = page.locator('[data-vespi-editorial]');
        await page.waitForFunction(() => {
          const image = document.querySelector('[data-vespi-editorial] img');
          return image?.complete && image.naturalWidth > 0;
        });
        assert(await scene.locator('img').evaluate(image => image.naturalWidth > 0 && /vespi-editorial-route-(480|720)\.webp$/.test(image.currentSrc)), 'Editorial scene uses a decoded responsive approved asset');
        assert(await scene.getByRole('link').evaluate(node => node.getBoundingClientRect().height >= 44), 'Editorial action is touch-sized');
        await oneMascot(page, 'Editorial scene');
        await capture(page, `after-vespi-scene-${width}`);
        await page.addScriptTag({ path:resolve(process.env.REVIEW_TOOLS, 'axe-core/axe.min.js') });
        const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[data-vespi-editorial]'), { runOnly:{ type:'tag', values:['wcag2a','wcag2aa','wcag21aa'] } })).violations.map(v => v.id));
        assert.deepEqual(violations, [], 'New scene passes axe');
      }
      await context.close();
      const cloud = await environment(width, fixture());
      await login(cloud.page);
      await capture(cloud.page, `${version}-portal-overview-${width}`);
      if (version === 'before') {
        await cloud.page.getByRole('link', { name:'План', exact:true }).filter({ visible:true }).click();
        await cloud.page.locator('[data-current="true"]').waitFor();
        await capture(cloud.page, `before-portal-plan-${width}`);
      }
      if (version === 'after') {
        const chrome = await cloud.page.locator('[data-portal-chrome]').evaluate(node => ({ background:getComputedStyle(node).backgroundColor, blur:getComputedStyle(node).backdropFilter }));
        assert.notEqual(chrome.background, 'rgb(255, 255, 255)', 'Pinned chrome is integrated with the warm canvas');
        assert.match(chrome.blur, /blur/, 'Pinned chrome shares frosted header material');
        await cloud.page.getByRole('link', { name:'План', exact:true }).filter({ visible:true }).click();
        await cloud.page.locator('[data-current="true"]').waitFor();
        await cloud.page.waitForFunction(() => document.querySelector('a[aria-current="page"][href*="view=plan"]'));
        const marker = await cloud.page.locator('[data-road-location] > span').evaluate(node => ({ width:getComputedStyle(node).width, height:getComputedStyle(node).height, radius:getComputedStyle(node).borderRadius }));
        assert.deepEqual(marker, { width:'10px', height:'10px', radius:'50%' }, 'The quiet route marker must not morph from the old portrait box');
        results.push({ width, marker });
        await oneMascot(cloud.page, 'Current stage');
        await capture(cloud.page, `after-portal-plan-${width}`);
      }
      await cloud.context.close();
    }
    if (baseline) {
      const growth = areas.after / areas.before;
      assert(growth >= .98, `The approved guide illustration area remains intact: ${growth}`);
      results.push({ width, guideAreaGrowth:Math.round((growth - 1) * 1000) / 10 });
    }
    root = resolve('out');
    const { context, page, calls } = await environment(width, fixture(true));
    await login(page);
    await page.locator('[data-portal-road] [data-road-open]').click();
    const zone = page.locator('[data-portal-upload-zone]');
    await zone.waitFor();
    await oneMascot(page, 'Document upload');
    assert.equal(await page.locator('button[data-primary-action]').count(), 1, 'One current file action');
    await capture(page, `after-portal-upload-${width}`);
    const transfer = await page.evaluateHandle(() => {
      const value = new DataTransfer();
      value.items.add(new File(['Synthetic document for integration review.'], 'synthetic-review.txt', { type:'text/plain' }));
      return value;
    });
    await zone.dispatchEvent('dragover', { dataTransfer:transfer });
    assert.equal(await zone.getAttribute('data-drag'), 'true');
    await zone.dispatchEvent('drop', { dataTransfer:transfer });
    await page.locator('[data-portal-overview]').waitFor({ state:'attached' });
    assert.deepEqual(calls, ['check', 'save'], 'Drop checks once, saves once, and returns to overview');
    await page.getByRole('link', { name:'План', exact:true }).filter({ visible:true }).click();
    await page.locator('[data-portal-task="statements"][data-done="true"]').waitFor();
    await page.locator('[data-portal-task="familyDocs"]').click();
    assert.equal(await page.locator('[data-portal-upload-zone]').count(), 0, 'Future parent document does not expose a drop/upload action');
    await context.close();
    results.push({ width, droppedFileChecks:1, droppedFileSaves:1, futureParentUpload:false });
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }, null, 2));
} catch (error) {
  await writeFile(resolve(output, 'partial-results.json'), JSON.stringify({ results, errors }, null, 2));
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path:resolve(output, 'failure.png') }).catch(() => {});
  throw error;
} finally { await browser.close(); await new Promise(done => server.close(done)); }
