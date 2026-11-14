// Round 3 of the avatar options (14 Nov 2026). Inputs: <dir>/in3 — *-t.png crops of source/*.webp (alpha > 40%), the full-bleed PNGs, flat-*.png rendered from the SVGs.
// Render avatar variants at 1080x1080 and a check sheet. Inputs in ./in, outputs in ./out.
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const dir = resolve(process.argv[2]);
const IN = `file://${dir}/in3`;
mkdirSync(`${dir}/out3`, { recursive: true });
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
  ['21-laurel', 'Лавровый венок выпускника', bust('laurel-t.png', A)],
  ['22-latte-gradcap', 'Капучино: Веспи в шапке выпускника', bleed('lattecap.png', '128%', '46% 42%')],
  ['23-latte-brand-cup', 'Капучино в чашке цветов знака', bleed('lattebrand.png', '112%', '50% 45%')],
  ['24-cup-bath', 'Веспи в чашке капучино, в шапке', obj('cupbath-t.png', G, 80)],
  ['25-espresso-gradcap', 'Шапка выпускника и эспрессо', bust('espressocap-t.png', G)],
  ['26-cap-toss', 'Бросает шапку вверх', obj('captoss-t.png', A, 84)],
  ['27-scooter-gradcap', 'На мопеде в шапке выпускника', obj('scootercap-t.png', G, 84)],
  ['28-envelope', 'Письмо о зачислении', obj('envelope-t.png', A, 80)],
  ['29-pisa-folders', 'Пизанская башня из папок', obj('pisafolders-t.png', A, 86)],
  ['30-pizza', 'Пицца Маргарита с лицом Веспи', bleed('pizza.png', '112%', '50% 48%')],
  ['31-gelato', 'Джелато в цветах знака', bust('gelato-t.png', G)],
  ['32-moka', 'Мока-кофеварка в цветах знака', obj('moka-t.png', A, 74)],
  ['33-flat-gradcap', 'Плоская иконка: шапка выпускника', `<div style="background:url(${IN}/flat-gradcap.png) center/cover"></div>`],
  ['34-flat-laurel', 'Плоская иконка: лавровый венок', `<div style="background:url(${IN}/flat-laurel.png) center/cover"></div>`],
  ['35-flat-latte', 'Плоская иконка: капучино', `<div style="background:url(${IN}/flat-latte.png) center/cover"></div>`],
];
const base = `${font}*{margin:0}html,body{width:1080px;height:1080px;overflow:hidden;background:transparent}.c{position:relative;width:1080px;height:1080px;overflow:hidden}.c>div:first-child{position:absolute;inset:0}`;
const inline = h => h.replace(/file:\/\/[^"')\s]+\.(png|jpg|woff2)/g, u => { const f = u.slice(7); const t = f.endsWith('.png') ? 'image/png' : f.endsWith('.jpg') ? 'image/jpeg' : 'font/woff2'; return `data:${t};base64,${readFileSync(f).toString('base64')}`; });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
const ok = [];
for (const [id, title, html] of V) {
  const need = [...html.matchAll(/in3\/([\w.-]+)/g)].map(m => m[1]);
  if (need.some(f => !existsSync(`${dir}/in3/${f}`))) { console.log('skip', id, 'missing', need); continue; }
  await p.setContent(inline(`<style>${base}</style><div class="c">${html}</div>`), { waitUntil: 'load' });
  await p.waitForTimeout(150);
  await p.screenshot({ path: `${dir}/out3/${id}.png`, omitBackground: true });
  ok.push([id, title]);
}
// Check sheet: each avatar as Instagram shows it — 110px profile circle and 32px comment circle, light and dark UI.
const rows = ok.map(([id, t], i) => `<div class="row"><div class="n">${i + 21}. ${t}</div>
 <div class="ui light"><img class="big" src="file://${dir}/out3/${id}.png"><img class="sm" src="file://${dir}/out3/${id}.png"><span>iitaly</span></div>
 <div class="ui dark"><img class="big" src="file://${dir}/out3/${id}.png"><img class="sm" src="file://${dir}/out3/${id}.png"><span>iitaly</span></div>
 <img class="full" src="file://${dir}/out3/${id}.png"></div>`).join('');
await p.setViewportSize({ width: 1100, height: 400 });
await p.setContent(inline(`<style>${font}body{font-family:IT,sans-serif;background:#fff;margin:24px;width:1052px}.row{display:grid;grid-template-columns:230px 1fr 1fr 150px;gap:16px;align-items:center;padding:10px 0;border-bottom:1px solid #eee}.n{font-size:20px;font-weight:600;color:#141413}.ui{display:flex;align-items:center;gap:18px;padding:14px 18px;border-radius:16px}.light{background:#fff;border:1px solid #ddd}.dark{background:#000;color:#f5f5f5}.ui span{font-size:14px}.big{width:110px;height:110px;border-radius:50%}.sm{width:32px;height:32px;border-radius:50%}.full{width:150px;height:150px;border-radius:12px}h1{font-size:26px;margin:0 0 12px}</style><h1>Аватарка IITALY: раунд 3, № 21–35 · круг 110 px (профиль) и 32 px (комментарии), светлая и тёмная тема</h1>${rows}`), { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.screenshot({ path: `${dir}/out3/check.png`, fullPage: true });
await b.close();
console.log('rendered', ok.length);
