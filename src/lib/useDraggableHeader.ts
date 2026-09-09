"use client";

// Портировано из старого сайта (index.html, IIFE «Перетаскивание окна чата»):
// движение 1:1 с указателем, на границах экрана — упругое сопротивление
// вместо жёсткого стопа, после отпускания — инерция с проекцией точки
// остановки и пружинным приземлением (через Motion).

import { useEffect, useRef } from "react";
import { animate } from "motion";

const MARGIN = 6;

function rubber(over: number, dim: number, c = 0.55) {
  return (over * dim * c) / (dim + c * Math.abs(over));
}

function project(v: number, rate = 0.998) {
  return (v / 1000) * (rate / (1 - rate));
}

export function useDraggableHeader(
  panelRef: React.RefObject<HTMLElement | null>,
  headRef: React.RefObject<HTMLElement | null>,
  // panel/head mount conditionally (e.g. only while a chat panel is open),
  // so a plain [panelRef, headRef] dependency array never re-fires this
  // effect: ref *objects* keep the same identity across renders even
  // though .current only gets populated later. Callers must pass a value
  // that actually changes when the elements mount (e.g. the `open` flag),
  // so the effect re-runs and finds real nodes instead of the initial nulls.
  active: unknown,
) {
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const base = useRef({ x: 0, y: 0 });
  const hist = useRef<{ x: number; y: number; t: number }[]>([]);
  const positioned = useRef(false);

  useEffect(() => {
    const panel = panelRef.current;
    const head = headRef.current;
    if (!panel || !head) return;

    function box() {
      const r = panel!.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }
    function bounds() {
      const p = box();
      return {
        minX: MARGIN,
        minY: MARGIN,
        maxX: Math.max(MARGIN, window.innerWidth - p.w - MARGIN),
        maxY: Math.max(MARGIN, window.innerHeight - p.h - MARGIN),
      };
    }
    function clampSoft(x: number, y: number) {
      const b = bounds();
      if (x < b.minX) x = b.minX - rubber(b.minX - x, window.innerWidth);
      if (x > b.maxX) x = b.maxX + rubber(x - b.maxX, window.innerWidth);
      if (y < b.minY) y = b.minY - rubber(b.minY - y, window.innerHeight);
      if (y > b.maxY) y = b.maxY + rubber(y - b.maxY, window.innerHeight);
      return { x, y };
    }
    function put(x: number, y: number) {
      panel!.style.left = `${x}px`;
      panel!.style.top = `${y}px`;
      panel!.style.right = "auto";
      panel!.style.bottom = "auto";
      positioned.current = true;
    }

    function down(e: PointerEvent) {
      if ((e.target as HTMLElement).closest(".chp-close")) return;
      const p = box();
      dragging.current = true;
      start.current = { x: e.clientX, y: e.clientY };
      base.current = { x: p.x, y: p.y };
      hist.current = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
      put(p.x, p.y);
      // Capture must go on the element the move/up listeners are actually
      // bound to (head). head is a descendant of panel, so capturing on
      // panel would retarget events to panel and bubble from there — never
      // reaching head's listeners, which live further down the tree.
      head!.setPointerCapture(e.pointerId);
      panel!.classList.add("dragging");
    }
    function move(e: PointerEvent) {
      if (!dragging.current) return;
      const now = performance.now();
      hist.current.push({ x: e.clientX, y: e.clientY, t: now });
      if (hist.current.length > 6) hist.current.shift();
      const pos = clampSoft(base.current.x + (e.clientX - start.current.x), base.current.y + (e.clientY - start.current.y));
      put(pos.x, pos.y);
    }
    function up() {
      if (!dragging.current) return;
      dragging.current = false;
      panel!.classList.remove("dragging");

      const h = hist.current;
      const last = h[h.length - 1];
      const first = h[0];
      const dt = last && first ? last.t - first.t : 0;
      let vx = 0;
      let vy = 0;
      if (dt > 8) {
        vx = ((last.x - first.x) / dt) * 1000;
        vy = ((last.y - first.y) / dt) * 1000;
      }

      const p = box();
      const b = bounds();
      const tx = Math.min(b.maxX, Math.max(b.minX, p.x + project(vx)));
      const ty = Math.min(b.maxY, Math.max(b.minY, p.y + project(vy)));

      if (Math.abs(tx - p.x) < 0.5 && Math.abs(ty - p.y) < 0.5) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        put(tx, ty);
        return;
      }
      const flick = Math.hypot(vx, vy) > 300;
      animate(
        panel!,
        { left: `${tx}px`, top: `${ty}px` },
        { type: "spring", bounce: flick ? 0.18 : 0, duration: 0.45 },
      );
    }

    head.addEventListener("pointerdown", down);
    head.addEventListener("pointermove", move);
    head.addEventListener("pointerup", up);
    head.addEventListener("pointercancel", up);

    function onDblClick() {
      panel!.style.left = "";
      panel!.style.top = "";
      panel!.style.right = "";
      panel!.style.bottom = "";
      positioned.current = false;
    }
    head.addEventListener("dblclick", onDblClick);

    function onResize() {
      if (!positioned.current) return;
      const p = box();
      const b = bounds();
      put(Math.min(b.maxX, Math.max(b.minX, p.x)), Math.min(b.maxY, Math.max(b.minY, p.y)));
    }
    window.addEventListener("resize", onResize);

    return () => {
      head.removeEventListener("pointerdown", down);
      head.removeEventListener("pointermove", move);
      head.removeEventListener("pointerup", up);
      head.removeEventListener("pointercancel", up);
      head.removeEventListener("dblclick", onDblClick);
      window.removeEventListener("resize", onResize);
    };
  }, [panelRef, headRef, active]);
}
