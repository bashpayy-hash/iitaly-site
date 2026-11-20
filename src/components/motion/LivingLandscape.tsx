"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./MotionProvider";
import styles from "./living-landscape.module.css";

/**
 * Живой пейзаж (owner, 4 Nov: «заигрывать с пейзажами и Веспи — визитная
 * карточка сайта»): короткая видеопетля той же сцены, что и картинка под ней
 * (Higgsfield, design/illustrations/motion-*.json).
 *
 * Свет не меняется никогда (owner, 7, 8, 9 и 11 Nov: «резкая перемена света»;
 * 11 Nov: «на главной резко картинка светлеет, на „Опиши ситуацию“ резко белое
 * свечение темнеет — исправь раз и навсегда»). Что не сработало и почему:
 *
 * - 7 Nov — тег матрицы BT.709 в файлах. Теги верны (bt709 / sRGB / tv), но
 *   скачок остался.
 * - 8 Nov — медленный кроссфейд картинка → видео 2,4 с, `opacity: .999`
 *   против аппаратного overlay. Разница путей всё равно видна.
 * - 9 Nov — картинку над сгибом не показывать вовсе: ровный «средний цвет»
 *   сцены, потом за 450 мс видео. Этот цвет сам и стал скачком: на экране
 *   владельца (ASUS OLED, AMD, Chrome 157) в одном замере и одном кадрировании
 *   — заглушка Y 104, сцена Y 116; на /plan белая вуаль сначала лежала на
 *   ровном бежевом. Сами петли ровные: шаг кадр-к-кадру до 0,18/255.
 * - Разница видео и картинки на этом экране не подтверждена: замер «видео на
 *   5–7 уровней светлее» сравнивал разное кадрирование (у «меньше движения»
 *   нет масштаба 1.12) и снят; внутри одного окна картинка, холст и видео
 *   совпадают в пределах 0,3. Но на других видеокартах драйвер (overlay,
 *   «улучшение видео», RTX Video HDR) может менять видео, а картинку — нет.
 *
 * Поэтому `<video>` на экран не выходит никогда. Кадры петли рисуются в
 * `<canvas>`: холст браузер ведёт тем же путём, что и картинку (свой перевод
 * YUV → RGB, профиль экрана, без overlay). Картинка видна с первого кадра
 * страницы; холст ложится поверх неё первым кадром петли, который и есть эта
 * картинка (PSNR 36–41 дБ на всех четырёх сценах, 11 Nov), — подмены не
 * видно, свет один и тот же от начала до конца.
 *
 * Видео не показывается вовсе (`opacity: 0`), оно только источник кадров.
 * 11 Nov оно стояло под холстом видимым: я предположил, что невидимое видео
 * Chrome обновляет реже. Замер 12 Nov этого не подтвердил — кадры идут с
 * родной частотой и при нулевой прозрачности, — а видимое видео браузер
 * принимал за главный элемент страницы, и LCP кабинета ждал его загрузки.
 *
 * Петля не спорит с картинкой за канал (11 Nov, owner: «максимально
 * оптимизируй сайт»): раньше 200–400 КБ видео качались одновременно с главной
 * картинкой, и на медленной сети она появлялась позже (Lighthouse, телефон:
 * загрузка картинки главной 3,3 с). Поэтому видео ждало события load всей
 * страницы. Но load ждёт и всё остальное — другие картинки, шрифты, — и
 * сцена стояла картинкой лишние секунды (owner, 17 Nov: «анимации идут не
 * сразу и какое-то время просто стоят»). Теперь видео запрашивается, как
 * только пришла картинка этой сцены (её `<img>` рядом), или по load, если
 * он наступил раньше: картинка по-прежнему первая, но остальная страница
 * петлю больше не держит.
 *
 * Если автозапуск запрещён (режим энергосбережения iOS), петля начинается
 * с первого касания страницы: касание — это жест пользователя, после него
 * play() разрешён.
 *
 * «Меньше движения», Save-Data, сеть 2G и без JS — только картинка. За
 * экраном петля стоит на паузе на текущем кадре и продолжает с него.
 */
