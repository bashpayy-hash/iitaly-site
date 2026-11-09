"use client";

import { useSyncExternalStore } from "react";

/* Устройство с открытым маршрутом. Страница оплаты (/payment/success) и вход
   в кабинет сохраняют код кабинета под этим ключом, выход из кабинета его
   стирает. Здесь проверяется только, что ключ есть: ни код, ни фамилия не
   читаются и никуда не отправляются. Сайт статичный, поэтому стена мягкая,
   как на /plan: закрытого текста нет в HTML, но доступ не проверяет сервер. */
const PORTAL_CODE = "iitaly_portal_code";

function snapshot() {
  try { return Boolean(localStorage.getItem(PORTAL_CODE)); } catch { return false; }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

/** Read directly, for a wall's analytics flag only: during hydration the hook
 *  still answers with the static value, and a paid device must not report a
 *  wall it is about to hide. Never use this for rendered output. */
export function paidDeviceNow(): boolean {
  return typeof window !== "undefined" && snapshot();
}

/** True once this browser holds a paid cabinet; false during the static render. */
export function usePaidDevice(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
