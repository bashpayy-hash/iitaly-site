import { BACKEND_URL } from "./backend";
import type { DocPayload } from "./docPayload";

export type CheckVerdict = "ok" | "warn" | "error" | "unreadable";
export type CheckStatus = "ok" | "warn" | "error" | "unknown";

export interface DocumentReviewContext {
  profile: "general" | "bocconi" | "piemonte" | "toscana" | "ergo";
  academicYear: "unspecified" | "2026/27" | "2027/28";
  applicantScope: "unspecified" | "kz-family-abroad";
}

export interface DocumentReview extends DocumentReviewContext {
  profileLabel: string;
  rulesStatus: "verified" | "unspecified" | "provisional" | "unverified";
  referenceYear: number | null;
  rulesVersion: string;
  verifiedOn: string;
  notice: string;
  sources: { id: string; label: string; url: string }[];
}

export interface DocCheckResult {
  verdict?: CheckVerdict;
  docTitle?: string;
  summary?: string;
  checks?: { status?: CheckStatus; label?: string; note?: string }[];
  problems?: { severity?: "critical" | "minor"; text?: string; fix?: string }[];
  nextSteps?: string[];
  review?: DocumentReview;
}

/**
 * Почему это отдельный класс ошибки, а не просто Error со строкой.
 *
 * Раньше сюда бросался Error("fail") — одно слово на все случаи, — а
 * вызывающий код переводил его в текст сам. Получалось так: сервер
 * отвечает «PDF слишком большой, пришли только нужные страницы», а
 * человек видит «Нет связи с сервером. Проверь интернет». Сообщение с
 * сервера выбрасывалось, и вместо настоящей причины пользователю
 * предлагали чинить интернет — при том что интернет работал.
 *
 * Так терялись ВСЕ содержательные ответы бэкенда: и 413 (файл велик), и
 * 429 (лимит 12 файлов за 5 минут), и 503 (база знаний по документам не
 * загрузилась), и 502 (Anthropic вернул ошибку). Снаружи всё это
 * выглядело одинаково — «проверь интернет», — и понять, что именно
 * сломалось, было нельзя ни пользователю, ни тому, кто чинит.
 *
 * kind отделяет три разные беды, у которых разные виноватые:
 *   no-backend — адрес сервера не задан на сборке (наша ошибка сборки);
 *   network    — запрос не дошёл вовсе: нет сети, DNS, CORS (сеть);
 *   server     — сервер ответил и сказал, что не так (его текст и берём).
 */
export type DocCheckFailureKind = "no-backend" | "network" | "server";

export class DocCheckError extends Error {
  readonly kind: DocCheckFailureKind;
  readonly status?: number;
  readonly code?: string;
  readonly retryable: boolean;

  constructor(kind: DocCheckFailureKind, message: string, status?: number, code?: string, retryable = true) {
    super(message);
    this.name = "DocCheckError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

export type DocumentAvailability = { ok: boolean; code: string; error?: string; retryable: boolean };

export async function getDocumentAvailability(signal?: AbortSignal): Promise<DocumentAvailability> {
  if (!BACKEND_URL) throw new DocCheckError("no-backend", "Проверка заработает после подключения сервера.", undefined, "AI_BACKEND_MISSING", false);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(abort, 10000);
  try {
    const response = await fetch(`${BACKEND_URL}/health/ai`, { cache: "no-store", signal: controller.signal });
    const data = await response.json();
    if (typeof data?.ok !== "boolean" || (data.ok && !response.ok)) throw new Error("Invalid readiness response");
    return { ok: data.ok, code: typeof data.code === "string" ? data.code : "AI_UNAVAILABLE",
      error: typeof data.error === "string" ? data.error : "ИИ-проверка временно недоступна.", retryable: data.retryable !== false };
  } catch {
    throw new DocCheckError("network", "Не удалось проверить доступность сервиса. Попробуй проверить доступность ещё раз.", undefined, "AI_CONNECTION_UNAVAILABLE");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

export async function checkDocument(payload: DocPayload, hint?: string, context?: DocumentReviewContext): Promise<DocCheckResult> {
  if (!BACKEND_URL) {
    throw new DocCheckError(
      "no-backend",
      "Проверка заработает после подключения сервера.",
    );
  }

  // Verify the provider before transmitting the user's document to the backend.
  const availability = await getDocumentAvailability();
  if (!availability.ok) throw new DocCheckError("server", availability.error || "ИИ-проверка временно недоступна.", 503, availability.code, availability.retryable);

  // A short document label is separate from the allowlisted application context.
  // Official rules, verification dates and source URLs are owned by the server.
  const body: Record<string, unknown> = { fileName: payload.fileName || "" };
  if (hint) body.hint = hint;
  if (context) body.context = context;
  if (payload.kind === "pdf") body.pdf = payload.base64;
  else if (payload.kind === "text") body.text = payload.text;
  else {
    body.image = payload.base64;
    body.mediaType = payload.mediaType;
  }

  const controller = new AbortController();
  // Allow the server's 60-second analysis deadline plus upload/response time.
  const timer = setTimeout(() => controller.abort(), 90000);
  let res: Response;
  let raw: string;
  try {
    res = await fetch(`${BACKEND_URL}/api/check-document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    // Include response-body stalls in the deadline as well as connection stalls.
    raw = await res.text();
  } catch {
    throw new DocCheckError(
      "network",
      controller.signal.aborted
        ? "Проверка занимает слишком много времени. Файл остался выбран — попробуй ещё раз через минуту."
        : "Связь с сервером прервалась. Проверь интернет и попробуй снова.",
    );
  } finally {
    clearTimeout(timer);
  }

  /* Читаем текстом, а не res.json(). Ответ не всегда JSON: у хостинга
     свои страницы ошибок (502 от прокси, 504 при засыпании контейнера)
     и приходят они как HTML. res.json() на таком теле бросает
     SyntaxError, и он неотличим от обрыва связи — снова «проверь
     интернет» вместо «сервер отдал 502». */
  let data: { ok?: boolean; error?: unknown; code?: unknown; retryable?: unknown; result?: DocCheckResult } | null = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!data || typeof data !== "object") {
    throw new DocCheckError(
      "server",
      `Сервер ответил не по формату (код ${res.status}). Попробуй ещё раз через минуту.`,
      res.status,
    );
  }

  if (!res.ok || !data.ok) {
    // Текст с сервера показываем как есть: он написан по-русски и для
    // человека — «раздели PDF», «подожди немного», «проверка временно
    // недоступна». Подменять его своим общим текстом значит выкидывать
    // единственную точную подсказку, которая у нас была.
    const fromServer = typeof data.error === "string" ? data.error.trim() : "";
    throw new DocCheckError(
      "server",
      fromServer || `Сервер отказал (код ${res.status}). Попробуй ещё раз через минуту.`,
      res.status,
      typeof data.code === "string" ? data.code : undefined,
      data.retryable !== false,
    );
  }

  return data.result || {};
}
