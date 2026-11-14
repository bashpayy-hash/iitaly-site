// Round 2 of the avatar options (14 Nov 2026). Inputs: <dir>/in2 — the *-t.png crops of source/*.webp (alpha > 40%), latte.png, flat-*.png rendered from the SVGs.
// Render avatar variants at 1080x1080 and a check sheet. Inputs in ./in, outputs in ./out.
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const dir = resolve(process.argv[2]);
const IN = `file://${dir}/in2`;
mkdirSync(`${dir}/out2`, { recursive: true });
const G = '#087C55', R = '#E63946', C = '#FAF8F5', INK = '#141413';
const font = `@font-face{font-family:IT;src:url(file:///home/user/iitaly-site/public/fonts/inter-tight-tenge-v1.woff2)}`;
const mark = (bodyFolder, wave) => `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M6 4H24.7C25.9 4 27 4.5 27.8 5.4L32.9 10.9C33.7 11.7 34.8 12.2 36 12.2H60V20.2H43L4 58V6C4 4.9 4.9 4 6 4Z" fill="${bodyFolder}"/><path d="M18 60C21.5 45 41.5 34 60 33V60H18Z" fill="${wave}"/></svg>`;
const img = (f, css) => `<img src="${IN}/${f}" style="position:absolute;${css}">`;
// Each variant: [id, title, html]. Face-t is 921x1005 (helmet top to collar).
const A = '#F3DFC4';
const V = [
  ['11-folder-character', 'Папка-персонаж в шлеме', `<div style="background:${A}"></div>${img('folderchar-t.png','width:62%;left:19%;top:14%')}`],
  ['12-gradcap', 'Шлем и шапочка выпускника', `<div style="background:${G}"></div>${img('gradcap-t.png','width:80%;left:10%;top:9%')}`],
  ['13-wax-seal', 'Сургучная печать с Веспи', `<div style="background:${G}"></div>${img('seal-t.png','width:86%;left:7%;top:7%')}`],
  ['14-coin', 'Монетка из Треви', `<div style="background:${G}"></div>${img('coin-t.png','width:86%;left:7%;top:7%')}`],
  ['15-latte', 'Веспи в капучино', `<div style="background:url(${IN}/latte.png) 38% 32%/190% auto"></div>`],
  ['16-folder-scooter', 'Мопед из папки', `<div style="background:${A}"></div>${img('folderscooter-t.png','width:46%;left:27%;top:10%')}`],
  ['17-passport', 'Фото на документы', `<div style="background:${G}"></div>${img('passport-t.png','width:66%;left:17%;top:15%')}`],
  ['18-helmet-boat', 'В шлеме, как в лодке', `<div style="background:${G}"></div>${img('helmetboat-t.png','width:64%;left:18%;top:14%')}`],
  ['19-flat-icon', 'Плоская иконка Веспи', `<div style="background:url(${IN}/flat-vespi.png) center/cover"></div>`],
  ['20-flat-folder', 'Плоский знак с Веспи', `<div style="background:url(${IN}/flat-folder.png) center/cover"></div>`],
];
const base = `${font}*{margin:0}html,body{width:1080px;height:1080px;overflow:hidden;background:transparent}.c{position:relative;width:1080px;height:1080px;overflow:hidden}.c>div:first-child{position:absolute;inset:0}`;
const inline = h => h.replace(/file:\/\/[^"')\s]+\.(png|jpg|woff2)/g, u => { const f = u.slice(7); const t = f.endsWith('.png') ? 'image/png' : f.endsWith('.jpg') ? 'image/jpeg' : 'font/woff2'; return `data:${t};base64,${readFileSync(f).toString('base64')}`; });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
const ok = [];
for (const [id, title, html] of V) {
  const need = [...html.matchAll(/in2\/([\w.-]+)/g)].map(m => m[1]);
  if (need.some(f => !existsSync(`${dir}/in2/${f}`))) { console.log('skip', id, 'missing', need); continue; }
  await p.setContent(inline(`<style>${base}</style><div class="c">${html}</div>`), { waitUntil: 'load' });
  await p.waitForTimeout(150);
  await p.screenshot({ path: `${dir}/out2/${id}.png`, omitBackground: true });
  ok.push([id, title]);
}
// Check sheet: each avatar as Instagram shows it — 110px profile circle and 32px comment circle, light and dark UI.
const rows = ok.map(([id, t], i) => `<div class="row"><div class="n">${i + 11}. ${t}</div>
 <div class="ui light"><img class="big" src="file://${dir}/out2/${id}.png"><img class="sm" src="file://${dir}/out2/${id}.png"><span>iitaly</span></div>
 <div class="ui dark"><img class="big" src="file://${dir}/out2/${id}.png"><img class="sm" src="file://${dir}/out2/${id}.png"><span>iitaly</span></div>
 <img class="full" src="file://${dir}/out2/${id}.png"></div>`).join('');
await p.setViewportSize({ width: 1100, height: 400 });
await p.setContent(inline(`<style>${font}body{font-family:IT,sans-serif;background:#fff;margin:24px;width:1052px}.row{display:grid;grid-template-columns:230px 1fr 1fr 150px;gap:16px;align-items:center;padding:10px 0;border-bottom:1px solid #eee}.n{font-size:20px;font-weight:600;color:#141413}.ui{display:flex;align-items:center;gap:18px;padding:14px 18px;border-radius:16px}.light{background:#fff;border:1px solid #ddd}.dark{background:#000;color:#f5f5f5}.ui span{font-size:14px}.big{width:110px;height:110px;border-radius:50%}.sm{width:32px;height:32px;border-radius:50%}.full{width:150px;height:150px;border-radius:12px}h1{font-size:26px;margin:0 0 12px}</style><h1>Аватарка IITALY: раунд 2, № 11–20 · круг 110 px (профиль) и 32 px (комментарии), светлая и тёмная тема</h1>${rows}`), { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.screenshot({ path: `${dir}/out2/check.png`, fullPage: true });
await b.close();
console.log('rendered', ok.length);
