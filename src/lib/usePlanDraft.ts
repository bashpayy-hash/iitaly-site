"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { WizAnswers } from "@/data/wizard";
import { wizardAnswers, wizardFor } from "@/data/wizardTracks";

export type PlanDraft = { answers: WizAnswers; step: number; complete: boolean };
export const EMPTY_PLAN_DRAFT: PlanDraft = { answers: {}, step: 0, complete: false };
const KEY = "iitaly_plan_draft_v1";
const EVENT = "iitaly:plan-draft";
let memory = "";

function snapshot() {
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) return saved;
    const legacy = window.sessionStorage.getItem(KEY);
    if (legacy) {
      window.localStorage.setItem(KEY, legacy);
      return legacy;
    }
  } catch { /* Some private browsers block persistent storage. */ }
  return memory;
}
function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
function decode(raw: string): PlanDraft {
  try {
    const data = JSON.parse(raw);
    // The questions are those of the saved level's track (wizardTracks.ts):
    // after «Магистратура» a school answer is not kept, and the draft is
    // complete only when every question of that track is answered.
    const answers = wizardAnswers(data?.answers);
    const questions = wizardFor(answers);
    const missing = questions.findIndex(q => !answers[q.id]);
    const limit = missing < 0 ? questions.length : missing;
    const step = Number.isInteger(data?.step) ? Math.max(0, Math.min(data.step, limit)) : 0;
    return { answers, step, complete: data?.complete === true && missing < 0 };
  } catch { return EMPTY_PLAN_DRAFT; }
}
function update(draft: PlanDraft) {
  // Only enumerated questionnaire answers. Never store a phone number or file.
  memory = JSON.stringify(draft);
  try { window.localStorage.setItem(KEY, memory); } catch { /* In-memory fallback. */ }
  // Compatibility for an already-open tab; localStorage is the shared source.
  try { window.sessionStorage.setItem(KEY, memory); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function usePlanDraft(): [PlanDraft, (draft: PlanDraft) => void] {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const draft = useMemo(() => decode(raw), [raw]);
  return [draft, update];
}
