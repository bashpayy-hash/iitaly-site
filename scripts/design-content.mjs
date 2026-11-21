import assert from 'node:assert/strict';

// User request 2026-10-18: shorten repeated Vespi interface copy. This exact
// replacement retains unlimited rechecks and the institution's decision; all
// other pricing text, amounts and product conditions still match the base.
const approvedRemovedUiLabels = new Set(['Веспи · сверим до подачи',
  // 2026-11-21, owner with tablet screenshots: «идёт перенасыщение каких-то
  // блоков текстом… исправь эту причину». Each fact of the document check
  // had a third line repeating the section's own comparison rows, invitation
  // and lead; a fact is now a value and its name. Prices, terms and the
  // comparison with an agency are untouched.
  'Без очереди и записи к менеджеру.',
  'Проверяй, когда документ готов, а не когда открыт офис.',
  'Исправил — проверь снова, сколько нужно. Первая — бесплатно.',
  'Сверка с правилами твоего вуза, DSU и визы на твой учебный год.',
]);
const approvedUiCopyChanges = new Map([
  // 2026-11-21, same request: the section's lead ends where its statement
  // ends; the aside about an agency's opening hours is the first row of the
  // comparison under it.
  ['Загрузи справку, перевод, выписку или аттестат. ИИ сверит их с требованиями твоего вуза, DSU и визы на твой учебный год и скажет, что исправить, — пока агентство ещё не открылось.',
    'Загрузи справку, перевод, выписку или аттестат. ИИ сверит их с требованиями твоего вуза, DSU и визы на твой учебный год и скажет, что исправить.'],
  // 2026-10-26: make purchasing explicit at both pricing entry points.
  ['Оформить и оплатить', 'Купить за'],
  ['AI-сверка без лимита помогает найти замечания до подачи. Загрузи исправленную версию — повторная проверка входит в цену. Решение о приёме документа остаётся за вузом или консульством.',
    'Проверяй документы и исправленные версии без доплаты. Решение о приёме принимает вуз или консульство.'],
  // 2026-11-15, owner: «сделай новый диапазон 500 000 — миллион».
  ['Сопровождение — обычно 650 000–\u20601 000 000 ₸', 'Сопровождение — обычно 500 000–\u20601 000 000 ₸'],
  // 2026-11-16, owner on /prices: «нужен ли здесь дубляж». «Живой человек»
  // stood three times in a row; the pointer sentence goes, and the line under
  // the heading says it is optional and on top of the main price.
  ['Подбор программ, сроки, чек-листы, черновики и проверку документов система делает целиком. Но есть места, где случай бывает нестандартным: спорная ситуация с двенадцатью годами образования, необычный состав семьи при расчёте ISEEU, отказ CIMEA, сложный визовый случай. Там ИИ подскажет, что делать, но подаёшь и решаешь ты. Если хочешь, чтобы на такой момент посмотрел живой человек — это отдельная услуга ниже.',
    'Подбор программ, сроки, чек-листы, черновики и проверку документов система делает целиком. Но есть места, где случай бывает нестандартным: спорная ситуация с двенадцатью годами образования, необычный состав семьи при расчёте ISEEU, отказ CIMEA, сложный визовый случай. Там ИИ подскажет, что делать, но подаёшь и решаешь ты.'],
  ['Не входит в цену и не обязательно. Оплачивается через тот же защищённый Stripe Checkout; после оплаты мы связываемся по оставленному номеру.',
    'По желанию, в 10 990 ₸ не входит. Оплачивается через тот же защищённый Stripe Checkout; после оплаты мы связываемся по оставленному номеру.'],
  ['Не входит в цену и не обязательно. Берут те, у кого нестандартный случай или просто хочется, чтобы проверил человек.',
    'По желанию, в 10 990 ₸ не входит. Берут те, у кого нестандартный случай или просто хочется, чтобы проверил человек.'],
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
