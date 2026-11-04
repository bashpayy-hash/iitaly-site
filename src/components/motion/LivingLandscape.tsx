"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./MotionProvider";
import styles from "./living-landscape.module.css";

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
 * на телефонах — 640px-версия; за кадром пауза. Пока первый кадр не пошёл,
 * видео прозрачно, так что стык с картинкой не виден.
 */
export function LivingLandscape({ base, className = "", label }: {
  /** Общее начало путей: `${base}-1280.mp4|webm` для экранов шире 640px,
   *  `${base}-640.*` для телефонов. H.264 там, где он есть (Safari, Chrome),
   *  иначе VP9 (сборки Chromium без проприетарных кодеков). */
  base: string;
  /** классы раскладки той же картинки (inset, object-fit, object-position) */
  className?: string;
  label: string;
}) {
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = video.current;
    if (!node || reduced) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    let armed = false;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!armed) {
            armed = true;
            const format = node.canPlayType('video/mp4; codecs="avc1.640028"') ? "mp4" : "webm";
            node.src = `${base}-${window.innerWidth <= 640 ? 640 : 1280}.${format}`;
          }
          node.play().catch(() => {});
        } else if (armed) node.pause();
      }
    }, { rootMargin: "120px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, base]);

  // Пауза при включении «меньше движения»; onPause снимает проявление сам.
  useEffect(() => { if (reduced) video.current?.pause(); }, [reduced]);

  return <video ref={video} className={`${className} ${styles.motion} ${playing ? styles.playing : ""}`} muted loop playsInline preload="none"
    aria-hidden="true" tabIndex={-1} data-living-landscape={label} data-playing={playing || undefined}
    onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setPlaying(false)} />;
}
