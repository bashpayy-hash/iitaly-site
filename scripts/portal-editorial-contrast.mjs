// Explicit 25 October brief fixes this *one* secondary rubric at #8C857B/11px.
// Its contrast (~3.4:1) is a known exception, not an AA pass. All other nodes
// and every other axe rule remain blocking. Keep the finding visible in logs.
export async function editorialContrastFindings(page, findings) {
  const remaining = [];
  for (const finding of findings) {
    if (finding.id !== 'color-contrast') { remaining.push(finding); continue; }
    const targets = finding.targets || finding.nodes?.map(node => node.target) || [];
    let requestedOnly = targets.length > 0;
    for (const target of targets) {
      if (target.length !== 1 || typeof target[0] !== 'string') { requestedOnly = false; break; }
      const matches = await page.locator(target[0]).evaluateAll(nodes => nodes.length > 0 && nodes.every(node => {
        const css = getComputedStyle(node);
        return node.hasAttribute('data-portal-rubric') && css.color === 'rgb(140, 133, 123)' && css.fontSize === '11px';
      }));
      if (!matches) { requestedOnly = false; break; }
    }
    if (requestedOnly) console.info('Known requested contrast exception: portal rubric #8C857B at 11px. Not WCAG AA.');
    else remaining.push(finding);
  }
  return remaining;
}
