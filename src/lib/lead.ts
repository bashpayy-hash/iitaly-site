import { BACKEND_URL } from "./backend";

export { isValidPhone } from "./phone";

type LeadSubmission = { ok: true } | { ok: false; error: string };

export async function submitLead(fields: Record<string, string>): Promise<LeadSubmission> {
  const error = "Не удалось отправить номер. Попробуй ещё раз чуть позже.";
  if (!BACKEND_URL) return { ok: false, error };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${BACKEND_URL}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false, error };
    const data = await response.json();
    return data?.ok === true ? { ok: true } : { ok: false, error };
  } catch {
    return { ok: false, error };
  } finally {
    clearTimeout(timeout);
  }
}
