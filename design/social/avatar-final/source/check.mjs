// Instagram-like check sheet for a final avatar: profile header (110 px), story ring (66 px),
// comment row (32 px), light and dark, plus the square with the circle crop marked.
import { createRequire } from 'node:module';
import fs from 'node:fs';
// Playwright is installed globally in the sandbox, not in the project, so it is resolved through createRequire.
const { chromium } = createRequire(import.meta.url)('playwright');
const files = process.argv.slice(3); const out = process.argv[2];
const uri = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const font = 'data:font/woff2;base64,' + fs.readFileSync('/home/user/iitaly-site/public/fonts/inter-tight-tenge-v1.woff2').toString('base64');
const block = (f, label) => { const u = uri(f); const ui = (theme) => `
  <div class="ui ${theme}">
    <div class="prof"><img class="a110" src="${u}"><div><b>iitaly</b><div class="stats"><span><b>3</b> публикации</span><span><b>0</b> подписчиков</span></div></div></div>
    <div class="row"><div class="ring"><img class="a66" src="${u}"></div><div class="ring other"></div><div class="ring other"></div></div>
    <div class="comment"><img class="a32" src="${u}"><span><b>iitaly</b> Первая проверка — бесплатно</span></div>
  </div>`;
  return `<section><h2>${label}</h2><div class="grid">${ui('light')}${ui('dark')}<div class="sq"><img src="${u}"><div class="mask"></div></div></div></section>`; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1180, height: 400 }, deviceScaleFactor: 2 });
  const body = files.map((f, i) => block(f.split('::')[0], f.split('::')[1] || `Вариант ${i + 1}`)).join('');
  await p.setContent(`<style>@font-face{font-family:IT;src:url(${font})}body{margin:24px;font-family:IT,-apple-system,sans-serif;background:#fff;color:#141413}h1{font-size:24px;margin:0 0 6px}p.s{margin:0 0 14px;color:#57514B;font-size:14px}h2{font-size:18px;margin:18px 0 8px}.grid{display:grid;grid-template-columns:400px 400px 300px;gap:16px;align-items:start}
  .ui{border-radius:16px;padding:16px;border:1px solid #dbdbdb}.light{background:#fff;color:#000}.dark{background:#000;color:#f5f5f5;border-color:#262626}
  .prof{display:flex;gap:18px;align-items:center}.a110{width:110px;height:110px;border-radius:50%;display:block}.stats{display:flex;gap:14px;font-size:13px;margin-top:6px}
  .row{display:flex;gap:14px;margin:16px 0}.ring{width:74px;height:74px;border-radius:50%;background:conic-gradient(#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75);display:grid;place-items:center}.ring.other{opacity:.35}.a66{width:66px;height:66px;border-radius:50%;border:3px solid currentColor;box-sizing:border-box}.light .a66{border-color:#fff}.dark .a66{border-color:#000}
  .comment{display:flex;gap:10px;align-items:center;font-size:14px}.a32{width:32px;height:32px;border-radius:50%}
  .sq{position:relative;width:300px;height:300px}.sq img{width:300px;height:300px;display:block}.mask{position:absolute;inset:0;background:radial-gradient(circle at center,transparent 149px,rgba(255,255,255,.72) 150px);outline:1px solid #ddd}</style>
  <h1>Аватарка IITALY — финал № 64</h1><p class="s">Как увидит Instagram: профиль 110 px, кольцо историй 66 px, комментарий 32 px; справа — квадрат 1080×1080, светлым показано то, что срежет круг.</p>${body}`);
  await p.waitForTimeout(400); await p.screenshot({ path: out, fullPage: true }); await b.close();
})();
