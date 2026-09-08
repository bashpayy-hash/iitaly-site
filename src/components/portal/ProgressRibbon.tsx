"use client";

import { useEffect, useRef, useState } from "react";

const PATH = "M4,20 C34,6 64,32 96,18 C126,4 158,30 196,16";

/** Прогресс-бар в виде ленты-макаронины — тот же мотив «Нить», что у Веспы. */
export function ProgressRibbon({ pct }: { pct: number }) {
  const fillRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState<number | null>(null);

  useEffect(() => {
    if (fillRef.current) setLen(fillRef.current.getTotalLength());
  }, []);

  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <svg
      viewBox="0 0 200 34"
      preserveAspectRatio="none"
      className="h-6 w-full"
      role="img"
      aria-label={`Пройдено ${Math.round(clamped)}%`}
    >
      <path d={PATH} stroke="var(--color-line)" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path
        ref={fillRef}
        d={PATH}
        stroke="var(--color-red)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        className="progress-ribbon-fill"
        style={
          len == null
            ? { strokeDasharray: "0 9999" }
            : { strokeDasharray: len, strokeDashoffset: len * (1 - clamped / 100) }
        }
      />
      {len != null && clamped > 0 && (
        <circle
          r="6"
          fill="var(--color-red)"
          stroke="var(--color-ink)"
          strokeWidth="2"
          className="progress-ribbon-dot"
          style={{ offsetPath: `path('${PATH}')`, offsetDistance: `${clamped}%` }}
        />
      )}
    </svg>
  );
}
