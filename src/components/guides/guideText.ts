/** Текст пункта делится на предложения: каждое — отдельный шаг списка. */
export function guideSentences(text: string) {
  return text.split(/(?<=[.!?])\s+(?=[A-ZА-ЯЁ«"(])/u).map(part => part.trim()).filter(Boolean);
}

/** Тизер шага для карточки: первое предложение, при нужде обрезанное по слову. */
export function guideTeaser(text: string, limit = 150) {
  const first = guideSentences(text)[0] || text;
  if (first.length <= limit) return first;
  return first.slice(0, limit - 1).replace(/[\s,;:—–-]+\S*$/u, "") + "…";
}
