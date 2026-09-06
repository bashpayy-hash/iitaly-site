// Портировано из старого сайта (index.html, TASK_META/DOC_TASKS/ACT_PAGE и
// форматтеры дедлайнов из IIFE «ЛИЧНЫЙ КАБИНЕТ»).

import type { PortalTask } from "./portalApi";

export const TASK_META: Record<string, { min: string; why: string; act: string }> = {
  profile: { min: "7 мин", why: "нужно для подборки программ и расчёта маршрута", act: "Заполнить" },
  shortlist: { min: "5 мин", why: "ИИ отберёт программы под твои баллы и бюджет", act: "Получить подборку" },
  chances: { min: "3 мин", why: "поймём, реально ли рассчитывать на стипендию", act: "Проверить шансы" },
  checkDocs: { min: "2 мин", why: "ошибку дешевле найти сейчас, чем после отказа", act: "Проверить документы" },
  path12: { min: "5 мин", why: "решает, теряешь ли ты год", act: "Разобрать варианты" },
  apostille: { min: "до 6 недель", why: "без него перевод недействителен", act: "Как получить" },
  cimea: { min: "30–60 дней", why: "запускать заранее, иначе не успеть", act: "Как подать" },
  universitaly: { min: "40 мин", why: "без этого визу не дадут", act: "Как заполнить" },
  iseeu: { min: "2 недели", why: "от него зависит размер стипендии", act: "Что нужно" },
  money: { min: "заранее", why: "деньги должны «пожить» на счёте", act: "Сколько нужно" },
  blsSlot: { min: "15 мин", why: "слоты в сезон разбирают за часы", act: "Как записаться" },
};

export const ACT_PAGE: Record<string, string> = {
  checkDocs: "/plan",
  shortlist: "/universities",
  chances: "/plan",
  profile: "/plan",
};

export const DOC_TASKS: Record<string, string> = {
  apostille: "Аттестат или диплом с апостилем",
  translate: "Присяжный перевод",
  notary: "Нотариальное заверение перевода",
  cimea: "CIMEA Statement of Comparability",
  familyDocs: "Справка о доходах или составе семьи",
  iseeu: "ISEEU parificato",
  statements: "Банковская выписка",
  insurance: "Медицинская страховка",
  housing: "Подтверждение жилья",
  universitaly: "Сводка Universitaly",
};

export const V_LABEL: Record<string, string> = {
  ok: "проверен",
  warn: "есть замечания",
  error: "есть ошибки",
  unreadable: "плохо видно",
};

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const p = iso.split("-");
  return `${parseInt(p[2], 10)} ${MONTHS[parseInt(p[1], 10) - 1]} ${p[0]}`;
}

export type DeadlineState = "done" | "none" | "over" | "hot" | "soon" | "calm";

export function dlState(t: PortalTask, isDone: boolean): DeadlineState {
  if (isDone) return "done";
  if (t.daysLeft == null) return "none";
  if (t.daysLeft < 0) return "over";
  if (t.daysLeft <= 14) return "hot";
  if (t.daysLeft <= 45) return "soon";
  return "calm";
}

export function dlText(t: PortalTask, isDone: boolean): string {
  if (!t.deadline) return "";
  if (isDone) return fmtDate(t.deadline);
  const days = t.daysLeft ?? 0;
  if (days < 0) return `просрочено на ${-days} дн`;
  if (days === 0) return "сегодня";
  if (days <= 45) return `через ${days} дн · ${fmtDate(t.deadline)}`;
  return fmtDate(t.deadline);
}
