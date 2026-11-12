// Owner 12 Nov 2026 («мы даём слишком много информации бесплатно… надо
// продумать, где именно сколько дать, чтобы уже брали и покупали»): the
// guide wall. A guest reads the title and the first sentence of every step
// and visa point (a single-sentence point stays closed whole), one sample
// topic in full (Codice fiscale), the visa key facts and the funds
// calculator, the first Modulo 1 sheet and two of four reference tools. Every
// closed place shows the same purchase as /plan. Closed text beyond the first
// sentence is never in the static HTML, the page data or the description. A
// device that holds a paid cabinet reads everything. (9 Nov: about 40% open.)
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS || '/tmp/iitaly-browser/node_modules', 'playwright'));
const root = resolve('out'), output = resolve('design-review/guides-access');
await mkdir(output, { recursive: true });
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
await new Promise(done => server.listen(4207, '127.0.0.1', done));
const base = 'http://127.0.0.1:4207';
const browser = await chromium.launch(process.env.REVIEW_BROWSER ? { executablePath: process.env.REVIEW_BROWSER, args: ['--no-sandbox'] } : {});
const results = [];

async function contextFor({ paid, width = 1280 }) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', locale: 'ru-RU' });
  const events = [], errors = [];
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.pathname === '/api/event') events.push(JSON.parse(route.request().postData() || '{}'));
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  if (paid) await context.addInitScript(() => localStorage.setItem('iitaly_portal_code', 'review-paid'));
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  return { context, page, events, errors };
}
const visit = async (page, path) => { await page.goto(base + path, { waitUntil: 'networkidle' }); await page.waitForTimeout(250); };

