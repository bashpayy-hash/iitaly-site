"use client";

import { useMemo, useSyncExternalStore } from "react";

/* Что уже прочитано в гайдах и визе — для дороги (owner, 10 Nov: «в этом
   формате», как путь в кабинете). На устройстве хранятся только ключи
   страниц («con/2», «visa/timeline/3»), ни ответов, ни личных данных; на
   бэкенд ничего не уходит. Закрытый до оплаты пункт прочитанным не
   становится, пока его текст не открыт. */
const KEY = "iitaly_guides_read_v1";
const EVENT = "iitaly:guides-read";
let memory = "";

function snapshot() { try { return localStorage.getItem(KEY) || memory; } catch { return memory; } }
function decode(raw: string): string[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(item => typeof item === "string" && /^[a-z0-9-]+(\/[a-z0-9-]+){1,2}$/.test(item)).slice(0, 200) : [];
  } catch { return []; }
}
function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener); window.addEventListener("storage", listener);
  return () => { window.removeEventListener(EVENT, listener); window.removeEventListener("storage", listener); };
}

export function markGuideRead(key: string) {
  const read = decode(snapshot());
  if (read.includes(key)) return;
  memory = JSON.stringify([...read, key]);
  try { localStorage.setItem(KEY, memory); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** Keys of the guide pages read on this device; empty during the static render. */
export function useGuideRead(): Set<string> {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  return useMemo(() => new Set(decode(raw)), [raw]);
}
