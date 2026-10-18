/**
 * Декоративный маршрут-лента на фоне hero — крупный вариант мотива «Нить»
 * (см. mascot-nastro.svg): та же геометрия двух обводок, по которой бегут
 * несколько разных меток — как попутчики на одном маршруте. Не несёт
 * содержания — aria-hidden.
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
          .route-token { offset-path: path('${path}'); offset-rotate: 0deg; }
          .route-dot   { animation: route-run 7s   linear infinite; }
          .route-sq    { animation: route-run 9.5s linear infinite; animation-delay: 1.6s; }
          .route-flag  { animation: route-run 11s  linear infinite; animation-delay: 4.2s; }
          @keyframes route-run {
            0%   { offset-distance: 0%;   opacity: 0; }
            5%   { opacity: 1; }
            95%  { opacity: 1; }
            100% { offset-distance: 100%; opacity: 0; }
          }
        }
      `}</style>
      <path d={path} stroke="var(--color-ink)" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.06" />
      <path d={path} stroke="var(--color-red)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.14" />

      <circle className="route-token route-dot" r="5" fill="var(--color-red)" opacity="0" />
      <rect
        className="route-token route-sq"
        x="-5" y="-5" width="10" height="10" rx="2"
        fill="var(--color-ink)" opacity="0"
      />
      <path
        className="route-token route-flag"
        d="M-5,-7 L6,-2 L-5,3 Z"
        fill="var(--color-green)" opacity="0"
      />
    </svg>
  );
}
