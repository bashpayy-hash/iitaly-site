import type { PortalData, PortalTask } from "./portalApi";
import { DOC_TASKS } from "./portalMeta";
import { documentOutcome, DocumentStatus } from "./portalDocument";

/** A checklist mark records the user's completed task. It does not approve
 * a file: documentOutcome remains the sole source for review/readiness badges. */
export function portalTaskDone(data: PortalData, task: PortalTask): boolean {
  return Boolean(data.done[task.id]) || Boolean(DOC_TASKS[task.id] && documentOutcome(data.docs?.[task.id]).status === DocumentStatus.Ready);
}

export function portalProgress(data: PortalData) {
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  let currentIndex = data.roadmap.findIndex(stage => stage.tasks.some(task => !portalTaskDone(data, task) && task.available !== false));
  if (currentIndex < 0) currentIndex = data.roadmap.findIndex(stage => stage.tasks.some(task => !portalTaskDone(data, task)));
  const openThrough = currentIndex < 0 ? data.roadmap.length - 1 : currentIndex;
  const stages = data.roadmap.map((stage, index) => ({
    id: stage.id, open: index <= openThrough,
    done: stage.tasks.filter(task => portalTaskDone(data, task)).length,
    total: stage.tasks.length,
  }));
  const done = stages.filter(stage => stage.open).reduce((sum, stage) => sum + stage.done, 0);
  const ahead = stages.filter(stage => !stage.open).reduce((sum, stage) => sum + stage.done, 0);
  // The denominator remains the full route: opening a new stage cannot make a
  // previously displayed 100% turn back into 30%. Only eligible work counts.
  return { stages, currentIndex, done, ahead, total: tasks.length, pct: tasks.length ? done / tasks.length * 100 : 0 };
}

export function portalTaskStageOpen(data: PortalData, taskId: string): boolean {
  const stage = data.roadmap.find(row => row.tasks.some(task => task.id === taskId));
  return Boolean(stage && portalProgress(data).stages.find(row => row.id === stage.id)?.open);
}

/* What the route's count counts, by name. Owner, 22 Nov: the questionnaire
   page said «11 шагов» and the cabinet built from the same answers «19 шагов»
   («просто назови их… даже в личном кабинете»). The cabinet adds the
   questionnaire, the choice of universities and the documents to the plan's
   own steps, so each part is counted under its own name: the plan's steps are
   the same number as on /plan. A route from the server has no plan steps of
   its own; there the documents are named apart from the other steps. Done
   work counts as in portalProgress: only inside the stages that are open. */
export function portalProgressGroups(data: PortalData): { key: "plan" | "prep" | "step" | "doc"; label: string; done: number; total: number }[] {
  const open = new Set(portalProgress(data).stages.filter(stage => stage.open).map(stage => stage.id));
  const local = data.roadmap.some(stage => stage.tasks.some(task => task.id.startsWith("local-p")));
  const groups = local
    ? [{ key: "plan" as const, label: "Шаги плана" }, { key: "prep" as const, label: "Подготовка и документы" }]
    : [{ key: "step" as const, label: "Шаги" }, { key: "doc" as const, label: "Документы" }];
  const kind = (task: PortalTask) => local ? (task.id.startsWith("local-p") ? "plan" : "prep") : DOC_TASKS[task.id] ? "doc" : "step";
  return groups.map(group => {
    const rows = data.roadmap.flatMap(stage => stage.tasks.filter(task => kind(task) === group.key).map(task => ({ task, open: open.has(stage.id) })));
    return { ...group, total: rows.length, done: rows.filter(row => row.open && portalTaskDone(data, row.task)).length };
  }).filter(group => group.total > 0);
}
