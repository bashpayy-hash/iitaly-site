import { GUIDES } from "@/data/guides";
import type { PortalTask } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { taskExplanation, taskHelpDetails } from "@/lib/portalNavigation";
import { taskMicroSteps } from "./PortalMicroSteps";

const topics: Record<string, string> = { apostille: "apostille", translate: "translation", notary: "translation", cimea: "cimea", iseeu: "iseeu" };
export type InstructionPage = { title: string; text: string; preparation?: boolean };

/** Reading positions are not task completion. All guidance is existing copy. */
export function portalInstructionPages(task: PortalTask) {
  const guide = GUIDES.find(item => item.id === topics[task.id]);
  const pages: InstructionPage[] = [...(taskMicroSteps[task.id] || [])];
  if (guide) pages.push(...guide.rows.map(row => ({ title: row.label, text: row.value })));
  taskHelpDetails(task).forEach((text, index) => pages.push({ title: index === 0 ? "Что учесть" : "Дополнительные условия", text }));
  if (!pages.length) pages.push({ title: "Что нужно сделать", text: taskExplanation(task) });
  if (guide?.warn) pages.push({ title: "Перед следующим действием", text: guide.warn });
  if (DOC_TASKS[task.id]) pages.push(
    { title: "Проверь читаемость файла", text: "Текст читается, края страниц видны.", preparation: true },
    { title: "Проверь документ и заявку", text: "Выбран нужный документ и контекст заявки.", preparation: true },
  );
  return { pages: pages.filter((page, index, all) => all.findIndex(item => item.text === page.text) === index), sources: guide?.sources || [] };
}

export function instructionIndex(value: string, length: number) {
  const number = /^\d+$/.test(value) ? Number(value) : 1;
  return Number.isSafeInteger(number) ? Math.max(0, Math.min(length - 1, number - 1)) : 0;
}
