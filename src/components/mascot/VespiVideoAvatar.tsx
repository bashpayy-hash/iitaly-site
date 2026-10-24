"use client";
/* eslint-disable @next/next/no-img-element -- Local fallback for optional generated video. */
import { useEffect, useRef, useState } from "react";
import styles from "./vespi-video-avatar.module.css";
export type VespiVideoState = "idle" | "thinking" | "celebrate";
// Add reviewed Higgsfield MP4 paths here when available. Empty sources deliberately
// keep the approved original portrait; CSS motion is not presented as generated video.
const sources: Partial<Record<VespiVideoState,string>> = {};
export function VespiVideoAvatar({state}:{state:VespiVideoState}) {
 const video=useRef<HTMLVideoElement>(null);
 const [reduced,setReduced]=useState(false),[ready,setReady]=useState<string|null>(null);
 const source=sources[state];
 useEffect(()=>{const media=matchMedia("(prefers-reduced-motion: reduce)");const sync=()=>setReduced(media.matches);sync();media.addEventListener("change",sync);return()=>media.removeEventListener("change",sync);},[]);
 useEffect(()=>{const element=video.current;if(!element)return;const update=()=>{if(reduced||document.hidden||!source)element.pause();else void element.play().catch(()=>{});};update();document.addEventListener("visibilitychange",update);return()=>{element.pause();document.removeEventListener("visibilitychange",update);};},[reduced,source]);
 const playing=Boolean(source&&ready===source&&!reduced);
 return <span className={styles.avatar} data-vespi-scene="chat" data-vespi-video-state={state}>
 {source&&<video key={source} ref={video} src={source} muted loop autoPlay playsInline preload="metadata" onLoadedData={()=>setReady(source)} onError={()=>setReady(null)} hidden={!playing} aria-hidden="true"/>}
 <img src="/mascot/handmade-v1/welcome-320.webp" width={64} height={64} alt="" hidden={playing}/>
 </span>;
}
