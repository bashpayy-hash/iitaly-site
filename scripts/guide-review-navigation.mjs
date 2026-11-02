// Exercise the actual two-stage directory interaction and the existing deep links.
export async function openGuideStage(page, stage) {
  const category = page.locator(`[data-guide-category="${stage}"]`);
  await category.waitFor();
  await category.click();
  await page.locator(`[data-guide-stage="${stage}"]`).click();
  await page.waitForURL(`**/guides/stages/${stage}`);
}
export async function openGuideTopic(page, id) {
  const entry = page.locator(`[data-guide-select="${id}"]`);
  const inspector = await entry.evaluate(element => element.tagName === "BUTTON");
  await entry.click();
  const preview = page.locator(`[data-guide-preview="${id}"]`);
  if (inspector) await preview.getByRole('link', {name:'Открыть подробный наглядный разбор'}).click();
  await page.waitForURL(`**/guides/${id}`);
}
