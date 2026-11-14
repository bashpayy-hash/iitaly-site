// Avatar options for Instagram (14 Nov 2026). See ../manifest.json for the inputs it expects.
// Render avatar variants at 1080x1080 and a check sheet. Inputs in ./in, outputs in ./out.
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const dir = resolve(process.argv[2]);
const IN = `file://${dir}/in`;
mkdirSync(`${dir}/out`, { recursive: true });
const G = '#087C55', R = '#E63946', C = '#FAF8F5', INK = '#141413';
const font = `@font-face{font-family:IT;src:url(file:///home/user/iitaly-site/public/fonts/inter-tight-tenge-v1.woff2)}`;
const mark = (bodyFolder, wave) => `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M6 4H24.7C25.9 4 27 4.5 27.8 5.4L32.9 10.9C33.7 11.7 34.8 12.2 36 12.2H60V20.2H43L4 58V6C4 4.9 4.9 4 6 4Z" fill="${bodyFolder}"/><path d="M18 60C21.5 45 41.5 34 60 33V60H18Z" fill="${wave}"/></svg>`;
const img = (f, css) => `<img src="${IN}/${f}" style="position:absolute;${css}">`;
// Each variant: [id, title, html]. Face-t is 921x1005 (helmet top to collar).
const V = [
  ['01-face-green', 'Лицо на зелёном', `<div style="background:${G}"></div>${img('face-t.png','width:84%;left:8%;top:13%')}`],
  ['02-closeup', 'Крупный план', `<div style="background:${G}"></div>${img('face-t.png','width:118%;left:-9%;top:2%')}`],
  ['03-tricolor', 'Триколор', `<div style="background:linear-gradient(90deg,${G} 0 33.4%,${C} 33.4% 66.6%,${R} 66.6%)"></div>${img('face-t.png','width:84%;left:8%;top:13%;filter:drop-shadow(0 18px 30px rgba(0,0,0,.25))')}`],
  ['04-cream-ring', 'Кремовый с зелёным кольцом', `<div style="background:${G}"></div><div style="position:absolute;inset:60px;border-radius:50%;overflow:hidden;background:${C}">${img('face-t.png','width:82%;left:9%;top:12%')}</div>`],
  ['05-wink', 'Подмигивает', `<div style="background:${G}"></div>${img('wink-t.png','width:88%;left:7%;top:14%')}`],
  ['06-folder', 'Выглядывает из папки', `<div style="background:${C}"></div>${img('folder-t.png','width:80%;left:10%;top:9%')}`],
  ['07-mark-cream', 'Знак-папка на кремовом', `<div style="background:${C}"></div><div style="position:absolute;width:62%;height:62%;left:19%;top:19%">${mark(G,R)}</div>`],
  ['08-mark-green', 'Знак на зелёном', `<div style="background:${G}"></div><div style="position:absolute;width:60%;height:60%;left:20%;top:20%">${mark(C,R)}</div>`],
  ['09-helmet', 'Шлем-символ', `<div style="background:${G}"></div>${img('helmet-t.png','width:78%;left:11%;top:12%')}`],
  ['10-amalfi', 'Веспи на фоне Амальфи', `<div style="background:url(${IN}/s11.jpg) center 18%/160% auto;filter:blur(10px) saturate(.9);transform:scale(1.08)"></div>${img('face-t.png','width:84%;left:8%;top:13%;filter:drop-shadow(0 18px 30px rgba(0,0,0,.3))')}`],
];
const base = `${font}*{margin:0}html,body{width:1080px;height:1080px;overflow:hidden;background:transparent}.c{position:relative;width:1080px;height:1080px;overflow:hidden}.c>div:first-child{position:absolute;inset:0}`;
const inline = h => h.replace(/file:\/\/[^"')\s]+\.(png|jpg|woff2)/g, u => { const f = u.slice(7); const t = f.endsWith('.png') ? 'image/png' : f.endsWith('.jpg') ? 'image/jpeg' : 'font/woff2'; return `data:${t};base64,${readFileSync(f).toString('base64')}`; });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
const ok = [];
for (const [id, title, html] of V) {
  const need = [...html.matchAll(/in\/([\w.-]+)/g)].map(m => m[1]);
  if (need.some(f => !existsSync(`${dir}/in/${f}`))) { console.log('skip', id, 'missing', need); continue; }
  await p.setContent(inline(`<style>${base}</style><div class="c">${html}</div>`), { waitUntil: 'load' });
  await p.waitForTimeout(150);
  await p.screenshot({ path: `${dir}/out/${id}.png`, omitBackground: true });
  ok.push([id, title]);
}
// Check sheet: each avatar as Instagram shows it — 110px profile circle and 32px comment circle, light and dark UI.
const rows = ok.map(([id, t], i) => `<div class="row"><div class="n">${i + 1}. ${t}</div>
 <div class="ui light"><img class="big" src="file://${dir}/out/${id}.png"><img class="sm" src="file://${dir}/out/${id}.png"><span>iitaly</span></div>
 <div class="ui dark"><img class="big" src="file://${dir}/out/${id}.png"><img class="sm" src="file://${dir}/out/${id}.png"><span>iitaly</span></div>
 <img class="full" src="file://${dir}/out/${id}.png"></div>`).join('');
await p.setViewportSize({ width: 1100, height: 400 });
await p.setContent(inline(`<style>${font}body{font-family:IT,sans-serif;background:#fff;margin:24px;width:1052px}.row{display:grid;grid-template-columns:230px 1fr 1fr 150px;gap:16px;align-items:center;padding:10px 0;border-bottom:1px solid #eee}.n{font-size:20px;font-weight:600;color:#141413}.ui{display:flex;align-items:center;gap:18px;padding:14px 18px;border-radius:16px}.light{background:#fff;border:1px solid #ddd}.dark{background:#000;color:#f5f5f5}.ui span{font-size:14px}.big{width:110px;height:110px;border-radius:50%}.sm{width:32px;height:32px;border-radius:50%}.full{width:150px;height:150px;border-radius:12px}h1{font-size:26px;margin:0 0 12px}</style><h1>Аватарка IITALY: 10 вариантов · круг 110 px (профиль) и 32 px (комментарии), светлая и тёмная тема</h1>${rows}`), { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.screenshot({ path: `${dir}/out/check.png`, fullPage: true });
await b.close();
console.log('rendered', ok.length);