try {
  // Paid device first: it reads every closed step, which gives the texts the
  // guest view must never receive.
  const paid = await contextFor({ paid: true });
  const stepPaths = [];
  for (const topic of await readdir(resolve(root, 'guides'))) {
    if (['visa', 'stages', 'permesso-modulo-1'].includes(topic) || !(await stat(resolve(root, 'guides', topic)).then(s => s.isDirectory()))) continue;
    for (const name of await readdir(resolve(root, 'guides', topic))) if (/^\d+\.html$/.test(name)) stepPaths.push(`/guides/${topic}/${name.replace('.html', '')}`);
  }
  assert(stepPaths.length >= 40, `The export holds every topic step (${stepPaths.length})`);
  const steps = [];
  for (const path of stepPaths) {
    await visit(paid.page, path);
    await paid.page.locator('[data-guide-step-body]').waitFor();
    steps.push({ path, text: (await paid.page.locator('[data-guide-step-body]').innerText()).replace(/^\d+\n/gm, '').trim(),
      items: await paid.page.locator('[data-guide-step-body] li').count() || 1 });
  }
  assert.equal(await paid.page.locator('[data-wall-buy]').count(), 0, 'A paid device sees no wall');
  await visit(paid.page, '/guides/con');
  assert.match(await paid.page.locator('[data-guide-road=con] [data-path-caption]').innerText(), /всё открыто/);
  assert.equal(await paid.page.locator('[data-guide-road] [data-node-locked]').count(), 0, 'Paid: no lock on the road');
  await visit(paid.page, '/guides/visa/documents?point=4');
  assert.equal(await paid.page.locator('[data-wall-buy]').count(), 0);
  assert.equal(await paid.page.locator('[data-path-stop][data-locked]').count(), 0, 'Paid: no lock on the path');
  assert.match(await paid.page.locator('[data-path-caption]').innerText(), /вход в кабинет/, 'Paid: the path says why all is open');
  // Owner, 12 Nov («не вижу дозирования»): the overview says why all is open on a paid device.
  await visit(paid.page, '/guides/education');
  assert.equal(await paid.page.locator('[data-guide-dose=paid]').count(), 1, 'Paid: the overview says why all is open');
  assert.equal(await paid.page.locator('[data-wall-buy]').count(), 0);
  // «Глазами того, кто ещё не оплатил»: ?guest=1 shows the walls on a paid device for this tab; ?guest=0 returns.
  await visit(paid.page, '/guides/education/2?guest=1');
  assert.equal(await paid.page.locator('[data-wall-buy][data-wall-place="guide-step"]').count(), 1, 'Guest view shows the step wall');
  await visit(paid.page, '/guides/education/3');
  assert.equal(await paid.page.locator('[data-wall-buy][data-wall-place="guide-step"]').count(), 1, 'Guest view lasts for the tab');
  await visit(paid.page, '/guides/education?guest=0');
  assert.equal(await paid.page.locator('[data-guide-dose=paid]').count(), 1, '?guest=0 returns to the paid view');
  await visit(paid.page, '/guides/permesso-modulo-1?scenario=rilascio&page=2');
  await paid.page.locator('[data-sheet-page]').first().waitFor();
  assert.equal(await paid.page.locator('[data-permesso-locked-page], [data-permesso-transfer-locked]').count(), 0, 'Paid: the whole trainer');
  await visit(paid.page, '/guides/permesso-modulo-1/kody?tool=25');
  assert.equal(await paid.page.locator('#permesso-panel-25 [data-wall-buy]').count(), 0);
  assert.deepEqual(paid.events.filter(event => event.event === 'wall_seen'), [], 'A paid device reports no wall');
  assert.deepEqual(paid.errors, []);
  await paid.context.close();

  // Guest: the cut, the wall on every closed place, and no closed text anywhere in the export.
  const guest = await contextFor({ paid: false });
  const closed = [], open = [];
  for (const step of steps) {
    await visit(guest.page, step.path);
    const locked = await guest.page.locator('[data-guide-step-locked]').count();
    if (locked) {
      closed.push(step);
      assert.equal(await guest.page.locator('[data-guide-step-body]').count(), 0, `${step.path}: no body before payment`);
      const lead = await guest.page.locator('[data-guide-step-lead]').count();
      assert.equal(lead, step.items > 1 ? 1 : 0, `${step.path}: a lead only when the step has more than one sentence`);
      if (lead) {
        const shown = (await guest.page.locator('[data-guide-step-lead] p').innerText()).replace(/…$/, '');
        assert(step.text.split('\n')[0].startsWith(shown), `${step.path}: the lead is the first sentence`);
        step.lead = true;
      }
      assert.equal(await guest.page.locator('[data-guide-step-locked] li').count(), Math.max(1, step.items - lead), `${step.path}: empty points for the rest of the step`);
      assert.equal(await guest.page.locator('[data-wall-buy][data-wall-place="guide-step"]').count(), 1, `${step.path}: one wall`);
      const description = await guest.page.locator('meta[name="description"]').getAttribute('content');
      assert.match(description, /Разбор откроется с маршрутом/, `${step.path}: neutral description`);
    } else {
      open.push(step);
      assert.equal(await guest.page.locator('[data-wall-buy]').count(), 0, `${step.path}: an open step has no wall`);
      assert.equal((await guest.page.locator('[data-guide-step-body]').innerText()).replace(/^\d+\n/gm, '').trim(), step.text);
    }
  }
  assert.deepEqual(open.map(step => step.path).sort(), steps.filter(step => step.path.startsWith('/guides/codice/')).map(step => step.path).sort(), `Only the sample topic is open in full (${open.length}/${steps.length})`);
  const exported = [];
  const walk = async dir => { for (const name of await readdir(dir)) { const path = join(dir, name); if ((await stat(path)).isDirectory()) await walk(path); else if (/\.(html|txt)$/.test(name) && /guides/.test(path)) exported.push([path, await readFile(path, 'utf8')]); } };
  await walk(root);
  for (const step of closed) for (const [position, line] of step.text.split('\n').entries()) {
    if (position === 0 && step.lead) continue; // the first sentence is public on purpose
    const probe = line.trim().slice(0, 48);
    // Short lines prove nothing; the permesso cost badge quotes this one figure on purpose.
    if (probe.length < 24 || /для взрослого при сроке свыше 3 месяцев/.test(probe)) continue;
    const hits = exported.filter(([, html]) => html.includes(probe)).map(([path]) => path.slice(root.length));
    assert.deepEqual(hits, [], `Closed text stays out of the export: «${probe}»`);
  }
  // Owner 10 Nov: the step and visa points stand on a progress path; closed stops carry a lock.
  await visit(guest.page, '/guides/iseeu/2');
  assert.equal(await guest.page.locator('[data-story-path] [data-path-stop]').count(), 5);
  assert.equal(await guest.page.locator('[data-story-path] [data-path-stop][aria-current=step]').getAttribute('data-path-stop'), '1');
  assert.equal(await guest.page.locator('[data-story-path] [data-path-stop][data-locked]').count(), 5, 'Every stop is closed outside the sample topic');
  assert.match(await guest.page.locator('[data-path-caption]').innerText(), /Открыта первая фраза каждого шага/);
  await visit(guest.page, '/guides/visa/timeline?point=2');
  assert.equal(await guest.page.locator('[data-story-path] [data-path-stop][data-locked]').count(), 5);
  assert.equal(await guest.page.locator('[data-instruction-point] img').count(), 1, 'The point carries an object on its topic');
  await guest.page.locator('[data-path-stop="3"]').click();
  await guest.page.waitForURL('**point=4');
  assert.equal(await guest.page.locator('[data-wall-buy][data-wall-place="visa"]').count(), 1, 'A closed stop opens its wall');
  // Topic page: every step closed, the caption says what is open; nothing counts as read.
  await visit(guest.page, '/guides/education');
  assert.match(await guest.page.locator('[data-guide-road=education] [data-path-caption]').innerText(), /у каждого шага открыта первая фраза/);
  assert.equal(await guest.page.locator('[data-guide-road=education] [data-node-locked]').count(), 5, 'Closed steps carry a lock on the road');
  assert.equal(await guest.page.locator('[data-guide-road=education] [data-node-state=done]').count(), 0);
  // The sample topic: the guest above has read both steps, both are green.
  await visit(guest.page, '/guides/codice');
  assert.equal(await guest.page.locator('[data-guide-road=codice] [data-node-locked]').count(), 0, 'The sample topic has no lock');
  assert.equal(await guest.page.locator('[data-guide-road=codice] [data-node-state=done]').count(), 2);
  // A fresh visitor: the first step of the sample is «начни здесь»; reading it moves the star on.
  const fresh = await contextFor({ paid: false });
  await visit(fresh.page, '/guides/codice');
  assert.equal(await fresh.page.locator('[data-guide-road=codice] [data-road-node="codice/1"]').getAttribute('aria-current'), 'step');
  await visit(fresh.page, '/guides/codice/1');
  await visit(fresh.page, '/guides/codice');
  assert.equal(await fresh.page.locator('[data-guide-road=codice] [data-node-state=done]').count(), 1);
  assert.equal(await fresh.page.locator('[data-guide-road=codice] [data-road-node="codice/2"]').getAttribute('aria-current'), 'step', 'The next open step is «читать дальше»');
  assert.deepEqual(await fresh.page.evaluate(() => JSON.parse(localStorage.getItem('iitaly_guides_read_v1'))), ['codice/1'], 'Only page keys are stored');
  await fresh.context.close();
  await visit(guest.page, '/guides/visa');
  assert.equal(await guest.page.locator('[data-guide-road=visa] [data-road-node]').count(), 19, 'The visa road holds every point');
  assert.equal(await guest.page.locator('[data-guide-road=visa] [data-road-stage]').count(), 4);
  assert.equal(await guest.page.locator('[data-guide-road=visa] [data-node-locked]').count(), 18, 'Every visa point is closed; the funds calculator is open');
  await visit(guest.page, '/guides');
  assert.equal(await guest.page.locator('[data-guide-road=guides] [data-road-node]').count(), 13, 'The guides road: every topic');
  await visit(guest.page, '/guides/education');
  await guest.page.screenshot({ path: resolve(output, 'topic-guest.png'), fullPage: true });
  // The wall opens the same purchase as /plan.
  await visit(guest.page, '/guides/con/2');
  await guest.page.screenshot({ path: resolve(output, 'step-guest.png'), fullPage: true });
  await guest.page.locator('[data-wall-buy]').click();
  await guest.page.getByRole('dialog').waitFor();
  assert.match(await guest.page.getByRole('dialog').innerText(), /10\s990\s₸/);
  assert.equal(await guest.page.locator('a[href="/portal?view=login"]').count() > 0, true, 'A paid visitor on another device can sign in');
  // Visa: key facts and the calculator stay open; every point shows its title and first sentence behind a wall.
  for (const [path, wall] of [['/guides/visa', false], ['/guides/visa/funds', false], ['/guides/visa/timeline?point=1', true], ['/guides/visa/timeline?point=2', true], ['/guides/visa/timeline?point=3', true],
    ['/guides/visa/documents?point=1', true], ['/guides/visa/documents?point=4', true], ['/guides/visa/documents?point=8', true], ['/guides/visa/before-application?point=1', true], ['/guides/visa/before-application?point=2', true]]) {
    await visit(guest.page, path);
    assert.equal(await guest.page.locator('[data-wall-buy][data-wall-place="visa"]').count(), wall ? 1 : 0, `${path}: wall ${wall}`);
  }
  // Owner, 12 Nov: every overview says what is free and what the route opens, with the same purchase.
  for (const path of ['/guides/education', '/guides/codice', '/guides/visa']) {
    await visit(guest.page, path);
    assert.equal(await guest.page.locator('[data-guide-dose=guest] [data-wall-buy][data-wall-place="guide-overview"]').count(), 1, `${path}: free and paid side by side`);
  }
  await visit(guest.page, '/guides');
  assert.equal(await guest.page.locator('[data-guide-road=guides] [data-node-locked]').count(), 11, 'The guides road locks every topic whose steps are all closed');
  await visit(guest.page, '/guides/visa/documents?point=4');
  assert.equal(await guest.page.getByRole('button', { name: 'Отметить собранным' }).count(), 1, 'The checklist itself stays usable');
  // Modulo 1: the application sheet open, sheets 2–3 and the transfer closed, two of four tools open.
  await visit(guest.page, '/guides/permesso-modulo-1?scenario=rilascio&page=1');
  await guest.page.locator('[data-sheet-page]').first().waitFor();
  assert.equal(await guest.page.locator('[data-permesso-locked-page]').count(), 0);
  assert.equal(await guest.page.locator('[data-permesso-transfer-locked] [data-wall-buy]').count(), 1);
  await visit(guest.page, '/guides/permesso-modulo-1?scenario=rilascio&page=2');
  assert.equal(await guest.page.locator('[data-permesso-locked-page="2"] [data-wall-buy]').count(), 1);
  assert.equal(await guest.page.locator('[data-permesso-inspector]').count(), 0, 'No field guidance on a closed sheet');
  await guest.page.screenshot({ path: resolve(output, 'trainer-guest.png') });
  for (const [tool, wall] of [['16', false], ['sigla', false], ['25', true], ['paese', true]]) {
    await visit(guest.page, `/guides/permesso-modulo-1/kody?tool=${tool}`);
    assert.equal(await guest.page.locator(`#permesso-panel-${tool} [data-wall-buy]`).count(), wall ? 1 : 0, `Tool ${tool}: wall ${wall}`);
    assert.equal(await guest.page.locator('[data-wall-buy]').count(), wall ? 1 : 0, 'A hidden tool mounts no wall');
  }
  await visit(guest.page, '/guides/permesso-modulo-1/pochta');
  assert.equal(await guest.page.locator('[data-permesso-locked-checklist] [data-wall-buy]').count(), 1);
  assert.equal(await guest.page.locator('[data-wall-buy]').count(), 1, 'Paper and money stay open');
  const places = new Set(guest.events.filter(event => event.event === 'wall_seen').map(event => event.props?.place));
  assert.deepEqual([...places].sort(), ['guide-overview', 'guide-step', 'permesso', 'visa'], 'wall_seen carries only the place');
  assert(guest.events.every(event => JSON.stringify(event.props || {}).length < 120), 'No personal data in wall events');
  assert.deepEqual(guest.errors, []);
  await guest.context.close();

  // Phone: the wall fits the column, nothing scrolls sideways.
  const phone = await contextFor({ paid: false, width: 390 });
  for (const path of ['/guides/con/2', '/guides/visa/documents?point=4', '/guides/permesso-modulo-1?scenario=rilascio&page=3', '/guides/permesso-modulo-1/pochta']) {
    await visit(phone.page, path);
    assert(await phone.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path}: no sideways scroll`);
    const box = await phone.page.locator('[data-wall-buy]').first().boundingBox();
    assert(box && box.width >= 280 && box.height >= 44, `${path}: a full-width, tappable purchase`);
  }
  await phone.page.screenshot({ path: resolve(output, 'pochta-phone.png'), fullPage: true });
  await phone.context.close();
  results.push({ passed: true, open: `${open.length}/${steps.length}`, checks: 'paid device reads all; guest reads first sentences and the sample topic; closed text absent from export and descriptions; wall per closed place; same purchase; visa points; Modulo 1 sheets, transfer and tools; wall_seen only for guests; phone fit' });
} finally {
  await browser.close();
  server.close();
}
await writeFile(resolve(output, 'results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
