import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

// User request 18 October: fail on cold literals, utility classes and inline SVG
// gradients across production source. Raster editorial artwork is unchanged.
function coldRgb(r, g, b) {
  // The 18 October workspace brief explicitly adds these two sage success tokens.
  if (["31,122,104", "230,244,241"].includes([r,g,b].map(Math.round).join(","))) return false;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max-min;
  if (d <= 1) return false;
  let h = max === r ? ((g-b)/d)%6 : max === g ? (b-r)/d+2 : (r-g)/d+4;
  h = (h*60+360)%360;
  return h >= 160 && h <= 305;
}
function coldColors(source) {
  const found = [];
  const text = source.replace(/%23/gi, '#');
  for (const match of text.matchAll(/#[\da-f]{3,8}\b/gi)) {
    let hex = match[0].slice(1);
    if ([3,4].includes(hex.length)) hex = [...hex].map(x=>x+x).join('');
    if (![6,8].includes(hex.length)) continue;
    if (coldRgb(...[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)))) found.push(match[0]);
  }
  for (const match of text.matchAll(/rgba?\(([^)]+)\)/gi)) {
    const numbers = match[1].match(/[\d.]+/g)?.map(Number) || [];
    if (numbers.length >= 3 && coldRgb(...numbers.slice(0,3))) found.push(match[0]);
  }
  for (const match of text.matchAll(/(?:hsla?|oklch)\(([^)]+)\)/gi)) {
    const n = match[1].match(/[\d.]+/g)?.map(Number) || [];
    const hue = match[0].startsWith('hsl') ? n[0] : n[2];
    if (n[1] > 0 && hue >= 160 && hue <= 305) found.push(match[0]);
  }
  for (const match of text.matchAll(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/gi)) {
    if (coldRgb(...match.slice(1,4).map(x=>Number(x)*255))) found.push(match[0]);
  }
  return found;
}
const files = execFileSync('git',['ls-files','src','public','design','tokens.css'],{encoding:'utf8'}).trim().split('\n').filter(f=>/\.(?:css|scss|js|jsx|ts|tsx|html|svg)$/.test(f));
const violations = [];
for (const file of files) {
  const source = await readFile(file,'utf8');
  const colors = coldColors(source);
  const utilities = source.match(/\b(?:blue|sky|cyan|indigo|violet|purple|slate)-(?:\d|\[)/g) || [];
  if (colors.length || utilities.length) violations.push({file,colors:[...new Set(colors)],utilities:[...new Set(utilities)]});
}
assert.deepEqual(violations,[], 'Production source must contain zero cold color literals or utility classes');
console.log(`Warm palette: ${files.length} source files checked; 0 cold colors/classes.`);
if (process.argv.includes('--source-only')) process.exit(0);

assert(process.env.REVIEW_TOOLS,'REVIEW_TOOLS must point to isolated browser tools.');
const { chromium } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS,'playwright/index.mjs')).href);
const { default: axe } = await import(pathToFileURL(resolve(process.env.REVIEW_TOOLS,'axe-core/axe.js')).href);
const root = resolve(process.env.WARM_OUT || 'out');
const output = resolve(process.env.WARM_OUTPUT || 'design-review/warm-palette');
await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.ico':'image/x-icon'};
const server=createServer(async(req,res)=>{
  const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(path!==root&&!path.startsWith(root+sep))return res.writeHead(403).end();
  for(const file of [path,path+'.html',resolve(path,'index.html')])if(await stat(file).then(s=>s.isFile()).catch(()=>false)){res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});return res.end(await readFile(file));}
  res.writeHead(404).end();
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch();
const results=[];
try {
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:width<600?844:1000},reducedMotion:'reduce',locale:'ru-RU'});
    await context.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.pathname==='/api/event')return route.fulfill({json:{ok:true}});
      if(url.pathname==='/health/ai')return route.fulfill({json:{ok:true,code:'AI_READY'}});
      if(url.origin!==origin)return route.fulfill({status:503,json:{ok:false,error:'Review uses local fixtures only'}});
      return route.continue();
    });
    const page=await context.newPage();
    for(const path of ['/guides','/universities','/plan','/prices','/portal','/']){
      console.log(`Review ${path} ${width}`);
      await page.goto(origin+path,{waitUntil:'networkidle'});
      await page.evaluate(()=>document.fonts.ready);
      const snapshot=await page.evaluate(()=>{
        const values=[];
        for(const node of document.querySelectorAll('body *')){
          const rect=node.getBoundingClientRect();if(!rect.width||!rect.height)continue;
          for(const pseudo of [null,'::before','::after']){
            const s=getComputedStyle(node,pseudo);if(s.display==='none'||s.visibility==='hidden')continue;
            values.push({element:node.tagName,colors:['color','backgroundColor','backgroundImage','borderTopColor','boxShadow','outlineColor','fill','stroke'].map(k=>s[k]).join(' ')});
          }
        }
        return {body:getComputedStyle(document.body).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth+1,values};
      });
      assert.equal(snapshot.body,'rgb(250, 248, 245)',`${path}: shared alabaster body`);
      assert.equal(snapshot.overflow,false,`${path} ${width}: no horizontal overflow`);
      const cold=snapshot.values.filter(item=>coldColors(item.colors).length);
      assert.deepEqual(cold,[],`${path} ${width}: no cold computed text, surfaces, borders, glows or SVG`);
      if(path==='/guides'){
        assert.match(await page.locator('h1 > span').evaluate(e=>getComputedStyle(e).backgroundImage),/217, 43, 56/);
        const avatar=page.locator('[data-vespi-search-avatar]');
        assert.equal(await avatar.count(),1,'The search uses one contextual avatar');
        assert.equal(await avatar.getAttribute('src'),'/mascot/handmade-v1/avatar-96.webp');
        assert(await avatar.evaluate(e=>e.complete&&e.naturalWidth>0),'The new search avatar loads');
        assert.equal(await page.locator('[data-guide-timeline] a[aria-current="step"]').count(),0,'A fresh guide visit waits for a route choice');
        await page.locator('[data-guide-select="education"]').click();
        assert.equal(await page.locator('[data-guide-timeline] a[aria-current="step"] > span').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(20, 20, 19)','The current timeline stage uses the existing warm ink');
      }
      await page.addScriptTag({content:axe.source});
      const accessibility=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
      assert.deepEqual(accessibility.violations.filter(v=>['serious','critical'].includes(v.impact)),[],`${path} ${width}: accessibility`);
      await page.screenshot({path:resolve(output,`${path==='/'?'home':path.slice(1)}-${width}.png`),fullPage:false,animations:'disabled'});
      results.push({route:path,width,body:snapshot.body,coldComputed:0,overflow:false,axe:true});
    }
    await context.close();
  }
  await writeFile(resolve(output,'results.json'),JSON.stringify({sourceFiles:files.length,coldSource:0,results},null,2));
  console.log(`Warm palette: ${results.length} rendered screens passed.`);
} finally {await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
