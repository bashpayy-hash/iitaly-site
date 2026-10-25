import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fixture, upstreamProgress } from './portal-review-fixtures.mjs';

// User request 2026-10-25: Vespi never repeats. Each situational pose belongs
// to exactly one place, a screen never shows the same pose twice, and the
// cabinet rewards a saved step with a stamp and a finished stage with its
// souvenir. The round chat avatar is the assistant's identity, not a pose.
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const output = resolve('design-review/vespi-unique');
await mkdir(output, { recursive: true });

const poseSource = await readFile('src/components/mascot/VespiPose.tsx', 'utf8');
const poses = Object.fromEntries([...poseSource.matchAll(/"?([a-z-]+)"?: \{ width: (\d+), height: (\d+), owner: "([^"]+)" \}/g)].map(m => [m[1], { width: +m[2], height: +m[3], owner: m[4] }]));
assert(Object.keys(poses).length >= 14, 'Situational poses are registered');
const owners = Object.values(poses).map(pose => pose.owner);
assert.equal(new Set(owners).size, owners.length, 'Every pose has its own single owner');
const manifest = JSON.parse(await readFile('design/mascot/vespi/handmade-v2.json', 'utf8'));
for (const asset of manifest.production) {
  const body = await readFile(asset.file);
  assert.equal(body.length, asset.bytes, `${asset.file} size`);
  assert.equal(createHash('sha256').update(body).digest('hex'), asset.sha256, `${asset.file} sha256`);
}
for (const name of Object.keys(poses)) for (const width of [280, 560]) assert(manifest.production.some(asset => asset.file === `public/mascot/handmade-v2/${name}-${width}.webp`), `${name}-${width} is recorded`);

const root = resolve('out'), mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.avif': 'image/avif' };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return res.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path, 'index.html')]) if (await stat(file).then(s => s.isFile()).catch(() => false)) {
      res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }); return res.end(await readFile(file));
    }
    res.writeHead(404).end();
  } catch { res.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`, browser = await chromium.launch();
const results = [], errors = [], placements = new Map();

// Every visible mascot picture, keyed by pose (size suffix removed) and by the
// place that owns it on the page.
async function mascots(page, label) {
  const found = await page.evaluate(() => [...document.querySelectorAll('img')].filter(img => /\/mascot\//.test(img.currentSrc || img.src)).filter(img => {
    const box = img.getBoundingClientRect(), style = getComputedStyle(img);
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && !img.hidden && !img.closest('[hidden]');
  }).map(img => {
    const src = new URL(img.currentSrc || img.src).pathname;
    const place = img.closest('[data-portal-now]') ? 'portal-focus' : img.closest('[data-portal-completion]') ? 'portal-reward'
      : img.closest('[data-portal-action-error]') ? 'portal-error' : img.closest('[data-portal-profile]') ? 'portal-onboarding'
      : img.closest('[data-vespi-guide-peek]') ? 'guides-invite' : img.closest('[data-vespi-intro]') ? 'home-intro'
      : img.closest('[data-vespi-assistant-avatar],[data-vespi-scene=chat]') || img.hasAttribute('data-vespi-assistant-avatar') ? 'assistant' : 'other:' + (img.closest('section,aside,header,div')?.className || '');
    return { pose: src.replace(/^\/mascot\//, '').replace(/-\d+\.webp$/, ''), place };
  }));
  const shown = found.filter(item => !item.pose.endsWith('avatar'));
  assert.equal(new Set(shown.map(item => item.pose)).size, shown.length, `${label}: the same pose is never shown twice on one screen`);
  for (const { pose, place } of found) {
    if (!placements.has(pose)) placements.set(pose, new Set());
    placements.get(pose).add(place);
  }
  return found;
}

async function portal(viewport, mode, data = fixture(mode)) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', locale: 'ru-RU' });
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url()), json = value => route.fulfill({ json: value });
    if (url.pathname === '/api/event') return json({ ok: true });
    if (url.pathname === '/health/ai') return json({ ok: true, code: 'AI_READY' });
    if (url.pathname === '/api/portal/lookup') return json({ ...data, progress: upstreamProgress(data) });
    if (url.pathname === '/api/portal/TEST-01/task') { const body = req.postDataJSON(); data.done[body.task] = body.value; return json({ ok: true, done: data.done, progress: upstreamProgress(data) }); }
    if (url.pathname.startsWith('/api/')) return route.abort();
    return url.origin === origin ? route.continue() : route.abort();
  });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/portal?auth=login', { waitUntil: 'networkidle' });
  await page.getByLabel('Фамилия', { exact: true }).fill('Testov');
  await page.getByLabel('Код доступа', { exact: true }).fill('TEST-01');
  await page.getByRole('button', { name: 'Войти в кабинет', exact: true }).click();
  await page.locator(mode === 'onboarding' ? '[data-portal-profile]' : '[data-portal-overview]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  return { page, context, data };
}
const decoded = page => page.evaluate(() => Promise.all([...document.images].filter(img => /\/mascot\/|\/illustrations\/riso\//.test(img.currentSrc || img.src)).map(img => img.decode().catch(() => {}))));

try {
  for (const width of [390, 1440]) {
    const viewport = { width, height: width < 600 ? 844 : 900 };
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await context.route(/example\.invalid/, route => route.abort());
    for (const route of ['/', '/prices', '/plan', '/universities', '/guides', '/portal', '/portal?auth=login']) {
      const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); });
      await decoded(page);
      await mascots(page, `${route} ${width}`);
      await page.close();
    }
    await context.close();

    // Overview: one costume for the current stage in the Now plate.
    {
      const { page, context } = await portal(viewport, 'screenshot-parent');
      await decoded(page);
      const now = page.locator('[data-portal-now]');
      const stage = await now.getAttribute('data-now-stage');
      assert.equal(await now.locator('img[data-vespi-pose]').count(), 1, 'Exactly one Vespi in the Now plate');
      assert.equal(await now.locator('img[data-vespi-pose]').getAttribute('data-vespi-pose'), poses[`stage-${stage === 'education12' ? 'education' : stage}`] ? `stage-${stage === 'education12' ? 'education' : stage}` : null, 'The Now plate wears the current stage costume');
      assert.match(await page.locator('[data-now-stage-label]').textContent(), /^Этап \d+ из \d+ · /, 'The plate names one stage of the route');
      const tally = page.locator('[data-stage-stamps]');
      assert.match(await tally.innerText(), /Штампы: \d+ \/ \d+/);
      assert.equal(await page.locator('[data-stage-souvenir] img[data-riso-art]').count(), 1, 'The stage shows the souvenir it awards');
      assert.equal(await page.locator('main img[data-vespi-pose]').count(), 1, 'One mascot on the overview');
      await mascots(page, `overview ${width}`);
      await page.screenshot({ path: resolve(output, `overview-${width}.png`) });
      await context.close();
    }

    // A saved step earns a stamp; the reward never appears on load.
    {
      const { page, context } = await portal(viewport, 'manual');
      assert.equal(await page.locator('[data-portal-completion][data-visible=true]').count(), 0, 'No reward on login');
      const before = await page.locator('[data-stage-stamps] [data-stamp][data-stamped=true]').count();
      await page.locator('[data-task-ready="manual-task"]').click();
      const reward = page.locator('[data-portal-completion][data-visible=true]');
      await reward.waitFor();
      assert.equal(await reward.getAttribute('data-reward'), 'step');
      assert.equal(await reward.locator('img[data-vespi-pose=stamp]').count(), 1, 'The stamping pose rewards one step');
      assert.match(await reward.textContent(), /Штамп получен/);
      assert.match(await reward.locator('[data-reward-tally]').innerText(), /из \d+/);
      await page.waitForTimeout(500);
      assert.equal(await page.locator('[data-stage-stamps] [data-stamp][data-stamped=true]').count(), before + 1, 'The stage gains exactly one stamp');
      await decoded(page);
      await mascots(page, `step reward ${width}`);
      await page.screenshot({ path: resolve(output, `reward-step-${width}.png`) });
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('[data-portal-overview]').waitFor({ state: 'attached' }).catch(() => {});
      assert.equal(await page.locator('[data-portal-completion][data-visible=true]').count(), 0, 'Reload never replays a reward');
      await context.close();
    }

    // The last step of a stage awards the stage souvenir.
    {
      const { page, context } = await portal(viewport, 'last');
      await page.locator('[data-task-ready="manual-task"]').click();
      const reward = page.locator('[data-portal-completion][data-visible=true]');
      await reward.waitFor();
      assert.equal(await reward.getAttribute('data-reward'), 'stage');
      assert.equal(await reward.locator('img[data-vespi-pose=celebrate]').count(), 1);
      assert.equal(await reward.locator('img[data-riso-art=keys]').count(), 1, 'The arrival stage awards its keys');
      assert.match(await reward.textContent(), /Этап пройден/);
      await page.waitForTimeout(500);
      assert.equal(await page.locator('[data-stage-reward=earned]').count(), 1, 'The souvenir unlocks in the stage');
      await decoded(page);
      await mascots(page, `stage reward ${width}`);
      await page.screenshot({ path: resolve(output, `reward-stage-${width}.png`) });
      await context.close();
    }

    // First run: one thinking pose beside the questions.
    {
      const { page, context } = await portal(viewport, 'onboarding');
      await decoded(page);
      assert.equal(await page.locator('[data-portal-profile] img[data-vespi-pose=thinking]').count(), 1);
      await mascots(page, `onboarding ${width}`);
      await context.close();
    }
    results.push({ test: `${width}px: unique poses, stage costume, step stamp and stage souvenir`, passed: true });
  }

  for (const [pose, places] of placements) {
    if (pose.endsWith('avatar')) continue;
    assert.equal(places.size, 1, `${pose} appears in one place only, found ${[...places].join(', ')}`);
    const name = pose.replace(/^handmade-v2\//, '');
    if (poses[name]) assert(poses[name].owner.startsWith([...places][0]), `${name} sits where its owner says (${poses[name].owner})`);
  }
  results.push({ test: 'Every visible pose belongs to a single place across the site', passed: true, placements: Object.fromEntries([...placements].map(([pose, places]) => [pose, [...places]])) });
  assert.deepEqual(errors, [], 'No browser runtime errors');
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, errors }, null, 2));
  await browser.close();
  await new Promise(done => server.close(done));
}
console.log(JSON.stringify(results, null, 2));
