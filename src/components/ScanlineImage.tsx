"use client";

import { useEffect, useRef } from "react";

/**
 * Фото превращается в узор из тонких вертикальных линий: плотность/цвет/
 * прозрачность каждой линии зависят от яркости фотографии в этой точке
 * (просчитано на canvas по пикселям, не CSS-паттерн поверх картинки).
 * При появлении в вьюпорте — one-shot reveal слева направо с волной по
 * фронту; дальше — едва заметное дыхание узора, пока секция в вьюпорте.
 * Реализация — Canvas 2D, а не WebGL: пиксели фото читаются один раз при
 * построении, дальше на каждый кадр — ровно один drawImage() через
 * clip-path, этого достаточно для 60fps без шейдеров.
 *
 * Извлечён из первой версии (см. git-историю PositanoReveal.tsx) в общий
 * компонент, чтобы тот же приём мог применяться к другим изображениям.
 */

export interface ScanlineImageProps {
  src: string;
  alt: string;
  className?: string;
  /** CSS aspect-ratio строкой, напр. "600/1075". */
  aspectRatio: string;
  /** Цвета — CSS custom property + hex-фолбэк, если переменная не резолвится. */
  lineVar?: string;
  lineHex?: string;
  lineDeepVar?: string;
  lineDeepHex?: string;
  lineLightVar?: string;
  lineLightHex?: string;
  bgVar?: string;
  bgHex?: string;
  columnSpacing?: number;
  rowStep?: number;
  revealMs?: number;
}

const DEFAULTS = {
  lineVar: "--color-warn",
  lineHex: "#b25000",
  lineDeepVar: "--color-warn-deep",
  lineDeepHex: "#7a3600",
  lineLightVar: "--color-warn-light",
  lineLightHex: "#c97a2e",
  bgVar: "--color-cream",
  bgHex: "#faf5ec",
  columnSpacing: 3,
  rowStep: 3,
  revealMs: 2100,
};

const WAVE_AMPLITUDE = 46; // px, изгиб фронта реveal'а
const WAVE_FREQ = 0.012; // рад/px по Y
const IDLE_AMPLITUDE = 1.1; // px, дыхание после реveal'а
const IDLE_SPEED = 0.00045; // рад/мс

function resolveColor(varName: string, fallbackHex: string) {
  if (typeof window === "undefined") return fallbackHex;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallbackHex;
}

