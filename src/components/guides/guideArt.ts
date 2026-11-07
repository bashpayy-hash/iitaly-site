/* Своя вещь у каждой темы справочника: один предмет на прозрачном фоне, как
   товар на плитке. С 4 ноября это тот же набор, что в кабинете и на главной
   (owner: «добавь элементы иллюстрированности, но всё ещё с упором на
   реализм, чтобы сочеталось с остальным сайтом») — студийный реализм с
   иллюстративными акцентами, design/illustrations/objects-2026-11-04.json.
   С 7 ноября (owner: «чуть более концептуальными, чем сейчас… сохраняй
   нотки реализма») — полуконцептуальный набор: настоящие материалы,
   упрощённые формы и смысл в композиции (весы для ISEE, реплики над книгой
   для перевода), design/illustrations/objects-2026-11-07.json.
   Картинки декоративные (alt=""): смысл несут заголовок и тизер темы. */
const ART: Record<string, { name: string; height: number }> = {
  education: { name: "diploma", height: 357 },
  tests: { name: "tests", height: 352 },
  apostille: { name: "stamp-pad", height: 371 },
  translation: { name: "translation", height: 351 },
  cimea: { name: "folder", height: 338 },
  con: { name: "envelope", height: 362 },
  iseeu: { name: "coins", height: 367 },
  visa: { name: "passport", height: 359 },
  minors: { name: "minors", height: 371 },
  military: { name: "military", height: 358 },
  permesso: { name: "keys", height: 365 },
  codice: { name: "tax-card", height: 361 },
  "health-travel": { name: "insurance", height: 362 },
};

/** 480px-кадр предмета из общего набора и его уменьшенная копия для srcSet. */
export function objectFrame(name: string, height: number) {
  return {
    src: `/illustrations/objects/${name}-480.webp`,
    srcSet: `/illustrations/objects/${name}-240.webp 240w, /illustrations/objects/${name}-480.webp 480w`,
    width: 480,
    height,
  };
}

export function guideArt(id: string) {
  const art = ART[id] || ART.cimea;
  return objectFrame(art.name, art.height);
}
