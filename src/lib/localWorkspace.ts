"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { PlanDraft } from "./usePlanDraft";
import { buildPlan } from "./planBuilder";
import { validShortlist } from "./portalShortlist";
import type { DocumentOutcomeKind } from "./portalDocument";
import type { PortalData, PortalDoc, PortalTask } from "./portalApi";

const KEY = "iitaly_local_workspace_v1";
const EVENT = "iitaly:local-workspace";
let memory = "";
export type LocalWorkspace = { scope: string; done: Record<string, boolean>; selectedIds: string[]; collecting: Record<string, boolean>; reviews: Record<string, DocumentOutcomeKind> };
const EMPTY: LocalWorkspace = { scope: "", done: {}, selectedIds: [], collecting: {}, reviews: {} };
export const WORKSPACE_PHASES = ["Выбор программы", "Язык и тесты", "Документы", "Финансы и DSU", "Виза и переезд"];
const PHASE_BY_ID: Record<string, number> = {
  profile: 0, shortlist: 0, chances: 0, path12: 0,
  test: 1, language: 1, ielts: 1, uniApply: 1,
  apostille: 2, translate: 2, notary: 2, cimea: 2, checkDocs: 2,
  familyDocs: 3, iseeu: 3, dsuApply: 3, money: 3, statements: 3,
  insurance: 4, housing: 4, universitaly: 4, blsSlot: 4, visaSubmit: 4, kit: 4, codice: 4, questura: 4,
};
export function workspacePhase(task: PortalTask): number {
  const local = /^local-p([0-4])-/.exec(task.id);
  return local ? Number(local[1]) : PHASE_BY_ID[task.id] ?? 0;
}
function snapshot() { try { return localStorage.getItem(KEY) || memory; } catch { return memory; } }
function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener); window.addEventListener("storage", listener);
  return () => { window.removeEventListener(EVENT, listener); window.removeEventListener("storage", listener); };
}
function decode(raw: string): LocalWorkspace {
  try {
    const value = JSON.parse(raw);
    const flags = (input: unknown) => Object.fromEntries(Object.entries(input && typeof input === "object" ? input : {}).filter(([key, v]) => /^[a-zA-Z0-9-]{1,80}$/.test(key) && v === true));
    return { scope: typeof value.scope === "string" ? value.scope.slice(0,80) : "", done: flags(value.done), selectedIds: validShortlist(value.selectedIds), collecting: flags(value.collecting), reviews: Object.fromEntries(Object.entries(value.reviews || {}).filter(([key, kind]) => /^[a-zA-Z0-9-]{1,80}$/.test(key) && ["approved", "fix", "clarify", "unreadable"].includes(String(kind)))) as Record<string, DocumentOutcomeKind> };
  } catch { return EMPTY; }
}
function update(value: LocalWorkspace) {
  // Only collection flags, route checks and catalogue IDs. No credentials,
  // names, phone numbers, file contents or AI reports are persisted here.
  memory = JSON.stringify(value);
  try { localStorage.setItem(KEY, memory); } catch {}
  window.dispatchEvent(new Event(EVENT));
}
export function useLocalWorkspace(): [LocalWorkspace, (value: LocalWorkspace) => void] {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  return [useMemo(() => decode(raw), [raw]), update];
}
function stableId(text: string) {
  let value = 2166136261;
  for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return (value >>> 0).toString(36);
}
export function localWorkspaceScope(draft: PlanDraft, selectedIds: string[]) {
  return stableId(JSON.stringify([Object.entries(draft.answers).sort(([a],[b]) => a.localeCompare(b)), [...selectedIds].sort()]));
}
function stepPhase(title: string): number {
  if (/DSU|финанс|запас до выплаты/.test(title)) return 3;
  if (/DoV|CIMEA/.test(title)) return 2;
  if (/программу, тест|язык и академ/.test(title)) return 1;
  if (/визу|статус в Италии|консульство|18 лет|призыв|формальности/.test(title)) return 4;
  return 0;
}
/** Explicit local adapter. This object is never sent to a portal API and does
 * not grant paid access. The existing plan builder owns all admissions copy. */
export function buildLocalWorkspace(draft: PlanDraft, local: LocalWorkspace, reports: Record<string, PortalDoc>): PortalData {
  const plan = buildPlan(draft.answers);
  const tasks: PortalTask[] = [];
  if (!draft.complete) tasks.push({ id: "profile", t: "Заполнить анкету", time: "2 мин", explain: "Ответь на 10 вопросов. Используем те же ответы, что и на странице «Мой план»." });
  tasks.push({ id: "shortlist", t: "Выбрать университеты", time: "15 мин", explain: "Сравни вузы на карте и сохрани свой список. Условия и сроки зависят от конкретной программы." });
  if (draft.complete) {
    plan.steps.forEach(step => {
      const phase = stepPhase(step.t);
      tasks.push({ id: `local-p${phase}-${stableId(step.t)}`, t: step.t, explain: step.p, time: "По ситуации" });
    });
    tasks.push({ id: "apostille", t: "Проверить аттестат или диплом с апостилем", explain: plan.docs[0].d, time: "5 мин" });
    tasks.push({ id: "translate", t: "Проверить перевод комплекта", explain: "Приложи перевод документа, приложения и апостиля, если они нужны получателю. Формат уточни у вуза и консульства отдельно.", time: "5 мин" });
    if (draft.answers.dsuRegion !== "none") tasks.push({ id: "familyDocs", t: "Собрать справки о составе и доходах семьи для DSU", explain: plan.docs.find(doc => doc.n === "Семья, доходы и имущество")?.d, time: "По ситуации" });
    tasks.push({ id: "statements", t: "Подготовить банковские выписки", explain: plan.docs[2].d, time: "По ситуации" });
    tasks.push({ id: "housing", t: "Подготовить подтверждение жилья", explain: plan.docs[3].d, time: "По ситуации" });
    tasks.push({ id: "kit", t: "Подготовить заявление на вид на жительство (permesso)", explain: "После въезда по визе D подготовь заявление. Тренажёр помогает заполнить MOD. 209; это не подача заявления.", time: "30 мин" });
  }
  const roadmap = WORKSPACE_PHASES.map((title, index) => ({ id: `workspace-phase-${index}`, title, tasks: tasks.filter(task => workspacePhase(task) === index) }));
  const done = Object.fromEntries(tasks.map(task => [task.id, task.id === "profile" ? draft.complete : task.id === "shortlist" ? Boolean(local.done.shortlist && local.selectedIds.length) : Boolean(local.done[task.id])]));
  const completed = tasks.filter(task => done[task.id]).length;
  return { client: { name: "", intakeYear: draft.answers.intake === "2027/28" ? 2027 : draft.answers.intake === "2026/27" ? 2026 : undefined, onboardingComplete: true, profile: draft.answers }, roadmap, done, docs: { ...Object.fromEntries(Object.entries(local.reviews).map(([id, kind]) => [id, { verdict: kind === "approved" ? "ok" : kind === "fix" ? "error" : kind === "unreadable" ? "unreadable" : "warn", summary: "Сохранён итог предыдущей проверки. Полный разбор и файл остаются только в открытой вкладке." } satisfies PortalDoc])), ...reports }, progress: { done: completed, total: tasks.length, pct: tasks.length ? completed / tasks.length * 100 : 0 } };
}
