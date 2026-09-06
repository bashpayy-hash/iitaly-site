import { BACKEND_URL } from "./backend";

// Типы данных кабинета — форма ответа /api/portal/:code, выведена из
// старого сайта (index.html, IIFE «ЛИЧНЫЙ КАБИНЕТ»). Кабинет полностью
// управляется бэкендом: маршрут, прогресс и документы приходят с сервера.

export interface PortalTask {
  id: string;
  t: string;
  deadline?: string | null;
  daysLeft?: number | null;
  ai?: boolean;
  expert?: boolean;
  note?: string;
  warn?: string;
}

export interface PortalStage {
  id: string;
  title: string;
  tasks: PortalTask[];
}

export interface PortalDoc {
  verdict: "ok" | "warn" | "error" | "unreadable";
  summary?: string;
  critical?: number;
}

export interface PortalClient {
  name: string;
  tier: string;
  intakeYear?: number;
  tgLinked?: boolean;
  botName?: string;
  email?: string;
  notify?: { email?: boolean; telegram?: boolean };
}

export interface PortalData {
  client: PortalClient;
  roadmap: PortalStage[];
  done: Record<string, boolean>;
  docs: Record<string, PortalDoc>;
  progress: { done: number; total: number; pct: number };
}

export type PortalResult = { ok: true; data: PortalData } | { ok: false; error: string };

export async function fetchPortal(code: string, surname: string): Promise<PortalResult> {
  if (!BACKEND_URL) return { ok: false, error: "Кабинет заработает после подключения сервера." };
  try {
    const r = await fetch(`${BACKEND_URL}/api/portal/${encodeURIComponent(code)}?surname=${encodeURIComponent(surname)}`);
    const d = await r.json();
    if (!d || !d.ok) return { ok: false, error: (d && d.error) || "Не нашли бронь." };
    return { ok: true, data: d as PortalData };
  } catch {
    return { ok: false, error: "Нет связи с сервером. Проверь интернет." };
  }
}

export async function toggleTask(code: string, surname: string, taskId: string, value: boolean) {
  if (!BACKEND_URL) return { ok: false, error: "Нет связи с сервером" };
  try {
    const r = await fetch(`${BACKEND_URL}/api/portal/${encodeURIComponent(code)}/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: taskId, value, surname }),
    });
    return await r.json();
  } catch {
    return { ok: false, error: "Нет связи с сервером — отметка не сохранена" };
  }
}

export async function saveNotify(code: string, surname: string, payload: Record<string, unknown>) {
  if (!BACKEND_URL) return { ok: false, error: "Нет связи с сервером" };
  try {
    const r = await fetch(`${BACKEND_URL}/api/portal/${encodeURIComponent(code)}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surname, ...payload }),
    });
    return await r.json();
  } catch {
    return { ok: false, error: "Нет связи с сервером" };
  }
}

export async function deletePortalData(code: string, surname: string) {
  if (!BACKEND_URL) return { ok: false, error: "Нет связи с сервером" };
  try {
    const r = await fetch(`${BACKEND_URL}/api/portal/${encodeURIComponent(code)}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surname, confirm: "УДАЛИТЬ" }),
    });
    return await r.json();
  } catch {
    return { ok: false, error: "Нет связи с сервером" };
  }
}

export async function uploadPortalDoc(
  code: string,
  surname: string,
  taskId: string,
  result: unknown,
  fileName: string,
) {
  const r = await fetch(`${BACKEND_URL}/api/portal/${encodeURIComponent(code)}/doc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surname, task: taskId, result, fileName }),
  });
  return await r.json();
}
