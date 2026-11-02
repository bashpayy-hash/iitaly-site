// The route lives on the overview only. Exercise real UI controls,
// keeping authentication and in-memory document context alive between views.
export async function portalDestination(page, name) {
  if (name === 'Документы') {
    await page.locator('[data-portal-documents]').click();
  } else if (name === 'Обзор') {
    const header=page.locator('[data-portal-header]');
    if(!await header.locator('a[href="/portal"]:visible').count())await header.getByLabel('Открыть меню').click();
    await header.locator('a[href="/portal"]:visible').click();
    await page.locator('[data-portal-page=overview]').waitFor();
  } else {
    // «План» is the current stage's page, reached from the step opened on the overview.
    if (!await page.locator('[data-portal-page=overview]').count()) await portalDestination(page, 'Обзор');
    await page.locator('[data-portal-overview]').getByRole('link', { name: 'Открыть этап' }).click();
    await page.locator('[data-portal-page=stage]').waitFor();
  }
}
export async function portalTask(page, id, part = "action") {
  if(!await page.locator(`[data-focus-row="${id}"],[data-portal-task="${id}"]`).count()) {
    if (!await page.locator('[data-road-stage]').count()) await portalDestination(page, 'Обзор');
    const stages=await page.locator('[data-road-stage]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-road-stage')));
    for(const stage of stages) {
      await portalStage(page, stage);
      if(await page.locator(`[data-focus-row="${id}"],[data-portal-task="${id}"]`).count())break;
      // Stage pages show one task at a time; later tasks sit behind the step pills.
      const pill=page.locator(`[data-stage-switcher] [data-story-pill][href*="step=${encodeURIComponent(id)}"]`);
      if(await pill.count()){await pill.first().click();await page.locator(`[data-focus-row="${id}"]`).waitFor();break;}
    }
  }
  const row=page.locator(`[data-focus-row="${id}"]`);
  const action=page.locator(`[data-portal-task="${id}"]`);
  if(await action.count())await action.click();
  else await row.getByRole('link').click();
  const sections=page.getByRole('navigation',{name:'Разделы задачи',exact:true});
  if(await sections.count())await sections.locator(`a[href$="part=${part}"]`).click();
}

export async function portalStage(page, stage) {
  if (!await page.locator('[data-road-stage]').count()) await portalDestination(page, 'Обзор');
  const destination = page.locator(`[data-road-stage="${stage}"]`);
  if (await destination.isVisible()) {
    // Lineup cards (stages ahead on the overview) open the stage page directly;
    // a stop on the line first opens its preview under the node.
    const lineup = await destination.evaluate(el => Boolean(el.closest('[data-stage-lineup]')));
    await destination.click();
    const preview = page.locator('[data-flight-stage-preview]');
    if (!lineup && await preview.count()) await preview.getByRole('link', { name: 'Открыть этап' }).click();
  }
  else {
    const stages = await page.locator('[data-road-stage]').evaluateAll(nodes => nodes.map(n => n.dataset.roadStage));
    const target = stages.indexOf(stage);
    if (target < 0) throw new Error(`Unknown stage: ${stage}`);
    await page.locator('[data-portal-overview]').getByRole('link', { name: 'Открыть этап' }).click();
    for (let count = 0; count < stages.length; count++) {
      const selected = await page.locator('[data-portal-focus]').getAttribute('data-selected-stage');
      if (selected === stage) break;
      const current = stages.indexOf(selected);
      await page.getByRole('navigation', { name: 'Соседние этапы' }).getByRole('link', {
        name: target > current ? /^Следующий этап:/ : /^Предыдущий этап:/,
      }).click();
    }
  }
  await page.locator('[data-portal-page=stage]').waitFor();
}

// Inspect saved counts from their actual home without reloading the account or
// abandoning form state. Browser Back returns to the same inner page.
export async function portalRoadState(page, expectedDone) {
  const inner = !await page.locator('[data-portal-road]').count();
  if (inner) await portalDestination(page, 'Обзор');
  if (expectedDone !== undefined) await page.waitForFunction(value => document.querySelector('[data-portal-road]')?.getAttribute('data-road-done') === value, expectedDone);
  const result = await page.locator('[data-portal-road]').evaluate(el => ({
    done: el.dataset.roadDone, total: el.dataset.roadTotal, ahead: el.dataset.roadAhead, current: el.dataset.currentStep,
    stage: el.querySelector('[aria-current=step]')?.getAttribute('data-road-stage'),
  }));
  if (inner) await page.goBack();
  return result;
}
