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
export function documentOutcome(doc?: PortalDoc, applicationYear?: string): { kind: DocumentOutcomeKind; label: string } {
  let kind: DocumentOutcomeKind = "missing";
  if (doc) {
    const verdict = doc.result?.verdict || doc.verdict;
    if (verdict === "unreadable") kind = "unreadable";
    else if (verdict === "error" || (doc.result?.problems?.length || doc.problems || doc.critical || 0) > 0) kind = "fix";
    else if (verdict === "ok" && (!doc.result?.review || doc.result.review.rulesStatus === "verified")) {
      // A local route must not inherit an otherwise valid review for a different
      // academic year. The original report remains intact and visible.
      kind = applicationYear && doc.result && (!doc.result.review || applicationYear === "unspecified" || doc.result.review.academicYear !== applicationYear) ? "clarify" : "approved";
    }
    else kind = "clarify";
  }
  return { kind, label: labels[kind] };
}
