import { BACKEND_URL } from "./backend";

export async function submitLead(fields: Record<string, string>) {
  if (!BACKEND_URL) return;
  try {
    await fetch(`${BACKEND_URL}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  } catch {
    // best-effort — the wizard/chat flow continues regardless
  }
}

export function isValidPhone(phone: string): boolean {
  return /^[+0-9() -]{10,18}$/.test(phone);
}
