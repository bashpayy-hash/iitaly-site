"use client";

import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StoryArtwork, type StorySubject } from "./StoryArtwork";
import styles from "./story.module.css";

export type StoryItem = { id: string; title: string; text: string; subject: StorySubject; label?: string; content?: ReactNode };
const subscribe = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
const snapshot = () => window.location.search;
const serverSnapshot = () => "";
export function useStoryLocation(parameter: string, count: number) {
  const search = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const raw = new URLSearchParams(search).get(parameter) || "1";
  const value = /^\d+$/.test(raw) ? Number(raw) : 1;
  const index = Number.isSafeInteger(value) ? Math.max(0, Math.min(count - 1, value - 1)) : 0;
  const href = (next: number) => {
    const query = new URLSearchParams(search);
    query.set(parameter, String(next + 1));
    return `?${query}`;
  };
  const select = (next: number) => {
    if (next === index) return;
    window.history.pushState(window.history.state, "", href(next));
    window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
  };
  return { index, href, select };
}

export function StoryPills({ items, index, onSelect, href, label, panelId }: {
  items: { id: string; title: string; label?: string }[]; index: number;
  onSelect: (index: number) => void; href?: (index: number) => string; label: string; panelId?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const active = root.current?.querySelector<HTMLElement>("[aria-current], [aria-selected=true]");
    if (!root.current || !active) return;
    // Scroll only the pill strip, never the page or the focused form.
    root.current.scrollLeft = Math.max(0, active.offsetLeft - root.current.offsetLeft - 12);
  }, [index]);
  return <nav ref={root} className={styles.pills} aria-label={label} role={href ? undefined : "tablist"} onKeyDown={event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const current = Number((event.target as HTMLElement).closest<HTMLElement>("[data-story-pill]")?.dataset.storyPill);
    if (!Number.isInteger(current)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    onSelect(next);
    root.current?.querySelector<HTMLElement>(`[data-story-pill="${next}"]`)?.focus({ preventScroll: true });
  }}>
    {items.map((item, position) => href ? <a key={item.id} data-story-pill={position} title={item.title} aria-label={item.label ? `${item.label}: ${item.title}` : undefined} href={href(position)} aria-current={index === position ? "step" : undefined} onClick={event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onSelect(position);
    }}>{item.label || item.title}</a> : <button key={item.id} type="button" role="tab" id={`${panelId}-tab-${position}`} aria-controls={panelId} aria-selected={index === position} tabIndex={index === position ? 0 : -1} data-story-pill={position} onClick={() => onSelect(position)}>{item.label || item.title}</button>)}
  </nav>;
}

/** Only the active point mounts. Forms belong outside this changing panel. */
export function MediaSwitcher({ items, index, onSelect, href, headingId, lastAction, firstAction, label = "Пункты инструкции", progressLabel = "Шаг", headingAs = "h2" }: {
  items: StoryItem[]; index: number; onSelect: (index: number) => void; href?: (index: number) => string;
  headingId?: string; lastAction?: ReactNode; firstAction?: ReactNode; label?: string; progressLabel?: string; headingAs?: "h1" | "h2" | "h3";
}) {
  const generatedId = useId();
  const panelId = `${generatedId}-panel`;
  const item = items[index];
  const Heading = headingAs;
  const last = index === items.length - 1;
  if (!item) return null;
  return <div className={styles.switcher} data-media-switcher>
    <StoryPills items={items} index={index} onSelect={onSelect} href={href} label={label} panelId={panelId} />
    <p className={styles.position} role="status">{progressLabel} {index + 1} из {items.length}</p>
    <section id={panelId} className={styles.frame} key={item.id} role={href ? "region" : "tabpanel"} aria-labelledby={href ? headingId || `${generatedId}-heading` : `${panelId}-tab-${index}`} data-instruction-point={index + 1}>
      <div className={styles.copy}>
        <Heading id={headingId || `${generatedId}-heading`} tabIndex={-1}>{item.title}</Heading>
        <p>{item.text}</p>
        {item.content}
      </div>
      <StoryArtwork subject={item.subject} eager />
    </section>
    <nav className={styles.navigation} data-fab-yield aria-label="Переход между пунктами">
      {index > 0 ? <button type="button" className={styles.back} onClick={() => onSelect(index - 1)}><ArrowLeft size={18} aria-hidden="true" />Назад</button> : firstAction || <button type="button" className={styles.back} disabled><ArrowLeft size={18} aria-hidden="true" />Назад</button>}
      {last && lastAction ? lastAction : <button type="button" className={styles.next} data-instruction-next disabled={last} onClick={() => onSelect(index + 1)}>{last ? "Все пункты просмотрены" : "Далее"}<ArrowRight size={18} aria-hidden="true" /></button>}
    </nav>
  </div>;
}
