import { TRAINER_SECTIONS, type PermessoScenario } from "./permessoData";
import { EDITOR_FIELDS, editorMode, valueProblem, type EditorField } from "./permessoOriginalGeometry";

export type PaperValues = Record<string, string>;
export type TransferStep = { id: string; page: number; fields: EditorField[]; skip: boolean; sectionLabel: string };
export type TransferReceipt = { signature: string; action: "copied" | "blank" | "deferred" };

// The supplied review explicitly calls these unresolved. A draft value is not
// evidence that the applicant has verified the procedural rule.
const UNVERIFIED = new Set(["16", "25", "28", "29", "35", "36"]);
export function needsVerification(field: EditorField, scenario: PermessoScenario) {
  return UNVERIFIED.has(field.id) || field.kind === "signature" || ["verify", "post"].includes(editorMode(field, scenario));
}
export function paperValue(field: EditorField, values: PaperValues, scenario: PermessoScenario) {
  if (field.id === "8") return scenario === "rilascio" ? "X" : "";
  if (field.id === "9") return scenario === "rinnovo" ? "X" : "";
  return editorMode(field, scenario) === "empty" ? "" : values[field.id] || "";
}
export function transferSteps(scenario: PermessoScenario): TransferStep[] {
  const steps: TransferStep[] = [];
  for (const field of EDITOR_FIELDS) {
    const skip = editorMode(field, scenario) === "empty";
    const last = steps[steps.length - 1];
    if (skip && last?.skip && last.page === field.page && last.fields[0].meta.section === field.meta.section) {
      last.fields.push(field);
      last.id += ":" + field.id;
    } else {
      const section = TRAINER_SECTIONS.find(s => s.id === field.meta.section);
      steps.push({ id: (skip ? "skip:" : "field:") + field.id, page: field.page, fields: [field], skip, sectionLabel: section?.label || "Шапка" });
    }
  }
  return steps;
}
export function transferSignature(step: TransferStep, values: PaperValues, scenario: PermessoScenario) {
  return JSON.stringify([scenario, step.id, ...step.fields.map(f => paperValue(f, values, scenario))]);
}
export function hasPaperValue(value: string) { return Boolean(value.replace(/[\s/]/g, "")); }

/** Calendar comparison, not a time-of-day comparison. Explicit 'today' keeps
 * rendering deterministic and permits boundary tests. Warnings never block. */
export function expiryWarning(field: EditorField, value: string, today: Date): string {
  if (!["20", "45"].includes(field.id) || !/^\d{8}$/.test(value) || valueProblem(field, value)) return "";
  const expires = Number(value.slice(4) + value.slice(2, 4) + value.slice(0, 2));
  const now = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  if (expires >= now) return "";
  return field.id === "45"
    ? "По указанной дате срок паспорта уже истёк. Проверь документ до подачи. Это предупреждение не блокирует черновик."
    : "По указанной дате срок ВНЖ уже истёк. Уточни порядок дальнейших действий в Questura или у специалиста. Это предупреждение не блокирует черновик.";
}
