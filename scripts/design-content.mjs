import assert from 'node:assert/strict';

// User request 2026-10-18: shorten repeated Vespi interface copy. This exact
// replacement retains unlimited rechecks and the institution's decision; all
// other pricing text, amounts and product conditions still match the base.
const approvedRemovedUiLabels = new Set(['Веспи · сверим до подачи']);
const approvedUiCopyChanges = new Map([
  ['AI-сверка без лимита помогает найти замечания до подачи. Загрузи исправленную версию — повторная проверка входит в цену. Решение о приёме документа остаётся за вузом или консульством.',
    'Проверяй документы и исправленные версии без доплаты. Решение о приёме принимает вуз или консульство.'],
]);

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
    if (approvedRemovedUiLabels.has(value)) continue; // Explicitly removed decorative byline only.
    const expected = approvedUiCopyChanges.get(value) ?? value;
    // Both revisions can be the new text when comparing against a later base.
    assert((counts.get(expected) || 0) > 0, `${label}: missing original copy: ${value}`);
    counts.set(expected, counts.get(expected) - 1);
  }
}
