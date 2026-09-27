import type { FieldMode, PermessoScenario } from "./permessoData";
import { editorMode, sezione, valueProblem, type EditorField } from "./permessoOriginalGeometry";

export const ANSWER_STATUS: Record<FieldMode, string> = {
  write: "ЗАПОЛНИ", empty: "ПРОПУСТИ", post: "НА ПОЧТЕ", ifExists: "ЕСЛИ ЕСТЬ", recommended: "ЕСЛИ ЕСТЬ", verify: "УТОЧНИ",
};
export type FieldAnswer = {
  status: FieldMode; answer: string; hint: string; cells: string | null; source: string;
  dontWrite: string | null; caption: string; example: boolean; value: string;
};
function sentence(text: string, limit = 90) {
  if (text.length <= limit) return text;
  const first = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  if (first && first.length <= limit) return first;
  const cut = text.slice(0, limit - 1); return cut.slice(0, Math.max(cut.lastIndexOf(" "), 40)) + "…";
}
/** A view of the existing model: no code/country defaults and no parallel glossary.
 * Explicit examples never become user values. Uncertain rules stay uncertain even
 * when a user has typed a syntactically plausible number. */
export function fieldAnswer(f: EditorField, scenario: PermessoScenario, personalValue = "", showExample = false): FieldAnswer {
  const status = editorMode(f, scenario), q = f.quick;
  const allowed = status !== "empty" && status !== "post" && !f.readOnly && f.kind !== "signature";
  const exampleValue = showExample && allowed && status !== "verify" ? f.meta.example?.[scenario] || "" : "";
  const raw = exampleValue || (allowed ? personalValue : "");
  const valid = !!raw.trim() && !valueProblem(f, raw);
  const value = valid ? raw : "";
  const example = !!exampleValue && valid;
  const choices = q?.choices;
  const chosen = choices?.find(c => c.value === value);
  let answer = q?.answer || (choices ? choices.map(c=>c.value).join(" / ") : f.kind === "date" ? "Дата из документа" : f.kind === "check" || f.kind === "radio" ? "Сверь отметку" : f.meta.kind === "code" ? "Сверь код" : "Как в документе");
  let hint = q?.hint || f.meta.source;
  if (chosen) { answer = chosen.value; hint = chosen.label === chosen.value ? q?.hint || f.meta.source : chosen.label + ". " + (q?.hint || ""); }
  else if (value && status !== "verify") {
    answer = f.kind === "date" ? `${value.slice(0,2)}/${value.slice(2,4)}/${value.slice(4,8)}` : value.trimEnd();
  }
  if (f.kind === "check" && ["8","9"].includes(f.id) && status === "write") answer = f.meta.example?.[scenario] || answer;
  if (status === "empty") { answer = f.kind === "block" ? "Весь блок пустой" : "Пусто"; hint = q?.hint || f.meta.source; }
  if (status === "post") { answer = "На почте"; hint = "Не переноси самостоятельно: этот участок заполняется на почте."; }
  let cells = q?.cells || (f.kind === "date" ? "ДД / ММ / ГГГГ. Косые уже напечатаны." : f.kind === "split" ? "Части отдельно; разделитель уже на бумаге." : f.kind === "check" || f.kind === "radio" ? f.meta.format : f.runs.length > 1 && f.kind === "text" ? "ЗАГЛАВНЫЕ; символ в клетку. Между словами — пустая. Затем вторая строка." : f.meta.format);
  if (f.kind === "line") cells = "На строке, как в инструкции kit.";
  const source = q?.source || sentence(f.meta.source, 62);
  return {
    status, answer, hint: sentence(hint), cells: status === "empty" || f.kind === "block" ? null : cells,
    source: status === "empty" ? "Оставить пустым · текущий сценарий" : source,
    dontWrite: q?.dontWrite || (/^Не (?:пиши|ставь|добавляй|используй|сокращай|путай|переноси|вписывай)/.test(f.meta.mistake) ? sentence(f.meta.mistake, 92) : null),
    caption: `${f.kind === "block" ? "блок" : /^\d+$/.test(f.id) ? "поле" : "шапка"} ${/^\d+$/.test(f.id) ? f.id : ""} · Sezione ${sezione(f)}`,
    example, value,
  };
}
