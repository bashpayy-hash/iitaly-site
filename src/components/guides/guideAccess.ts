/* Что из гайдов и визы открыто до оплаты (owner, 9 Nov 2026: «дай где-то
   40% того, что есть из гайдов и визы… что-то одно из такого ценного,
   что-то по фигне, мелочи… дальше открыть уже надо платить»).

   Правило раскроя. В каждой теме открыт один пункт с настоящей пользой
   (сумма, срок, с чего начать), а в больших темах ещё одна мелочь. Пункты,
   где решают под свой случай (какой комплект, какие годы справок, какую
   процедуру выбрать, как продлевать), открываются с маршрутом. Названия
   всех пунктов видны всем: по ним понятно, что ещё есть в разборе. Шапка
   темы, факты, оговорки и официальные источники открыты всегда.

   Итог: в темах открыто 17 пунктов из 41 (≈41%). В визе открыты 6 пунктов
   из 18, ключевые факты и калькулятор средств. В тренажёре Modulo 1 открыты
   первый лист бланка, листы-пропуски, два справочника из четырёх и два
   блока «Перед почтой» из трёх.

   Почему так (ресерч 9 Nov). Готовой «правильной доли» нет, её подбирают:
   слишком щедро — не платят, слишком скупо — уходят. A/B-тест Substack
   показал: стена там, где начинается решение, конвертирует лучше, когда
   первый шаг отдан целиком. Leap и Yocket бесплатно дают справку и берут
   деньги за личное сопровождение. Закрытый текст не попадает ни в HTML, ни
   в описание страницы: разметка платного контента для Google не нужна.
   Устройство с оплаченным кабинетом видит всё (usePaidDevice). Номера
   пунктов считаются с единицы, как в адресах /guides/<тема>/<шаг>. */

export const FREE_GUIDE_STEPS: Record<string, readonly number[]> = {
  education: [1, 5],      // 11 классов: что делать без 12 лет · магистратура
  tests: [1],             // CEnT-S: цена и попытки
  apostille: [1, 3],      // где и срок; комплект для подачи закрыт
  translation: [1],       // кто может переводить
  cimea: [1, 2],          // ARDI · Verification: цена и срок
  con: [1],               // что собрать
  iseeu: [3, 4],          // Padova: суммы и пороги · 2027/28
  minors: [2],            // университет: возрастное условие
  permesso: [1, 3],       // подача · подпись
  codice: [1],            // где получить
  "health-travel": [1],   // SSN
  military: [1],          // обучение за рубежом
};

/** A step of a guide topic is open before payment. Visa parts are open pages
 *  with their own points (FREE_VISA_POINTS); an unmapped topic opens its first step. */
export function guideStepOpen(id: string, step: number): boolean {
  if (id === "visa") return true;
  return (FREE_GUIDE_STEPS[id] ?? [1]).includes(step);
}

export const FREE_VISA_POINTS = {
  timeline: [1, 2],              // программа и документы · средства
  documents: [1, 2, 8],          // паспорт и анкета · Universitaly · сборы
  "before-application": [1],     // происхождение средств
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
