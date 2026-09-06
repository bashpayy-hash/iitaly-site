import { BACKEND_URL } from "./backend";

function deviceId(): string {
  try {
    const key = "iitaly_did";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "w-unknown";
  }
}

export function track(event: string, props: Record<string, unknown> = {}) {
  if (!BACKEND_URL) return;
  try {
    fetch(`${BACKEND_URL}/api/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, deviceId: deviceId(), props }),
    }).catch(() => {});
  } catch {
    // localStorage or fetch unavailable — analytics is best-effort
  }
}
