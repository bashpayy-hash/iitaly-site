import type { PortalData } from "@/lib/portalApi";
import { portalTaskDone } from "@/lib/portalProgress";
import { VespiPose } from "@/components/mascot/VespiPose";
import type { CompletionFeedback } from "./usePortalFeedback";
import styles from "./portal-focus.module.css";

/* Награда за один сохранённый шаг: штамп в этапе. Появляется только после
   подтверждённого сохранения (usePortalFeedback.confirm), никогда при входе,
   перезагрузке или навигации. Последний шаг этапа — «Этап пройден». */
export function PortalCompletion({ feedback, data }: { feedback: CompletionFeedback | null; data?: PortalData | null }) {
  const stage = feedback && data?.roadmap.find(row => row.tasks.some(task => task.id === feedback.taskId));
  const stamped = stage && data ? stage.tasks.filter(task => portalTaskDone(data, task)).length : 0;
  const total = stage ? stage.tasks.length : 0;
  const stageDone = total > 0 && stamped === total;
  return <div className={styles.confirmation} role="status" aria-live="polite" aria-atomic="true" data-portal-completion={feedback?.taskId || ""} data-visible={Boolean(feedback)} data-reward={feedback ? stageDone ? "stage" : "step" : undefined}>
    {feedback && <div key={feedback.id} className={styles.confirmationBody}>
      <span className={styles.rewardVespi}><VespiPose pose={stageDone ? "celebrate" : "stamp"} priority sizes="88px" /></span>
      <div className={styles.rewardCopy}>
        <p className={styles.rewardLabel}>{stageDone ? "Этап пройден" : "Штамп получен"}</p>
        <strong>{stageDone && stage ? stage.title : "Шаг сохранён"}</strong>
        <span>{feedback.title}</span>
        {stage && <span className={styles.rewardTally} data-reward-tally>{stageDone ? `Все штампы этапа: ${stamped} из ${total}` : `Этап «${stage.title}»: ${stamped} из ${total}`}</span>}
      </div>
    </div>}
  </div>;
}

export function PortalSoundSetting({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return <label className={styles.soundSetting}><input type="checkbox" checked={enabled} onChange={onToggle} />Звук при выполнении шага</label>;
}
