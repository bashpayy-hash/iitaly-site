import { risoFrame } from "@/components/guides/guideArt";

/* Своя риzo-вещь у каждого вопроса анкеты, как картинка на плитке темы в
   справочнике. Декоративные (alt=""): смысл несут вопрос и ответы.
   Новые вещи — design/illustrations/riso-plan-2026-11-02.json. */
const ART: Record<string, { name: string; height: number }> = {
  intake: { name: "alarm", height: 355 },
  education: { name: "diploma", height: 357 },
  grades: { name: "tests", height: 362 },
  goal: { name: "cap", height: 344 },
  budget: { name: "coins", height: 467 },
  field: { name: "books", height: 365 },
  lang: { name: "translation", height: 348 },
  age: { name: "minors", height: 353 },
  residence: { name: "keys", height: 362 },
  dsuRegion: { name: "envelope", height: 367 },
};

export function questionArt(id: string) {
  const art = ART[id];
  return art ? risoFrame(art.name, art.height) : undefined;
}
