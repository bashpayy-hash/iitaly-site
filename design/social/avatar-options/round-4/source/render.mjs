/* eslint-disable @typescript-eslint/no-unused-vars -- archived layout script: each round keeps the shared palette and helpers even when its variants use only some of them. */
// Round 4 of the avatar options (14 Nov 2026). Inputs: <dir>/in4 — *-t.png crops of source/*.webp (alpha > 40%), mosaic.png, renaissance.png, flat-*.png rendered from the SVGs. flat-boot.svg uses ITALY_PATH from src/data/italy.ts (read only).
// Render avatar variants at 1080x1080 and a check sheet. Inputs in ./in, outputs in ./out.
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const dir = resolve(process.argv[2]);
const IN = `file://${dir}/in4`;
mkdirSync(`${dir}/out4`, { recursive: true });
const G = '#087C55', R = '#E63946', C = '#FAF8F5', INK = '#141413';
const font = `@font-face{font-family:IT;src:url(file:///home/user/iitaly-site/public/fonts/inter-tight-tenge-v1.woff2)}`;
const mark = (bodyFolder, wave) => `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M6 4H24.7C25.9 4 27 4.5 27.8 5.4L32.9 10.9C33.7 11.7 34.8 12.2 36 12.2H60V20.2H43L4 58V6C4 4.9 4.9 4 6 4Z" fill="${bodyFolder}"/><path d="M18 60C21.5 45 41.5 34 60 33V60H18Z" fill="${wave}"/></svg>`;
const img = (f, css) => `<img src="${IN}/${f}" style="position:absolute;${css}">`;
// Each variant: [id, title, html]. Face-t is 921x1005 (helmet top to collar).
const A = '#F3DFC4';
// box(f, x, y, w, h, pos): the picture is fitted inside the box (object-fit: contain).
const box = (f, x, y, w, h, pos = 'center') => `<img src="${IN}/${f}" style="position:absolute;left:${x}%;top:${y}%;width:${w}%;height:${h}%;object-fit:contain;object-position:${pos}">`;
const bust = (f, bg) => `<div style="background:${bg}"></div>${box(f, 6, 12, 88, 100, 'center top')}`;
const obj = (f, bg, s = 76) => `<div style="background:${bg}"></div>${box(f, (100 - s) / 2, (100 - s) / 2 + 2, s, s)}`;
const bleed = (f, size, pos) => `<div style="background:url(${IN}/${f}) ${pos}/${size} auto"></div>`;
const V = [
  ['36-patch', 'Вышитая нашивка', obj('patch-t.png', A, 92)],
  ['37-enamel-pin', 'Эмалевый значок с шапкой', obj('pin-t.png', A, 90)],
  ['38-mosaic', 'Римская мозаика', bleed('mosaic.png', '112%', '50% 50%')],
  ['39-majolica', 'Расписная тарелка с Амальфи', obj('plate-t.png', G, 94)],
  ['40-stamp', 'Почтовая марка с Колизеем', obj('stamp-t.png', G, 80)],
  ['41-dolce-vita', 'Dolce vita: тёмные очки и шарф', bust('sunglasses-t.png', G)],
  ['42-renaissance', 'Портрет эпохи Возрождения', bleed('renaissance.png', '150%', '50% 14%')],
  ['43-sticker', 'Стикер с папкой', obj('sticker-t.png', G, 86)],
  ['44-flat-ii', 'Плоская иконка «ii» из двух Веспи', `<div style="background:url(${IN}/flat-ii.png) center/cover"></div>`],
  ['45-flat-boot', 'Плоская иконка: Италия в шапке выпускника', `<div style="background:url(${IN}/flat-boot.png) center/cover"></div>`],
];
const base = `${font}*{margin:0}html,body{width:1080px;height:1080px;overflow:hidden;background:transparent}.c{position:relative;width:1080px;height:1080px;overflow:hidden}.c>div:first-child{position:absolute;inset:0}`;
const inline = h => h.replace(/file:\/\/[^"')\s]+\.(png|jpg|woff2)/g, u => { const f = u.slice(7); const t = f.endsWith('.png') ? 'image/png' : f.endsWith('.jpg') ? 'image/jpeg' : 'font/woff2'; return `data:${t};base64,${readFileSync(f).toString('base64')}`; });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
const ok = [];
for (const [id, title, html] of V) {
  const need = [...html.matchAll(/in4\/([\w.-]+)/g)].map(m => m[1]);
  if (need.some(f => !existsSync(`${dir}/in4/${f}`))) { console.log('skip', id, 'missing', need); continue; }
  await p.setContent(inline(`<style>${base}</style><div class="c">${html}</div>`), { waitUntil: 'load' });
  await p.waitForTimeout(150);
  await p.screenshot({ path: `${dir}/out4/${id}.png`, omitBackground: true });
  ok.push([id, title]);
}
// Check sheet: each avatar as Instagram shows it — 110px profile circle and 32px comment circle, light and dark UI.
const rows = ok.map(([id, t], i) => `<div class="row"><div class="n">${i + 36}. ${t}</div>
 <div class="ui light"><img class="big" src="file://${dir}/out4/${id}.png"><img class="sm" src="file://${dir}/out4/${id}.png"><span>iitaly</span></div>
 <div class="ui dark"><img class="big" src="file://${dir}/out4/${id}.png"><img class="sm" src="file://${dir}/out4/${id}.png"><span>iitaly</span></div>
 <img class="full" src="file://${dir}/out4/${id}.png"></div>`).join('');
await p.setViewportSize({ width: 1100, height: 400 });
await p.setContent(inline(`<style>${font}body{font-family:IT,sans-serif;background:#fff;margin:24px;width:1052px}.row{display:grid;grid-template-columns:230px 1fr 1fr 150px;gap:16px;align-items:center;padding:10px 0;border-bottom:1px solid #eee}.n{font-size:20px;font-weight:600;color:#141413}.ui{display:flex;align-items:center;gap:18px;padding:14px 18px;border-radius:16px}.light{background:#fff;border:1px solid #ddd}.dark{background:#000;color:#f5f5f5}.ui span{font-size:14px}.big{width:110px;height:110px;border-radius:50%}.sm{width:32px;height:32px;border-radius:50%}.full{width:150px;height:150px;border-radius:12px}h1{font-size:26px;margin:0 0 12px}</style><h1>Аватарка IITALY: раунд 4, № 36–45 · круг 110 px (профиль) и 32 px (комментарии), светлая и тёмная тема</h1>${rows}`), { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.screenshot({ path: `${dir}/out4/check.png`, fullPage: true });
await b.close();
console.log('rendered', ok.length);
