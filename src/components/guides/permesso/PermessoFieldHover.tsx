"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EDITOR_FIELDS, ORIGINAL_PAGES, PAPER, fieldWidth, type EditorField } from "./permessoOriginalGeometry";
import type { FieldMode } from "./permessoData";
import styles from "./permesso-hover.module.css";

const STATES: Record<FieldMode, string> = {
  write: "Заполняй", empty: "Пропусти", ifExists: "Если есть", recommended: "Необязательно",
  verify: "Сначала уточни", post: "На почте",
};
const FIELD_SELECTOR = "#permesso-panel-editable [data-editor-field][data-part]";
type Preview = {
  anchor: HTMLElement; control: HTMLElement; field: EditorField; part: number;
  state: FieldMode; touch: boolean; value: string; center: number;
};
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(n, high));
function candidate(target: EventTarget | null, x?: number): Preview | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest<HTMLElement>(FIELD_SELECTOR);
  if (!anchor || !anchor.getClientRects().length) return null;
  const field = EDITOR_FIELDS.find(f => f.id === anchor.dataset.editorField);
  const part = Number(anchor.dataset.part);
  if (!field || !field.runs[part]) return null;
  const control = anchor.querySelector<HTMLElement>("input, button");
  if (!control) return null;
  const run = field.runs[part];
  const bounds = anchor.getBoundingClientRect();
  const ratio = x === undefined ? Math.min(.5, 60 / fieldWidth(run)) : clamp((x - bounds.left) / Math.max(1, bounds.width), 0, 1);
  const state = anchor.dataset.state as FieldMode;
  return {
    anchor, control, field, part, state: state in STATES ? state : "verify", touch: false,
    value: control instanceof HTMLInputElement ? control.value : control.getAttribute("aria-pressed") === "true" ? "X" : "",
    center: run.x + ratio * fieldWidth(run),
  };
}

/** Read-only enhancement of the editor's stable data markers. It does not own
 * any answers, select a field on hover, write storage, or alter paper geometry.
 * Mounted only with the editable tab; the actual editor stays mounted separately. */
