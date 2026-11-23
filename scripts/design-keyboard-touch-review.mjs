import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

// The keyboard's ring and the finger's room. Owner, 23 Nov: «прогони через
// этот плагин» (taste-skill's checker, run over the built site at 390 and
// 1440px). What it found and this review now holds:
//   1. globals.css draws the ring of every focused control in a colour whose
//      name had left the theme, so the declaration was dropped and whatever had
//      no ring of its own had none: the chat button, the cities of the map.
//   2. On the dark band of /guides the ring of «Подробнее» was the page
//      shell's dark one, 1.11:1 off the ground.
//   3. Five filter chips of /universities broke into three lines on a phone.
//   4. Two links stood lower than a thumb (44px) and a dozen carousel dots stood
//      14px apart under it. (The «Тест» badge it also held, 4.1:1, left the
//      site with the friends' test purchase on 23 Nov, at the launch.)
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out'), output = resolve('design-review/keyboard-touch');
await mkdir(output, { recursive: true });

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
const results = [];

const channels = colour => colour.match(/[\d.]+/g).map(Number);
const luminance = colour => { const [r, g, b] = channels(colour).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05); };

// What a control shows when the keyboard reaches it. A key is pressed first:
// the browser draws :focus-visible only while the keyboard is in use.
async function ring(page, locator) {
  await page.keyboard.press('Tab');
  await locator.focus();
  return locator.evaluate(node => {
    const style = getComputedStyle(node);
    let ground = null;
    for (let up = node.parentElement; up && !ground; up = up.parentElement) {
      const colour = getComputedStyle(up).backgroundColor, parts = colour.match(/[\d.]+/g).map(Number);
      if (parts[3] === undefined || parts[3] > .6) ground = colour;
    }
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), colour: style.outlineColor, ground: ground || getComputedStyle(document.body).backgroundColor };
  });
}
function assertRing(found, where, ground = found.ground) {
  assert.equal(found.style, 'solid', `${where}: a focused control has a ring`);
  assert(found.width >= 2, `${where}: the ring is at least 2px (${found.width}px)`);
  const ratio = contrast(found.colour, ground);
  assert(ratio >= 3, `${where}: the ring ${found.colour} stands ${ratio.toFixed(2)}:1 off ${ground}, 3:1 needed`);
}

