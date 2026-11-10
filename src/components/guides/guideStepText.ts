import { guidePoints } from "./guideCatalogue";
import { guideSentences } from "./guideText";

/* Текст закрытых шагов для устройства с оплаченным кабинетом. Модуль
   подгружается отдельно (import()), только когда usePaidDevice() = true:
   в HTML и в данных страницы закрытого текста нет. */
export function guideStepText(id: string, step: number) {
  const point = guidePoints(id)[step - 1];
  return point ? { sentences: guideSentences(point.text), text: point.text } : null;
}
