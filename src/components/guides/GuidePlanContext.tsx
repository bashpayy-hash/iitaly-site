"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { GUIDE_HELP, isGuideId } from "./guideJourney";
import ui from "./guide-browser.module.css";

function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
}
function snapshot() { return window.location.search; }

/** Carry only the reading topic, never answers or document-review eligibility. */
export function GuidePlanContext({ target }: { target: "plan" | "document" }) {
  const search = useSyncExternalStore(subscribe, snapshot, () => "");
  const id = new URLSearchParams(search).get("fromGuide");
  if (!isGuideId(id) || GUIDE_HELP[id].action !== target) return null;
  return <div className={ui.planContext} data-guide-origin={id}>
    <div>
      <p>Продолжаем: <strong>{GUIDE_HELP[id].title}</strong></p>
      <p>{target === "document" ? "Выбери контекст проверки ниже. Тема справочника не задаёт требования к файлу." : "Ответь на вопросы ниже. Если ты уже начал, твои ответы остались на месте."}</p>
      <Link href={`/guides/${id}`}>Вернуться к теме</Link>
    </div>
  </div>;
}
