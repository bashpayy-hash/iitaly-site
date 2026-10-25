"use client";

import { useEffect, useRef, useState } from "react";

const SOUND_KEY = "iitaly_portal_completion_sound";
export type CompletionFeedback = { id: number; taskId: string; title: string };

/** Full requested chord. Reuse the gesture-unlocked context on mobile Safari. */
export function playDopamineSound(preparedContext?: AudioContext) {
  const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Audio) return;
  const ctx = preparedContext || new Audio();
  const now = ctx.currentTime;
  let remaining = 3;
  [587.33, 880, 1174.66].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.055);
    gain.gain.setValueAtTime(0.001, now + i * 0.055);
    gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.055 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.055 + 0.65);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.055);
    osc.stop(now + i * 0.055 + 0.7);
    osc.onended = () => {
      osc.disconnect(); gain.disconnect();
      if (--remaining === 0 && !preparedContext) void ctx.close().catch(() => {});
    };
  });
}

/** Called from a user gesture; a saved task, never a click, earns the chime. */
export function usePortalFeedback() {
  const [sound, setSound] = useState(true);
  const soundEnabled = useRef(true);
  const [feedback, setFeedback] = useState<CompletionFeedback | null>(null);
  const context = useRef<AudioContext | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sequence = useRef(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    // The server has no browser preference; apply it after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { if (localStorage.getItem(SOUND_KEY) === "off") { soundEnabled.current = false; setSound(false); } } catch {}
    return () => { alive.current = false; clearTimeout(timeout.current); void context.current?.close().catch(() => {}); context.current = null; };
  }, []);

  function prime() {
    if (!soundEnabled.current || typeof window === "undefined") return;
    try {
      const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) return;
      context.current ||= new Audio();
      if (context.current.state === "suspended") void context.current.resume().catch(() => {});
    } catch { /* Audio availability must never block a saved task. */ }
  }

  function confirm(taskId: string, title: string) {
    if (!alive.current) return;
    clearTimeout(timeout.current);
    setFeedback({ id: ++sequence.current, taskId, title });
    window.dispatchEvent(new CustomEvent("iitaly:task-saved", {detail:{taskId,title}}));

    timeout.current = setTimeout(() => setFeedback(null), 2200);
    const ctx = context.current;
    if (!soundEnabled.current || !ctx || ctx.state !== "running") return;
    try {
      playDopamineSound(ctx);
    } catch { /* Visual and text confirmation remain available without audio. */ }
  }

  function toggleSound() {
    const next = !soundEnabled.current;
    soundEnabled.current = next;
    setSound(next);
    try { localStorage.setItem(SOUND_KEY, next ? "on" : "off"); } catch {}
  }
  function reset() { clearTimeout(timeout.current); setFeedback(null); }
  return { sound, toggleSound, prime, confirm, feedback, reset };
}
