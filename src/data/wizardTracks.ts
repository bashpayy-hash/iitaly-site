import { WIZ, type WizAnswers, type WizQuestion } from "./wizard";

/* The questionnaire has two tracks since 23 Nov 2026. Owner: «подруга сказала,
   что типа, когда она нажала на магистратуру, дальше идут все равно вопросы,
   будто она школьница… нужно сделать и для магистратуры, кларифайнуть, и
   сделать отдельный трек со всеми особенностями».
   The level is the second question (wizard.ts). After «Магистратура» the
   applicant is asked about her diploma, not her school: whether she has it,
   whether the master's is in the diploma's field (an Italian programme checks
   the subjects of the first degree), her GPA on the 4.0 scale. The question
   about being 18 is not asked: a graduate is an adult.
   Values the cabinet's server keeps (education, goal, budget) stay within its
   own lists, so a saved profile reads in either track; «major» lives only in
   the draft on the device. Both tracks have ten questions. */

export const MASTER_GOAL = "Магистратура";

const MASTER_QUESTIONS: Record<string, WizQuestion> = {
  education: {
    id: "education",
    q: "Диплом бакалавра уже есть?",
    hint: "От этого зависит, когда и с какими документами подавать",
    opts: [
      { v: "Бакалавр", t: "Да, диплом на руках", s: "бакалавр или специалист" },
      { v: "Студент вуза КЗ", t: "Ещё учусь", s: "получу диплом до начала магистратуры" },
    ],
  },
  major: {
    id: "major",
    q: "Магистратура по профилю твоего диплома?",
    hint: "Вуз сверяет предметы бакалавриата с требованиями программы",
    opts: [
      { v: "same", t: "Да, то же или близкое направление", s: "" },
      { v: "change", t: "Хочу сменить направление", s: "проверим, каких предметов может не хватить" },
      { v: "unsure", t: "Пока не знаю", s: "" },
    ],
  },
  grades: {
    id: "grades",
    q: "Какой у тебя средний балл (GPA)?",
    hint: "Примерно, по шкале 4,0",
    opts: [
      { v: "отличник", t: "3,5 и выше", s: "почти отличник" },
      { v: "хорошист", t: "3,0 – 3,4", s: "хорошист" },
      { v: "средний", t: "2,5 – 2,9", s: "средний" },
      { v: "ниже среднего", t: "ниже 2,5", s: "бывает по-разному" },
    ],
  },
  budget: {
    id: "budget",
    q: "Какой бюджет на год учёбы?",
    hint: "Считая жильё и еду, свои деньги и помощь семьи. Это влияет на выбор города и на стратегию со стипендией",
    opts: WIZ.find(item => item.id === "budget")!.opts,
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
      { v: "Ещё не решил", t: "Пока не решил", s: "поможем выбрать" },
    ],
  },
};

const MASTER_ORDER = ["intake", "goal", "education", "major", "grades", "budget", "field", "lang", "residence", "dsuRegion"];
const MASTER_WIZ: WizQuestion[] = MASTER_ORDER.map(id => MASTER_QUESTIONS[id] ?? WIZ.find(item => item.id === id)!);

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
