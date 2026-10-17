/** Presentation context only. Reading a guide never selects an education path,
 * scholarship profile, document verdict or a university deadline for the user. */
type GuideHelp = {
  title: string;
  next: string;
  action: "plan" | "document" | "trainer";
  question: string;
};

export const GUIDE_HELP = {
  education: { title: "Аттестат и 12 лет", action: "plan", next: "Расскажи об образовании. Покажу, с чего начать и что уточнить у выбранного вуза.", question: "Как разобраться, подходит ли моё образование для поступления?" },
  tests: { title: "Тесты и сроки", action: "plan", next: "Укажи свой набор и образование, чтобы расставить шаги по порядку. Даты конкретной программы сверяй с её правилами.", question: "Как проверить, какой тест и какие сроки нужны моей программе?" },
  apostille: { title: "Апостиль", action: "document", next: "Приложи документ с апостилем. В разборе будут итог, причина и следующий шаг.", question: "Что проверить перед апостилем и переводом документа?" },
  translation: { title: "Перевод документов", action: "document", next: "Проверь свой файл перед подачей. Укажи контекст проверки, чтобы не смешать требования разных процедур.", question: "Что проверить в переводе для вуза и для визы?" },
  cimea: { title: "DoV, CIMEA и ARDI", action: "plan", next: "Начни со своей ситуации. Маршрут поможет понять порядок действий; нужный вид подтверждения уточни у вуза.", question: "Как понять, какое подтверждение образования нужно выбранному вузу?" },
  con: { title: "Справки семьи", action: "document", next: "Приложи справку и выбери контекст проверки. Требования одного конкурса не подходят автоматически для другого.", question: "Что нужно уточнить, прежде чем просить родителей собрать справки?" },
  iseeu: { title: "DSU и ISEEU", action: "document", next: "Выбери регион и учебный год перед проверкой файла. Если правил для твоего случая нет, это не ошибка документа.", question: "Как найти требования DSU именно для моего региона и учебного года?" },
  visa: { title: "Виза D", action: "plan", next: "Разложи подготовку по шагам для своей ситуации. Визовый чек-лист проверяй отдельно от требований вуза и стипендии.", question: "С чего начать подготовку к визе D и что сверять отдельно?" },
  minors: { title: "Если ещё нет 18", action: "plan", next: "Укажи возраст к моменту поездки. Так в маршруте появятся шаги, которые стоит обсудить с родителями.", question: "Что обсудить с родителями, если к моменту поездки мне ещё не будет 18?" },
  military: { title: "Воинский учёт в Казахстане", action: "plan", next: "Собери последовательность шагов по своей ситуации. Вопросы отсрочки уточняй у уполномоченного органа.", question: "Что уточнить по воинскому учёту перед учёбой за границей?" },
  permesso: { title: "Permesso di soggiorno", action: "trainer", next: "Попробуй заполнить Modulo 1 в тренажёре. Он подскажет, что писать в каждой строке.", question: "С чего начать заполнение Modulo 1 после приезда?" },
  codice: { title: "Codice fiscale", action: "plan", next: "Посмотри, где этот шаг находится в твоём маршруте, и что подготовить к приезду.", question: "Как получить официальный codice fiscale и для чего он понадобится?" },
  "health-travel": { title: "Страховка и поездки", action: "plan", next: "Собери маршрут подготовки к поездке. Условия страховки и поездок сверяй для своего документа и этапа.", question: "Что проверить в страховке и перед поездкой с ricevuta?" },
} satisfies Record<string, GuideHelp>;

export type GuideId = keyof typeof GUIDE_HELP;

export function isGuideId(value: string | null | undefined): value is GuideId {
  return Boolean(value && Object.hasOwn(GUIDE_HELP, value));
}

export function guideAction(id: GuideId) {
  const help = GUIDE_HELP[id];
  if (help.action === "trainer") return { href: "/guides/permesso-modulo-1", label: "Открыть тренажёр Modulo 1", note: "Учебное заполнение, не подача заявления." };
  const target = help.action === "document" ? "document-check" : "questionnaire";
  return {
    href: `/plan?fromGuide=${id}#${target}`,
    label: help.action === "document" ? "Проверить документ" : "Составить план",
    note: help.action === "document" ? "Проверка одного документа бесплатна. Решение о приёме принимает получатель." : "Бесплатно, без регистрации. Допуск подтверждает выбранный вуз.",
  };
}

export function openGuideHelper(id?: GuideId, question?: string) {
  window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: {
    source: "guides", guideId: id, prefill: question || (id ? GUIDE_HELP[id].question : undefined),
  } }));
}
