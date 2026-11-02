import { GUIDES, type GuideCard } from "@/data/guides";
import type { GuideId } from "./guideJourney";

/** Reading categories only; these never represent a visitor's saved progress. */
export const GUIDE_STAGES = [
  { id: "choose", title: "Выбрать маршрут", description: "Образование и вступительные тесты", ids: ["education", "tests"] },
  { id: "prepare", title: "Подготовиться к отъезду", description: "Документы, стипендия и виза", ids: ["apostille", "translation", "cimea", "con", "iseeu", "visa", "minors", "military"] },
  { id: "arrival", title: "После приезда", description: "Permesso, налоговый код и страховка", ids: ["permesso", "codice", "health-travel"] },
] satisfies { id: string; title: string; description: string; ids: GuideId[] }[];

export const VISA_GUIDE: GuideCard = {
  id: "visa", title: "Виза D", teaser: "Подача через VFS: средства, документы и сроки.", rows: [],
  warn: "Университет, консульство и стипендиальный орган проверяют разные условия. Начни с своего учебного года и официального чек-листа.",
  sources: ["visa", "procedure", "visaWhere", "visaFees", "visaTiming"],
};
export const GUIDE_TOPICS = GUIDE_STAGES.flatMap(stage => stage.ids.map(id => id === "visa" ? VISA_GUIDE : GUIDES.find(guide => guide.id === id)!));
export const guideHref = (id: string) => `/guides/${id}`;
export const guideStageHref = (id: string) => `/guides/stages/${id}`;
export const stageForGuide = (id: string) => GUIDE_STAGES.find(stage => (stage.ids as string[]).includes(id));

export const VISA_PARTS = [
  { id: "timeline", title: "Когда подавать", description: "Порядок подготовки и сроки подачи." },
  { id: "funds", title: "Средства на учёбу", description: "Годовой минимум и пересчёт в тенге." },
  { id: "documents", title: "Документы для визы", description: "Чек-лист для самостоятельной подготовки." },
  { id: "before-application", title: "Перед подачей", description: "Что проверить в подготовленном пакете." },
] as const;
export type VisaPart = typeof VISA_PARTS[number]["id"];
