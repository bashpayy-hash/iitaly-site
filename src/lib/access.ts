"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { PortalData, PortalTask } from "./portalApi";

/* Стена доступа (owner, 5 Nov 2026, после ресерча воронки «бесплатно →
   платно»): информация «что и почему» остаётся бесплатной, стена стоит на
   первом «делании» под личный случай.

   Бесплатно: вузы, гайды, анкета, вердикт, весь маршрут списком с
   названиями и датами, ПЕРВЫЙ шаг целиком, ОДНА проверка документа (один
   файл, повторные проверки того же файла не считаются), чат.
   За 10 990 ₸: шаги со второго с датами и чек-листами, проверки без лимита,
   черновики, отметки прогресса и облако, напоминания, пересборка плана.

   Облачный кабинет (после оплаты) эту стену не видит: сюда смотрят только
   публичный результат на /plan и локальный профиль гостя. Ничего из этого
   не отправляется на бэкенд и не даёт платного доступа.

   Owner, 12 Nov 2026: «мы даём слишком много информации бесплатно… надо
   продумать, где именно сколько дать, чтобы уже брали и покупали». Что
   изменилось с тех пор и где это решается:
   - чат: 3 вопроса на устройство, номер телефона лимит не снимает
     (src/lib/chat.ts, ChatWidget);
   - проверка документа: вердикт и замечания открыты, «что делать» и
     «что дальше» — с маршрутом (DocResult в plan/DocCheck.tsx);
   - /plan: названия документов открыты, пояснения к ним — с маршрутом;
   - гайды и виза: название и первая фраза каждого шага, одна тема
     целиком как образец (src/components/guides/guideAccess.ts). */

export const FREE_PLAN_STEPS = 1;
export const FREE_DOCUMENT_CHECKS = 1;

/** Open plan steps on /plan: the first one, in full. */
export function planStepOpen(index: number): boolean {
  return index < FREE_PLAN_STEPS;
}

/** Local workspace: the questionnaire, the university choice and the first
 * route step stay open; every later task is behind the wall. */
export function freeTaskIds(data: PortalData): Set<string> {
  const ids = new Set(["profile", "shortlist"]);
  const first = data.roadmap.flatMap(stage => stage.tasks).find(task => /^local-p/.test(task.id));
  if (first) ids.add(first.id);
  return ids;
}

export function localTaskLocked(data: PortalData, task: PortalTask): boolean {
  return !freeTaskIds(data).has(task.id);
}

export function lockedTaskCount(data: PortalData): number {
  const free = freeTaskIds(data);
  return data.roadmap.flatMap(stage => stage.tasks).filter(task => !free.has(task.id)).length;
}

/* Одна бесплатная проверка документа на устройство. В хранилище — только
   отпечаток файла (хэш имени и размера), ни имени, ни содержимого, ни
   разбора. Тот же файл можно проверить повторно (другая программа, год):
   это та же проверка. Другой файл — уже стена. */
const KEY = "iitaly_free_check_v1";
const EVENT = "iitaly:free-check";
let memory = "";

function stableId(text: string) {
  let value = 2166136261;
  for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return (value >>> 0).toString(36);
}

export function documentFingerprint(file: { name: string; size: number }): string {
  return stableId(`${file.name}:${file.size}`);
}

function snapshot() { try { return localStorage.getItem(KEY) || memory; } catch { return memory; } }
function decode(raw: string): string[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(item => typeof item === "string" && /^[a-z0-9]{1,16}$/.test(item)).slice(0, 8) : [];
  } catch { return []; }
}
function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener); window.addEventListener("storage", listener);
  return () => { window.removeEventListener(EVENT, listener); window.removeEventListener("storage", listener); };
}

export function freeChecksUsed(): string[] { return decode(snapshot()); }

export function freeCheckAllowed(fingerprint: string): boolean {
  const used = freeChecksUsed();
  return used.includes(fingerprint) || used.length < FREE_DOCUMENT_CHECKS;
}

export function recordFreeCheck(fingerprint: string) {
  const used = freeChecksUsed();
  if (used.includes(fingerprint)) return;
  memory = JSON.stringify([...used, fingerprint]);
  try { localStorage.setItem(KEY, memory); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** Fingerprints of the documents already checked for free on this device. */
export function useFreeChecks(): string[] {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  return useMemo(() => decode(raw), [raw]);
}
