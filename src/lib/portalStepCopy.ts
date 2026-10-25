import copy from "../data/portal-step-copy.json";
import type { PortalTask } from "./portalApi";
import { DOC_TASKS } from "./portalMeta";
const entries: Record<string, { short_explainer: string; instruction_title?: string; question?: string }> = copy;
export function taskShortExplainer(task: PortalTask) {
  return task.short_explainer ?? entries[task.id]?.short_explainer ?? "";
}
export function taskInstructionTitle(task: PortalTask) {
  return task.instruction_title || entries[task.id]?.instruction_title || (DOC_TASKS[task.id] && task.explain ? "Как подготовить документ" : "");
}
export function taskQuestions(task: PortalTask, done: boolean) {
  return done ? ["Что дальше?", "Нужно ли обновить сведения по этому шагу?"]
    : [task.assistant_question || entries[task.id]?.question || `Как выполнить шаг «${task.t}»?`, "Что нужно подготовить?"];
}
