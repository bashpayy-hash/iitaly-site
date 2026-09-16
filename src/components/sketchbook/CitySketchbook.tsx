"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PLATES } from "@/data/sketchbook";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { track } from "@/lib/track";
import s from "./CitySketchbook.module.css";

/**
 * Скетчбук городов: развороты с бумажными иллюстрациями, которые
 * перелистываются с настоящим изгибом бумаги, лупа и зум.
 *
 * Геометрия и физика перенесены из авторского исходника ThreeUI
 * (meng-to-sketchbook.html, SHA-256 e0330548b1ac…, сверен байт-в-байт по
 * хэшу из брифа; исходник взят из пакета @designcodeio/threeui в
 * npm-реестре — сайт threeui.com закрыт сетевой политикой окружения).
 * Лицензия MIT, копия рядом: LICENSE-threeui.txt. Содержимое — наше: итальянские города
 * вместо сингапурских, наши иллюстрации, наши токены. Сам авторский
 * документ не встраивается: это личное портфолио другого человека с его
 * именем, биографией и почтой, и ему нечего делать в разделе карты вузов.
 *
 * Что именно взято у автора, чтобы не изобретать заново:
 *  · лист — цепочка из N вложенных полос, каждая довёрнута на --td;
 *    сумма углов даёт дугу, а не поворот плоской дверцы на петле;
 *  · лицо и изнанка полосы — куски одной картинки, сдвинутые по X ровно
 *    на свою ширину, поэтому изображение не рвётся на стыках;
 *  · освещение по косинусу угла полосы, отдельно для ближнего и дальнего
 *    её края (--a1/--a2), иначе изгиб читается плоским;
 *  · порог доводки: отпустил за 42% пути или бросил быстрее 1.1 — лист
 *    уходит до конца, иначе возвращается;
 *  · лупа живёт вне трансформации книги и сама пересчитывает, какая
 *    точка бумаги под ней оказалась.
 */

const N = 18; /* полос в цепочке — достаточно для гладкой дуги */
const SPAN = 0.449; /* от корешка до внешнего края, долей ширины книги */
const BETA = 0.6; /* пик изгиба дуги, радианы */
const TILT_X = 4.5;
const TILT_Y = 7;
const ZOOM_MIN = 0.9;
const ZOOM_MAX = 1.5;
const MAG = 2.3; /* во сколько раз увеличивает стекло */
const M = PLATES.length;

type Dir = "next" | "prev";
type Turn = { dir: Dir; from: number; to: number };

/**
 * jumpTo — единственная внешняя ручка книги. Ею пользуется подбор города:
 * выбрал Бари — книга открывается на побережье.
 *
 * Прыжок делается СМЕНОЙ idx, без анимации перелистывания. Перелистывать
 * по одному развороту через пол-книги долго и укачивает, а curl-анимация
 * рассчитана на соседние страницы: она рисует переход from→to одним
 * листом, и «через четыре» в ней означает не четыре листа, а один
 * неправильный.
 *
 * Поле token, а не просто номер: выбрать один и тот же город дважды —
 * законно, и во второй раз книга обязана открыться снова. По голому
 * числу эффект бы не сработал, значение-то не изменилось.
 */
