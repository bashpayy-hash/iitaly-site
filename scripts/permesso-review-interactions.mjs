// Use the same disclosure a person uses; never force-click hidden actions.
export async function usePermessoTool(editor, name) {
  const target = editor.getByRole('button', { name, exact: true });
  if (!await target.isVisible()) {
    const tools = editor.locator('[data-workbench-tools]');
    if (!await tools.evaluate(node => node.open)) await tools.locator(':scope > summary').click();
  }
  await target.click();
}