export function PermessoFieldHover() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const current = useRef<Preview | null>(null);
  const popup = useRef<HTMLElement | null>(null);
  const dismissed = useRef<HTMLElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null; closeTimer.current = null;
  }, []);
  const close = useCallback(() => {
    clearTimers();
    current.current = null;
    setPreview(null);
  }, [clearTimers]);
  const dismiss = useCallback(() => {
    dismissed.current = current.current?.anchor || null;
    close();
  }, [close]);
  const keep = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const leave = useCallback(() => {
    keep();
    closeTimer.current = setTimeout(() => {
      const p = current.current;
      if (!p || p.touch || p.anchor.contains(document.activeElement) || p.anchor.matches(":hover") || popup.current?.matches(":hover")) return;
      close();
    }, 240);
  }, [keep, close]);

  useEffect(() => {
    let touch: { start: Preview; x: number; y: number; id: number } | null = null;
    let suppressedClick: { anchor: HTMLElement; until: number } | null = null;
    function show(p: Preview, delay: number) {
      clearTimers();
      if (dismissed.current === p.anchor) return;
      const apply = () => {
        if (!p.anchor.isConnected || !p.anchor.getClientRects().length) return;
        current.current = p;
        setPreview(p);
      };
      if (delay) openTimer.current = setTimeout(apply, delay); else apply();
    }
    function over(e: PointerEvent) {
      if (e.pointerType === "touch" || e.buttons) return;
      const p = candidate(e.target, e.clientX);
      if (!p || (e.relatedTarget instanceof Node && p.anchor.contains(e.relatedTarget))) return;
      if (p.anchor === current.current?.anchor) { keep(); return; }
      show(p, 130);
    }
    function out(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      const p = candidate(e.target);
      if (!p || (e.relatedTarget instanceof Node && p.anchor.contains(e.relatedTarget))) return;
      if (dismissed.current === p.anchor) dismissed.current = null;
      if (openTimer.current) clearTimeout(openTimer.current);
      if (e.relatedTarget instanceof Node && popup.current?.contains(e.relatedTarget)) { keep(); return; }
      leave();
    }
    function focus(e: FocusEvent) {
      const p = candidate(e.target);
      if (p) show(p, 0);
      else if (e.target instanceof Node && !popup.current?.contains(e.target)) close();
    }
    function blur(e: FocusEvent) {
      const p = candidate(e.target);
      if (!p) return;
      if (dismissed.current === p.anchor) dismissed.current = null;
      if (e.relatedTarget instanceof Node && popup.current?.contains(e.relatedTarget)) return;
      leave();
    }
    function down(e: PointerEvent) {
      if (e.target instanceof Node && popup.current?.contains(e.target)) return;
      const p = candidate(e.target, e.clientX);
      if (e.pointerType !== "touch") {
        if (current.current?.anchor !== p?.anchor) close();
        return;
      }
      if (!p) { close(); return; }
      // First tap explains; do not open the keyboard or toggle a checkbox yet.
      e.preventDefault();
      touch = { start: p, x: e.clientX, y: e.clientY, id: e.pointerId };
      suppressedClick = { anchor: p.anchor, until: Date.now() + 800 };
    }
    function up(e: PointerEvent) {
      if (!touch || touch.id !== e.pointerId) return;
      const start = touch; touch = null;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 12) return;
      e.preventDefault();
      dismissed.current = null;
      show({ ...start.start, touch: true }, 0);
    }
    function cancel() { touch = null; }
    function click(e: MouseEvent) {
      if (suppressedClick && Date.now() < suppressedClick.until && e.detail > 0 && e.target instanceof Node && suppressedClick.anchor.contains(e.target)) {
        e.preventDefault(); e.stopPropagation(); suppressedClick = null;
      }
    }
    function key(e: KeyboardEvent) {
      if (e.key === "Escape" && current.current) { e.preventDefault(); dismiss(); }
    }
    function input(e: Event) {
      const p = current.current;
      if (!p || e.target !== p.control || !(e.target instanceof HTMLInputElement)) return;
      const next = { ...p, value: e.target.value };
      current.current = next; setPreview(next);
    }
    document.addEventListener("pointerover", over, true);
    document.addEventListener("pointerout", out, true);
    document.addEventListener("focusin", focus, true);
    document.addEventListener("focusout", blur, true);
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("pointerup", up, true);
    document.addEventListener("pointercancel", cancel, true);
    document.addEventListener("click", click, true);
    document.addEventListener("keydown", key, true);
    document.addEventListener("input", input, true);
    return () => {
      clearTimers();
      document.removeEventListener("pointerover", over, true);
      document.removeEventListener("pointerout", out, true);
      document.removeEventListener("focusin", focus, true);
      document.removeEventListener("focusout", blur, true);
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointerup", up, true);
      document.removeEventListener("pointercancel", cancel, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("keydown", key, true);
      document.removeEventListener("input", input, true);
    };
  }, [clearTimers, close, dismiss, keep, leave]);

  function editLarge() {
    const p = current.current;
    if (!p) return;
    dismiss();
    // Focus invokes the existing editor's selection handler, not a new data path.
    dismissed.current = p.anchor;
    p.control.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      const panel = document.querySelector<HTMLElement>('#permesso-panel-editable aside[aria-label="Подсказка и ввод выбранного поля"]');
      const input = panel?.querySelector<HTMLElement>("input, textarea, select, [data-next-field]");
      input?.focus({ preventScroll: true });
      panel?.scrollIntoView({ block: "center", behavior: "auto" });
    });
  }
  if (!preview) return null;
  return createPortal(<FieldPreview preview={preview} id={id} popup={popup} onClose={dismiss} onEnter={keep} onLeave={leave} onEdit={editLarge} />, document.body);
}

