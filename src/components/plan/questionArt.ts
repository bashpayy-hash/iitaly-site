import { cartoucheFrame } from "@/components/guides/guideArt";

/* Своя картинка у каждого вопроса анкеты, как у темы в справочнике. С 19
   ноября это картуши с пола Галереи, общий набор справочника, визы и главной
   (owner, на скриншоте плана: «вот они сильно выбиваются из общей картины,
   нужны изменения»; design/illustrations/cartouche-2026-11-19.json).
   Декоративные (alt=""): смысл несут вопрос и ответы. */
const ART: Record<string, string> = {
  intake: "alarm",
  education: "diploma",
  grades: "tests",
  goal: "cap",
  budget: "coins",
  field: "route-map",
  lang: "translation",
  age: "minors",
  residence: "passport",
  dsuRegion: "family-docs",
};

export function questionArt(id: string) {
  const art = ART[id];
  return art ? cartoucheFrame(art) : undefined;
}
