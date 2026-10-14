import type { PortalData, PortalTask } from "./portalApi";
import { DOC_TASKS, fmtDate, TASK_META } from "./portalMeta";

// Display the existing roadmap in its own order; do not add dependencies or dates.
export function portalPosition(data: PortalData) {
  let stageIndex = data.roadmap.findIndex(stage => stage.tasks.some(task => !data.done[task.id] && task.available !== false));
  if (stageIndex < 0) stageIndex = data.roadmap.findIndex(stage => stage.tasks.some(task => !data.done[task.id]));
  const stage = data.roadmap[stageIndex] || null;
  const task = stage?.tasks.find(task => !data.done[task.id] && task.available !== false) || null;
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  const taskIndex = task ? tasks.findIndex(row => row.id === task.id) : -1;
  const next = taskIndex >= 0 ? tasks.slice(taskIndex + 1).find(row => !data.done[row.id]) || null : null;
  return { stage, stageIndex, task, next, done: stage?.tasks.filter(row => data.done[row.id]).length || 0, total: stage?.tasks.length || 0 };
}

export function taskTitle(task: PortalTask): string {
  const parentTitles: Record<string, string> = {
    chances: "Попросить родителей оценить шансы на стипендию",
    familyDocs: "Попросить родителей собрать семейные справки",
    money: "Попросить родителей подготовить финансовую гарантию",
    statements: "Попросить родителей подготовить банковские выписки",
    housing: "Попросить родителей помочь с жильём",
  };
  if (/родител/i.test(task.owner || "")) {
    if (/^Попросить родителей/i.test(task.t)) return task.t;
    return parentTitles[task.id] || `Попросить родителей ${task.t.charAt(0).toLowerCase()}${task.t.slice(1)}`;
  }
  const titles: Record<string, string> = {
    universitaly: "Подать предзапись на гос. портале (Universitaly)",
    cimea: "Уточнить подтверждение квалификации (DoV / CIMEA)",
    iseeu: "Подготовить справку о доходах (ISEEU)",
  };
  return titles[task.id] || task.t;
}

export function taskAction(task: PortalTask): string {
  const actions: Record<string, string> = {
    shortlist: "Выбрать программы", profile: "Заполнить профиль", path12: "Выбрать путь",
    chances: "Оценить шансы", checkDocs: "Проверить документы",
    apostille: "Подготовить апостиль", translate: "Подготовить перевод", notary: "Заверить перевод",
    cimea: "Уточнить подтверждение квалификации", universitaly: "Подготовить предзапись",
    familyDocs: "Собрать семейные справки", iseeu: "Подготовить справку о доходах",
    statements: "Подготовить выписки", insurance: "Подготовить страховку", housing: "Подтвердить жильё",
  };
  if (actions[task.id]) return actions[task.id];
  if (DOC_TASKS[task.id]) return "Подготовить документ";
  return TASK_META[task.id]?.act !== "Открыть шаг" && TASK_META[task.id]?.act || taskTitle(task);
}

export function taskDate(task: PortalTask): string {
  return task.deadline && /^\d{4}-\d{2}-\d{2}$/.test(task.deadline)
    ? `Ориентир: ${fmtDate(task.deadline)}` : "";
}

export function isManualTask(task: PortalTask): boolean {
  // AI is help for a step, not a completion event. The existing task endpoint
  // accepts a self-report for all non-file steps except the profile choices.
  return task.id !== "profile" && task.id !== "path12" && !DOC_TASKS[task.id];
}

export function taskBlockedReason(task: PortalTask): string {
  return task.timingLabel || "Этот шаг будет доступен позже.";
}

export function taskExplanation(task: PortalTask): string {
  const explanations: Record<string, string> = {
    profile: "Укажи образование и цель, чтобы настроить маршрут.",
    shortlist: "Сравни программы и выбери подходящие.",
    chances: "Обсуди с родителями, подходит ли вашей семье региональная стипендия.",
    path12: "Выбери, как дополнить школьное образование для поступления.",
    enroll12: "Подготовь подтверждение дополнительного года обучения.",
    foundation12: "Подготовь подтверждение подготовительной программы.",
    apostille: "Уточни, какой документ об образовании нужно апостилировать.",
    translate: "Подготовь перевод нужного комплекта документов на итальянский.",
    notary: "Сверь способ заверения перевода с требованиями получателя.",
    cimea: "Уточни у вуза, какое подтверждение квалификации он запрашивает.",
    checkDocs: "Проверь комплект перед подачей.",
    test: "Проверь, какой экзамен нужен выбранной программе.",
    uniApply: "Подай заявку по правилам выбранной программы.",
    universitaly: "Подготовь предзапись по инструкции выбранного вуза.",
    familyDocs: "Собери семейные справки по требованиям выбранной стипендии.",
    iseeu: "Уточни, какие сведения о доходах нужны для стипендии.",
    dsuApply: "Подай заявку по правилам выбранной региональной стипендии.",
    money: "Обсуди с родителями подтверждение средств для визы.",
    statements: "Подготовь банковские выписки по требованиям к твоей заявке.",
    insurance: "Сверь страховку с требованиями для визы.",
    housing: "Подготовь подтверждение проживания для визовой заявки.",
    blsSlot: "Проверь порядок записи на подачу визовой заявки.",
    visaSubmit: "Сверь комплект перед подачей визовой заявки.",
    kit: "Подготовь заявление на вид на жительство (permesso).",
    codice: "Уточни, как получить итальянский налоговый код (codice fiscale).",
    questura: "Подготовься к визиту в миграционную службу (Questura).",
  };
  const source = task.explain || TASK_META[task.id]?.why || "Открой шаг, чтобы узнать, что подготовить.";
  return explanations[task.id] || source.split(/(?<=[.!?])\s+(?=[А-ЯЁA-Z])/)[0];
}

// Read-only detail is a presentation rule; the roadmap's availability is unchanged.
export function taskReadOnlyReason(data: PortalData, task: PortalTask): string {
  const position = portalPosition(data);
  if (data.done[task.id]) return "Этот шаг уже сделан.";
  const future = !data.done[task.id] && position.task?.id !== task.id;
  if (future && position.task) return `Сначала: ${taskTitle(position.task)}.${task.available === false ? ` ${taskBlockedReason(task)}` : ""}`;
  if (task.available === false) return taskBlockedReason(task);
  return "";
}

export function portalTaskHref(_data: PortalData, task: PortalTask): string {
  return DOC_TASKS[task.id]
    ? `/portal?view=docs&doc=${encodeURIComponent(task.id)}`
    : `/portal?view=plan&task=${encodeURIComponent(task.id)}`;
}
