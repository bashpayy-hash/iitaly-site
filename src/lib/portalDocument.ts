import type { PortalDoc } from "./portalApi";

export type DocumentOutcomeKind = "approved" | "fix" | "clarify" | "unreadable" | "missing";
export enum DocumentStatus {
  NotStarted = "not_started",
  Reviewing = "reviewing",
  NeedsFix = "needs_fix",
  Ready = "ready",
}
export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  [DocumentStatus.NotStarted]: "Не начато",
  [DocumentStatus.Reviewing]: "На проверке",
  [DocumentStatus.NeedsFix]: "Нужно исправить",
  [DocumentStatus.Ready]: "Готово",
};
const statuses: Record<DocumentOutcomeKind, DocumentStatus> = {
  approved: DocumentStatus.Ready,
  fix: DocumentStatus.NeedsFix,
  clarify: DocumentStatus.Reviewing,
  unreadable: DocumentStatus.NeedsFix,
  missing: DocumentStatus.NotStarted,
};

// A missing application context is not a defect in the uploaded document.
// Use one interpretation in the overview, plan, list and saved report.
export function documentOutcome(doc?: PortalDoc, applicationYear = doc?.routeAcademicYear) {
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
  const status = statuses[kind];
  const action = kind === "approved" ? "" : kind === "unreadable" ? "Загрузить чёткий скан или фото документа."
    : kind === "missing" ? "Подготовить документ по инструкции к шагу."
    : kind === "clarify" ? "Уточнить требования выбранного вуза и проверить документ повторно."
    : doc?.result?.problems?.find(problem => problem.fix)?.fix || doc?.result?.nextSteps?.[0] || "Исправить замечания из разбора и загрузить новую версию.";
  return { kind, status, label: DOCUMENT_STATUS_LABELS[status], action };
}
