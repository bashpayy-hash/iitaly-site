"use client";

import { useEffect, useRef } from "react";

/**
 * Фото побережья превращается в узор из тонких вертикальных линий:
 * плотность/длина/разрывы каждой линии зависят от яркости фотографии в
 * этой точке (просчитано на canvas, не CSS-паттерн поверх картинки).
 * При появлении в вьюпорте — one-shot реveal слева направо с волной по
 * фронту; дальше — едва заметное дыхание узора, пока секция в вьюпорте.
 *
 * Цвета — токены дизайн-системы (--color-warn / --color-cream), взятые
 * через getComputedStyle с hex-фолбэком на случай, если переменная
 * почему-то не резолвится в момент инициализации.
 */

const IMAGE_SRC = "/positano.jpg";
const IMAGE_ALT =
  "Позитано на Амальфитанском побережье Италии: разноцветные дома на скалах над морем";

const LINE_HEX = "#b25000"; // --color-warn
const BG_HEX = "#faf5ec"; // --color-cream

const COLUMN_SPACING = 4; // px между линиями
const ROW_STEP = 4; // px шаг сэмплирования по высоте
const REVEAL_MS = 2100;
const WAVE_AMPLITUDE = 46; // px, изгиб фронта реveal'а
const WAVE_FREQ = 0.012; // рад/px по Y
const IDLE_AMPLITUDE = 1.1; // px, дыхание после реveal'а
const IDLE_SPEED = 0.00045; // рад/мс

function resolveColor(varName: string, fallbackHex: string) {
  if (typeof window === "undefined") return fallbackHex;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallbackHex;
}

