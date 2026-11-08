"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./MotionProvider";
import styles from "./living-landscape.module.css";

/** Длительность проявления первого кадра поверх картинки (как в CSS). */
const REVEAL_MS = 2400;

/**
 * Живой пейзаж (owner, 4 Nov: «заигрывать с пейзажами и Веспи — визитная
 * карточка сайта»). Поверх статичной картинки сцены лежит короткая
 * видеопетля той же сцены (Higgsfield image-to-video, пинг-понг, без звука,
 * design/illustrations/motion-2026-11-04.json): плащ Веспи шевелится на
 * ветру, трава и кипарисы качаются, облака плывут над Флоренцией.
 *
 * Картинка остаётся в DOM и грузится первой — она и постер, и единственное,
 * что видят prefers-reduced-motion, экономия трафика (Save-Data) и браузеры
 * без автоплея. Видео подхватывается только когда плитка в зоне видимости,
 * на телефонах — 960px-версия; за кадром пауза. Пока первый кадр не пошёл,
 * видео прозрачно, так что стык с картинкой не виден.
 *
 * Свет не прыгает (owner, 7 Nov: «освещение резко меняется просто так»):
 * картинка — это первый кадр петли, а неподвижная часть каждого кадра взята
 * из той же картинки, двигаются только Веспи, листва и фонари
 * (design/illustrations/motion-2026-11-07b.json). Файлы помечены BT.709 с
 * кривой sRGB, поэтому Chrome и Safari выводят их тем же цветом, что и WebP.
 * Проявившись один раз, видео остаётся поверх картинки и на паузе: за кадром
 * оно просто стоит на текущем кадре, и при возвращении нет второго перехода.
 */
export function LivingLandscape({ base, className = "", label, widths = [640, 1280], webmWidths }: {
  /** Общее начало путей: `${base}-<ширина>.mp4|webm`. H.264 там, где он есть
   *  (Safari, Chrome), иначе VP9 (сборки Chromium без проприетарных кодеков). */
  base: string;
  /** Ширины файлов по возрастанию. Телефон (до 640px) берёт самую узкую,
   *  остальные — первую, что покрывает ширину окна × плотность пикселей
   *  (до 2×, с запасом 20%), иначе самую широкую: на ноутбуке с масштабом
   *  125% петля не растягивается из 1280px (owner, 6 Nov: «картинки ниже
   *  качеством, чем остальной сайт»). */
  widths?: number[];
  /** Ширины VP9-версий, если они есть не для всех `widths`. */
  webmWidths?: number[];
  /** классы раскладки той же картинки (inset, object-fit, object-position) */
  className?: string;
  label: string;
}) {
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  // shown — первый кадр уже на экране и проявляется поверх картинки.
  const [shown, setShown] = useState(false);
  // Строковые ключи: новый массив на каждом рендере не перезапускает эффект.
  const widthKey = widths.join(","), webmKey = (webmWidths ?? widths).join(",");

  /* Свет не меняется (owner, 8 Nov: «всё ещё резкая перемена света, что на
     главной, что на /plan»). Раньше видео проявлялось уже на ходу: за 900 мс
     поверх неподвижной картинки двигался полупрозрачный Веспи, а любое
     расхождение цветового конвейера картинки и видео (у GPU с аппаратным
     декодированием и HDR оно заметнее, чем у headless-замеров) читалось как
     скачок освещения. Теперь видео сначала стоит на первом кадре — он и есть
     постер, — проявляется за 2,4 с из неподвижного в неподвижное и только
     потом запускается. Разницу в доли процента глаз за это время не ловит. */
  useEffect(() => {
    const node = video.current;
    if (!node || reduced) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    let armed = false, visible = false, revealed = false, timer: number | undefined;
    const start = () => { if (visible && revealed) node.play().catch(() => {}); };
    const onFirstFrame = () => {
      if (revealed) return;
      revealed = true;
      setShown(true);
      timer = window.setTimeout(start, REVEAL_MS + 100);
    };
    node.addEventListener("loadeddata", onFirstFrame);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible) {
          if (!armed) {
            armed = true;
            const need = window.innerWidth <= 640 ? 0 : window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) * .8;
            const pick = (list: number[]) => list.find(width => width >= need) ?? list[list.length - 1];
            const list = (key: string) => key.split(",").map(Number);
            node.preload = "auto";
            node.src = node.canPlayType('video/mp4; codecs="avc1.640028"') ? `${base}-${pick(list(widthKey))}.mp4` : `${base}-${pick(list(webmKey))}.webm`;
            if (node.readyState >= 2) onFirstFrame();
          } else start();
        } else if (armed) node.pause();
      }
    }, { rootMargin: "120px 0px" });
    observer.observe(node);
    return () => { observer.disconnect(); node.removeEventListener("loadeddata", onFirstFrame); window.clearTimeout(timer); };
  }, [reduced, base, widthKey, webmKey]);

  // «Меньше движения»: пауза и обратно к картинке (CSS тоже прячет видео).
  useEffect(() => { if (reduced) video.current?.pause(); }, [reduced]);
  const visible = shown && !reduced;

  return <video ref={video} className={`${className} ${styles.motion} ${visible ? styles.playing : ""}`} muted loop playsInline preload="none"
    aria-hidden="true" tabIndex={-1} data-living-landscape={label} data-playing={visible || undefined}
    onPlaying={() => setShown(true)} onError={() => setShown(false)} />;
}
