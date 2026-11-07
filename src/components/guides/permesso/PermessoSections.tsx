"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { PermessoScenario } from "./permessoData";
import { setPermessoParam, trainerHref, usePermessoRoute } from "./usePermessoRoute";
import styles from "./permesso-sections.module.css";

/* Modulo 1 — три раздела вместо одной длинной страницы (owner, 7 Nov:
   «слишком много информации, надо её разбить дальше по блокам, или даже на
   другие сайты»). Бланк — сам тренажёр; «Коды и расчёты» и «Перед почтой» —
   справочники, которые раньше шли под бланком одной простынёй. Сценарий
   (rilascio / rinnovo) едет в адресе между разделами, черновик — в памяти
   вкладки (usePermessoRoute.ts). */

export type PermessoSection = "blank" | "kody" | "pochta";

export const PERMESSO_TOOLS = [
  { id: "16", title: "Код в поле 16" },
  { id: "25", title: "Поле 25 · сколько листов" },
  { id: "sigla", title: "Сигла провинции" },
  { id: "paese", title: "Код страны" },
] as const;
export type PermessoToolId = (typeof PERMESSO_TOOLS)[number]["id"];

/** Поле бланка → справочник, который к нему нужен. */
export const PERMESSO_FIELD_TOOL: Record<string, PermessoToolId> = {
  "16": "16", "19": "16", "25": "25", "5": "sigla", "66": "sigla", "78": "sigla", questoreProvince: "sigla", "35": "paese", "36": "paese",
};
export const PERMESSO_BASE = "/guides/permesso-modulo-1";

const SECTIONS: { id: PermessoSection; label: string }[] = [
  { id: "blank", label: "Бланк" },
  { id: "kody", label: "Коды и расчёты" },
  { id: "pochta", label: "Перед почтой" },
];

export function permessoSectionHref(id: PermessoSection, scenario: PermessoScenario, extra = "") {
  if (id === "blank") return trainerHref(scenario);
  const params = new URLSearchParams(extra);
  if (scenario === "rinnovo") params.set("scenario", "rinnovo");
  const query = params.toString();
  return `${PERMESSO_BASE}/${id}${query ? "?" + query : ""}`;
}

export function PermessoSectionNav({ current }: { current: PermessoSection }) {
  const { scenario } = usePermessoRoute();
  return (
    <nav className={styles.sections} aria-label="Разделы Modulo 1" data-permesso-sections>
      {SECTIONS.map(section => (
        <Link key={section.id} href={permessoSectionHref(section.id, scenario)} aria-current={section.id === current ? "page" : undefined}>{section.label}</Link>
      ))}
    </nav>
  );
}

function ScenarioSwitch() {
  const { scenario } = usePermessoRoute();
  return (
    <div className={styles.scenarios} role="group" aria-label="Сценарий">
      <button type="button" aria-pressed={scenario === "rilascio"} aria-label="Первое ВНЖ Rilascio · только приехал" onClick={() => setPermessoParam("scenario", "rilascio")}>Первое ВНЖ</button>
      <button type="button" aria-pressed={scenario === "rinnovo"} aria-label="Продление Rinnovo · карточка уже есть" onClick={() => setPermessoParam("scenario", "rinnovo")}>Продление</button>
    </div>
  );
}

/** Общая рамка справочных разделов: навигация, заголовок, сценарий. */
export function PermessoReferenceFrame({ section, title, lead, children }: { section: Exclude<PermessoSection, "blank">; title: string; lead: string; children: ReactNode }) {
  return (
    <div className={styles.page} data-permesso-reference={section}>
      <PermessoSectionNav current={section} />
      <header className={styles.head}>
        <div>
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
        <ScenarioSwitch />
      </header>
      {children}
    </div>
  );
}
