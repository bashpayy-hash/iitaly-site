import type { PortalDoc } from "./portalApi";

export type DocumentOutcomeKind = "approved" | "fix" | "clarify" | "unreadable" | "missing";
const labels: Record<DocumentOutcomeKind, string> = {
  approved: "Проверка пройдена",
  fix: "Нужно исправить",
  clarify: "Нужно уточнить",
  unreadable: "Нужна читаемая копия",
  missing: "Не загружен",
};

// A missing application context is not a defect in the uploaded document.
// Use one interpretation in the overview, plan, list and saved report.
export function documentOutcome(doc?: PortalDoc): { kind: DocumentOutcomeKind; label: string } {
  let kind: DocumentOutcomeKind = "missing";
  if (doc) {
    const verdict = doc.result?.verdict || doc.verdict;
    if (verdict === "unreadable") kind = "unreadable";
    else if (verdict === "error" || (doc.result?.problems?.length || doc.problems || doc.critical || 0) > 0) kind = "fix";
    else if (verdict === "ok" && (!doc.result?.review || doc.result.review.rulesStatus === "verified")) kind = "approved";
    else kind = "clarify";
  }
  return { kind, label: labels[kind] };
}
