import { ADMISSIONS_CONTEXT } from "@/data/admissionsContext";
import { BACKEND_URL } from "./backend";

/* Бесплатные вопросы помощнику (owner, 12 Nov 2026: «мы даём слишком много
   информации бесплатно… надо продумать, где именно сколько дать, чтобы уже
   брали и покупали»). Было 10 вопросов на вкладку (sessionStorage: новая
   вкладка — ещё 10), а номер телефона в форме снимал лимит навсегда: чат
   отвечал на всё, что закрыто в гайдах, и стена обходилась через него.
   Теперь 3 вопроса на устройство (localStorage), дальше — только с
   маршрутом; номер можно оставить, но лимит он не снимает. Устройство с
   оплаченным кабинетом спрашивает без лимита (ChatWidget). */
export const FREE_LIMIT = 3;
const ASKED_KEY = "iitaly_asked_v2";
let askedMemory = 0;

export function askedCount(): number {
  try {
    return parseInt(localStorage.getItem(ASKED_KEY) || "0", 10) || 0;
  } catch {
    return askedMemory;
  }
}

export function bumpAsked() {
  const next = askedCount() + 1;
  askedMemory = next;
  try {
    localStorage.setItem(ASKED_KEY, String(next));
  } catch {
    // хранилище недоступно (приватный режим) — счёт живёт до перезагрузки
  }
}

export function leadCaptured(): boolean {
  try {
    return sessionStorage.getItem("iitaly_lead") === "1";
  } catch {
    return false;
  }
}

export function markLeadCaptured() {
  try {
    sessionStorage.setItem("iitaly_lead", "1");
  } catch {
    // best-effort
  }
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(history: ChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.map((message, index) => index === 0 && message.role === "user"
        ? { ...message, content: "[Проверенная справка сайта]\n" + ADMISSIONS_CONTEXT + "\n[Вопрос пользователя]\n" + message.content }
        : message) }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("chat-unavailable");
    const data = await res.json();
    if (typeof data?.reply !== "string" || !data.reply.trim()) throw new Error("no-reply");
    return data.reply;
  } finally {
    clearTimeout(timeout);
  }
}
