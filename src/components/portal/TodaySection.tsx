"use client";

import { useRouter } from "next/navigation";
import type { PortalData } from "@/lib/portalApi";
import { ACT_PAGE, TASK_META, dlText, fmtDate } from "@/lib/portalMeta";
import { Vespa } from "@/components/Vespa";
import { ProgressRibbon } from "@/components/portal/ProgressRibbon";

function flatTasks(d: PortalData) {
  const out: { st: string; stId: string; t: PortalData["roadmap"][number]["tasks"][number]; done: boolean }[] = [];
  for (const st of d.roadmap) for (const t of st.tasks) out.push({ st: st.title, stId: st.id, t, done: !!d.done[t.id] });
  return out;
}

export function TodaySection({
  data,
  onGoto,
  onMarkDone,
}: {
  data: PortalData;
  onGoto: (stageId: string) => void;
  onMarkDone: (taskId: string) => void;
}) {
  const router = useRouter();
  const flat = flatTasks(data);
  const over = flat.filter((v) => !v.done && v.t.daysLeft != null && v.t.daysLeft < 0);
  const hot = flat.filter((v) => !v.done && v.t.daysLeft != null && v.t.daysLeft >= 0 && v.t.daysLeft <= 45);
  const next = flat.find((v) => !v.done);

  return (
    <div>
      <div className="rounded-lg border-2 border-ink bg-paper p-4">
        <div className="flex items-center justify-between">
          <b className="font-display text-lg font-bold">
            {data.progress.done} из {data.progress.total}
          </b>
          <span className="text-sm text-ink-soft">шагов пройдено</span>
        </div>
        <div className="mt-2.5">
          <ProgressRibbon pct={data.progress.pct} />
        </div>
      </div>

      {(over.length > 0 || hot.length > 0) && (
        <div className={`mt-4 rounded-lg border-2 p-4 ${over.length ? "border-red bg-red/5" : "border-warn bg-warn/5"}`}>
          <b className="text-sm">{over.length ? `Просрочено: ${over.length}` : `Скоро дедлайн: ${hot.length}`}</b>
          <div className="mt-2 space-y-1">
            {(over.length ? over : hot).slice(0, 3).map((v) => (
              <div key={v.t.id} className="flex justify-between gap-3 text-sm">
                <span>{v.t.t}</span>
                <span className="text-ink-soft italic">{dlText(v.t, false)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        {!next ? (
          <div className="flex items-start gap-3 rounded-lg border-2 border-green bg-green/5 p-4">
            <Vespa pose="celebrate" className="h-11 w-auto shrink-0" />
            <div>
              <b className="text-sm">Все шаги пройдены</b>
              <p className="mt-1 text-sm text-ink-soft">
                Маршрут закрыт. Если появятся новые задачи, они появятся здесь.
              </p>
            </div>
          </div>
        ) : (
          <NextStepCard
            item={next}
            onGo={() => {
              const page = ACT_PAGE[next.t.id];
              if (page) {
                router.push(page);
                return;
              }
              window.dispatchEvent(
                new CustomEvent("iitaly:open-chat", { detail: { prefill: `Расскажи подробно про шаг: ${next.t.t}` } }),
              );
            }}
            onDone={() => onMarkDone(next.t.id)}
          />
        )}
      </div>

      <div className="mt-6 space-y-2">
        {data.roadmap.map((st) => {
          const total = st.tasks.length;
          const done = st.tasks.filter((t) => data.done[t.id]).length;
          const stOver = st.tasks.some((t) => !data.done[t.id] && t.daysLeft != null && t.daysLeft < 0);
          const stHot = st.tasks.some((t) => !data.done[t.id] && t.daysLeft != null && t.daysLeft >= 0 && t.daysLeft <= 45);
          const dates = st.tasks.filter((t) => t.deadline).map((t) => t.deadline as string).sort();
          const cls = done === total ? "border-green bg-green/5" : stOver ? "border-red bg-red/5" : stHot ? "border-warn bg-warn/5" : "border-line bg-paper";
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onGoto(st.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-md border-2 px-4 py-3 text-left transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${cls}`}
            >
              <span className="text-sm font-bold">{st.title}</span>
              <span className="shrink-0 text-xs text-ink-soft whitespace-nowrap">
                {done}/{total}
                {dates.length ? ` · до ${fmtDate(dates[dates.length - 1])}` : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NextStepCard({
  item,
  onGo,
  onDone,
}: {
  item: ReturnType<typeof flatTasks>[number];
  onGo: () => void;
  onDone: () => void;
}) {
  const m = TASK_META[item.t.id] || {};
  const dl = item.t.deadline ? dlText(item.t, false) : "";
  const risky = item.t.daysLeft != null && item.t.daysLeft <= 14;
  const auto = item.t.ai || item.t.expert;

  return (
    <div className={`rounded-lg border-2 p-4 ${risky ? "border-red bg-red/5" : "border-ink bg-paper"}`}>
      <p className="text-xs font-extrabold tracking-[0.14em] text-sec uppercase">Следующий шаг</p>
      <b className="mt-1 block text-base">{item.t.t}</b>
      {m.why && <p className="mt-1 text-sm text-ink-soft">{m.why}</p>}
      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
        {m.min && <span className="rounded-pill bg-cream px-2.5 py-1 font-bold">{m.min}</span>}
        {dl && (
          <span className={`rounded-pill px-2.5 py-1 font-bold ${risky ? "bg-red text-cream" : "bg-cream"}`}>{dl}</span>
        )}
        <span className="text-ink-soft">{item.st}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={onGo}
          className="rounded-pill border-2 border-ink bg-red px-4 py-2 text-xs font-extrabold text-cream uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {m.act || "Открыть шаг"}
        </button>
        {!auto && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-pill border-2 border-ink bg-paper px-4 py-2 text-xs font-extrabold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
          >
            Уже сделал
          </button>
        )}
      </div>
    </div>
  );
}