export function PositanoReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<HTMLCanvasElement | null>(null); // offscreen: полностью проявленный узор
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const revealedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const revealStartRef = useRef<number | null>(null);
  const idleActiveRef = useRef(false);
  const readyRef = useRef(false);
  const colorsRef = useRef({ line: LINE_HEX, bg: BG_HEX });

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!section || !img || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    colorsRef.current = {
      line: resolveColor("--color-warn", LINE_HEX),
      bg: resolveColor("--color-cream", BG_HEX),
    };

    function sizeCanvas() {
      if (!canvas || !section) return;
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    }

    // Строит offscreen-канвас с полностью проявленным узором линий,
    // просэмплированным из фотографии по luminance с cover-кропом
    // под текущие пропорции секции.
    function buildTarget(): HTMLCanvasElement | null {
      if (!img || !img.complete || img.naturalWidth === 0) return null;
      const { w, h, dpr } = sizeRef.current;
      if (w < 4 || h < 4) return null;

      const numCols = Math.max(8, Math.round(w / COLUMN_SPACING));
      const numRows = Math.max(8, Math.round(h / ROW_STEP));

      // cover-кроп: какая область фото видна в рамке w×h
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const drawnW = img.naturalWidth * scale;
      const drawnH = img.naturalHeight * scale;
      const offsetX = (w - drawnW) / 2;
      const offsetY = (h - drawnH) / 2;
      const srcX = Math.max(0, -offsetX / scale);
      const srcY = Math.max(0, -offsetY / scale);
      const srcW = Math.min(img.naturalWidth - srcX, w / scale);
      const srcH = Math.min(img.naturalHeight - srcY, h / scale);

      const sample = document.createElement("canvas");
      sample.width = numCols;
      sample.height = numRows;
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) return null;
      sctx.imageSmoothingEnabled = true;
      sctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, numCols, numRows);
      let data: Uint8ClampedArray;
      try {
        data = sctx.getImageData(0, 0, numCols, numRows).data;
      } catch {
        return null; // canvas tainted (не должно случиться для same-origin ассета)
      }

      const target = document.createElement("canvas");
      target.width = Math.round(w * dpr);
      target.height = Math.round(h * dpr);
      const tctx = target.getContext("2d");
      if (!tctx) return null;
      tctx.scale(dpr, dpr);
      tctx.fillStyle = colorsRef.current.line;

      const colStep = w / numCols;
      const rowStep = h / numRows;

      for (let cx = 0; cx < numCols; cx++) {
        const x = cx * colStep;
        for (let ry = 0; ry < numRows; ry++) {
          const idx = (ry * numCols + cx) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          if (lum > 236) continue; // яркое небо/блики — настоящий разрыв
          const alpha = Math.min(0.92, Math.max(0.08, 1 - lum / 232));
          const y = ry * rowStep;
          tctx.globalAlpha = alpha;
          tctx.fillRect(x, y, Math.max(1, colStep * 0.62), rowStep * 0.92);
        }
      }
      tctx.globalAlpha = 1;
      return target;
    }

    function drawIdleFrame(now: number) {
      if (!ctx || !targetRef.current) return;
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const offset = Math.sin(now * IDLE_SPEED) * IDLE_AMPLITUDE;
      ctx.drawImage(targetRef.current, 0, offset, targetRef.current.width / dpr, targetRef.current.height / dpr);
    }

    function drawRevealFrame(elapsed: number) {
      if (!ctx || !targetRef.current) return;
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const progress = Math.min(1, elapsed / REVEAL_MS);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const sweepX = -WAVE_AMPLITUDE + eased * (w + WAVE_AMPLITUDE * 2);

      ctx.save();
      ctx.beginPath();
      const rowStep = 8;
      ctx.moveTo(-4, -4);
      for (let y = -4; y <= h + 4; y += rowStep) {
        const bx = sweepX + Math.sin(y * WAVE_FREQ + progress * 2) * WAVE_AMPLITUDE * (1 - progress * 0.35);
        ctx.lineTo(bx, y);
      }
      ctx.lineTo(-4, h + 4);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(targetRef.current, 0, 0, targetRef.current.width / dpr, targetRef.current.height / dpr);
      ctx.restore();

      if (progress < 1) {
        rafRef.current = requestAnimationFrame((t) => {
          if (revealStartRef.current == null) revealStartRef.current = t;
          drawRevealFrame(t - revealStartRef.current);
        });
      } else {
        revealedRef.current = true;
        startIdleLoop();
      }
    }

    function startIdleLoop() {
      if (reducedMotion || idleActiveRef.current) return;
      idleActiveRef.current = true;
      let last = 0;
      const loop = (t: number) => {
        if (!idleActiveRef.current) return;
        // троттлинг: обновляем не чаще ~12 раз в секунду — движение и так
        // едва заметное, чаще перерисовывать нет смысла
        if (t - last > 80) {
          last = t;
          drawIdleFrame(t);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    function stopLoop() {
      idleActiveRef.current = false;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    function drawStaticFinal() {
      if (!ctx) return;
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (targetRef.current) {
        ctx.drawImage(targetRef.current, 0, 0, targetRef.current.width / dpr, targetRef.current.height / dpr);
      }
      revealedRef.current = true;
    }

    function rebuild(replay: boolean) {
      sizeCanvas();
      const target = buildTarget();
      if (!target) return;
      targetRef.current = target;
      readyRef.current = true;

      if (reducedMotion) {
        drawStaticFinal();
        return;
      }
      if (replay && !revealedRef.current) {
        stopLoop();
        revealStartRef.current = null;
        rafRef.current = requestAnimationFrame((t) => {
          revealStartRef.current = t;
          drawRevealFrame(0);
        });
      } else if (revealedRef.current) {
        drawStaticFinal();
        startIdleLoop();
      }
    }

    let resizeTimer: number | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => rebuild(false), 150);
    });
    ro.observe(section);

    let isIntersecting = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          if (!readyRef.current) {
            rebuild(true);
          } else if (revealedRef.current) {
            startIdleLoop();
          }
        } else {
          stopLoop();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(section);

    // Фото могло догрузиться уже после того, как секция попала в вьюпорт
    // (buildTarget тогда ничего не строит) — доcтраиваем узор, как только
    // пиксели фото стали доступны.
    function onImgReady() {
      if (isIntersecting && !readyRef.current) rebuild(true);
    }
    if (!img.complete) img.addEventListener("load", onImgReady, { once: true });

    return () => {
      stopLoop();
      ro.disconnect();
      io.disconnect();
      if (resizeTimer) window.clearTimeout(resizeTimer);
      img.removeEventListener("load", onImgReady);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative aspect-[21/10] w-full overflow-hidden border-b-2 border-ink bg-cream sm:aspect-[21/9]"
    >
      {/* Реальное фото: источник пикселей для анализа + доступный fallback
         (alt-текст, показывается если JS/canvas недоступны). */}
      <img
        ref={imgRef}
        src={IMAGE_SRC}
        alt={IMAGE_ALT}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full bg-cream"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-8">
        <p className="text-xs font-extrabold tracking-[0.16em] text-ink-soft uppercase">
          Позитано · Амальфитанское побережье
        </p>
      </div>
    </section>
  );
}
