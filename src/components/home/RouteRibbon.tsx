/**
 * Декоративный маршрут-лента на фоне hero — крупный вариант мотива «Нить»
 * (см. mascot-nastro.svg): та же геометрия двух обводок + бегущий блик,
 * растянутая на всю ширину блока. Не несёт содержания — aria-hidden.
 */
export function RouteRibbon({ className = "" }: { className?: string }) {
  const path =
    "M-40,120 C160,20 320,220 520,110 C680,20 820,200 1020,90 C1180,10 1340,160 1480,80";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 240"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .route-glint { animation: route-glint 7s ease-in-out infinite; offset-path: path('${path}'); }
          @keyframes route-glint {
            0% { offset-distance: 0%; opacity: 0; }
            6% { opacity: .9; }
            94% { opacity: .9; }
            100% { offset-distance: 100%; opacity: 0; }
          }
        }
      `}</style>
      <path d={path} stroke="var(--color-ink)" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.06" />
      <path d={path} stroke="var(--color-red)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.14" />
      <circle className="route-glint" r="5" fill="var(--color-red)" opacity="0" />
    </svg>
  );
}
