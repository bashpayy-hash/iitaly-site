"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ItalyMap } from "./ItalyMap";
import type { CityId } from "@/data/italy";

// Обёртка над картой: 3D — основной режим (запрошено явно, риск по скорости
// принят), но с двумя предохранителями, которые не урезают саму фичу:
// 1. Без WebGL/при экономии трафика — тихо остаётся 2D, тумблер не показываем.
// 2. Even когда 3D доступна, её JS-чанк и WebGL-контекст не грузятся, пока
//    карта не появится во вьюпорте (IntersectionObserver) — на LCP других
//    блоков страницы это не влияет вообще.
// Плюс всегда есть кнопка «Плоская карта» — мгновенный откат на проверенный
// 2D-рендер, если 3D тормозит на конкретном устройстве.

const ItalyMap3D = dynamic(() => import("./ItalyMap3D").then((m) => m.ItalyMap3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0d1118]">
      <span className="text-xs font-bold tracking-wide text-white/40 uppercase">Загружаем 3D-карту…</span>
    </div>
  ),
});

type Props = {
  activeCity: CityId | null;
  onSelectCity: (id: CityId) => void;
  matchedCities: Set<CityId>;
};

function hasWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function MapView(props: Props) {
  // webglOk обязан стартовать одинаково на сервере и при гидратации (false),
  // иначе структура DOM (кнопка-тумблер, 3D/2D ветка) разъедется и React
  // выбросит ошибку гидратации. Настоящую проверку делаем только в эффекте,
  // уже после маунта на клиенте.
  const [webglOk, setWebglOk] = useState(false);
  const [mode, setMode] = useState<"3d" | "2d">("2d");
  const [inView, setInView] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasWebGL()) {
      setWebglOk(true);
      setMode("3d");
    }
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  return (
    <div>
      <div ref={wrapRef} className="relative overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_60px_rgba(13,17,24,.45)]">
        {webglOk && (
          <button
            type="button"
            onClick={() => setMode((m) => (m === "3d" ? "2d" : "3d"))}
            className="absolute top-3 right-3 z-10 rounded-pill border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-white/80 uppercase backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            {mode === "3d" ? "Плоская карта" : "Карта в 3D"}
          </button>
        )}

        {mode === "3d" && webglOk ? (
          <div className="aspect-[420/520] w-full">
            {inView ? (
              <ItalyMap3D {...props} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0d1118]">
                <span className="text-xs font-bold tracking-wide text-white/40 uppercase">3D-карта</span>
              </div>
            )}
          </div>
        ) : (
          <ItalyMap {...props} />
        )}
      </div>
      <p className="mt-3 text-center text-xs text-ink-soft">
        {mode === "3d" && webglOk
          ? "Перетащите, чтобы повернуть — крупные точки открывают вузы"
          : "Крупные точки — города с несколькими университетами"}
      </p>
    </div>
  );
}
