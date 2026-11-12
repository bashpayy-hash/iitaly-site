import { guideSentences, guideTeaser } from "./guideText";
/* Что из гайдов и визы открыто до оплаты.

   Owner, 12 Nov 2026: «мы даём слишком много информации бесплатно… надо
   продумать, где именно сколько дать, чтобы уже брали и покупали». До этого
   (9 Nov, «дай где-то 40%») целиком были открыты 17 шагов из 41 и 6 пунктов
   визы из 18 — то самое «как сделать», за которое мы берём деньги.

   Правило теперь одно: бесплатно — понять, что это и зачем; платно — как
   именно, в твоём случае, к какому сроку. Поэтому:
   - у каждого шага и пункта видны название и первая фраза (leadOf), разбор
     целиком — с маршрутом. Если в пункте одна фраза, она и есть разбор:
     такой пункт показывает только название;
   - одна тема открыта целиком как образец того, что за стеной:
     «Codice fiscale» — нужна всем, конкретная, но не ядро поступления;
   - в визе открыты ключевые факты и калькулятор средств, пункты сроков,
     документов и проверки перед подачей — названия и первая фраза;
   - тренажёр Modulo 1 без изменений.
   Закрытый текст по-прежнему не попадает ни в HTML, ни в описание страницы:
   первая фраза — часть страницы, остальное подгружается только на
   устройстве с оплаченным кабинетом (usePaidDevice). Номера пунктов
   считаются с единицы, как в адресах /guides/<тема>/<шаг>. */
export const SAMPLE_GUIDE = "codice";

/** A step of a guide topic is open before payment. Visa parts are open pages
 *  with their own points (FREE_VISA_POINTS). */
export function guideStepOpen(id: string, step: number): boolean {
  if (id === "visa") return true;
  return id === SAMPLE_GUIDE && step >= 1;
}

/** The public lead of a closed step or point: its first sentence, but only
 *  when there is more after it — a one-sentence point is the whole answer. */
export function leadOf(text: string): string | null {
  const sentences = guideSentences(text);
  return sentences.length > 1 ? guideTeaser(text, 180) : null;
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
