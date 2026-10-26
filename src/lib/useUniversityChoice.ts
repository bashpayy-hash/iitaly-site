"use client";

import { useMemo, useSyncExternalStore } from "react";
import { UNIS } from "@/data/italy";

type UniversityChoice = { comparedIds: string[]; primaryId: string | null };
const KEY = "iitaly_university_choice_v1";
const EVENT = "iitaly:university-choice";
const EMPTY: UniversityChoice = { comparedIds: [], primaryId: null };
const knownIds = new Set(UNIS.map(university => university.id));
let memory = "";

function decode(raw: string): UniversityChoice {
  try {
    const value = JSON.parse(raw);
    return {
      comparedIds: Array.isArray(value?.comparedIds)
        ? [...new Set(value.comparedIds.filter((id: unknown): id is string => typeof id === "string" && knownIds.has(id)))].slice(0, 3) as string[]
        : [],
      primaryId: typeof value?.primaryId === "string" && knownIds.has(value.primaryId) ? value.primaryId : null,
    };
  } catch { return EMPTY; }
}

function snapshot() {
  try { return localStorage.getItem(KEY) || memory; } catch { return memory; }
}
function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => { window.removeEventListener(EVENT, listener); window.removeEventListener("storage", listener); };
}
function update(patch: Partial<UniversityChoice>) {
  // Catalogue IDs only. This choice never completes a task or changes a review.
  memory = JSON.stringify(decode(JSON.stringify({ ...decode(snapshot()), ...patch })));
  try { localStorage.setItem(KEY, memory); } catch { /* Keep working in this tab. */ }
  window.dispatchEvent(new Event(EVENT));
}

export function useUniversityChoice() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const choice = useMemo(() => decode(raw), [raw]);
  return {
    ...choice,
    primary: UNIS.find(university => university.id === choice.primaryId) || null,
    setCompared: (comparedIds: string[]) => update({ comparedIds }),
    choose: (primaryId: string) => { if (knownIds.has(primaryId)) update({ primaryId }); },
  };
}
