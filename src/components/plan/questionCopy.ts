/* Подписи анкеты для плиток вопроса: на /plan (Wizard) и в кабинете
   (PortalAssessment) — один и тот же текст. */

/** UI explanations only: the questions, answer values and plan builder stay
 * unchanged. Grades describe the profile; they are not an admissions score. */
export const QUESTION_CONTEXT: Record<string, string> = {
  intake: "Так я не смешаю правила разных наборов.",
  education: "Допуск всё равно подтвердит выбранный вуз.",
  grades: "Это ориентир для твоего профиля, не прогноз поступления.",
  // The first question since 23 Nov: the level decides every later one.
  goal: "От уровня зависят все следующие вопросы: у бакалавриата они про школу, у магистратуры про диплом.",
  // The master's track (data/wizardTracks.ts, 23 Nov).
  major: "У итальянской магистратуры есть свои требования к предметам первого диплома. Если профиль другой, их может не хватить.",
  budget: "Стипендию и средства на визу нужно проверять отдельно.",
  field: "От направления зависят тесты и условия конкурса. Точные требования проверим у программы.",
  lang: "От ответа зависит, что делать дальше: подтвердить язык или подготовиться к тесту.",
  age: "Если тебе ещё нет 18, в маршрут нужны отдельные требования к жилью и документам.",
  residence: "Используем процедуру для твоего места проживания.",
  dsuRegion: "Требования к справкам проверяем по конкретному конкурсу.",
};


/** Ярлык плитки вопроса: «Вопрос 2 из 10 · Образование». У вопроса трека
 *  может быть свой (WizQuestion.label): «Диплом», «Средний балл». */
export const STEP_TITLES: Record<string, string> = { intake: "Набор", education: "Образование", grades: "Оценки", goal: "Уровень", major: "Профиль", budget: "Бюджет", field: "Направление", lang: "Язык", age: "Возраст", residence: "Проживание", dsuRegion: "Стипендия" };
