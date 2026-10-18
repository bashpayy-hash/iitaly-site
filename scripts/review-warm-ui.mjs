import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.REVIEW_TOOLS || '/tmp/iitaly-browser/node_modules', 'playwright'));
const root = resolve('out'), output = resolve(process.env.WARM_REVIEW_OUTPUT || 'design-review/warm');
await mkdir(output, { recursive: true });
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.avif':'image/avif', '.woff2':'font/woff2' };
const server = createServer(async (request, response) => {
  const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (!path.startsWith(root + sep) && path !== root) return response.writeHead(403).end();
  for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
    if (await stat(file).then(s => s.isFile()).catch(() => false)) {
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      return response.end(await readFile(file));
    }
  }
  response.writeHead(404, { 'Content-Type':'text/html' });
  response.end(await readFile(resolve(root, '404.html')));
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless:true });
const results = [], failures = [], pageErrors = [];
const fixture = {
  ok:true,
  client:{ name:'Тестовый студент', surname:'Testov', intakeYear:2027, onboardingComplete:true, tgLinked:false, notify:{telegram:false}, profile:{education:'NIS Grade 12',goal:'Бакалавриат',budget:'До 3 млн ₸/год',educationPath:'university_kz',onboardingDone:true} },
  roadmap:[
    { id:'start',title:'Старт',tasks:[{id:'profile',t:'Заполнить профиль',available:true,owner:'Ты'},{id:'shortlist',t:'Выбрать университеты',available:true,owner:'Ты',time:'15 мин'},{id:'chances',t:'Оценить шансы на стипендию',available:true,owner:'Ты'}]},
    { id:'documents',title:'Документы',tasks:[{id:'apostille',t:'Подготовить аттестат с апостилем',available:true,owner:'Ты'},{id:'checkDocs',t:'Проверить документы',available:true,owner:'Ты'}]},
    { id:'arrival',title:'После приезда',tasks:[{id:'kit',t:'Подготовить заявление на вид на жительство',available:true,owner:'Ты'}]},
  ],
  done:{ profile:true }, docs:{}, progress:{ done:1,total:6,pct:17 },
};

async function inspect(page, name, width, screenshot = true) {
  await page.evaluate(async () => { await document.fonts.ready; });
  const result = await page.evaluate(() => {
    const cold = [], memo = new Map();
    const canvas = document.createElement('canvas'); canvas.width=canvas.height=1;
    const ctx = canvas.getContext('2d', { willReadFrequently:true });
    function isCold(value) {
      if (memo.has(value)) return memo.get(value);
      if (!CSS.supports('color', value)) return false;
      ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);
      const [r,g,b,a] = ctx.getImageData(0,0,1,1).data;
      const answer = a>5 && (b>r+3 || g>r+3);
      memo.set(value,answer);return answer;
    }
    const props = ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','outlineColor','textDecorationColor','fill','stroke','accentColor','boxShadow','backgroundImage','filter'];
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height || getComputedStyle(el).visibility==='hidden') continue;
      for (const pseudo of [null,'::before','::after','::placeholder']) {
        if (pseudo==='::placeholder' && !el.matches('input,textarea')) continue;
        const style = getComputedStyle(el,pseudo);
        if (pseudo && pseudo!=='::placeholder' && ['none','normal'].includes(style.content)) continue;
        for (const prop of props) {
          const value = style[prop] || '';
          const colors = value.match(/rgba?\([^)]+\)|color\(srgb[^)]+\)|oklch\([^)]+\)|oklab\([^)]+\)|#[a-f\d]{3,8}\b/gi) || [];
          for (const color of colors) if (isCold(color)) cold.push({element:el.tagName,class:el.getAttribute('class')?.slice(0,100),pseudo,prop,color});
        }
      }
    }
    const h1 = document.querySelector('h1');
    const rootStyle = getComputedStyle(document.documentElement);
    return {
      cold:cold.slice(0,20), coldCount:cold.length,
      horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,
      bodyBackground:getComputedStyle(document.body).backgroundColor,
      h1:h1 ? {text:h1.textContent,color:getComputedStyle(h1).color,weight:getComputedStyle(h1).fontWeight,size:getComputedStyle(h1).fontSize,font:getComputedStyle(h1).fontFamily}:null,
      tokens:Object.fromEntries(['--bg-base','--bg-surface','--bg-subtle','--text-primary','--accent-primary'].map(k=>[k,rootStyle.getPropertyValue(k).trim()])),
      brokenImages:[...document.images].filter(i=>i.complete && !i.naturalWidth).map(i=>i.src),
    };
  });
  if (screenshot) await page.screenshot({ path:resolve(output,`${name}-${width}.png`), fullPage:true });
  const entry={name,width,...result};results.push(entry);
  if(result.coldCount || result.horizontalOverflow || result.brokenImages.length) failures.push(entry);
  console.log(`${width} ${name}: cold=${result.coldCount} overflow=${result.horizontalOverflow} images=${result.brokenImages.length}`);
}

