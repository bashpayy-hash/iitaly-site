// Exercise the actual two-stage directory interaction and the existing deep links.
export async function openGuideStage(page, stage) {
  const category = page.locator(`[data-guide-category="${stage}"]`);
  await category.waitFor();
  await category.click();
  await page.locator(`[data-guide-stage="${stage}"]`).click();
  await page.waitForURL(`**/guides/stages/${stage}`);
}
// «Подробнее» on a topic tile opens the topic page.
export async function openGuideTopic(page, id) {
  await page.locator(`[data-guide-select="${id}"]`).click();
  await page.waitForURL(`**/guides/${id}`);
}
