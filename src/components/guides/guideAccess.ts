/* Что из гайдов и визы открыто до оплаты.

   Owner, 12 Nov 2026, вечер: «в гайдах и везде сделай бесплатными вот эти
   вот только первые 4, возможно, 5 гайдов и виз, и потом дальше типа скажи,
   а вот дальше плати». Открыты целиком первые пять тем справочника — те,
   что стоят первыми на полосе и на дороге: аттестат, тесты, апостиль,
   перевод, DoV/CIMEA. У остальных восьми тем и у пунктов визы видны только
   названия; разбор — с маршрутом. Ключевые факты визы и калькулятор средств
   открыты по-прежнему (owner, 9 Nov). Тренажёр Modulo 1 без изменений.

   До этого (12 Nov, днём) у каждого шага была открыта первая фраза и одна
   тема целиком как образец; ещё раньше (9 Nov) — около 40% шагов.
   Закрытый текст не попадает ни в HTML, ни в описание страницы: он
   подгружается только на устройстве с оплаченным кабинетом (usePaidDevice).
   Номера пунктов считаются с единицы, как в адресах /guides/<тема>/<шаг>. */
export const FREE_GUIDES: readonly string[] = ["education", "tests", "apostille", "translation", "cimea"];

/** The whole topic is open before payment (one of the first five). */
export function guideFree(id: string): boolean {
  return FREE_GUIDES.includes(id);
}

/** A step of a guide topic is open before payment. Visa parts are open pages
 *  with their own points (FREE_VISA_POINTS). */
export function guideStepOpen(id: string, step: number): boolean {
  if (id === "visa") return true;
  return guideFree(id) && step >= 1;
}

export const FREE_VISA_POINTS = {
  timeline: [],
  documents: [],
  "before-application": [],
} as const;
export type VisaPointsPart = keyof typeof FREE_VISA_POINTS;

export function visaPointOpen(part: VisaPointsPart, point: number): boolean {
  return (FREE_VISA_POINTS[part] as readonly number[]).includes(point);
}

/** Modulo 1: the application sheet and the sheets a student leaves empty. */
export const FREE_PERMESSO_PAGES: readonly number[] = [1, 4, 5, 6, 7, 8];
/** «Коды и расчёты»: the code for field 16 and the province sigla. */
export const FREE_PERMESSO_TOOLS: readonly string[] = ["16", "sigla"];

export const GUIDE_WALL_NOTE = "Разбор откроется после оплаты вместе с остальными шагами гайдов и визы, тренажёром Modulo 1, личным маршрутом, проверкой документов без лимита и напоминаниями. Один платёж, без подписки.";
