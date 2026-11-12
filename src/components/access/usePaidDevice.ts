"use client";

import { useSyncExternalStore } from "react";

/* Устройство с открытым маршрутом. Страница оплаты (/payment/success) и вход
   в кабинет сохраняют код кабинета под этим ключом, выход из кабинета его
   стирает. Здесь проверяется только, что ключ есть: ни код, ни фамилия не
   читаются и никуда не отправляются. Сайт статичный, поэтому стена мягкая,
   как на /plan: закрытого текста нет в HTML, но доступ не проверяет сервер. */
const PORTAL_CODE = "iitaly_portal_code";
/* Взгляд гостя (owner, 12 Nov: «можешь дать ссылку, чтобы я мог посмотреть
   на сайт глазами того, кто ещё не оплатил?»). Любая страница с ?guest=1
   показывает стены и на оплаченном устройстве — до закрытия вкладки
   (sessionStorage); ?guest=0 возвращает как было. Кабинет и вход это не
   трогает: прячется только то, что открывает оплата. */
const GUEST_VIEW = "iitaly_guest_view";

function guestView(): boolean {
  try {
    const asked = new URLSearchParams(window.location.search).get("guest");
    if (asked === "1") sessionStorage.setItem(GUEST_VIEW, "1");
    else if (asked === "0") sessionStorage.removeItem(GUEST_VIEW);
    return sessionStorage.getItem(GUEST_VIEW) === "1";
  } catch { return false; }
}

/** True while this tab looks at the site as a guest (?guest=1): walls show,
 *  but they send no analytics, so the owner's previews stay out of the funnel. */
export function guestPreview(): boolean {
  return typeof window !== "undefined" && guestView();
}

function snapshot() {
  if (guestView()) return false;
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