type PreviewProps = {
  preview: Preview; id: string; popup: { current: HTMLElement | null };
  onClose: () => void; onEnter: () => void; onLeave: () => void; onEdit: () => void;
};
function FieldPreview({ preview: p, id, popup, onClose, onEnter, onLeave, onEdit }: PreviewProps) {
  const card = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const node = card.current;
    if (!node) return;
    popup.current = node;
    function position() {
      if (!node || !p.anchor.isConnected || !p.anchor.getClientRects().length) { onClose(); return; }
      const vv = window.visualViewport;
      const left = vv?.offsetLeft || 0, top = vv?.offsetTop || 0;
      const width = vv?.width || innerWidth, height = vv?.height || innerHeight;
      const gap = 12;
      node.style.width = Math.min(356, width - 2 * gap) + "px";
      node.style.maxHeight = Math.max(80, height - 2 * gap) + "px";
      const rect = p.anchor.getBoundingClientRect(), box = node.getBoundingClientRect();
      if (rect.bottom < top || rect.top > top + height) { onClose(); return; }
      let x = clamp(rect.left, left + gap, left + width - box.width - gap);
      let y = rect.bottom + gap;
      if (p.touch) { x = left + (width - box.width) / 2; y = top + height - box.height - gap; }
      else if (y + box.height > top + height - gap) {
        if (rect.top - box.height - gap >= top + gap) y = rect.top - box.height - gap;
        else {
          // A tall card goes alongside the run rather than covering its input.
          if (rect.right + gap + box.width <= left + width - gap) x = rect.right + gap;
          else if (rect.left - gap - box.width >= left + gap) x = rect.left - gap - box.width;
          y = clamp(rect.top, top + gap, top + height - box.height - gap);
        }
      }
      node.style.left = x + "px"; node.style.top = y + "px";
      node.style.visibility = "visible";
    }
    position();
    const resize = new ResizeObserver(position); resize.observe(node);
    const onScroll = (e: Event) => { if (!(e.target instanceof Node) || !node.contains(e.target)) position(); };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", position);
    window.visualViewport?.addEventListener("resize", position);
    window.visualViewport?.addEventListener("scroll", position);
    if (p.touch) node.querySelector<HTMLButtonElement>("[data-close-help]")?.focus({ preventScroll: true });
    return () => {
      resize.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("scroll", position);
      if (popup.current === node) popup.current = null;
    };
  }, [p.anchor, p.touch, onClose, popup]);
  useEffect(() => {
    const control = p.control;
    const tokens = (control.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    if (!tokens.includes(id)) control.setAttribute("aria-describedby", [...tokens, id].join(" "));
    p.anchor.setAttribute("data-hover-help", "true");
    return () => {
      const rest = (control.getAttribute("aria-describedby") || "").split(/\s+/).filter(token => token && token !== id);
      if (rest.length) control.setAttribute("aria-describedby", rest.join(" ")); else control.removeAttribute("aria-describedby");
      p.anchor.removeAttribute("data-hover-help");
    };
  }, [p.anchor, p.control, id]);

  const run = p.field.runs[p.part];
  const crop = { x: clamp(p.center - 82, 0, PAPER.width - 164), y: clamp(run.y - 16, 0, PAPER.height - 52), w: 164, h: 52 };
  const caption = /^\d+$/.test(p.field.id) ? `Поле ${p.field.id}` : "Шапка бланка";
  const locked = p.state === "empty" || p.field.kind === "signature";
  return <aside ref={card} id={id} className={styles.preview} data-permesso-hover={p.field.id} data-touch={p.touch} data-fab-yield role={p.touch ? "dialog" : "tooltip"} aria-label={p.touch ? `${caption}: ${p.field.meta.ru}` : undefined} onPointerEnter={onEnter} onPointerLeave={onLeave}>
    <div className={styles.top}><span>{caption} · стр. {p.field.page}</span><span>{STATES[p.state]}</span>{p.touch && <button type="button" data-close-help onClick={onClose} aria-label="Закрыть подсказку">×</button>}</div>
    <h2>{p.field.meta.ru}</h2>
    <p className={styles.italian}>{p.field.meta.it}{p.field.runs.length > 1 && run.label ? ` · ${run.label}` : ""}</p>
    <figure className={styles.magnifier} aria-hidden="true">
      <svg viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`} preserveAspectRatio="xMidYMid meet" data-hover-magnifier>
        <image href={ORIGINAL_PAGES[p.field.page - 1].url} x="0" y="0" width={PAPER.width} height={PAPER.height} />
        <rect x={run.x - 1} y={run.y - 1} width={fieldWidth(run) + 2} height={run.height + 2} fill="#373734" fillOpacity=".04" stroke="#373734" strokeWidth=".6" />
        {p.field.kind === "line" ? <text x={run.x + 2} y={run.y + run.height * .75} fontFamily="Arial, sans-serif" fontSize="10" fill="#193b66">{p.value}</text> : Array.from(p.value).map((char, i) => <text key={i} x={run.x + i * run.pitch + run.cell / 2} y={run.y + run.height / 2} textAnchor="middle" dominantBaseline="central" fontFamily="Courier New, monospace" fontSize="12" fill="#193b66">{char}</text>)}
      </svg>
      <figcaption>Увеличенный фрагмент оригинала</figcaption>
    </figure>
    <dl className={styles.instructions}>
      <div><dt>{p.state === "empty" ? "Почему пропустить" : "Что вводить и откуда взять"}</dt><dd>{p.field.meta.source}</dd></div>
      <div><dt>{p.field.kind === "signature" ? "Подпись на бумаге" : "Как писать"}</dt><dd>{p.field.meta.format}</dd></div>
    </dl>
    {p.touch ? <button type="button" className={styles.edit} onClick={onEdit}>{locked ? "Открыть пояснение" : "Ввести крупно"}</button> : <p className={styles.footer}>Клик по полю — {locked ? "подробное пояснение" : "ввод"}. <kbd>Esc</kbd> — скрыть.</p>}
  </aside>;
}
