import { UNIS } from "@/data/italy";

const universityIds = new Set(UNIS.map(university => university.id));
export function validShortlist(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && universityIds.has(id)))] : [];
}

// Account-scoped cache and offline fallback for the authenticated profile list.
export async function portalShortlistKey(code: string, surname: string): Promise<string> {
  const identity = JSON.stringify([code.trim().toUpperCase(), surname.trim().toLocaleLowerCase("ru").replace(/ё/g, "е").replace(/\s+/g, " ")]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity));
  return "iitaly_portal_shortlist_v1:" + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function readShortlist(key: string): string[] {
  try { return validShortlist(JSON.parse(localStorage.getItem(key) || "[]")); }
  catch { return []; }
}

export function writeShortlist(key: string, ids: string[]): string[] {
  const valid = validShortlist(ids);
  if (!valid.length) throw new Error("Выбери хотя бы один университет.");
  const serialized = JSON.stringify(valid);
  localStorage.setItem(key, serialized);
  if (localStorage.getItem(key) !== serialized) throw new Error("Выбор не сохранился.");
  return valid;
}

export function shortlistNames(ids: string[]): string[] {
  return validShortlist(ids).map(id => UNIS.find(university => university.id === id)!.name);
}

export function shortlistPending(key: string): boolean {
  try { return localStorage.getItem(`${key}:pending`) === "true"; } catch { return false; }
}
export function markShortlistPending(key: string, pending: boolean) {
  try { if (pending) localStorage.setItem(`${key}:pending`, "true"); else localStorage.removeItem(`${key}:pending`); } catch {}
}

/** Do not interpret catalogue phrases or roadmap orientirs as admission dates. */
export function selectedUniversities(ids: string[], now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return validShortlist(ids).map(id => {
    const university = UNIS.find(item => item.id === id)!;
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(university.dl) ? university.dl : "";
    const date = iso ? Date.parse(`${iso}T00:00:00Z`) : NaN;
    const exact = Number.isFinite(date) && new Date(date).toISOString().slice(0, 10) === iso;
    const relevant = exact && date >= today;
    return { id, name: university.name, deadline: relevant ? iso : "", days: relevant ? Math.ceil((date - today) / 86400000) : null };
  });
}
export function nearestUniversityDeadline(ids: string[]) {
  const next = selectedUniversities(ids).filter(item => item.days !== null).sort((a, b) => a.days! - b.days!)[0];
  return next ? `До подачи в ${next.name}: ${next.days} дней` : undefined;
}
