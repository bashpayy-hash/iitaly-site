import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
// Playwright is the machine's global install (see the repository README), not a project dependency.
const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = process.argv[2], dark = process.argv[3] === 'dark';
const uri = (f, t) => `data:${t};base64,` + fs.readFileSync(f).toString('base64');
const av = uri(path.join(DIR, '../../avatar-final/avatar-iitaly-320.png'), 'image/png');
const covers = ['post1-1', 'post2-1', 'post3-1'].map(n => uri(path.join(DIR, '../posts', n + '.jpg'), 'image/jpeg'));
const hl = [['01-o-nas','О нас'],['02-cena','Цена'],['03-dokumenty','Проверка'],['04-dsu','DSU'],['05-vuzy','Вузы'],['06-viza','Виза'],['07-gaidy','Гайды'],['08-voprosy','Вопросы']]
  .map(([f, t]) => [uri(path.join(DIR, '../highlights', f + '.jpg'), 'image/jpeg'), t]);
const bg = dark ? '#000' : '#fff', fg = dark ? '#F5F5F5' : '#0C0C0C', mute = dark ? '#A8A8A8' : '#737373', line = dark ? '#262626' : '#DBDBDB';
const html = `<div class="p">
 <div class="top"><b>iitaly</b></div>
 <div class="head"><img class="av" src="${av}"><div class="stats"><div><b>3</b><span>публикации</span></div><div><b>—</b><span>подписчики</span></div><div><b>—</b><span>подписки</span></div></div></div>
 <div class="bio"><b>IITALY · поступление в Италию</b><p>Поступление в Италию с ИИ · вузы, документы, DSU, виза D · 10 990 ₸ вместо агентства</p><a>iitaly.net</a></div>
 <div class="hl">${hl.map(([s,t]) => `<figure><span><img src="${s}"></span><figcaption>${t}</figcaption></figure>`).join('')}</div>
 <div class="tabs"><i></i></div>
 <div class="grid">${covers.map(s => `<img src="${s}">`).join('')}</div>
</div>`;
const css = `html,body{margin:0;background:${bg}} body>*:not(.p){display:none!important}
.p{width:390px;background:${bg};color:${fg};font-family:-apple-system,"SF Pro Text",var(--font-inter-tight),system-ui,sans-serif;font-size:14px;padding-bottom:2px}
.top{height:44px;display:flex;align-items:center;padding:0 16px;font-size:20px}
.head{display:flex;align-items:center;gap:24px;padding:8px 16px}
.av{width:86px;height:86px;border-radius:50%;object-fit:cover}
.stats{display:flex;flex:1;justify-content:space-around;text-align:center}.stats b{display:block;font-size:16px}.stats span{font-size:13px}
.bio{padding:8px 16px 0;line-height:1.35}.bio b{font-size:14px}.bio p{margin:2px 0}.bio a{color:${dark?'#E0F1FF':'#00376B'};font-weight:600}
.hl{display:flex;gap:14px;padding:16px 16px 10px;overflow:hidden}
.hl figure{margin:0;width:64px;text-align:center}.hl span{display:block;width:64px;height:64px;border-radius:50%;padding:3px;box-shadow:0 0 0 1px ${line};box-sizing:border-box}
.hl img{width:58px;height:58px;border-radius:50%;object-fit:cover;object-position:50% 50%}
.hl figcaption{font-size:12px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tabs{height:44px;border-top:1px solid ${line}}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}.grid img{width:100%;aspect-ratio:3/4;object-fit:cover}`;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 3 });
  await pg.goto('http://127.0.0.1:4310/', { waitUntil: 'networkidle' });
  await pg.evaluate(([h, c]) => { document.body.innerHTML = h; const s = document.createElement('style'); s.textContent = c; document.head.appendChild(s); scrollTo(0,0); }, [html, css]);
  await pg.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  await pg.locator('.p').screenshot({ path: OUT }); await b.close();
})();