try {
  for (const width of [1440,390]) {
    const context = await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce',locale:'ru-RU'});
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if(url.pathname==='/api/portal/lookup') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)});
      if(url.pathname.startsWith('/api/') || url.pathname==='/health/ai') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,code:'AI_READY'})});
      if(url.origin===origin) return route.continue();
      return route.abort();
    });
    context.setDefaultTimeout(7000);
    const page = await context.newPage();
    page.on('pageerror', error => pageErrors.push({width,message:error.message}));
    async function visit(path) { await page.goto(origin+path,{waitUntil:'networkidle'}); await page.evaluate(()=>document.fonts.ready); }
    for (const [name,path] of [['home','/'],['guides','/guides'],['plan','/plan'],['prices','/prices'],['universities','/universities'],['local-workspace','/portal'],['login','/portal?view=login'],['changes','/changes-2026-27'],['permesso','/guides/permesso-modulo-1'],['privacy','/privacy'],['terms','/terms'],['payment','/payment/success'],['not-found','/missing-warm-review']]) {
      await visit(path);await inspect(page,name,width,['home','guides','plan','prices','universities','login','permesso'].includes(name));
    }
    try {
      await visit('/guides');
      await page.locator('#guide-search').fill('виза');
      await inspect(page,'guides-search',width);
      await page.locator('#guide-search').fill('');
      await page.getByRole('navigation',{name:'Этапы справочника'}).getByRole('link').nth(1).click();
      await inspect(page,'guides-active',width);
      await page.getByRole('navigation',{name:'Этапы справочника'}).getByRole('link').nth(2).click();
      await inspect(page,'guides-arrival',width,false);
    } catch(error) {failures.push({name:'guide-interaction',width,message:error.message});}
    try {
      await visit('/plan');
      await page.getByRole('button').filter({hasText:'Осенью 2027'}).click();
      await page.getByRole('button').filter({hasText:'11 классов'}).click();
      await inspect(page,'plan-active',width);
    } catch(error) {failures.push({name:'plan-interaction',width,message:error.message});}
    try {
      await visit('/universities');
      await page.getByRole('button',{name:'Милан — показать университеты',exact:true}).click();
      await inspect(page,'university-selected',width);
    } catch(error) {failures.push({name:'university-interaction',width,message:error.message});}
    try {
      await visit('/portal?view=login');
      await page.locator('input[name="surname"]').fill('Testov');
      await page.locator('input[name="access-code"]').fill('TEST-01');
      await page.getByRole('button',{name:'Войти в кабинет',exact:true}).click();
      await page.getByRole('heading',{name:/Привет/}).waitFor();
      await inspect(page,'portal',width);
      for (const [name,path] of [['portal-plan','/portal?view=plan'],['portal-docs','/portal?view=docs'],['portal-settings','/portal?view=settings']]) {
        await visit(path);await inspect(page,name,width);
      }
    } catch(error) {failures.push({name:'portal-interaction',width,message:error.message});}
    try {
      await visit('/guides');
      const launcher = page.getByRole('button',{name:'Задать вопрос ИИ-консультанту',exact:true});
      if(await launcher.isVisible()) await launcher.click();
      else { await page.locator('header summary').click();await page.getByRole('button',{name:'Задать вопрос',exact:true}).click(); }
      await page.getByRole('dialog',{name:'ИИ-консультант'}).waitFor();
      await inspect(page,'assistant-open',width);
    } catch(error) {failures.push({name:'assistant-interaction',width,message:error.message});}
    await context.close();
  }
  await writeFile(resolve(output,'results.json'),JSON.stringify({results,failures,pageErrors},null,2));
  console.log(JSON.stringify({captures:results.length,failures:failures.length,pageErrors},null,2));
  if(failures.length || pageErrors.length)process.exitCode=1;
} finally { await browser.close();server.close(); }
