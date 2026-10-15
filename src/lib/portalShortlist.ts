import { UNIS } from "@/data/italy";

const universityIds = new Set(UNIS.map(university => university.id));
export function validShortlist(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && universityIds.has(id)))] : [];
}

// The existing portal API has no university field. Keep the browser list scoped
// to the authenticated account; never send invented profile fields to the API.
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
