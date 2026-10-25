"use client";
/* eslint-disable @next/next/no-img-element -- Local fallback for optional generated video. */
import { useEffect, useRef, useState } from "react";
import { HIGGSFIELD_VESPI } from "@/data/higgsfieldVisuals";
import styles from "./vespi-video-avatar.module.css";

export type VespiVideoState = "idle" | "thinking" | "celebrate";

export function VespiVideoAvatar({ state, presentation = "portrait" }: {
  state: VespiVideoState;
  presentation?: "portrait" | "route";
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const source = HIGGSFIELD_VESPI[state];
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(preference.matches);
    sync(); preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const chatOpen = () => presentation === "route" && Boolean(document.querySelector('[data-portal-chat="true"]'));
    let hiddenBehindChat = chatOpen();
    const sync = () => {
      if (reduced || document.hidden || !source || hiddenBehindChat) element.pause();
      else if (!(state === "celebrate" && element.ended)) {
        void element.play().catch(error => { if (error.name !== "AbortError") setFailed(source); });
      }
    };
    sync();
    // React inserts/removes the drawer; ordinary chat messages must not replay
    // a finished celebration or restart an already playing avatar.
    const observer = new MutationObserver(() => {
      const next = chatOpen();
      if (next !== hiddenBehindChat) { hiddenBehindChat = next; sync(); }
    });
    if (presentation === "route") observer.observe(document.body, { subtree: true, childList: true });
    document.addEventListener("visibilitychange", sync);
    return () => { element.pause(); observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [reduced, source, presentation, failed, state]);
  const playing = Boolean(source && ready === source && !reduced && failed !== source);
  return <span className={`${styles.avatar} ${presentation === "route" ? styles.route : ""}`} data-vespi-scene={presentation === "portrait" ? "chat" : undefined} data-vespi-video-state={state}>
    {source && !reduced && failed !== source && <video key={source} ref={video} src={source} muted loop={state !== "celebrate"} autoPlay playsInline preload="metadata" onLoadedData={() => setReady(source)} onError={() => setFailed(source)} hidden={!playing} aria-hidden="true" />}
    <img src={`/mascot/handmade-v1/${state === "celebrate" ? "saved" : "welcome"}-${presentation === "route" ? 640 : 320}.webp`} width={presentation === "route" ? 640 : 64} height={presentation === "route" ? 512 : 64} alt="" hidden={playing} />
  </span>;
}
