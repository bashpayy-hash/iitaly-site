// The stage pipeline replaces the old sidebar. Exercise real UI controls,
// keeping authentication and in-memory document context alive between views.
export async function portalDestination(page, name) {
  if (name === 'Документы') {
    await page.locator('[data-portal-documents]').click();
  } else {
    // A completed route has no current stage; the plan then opens the last one.
    const current = page.locator('[data-road-stage][aria-current="step"]');
    await (await current.count() ? current : page.locator('[data-road-stage]').last()).click();
    await page.locator('[data-portal-focus]').waitFor();
  }
}
export async function portalTask(page, id) {
  if(!await page.locator(`[data-focus-row="${id}"],[data-portal-task="${id}"]`).count()) {
    const stages=await page.locator('[data-road-stage]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-road-stage')));
    for(const stage of stages) {
      await page.locator(`[data-road-stage="${stage}"]`).click();
      if(await page.locator(`[data-focus-row="${id}"],[data-portal-task="${id}"]`).count())break;
    }
  }
  const row=page.locator(`[data-focus-row="${id}"]`);
  const action=page.locator(`[data-portal-task="${id}"]`);
  if(await action.count())await action.click();
  else await row.getByRole('link').click();
}
