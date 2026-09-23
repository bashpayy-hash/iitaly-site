"use client";

import { Accordion } from "@/components/Accordion";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, V_LABEL, dlState, dlText } from "@/lib/portalMeta";
import styles from "./portal.module.css";

export function PlanSection({
  data,
  openStage,
  onToggleTask,
  onUploadDoc,
  busyTask,
}: {
  data: PortalData;
  openStage: string;
  onToggleTask: (taskId: string, value: boolean) => void;
  onUploadDoc: (taskId: string) => void;
  busyTask: string | null;
}) {
  return (
    <div>
      <div className={styles.sectionHeading}>
        <div>
          <h2>План поступления</h2>
          <p>Открывай только текущий этап. Остальные остаются на виду, но не отвлекают.</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px auto", gap: 12, alignItems: "center" }}>
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
}: {
  task: PortalTask;
  done: boolean;
  doc: PortalData["docs"][string] | undefined;
  busy: boolean;
  onToggle: (taskId: string, value: boolean) => void;
  onUploadDoc: (taskId: string) => void;
}) {
  const auto = task.ai || task.expert;
  const needDoc = DOC_TASKS[task.id];
  const state = dlState(task, done);

  function activate() {
    if (busy) return;
    if (auto) {
      window.dispatchEvent(
        new CustomEvent("iitaly:open-chat", { detail: { prefill: "Помоги с шагом: " + task.t } }),
      );
      return;
    }
    onToggle(task.id, !done);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      }}
      className={styles.taskRow}
      style={{ opacity: busy ? .55 : 1, cursor: "pointer" }}
    >
      <span className={styles.taskCheck} data-done={done ? "true" : "false"} aria-hidden>
        {done ? "✓" : ""}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className={styles.taskTitle}>{task.t}</div>
        <div className={styles.taskChips}>
          {task.deadline && <span className={styles.taskChip}>{dlText(task, done)}</span>}
          {task.ai && <span className={styles.taskChip}>поможет ИИ</span>}
          {task.expert && <span className={styles.taskChip}>нужен эксперт</span>}
          {doc && <span className={styles.taskChip}>документ: {V_LABEL[doc.verdict] || "проверен"}</span>}
        </div>
        {task.note && <p className={styles.taskNote}>{task.note}</p>}
        {task.warn && <p className={styles.taskWarn}>{task.warn}</p>}
        {doc?.summary && <p className={styles.taskNote}>{doc.summary}</p>}
        {needDoc && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onUploadDoc(task.id);
            }}
            disabled={busy}
            className={doc ? styles.secondaryButton : styles.primaryButton}
            style={{ marginTop: 9 }}
          >
            {busy ? "Проверяю…" : doc ? "Проверить другой файл" : "Загрузить документ"}
          </button>
        )}
        {!done && state === "over" && <p className={styles.taskWarn}>Этот дедлайн уже прошёл — лучше разобрать шаг первым.</p>}
      </div>
    </div>
  );
}
