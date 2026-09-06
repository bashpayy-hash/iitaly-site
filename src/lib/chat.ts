import { BACKEND_URL } from "./backend";

export const FREE_LIMIT = 10;

export function askedCount(): number {
  try {
    return parseInt(sessionStorage.getItem("iitaly_asked") || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function bumpAsked() {
  try {
    sessionStorage.setItem("iitaly_asked", String(askedCount() + 1));
  } catch {
    // sessionStorage unavailable — the free-question limit just won't persist
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
  const res = await fetch(`${BACKEND_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
  });
  const data = await res.json();
  if (!data || !data.reply) throw new Error("no-reply");
  return data.reply as string;
}