export function CitySketchbook({ jumpTo }: { jumpTo?: { plate: number; token: number } | null } = {}) {
  const reducedMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [loupeOn, setLoupeOn] = useState(true);
  const [zoomRead, setZoomRead] = useState(100);

  const stageRef = useRef<HTMLDivElement>(null);
  const book3dRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const zoomWrapRef = useRef<HTMLDivElement>(null);
  const zoomInnerRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Значения, которые меняются каждый кадр, живут в ref, а не в state:
     setState на кадр анимации перерисовывал бы дерево 60 раз в секунду. */
  const tRef = useRef(0);
  const turnRef = useRef<Turn | null>(null);
  const idxRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const springRef = useRef<
    | { kind: "spring"; v: number; target: number; k: number; c: number; done?: () => void }
    | { kind: "tween"; from: number; target: number; dur: number; e: number; done?: () => void }
    | null
  >(null);
  const viewRef = useRef({ rx: 0, ry: 0, z: 1, trx: 0, try_: 0, tz: 1 });
  const viewActiveRef = useRef(false);
  const dragRef = useRef<{ dir: Dir; x0: number; w: number; moved: number; vel: number; tPrev: number } | null>(null);
  const loupePos = useRef<{ x: number; y: number } | null>(null);
  const loupeGrab = useRef<{ cx: number; cy: number; x0: number; y0: number } | null>(null);
  const loupeTarget = useRef<{ x: number; y: number } | null>(null);
  const loupeOnRef = useRef(true);

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  /* Внешний прыжок. Текущий перелистывающий лист снимается: если запрос
     пришёл в середине анимации, оставленный turn дорисовал бы переход к
     странице, с которой мы уже ушли. */
  useEffect(() => {
    if (!jumpTo) return;
    const to = Math.max(0, Math.min(M - 1, Math.trunc(jumpTo.plate)));
    setTurn(null);
    setIdx(to);
  }, [jumpTo]);
  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);
  useEffect(() => {
    loupeOnRef.current = loupeOn;
  }, [loupeOn]);

  const bookBox = useCallback(() => {
    const b = bookRef.current;
    return { w: b?.clientWidth ?? 0, h: b?.clientHeight ?? 0 };
  }, []);

  const loupeSize = useCallback(() => {
    const { w } = bookBox();
    return Math.round(Math.max(120, Math.min(262, w * 0.235)));
  }, [bookBox]);

  /* Стекло стоит над наклоном, в неискажённых пикселях книги: наклон
     страницы его не двигает. Меняется от наклона только то, какой кусок
     бумаги под ним, и из всего преобразования на это влияет масштаб —
     книга растёт от собственного центра. */
  const placeLoupe = useCallback(() => {
    const p = loupePos.current;
    const loupe = loupeRef.current;
    const wrap = zoomWrapRef.current;
    const inner = zoomInnerRef.current;
    if (!p || !loupe || !wrap || !inner) return;
    const { w: bw, h: bh } = bookBox();
    if (!bw) return;
    const R = loupeSize() / 2;
    const bez = R * 2 * 0.058;
    loupe.style.setProperty("--lr", `${R * 2}px`);
    loupe.style.transform = `translate3d(${(p.x - R).toFixed(1)}px,${(p.y - R).toFixed(1)}px,0)`;

    const z = viewRef.current.z;
    const cx = bw / 2;
    const cy = bh / 2;
    const x0 = cx + (0 - cx) * z;
    const x1 = cx + (bw - cx) * z;
    const y0 = cy + (0 - cy) * z;
    const y1 = cy + (bh - cy) * z;
    /* насколько центр стекла внутри бумаги; за краем копия гаснет, и
       остаётся просто стекло, а не полоска страницы на пустом столе */
    const nx = Math.max(x0, Math.min(p.x, x1));
    const ny = Math.max(y0, Math.min(p.y, y1));
    const inside =
      p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1
        ? Math.min(p.x - x0, x1 - p.x, p.y - y0, y1 - p.y)
        : -Math.hypot(p.x - nx, p.y - ny);
    const k = Math.max(0, Math.min(1, (inside + R * 0.3) / (R * 0.55)));

    wrap.style.opacity = (loupeOnRef.current ? k : 0).toFixed(3);
    if (k <= 0.002) return;
    const r = (R - bez).toFixed(1);
    const mask = `radial-gradient(circle ${r}px at ${p.x.toFixed(1)}px ${p.y.toFixed(1)}px,#000 calc(100% - 1px),transparent 100%)`;
    wrap.style.webkitMaskImage = mask;
    wrap.style.maskImage = mask;
    /* точка бумаги под стеклом, увеличенная вокруг неё же — стекло
       показывает ровно MAG от того, что на экране */
    const px = cx + (p.x - cx) / z;
    const py = cy + (p.y - cy) / z;
    const sc = MAG * z;
    inner.style.transform = `translate(${(p.x - px * sc).toFixed(1)}px,${(p.y - py * sc).toFixed(1)}px) scale(${sc.toFixed(4)})`;
  }, [bookBox, loupeSize]);

  const restLoupe = useCallback(() => {
    const { w, h } = bookBox();
    if (!w) return;
    /* Парковка — на самом оттиске, а не в поле страницы. У автора стекло
       лежало наполовину за книгой, на «столе»; здесь стола нет, и в
       пустом поле стекло показывало пустоту — на экране это читалось не
       как лупа, а как белый кружок непонятного назначения. */
    loupePos.current = { x: w * 0.62, y: h * 0.66 };
    placeLoupe();
  }, [bookBox, placeLoupe]);

  const applyView = useCallback(() => {
    const v = viewRef.current;
    const el = book3dRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `${v.rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${v.ry.toFixed(2)}deg`);
    el.style.setProperty("--zoom", v.z.toFixed(3));
    placeLoupe();
  }, [placeLoupe]);

  const applyTurn = useCallback((t: number) => {
    const el = book3dRef.current;
    if (!el) return;
    const th = Math.PI * t; /* насколько лист уже качнулся */
    const beta = BETA * Math.sin(Math.PI * t); /* плоский в начале и в конце */
    const D = 180 / Math.PI;
    const tt = th + beta;
    const td = (2 * beta) / N;
    el.style.setProperty("--tt", `${(tt * D).toFixed(2)}deg`);
    el.style.setProperty("--td", `${(td * D).toFixed(3)}deg`);
    for (let i = 0; i < stripRefs.current.length; i++) {
      const st = stripRefs.current[i]?.style;
      if (!st) continue;
      const l1 = Math.abs(Math.cos(tt - i * td)); /* освещённость ближнего края */
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td)); /* и дальнего */
      st.setProperty("--lit", l1.toFixed(3));
      st.setProperty("--a1", ((1 - l1) * 0.62).toFixed(3));
      st.setProperty("--a2", ((1 - l2) * 0.62).toFixed(3));
    }
  }, []);

  /* --- цикл кадров: пружина для доводки, твин для ровного темпа ----- */
  const tick = useCallback(
    function loop(now: number) {
      rafRef.current = null;
      const dt = Math.min(0.032, (now - lastRef.current) / 1000 || 0.016);
      lastRef.current = now;

      const sp = springRef.current;
      if (sp && turnRef.current) {
        if (sp.kind === "tween") {
          sp.e += dt;
          const k = Math.min(1, sp.e / sp.dur);
          tRef.current = sp.from + (sp.target - sp.from) * k;
          applyTurn(tRef.current);
          if (k >= 1) {
            springRef.current = null;
            sp.done?.();
          }
        } else {
          const x = tRef.current - sp.target;
          sp.v += (-sp.k * x - sp.c * sp.v) * dt;
          tRef.current += sp.v * dt;
          if (Math.abs(tRef.current - sp.target) < 0.002 && Math.abs(sp.v) < 0.02) {
            tRef.current = sp.target;
            springRef.current = null;
            applyTurn(tRef.current);
            sp.done?.();
          } else applyTurn(tRef.current);
        }
      }

      /* наклон и масштаб догоняют цель по экспоненте */
      const v = viewRef.current;
      let moved = false;
      for (const [k, t] of [
        ["rx", "trx"],
        ["ry", "try_"],
        ["z", "tz"],
      ] as const) {
        const d = v[t] - v[k];
        if (Math.abs(d) > 0.0006) {
          v[k] += d * 0.14;
          moved = true;
        } else v[k] = v[t];
      }
      if (moved) applyView();
      viewActiveRef.current = moved;

      /* стекло, отодвинутое листом, доезжает до своего места */
      let lmoved = false;
      const lt = loupeTarget.current;
      const lp = loupePos.current;
      if (lt && lp) {
        if (loupeGrab.current) loupeTarget.current = null;
        else {
          const dx = lt.x - lp.x;
          const dy = lt.y - lp.y;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            loupePos.current = { ...lt };
            loupeTarget.current = null;
            placeLoupe();
          } else {
            loupePos.current = { x: lp.x + dx * 0.17, y: lp.y + dy * 0.17 };
            placeLoupe();
            lmoved = true;
          }
        }
      }

      /* Следующий кадр — по собственному имени функционального
         выражения: ссылаться на константу tick внутри её же
         инициализатора нельзя, это доступ до объявления. */
      if ((springRef.current || viewActiveRef.current || lmoved) && rafRef.current === null) {
        rafRef.current = requestAnimationFrame(loop);
      }
    },
    [applyTurn, applyView, placeLoupe],
  );

  const kick = useCallback(() => {
    if (rafRef.current === null) {
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      springRef.current = null;
    },
    [],
  );

  const setView = useCallback(
    (rx: number, ry: number, z: number) => {
      const v = viewRef.current;
      v.trx = Math.max(-TILT_X, Math.min(TILT_X, rx));
      v.try_ = Math.max(-TILT_Y, Math.min(TILT_Y, ry));
      v.tz = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
      viewActiveRef.current = true;
      setZoomRead(Math.round(v.tz * 100));
      kick();
    },
    [kick],
  );

  /* стекло отодвигается в сторону, когда лист проходит над ним */
  const shoveLoupe = useCallback(
    (dir: Dir) => {
      const p = loupePos.current;
      if (!loupeOnRef.current || !p || loupeGrab.current) return;
      const { w, h } = bookBox();
      const z = viewRef.current.z;
      const nx = (w / 2 + (p.x - w / 2) / z) / w;
      const ny = (h / 2 + (p.y - h / 2) / z) / h;
      if (nx < 0.02 || nx > 0.98 || ny < 0.17 || ny > 0.83) return; /* и так не на пути */
      loupeTarget.current = { x: w * (dir === "next" ? 0.12 : 0.88), y: h * 0.855 };
      kick();
    },
    [bookBox, kick],
  );

  const startTurn = useCallback(
    (dir: Dir, t: number) => {
      springRef.current = null;
      shoveLoupe(dir);
      const from = idxRef.current;
      const to = dir === "next" ? (from + 1) % M : (from - 1 + M) % M;
      tRef.current = t;
      turnRef.current = { dir, from, to };
      setTurn({ dir, from, to });
    },
    [shoveLoupe],
  );

  const finishTurn = useCallback(() => {
    const tn = turnRef.current;
    if (!tn) return;
    idxRef.current = tn.to;
    turnRef.current = null;
    tRef.current = 0;
    setIdx(tn.to);
    setTurn(null);
  }, []);

  const commit = useCallback(() => {
    if (!turnRef.current) return;
    if (reducedMotion) {
      finishTurn();
      return;
    }
    springRef.current = { kind: "spring", v: 0, target: 1, k: 170, c: 26, done: finishTurn };
    kick();
  }, [finishTurn, kick, reducedMotion]);

  const cancel = useCallback(() => {
    if (!turnRef.current) return;
    springRef.current = {
      kind: "spring",
      v: 0,
      target: 0,
      k: 150,
      c: 24,
      done: () => {
        turnRef.current = null;
        setTurn(null);
      },
    };
    kick();
  }, [kick]);

  const step = useCallback(
    (dir: Dir) => {
      if (turnRef.current) finishTurn();
      startTurn(dir, 0);
      commit();
      track("sketchbook_step", { dir });
    },
    [commit, finishTurn, startTurn],
  );

  const goTo = useCallback(
    (i: number) => {
      if (i === idxRef.current) return;
      if (turnRef.current) finishTurn();
      const fwd = (i - idxRef.current + M) % M;
      const back = (idxRef.current - i + M) % M;
      if (Math.min(fwd, back) === 1) {
        step(fwd === 1 ? "next" : "prev");
        return;
      }
      idxRef.current = i;
      setIdx(i);
      track("sketchbook_goto", { i });
    },
    [finishTurn, step],
  );

  /* --- ширина книги в CSS-переменную, наклон к курсору -------------- */
  useEffect(() => {
    const layout = () => {
      const b = bookRef.current;
      const el = book3dRef.current;
      if (b && el) el.style.setProperty("--bw", `${b.clientWidth}px`);
      restLoupe();
    };
    layout();
    addEventListener("resize", layout);
    return () => removeEventListener("resize", layout);
  }, [restLoupe]);

  useEffect(() => {
    /* наклон — только для мыши: на тачскрине «курсора» нет, а дёргать
       книгу от касания значит мешать листанию */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || reducedMotion) return;
      if (dragRef.current) return; /* пока лист в руке — книга стоит */
      const b = bookRef.current;
      if (!b) return;
      const r = b.getBoundingClientRect();
      if (!r.width) return;
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.62)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)));
      setView(-ny * TILT_X, nx * TILT_Y, viewRef.current.tz);
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) setView(0, 0, viewRef.current.tz);
    };
    const onBlur = () => setView(0, 0, viewRef.current.tz);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerout", onOut);
    addEventListener("blur", onBlur);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerout", onOut);
      removeEventListener("blur", onBlur);
    };
  }, [reducedMotion, setView]);

  /* --- перетаскивание страницы ------------------------------------- */
  const onStagePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const zone = (e.target as HTMLElement).closest(`.${s.zone}`);
    if (!zone) return;
    e.preventDefault();
    stageRef.current?.setPointerCapture(e.pointerId);
    const b = bookRef.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    const dir: Dir = (e.clientX - r.left) / r.width > 0.5 ? "next" : "prev";
    startTurn(dir, 0);
    dragRef.current = { dir, x0: e.clientX, w: r.width, moved: 0, vel: 0, tPrev: performance.now() };
  };

  const onStagePointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    d.moved = Math.max(d.moved, Math.abs(dx));
    const raw = (d.dir === "next" ? -dx : dx) / (d.w * 0.62);
    const t = Math.max(0, Math.min(1, raw));
    const now = performance.now();
    d.vel = (t - tRef.current) / Math.max(0.001, (now - d.tPrev) / 1000);
    d.tPrev = now;
    if (turnRef.current) {
      tRef.current = t;
      applyTurn(t);
    }
  };

  const endDrag = () => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    if (!turnRef.current) return;
    if (d.moved < 6) {
      commit(); /* это было нажатие, а не перетаскивание */
      return;
    }
    /* за 42% пути или брошен быстрее 1.1 — доводим, иначе возвращаем */
    if (tRef.current > 0.42 || d.vel > 1.1) commit();
    else cancel();
  };

  /* --- лупа: перетаскивание ---------------------------------------- */
  const onLoupeDown = (e: React.PointerEvent) => {
    if (!loupeOn || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation(); /* никогда не начинает переворот страницы */
    loupeTarget.current = null;
    const p = loupePos.current;
    if (!p) return;
    loupeGrab.current = { cx: e.clientX, cy: e.clientY, x0: p.x, y0: p.y };
    loupeRef.current?.classList.add(s.held);
    loupeRef.current?.setPointerCapture(e.pointerId);
  };
  const onLoupeMove = (e: React.PointerEvent) => {
    const g = loupeGrab.current;
    if (!g) return;
    const { w, h } = bookBox();
    const R = loupeSize() / 2;
    /* стекло не несёт трансформации книги, поэтому курсор ложится 1:1 */
    loupePos.current = {
      x: Math.max(-R * 0.7, Math.min(w + R * 0.7, g.x0 + (e.clientX - g.cx))),
      y: Math.max(-R * 0.7, Math.min(h + R * 1.0, g.y0 + (e.clientY - g.cy))),
    };
    placeLoupe();
  };
  const onLoupeUp = () => {
    loupeGrab.current = null;
    loupeRef.current?.classList.remove(s.held);
  };

  /* --- клавиатура --------------------------------------------------- */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    step(e.key === "ArrowRight" ? "next" : "prev");
  };

  useEffect(() => {
    restLoupe();
    applyView();
    // один раз после монтирования: разложить стекло и наклон по местам
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cur = turn ? turn.to : idx;
  const plate = PLATES[cur];

  /* Содержимое книги рисуется дважды: в самой книге и в увеличенной
     копии под стеклом. У автора копия делалась cloneNode каждый кадр —
     в React честнее отрендерить то же дерево вторым разом, чем
     вручную клонировать узлы мимо React.
     Обычный <img>, а не next/image: сборка статическая (output:
     "export"), оптимизатор в ней всё равно не работает, размеры страниц
     фиксированы (1200×800), а пропорцию держит сама книга — сдвига
     макета нет. Тот же выбор и по той же причине, что у маскота. */
  const bookContent = (
    <>
      {!turn ? (
        <div className={s.full}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PLATES[idx].src} alt="" draggable={false} />
        </div>
      ) : (
        <>
          <Half side="left" i={turn.dir === "next" ? turn.from : turn.to} />
          <Half side="right" i={turn.dir === "next" ? turn.to : turn.from} />
          <div className={`${s.curl} ${s[turn.dir]}`} style={{ "--n": N, "--span": SPAN } as React.CSSProperties}>
            <Strips turn={turn} stripRefs={stripRefs} />
          </div>
        </>
      )}
    </>
  );

  return (
    <div className={s.wrap} onKeyDown={onKeyDown}>
      <div
        ref={stageRef}
        className={s.stage}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => setView(viewRef.current.trx, viewRef.current.try_, 1)}
      >
        <div ref={book3dRef} className={s.book3d}>
          <div ref={bookRef} className={s.book}>
            {bookContent}
            <button
              type="button"
              className={`${s.zone} ${s.zonePrev}`}
              aria-label="Предыдущий разворот"
              onClick={(e) => e.detail === 0 && step("prev")}
            />
            <button
              type="button"
              className={`${s.zone} ${s.zoneNext}`}
              aria-label="Следующий разворот"
              onClick={(e) => e.detail === 0 && step("next")}
            />
          </div>
        </div>

        {/* увеличенная копия и само стекло — вне трансформации книги */}
        <div ref={zoomWrapRef} className={s.zoomWrap} aria-hidden>
          <div ref={zoomInnerRef} className={s.zoomInner}>
            {bookContent}
          </div>
        </div>
        <div
          ref={loupeRef}
          className={`${s.loupe} ${loupeOn ? s.on : ""}`}
          aria-hidden
          onPointerDown={onLoupeDown}
          onPointerMove={onLoupeMove}
          onPointerUp={onLoupeUp}
          onPointerCancel={onLoupeUp}
        >
          <div className={s.lens} />
        </div>
      </div>

      {/* подпись разворота — живая область: при листании меняется текст,
         и диктор должен её прочитать, иначе смена кадра беззвучна */}
      <div aria-live="polite" className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <b className="font-display text-lg font-semibold">{plate.title}</b>
        <span className="font-mono text-[11px] tracking-[0.08em] text-sec-deep uppercase">{plate.place}</span>
        <p className="w-full text-sm text-ink-soft">{plate.note}</p>
      </div>

      <div className={`${s.bar} mt-4`}>
        <button
          type="button"
          onClick={() => step("prev")}
          aria-label="Предыдущий разворот"
          className="rounded-pill border-2 border-ink bg-paper px-3 py-1.5 text-xs font-extrabold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => step("next")}
          aria-label="Следующий разворот"
          className="rounded-pill border-2 border-ink bg-paper px-3 py-1.5 text-xs font-extrabold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
        >
          →
        </button>
        <button
          type="button"
          onClick={() => {
            const next = !loupeOn;
            setLoupeOn(next);
            loupeOnRef.current = next;
            if (next && !loupePos.current) restLoupe();
            placeLoupe();
          }}
          aria-pressed={loupeOn}
          className={`rounded-pill border-2 border-ink px-3 py-1.5 text-xs font-extrabold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
            loupeOn ? "bg-ink text-cream" : "bg-paper text-ink"
          }`}
        >
          Лупа
        </button>
        <button
          type="button"
          onClick={() => setView(viewRef.current.trx, viewRef.current.try_, viewRef.current.tz / 1.16)}
          disabled={zoomRead <= ZOOM_MIN * 100 + 0.1}
          aria-label="Отдалить"
          className="rounded-pill border-2 border-ink bg-paper px-3 py-1.5 text-xs font-extrabold uppercase disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
        >
          −
        </button>
        <span className={`${s.zoomRead} font-mono text-[11px] text-sec-deep`}>{zoomRead}%</span>
        <button
          type="button"
          onClick={() => setView(viewRef.current.trx, viewRef.current.try_, viewRef.current.tz * 1.16)}
          disabled={zoomRead >= ZOOM_MAX * 100 - 0.1}
          aria-label="Приблизить"
          className="rounded-pill border-2 border-ink bg-paper px-3 py-1.5 text-xs font-extrabold uppercase disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
        >
          +
        </button>
      </div>

      <ol className="mt-6 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {PLATES.map((p, i) => (
          <li key={p.title + p.place}>
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === cur ? "true" : "false"}
              className={`${s.plate} flex w-full items-baseline gap-2 rounded-md border-2 border-line px-3 py-2 text-left transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red`}
            >
              <span className={`${s.plateNum} font-mono text-[10px] text-sec-deep`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-bold">{p.title}</span>
              <span className="ml-auto font-mono text-[10px] tracking-[0.06em] uppercase opacity-70">{p.place}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Half({ side, i }: { side: "left" | "right"; i: number }) {
  return (
    <div className={`${s.half} ${s[side]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`${s.halfImg} ${s[side]}`} src={PLATES[i].src} alt="" draggable={false} />
      <div className={`${s.gutter} ${s[side]}`} />
    </div>
  );
}

/**
 * Цепочка полос. Сдвиги фона — чистая геометрия: посчитаны один раз при
 * построении и больше не трогаются, пока лист летит. Каждый кадр меняются
 * только --lit/--a1/--a2 (освещение) и общие --tt/--td на контейнере.
 */
function Strips({
  turn,
  stripRefs,
}: {
  turn: Turn;
  stripRefs: React.RefObject<(HTMLDivElement | null)[]>;
}) {
  const gut = "calc(var(--bw) * 0.5)";
  const sw = `calc(var(--bw) * ${SPAN} / ${N})`;
  const nodes: React.ReactNode[] = [];

  const build = (i: number): React.ReactNode => {
    if (i >= N) return null;
    const A = `calc(-1 * (${gut} + ${i} * ${sw}))`; /* смотрит на страницу, с которой уходим */
    const B = `calc(${i + 1} * ${sw} - ${gut})`; /* и на ту, к которой приходим */
    const fromUrl = PLATES[turn.from].src;
    const toUrl = PLATES[turn.to].src;
    const next = turn.dir === "next";
    return (
      <div
        key={i}
        ref={(el) => {
          stripRefs.current[i] = el;
        }}
        className={`${s.strip}${i === N - 1 ? ` ${s.edge}` : ""}`}
        style={{ "--i": i } as React.CSSProperties}
      >
        <div
          className={`${s.face} ${s.front}`}
          style={{ backgroundImage: `url(${fromUrl})`, backgroundPositionX: next ? A : B }}
        >
          <div className={s.sh} />
          <div className={s.gl} />
        </div>
        <div
          className={`${s.face} ${s.back}`}
          style={{ backgroundImage: `url(${toUrl})`, backgroundPositionX: next ? B : A }}
        >
          <div className={s.sh} />
          <div className={s.gl} />
        </div>
        {build(i + 1)}
      </div>
    );
  };

  nodes.push(build(0));
  return <>{nodes}</>;
}
