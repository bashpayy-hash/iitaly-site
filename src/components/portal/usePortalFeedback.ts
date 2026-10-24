"use client";

import { useEffect, useRef, useState } from "react";

const SOUND_KEY = "iitaly_portal_completion_sound";
export type CompletionFeedback = { id: number; taskId: string; title: string };

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
      // Original, quiet two-part confirmation chord, synthesized locally.
      [[523.25, 659.25, 783.99], [659.25, 830.61, 987.77]].forEach((chord, part) => chord.forEach((frequency, index) => {
        const at = ctx.currentTime + part * .105;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine"; oscillator.frequency.setValueAtTime(frequency, at);
        gain.gain.setValueAtTime(.0001, at);
        gain.gain.exponentialRampToValueAtTime(.026 / (index + 1), at + .018);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .55);
        oscillator.connect(gain); gain.connect(ctx.destination);
        oscillator.start(at); oscillator.stop(at + .6);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      }));
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
