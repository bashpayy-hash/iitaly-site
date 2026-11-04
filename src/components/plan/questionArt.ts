import { objectFrame } from "@/components/guides/guideArt";

/* Своя вещь у каждого вопроса анкеты, как картинка на плитке темы в
   справочнике — из общего набора сайта (owner, 4 Nov: «общий стиль везде»;
   design/illustrations/objects-2026-11-04.json). Декоративные (alt=""):
   смысл несут вопрос и ответы. */
const ART: Record<string, { name: string; height: number }> = {
  intake: { name: "alarm", height: 357 },
  education: { name: "diploma", height: 357 },
  grades: { name: "tests", height: 352 },
  goal: { name: "cap", height: 348 },
  budget: { name: "coins", height: 367 },
  field: { name: "books", height: 369 },
  lang: { name: "translation", height: 351 },
  age: { name: "minors", height: 371 },
  residence: { name: "keys", height: 365 },
  dsuRegion: { name: "envelope", height: 362 },
};

export function questionArt(id: string) {
  const art = ART[id];
  return art ? objectFrame(art.name, art.height) : undefined;
}