export function ScanlineImage({
  src,
  alt,
  className = "",
  aspectRatio,
  lineVar = DEFAULTS.lineVar,
  lineHex = DEFAULTS.lineHex,
  lineDeepVar = DEFAULTS.lineDeepVar,
  lineDeepHex = DEFAULTS.lineDeepHex,
  lineLightVar = DEFAULTS.lineLightVar,
  lineLightHex = DEFAULTS.lineLightHex,
  bgVar = DEFAULTS.bgVar,
  bgHex = DEFAULTS.bgHex,
  columnSpacing = DEFAULTS.columnSpacing,
  rowStep = DEFAULTS.rowStep,
  revealMs = DEFAULTS.revealMs,
}: ScanlineImageProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<HTMLCanvasElement | null>(null); // offscreen: полностью проявленный узор
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const revealedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const revealStartRef = useRef<number | null>(null);
  const idleActiveRef = useRef(false);
  const revealStartedRef = useRef(false); // one-shot reveal уже запущен (идёт или закончен)
  const pendingRevealRef = useRef(false); // секция уже видна, но фото/размер ещё не были готовы
  const colorsRef = useRef({ line: lineHex, lineDeep: lineDeepHex, lineLight: lineLightHex, bg: bgHex });

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!section || !img || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    colorsRef.current = {
      line: resolveColor(lineVar, lineHex),
      lineDeep: resolveColor(lineDeepVar, lineDeepHex),
      lineLight: resolveColor(lineLightVar, lineLightHex),
      bg: resolveColor(bgVar, bgHex),
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

      const numCols = Math.max(8, Math.round(w / columnSpacing));
      const numRows = Math.max(8, Math.round(h / rowStep));

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

      const colStep = w / numCols;
      const rStep = h / numRows;
      const { lineDeep, line, lineLight } = colorsRef.current;

      for (let cx = 0; cx < numCols; cx++) {
        const x = cx * colStep;
        for (let ry = 0; ry < numRows; ry++) {
          const idx = (ry * numCols + cx) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          if (lum > 232) continue; // яркое небо/блики — настоящий разрыв

          // t=0 у самых тёмных пятен фото, t=1 у самых светлых (но ещё не
          // разрыв) — по нему одновременно гоним и цвет (deep→line→light),
          // и alpha, с гамма-кривой для более контрастного, "печатного" вида.
          const t = Math.min(1, Math.max(0, lum / 232));
          tctx.fillStyle = t < 0.45 ? lineDeep : t < 0.8 ? line : lineLight;
          const alpha = Math.min(0.95, Math.max(0.06, Math.pow(1 - t, 1.5)));
          const y = ry * rStep;
          tctx.globalAlpha = alpha;
          tctx.fillRect(x, y, Math.max(1, colStep * 0.48), rStep * 0.94);
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

      const progress = Math.min(1, elapsed / revealMs);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const sweepX = -WAVE_AMPLITUDE + eased * (w + WAVE_AMPLITUDE * 2);

      ctx.save();
      ctx.beginPath();
      const stepY = 8;
      ctx.moveTo(-4, -4);
      for (let y = -4; y <= h + 4; y += stepY) {
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

    function startReveal() {
      revealStartedRef.current = true;
      if (reducedMotion) {
        drawStaticFinal();
        return;
      }
      stopLoop();
      revealStartRef.current = null;
      rafRef.current = requestAnimationFrame((t) => {
        revealStartRef.current = t;
        drawRevealFrame(0);
      });
    }

    // Строит/обновляет offscreen-таргет под текущий размер секции. Сам по
    // себе НЕ решает, показывать ли reveal — только держит узор свежим.
    // Триггер reveal'а — исключительно intersection (см. io ниже), плюс
    // догон здесь же, если видимость уже наступила раньше, чем фото/размер
    // стали готовы.
    function rebuild() {
      sizeCanvas();
      const target = buildTarget();
      if (!target) return;
      targetRef.current = target;

      if (pendingRevealRef.current && !revealStartedRef.current) {
        pendingRevealRef.current = false;
        startReveal();
      } else if (revealedRef.current) {
        drawStaticFinal();
        if (isIntersecting) startIdleLoop();
      }
    }

    let resizeTimer: number | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 150);
    });
    ro.observe(section);

    let isIntersecting = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          if (!revealStartedRef.current) {
            if (targetRef.current) {
              startReveal();
            } else {
              pendingRevealRef.current = true;
            }
          } else if (revealedRef.current) {
            startIdleLoop();
          }
        } else {
          stopLoop();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(section);

    // Фото могло догрузиться уже после того, как секция попала в вьюпорт
    // (buildTarget тогда ничего не строит) — доcтраиваем узор, как только
    // пиксели фото стали доступны.
    function onImgReady() {
      rebuild();
    }
    if (!img.complete) img.addEventListener("load", onImgReady, { once: true });

    return () => {
      stopLoop();
      ro.disconnect();
      io.disconnect();
      if (resizeTimer) window.clearTimeout(resizeTimer);
      img.removeEventListener("load", onImgReady);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div ref={sectionRef} className={`relative w-full overflow-hidden bg-cream ${className}`} style={{ aspectRatio }}>
      {/* Реальное фото: источник пикселей для анализа + доступный fallback
         (alt-текст, показывается если JS/canvas недоступны). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full bg-cream" />
    </div>
  );
}
