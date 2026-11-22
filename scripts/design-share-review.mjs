import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

// What a link to the site looks like when it is sent to someone, and four
// smaller things the same audit found. Owner, 22 Nov: «влей тогда Taste
// Skill, Hyperframes, GSAP, потом проведи с ними аудит, то, что нужно в целом
// можно исправить». The audit measured fourteen pages at 1440 and 390px by
// taste-skill's written rules; this review holds what it fixed.
// - The share picture was a file without an extension (opengraph-image), and
//   the host served it as text/plain with nosniff: not a picture to WhatsApp,
//   Instagram or Telegram. It is a file with an extension now (/og.jpg).
// - Every page arrived in a chat as the home page: its title, its
//   description, no address of its own. A page with its own address carries
//   its own title, description and address in the preview.
// - A plain title in the guides layout cut «— IITALY» off every guide page.
// - /changes stood 8px left of the header from 900 to 1279px.
// - Its twenty-five source links were 22px tall under a finger.
// - The questionnaire's pictures loaded with the page, before they were seen.
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out');
const SITE = 'https://iitaly.net';

// 1. The built pages, read as a crawler reads them.
const files = [];
const walk = async dir => { for (const entry of await readdir(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) { if (entry.name !== '_next') await walk(path); } else if (entry.name.endsWith('.html')) files.push(path); } };
await walk(root);
const unescape = text => text.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const read = (html, pattern) => { const match = html.match(pattern); return match ? unescape(match[1]) : null; };
const meta = html => ({
  title: read(html, /<title>([^<]*)<\/title>/),
  description: read(html, /<meta name="description" content="([^"]*)"/),
  canonical: read(html, /<link rel="canonical" href="([^"]*)"/),
  ogTitle: read(html, /<meta property="og:title" content="([^"]*)"/),
  ogDescription: read(html, /<meta property="og:description" content="([^"]*)"/),
  ogUrl: read(html, /<meta property="og:url" content="([^"]*)"/),
  ogImage: read(html, /<meta property="og:image" content="([^"]*)"/),
  ogImageType: read(html, /<meta property="og:image:type" content="([^"]*)"/),
  ogImageWidth: read(html, /<meta property="og:image:width" content="([^"]*)"/),
  ogImageHeight: read(html, /<meta property="og:image:height" content="([^"]*)"/),
  twitterTitle: read(html, /<meta name="twitter:title" content="([^"]*)"/),
  twitterImage: read(html, /<meta name="twitter:image" content="([^"]*)"/),
  twitterCard: read(html, /<meta name="twitter:card" content="([^"]*)"/),
});

// Owner, 23 Nov, with the Telegram preview of the home page (words on plain
// paper): «почему эта страница такая страшная, сделай ее нормально красивой с
// иллюстрацией в нашем стиле». The picture is a drawn card with the /plan
// terrace now (design/social/source/share-card.mjs), a JPEG light enough for
// WhatsApp, and the record beside it says which price it was drawn for.
const picture = await readFile(join(root, 'og.jpg'));
assert.equal(picture.subarray(0, 3).toString('hex'), 'ffd8ff', 'out/og.jpg is a JPEG file');
const jpegSize = buffer => { for (let at = 2; at < buffer.length;) { const marker = buffer[at + 1], length = buffer.readUInt16BE(at + 2); if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [buffer.readUInt16BE(at + 7), buffer.readUInt16BE(at + 5)]; at += 2 + length; } return null; };
assert.deepEqual(jpegSize(picture), [1200, 630], 'The share picture is 1200×630');
assert(picture.length <= 300 * 1024, `The share picture is light enough for WhatsApp to show (${Math.round(picture.length / 1024)} KB)`);
for (const name of ['opengraph-image', 'twitter-image', 'og.png']) assert(!existsSync(join(root, name)), `out/${name}: the picture is og.jpg`);
const card = JSON.parse(await readFile('design/social/share-card.json', 'utf8'));
assert.equal(createHash('sha256').update(picture).digest('hex'), card.sha256, 'public/og.jpg is the card design/social/source/share-card.mjs drew (draw it again and commit both)');

