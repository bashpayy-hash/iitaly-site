"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* The night map's only script: it marks the map as seen the first time the
   band comes into view (the dots and lights switch on once, north to south)
   and as live while it stays in view (the lights twinkle only then, so an
   off-screen band costs nothing). Without IntersectionObserver the map is
   simply shown. */
export function ItalyNightMapLive({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.dataset.seen = "";
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.dataset.seen = "";
        el.dataset.live = "";
      } else {
        delete el.dataset.live;
      }
    }, { threshold: 0.12 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={className} aria-hidden="true" data-italy-night-map>{children}</div>;
}
