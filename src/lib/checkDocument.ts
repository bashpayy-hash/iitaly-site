import { BACKEND_URL } from "./backend";
import type { DocPayload } from "./docPayload";

export type CheckVerdict = "ok" | "warn" | "error" | "unreadable";
export type CheckStatus = "ok" | "warn" | "error" | "unknown";

export interface DocCheckResult {
  verdict?: CheckVerdict;
  docTitle?: string;
  summary?: string;
  checks?: { status?: CheckStatus; label?: string; note?: string }[];
  problems?: { severity?: "critical" | "minor"; text?: string; fix?: string }[];
  nextSteps?: string[];
}

export async function checkDocument(payload: DocPayload, hint?: string): Promise<DocCheckResult> {
  if (!BACKEND_URL) {
    throw new Error("no-backend");
  }
  const body: Record<string, unknown> = { fileName: payload.fileName || "" };
  if (hint) body.hint = hint;
  if (payload.kind === "pdf") body.pdf = payload.base64;
  else if (payload.kind === "text") body.text = payload.text;
  else {
    body.image = payload.base64;
    body.mediaType = payload.mediaType;
  }

  const res = await fetch(`${BACKEND_URL}/api/check-document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data || !data.ok) throw new Error((data && data.error) || "fail");
  return data.result || {};
}
