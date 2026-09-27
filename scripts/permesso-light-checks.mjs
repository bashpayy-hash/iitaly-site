import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { clickPermessoTool } from './permesso-review-interactions.mjs';

export async function reviewLightWorkbench({ page, editor, model, width, touch, output }) {
  const tools = editor.locator('[data-workbench-tools]');
  const summary = tools.locator(':scope > summary');
  const loaded = () => editor.locator('[data-sheet-page][data-ready="true"]').waitFor();
  const panel = editor.locator('aside[aria-label="Подсказка и ввод выбранного поля"]');
  const navigate = async n => { await editor.getByRole('navigation', {name:'Страницы электронного бланка'}).getByRole('button').nth(n - 1).click(); await loaded(); };
  const select = async id => {
    const zone = editor.locator(`[data-field-zone="${id}"]`);
    if (touch) {
      // Adjacent 44px hit areas may overlap; touch the actual printed cell and
      // require the app's nearest-cell resolver to pin the right official ID.
      const cells = editor.locator(`[data-cell-outline="${id}"]`).first();
      await cells.evaluate(node => node.scrollIntoView({block:'center',behavior:'instant'}));
      const b=await cells.boundingBox();
      await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
      await page.waitForFunction(expected => document.querySelector('[data-permesso-editor]')?.getAttribute('data-pinned-field') === expected,id);
    } else await zone.focus().then(() => zone.press('Enter'));
    const help = page.locator('[data-permesso-hover]');
    if (touch && await help.count()) await help.getByRole('button', {name:'Закрыть подсказку',exact:true}).click();
    else await page.keyboard.press('Escape');
  };
  const aligned = async id => {
    const f = model.EDITOR_FIELDS.find(field => field.id === id);
    for (let part = 0; part < f.runs.length; part++) {
      const r = f.runs[part];
      const cells = editor.locator(`[data-editor-field="${id}"][data-part="${part}"]`);
      const positions = await cells.locator('[data-paper-glyph]').evaluateAll(nodes => nodes.map(node => {
        const g=node.getBoundingClientRect(),s=node.closest('[data-sheet-page]').getBoundingClientRect();
        return {index:Number(node.dataset.paperGlyph),x:g.x+g.width/2,y:g.y+g.height/2,sx:s.x,sy:s.y,sw:s.width,sh:s.height};
      }));
      assert(positions.length, `Glyphs present in field ${id}, part ${part}`);
      for (const p of positions) {
        const x=p.sx+(r.x+p.index*r.pitch+r.cell/2)/595*p.sw;
        const y=p.sy+(r.y+r.height/2)/842*p.sh;
        assert(Math.abs(p.x-x)<.85 && Math.abs(p.y-y)<.85, `Glyph registration ${id}:${part}:${p.index} at ${width}`);
      }
      const outline = editor.locator(`[data-highlight-for="${id}"][data-highlight-part="${part}"]`);
      assert.equal(await outline.getAttribute('vector-effect'),'non-scaling-stroke');
      assert.equal(await outline.getAttribute('stroke-width'),'1.5');
      const inset = await outline.evaluate((node,run) => {
        const box=node.getBoundingClientRect(),s=node.closest('[data-sheet-page]').getBoundingClientRect();
        return {x:(s.x+run.x/595*s.width)-box.x,y:(s.y+run.y/842*s.height)-box.y};
      },r);
      assert(Math.abs(inset.x-inset.y)<.15,'Equal physical padding on both axes');
    }
  };
  await navigate(1);
  let visible = 0;
  for (const control of await editor.locator('[data-workbench-bar]').locator('button,summary').all()) if (await control.isVisible()) visible++;
  assert(visible<=6,`Only six primary workbench controls; found ${visible}`);
  assert.equal(await editor.getByRole('button',{name:'Сохранить',exact:true}).isVisible(),false);
  await summary.focus();await summary.press('Enter');
  assert.equal(await tools.evaluate(node=>node.open),true);
  assert(await editor.getByRole('button',{name:'Сохранить',exact:true}).isVisible());
  const menu=await tools.locator(':scope > div').boundingBox();
  assert(menu && menu.x>=0 && menu.x+menu.width<=width+1,'Tools fit the screen');
  await page.keyboard.press('Escape');assert.equal(await tools.evaluate(node=>node.open),false);
  assert(await summary.evaluate(node=>node===document.activeElement),'Menu restores keyboard focus');
  await select('3');
  await panel.getByRole('textbox',{name:'Ввести: Фамилия',exact:true}).fill('TEST STUDENT'.padEnd(30,' ')+'SECOND ROW');
  await aligned('3');
  await clickPermessoTool(editor,'Увеличить лист');await aligned('3');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Zoom stays inside the paper viewport');
  await clickPermessoTool(editor,'Вместить лист');
  await navigate(2);await select('34');
  await panel.getByRole('textbox',{name:'Ввести: Дата рождения',exact:true}).fill('14032004');
  await aligned('34');
  await clickPermessoTool(editor,'Увеличить лист');await aligned('34');
  await clickPermessoTool(editor,'Вместить лист');
  await select('32');await panel.getByRole('radio',{name:'A — Не в браке',exact:true}).check();
  await page.keyboard.press('Escape');await aligned('32');
  assert.equal(await panel.getByText('STATO CIVILE',{exact:true}).count(),1,'One Italian label in the inspector, not duplicated');
  assert.equal(await panel.locator('[data-quick-answer]').innerText(),'A');
  const answerDetail=panel.locator('[data-answer-detail="true"]');
  assert.equal(await answerDetail.getByText('ЗАПОЛНИ',{exact:true}).count(),0,'No nested duplicate status badge');
  if ([1440,390].includes(width)) {
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});});
    await page.mouse.move(1,1);await page.keyboard.press('Escape');
    await page.screenshot({path:resolve(output,`light-workbench-${width}.png`),animations:'disabled'});
    await summary.click();await page.screenshot({path:resolve(output,`light-tools-${width}.png`),animations:'disabled'});
    await page.keyboard.press('Escape');
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
}
