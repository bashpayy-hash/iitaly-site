import { PERMESSO_COST_LABEL } from "@/data/admissions";
import { VISA_KEY_FACTS, type GuideCard } from "@/data/guides";
import { VISA_PARTS } from "./guideCatalogue";

const plural = (n: number, one: string, few: string, many: string) => n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;

/* Бейджи инспектора — короткие цитаты из самих гайдов (src/data/guides.ts),
   сверенные вручную: меняй вместе с текстом гайда. Где в гайде нет срока,
   цены или дедлайна, бейдж честно говорит «по ситуации», а не придумывает.
   «Сложность» — сколько пунктов в подробном разборе. */
export const GUIDE_FACTS: Record<string, { duration?: string; cost?: string; deadline?: string }> = {
  tests: { cost: "€55 за попытку CEnT-S" },
  apostille: { duration: "до 15 рабочих дней", cost: "0,5 МРП за документ" },
  cimea: { duration: "Verification: 60 рабочих дней после оплаты", cost: "Verification: €150 за квалификацию" },
  visa: { duration: `${VISA_KEY_FACTS[2].value} · обычный общий срок`, cost: `${VISA_KEY_FACTS[1].value} · сервисный сбор отдельно`, deadline: "Национальный предел: 30 ноября 2026 для 2026/27" },
  permesso: { cost: `${PERMESSO_COST_LABEL} для взрослого при сроке свыше 3 месяцев до года`, deadline: "первые восемь рабочих дней после въезда" },
  codice: { cost: "выдача бесплатна" },
  "health-travel": { cost: "SSN: от €700 за календарный год" },
};

export function guideFacts(guide: GuideCard) {
  const known = GUIDE_FACTS[guide.id] || {};
  const points = guide.id === "visa" ? VISA_PARTS.length : guide.rows.length;
  return [
    { label: "Срок оформления", value: known.duration || "по ситуации", known: Boolean(known.duration) },
    { label: "Стоимость", value: known.cost || "по ситуации", known: Boolean(known.cost) },
    { label: "Дедлайн", value: known.deadline || "по условиям заявки", known: Boolean(known.deadline) },
    { label: "Сложность", value: `${points} ${plural(points, "пункт", "пункта", "пунктов")} в разборе`, known: true },
  ];
}

