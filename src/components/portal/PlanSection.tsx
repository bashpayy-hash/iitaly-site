"use client";

import { Accordion } from "@/components/Accordion";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, V_LABEL, dlText } from "@/lib/portalMeta";
import styles from "./portal.module.css";

export function PlanSection({
  data,
  openStage,
  onToggleTask,
  onUploadDoc,
  busyTask,
  onAsk,
}: {
  data: PortalData;
  openStage: string;
  onToggleTask: (taskId: string, value: boolean) => void;
  onUploadDoc: (taskId: string) => void;
  busyTask: string | null;
  onAsk: (task: PortalTask) => void;
}) {
  return (
    <div>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Весь маршрут</p>
          <h2>План поступления</h2>
          <p>Открывай текущий этап. Остальные остаются на виду, но не требуют внимания заранее.</p>
        </div>
      </div>

      <div className={styles.planStages}>
        {data.roadmap.map((stage) => {
          const total = stage.tasks.length;
          const done = stage.tasks.filter((task) => data.done[task.id]).length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <div key={stage.id} id={"portal-stage-" + stage.id}>
              <Accordion
                variant="quiet"
                defaultOpen={stage.id === openStage}
                summary={
                  <div className={styles.stageSummary}>
                    <span className={styles.stageName}>{stage.title}</span>
                    <span className={styles.miniTrack} aria-hidden>
                      <span className={styles.miniFill} style={{ width: pct + "%" }} />
                    </span>
                    <span className={styles.stageMeta}>{done}/{total}</span>
                  </div>
                }
              >
                <div>
                  {stage.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      done={!!data.done[task.id]}
                      doc={data.docs?.[task.id]}
                      busy={busyTask === task.id}
                      onToggle={onToggleTask}
                      onUploadDoc={onUploadDoc}
                      onAsk={onAsk}
                    />
                  ))}
                </div>
              </Accordion>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  done,
  doc,
  busy,
  onToggle,
  onUploadDoc,
  onAsk,
}: {
  task: PortalTask;
  done: boolean;
  doc: PortalData["docs"][string] | undefined;
  busy: boolean;
  onToggle: (taskId: string, value: boolean) => void;
  onUploadDoc: (taskId: string) => void;
  onAsk: (task: PortalTask) => void;
}) {
  const needDoc = DOC_TASKS[task.id];
  const systemTracked = task.id === "profile" || task.id === "path12" || Boolean(needDoc) || Boolean(task.ai) || Boolean(task.expert);
  const blocked = task.available === false;

  function activate() {
    if (busy || blocked || systemTracked) return;
    onToggle(task.id, !done);
  }

  return (
    <div
      role={!systemTracked && !blocked ? "button" : undefined}
      tabIndex={!systemTracked && !blocked ? 0 : undefined}
      onClick={activate}
      onKeyDown={(event) => {
        if (!systemTracked && !blocked && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          activate();
        }
      }}
      className={styles.taskRow}
      data-blocked={blocked || undefined}
      style={{ opacity: busy ? .55 : 1, cursor: !systemTracked && !blocked ? "pointer" : "default" }}
    >
      <span className={styles.taskCheck} data-done={done ? "true" : "false"} data-system={systemTracked ? "true" : "false"} aria-hidden>
        {done ? "✓" : systemTracked ? "·" : ""}
      </span>

      <div className={styles.taskContent}>
        <div className={styles.taskTitle}>{task.t}</div>
        {task.explain && <p className={styles.taskExplain}>{task.explain}</p>}

        <div className={styles.taskChips}>
          {task.owner && <span className={styles.taskChip}>{task.owner}</span>}
          {task.time && <span className={styles.taskChip}>{task.time}</span>}
          {task.deadline && <span className={styles.taskChip}>{task.deadlineKind || "Ориентир"} · {dlText(task, done)}</span>}
          {task.timingLabel && <span className={styles.taskChip}>{task.timingLabel}</span>}
          {doc && <span className={styles.taskChip}>Документ: {V_LABEL[doc.verdict] || "проверен"}</span>}
        </div>

        {task.note && <p className={styles.taskNote}>{task.note}</p>}
        {task.warn && <p className={styles.taskWarn}>{task.warn}</p>}
        {doc?.summary && <p className={styles.taskNote}>{doc.summary}</p>}

        {!blocked && (
          <div className={styles.taskActions}>
            {needDoc && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onUploadDoc(task.id);
                }}
                disabled={busy}
                className={doc ? styles.secondaryButton : styles.primaryButton}
              >
                {busy ? "Проверяю…" : doc ? "Проверить другой файл" : "Загрузить документ"}
              </button>
            )}
            {(task.ai || task.expert) && (
              <button type="button" onClick={() => onAsk(task)} className={styles.secondaryButton}>
                Спросить про этот шаг
              </button>
            )}
            {!systemTracked && (
              <span className={styles.taskTapHint}>{done ? "Нажми строку, чтобы вернуть задачу" : "Нажми строку, когда сделаешь"}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
