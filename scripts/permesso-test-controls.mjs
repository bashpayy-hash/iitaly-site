export async function action(editor, name, options = {}) {
  const kind = /Rilascio|Rinnovo/.test(String(name)) ? 'scenario' : 'tools';
  const menu = editor.locator(`[data-compact-menu="${kind}"]`);
  if (await menu.count() && !(await menu.evaluate(el => el.open))) await menu.locator(':scope > summary').click();
  await editor.getByRole('button', { name, ...options }).click();
}
