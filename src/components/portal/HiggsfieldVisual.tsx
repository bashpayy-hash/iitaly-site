"use client";
/* eslint-disable @next/next/no-img-element -- Reviewed local media for static export. */
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { PortalTask } from "@/lib/portalApi";
import { HIGGSFIELD_TASK_VISUALS, HIGGSFIELD_VISUALS, higgsfieldStage } from "@/data/higgsfieldVisuals";
import styles from "./higgsfield-visual.module.css";

export function HiggsfieldVisual({ stage, task }: { stage?: string; task?: Pick<PortalTask, "id"> | null }) {
  const key = higgsfieldStage(stage);
  const media = (task && HIGGSFIELD_TASK_VISUALS[task.id]) || HIGGSFIELD_VISUALS[key];
  return <VisualPlayer key={`${media.poster}:${media.video || ""}`} stage={key} {...media} />;
}

function VisualPlayer({ stage, poster, video: source }: { stage: string; poster: string; video?: string }) {
  const container = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [motion, setMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotion(!preference.matches);
    sync(); preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const element = video.current, root = container.current;
    if (!element || !root) return;
    let visible = false;
    const sync = () => {
      if (!visible || document.hidden || paused || !motion) element.pause();
      else void element.play().catch(error => { if (error.name !== "AbortError") setFailed(true); });
    };
    const observer = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); });
    observer.observe(root); document.addEventListener("visibilitychange", sync);
    return () => { element.pause(); observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [motion, paused, source, failed]);
  const showVideo = Boolean(source && motion && !failed);
  return <figure ref={container} className={styles.visual} data-higgsfield-visual={stage} data-media-kind={showVideo && ready ? "video" : "image"}>
    {!imageFailed && <img className={styles.poster} src={poster} width={800} height={800} alt="" aria-hidden="true" decoding="async" onError={() => setImageFailed(true)} hidden={showVideo && ready} />}
    {showVideo && <video ref={video} className={styles.video} src={source} poster={poster} autoPlay loop muted playsInline preload="metadata" aria-hidden="true" onLoadedData={() => setReady(true)} onError={() => setFailed(true)} style={{ opacity: ready ? 1 : 0 }} />}
    <span className={styles.print} aria-hidden="true" />
    {showVideo && ready && <button type="button" className={styles.control} onClick={() => setPaused(value => !value)} aria-label={paused ? "Воспроизвести иллюстрацию" : "Приостановить иллюстрацию"}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>}
  </figure>;
}