try {
  for (const width of [1440, 390]) {
    const phone = width < 600;
    const context = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, hasTouch: phone, isMobile: phone, reducedMotion: 'reduce', locale: 'ru-RU' });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const visit = async path => { await page.goto(origin + path, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready); };

    // 1. The global ring has its colour on every shell of the site, and a
    //    control with no ring of its own shows it.
    for (const path of ['/', '/prices', '/universities', '/guides', '/portal']) {
      await visit(path);
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-rosso').trim()), '', `${path} ${width}: the focus ring's colour is defined`);
    }
    await visit('/');
    // The chat's own button takes the place of the light one the page starts
    // with once the browser is idle; only it carries tabindex. Wait for it, so
    // the ring is read on the button that stays.
    const launcher = page.locator('#chat-launcher[tabindex]');
    await launcher.waitFor();
    assertRing(await ring(page, launcher), `/ ${width}: the chat button`);

    // The cities of the map are drawn in SVG on the dark map: the ground is the map's.
    await visit('/universities');
    const city = page.locator('svg g[role=button]').first();
    await city.waitFor();
    const cityRing = await ring(page, city);
    assertRing(cityRing, `/universities ${width}: a city of the map`, 'rgb(21, 17, 11)');
    if (!phone) await page.screenshot({ path: resolve(output, 'focus-city.png'), clip: await city.evaluate(node => { const r = node.getBoundingClientRect(); return { x: Math.max(0, r.x - 80), y: Math.max(0, r.y - 80), width: r.width + 160, height: r.height + 160 }; }) });

    // 2. On the dark band of /guides the ring is the light one.
    await visit('/guides');
    const more = page.locator('[data-guide-band] [data-guide-select]').first();
    await more.waitFor();
    const moreRing = await ring(page, more);
    assertRing(moreRing, `/guides ${width}: «Подробнее» on the dark band`);
    assert(luminance(moreRing.ground) < .1, `/guides ${width}: the band is dark (${moreRing.ground})`);

    // 4. Under a finger the dots only show the place; a mouse still picks a card by its dot.
    const dot = page.locator('[data-carousel-dot]').first();
    if (await dot.count()) assert.equal(await dot.evaluate(node => getComputedStyle(node).pointerEvents), phone ? 'none' : 'auto', `/guides ${width}: the carousel dots ${phone ? 'do not take a tap' : 'take a click'}`);

    // 4. On a phone the link under the purchase stands as tall as a thumb.
    await visit('/prices');
    if (phone) {
      for (const [name, selector] of [['the WhatsApp link under the purchase', '[data-pricing-refund] a']]) {
        const height = await page.locator(selector).first().evaluate(node => node.getBoundingClientRect().height);
        assert(height >= 44, `/prices ${width}: ${name} is ${Math.round(height)}px tall, 44px needed`);
      }
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `/prices ${width}: no sideways scroll`);

    // 3. The filter chips of /universities: one row on a phone, swiped sideways
    //    inside the card; from a tablet up they wrap as before.
    for (const narrow of phone ? [390, 320] : [1440]) {
      await page.setViewportSize({ width: narrow, height: phone ? 844 : 900 });
      await visit('/universities');
      const row = page.locator('[role=group][aria-label="Тип университета"]').locator('xpath=..');
      await row.scrollIntoViewIfNeeded();
      const filters = await row.evaluate(node => {
        const style = getComputedStyle(node), chips = [...node.querySelectorAll('button')];
        return { overflow: style.overflowX, room: parseFloat(style.paddingTop), rows: new Set(chips.map(chip => Math.round(chip.getBoundingClientRect().top))).size, chips: chips.length,
          scroll: node.scrollWidth, client: node.clientWidth, heights: chips.map(chip => Math.round(chip.getBoundingClientRect().height)), page: document.documentElement.scrollWidth - innerWidth };
      });
      assert.equal(filters.chips, 5, `/universities ${narrow}: five filter chips`);
      assert.equal(filters.page, 0, `/universities ${narrow}: no sideways scroll of the page`);
      if (phone) {
        assert.equal(filters.rows, 1, `/universities ${narrow}: the chips stand in one row`);
        assert.equal(filters.overflow, 'auto', `/universities ${narrow}: the row is swiped sideways`);
        assert(filters.scroll > filters.client, `/universities ${narrow}: the row holds more than the card shows (${filters.scroll} in ${filters.client})`);
        assert(filters.room >= 6, `/universities ${narrow}: the row leaves room for the keyboard's ring (${filters.room}px)`);
        assert(filters.heights.every(height => height >= 44), `/universities ${narrow}: every chip is as tall as a thumb (${filters.heights.join(', ')})`);
        // The last chip is reached: by the keyboard it comes into the row whole.
        const last = row.locator('button').last();
        await page.keyboard.press('Tab');
        await last.focus();
        const reach = await row.evaluate(node => { const box = node.getBoundingClientRect(), chip = [...node.querySelectorAll('button')].at(-1).getBoundingClientRect(); return { left: chip.left - box.left, right: box.right - chip.right }; });
        assert(reach.left >= 0 && reach.right >= 0, `/universities ${narrow}: the last chip comes into the row whole (${JSON.stringify(reach)})`);
        if (narrow === 390) await page.screenshot({ path: resolve(output, 'filters-390.png'), clip: await row.evaluate(node => { const r = node.getBoundingClientRect(); return { x: 0, y: Math.max(0, r.y - 40), width: innerWidth, height: r.height + 80 }; }) });
      } else {
        assert.equal(filters.overflow, 'visible', `/universities ${narrow}: the chips are not a scroller on a wide screen`);
      }
    }
    assert.deepEqual(errors, [], `No page errors at ${width}`);
    results.push({ width, passed: true });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  server.close();
}
