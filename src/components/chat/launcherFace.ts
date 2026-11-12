/* Внешний вид плавающей кнопки чата — в одном месте для двух компонентов:
   ChatLauncher (настоящая кнопка с пружинами) и ChatMount (та же кнопка в
   HTML страницы, пока код чата ещё не загружен). Строки общие, чтобы при
   подмене одной на другую не сдвинулся ни один пиксель. Здесь нет ни одного
   импорта: файл не должен тянуть за собой motion. */

/** Общие для якоря и кнопки классы позиции: bottom учитывает вырез iOS. */
export const LAUNCHER_ANCHOR =
  "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] size-12";

export const LAUNCHER_FACE =
  "z-[90] flex items-center justify-center rounded-full border border-[#e7e4df] bg-white text-[#141413] shadow-[0_4px_16px_rgba(33, 29, 23,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export const LAUNCHER_TITLE = "Веспи Баурысаков · Задать вопрос";
export const launcherLabel = (labelled: boolean) =>
  labelled ? "Спросить Веспи — задать вопрос ИИ-консультанту" : "Задать вопрос ИИ-консультанту";
/** На /prices кнопка шире и с подписью. */
export const isLabelledLauncher = (pathname: string) => pathname === "/prices";
