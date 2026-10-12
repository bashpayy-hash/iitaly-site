import { BACKEND_URL } from "./backend";
import { STRIPE_ENABLED } from "./paymentMode";

export { STRIPE_ENABLED };
export { isValidPhone } from "./phone";

export const PAY_MODE: "transfer" | "kaspi" = "transfer";
export const PAY_PHONE = "+7 775 937 0598";
export const PAY_NAME = "Алихан Б.";
export const PAY_WA = "77759370598";

const PENDING_KEY = "iitaly_pending_payment";

export const fmt = (n: number) => n.toLocaleString("ru-RU");

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

// Keep checkout and its JSON response bounded, including a stalled response body.
// An aborted request does not confirm or cancel a payment on the server.
async function paymentRequest(path: string, fields: Record<string, unknown>) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
      signal: controller.signal,
    });
    const data = await response.json().catch((error: unknown) => {
      if (controller.signal.aborted) throw error;
      return null;
    });
    return { response, data };
  } finally {
    clearTimeout(timer);
  }
}

function isTimeout(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export type OrderResult = { ok: true; orderId?: string } | { ok: false; error: string };

export async function submitOrder(fields: {
  product: string;
  price: number;
  name: string;
  surname?: string;
  phone: string;
}): Promise<OrderResult> {
  if (!BACKEND_URL) {
    return { ok: false, error: "Приём заявок временно не работает. Напиши в WhatsApp — оформим вручную." };
  }
  try {
    const { response: r, data } = await paymentRequest("/api/order", fields);
    if (!r.ok || !data?.ok) {
      return { ok: false, error: data?.error || "Не удалось отправить заявку. Попробуй ещё раз или напиши в WhatsApp." };
    }
    return { ok: true, orderId: typeof data.orderId === "string" ? data.orderId : undefined };
  } catch (error) {
    if (isTimeout(error)) return { ok: false, error: "Сервер отвечает дольше обычного. Данные остались в форме — попробуй ещё раз или напиши в WhatsApp." };
    return { ok: false, error: "Нет связи с сервером. Проверь интернет или напиши в WhatsApp." };
  }
}

export type StripeCheckoutResult =
  | { ok: true; url: string; orderId: string; orderToken: string }
  | { ok: false; error: string };

export type PaymentStatusResult =
  | {
      ok: true;
      status: string;
      fulfillment: "portal" | "manual";
      paidAt?: string | null;
      portal?: { code: string; surname: string };
    }
  | { ok: false; error: string };

export interface PendingPayment {
  orderId: string;
  orderToken: string;
  product: string;
  createdAt: string;
}

export async function startStripeCheckout(fields: {
  product: string;
  name: string;
  surname: string;
  phone: string;
}): Promise<StripeCheckoutResult> {
  if (!STRIPE_ENABLED) {
    return { ok: false, error: "Оплата картой пока не включена." };
  }
  if (!BACKEND_URL) {
    return { ok: false, error: "Оплата временно недоступна: сервер не подключён." };
  }
  try {
    const { response: r, data } = await paymentRequest("/api/stripe/checkout", fields);
    if (!r.ok || !data?.ok || typeof data.url !== "string" ||
        typeof data.orderId !== "string" || typeof data.orderToken !== "string") {
      return { ok: false, error: data?.error || "Не удалось открыть Stripe Checkout." };
    }
    const result = {
      ok: true as const,
      url: data.url,
      orderId: data.orderId,
      orderToken: data.orderToken,
    };
    savePendingPayment({
      orderId: result.orderId,
      orderToken: result.orderToken,
      product: fields.product,
      createdAt: new Date().toISOString(),
    });
    return result;
  } catch (error) {
    if (isTimeout(error)) return { ok: false, error: "Не удалось открыть оплату вовремя. Данные остались в форме — попробуй ещё раз." };
    return { ok: false, error: "Нет связи с сервером. Проверь интернет и попробуй ещё раз." };
  }
}

export async function fetchPaymentStatus(orderId: string, orderToken: string): Promise<PaymentStatusResult> {
  if (!BACKEND_URL) return { ok: false, error: "Нет связи с сервером." };
  try {
    const { response: r, data } = await paymentRequest("/api/order/status", { orderId, orderToken });
    if (!r.ok || !data?.ok) return { ok: false, error: data?.error || "Заказ не найден." };
    return data as PaymentStatusResult;
  } catch (error) {
    if (isTimeout(error)) return { ok: false, error: "Не удалось получить статус вовремя. Если деньги списались, не оплачивай повторно — проверь статус ещё раз или напиши в поддержку." };
    return { ok: false, error: "Нет связи с сервером." };
  }
}

export function savePendingPayment(value: PendingPayment) {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(value)); } catch {}
}

export function readPendingPayment(): PendingPayment | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value.orderId !== "string" || typeof value.orderToken !== "string") return null;
    return value as PendingPayment;
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  try { sessionStorage.removeItem(PENDING_KEY); } catch {}
}

export function whatsappLink(product: string, price: number) {
  const text = encodeURIComponent(
    `Здравствуйте! Оформил заказ: ${product} — ${fmt(price)} ₸. Отправляю чек об оплате.`,
  );
  return `https://wa.me/${PAY_WA}?text=${text}`;
}
