"use client";

import { useEffect, useState } from "react";
import type { PortalData } from "@/lib/portalApi";
import { portalTaskDone } from "@/lib/portalProgress";
import { VespiPose } from "@/components/mascot/VespiPose";
import type { CompletionFeedback } from "./usePortalFeedback";
import styles from "./portal-focus.module.css";

/* Награда за один сохранённый шаг: штамп в этапе. Появляется только после
   подтверждённого сохранения (usePortalFeedback.confirm), никогда при входе,
   перезагрузке или навигации. Последний шаг этапа — «Этап пройден».
   Плашка (owner, 9 Nov: «уведомление без анимации, выглядит топорно»):
   выезжает сверху и садится за 420 мс, Веспи со штампом «пристукивает»,
   уходит вверх за 240 мс — последняя награда держится на экране, пока идёт
   уход, поэтому плашка не пропадает рывком. */
const LEAVE_MS = 240;

export function PortalCompletion({ feedback, data }: { feedback: CompletionFeedback | null; data?: PortalData | null }) {
  // Последняя показанная награда живёт ещё LEAVE_MS после конца показа.
  const [last, setLast] = useState<CompletionFeedback | null>(feedback);
  if (feedback && feedback !== last) setLast(feedback);
  const leaving = !feedback && last !== null;
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLast(null), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);
  const item = feedback || last;
  const stage = item && data?.roadmap.find(row => row.tasks.some(task => task.id === item.taskId));
  const stamped = stage && data ? stage.tasks.filter(task => portalTaskDone(data, task)).length : 0;
  const total = stage ? stage.tasks.length : 0;
  const stageDone = total > 0 && stamped === total;
  return <div className={styles.confirmation} role="status" aria-live="polite" aria-atomic="true" data-portal-completion={feedback?.taskId || ""} data-visible={Boolean(feedback)} data-reward={item ? stageDone ? "stage" : "step" : undefined}>
    {item && <div key={item.id} className={styles.confirmationBody} data-leaving={leaving || undefined}>
      <span className={styles.rewardVespi}><VespiPose pose={stageDone ? "celebrate" : "stamp"} priority sizes="64px" /></span>
      <div className={styles.rewardCopy}>
        <p className={styles.rewardLabel}>{stageDone ? "Этап пройден" : "Штамп получен"}</p>
        <strong>{stageDone && stage ? stage.title : "Шаг сохранён"}</strong>
        <span className={styles.rewardTitle}>{item.title}</span>
        {stage && <span className={styles.rewardTally} data-reward-tally>{stageDone ? `Все штампы этапа: ${stamped} из ${total}` : `Этап «${stage.title}»: ${stamped} из ${total}`}</span>}
      </div>
    </div>}
  </div>;
}

export function PortalSoundSetting({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return <label className={styles.soundSetting}><input type="checkbox" checked={enabled} onChange={onToggle} />Звук при выполнении шага</label>;
}
