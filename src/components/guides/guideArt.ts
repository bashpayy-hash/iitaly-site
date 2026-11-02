/* Своя риzo-иллюстрация у каждой темы справочника: одна вещь на прозрачном
   фоне, как товар на плитке. Картинки декоративные (alt=""): смысл несут
   заголовок и тизер темы. Источники и промпты — design/mascot/vespi/handmade-v2.json
   и design/illustrations/riso-guides-2026-11-02.json. */
const ART: Record<string, { name: string; height: number }> = {
  education: { name: "diploma", height: 357 },
  tests: { name: "tests", height: 362 },
  apostille: { name: "stamp-pad", height: 357 },
  translation: { name: "translation", height: 348 },
  cimea: { name: "folder", height: 340 },
  con: { name: "envelope", height: 367 },
  iseeu: { name: "coins", height: 467 },
  visa: { name: "passport", height: 349 },
  minors: { name: "minors", height: 353 },
  military: { name: "military", height: 357 },
  permesso: { name: "keys", height: 362 },
  codice: { name: "codice", height: 362 },
  "health-travel": { name: "map", height: 350 },
};

/** 480px-кадр темы и его уменьшенная копия для srcSet. */
export function guideArt(id: string) {
  const art = ART[id] || ART.cimea;
  return {
    src: `/illustrations/riso/${art.name}-480.webp`,
    srcSet: `/illustrations/riso/${art.name}-240.webp 240w, /illustrations/riso/${art.name}-480.webp 480w`,
    width: 480,
    height: art.height,
  };
}
