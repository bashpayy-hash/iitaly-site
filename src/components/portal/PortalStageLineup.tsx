"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PortalTask } from "@/lib/portalApi";
import { taskTitle } from "@/lib/portalNavigation";
import { RisoArtImage } from "./RisoArtImage";
import type { RisoArt } from "./portalStageArt";
import styles from "./portal-lineup.module.css";

export type LineupStage = {
  id: string; title: string; position: number; locked: boolean; ahead: boolean;
  state: "done" | "current" | "future";
  done: number; total: number; next?: PortalTask; when?: string; art: RisoArt;
};

const pad = (value: number) => String(value).padStart(2, "0");

/* Предстоящие этапы рядом карточек, как линейка моделей на apple.com:
   вещь этапа на тонированной подложке, точки шагов, метка, название, первый
   шаг, срок и две кнопки. Карточки только ведут на страницы этапов и шагов;
   отметить шаг выполненным можно лишь на его странице. */
export function PortalStageLineup({ stages, onSelectStage, onOpenTask }: {
  stages: LineupStage[];
  onSelectStage?: (id: string) => void;
  onOpenTask: (task: PortalTask) => void;
}) {
  const row = useRef<HTMLOListElement>(null);
  if (!stages.length) return null;
  const scroll = (direction: number) => {
    const element = row.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const plain = (event: React.MouseEvent) => !(event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
  return <section className={styles.lineup} aria-labelledby="stage-lineup-heading" data-stage-lineup>
    <div className={styles.head}>
      <h2 id="stage-lineup-heading">Дальше по маршруту</h2>
      <p>{stages.length} {stages.length === 1 ? "этап" : stages.length < 5 ? "этапа" : "этапов"} впереди</p>
    </div>
    {/* A row of locked cards has nothing to tab to, so the row itself takes
        focus and scrolls with the arrow keys (axe: scrollable-region-focusable). */}
    <ol className={styles.row} ref={row} tabIndex={stages.some(stage => !stage.locked) ? undefined : 0} aria-labelledby="stage-lineup-heading">
      {stages.map(stage => <li key={stage.id} className={styles.card} data-road-locked={stage.locked || undefined} data-stage-card={stage.id}>
          <div className={styles.visual} data-art={stage.art}><RisoArtImage art={stage.art} sizes="(max-width: 600px) 60vw, 220px" locked={stage.locked} /></div>
          <span className={styles.dots} aria-hidden="true">{Array.from({ length: Math.max(stage.total, 1) }, (_, index) => <i key={index} data-done={index < stage.done || undefined} />)}</span>
          <p className={styles.label}>{stage.locked ? "После анкеты" : stage.state === "done" ? "Пройден" : stage.ahead ? "Начат заранее" : `Этап ${pad(stage.position + 1)}`}</p>
          <h3 id={`lineup-${stage.id}`}>{stage.title}</h3>
          <p className={styles.description}>{stage.locked ? "Откроется, когда анкета покажет твой маршрут." : stage.next ? taskTitle(stage.next) : "Все шаги этапа отмечены."}</p>
          <p className={styles.meta} data-stage-count>{stage.locked ? "Шаги появятся после анкеты" : [`${stage.done} / ${stage.total} шагов`, stage.when ? `ориентир ${stage.when.toLowerCase()}` : ""].filter(Boolean).join(" · ")}</p>
          {stage.locked ? <span /> : <div className={styles.actions}>
            <a className={styles.primary} href={`/portal?stage=${encodeURIComponent(stage.id)}`} data-road-stage={stage.id} data-road-stage-state={stage.state} aria-label={`Открыть этап: ${stage.title}`}
              onClick={event => { if (!plain(event) || !onSelectStage) return; event.preventDefault(); onSelectStage(stage.id); }}>
              Открыть этап{stage.ahead && <span className={styles.srOnly} data-stage-ahead>заранее</span>}
            </a>
            {stage.next && <a className={styles.secondary} href={`/portal?view=plan&task=${encodeURIComponent(stage.next.id)}`} aria-label={`Первый шаг этапа «${stage.title}»: ${taskTitle(stage.next)}`}
              onClick={event => { if (!plain(event)) return; event.preventDefault(); onOpenTask(stage.next!); }}>
              Первый шаг<ChevronRight size={15} aria-hidden="true" />
            </a>}
          </div>}
      </li>)}
    </ol>
    {stages.length > 1 && <div className={styles.arrows}>
      <button type="button" aria-label="Предыдущие этапы" onClick={() => scroll(-1)}><ChevronLeft size={18} aria-hidden="true" /></button>
      <button type="button" aria-label="Следующие этапы" onClick={() => scroll(1)}><ChevronRight size={18} aria-hidden="true" /></button>
    </div>}
  </section>;
}
