// Портировано из старого сайта (index.html, TASK_META/DOC_TASKS/ACT_PAGE и
// форматтеры дедлайнов из IIFE «ЛИЧНЫЙ КАБИНЕТ»).

import type { PortalTask } from "./portalApi";

export const TASK_META: Record<string, { min: string; why: string; act: string }> = {
  profile: { min: "7 мин", why: "нужно, чтобы убрать лишние шаги и настроить маршрут", act: "Заполнить профиль" },
  shortlist: { min: "15 мин", why: "соберём короткий список программ под твою ситуацию", act: "Выбрать программы" },
  chances: { min: "5 мин", why: "поймём, стоит ли строить стратегию вокруг региональной стипендии", act: "Проверить шансы" },
  checkDocs: { min: "2 мин", why: "ошибку проще исправить до подачи", act: "Проверить документы" },
  path12: { min: "10 мин", why: "после 11 классов нужен дополнительный академический год", act: "Выбрать путь" },
  apostille: { min: "1–3 недели", why: "апостиль ставится на оригинал до перевода", act: "Открыть шаг" },
  cimea: { min: "30–60 дней", why: "признание образования может занять несколько недель", act: "Открыть шаг" },
  universitaly: { min: "40 мин", why: "pre-enrolment нужен перед студенческой визой", act: "Открыть шаг" },
  iseeu: { min: "1–2 недели", why: "этот показатель используется для заявки на DSU", act: "Открыть шаг" },
  money: { min: "заранее", why: "финансовую гарантию лучше готовить не в последний момент", act: "Открыть шаг" },
  blsSlot: { min: "15 мин", why: "в высокий сезон свободные слоты быстро заканчиваются", act: "Открыть шаг" },
};

export const ACT_PAGE: Record<string, string> = {
  checkDocs: "/plan",
  shortlist: "/universities",
  chances: "/plan",
  profile: "/plan",
};

export const DOC_TASKS: Record<string, string> = {
  apostille: "Аттестат или диплом с апостилем",
  translate: "Официальный перевод на итальянский",
  notary: "Заверенный перевод",
  cimea: "Признание образования (CIMEA)",
  familyDocs: "Семейные справки для DSU",
  iseeu: "Показатель дохода для DSU (ISEEU)",
  statements: "Банковские выписки",
  insurance: "Медицинская страховка",
  housing: "Подтверждение жилья",
  universitaly: "Подтверждение Universitaly",
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
  return `через ${days} дн`;
}
