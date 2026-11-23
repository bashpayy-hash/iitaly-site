import { WIZ, type WizAnswers, type WizQuestion } from "./wizard";

/* The questionnaire has two tracks since 23 Nov 2026. Owner: «подруга сказала,
   что типа, когда она нажала на магистратуру, дальше идут все равно вопросы,
   будто она школьница… нужно сделать и для магистратуры, кларифайнуть, и
   сделать отдельный трек со всеми особенностями».
   The same evening, on the first version: «если когда человек в вопросе
   первоначально нажимает на магистратуру, ты должен понять, что это уже
   магистратура… не должны быть такие детского формата вопросы, это уже
   серьезный человек, который закончил или заканчивает бакалавр».
   So the level is the first question (wizard.ts), and after «Магистратура»
   every question is the master's own: the diploma, its profile, the field,
   the GPA on the 4.0 scale, the intake, the proof of the language, the year's
   budget, the country of residence. Nothing is asked the way a school leaver
   is asked: no «отличник» and «хорошист», no «сколько семья может платить»,
   no question about being 18. Only the scholarship question is shared: it
   reads the same for both.
   Values the cabinet's server keeps (education, goal, budget) stay within its
   own lists, so a saved profile reads in either track; «major» lives only in
   the draft on the device. Both tracks have ten questions. */

export const MASTER_GOAL = "Магистратура";

const shared = (id: string) => WIZ.find(item => item.id === id)!;

const MASTER_QUESTIONS: Record<string, WizQuestion> = {
  education: {
    id: "education",
    label: "Диплом",
    q: "Диплом бакалавра уже получен?",
    hint: "От этого зависит, когда подавать и какие документы прикладывать",
    opts: [
      { v: "Бакалавр", t: "Да, диплом на руках", s: "бакалавр или специалист" },
      { v: "Студент вуза КЗ", t: "Пока нет, заканчиваю учёбу", s: "диплом будет до начала магистратуры" },
    ],
  },
  major: {
    id: "major",
    q: "Магистратура по профилю диплома?",
    hint: "Вуз сверяет предметы бакалавриата с требованиями программы",
    opts: [
      { v: "same", t: "Да, то же или смежное направление", s: "" },
      { v: "change", t: "Нет, меняю направление", s: "проверим, каких предметов может не хватить" },
      { v: "unsure", t: "Пока не знаю", s: "" },
    ],
  },
  field: {
    id: "field",
    q: "Какое направление магистратуры?",
    why: "От направления зависят требования к диплому и условия отбора. Точные требования проверим у программы.",
    opts: [
      { v: "Экономика и бизнес", t: "Экономика, бизнес", s: "" },
      { v: "Инженерия и IT", t: "Инженерия, IT", s: "" },
      { v: "Медицина", t: "Медицина и здоровье", s: "на врача в Италии учатся шесть лет с первого курса" },
      { v: "Дизайн и гуманитарные", t: "Дизайн, гуманитарные", s: "" },
      { v: "Ещё не решил", t: "Ещё выбираю", s: "начнём с требований к диплому" },
    ],
  },
  grades: {
    id: "grades",
    label: "Средний балл",
    q: "Какой средний балл диплома (GPA)?",
    hint: "По шкале 4,0. Если диплома ещё нет, укажи текущий",
    why: "Это ориентир, а не прогноз: вуз пересчитает оценки по своей шкале и посмотрит на предметы.",
    opts: [
      { v: "отличник", t: "3,5 и выше", s: "" },
      { v: "хорошист", t: "3,0 – 3,4", s: "" },
      { v: "средний", t: "2,5 – 2,9", s: "" },
      { v: "ниже среднего", t: "ниже 2,5", s: "" },
    ],
  },
  intake: {
    id: "intake",
    q: "Когда планируешь начать магистратуру?",
    hint: "Сроки приёма, визы и стипендии привязаны к учебному году",
    opts: shared("intake").opts,
  },
  lang: {
    id: "lang",
    q: "Чем подтверждаешь язык обучения?",
    hint: "Большинство программ на английском требуют B2",
    opts: [
      { v: "есть сертификат", t: "Есть IELTS, TOEFL или другой сертификат", s: "сверим балл и срок действия с программой" },
      { v: "уровень есть, сертификата нет", t: "Уровень есть, сертификата нет", s: "выберем способ, который принимает программа" },
      { v: "нужно подтянуть", t: "Уровень пока ниже B2", s: "заложим время на подготовку и экзамен" },
      { v: "хочу на итальянском", t: "Программа на итальянском", s: "проверим требуемый уровень итальянского" },
    ],
  },
  budget: {
    id: "budget",
    q: "Какой бюджет на год учёбы и жизни?",
    hint: "Свои средства и поддержка семьи или спонсора, вместе с жильём и едой",
    opts: [
      { v: "Только со стипендией", t: "Рассчитываю на стипендию", s: "без неё бюджет не сходится" },
      { v: "До 1 млн ₸/год", t: "До 1 млн ₸ в год", s: "сверим разрыв с расходами и визовым минимумом" },
      { v: "До 3 млн ₸/год", t: "До 3 млн ₸ в год", s: "сверим с визовым минимумом и расходами" },
      { v: "Без ограничений", t: "Бюджет не ограничивает выбор", s: "включая частные вузы" },
    ],
  },
  residence: {
    id: "residence",
    q: "В какой стране живёшь постоянно?",
    hint: "По ней определяется консульство, куда подаётся виза",
    opts: shared("residence").opts,
  },
};

// The diploma comes straight after the level: the second screen already
// speaks to a graduate.
const MASTER_ORDER = ["goal", "education", "major", "field", "grades", "intake", "lang", "budget", "residence", "dsuRegion"];
const MASTER_WIZ: WizQuestion[] = MASTER_ORDER.map(id => MASTER_QUESTIONS[id] ?? shared(id));

export const isMasterTrack = (answers: WizAnswers) => answers.goal === MASTER_GOAL;

/** The questions of the track the answers are on. */
export function wizardFor(answers: WizAnswers): WizQuestion[] {
  return isMasterTrack(answers) ? MASTER_WIZ : WIZ;
}

/** Only enumerated answers of the track the saved level names. An answer of
 *  the other track (a school in a master's draft) is dropped, and its
 *  question is asked again. */
export function wizardAnswers(raw: unknown): WizAnswers {
  const saved = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const goal = typeof saved.goal === "string" ? saved.goal : "";
  return Object.fromEntries(wizardFor({ goal }).flatMap(question =>
    question.opts.some(option => option.v === saved[question.id]) ? [[question.id, saved[question.id] as string]] : []));
}
