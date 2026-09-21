import assert from 'node:assert/strict';

// Compare content independently of layout, disclosure state, and reading order.
// This redesign may add navigation, but must retain every original text node,
// including terms inside closed disclosures and alternate responsive layouts.
export async function textInventory(page, selector = 'main') {
  return page.locator(selector).evaluate(root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const values = [];
    while (walker.nextNode()) {
      if (walker.currentNode.parentElement?.closest('script,style')) continue;
      const value = walker.currentNode.textContent.replace(/\s+/g, ' ').trim();
      if (value) values.push(value);
    }
    return values;
  });
}

export function assertContentPreserved(before, after, label) {
  const counts = new Map();
  for (const value of after) counts.set(value, (counts.get(value) || 0) + 1);
  for (const value of before) {
    assert((counts.get(value) || 0) > 0, `${label}: missing original copy: ${value}`);
    counts.set(value, counts.get(value) - 1);
  }
}
