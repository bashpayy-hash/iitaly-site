// Highlight covers 1080x1920: Instagram shows only the central circle.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
// Playwright is the machine's global install (see the repository README), not a project dependency.
const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = process.argv[2]; const SITE = 'http://127.0.0.1:4310'; 
const icons = JSON.parse(fs.readFileSync(path.join(DIR, 'icons.json'), 'utf8'));
const vespi = 'data:image/webp;base64,' + fs.readFileSync(path.join(DIR, '../../source/avatar.webp')).toString('base64');
const items = [
  ['01-vespi', `<img class="v" src="${vespi}" alt="">`],
  ['02-vuzy', icons.unis], ['03-dokumenty', icons.docs], ['04-dsu', icons.dsu], ['05-viza', icons.visa], ['06-gaidy', icons.guides],
];
const css = `html,body{margin:0;background:#087C55} body>*:not(.c){display:none!important}
.c{position:relative;width:1080px;height:1920px;background:#087C55;overflow:hidden}
.c::before{content:"";position:absolute;inset:0;background-image:var(--paper-fibre);mix-blend-mode:multiply;opacity:.45}
.disc{position:absolute;left:50%;top:50%;width:1080px;height:1080px;margin:-540px 0 0 -540px;display:grid;place-items:center}
.disc svg{width:500px;height:500px}
.v{width:980px;height:980px;object-fit:cover;object-position:50% 8%;filter:drop-shadow(0 18px 30px rgba(0,0,0,.25))}`;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(SITE + '/', { waitUntil: 'networkidle' });
  for (const [name, inner] of items) {
    await p.evaluate(([h, c]) => { document.body.innerHTML = h; let s = document.getElementById('hl'); if (!s) { s = document.createElement('style'); s.id = 'hl'; document.head.appendChild(s); } s.textContent = c; scrollTo(0, 0); }, [`<div class="c"><div class="disc">${inner}</div></div>`, css]);
    await p.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
    await p.locator('.c').screenshot({ path: path.join(OUT, name + '.png') }); console.log(name);
  }
  await b.close();
})();
