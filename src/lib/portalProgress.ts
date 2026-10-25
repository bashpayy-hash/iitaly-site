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
