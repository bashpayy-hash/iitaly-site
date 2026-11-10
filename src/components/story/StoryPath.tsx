"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import styles from "./story-path.module.css";

export type PathStop = { id: string; title: string; locked?: boolean };

/* Путь вместо ряда пилюль (owner, 10 Nov: «сделай эти ответвления в гайдах и
   визе в формате пути, который как прогресс-бар, так намного нагляднее»).
   Остановки стоят на одной линии; линия до текущей остановки залита — это и
   есть прогресс. Пройденные — терракотовые, текущая — с кольцом, следующие —
   светлые; закрытая до оплаты остановка вместо номера несёт замок. Над путём —
   «Пункт 2 из 5» и короткая подпись (что открыто). Остановки — ссылки: с
   onSelect путь листает пункты на месте, без него ведёт на страницу шага.
   Стрелки ← → переходят между остановками. */
export function StoryPath({ stops, index, href, onSelect, label, noun = "Пункт", caption }: {
  stops: PathStop[]; index: number; href: (index: number) => string; onSelect?: (index: number) => void;
  label: string; noun?: string; caption?: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const count = stops.length;
  useEffect(() => {
    const box = scroller.current, current = box?.querySelector<HTMLElement>("[aria-current]");
    if (!box || !current || box.scrollWidth <= box.clientWidth) return;
    // Only the path scrolls sideways, never the page.
    box.scrollLeft = Math.max(0, current.offsetLeft + current.offsetWidth / 2 - box.clientWidth / 2);
  }, [index]);
  const style = { "--n": count, "--at": count > 1 ? index / (count - 1) : 1 } as CSSProperties;
  return <nav className={styles.path} aria-label={label} data-story-path style={style} onKeyDown={event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const from = Number((event.target as HTMLElement).closest<HTMLElement>("[data-path-stop]")?.dataset.pathStop);
    if (!Number.isInteger(from)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : Math.max(0, Math.min(count - 1, from + (event.key === "ArrowRight" ? 1 : -1)));
    event.currentTarget.querySelector<HTMLElement>(`[data-path-stop="${next}"]`)?.focus();
  }}>
    <div className={styles.head}>
      <p className={styles.position} role="status">{noun} {index + 1} из {count}</p>
      {caption && <p className={styles.caption} data-path-caption>{caption}</p>}
    </div>
    <div className={styles.scroller} ref={scroller}>
      <div className={styles.road}>
        <span className={styles.rail} aria-hidden="true"><span className={styles.fill} /></span>
        <ol className={styles.stops}>
          {stops.map((stop, position) => {
            const state = position < index ? "done" : position === index ? "current" : "next";
            const body = <>
              <span className={styles.node} aria-hidden="true">{stop.locked ? <Lock size={14} strokeWidth={2.4} /> : position + 1}</span>
              <span className={styles.name}>{stop.title}</span>
            </>;
            const common = {
              className: styles.stop, "data-path-stop": position, "data-state": state, "data-locked": stop.locked || undefined,
              "aria-current": position === index ? "step" as const : undefined,
              "aria-label": `${noun} ${position + 1} из ${count}: ${stop.title}${stop.locked ? " — откроется с маршрутом" : ""}`,
            };
            return <li key={stop.id}>
              {onSelect ? <a {...common} href={href(position)} onClick={event => {
                if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); onSelect(position);
              }}>{body}</a> : <Link {...common} href={href(position)}>{body}</Link>}
            </li>;
          })}
        </ol>
      </div>
    </div>
  </nav>;
}
