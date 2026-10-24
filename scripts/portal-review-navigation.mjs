// The stage pipeline replaces the old sidebar. Exercise real UI controls,
// keeping authentication and in-memory document context alive between views.
export async function portalDestination(page, name) {
  const home = page.locator('[data-portal-header] a[href="/portal"]');
  await home.click();
  await page.locator('[data-portal-focus]').waitFor();
  if (name === 'Документы') {
    await page.locator('[data-portal-documents]').click();
  } else if (name === 'План') {
    await page.locator('[data-road-stage][aria-current="step"]').click();
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
  if(await row.count() && !(await row.evaluate(n=>n.open)))await row.locator('summary').click();
  await page.locator(`[data-portal-task="${id}"]`).click();
}
