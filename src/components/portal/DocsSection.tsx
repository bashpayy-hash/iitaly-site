"use client";

import type { PortalData } from "@/lib/portalApi";
import { DOC_TASKS, V_LABEL } from "@/lib/portalMeta";

export function DocsSection({
  data,
  onUploadDoc,
  busyTask,
}: {
  data: PortalData;
  onUploadDoc: (taskId: string) => void;
  busyTask: string | null;
}) {
  const rows: { id: string; title: string; stage: string; doc?: PortalData["docs"][string] }[] = [];
  for (const st of data.roadmap) {
    for (const t of st.tasks) {
      if (!DOC_TASKS[t.id]) continue;
      rows.push({ id: t.id, title: DOC_TASKS[t.id], stage: st.title, doc: data.docs?.[t.id] });
    }
  }
  const ready = rows.filter((r) => r.doc?.verdict === "ok").length;
  const issues = rows.filter((r) => r.doc && r.doc.verdict !== "ok").length;
  const missing = rows.filter((r) => !r.doc).length;

  return (
    <div>
      <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">Документы</p>
      <h3 className="mt-1 font-display text-xl font-bold">
        {ready} из {rows.length} готовы
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Загрузи файл — ИИ сверит его с правилами и подскажет, что не так.
        Проверенный документ закрывает шаг маршрута.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-pill bg-green/15 px-3 py-1 text-xs font-bold text-green">{ready} проверено</span>
        {issues > 0 && <span className="rounded-pill bg-red/15 px-3 py-1 text-xs font-bold text-red">{issues} с замечаниями</span>}
        <span className="rounded-pill bg-line px-3 py-1 text-xs font-bold text-ink-soft">{missing} не загружено</span>
      </div>

      <div className="mt-5 space-y-2.5">
        {rows.map((r) => (
          <div
            key={r.id}
            className={`rounded-lg border-2 p-4 ${
              r.doc?.verdict === "ok" ? "border-green bg-green/5" : r.doc ? "border-warn bg-warn/5" : "border-line bg-paper"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <b className="text-sm">{r.title}</b>
              {r.doc ? (
                <span className="shrink-0 rounded-pill bg-cream px-2.5 py-1 text-[11px] font-bold whitespace-nowrap">
                  {V_LABEL[r.doc.verdict] || ""}
                </span>
              ) : (
                <span className="shrink-0 text-[11px] text-ink-soft whitespace-nowrap">нет файла</span>
              )}
            </div>
            <span className="mt-1 block text-xs text-ink-soft">{r.stage}</span>
            {r.doc?.summary && <p className="mt-1.5 text-xs text-ink-soft">{r.doc.summary}</p>}
            {r.doc?.critical ? <p className="mt-1 text-xs font-bold text-red">Критических ошибок: {r.doc.critical}</p> : null}
            <button
              type="button"
              onClick={() => onUploadDoc(r.id)}
              disabled={busyTask === r.id}
              className="mt-2.5 rounded-pill border-2 border-ink bg-paper px-3.5 py-1.5 text-xs font-extrabold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
            >
              {busyTask === r.id ? "Проверяю…" : r.doc ? "Проверить другой файл" : "Загрузить и проверить"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
