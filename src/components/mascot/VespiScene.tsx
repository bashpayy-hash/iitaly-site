"use client";

/* eslint-disable @next/next/no-img-element -- Local responsive WebP for static export. */
import { useEffect, useRef, useState } from "react";
import styles from "./vespi-scene.module.css";

export type VespiScenePose = "welcome" | "route" | "documents" | "checking" | "clarify" | "saved" | "peek" | "rest";

/** Illustration only. It cannot change a task, document verdict or chat state. */
export function VespiScene({ pose, className = "", sizes = "(max-width: 600px) 96px, 240px", priority = false, canRest = false }: {
  pose: VespiScenePose;
  className?: string;
  sizes?: string;
  priority?: boolean;
  canRest?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [resting, setResting] = useState(false);

  useEffect(() => {
    if (!canRest || pose !== "welcome" || !root.current) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    const wake = () => {
      clearTimeout(timer);
      setResting(false);
      if (visible && document.visibilityState === "visible") {
        // A decorative idle pose, never a claim about the user's effort or data.
        timer = setTimeout(() => setResting(true), 45_000);
      }
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      wake();
    }, { threshold: .15 });
    observer.observe(root.current);
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("keydown", wake);
    window.addEventListener("scroll", wake, { passive: true });
    document.addEventListener("visibilitychange", wake);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("scroll", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [canRest, pose]);

  const rest = canRest && pose === "welcome" && resting;
  const picture = (kind: VespiScenePose, asleep = false) => <img
    className={asleep ? styles.rest : styles.awake}
    src={`/mascot/handmade-v1/${kind}-640.webp`}
    srcSet={`/mascot/handmade-v1/${kind}-320.webp 320w, /mascot/handmade-v1/${kind}-640.webp 640w`}
    sizes={sizes} width={640} height={512} alt="" aria-hidden="true"
    loading={priority && !asleep ? "eager" : "lazy"} decoding="async" draggable={false}
    data-vespi={asleep ? undefined : `scene-${pose}`}
  />;

  return <div ref={root} className={`${styles.scene} ${className}`} data-vespi-scene={pose} data-vespi-resting={rest || undefined} aria-hidden="true">
    {picture(pose)}
    {canRest && pose === "welcome" && picture("rest", true)}
  </div>;
}
