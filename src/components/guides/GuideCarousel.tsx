"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import styles from "./guide-carousel.module.css";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Карусель по образцу галерей apple.com (owner, 3 Nov: «чтобы они были в ряд
   и шли друг за другом»): карточки идут в ряд от края до края экрана, первая
   стоит по колонке текста, соседние выглядывают по краям.
   - gallery: точки и кнопка ▶. Когда галерея на экране, карточки сами идут
     друг за другом (5 с на карточку, ход виден в активной точке); пауза, пока
     мышь или фокус на карточках; любое касание, колесо или точка — стоп.
     С prefers-reduced-motion сама не листается, но ▶ работает.
   - row: компактный ряд со стрелками «назад/вперёд» справа.
   - drift (owner, 4 Nov: «чтобы это всё передвигалось при наведении мышкой, а
     то выглядит довольно статично»): под мышью ряд плавно сдвигается в
     сторону курсора (до 28px), а вещь каждой карточки наклоняется за ним и
     приподнимается, чем ближе курсор. Переменные --drift, --lean-x, --lean-y
     и --near читает CSS карточек; касания, клавиатура и prefers-reduced-motion
     видят неподвижный ряд. */
export function GuideCarousel({ label, titles, variant = "row", autoplay = false, tone = "dark", fit = "window", drift = false, arrowLabels = ["Предыдущая тема", "Следующая тема"], children }: {
  label: string;
  titles: string[];
  variant?: "gallery" | "row";
  autoplay?: boolean;
  /** Surface under the controls: the dark guide band or the paper of a page. */
  tone?: "dark" | "light";
  /** Whole cards fill the window (guide band) or the column (topic steps). */
  fit?: "window" | "column";
  /** The row and its objects follow the mouse (guide band). */
  drift?: boolean;
  arrowLabels?: [string, string];
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const driftFrame = useRef(0);
  const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
  const onDrift = (x: number, y: number) => {
    const track = trackRef.current;
    if (!drift || !track || reducedMotion()) return;
    cancelAnimationFrame(driftFrame.current);
    driftFrame.current = requestAnimationFrame(() => {
      const box = track.getBoundingClientRect();
      track.style.setProperty("--drift", String(clamp(0.5 - (x - box.left) / box.width, 0.5) * 2));
      for (const slide of track.children as HTMLCollectionOf<HTMLElement>) {
        const rect = slide.getBoundingClientRect();
        const dx = (x - (rect.left + rect.width / 2)) / rect.width, dy = (y - (rect.top + rect.height / 2)) / rect.height;
        slide.style.setProperty("--lean-x", String(clamp(dx, 1.5)));
        slide.style.setProperty("--lean-y", String(clamp(dy, 1)));
        slide.style.setProperty("--near", String(Math.max(0, 1 - Math.abs(dx))));
      }
    });
  };
  const endDrift = () => {
    cancelAnimationFrame(driftFrame.current);
    const track = trackRef.current;
    if (!track) return;
    track.style.removeProperty("--drift");
    for (const slide of track.children as HTMLCollectionOf<HTMLElement>) for (const name of ["--lean-x", "--lean-y", "--near"]) slide.style.removeProperty(name);
  };
  useEffect(() => () => cancelAnimationFrame(driftFrame.current), []);
  // Card asked for by a dot, an arrow or autoplay. Wins over the scroll
  // position until the visitor scrolls the row themselves.
  const requested = useRef<number | null>(null);
  const started = useRef(false);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [hold, setHold] = useState({ hover: false, focus: false, offscreen: true, hidden: false });
  const count = titles.length;
  const held = hold.hover || hold.focus || hold.offscreen || hold.hidden;

  const positions = useCallback(() => {
    const track = trackRef.current;
    if (!track) return [];
    const slides = [...track.children] as HTMLElement[];
    const base = slides[0]?.offsetLeft ?? 0, max = track.scrollWidth - track.clientWidth;
    return slides.map(slide => Math.min(Math.max(slide.offsetLeft - base, 0), max));
  }, []);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const pos = positions(), x = track.scrollLeft, max = track.scrollWidth - track.clientWidth;
    let nearest = 0;
    pos.forEach((p, i) => { if (Math.abs(p - x) < Math.abs(pos[nearest] - x) - 1) nearest = i; });
    setActive(requested.current ?? nearest);
    setEdges({ start: x <= 1, end: x >= max - 1 });
  }, [positions]);

  // The row bleeds to the window edges; the first card keeps to the text column.
  useEffect(() => {
    const track = trackRef.current, root = rootRef.current;
    if (!track || !root) return;
    const measure = () => {
      const box = root.getBoundingClientRect(), width = document.documentElement.clientWidth;
      track.style.setProperty("--bleed-start", `${Math.max(0, box.left)}px`);
      track.style.setProperty("--bleed-end", `${Math.max(0, width - box.right)}px`);
      sync();
    };
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(sync); };
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    window.addEventListener("resize", measure);
    track.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => { resize.disconnect(); window.removeEventListener("resize", measure); track.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [sync]);

  // Autoplay starts once the gallery is on screen and holds while it is not.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || variant !== "gallery") return;
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      setHold(current => ({ ...current, offscreen: !visible }));
      if (visible && autoplay && !started.current && !reducedMotion()) { started.current = true; setPlaying(true); }
    }, { threshold: [0, 0.5] });
    observer.observe(root);
    const onVisibility = () => setHold(current => ({ ...current, hidden: document.hidden }));
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [autoplay, variant]);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(count - 1, index));
    requested.current = target;
    track.scrollTo({ left: positions()[target] ?? 0, behavior: reducedMotion() ? "auto" : "smooth" });
    setActive(target);
  }, [count, positions]);

  // Arrows move to the next card that actually changes the scroll position:
  // near the end several cards share the last position.
  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const pos = positions(), x = track.scrollLeft;
    let index = -1;
    pos.forEach((p, i) => { if (direction > 0 ? index < 0 && p > x + 1 : p < x - 1) index = i; });
    if (index >= 0) goTo(index);
  };
  // The visitor took the row: their scroll position decides, autoplay stops.
  const takeOver = () => { requested.current = null; setPlaying(false); };
  const advance = () => {
    if (active >= count - 1) { setPlaying(false); setEnded(true); }
    else goTo(active + 1);
  };
  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    if (ended || active >= count - 1) goTo(0);
    setEnded(false);
    setPlaying(true);
  };
  const playLabel = playing ? "Остановить прокрутку тем" : ended ? "Показать темы сначала" : "Листать темы автоматически";

  return <div ref={rootRef} className={styles.carousel} data-guide-carousel={variant} data-tone={tone} data-fit={fit} data-playing={playing || undefined} data-held={held || undefined}>
    <ul
      ref={trackRef}
      className={styles.track}
      aria-label={label}
      onPointerDown={takeOver}
      onTouchStart={takeOver}
      onKeyDown={takeOver}
      onWheel={event => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) takeOver(); }}
      onPointerEnter={event => { if (event.pointerType === "mouse") setHold(current => ({ ...current, hover: true })); }}
      onPointerMove={event => { if (event.pointerType === "mouse") onDrift(event.clientX, event.clientY); }}
      onPointerLeave={() => { endDrift(); setHold(current => ({ ...current, hover: false })); }}
      data-drift={drift || undefined}
      onFocus={() => { requested.current = null; setHold(current => ({ ...current, focus: true })); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHold(current => ({ ...current, focus: false })); }}
    >
      {children}
    </ul>
    {count > 1 && <div className={styles.controls} data-variant={variant}>
      {variant === "gallery" ? <>
        <div className={styles.dots} role="group" aria-label={`${label}: выбрать карточку`}>
          {titles.map((title, index) => <button
            key={title}
            type="button"
            className={styles.dot}
            data-carousel-dot={index}
            aria-label={`${index + 1} из ${count}: ${title}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => { setPlaying(false); setEnded(false); goTo(index); }}
          >
            {index === active && playing && <span key={`progress-${active}`} className={styles.progress} aria-hidden="true" onAnimationEnd={advance} />}
          </button>)}
        </div>
        <button type="button" className={styles.round} data-carousel-play aria-label={playLabel} onClick={togglePlay}>
          {playing ? <Pause size={18} aria-hidden="true" fill="currentColor" /> : ended ? <RotateCcw size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" fill="currentColor" />}
        </button>
      </> : <>
        <button type="button" className={styles.round} data-carousel-prev aria-label={arrowLabels[0]} disabled={edges.start} onClick={() => step(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
        <button type="button" className={styles.round} data-carousel-next aria-label={arrowLabels[1]} disabled={edges.end} onClick={() => step(1)}><ChevronRight size={20} aria-hidden="true" /></button>
      </>}
    </div>}
  </div>;
}
