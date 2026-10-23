import type { PortalData, PortalTask } from "./portalApi";
import { DOC_TASKS } from "./portalMeta";
import { documentOutcome, DocumentStatus } from "./portalDocument";

/** File completion comes from the same review outcome as the document list.
 * Old manual flags can neither approve an unreviewed file nor hide a passed one. */
export function portalTaskDone(data: PortalData, task: PortalTask): boolean {
  return DOC_TASKS[task.id]
    ? documentOutcome(data.docs?.[task.id]).status === DocumentStatus.Ready
    : Boolean(data.done[task.id]);
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
