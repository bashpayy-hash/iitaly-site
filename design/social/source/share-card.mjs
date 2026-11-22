// The picture a link to the site arrives with: public/og.jpg, 1200×630.
//
// Owner, 23 Nov, with a Telegram screenshot of the preview (words on plain
// paper in a fallback typeface): «почему эта страница такая страшная, сделай
// ее нормально красивой с иллюстрацией в нашем стиле». Then, on the first
// card: «убери ценник и казахстан италия, скажи что это современный подход».
//
// The card is the site's own hero: the /plan terrace over Florence with Vespi
// (share-card-scene.py), the headline in the site's display face on the sky,
// «Современный подход» beside the logo, the address in the site's pill. No
// price and no «Казахстан → Италия» on it.
//
// It is a JPEG, drawn once and committed, not an image built by next/og: a
// photograph as PNG weighs over a megabyte, and WhatsApp shows no preview for
// a heavy picture (about 300 KB is the ceiling people report). share-card.json
// records the file's hash; the picture's address in src/app/pageMeta.ts ends
// in the hash's first eight characters, so a redrawn card gets a new address
// and nobody keeps the old one. design-share-review holds the three together.
//
// Run from the repository root:
//   npm run build && python3 design/social/source/share-card-scene.py && node design/social/source/share-card.mjs
// then copy the printed «version» into SHARE_IMAGE in src/app/pageMeta.ts.
// Playwright is the machine's install (REVIEW_TOOLS, as the reviews use, or global).
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.REVIEW_TOOLS ? resolve(process.env.REVIEW_TOOLS, 'playwright') : 'playwright');
const root = resolve('out');
const mark = JSON.parse(await readFile('src/components/brand/mark.json', 'utf8'));
const scene = 'data:image/webp;base64,' + (await readFile('design/social/source/share-card-scene.webp')).toString('base64');

const html = `<div class="card">
  <img class="scene" src="${scene}" alt="">
  <span class="veil"></span>
  <div class="top">
    <span class="brand"><svg width="44" height="44" viewBox="${mark.viewBox}"><path d="${mark.fold}" fill="${mark.green}"/><path d="${mark.arc}" fill="${mark.red}"/></svg>iItaly</span>
    <span class="approach">Современный подход</span>
  </div>
  <h1>Поступление в&nbsp;Италию.<em>По понятному плану.</em></h1>
  <p class="foot"><span class="pill">iitaly.net</span></p>
</div>`;
// Not on the picture: the old card's line of six subjects (a messenger prints
// the page's description, which names them, right above the picture), the
// price and «Казахстан → Италия» (owner, 23 Nov).
// The site's own tokens: Inter Tight for the headline and the name, Onest for
// the rest, ink #141413, red #E63946, the badge's paper pill.
const css = `*{box-sizing:border-box} html,body{margin:0} body>*:not(.card){display:none!important}
.card{position:relative;width:1200px;height:630px;overflow:hidden;background:#C4AB9B;color:#141413;font-family:var(--font-onest),system-ui,sans-serif}
.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.veil{position:absolute;inset:0;background:radial-gradient(ellipse 54% 48% at 62% 26%,rgba(250,248,244,.8),rgba(250,248,244,.42) 55%,rgba(250,248,244,0) 100%)}
.top{position:absolute;left:330px;right:44px;top:40px;display:flex;align-items:center;gap:22px}
.brand{display:inline-flex;align-items:center;gap:11px;font-family:var(--font-inter-tight),sans-serif;font-size:35px;font-weight:700;letter-spacing:-.055em;line-height:1}
.approach{font-size:27px;font-weight:500;color:#3F3933}
h1{position:absolute;left:330px;top:116px;margin:0;font-family:var(--font-inter-tight),sans-serif;font-size:72px;font-weight:700;letter-spacing:-.04em;line-height:1.02;white-space:nowrap}
h1 em{display:block;font-style:normal;color:#E63946}
.foot{position:absolute;left:44px;right:44px;bottom:38px;margin:0;display:flex;justify-content:flex-end;align-items:center}
.pill{display:inline-flex;align-items:center;height:46px;padding:0 20px;border-radius:999px;background:rgba(255,253,249,.93);font-size:22px;color:#3F3933;white-space:nowrap}`;

// The built site, for its typefaces: the card is drawn inside one of its pages.
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return response.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        return response.end(await readFile(file));
      }
    }
    response.writeHead(404).end();
  } catch { response.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.REVIEW_CHROMIUM ? { executablePath: process.env.REVIEW_CHROMIUM, args: ['--no-sandbox'] } : {});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  await page.goto(origin + '/terms', { waitUntil: 'load' });
  await page.evaluate(([markup, styles]) => {
    document.body.innerHTML = markup;
    const sheet = document.createElement('style'); sheet.textContent = styles; document.head.appendChild(sheet);
    scrollTo(0, 0);
  }, [html, css]);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map(image => image.decode())]));
  // The old card was set in a fallback face: refuse to draw without the site's own.
  const faces = await page.evaluate(() => [...document.fonts].filter(face => face.status === 'loaded').map(face => face.family.replace(/["']/g, '')));
  if (!faces.some(face => /Inter[ _]Tight/.test(face)) || !faces.some(face => /Onest/.test(face))) throw new Error('The site\'s typefaces did not load: ' + faces.join(', '));
  const fits = await page.evaluate(() => [...document.querySelectorAll('.card h1, .card .top, .card .foot')].every(node => { const box = node.getBoundingClientRect(); return box.left >= 0 && box.right <= 1200 && node.scrollWidth <= node.clientWidth + 1; }));
  if (!fits) throw new Error('The words do not fit the card.');
  const jpeg = await page.locator('.card').screenshot({ type: 'jpeg', quality: 86 });
  await writeFile(join('public', 'og.jpg'), jpeg);
  const sha256 = createHash('sha256').update(jpeg).digest('hex');
  const record = { file: 'public/og.jpg', width: 1200, height: 630, bytes: jpeg.length, sha256, version: sha256.slice(0, 8) };
  await writeFile('design/social/share-card.json', JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify({ ...record, faces: [...new Set(faces)] }, null, 2));
} finally {
  await browser.close();
  server.close();
}
