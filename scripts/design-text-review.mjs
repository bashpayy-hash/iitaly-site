import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

// How text stands on the page, site-wide. Owner, 21 Nov, with tablet screenshots
// of /check and a guide topic: «в целом много где тексты не прям ровные, и идёт
// перенасыщение каких-то блоков текстом. Вот тоже исправь эту причину».
// The causes were no line-breaking rule, words lying over a picture's subject,
// text columns too narrow for their sentences, sibling cards with unequal
// amounts of text and the same statement told several times in one block.
// This review holds the rules that replaced them (DESIGN_GUIDE.md §7).
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2' };
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
const words = text => text.trim().split(/\s+/).filter(Boolean).length;

// Pages whose words are written in this repository's presentation layer. The
// cabinet, the Modulo 1 trainer and the map with the comparison keep their own
// reviews and their protected sources.
const PAGES = ['/', '/check', '/prices', '/plan', '/guides', '/guides/stages/prepare', '/guides/apostille', '/guides/codice', '/guides/visa', '/guides/apostille/1', '/changes-2026-27', '/404.html'];

try {
  for (const width of [1440, 820, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : width < 1000 ? 1180 : 900 }, reducedMotion: 'reduce', locale: 'ru-RU' });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/health')) return route.fulfill({ json: { ok: true } });
      return route.abort();
    });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const visit = async path => { await page.goto(origin + path, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready); };

    for (const path of PAGES) {
      await visit(path);
      // 1. One line-breaking rule: a heading balances its lines, running text
      //    is broken by the whole paragraph. Nothing is left to the greedy default
      //    (a heading that sets its own breaks with <br> is its own rule).
      const greedy = await page.evaluate(() => [...document.querySelectorAll('main :is(h1, h2, h3, p, li, dd)')].filter(el => {
        if (!el.textContent.trim() || el.closest('[aria-hidden=true], [hidden]') || el.querySelector('br')) return false;
        const box = el.getBoundingClientRect(); if (box.width < 2 || box.height < 2) return false;
        const style = getComputedStyle(el); return (style.textWrapStyle || style.textWrap) === 'auto' || /^wrap$/.test(style.textWrap);
      }).map(el => `${el.tagName.toLowerCase()}: ${el.textContent.trim().slice(0, 50)}`));
      assert.deepEqual(greedy, [], `${path} at ${width}: every heading and paragraph has a line-breaking rule`);
      // 2. A dash never starts a line: it is bound to the word before it.
      const loose = await page.evaluate(() => {
        const found = [], walk = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
        for (let node; (node = walk.nextNode());) {
          if (node.parentElement.closest('script, style, [data-chat-widget]')) continue;
          const at = node.textContent.search(/[ \t\n]—/); if (at >= 0) found.push(node.textContent.replace(/\s+/g, ' ').slice(Math.max(0, at - 24), at + 16));
        }
        return found;
      });
      assert.deepEqual(loose, [], `${path} at ${width}: a dash is bound to the word before it`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${path} at ${width}: no horizontal scrolling`);
    }

    // 3. /check. Words never lie over the picture's subject: on a tablet the
    //    cover is cropped by height and Vespi's helmet starts at 66.2% of the
    //    picture; the words' box had lain 28–80px over it from 761 to 834px.
    for (const tablet of width === 820 ? [761, 820, 900, 1023] : []) {
      await page.setViewportSize({ width: tablet, height: 1000 }); await visit('/check');
      const gap = await page.evaluate(() => {
        const img = document.querySelector('[data-check-scene]'), box = img.getBoundingClientRect(), [px] = getComputedStyle(img).objectPosition.split(' ').map(value => parseFloat(value) / 100);
        const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight), shown = img.naturalWidth * scale;
        const helmet = box.left + (box.width - shown) * px + .662 * shown;
        return helmet - Math.max(...[...document.querySelectorAll('[data-section=check-header] [data-role=heading] > *')].map(el => el.getBoundingClientRect().right));
      });
      assert(gap >= 16, `/check at ${tablet}: the cover's words end before Vespi (${Math.round(gap)}px)`);
    }
    if (width === 820) await page.setViewportSize({ width, height: 1180 });
    await visit('/check');
    const how = await page.locator('[data-check-how] [data-bento-cell] p').allInnerTexts();
    assert.equal(how.length, 3, '/check: three steps');
    assert(how.every(text => words(text) <= 14), `/check: a step is one short sentence (${how.map(words)})`);
    assert(Math.max(...how.map(words)) <= 1.5 * Math.min(...how.map(words)), `/check: the three steps carry equal amounts of text (${how.map(words)})`);
    const scope = page.locator('[data-document-scope]');
    assert.equal(await scope.evaluate(el => el.tagName === 'DETAILS' && !el.open), true, '/check: what the check looks at opens on request');
    assert.equal(await scope.locator('li').count(), 4, '/check: all four lines of it are kept');
    await scope.locator('summary').click();
    assert.equal(await scope.locator('li').first().isVisible(), true, '/check: the list opens');
    const said = (await page.locator('[data-section=check-header], [data-check-offer]').allInnerTexts()).join(' ').replace(/\s+/g, ' ').toLowerCase();
    assert.equal(said.split('проверка бесплатно').length - 1 + said.split('проверка — бесплатно').length - 1, 1, '/check: the cover and the offer say «первая проверка бесплатно» once between them');

    // 4. The home and prices section of the document check: a fact is a value
    //    and its name; the comparison under them says the rest once.
    for (const path of ['/', '/prices']) {
      await visit(path);
      const facts = page.locator('[data-document-check-fact]');
      assert.equal(await facts.count(), 4, `${path}: four facts`);
      assert.equal(await facts.locator('dd').count(), 4, `${path}: each fact is a value and one line under it`);
      assert(words(await page.locator('[data-document-check-feature] p').first().innerText()) <= 24, `${path}: the section's lead is one statement`);
    }
    await visit('/');
    const arrival = await page.locator('[data-scene-photo=permesso], [data-scene-photo=codice], [data-scene-photo=health-travel]').evaluateAll(cards => cards.map(card => card.querySelector('strong + span').textContent.trim()));
    assert.equal(arrival.length, 3, 'Home: three topics after arrival');
    assert(arrival.every(line => words(line) <= 6), `Home: a topic card carries one short line (${arrival.map(words)})`);

    // 5. A guide topic: the free/paid cell says each side briefly; the note
    //    reads across the grid; on a phone the intro runs under the title.
    for (const path of ['/guides/codice', '/guides/apostille', '/guides/visa']) {
      await visit(path);
      const dose = await page.locator('[data-guide-dose=guest] [data-dose] p:last-child').allInnerTexts();
      assert.equal(dose.length, 2, `${path}: a free side and a paid side`);
      assert(dose.every(text => words(text) <= 24), `${path}: each side of the free/paid cell is brief (${dose.map(words)})`);
      assert.match(dose[1], /Один платёж, не подписка\./, `${path}: the paid side still names the single payment`);
      const note = page.locator('[data-guide-after] [data-guide-note]');
      if (await note.count()) {
        const share = await note.evaluate(cell => cell.getBoundingClientRect().width / cell.parentElement.getBoundingClientRect().width);
        assert(share > .9, `${path} at ${width}: the note reads across the grid (${share.toFixed(2)})`);
      }
    }
    if (width === 390) {
      await visit('/guides/codice');
      const header = await page.evaluate(() => {
        const band = document.querySelector('[data-guide-band] header'), intro = band.querySelector('p'), title = band.querySelector('h1'), art = band.querySelector('img');
        const rect = el => el.getBoundingClientRect();
        return { share: rect(intro).width / rect(band).width, titleBesideArt: rect(title).right <= rect(art).left + 1 && rect(title).top < rect(art).bottom && rect(title).bottom > rect(art).top, introUnder: rect(intro).top >= rect(art).bottom - 1 };
      });
      assert(header.share > .95 && header.titleBesideArt && header.introUnder, `A topic on a phone: the title stands beside the cartouche, the intro runs under both (${JSON.stringify(header)})`);
    }
    // 6. A phone shows less of /prices at once. Owner, 23 Nov: «иногда идет
    //    именно в мобильном приложении перенасыщение… информации»; measured
    //    that day, the page held 65–90 words on each of its eight phone
    //    screens. On a phone: the long paragraph shows four lines and opens on
    //    «Показать полностью»; the fifth telling of «проверяй снова без
    //    доплаты» (a card inside the card) is not shown; a comparison row
    //    carries one tinted answer, IITALY's. From the tablet up the page is
    //    as it was. No word leaves the page: the text is always in it.
    await visit('/prices');
    const fold = page.locator('[data-phone-fold]').first(), more = page.locator('[data-phone-fold-more]');
    const line = await fold.evaluate(node => parseFloat(getComputedStyle(node).lineHeight));
    const notice = page.getByText('Можно исправить и проверить снова', { exact: true }).first();
    assert.match(await fold.evaluate(node => node.textContent), /Подбор программ[\s\S]*подаёшь и решаешь ты\./, '/prices: the folded paragraph keeps every word in the page');
    if (width < 768) {
      assert((await fold.boundingBox()).height <= line * 4 + 2, `/prices at ${width}: the long paragraph shows four lines`);
      assert(await more.first().isVisible() && (await more.first().boundingBox()).height >= 44, `/prices at ${width}: «Показать полностью» is there and 44px tall`);
      assert(await notice.isHidden(), `/prices at ${width}: the repeated «Можно исправить и проверить снова» is not shown`);
      const answers = await page.locator('[data-document-check-compare] tbody tr').first().locator('td').evaluateAll(cells => cells.map(cell => getComputedStyle(cell).backgroundColor));
      assert.equal(answers[0], 'rgba(0, 0, 0, 0)', `/prices at ${width}: the agency's answer is plain text`);
      assert.notEqual(answers[1], 'rgba(0, 0, 0, 0)', `/prices at ${width}: IITALY's answer stands on its tint`);
      await more.first().click();
      assert((await fold.boundingBox()).height > line * 4 + 2 && await more.count() === 0, `/prices at ${width}: the paragraph opens whole and the button goes`);
    } else {
      assert.equal(await more.first().isHidden(), true, `/prices at ${width}: nothing is folded`);
      assert((await fold.boundingBox()).height >= line * 2 && await fold.evaluate(node => node.scrollHeight <= node.clientHeight + 1), `/prices at ${width}: the paragraph is shown whole`);
      assert(await notice.isVisible(), `/prices at ${width}: the note in the package is shown`);
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
