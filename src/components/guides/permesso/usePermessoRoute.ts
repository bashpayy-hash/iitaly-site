"use client";

import { useSyncExternalStore } from "react";
import { ALL_GUIDANCE_FIELDS, EDITOR_FIELDS, type EditorField } from "./permessoOriginalGeometry";
import type { PermessoScenario } from "./permessoData";
const EVENT = "iitaly:permesso-route";
const EMPTY = "";
function subscribe(notify: () => void) {
  window.addEventListener("popstate", notify); window.addEventListener(EVENT, notify);
  return () => { window.removeEventListener("popstate", notify); window.removeEventListener(EVENT, notify); };
}
const getSnapshot = () => window.location.search;
const getServerSnapshot = () => EMPTY;
export function usePermessoRoute() {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const params = new URLSearchParams(search);
  const scenario: PermessoScenario = params.get("scenario") === "rinnovo" ? "rinnovo" : "rilascio";
  const n = Number(params.get("page") || 1), page = Number.isInteger(n) && n >= 1 && n <= 8 ? n : 1;
  const requested = params.get("field");
  const field = ALL_GUIDANCE_FIELDS.find(f => f.page === page && f.id === requested)
    || EDITOR_FIELDS.find(f => f.page === page && f.meta.mode[scenario] === "write")
    || ALL_GUIDANCE_FIELDS.find(f => f.page === page)!;
  return { search, scenario, page, field, explicit: !!requested || params.has("scenario") || params.has("page") };
}
/** Only deliberate pin/page/scenario actions call this; preview never does. */
export function pinPermessoField(f: EditorField, scenario: PermessoScenario, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("scenario", scenario); url.searchParams.set("page", String(f.page)); url.searchParams.set("field", f.id);
  if (url.search === window.location.search) return;
  window.history[replace ? "replaceState" : "pushState"](window.history.state, "", url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(EVENT));
}
/** Replace one query parameter without a new history entry (scenario or tool on the reference pages). */
export function setPermessoParam(key: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  if (url.search === window.location.search) return;
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(EVENT));
}
/* Память вкладки на время переходов между разделами Modulo 1 (Бланк ·
   Коды и расчёты · Перед почтой). Раньше справочники жили под бланком, и
   черновик не терялся, пока человек сверял код. Теперь это отдельные
   страницы: введённое держится в памяти открытой вкладки — не в
   localStorage, — и перезагрузка или закрытие вкладки стирают его, как и
   раньше. Сохранение на устройстве — по-прежнему только по кнопке. */
const tabMemory: { values: Record<string, string>; search: string; worker: boolean } = { values: {}, search: "", worker: false };
export function rememberedDraft() { return { ...tabMemory.values }; }
export function rememberDraft(values: Record<string, string>) { tabMemory.values = { ...values }; }
export function rememberTrainerSearch(search: string) { tabMemory.search = search; }
/** «Я официально работаю и кладу Modulo 2» из «Кодов и расчётов» — для шпаргалки «Перед почтой» (поле 24). */
export function rememberedWorker() { return tabMemory.worker; }
export function rememberWorker(worker: boolean) { tabMemory.worker = worker; }
/** Где человек остановился в бланке: та же страница и поле, текущий сценарий. */
export function trainerHref(scenario: PermessoScenario) {
  const params = new URLSearchParams(tabMemory.search);
  if (scenario === "rinnovo") params.set("scenario", "rinnovo"); else if (params.has("scenario")) params.set("scenario", "rilascio");
  const query = params.toString();
  return "/guides/permesso-modulo-1" + (query ? "?" + query : "");
}
const HINT_KEY = "iitaly:permesso-hover-onboarding:dismissed";
const HINT_EVENT = "iitaly:permesso-hover-onboarding";
function subscribeHint(notify: () => void) {
  window.addEventListener("storage", notify); window.addEventListener(HINT_EVENT, notify);
  return () => { window.removeEventListener("storage", notify); window.removeEventListener(HINT_EVENT, notify); };
}
let dismissedInMemory = false;
function hintSnapshot() { try { return dismissedInMemory || localStorage.getItem(HINT_KEY) === "1"; } catch { return dismissedInMemory; } }
export function usePermessoHint() {
  const dismissed = useSyncExternalStore(subscribeHint, hintSnapshot, () => true);
  return { visible: !dismissed, dismiss: () => { dismissedInMemory = true; try { localStorage.setItem(HINT_KEY, "1"); } catch { /* Still dismiss for this visit in restricted storage. */ } window.dispatchEvent(new Event(HINT_EVENT)); } };
}
