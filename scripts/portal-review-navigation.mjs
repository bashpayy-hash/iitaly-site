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
    // «План» is the current stage's page: its row in «Весь путь» is marked as the current step.
    if (!await page.locator('[data-portal-page=overview]').count()) await portalDestination(page, 'Обзор');
    await page.locator('[data-portal-road] [data-road-stage][aria-current=step]').click();
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
  // Owner, 5 Nov: every stage is one row of «Весь путь» on the overview; the row opens its page.
  const destination = page.locator(`[data-road-stage="${stage}"]`);
  if (!await destination.count()) throw new Error(`Unknown stage: ${stage}`);
  await destination.click();
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
