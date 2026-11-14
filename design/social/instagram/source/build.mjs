// Instagram slides for IITALY: scene + site typography (Inter Tight from the
// running site) + the site's paper film. Usage: node build.cjs <out-dir> [siteOrigin]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
// Playwright is the machine's global install (see the repository README), not a project dependency.
const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = process.argv[2]; const SITE = process.argv[3] || 'http://127.0.0.1:4310';

const lum = JSON.parse(fs.readFileSync(path.join(DIR, 'lum.json'), 'utf8'));
const slides = JSON.parse(fs.readFileSync(path.join(DIR, 'slides.json'), 'utf8'));
const mark = { fold: 'M6 4H24.7C25.9 4 27 4.5 27.8 5.4L32.9 10.9C33.7 11.7 34.8 12.2 36 12.2H60V20.2H43L4 58V6C4 4.9 4.9 4 6 4Z', arc: 'M18 60C21.5 45 41.5 34 60 33V60H18Z' };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function slideHtml(s) {
  const dark = lum[s.scene] < 0.5;
  const img = 'data:image/webp;base64,' + fs.readFileSync(path.join(DIR, 'scenes', s.scene + '.webp')).toString('base64');
  const ink = dark ? '#FAF6EE' : '#141413', accent = dark ? '#F4A090' : '#D7303F', sub = dark ? 'rgba(250,246,238,.9)' : '#3B3631';
  const scrim = dark ? 'linear-gradient(180deg, rgba(14,12,10,.55) 0%, rgba(14,12,10,.18) 34%, rgba(14,12,10,0) 48%)'
                     : 'linear-gradient(180deg, rgba(250,248,245,.72) 0%, rgba(250,248,245,.30) 30%, rgba(250,248,245,0) 46%)';
  const tag = s.tag ? `<div class="tag"><i></i><small>${esc(s.tag.small)}</small><b>${esc(s.tag.big)}</b><em>${esc(s.tag.note)}</em></div>` : '';
  return `<div class="slide" style="--ink:${ink};--accent:${accent};--sub:${sub}">
    <img class="scene" src="${img}" alt="">
    <div class="scrim" style="background:${scrim}"></div>
    <div class="paper"></div>
    <header style="${s.headStyle || ''}">
      ${s.kicker ? `<p class="kicker">${esc(s.kicker)}</p>` : ''}
      <h1 style="font-size:${Math.max(s.h1.length, s.h2.length) > 17 ? 84 : 96}px"><span>${esc(s.h1)}</span><span class="accent">${esc(s.h2)}</span></h1>
      ${s.sub ? `<p class="sub" style="${s.subStyle || ''}">${esc(s.sub)}</p>` : ''}
    </header>
    ${tag}
    <footer>
      <span class="brand"><svg viewBox="0 0 64 64" width="34" height="34"><path d="${mark.fold}" fill="#087C55"/><path d="${mark.arc}" fill="#E63946"/></svg>iitaly.net</span>
      ${s.note ? `<span class="note">${esc(s.note)}</span>` : ''}
      <span class="count">${s.n} / ${s.of}</span>
    </footer>
  </div>`;
}

const css = `
  html, body { margin:0; padding:0; background:#000; }
  body > *:not(.slide) { display:none !important; }
  .slide { position:relative; width:1080px; height:1350px; overflow:hidden; font-family: var(--font-inter-tight), "Inter Tight", system-ui, sans-serif; color:var(--ink); }
  .scene { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .scrim { position:absolute; inset:0; }
  .paper { position:absolute; inset:0; background-image: var(--paper-fibre); mix-blend-mode:multiply; opacity:.38; pointer-events:none; }
  header { position:absolute; left:80px; right:80px; top:88px; }
  .kicker { margin:0 0 22px; font-size:26px; font-weight:600; letter-spacing:.02em; text-transform:uppercase; color:var(--sub); }
  h1 { margin:0; font-size:96px; line-height:1.0; font-weight:650; letter-spacing:-.035em; text-wrap:balance; }
  h1 span { display:block; }
  h1 .accent { color:var(--accent); }
  .sub { margin:30px 0 0; max-width:820px; font-size:38px; line-height:1.28; font-weight:500; letter-spacing:-.01em; color:var(--sub); text-wrap:balance; }
  footer { position:absolute; left:80px; right:80px; bottom:64px; display:flex; align-items:center; gap:18px; font-size:26px; font-weight:600; }
  footer > span { display:inline-flex; align-items:center; gap:12px; padding:12px 20px; border-radius:999px; background:rgba(250,248,245,.86); color:#141413; box-shadow:0 2px 10px rgba(20,20,19,.10); }
  footer .note { font-weight:500; font-size:22px; color:#3B3631; }
  footer .count { margin-left:auto; font-variant-numeric: tabular-nums; }
  .tag { position:absolute; right:92px; top:560px; width:330px; padding:46px 30px 30px; transform:rotate(5deg); background:#F6EEDD; border-radius:14px 14px 14px 14px; color:#141413; text-align:center;
         box-shadow:0 18px 40px rgba(30,24,16,.28), inset 0 0 0 2px rgba(120,96,60,.18); background-image: var(--paper-fibre); }
  .tag i { position:absolute; top:18px; left:50%; width:20px; height:20px; margin-left:-10px; border-radius:50%; background:#5d4a33; box-shadow: inset 0 2px 3px rgba(0,0,0,.4); }
  .tag i::after { content:""; position:absolute; left:9px; bottom:14px; width:2px; height:120px; background:#9b7b52; transform:rotate(-14deg); transform-origin:bottom; }
  .tag small { display:block; font-size:24px; font-weight:600; color:#5C554D; letter-spacing:.01em; }
  .tag b { display:block; margin:8px 0 6px; font-size:76px; line-height:1; font-weight:700; letter-spacing:-.04em; color:#D7303F; white-space:nowrap; }
  .tag em { display:block; font-style:normal; font-size:24px; font-weight:500; color:#3B3631; }
`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto(SITE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (const s of slides) {
    await page.evaluate(([html, css]) => {
      document.body.innerHTML = html;
      let st = document.getElementById('ig-style'); if (!st) { st = document.createElement('style'); st.id = 'ig-style'; document.head.appendChild(st); }
      st.textContent = css; window.scrollTo(0, 0);
    }, [slideHtml(s), css]);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
    const fam = await page.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily);
    await page.locator('.slide').screenshot({ path: path.join(OUT, s.file + '.png') });
    console.log(s.file, s.scene, fam.split(',')[0]);
  }
  await browser.close();
})();
