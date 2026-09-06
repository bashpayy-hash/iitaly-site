"use client";

import { Accordion } from "@/components/Accordion";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, V_LABEL, dlState, dlText } from "@/lib/portalMeta";

const DL_STYLE: Record<string, string> = {
  done: "bg-green/15 text-green",
  over: "bg-red/15 text-red",
  hot: "bg-red/15 text-red",
  soon: "bg-warn/15 text-warn",
  calm: "bg-line text-ink-soft",
  none: "bg-line text-ink-soft",
};

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
    <div className="space-y-3">
      {data.roadmap.map((st) => {
        const total = st.tasks.length;
        const done = st.tasks.filter((t) => data.done[t.id]).length;
        return (
          <div key={st.id} id={`portal-stage-${st.id}`}>
            <Accordion
              defaultOpen={st.id === openStage}
              summary={
                <div className="flex items-center justify-between gap-3">
                  <b className="text-sm font-black">{st.title}</b>
                  <span className="shrink-0 text-xs font-bold text-ink-soft">
                    {done}/{total}
                  </span>
                </div>
              }
            >
              <div className="space-y-2">
                {st.tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    done={!!data.done[t.id]}
                    doc={data.docs?.[t.id]}
                    busy={busyTask === t.id}
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
  const stt = dlState(task, done);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (busy) return;
        if (auto) {
          window.dispatchEvent(
            new CustomEvent("iitaly:open-chat", { detail: { prefill: `Помоги с шагом: ${task.t}` } }),
          );
          return;
        }
        onToggle(task.id, !done);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !busy) {
          e.preventDefault();
          if (auto) {
            window.dispatchEvent(
              new CustomEvent("iitaly:open-chat", { detail: { prefill: `Помоги с шагом: ${task.t}` } }),
            );
            return;
          }
          onToggle(task.id, !done);
        }
      }}
      className={`flex gap-3 rounded-md border-2 p-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
        done ? "border-green bg-green/5" : "border-line bg-cream"
      } cursor-pointer ${busy ? "opacity-60" : ""}`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 text-xs font-black ${
          done ? "border-green bg-green text-cream" : "border-ink-soft bg-paper"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{task.t}</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {task.deadline && (
            <span className={`rounded-pill px-2 py-0.5 text-[11px] font-bold ${DL_STYLE[stt]}`}>
              {dlText(task, done)}
            </span>
          )}
          {task.ai && <span className="rounded-pill bg-sec/15 px-2 py-0.5 text-[11px] font-bold text-sec">делает ИИ</span>}
          {task.expert && (
            <span className="rounded-pill bg-sec/15 px-2 py-0.5 text-[11px] font-bold text-sec">проверяет эксперт</span>
          )}
          {doc && (
            <span className={`rounded-pill px-2 py-0.5 text-[11px] font-bold ${DL_STYLE[doc.verdict] || DL_STYLE.calm}`}>
              документ: {V_LABEL[doc.verdict] || ""}
            </span>
          )}
        </div>
        {task.note && <p className="mt-1 text-xs text-ink-soft">{task.note}</p>}
        {task.warn && <p className="mt-1 text-xs font-bold text-red">{task.warn}</p>}
        {doc?.summary && <p className="mt-1 text-xs text-ink-soft">{doc.summary}</p>}
        {needDoc && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUploadDoc(task.id);
            }}
            disabled={busy}
            className="mt-2 rounded-pill border-2 border-ink bg-paper px-3 py-1.5 text-[11px] font-extrabold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
          >
            {busy ? "Проверяю…" : doc ? "Проверить другой файл" : "Загрузить и проверить"}
          </button>
        )}
      </div>
    </div>
  );
}
