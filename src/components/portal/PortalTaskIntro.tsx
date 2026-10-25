import type { PortalStage, PortalTask } from "@/lib/portalApi";
import { taskDate, taskExplanation, taskTitle } from "@/lib/portalNavigation";
import { TASK_META } from "@/lib/portalMeta";
import { HiggsfieldVisual } from "./HiggsfieldVisual";
import { PortalMicroSteps } from "./PortalMicroSteps";
import styles from "./portal-step.module.css";

export function PortalTaskIntro({ task, stage, done, pageHeading = false }: { task: PortalTask; stage?: PortalStage; done: boolean; pageHeading?: boolean }) {
  const Heading = pageHeading ? "h1" : "h2";
  const date = taskDate(task);
  const time = task.time || TASK_META[task.id]?.min;
  return <div className={styles.editorialHero} data-task-editorial-hero>
    <div>
      {stage && <p className={styles.rubric}>{stage.title} · Шаг {String(stage.tasks.findIndex(item => item.id === task.id) + 1).padStart(2, "0")} из {String(stage.tasks.length).padStart(2, "0")}</p>}
      <Heading id="portal-step-heading" className={styles.detailTitle} tabIndex={-1}>{taskTitle(task)}</Heading>
      <p className={styles.detailExplainer}>{taskExplanation(task)}</p>
      <PortalMicroSteps task={task} />
      <div className={styles.detailMeta}>{done ? <span>Выполнено</span> : <>{date && <span>{date}</span>}{time && <span>Срок: {time}</span>}</>}</div>
      {!done && date && <p className={styles.meta}>Ориентир подготовки, не срок конкретного вуза.</p>}
    </div>
    <HiggsfieldVisual stage={stage?.id} task={task} />
  </div>;
}