export function LivingLandscape({ base, className = "", label, widths = [640, 1280], webmWidths, startAt = 0 }: {
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
  /** Секунда петли, кадр которой и есть картинка-постер. По умолчанию 0.
   *  Нужна, когда шов петли лучше спрятать не на постере: в кабинете (owner,
   *  15 Nov: «анимация лагучая… стык был ровный») петля начинается и
   *  кончается на пустой дороге, где Chrome незаметно теряет кадр при
   *  перезапуске, а Веспи с постера стоит на 133-м кадре. Холст появляется
   *  только после перехода к этому кадру, поэтому смена постера на петлю
   *  по-прежнему не видна. */
  startAt?: number;
}) {
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // Строковые ключи: новый массив на каждом рендере не перезапускает эффект.
  const widthKey = widths.join(","), webmKey = (webmWidths ?? widths).join(",");

  useEffect(() => {
    const node = video.current;
    const paint = canvas.current;
    if (!node || !paint) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (reduced || connection?.saveData || /2g$/.test(connection?.effectiveType ?? "")) {
      node.pause();
      return;
    }
    const context = paint.getContext("2d");
    if (!context) return;

    const frameCallback = typeof node.requestVideoFrameCallback === "function";
    const box = node.getBoundingClientRect();
    let visible = box.bottom > 0 && box.top < window.innerHeight;
    const firstScreen = visible;
    let armed = false, shown = false, running = false, handle = 0;

    const draw = () => context.drawImage(node, 0, 0, paint.width, paint.height);
    const cancel = () => { if (frameCallback) node.cancelVideoFrameCallback(handle); else cancelAnimationFrame(handle); };
    const next = () => { handle = frameCallback ? node.requestVideoFrameCallback(tick) : requestAnimationFrame(tick); };
    function tick() {
      if (!running) return;
      try { draw(); } catch { hide(); return; }
      next();
    }
    let waitingForGesture = false;
    const onGesture = () => { waitingForGesture = false; start(); };
    const start = () => {
      if (!shown || running || !visible) return;
      running = true;
      // Автоплей запрещён (режим энергосбережения iOS) — на холсте остаётся
      // кадр-картинка, и это то же самое, что видит «меньше движения»; с
      // первым касанием страницы петля пробует ещё раз.
      node.play().catch(() => {
        running = false; cancel();
        if (!waitingForGesture) {
          waitingForGesture = true;
          window.addEventListener("pointerdown", onGesture, { once: true, passive: true });
        }
      });
      next();
    };
    const stop = () => { running = false; cancel(); node.pause(); };
    const hide = () => {
      stop();
      shown = false;
      delete paint.dataset.shown;
      delete node.dataset.shown;
    };
    const request = () => {
      const need = window.innerWidth <= 640 ? 0 : window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) * .8;
      const pick = (list: number[]) => list.find(width => width >= need) ?? list[list.length - 1];
      const list = (key: string) => key.split(",").map(Number);
      node.preload = "auto";
      node.src = node.canPlayType('video/mp4; codecs="avc1.640028"') ? `${base}-${pick(list(widthKey))}.mp4` : `${base}-${pick(list(webmKey))}.webm`;
    };
    // Картинка этой сцены — соседний <img> (постер); видео идёт сразу за ней.
    const poster = paint.parentElement?.querySelector("img");
    let requested = false;
    const requestOnce = () => { if (requested) return; requested = true; request(); };
    const load = () => {
      if (armed) return;
      armed = true;
      // Owner, 20 Nov: «чтобы анимации запускались сразу». A scene on the
      // first screen asks for its loop together with its picture instead of
      // after it: the picture shows at once either way, and the loop is ready
      // a picture-load sooner. Scenes further down still wait for theirs.
      if (firstScreen || document.readyState === "complete" || !poster || (poster.complete && poster.naturalWidth > 0)) { requestOnce(); return; }
      poster.addEventListener("load", requestOnce, { once: true });
      poster.addEventListener("error", requestOnce, { once: true });
      window.addEventListener("load", requestOnce, { once: true });
    };
    // Кадр-картинка готов: холст размером с кадр, кадр на холст, холст и
    // спрятанное под ним видео — в одной задаче, то есть в одном кадре экрана.
    let positioned = startAt <= 0;
    const reveal = () => {
      if (shown || !node.videoWidth) return;
      if (!positioned) {
        // Сначала к кадру-постеру; reveal вернётся по «seeked».
        positioned = true;
        node.addEventListener("seeked", reveal, { once: true });
        node.currentTime = startAt;
        return;
      }
      // Сервер без Range-запросов не даёт перемотать: тогда остаётся постер,
      // а не холст с другим кадром.
      if (startAt > 0 && Math.abs(node.currentTime - startAt) > .2) { hide(); return; }
      paint.width = node.videoWidth;
      paint.height = node.videoHeight;
      try { draw(); } catch { return; }
      shown = true;
      paint.dataset.shown = "";
      node.dataset.shown = "";
      start();
    };
    const onError = () => hide();
    node.addEventListener("loadeddata", reveal);
    node.addEventListener("error", onError);

    if (visible) load();
    // Загрузка — заранее, за полтора экрана; за экраном петля на паузе.
    const near = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) load(); }, { rootMargin: "150% 0px" });
    const seen = new IntersectionObserver(entries => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible) start(); else stop();
      }
    });
    near.observe(node);
    seen.observe(node);
    return () => {
      near.disconnect();
      seen.disconnect();
      window.removeEventListener("load", requestOnce);
      window.removeEventListener("pointerdown", onGesture);
      poster?.removeEventListener("load", requestOnce);
      poster?.removeEventListener("error", requestOnce);
      node.removeEventListener("loadeddata", reveal);
      node.removeEventListener("seeked", reveal);
      node.removeEventListener("error", onError);
      hide();
    };
  }, [reduced, base, widthKey, webmKey, startAt]);

  return <>
    <video ref={video} className={`${className} ${styles.source}`} muted loop playsInline preload="none"
      aria-hidden="true" tabIndex={-1} data-living-landscape={label} />
    <canvas ref={canvas} className={`${className} ${styles.paint}`} aria-hidden="true" data-living-canvas={label} />
  </>;
}
