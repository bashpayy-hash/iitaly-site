"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./MotionProvider";
import styles from "./living-landscape.module.css";

/** Сколько сцена над сгибом ждёт первый кадр видео, прежде чем показать картинку. */
const HOLD_MS = 1400;

type LivingState = "hold" | "still" | "video";

/**
 * Живой пейзаж (owner, 4 Nov: «заигрывать с пейзажами и Веспи — визитная
 * карточка сайта»): поверх картинки сцены — короткая видеопетля той же сцены
 * (Higgsfield, design/illustrations/motion-*.json). Картинка остаётся в DOM:
 * её видят «меньше движения», Save-Data, браузеры без автоплея и без JS.
 *
 * Свет не меняется на глазах (owner, 7–9 Nov: «резкая перемена света, что
 * на главной, что на „Опиши ситуацию“»). Картинку и видео браузер выводит
 * разными путями: на Windows видео часто проходит через видеопроцессор
 * видеокарты, где драйвер (адаптивный контраст, «улучшение видео», RTX HDR)
 * меняет яркость и цвет, а картинку — нет. Никакой кроссфейд это не прячет.
 * Поэтому источник никогда не меняется, пока сцена на экране:
 *
 * - Сцена над сгибом (родитель рендерит её с `data-living="hold"`): до
 *   первого кадра видео в плитке ровный цвет сцены, затем за 450 мс
 *   проявляется сразу видео. Картинку человек на экране не видит вовсе.
 *   Если видео не пришло за 1,4 с, проявляется картинка.
 * - Остальные сцены показывают картинку, видео грузится заранее (за полтора
 *   экрана) и подменяет её, только пока сцена за экраном.
 *
 * Состояние пишется в `data-living` родителя: CSS родителя прячет или
 * показывает свою картинку, CSS этого модуля — видео. За кадром видео стоит
 * на паузе на текущем кадре, при возвращении продолжает с него.
 */
export function LivingLandscape({ base, className = "", label, widths = [640, 1280], webmWidths }: {
  /** Общее начало путей: `${base}-<ширина>.mp4|webm`. H.264 там, где он есть
   *  (Safari, Chrome), иначе VP9 (сборки Chromium без проприетарных кодеков). */
  base: string;
  /** Ширины файлов по возрастанию. Телефон (до 640px) берёт самую узкую,
   *  остальные — первую, что покрывает ширину окна × плотность пикселей
   *  (до 2×, с запасом 20%), иначе самую широкую (owner, 6 Nov: «картинки
   *  ниже качеством, чем остальной сайт»). */
  widths?: number[];
  /** Ширины VP9-версий, если они есть не для всех `widths`. */
  webmWidths?: number[];
  /** классы раскладки той же картинки (inset, object-fit, object-position) */
  className?: string;
  label: string;
}) {
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  // Строковые ключи: новый массив на каждом рендере не перезапускает эффект.
  const widthKey = widths.join(","), webmKey = (webmWidths ?? widths).join(",");

  useEffect(() => {
    const node = video.current;
    const scene = node?.parentElement;
    if (!node || !scene) return;
    const held = scene.dataset.living === "hold";
    const settle = (state: LivingState, fade: boolean) => {
      scene.dataset.living = state;
      if (fade) scene.dataset.livingFade = ""; else delete scene.dataset.livingFade;
      if (state === "video") node.dataset.playing = "true"; else delete node.dataset.playing;
    };
    const restore = () => { if (held) scene.dataset.living = "hold"; else delete scene.dataset.living; delete scene.dataset.livingFade; delete node.dataset.playing; };
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduced || connection?.saveData) {
      node.pause();
      settle("still", false);
      return restore;
    }

    const box = node.getBoundingClientRect();
    let visible = box.bottom > 0 && box.top < window.innerHeight;
    let armed = false, ready = false, swapped = false, holding = held;
    let holdTimer: number | undefined;

    const load = () => {
      if (armed) return;
      armed = true;
      const need = window.innerWidth <= 640 ? 0 : window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) * .8;
      const pick = (list: number[]) => list.find(width => width >= need) ?? list[list.length - 1];
      const list = (key: string) => key.split(",").map(Number);
      node.preload = "auto";
      node.src = node.canPlayType('video/mp4; codecs="avc1.640028"') ? `${base}-${pick(list(widthKey))}.mp4` : `${base}-${pick(list(webmKey))}.webm`;
    };
    const swap = (fade: boolean) => {
      swapped = true;
      settle("video", fade);
      if (visible) node.play().catch(() => {});
    };
    const onFirstFrame = () => {
      if (ready) return;
      ready = true;
      if (holding) { holding = false; window.clearTimeout(holdTimer); swap(true); }
      else if (!visible) swap(false);
    };
    const onError = () => {
      if (holding) { holding = false; window.clearTimeout(holdTimer); }
      swapped = false;
      settle("still", visible);
    };
    node.addEventListener("loadeddata", onFirstFrame);
    node.addEventListener("error", onError);

    if (held) {
      holdTimer = window.setTimeout(() => {
        if (!holding) return;
        holding = false;
        settle("still", true);
      }, HOLD_MS);
      load();
      if (node.readyState >= 2) onFirstFrame();
    } else settle("still", false);

    // Загрузка — заранее, за полтора экрана; подмена — только вне экрана.
    const near = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) load(); }, { rootMargin: "150% 0px" });
    const seen = new IntersectionObserver(entries => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (swapped) {
          if (visible) node.play().catch(() => {}); else node.pause();
        } else if (!visible && ready && !holding) swap(false);
      }
    });
    near.observe(node);
    seen.observe(node);
    return () => {
      near.disconnect();
      seen.disconnect();
      node.removeEventListener("loadeddata", onFirstFrame);
      node.removeEventListener("error", onError);
      window.clearTimeout(holdTimer);
      node.pause();
      restore();
    };
  }, [reduced, base, widthKey, webmKey]);

  return <video ref={video} className={`${className} ${styles.motion}`} muted loop playsInline preload="none"
    aria-hidden="true" tabIndex={-1} data-living-landscape={label} />;
}