const home = meta(await readFile(join(root, 'index.html'), 'utf8'));
assert.match(home.ogImage, /^https:\/\/iitaly\.net\/og\.jpg\?v=\d+$/, 'Home: the share picture is /og.jpg');
assert.equal(Number(new URL(home.ogImage).searchParams.get('v')), card.price, `The price printed on the share picture (${card.price}) is the site's: after a price change run design/social/source/share-card.mjs`);
let own = 0;
const titles = new Map();
for (const file of files) {
  const page = relative(root, file).split(sep).join('/').replace(/\.html$/, '');
  const data = meta(await readFile(file, 'utf8'));
  assert.equal(data.ogImage, home.ogImage, `${page}: og:image is the site's picture`);
  assert.equal(data.twitterImage, home.ogImage, `${page}: twitter:image is the site's picture`);
  assert.deepEqual([data.ogImageType, data.ogImageWidth, data.ogImageHeight], ['image/jpeg', '1200', '630'], `${page}: the picture's type and size are named`);
  assert.equal(data.twitterCard, 'summary_large_image', `${page}: the large card`);
  assert(page === 'index' ? data.title.startsWith('IITALY — ') : data.title.endsWith(' — IITALY'), `${page}: the tab names the site («${data.title}»)`);
  // A page that answers at its own address says so in its preview. Pages
  // that point elsewhere (a plan step, the payment return, 404) keep the
  // site's own preview.
  if (page === 'index' || data.canonical !== `${SITE}/${page}`) continue;
  own += 1;
  assert.equal(data.ogUrl, data.canonical, `${page}: og:url is the page's address`);
  assert.notEqual(data.ogTitle, home.ogTitle, `${page}: the preview has the page's title, not the home page's`);
  assert.equal(`${data.ogTitle} — IITALY`, data.title, `${page}: the preview's title is the tab's, without the site's name`);
  assert.equal(data.twitterTitle, data.ogTitle, `${page}: one title in both previews`);
  assert.equal(data.ogDescription, data.description, `${page}: the preview's description is the page's`);
  assert.notEqual(data.ogDescription, home.ogDescription, `${page}: the preview has the page's description, not the home page's`);
  titles.set(page, data.title);
}
assert(own >= 60, `Pages with their own preview: ${own}`);
for (const page of ['plan', 'check', 'prices', 'universities', 'guides', 'guides/apostille', 'guides/apostille/1', 'guides/visa', 'guides/permesso-modulo-1', 'changes-2026-27', 'terms', 'privacy', 'portal']) assert(titles.has(page), `/${page} has its own preview`);
assert.equal(titles.get('guides/apostille'), 'Апостиль — IITALY', 'A guide topic names the site in its tab');

// 2. The same pages in a browser.
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.woff2':'font/woff2' };
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

try {
  // The share picture is a picture to whoever asks for it.
  const served = await fetch(`${origin}${new URL(home.ogImage).pathname}`);
  assert.equal(served.headers.get('content-type'), 'image/jpeg', 'The share picture is served by its extension');

  for (const width of [1440, 1279, 1024, 900, 820, 390]) {
    const phone = width < 600;
    const context = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, hasTouch: phone, isMobile: phone, reducedMotion: 'reduce', locale: 'ru-RU' });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const visit = async path => { await page.goto(origin + path, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready); };

    // /changes begins where the header begins, at every width.
    await visit('/changes-2026-27');
    const edges = await page.evaluate(() => {
      const brand = document.querySelector('header a[href="/"]').getBoundingClientRect().left;
      const columns = [...document.querySelectorAll('main > section > div')].filter(column => getComputedStyle(column).position !== 'absolute' && column.getBoundingClientRect().width > 200).map(column => column.getBoundingClientRect().left);
      return { brand, columns };
    });
    assert(edges.columns.length >= 6, `/changes at ${width}: six sections measured (${edges.columns.length})`);
    for (const left of edges.columns) assert(Math.abs(left - edges.brand) <= 1, `/changes at ${width}: a section starts at ${left}px, the header at ${edges.brand}px`);

    // Its source links: a finger's target on a touch screen, the former step
    // under a mouse.
    const sources = page.locator('details', { hasText: 'Все ссылки на официальные страницы' });
    await sources.locator('summary').click();
    const links = await sources.locator('ul a').evaluateAll(list => list.map(link => link.getBoundingClientRect()).map(box => ({ top: box.top, height: box.height })));
    assert(links.length >= 20, `/changes at ${width}: the sources are listed (${links.length})`);
    const lowest = Math.min(...links.map(link => link.height));
    if (phone) assert(lowest >= 44, `/changes at ${width}: a source link is ${lowest}px tall under a finger`);
    else assert(lowest >= 24 && links[1].top - links[0].top <= 34, `/changes at ${width}: under a mouse the list keeps its step (${links[1].top - links[0].top}px)`);

    // The questionnaire's picture waits until it is near the screen.
    if (width === 1440 || phone) {
      await visit('/plan');
      assert.equal(await page.locator('[data-plan-question-art]').first().getAttribute('loading'), 'lazy', `/plan at ${width}: the question's picture is lazy`);
    }

    assert.deepEqual(errors, [], `No page errors at ${width}`);
    results.push({ width, passed: true, brand: edges.brand, sourceLink: lowest });
    await context.close();
  }
  console.log(JSON.stringify({ pages: files.length, ownPreview: own, picture: home.ogImage, results }, null, 2));
} finally {
  await browser.close();
  server.close();
}
