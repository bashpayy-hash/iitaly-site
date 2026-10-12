"use client";

import { useMemo, useSyncExternalStore } from "react";
import { WIZ, type WizAnswers } from "@/data/wizard";

export type PlanDraft = { answers: WizAnswers; step: number; complete: boolean };
export const EMPTY_PLAN_DRAFT: PlanDraft = { answers: {}, step: 0, complete: false };
const KEY = "iitaly_plan_draft_v1";
const EVENT = "iitaly:plan-draft";
let memory = "";

function snapshot() {
  try { return window.sessionStorage.getItem(KEY) || memory; } catch { return memory; }
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
    const answers = Object.fromEntries(WIZ.flatMap(q =>
      q.opts.some(option => option.v === data?.answers?.[q.id]) ? [[q.id, data.answers[q.id]]] : []));
    const missing = WIZ.findIndex(q => !answers[q.id]);
    const limit = missing < 0 ? WIZ.length : missing;
    const step = Number.isInteger(data?.step) ? Math.max(0, Math.min(data.step, limit)) : 0;
    return { answers, step, complete: data?.complete === true && missing < 0 };
  } catch { return EMPTY_PLAN_DRAFT; }
}
function update(draft: PlanDraft) {
  // Only enumerated questionnaire answers. Never store a phone number or file.
  memory = JSON.stringify(draft);
  try { window.sessionStorage.setItem(KEY, memory); } catch { /* In-memory fallback for restricted browsers. */ }
  window.dispatchEvent(new Event(EVENT));
}

export function usePlanDraft(): [PlanDraft, (draft: PlanDraft) => void] {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const draft = useMemo(() => decode(raw), [raw]);
  return [draft, update];
}
