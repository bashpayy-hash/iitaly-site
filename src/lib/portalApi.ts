import { BACKEND_URL } from "./backend";

// Типы данных кабинета — форма ответа /api/portal/:code, выведена из
// старого сайта (index.html, IIFE «ЛИЧНЫЙ КАБИНЕТ»). Кабинет полностью
// управляется бэкендом: маршрут, прогресс и документы приходят с сервера.

export interface PortalTask {
  id: string;
  t: string;
  explain?: string | null;
  owner?: string;
  time?: string | null;
  available?: boolean;
  timingLabel?: string | null;
  deadline?: string | null;
  deadlineKind?: string | null;
  daysLeft?: number | null;
  ai?: boolean;
  expert?: boolean;
  note?: string | null;
  warn?: string | null;
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

export interface PortalProfile {
  education?: string;
  goal?: string;
  budget?: string;
  educationPath?: "university_kz" | "foundation";
  onboardingDone?: boolean;
}

export interface PortalClient {
  name: string;
  surname?: string;
  tier?: string;
  intakeYear?: number;
  tgLinked?: boolean;
  botName?: string;
  email?: string;
  notify?: { email?: boolean; telegram?: boolean };
  profile?: PortalProfile;
  onboardingComplete?: boolean;
}

export interface PortalData {
  client: PortalClient;
  roadmap: PortalStage[];
  done: Record<string, boolean>;
  docs: Record<string, PortalDoc>;
  progress: { done: number; total: number; pct: number };
}

export type PortalResult = { ok: true; data: PortalData } | { ok: false; error: string };

/* Вход в кабинет идёт через POST /api/portal/lookup: код и фамилия лежат
   в теле запроса, а не в адресе. В прежнем GET /api/portal/:code?surname=
   учётные данные кабинета попадали в путь и query-строку, а значит — в
   журналы Railway, CDN и всех прокси по дороге.

   Откат на старый GET нужен потому, что фронтенд и бэкенд выкатываются
   порознь: если сайт обновится раньше сервера, новый адрес вернёт 404, и
   без этого отката кабинет перестал бы открываться до выката бэкенда. */
export async function fetchPortal(code: string, surname: string): Promise<PortalResult> {
  if (!BACKEND_URL) return { ok: false, error: "Кабинет заработает после подключения сервера." };
  try {
    let r = await fetch(`${BACKEND_URL}/api/portal/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, surname }),
    });
    if (r.status === 404 || r.status === 405) {
      // 404 здесь двусмысленный: это либо «нет такого маршрута» на старом
      // сервере, либо «не нашли бронь» на новом. Различаем по телу: новый
      // отвечает JSON с полем error, старый — HTML-страницей Express.
      const legacy = await r.clone().json().catch(() => null);
      if (!legacy || typeof legacy.ok !== "boolean") {
        r = await fetch(
          `${BACKEND_URL}/api/portal/${encodeURIComponent(code)}?surname=${encodeURIComponent(surname)}`,
        );
      }
    }
    const d = await r.json().catch(() => null);
    if (!d || !d.ok) return { ok: false, error: (d && d.error) || "Не нашли бронь." };
    return { ok: true, data: d as PortalData };
  } catch {
    return { ok: false, error: "Нет связи с сервером. Проверь интернет." };
  }
}

export async function savePortalProfile(
  code: string,
  surname: string,
  payload: {
    education?: string;
    goal?: string;
    budget?: string;
    educationPath?: "university_kz" | "foundation" | null;
    onboardingDone?: boolean;
  },
): Promise<PortalResult> {
  if (!BACKEND_URL) return { ok: false, error: "Нет связи с сервером" };
  try {
    const r = await fetch(`${BACKEND_URL}/api/portal/${encodeURIComponent(code)}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surname, ...payload }),
    });
    const d = await r.json().catch(() => null);
    if (!r.ok || !d?.ok) return { ok: false, error: d?.error || "Не удалось сохранить профиль." };
    return { ok: true, data: d as PortalData };
  } catch {
    return { ok: false, error: "Нет связи с сервером" };
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


export type TelegramLinkResult =
  | { ok: true; url: string; expiresAt: string }
  | { ok: false; error: string };

export async function createTelegramLink(code: string, surname: string): Promise<TelegramLinkResult> {
  if (!BACKEND_URL) return { ok: false, error: "Нет связи с сервером" };
  try {
    const r = await fetch(`${BACKEND_URL}/api/portal/${encodeURIComponent(code)}/telegram-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surname }),
    });
    const d = await r.json().catch(() => null);
    if (!r.ok || !d?.ok || typeof d.url !== "string") {
      return { ok: false, error: d?.error || "Не удалось создать ссылку Telegram" };
    }
    return { ok: true, url: d.url, expiresAt: String(d.expiresAt || "") };
  } catch {
    return { ok: false, error: "Нет связи с сервером" };
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
  // Единственная функция здесь, которая раньше не проверяла адрес бэкенда
  // и не ловила ошибку сети: при обрыве связи падало исключение прямо в
  // обработчик загрузки документа, и вместо сообщения человек видел
  // зависший экран.
  if (!BACKEND_URL) return { ok: false, error: "Нет связи с сервером" };
  try {
    const r = await fetch(`${BACKEND_URL}/api/portal/${encodeURIComponent(code)}/doc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surname, task: taskId, result, fileName }),
    });
    return await r.json();
  } catch {
    return { ok: false, error: "Нет связи с сервером — результат проверки не сохранён" };
  }
}
