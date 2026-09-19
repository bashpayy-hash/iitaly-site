import { BACKEND_URL } from "./backend";
import { STRIPE_ENABLED } from "./paymentMode";

export { STRIPE_ENABLED };

export const PAY_MODE: "transfer" | "kaspi" = "transfer";
export const PAY_PHONE = "+7 775 937 0598";
export const PAY_NAME = "Алихан Б.";
export const PAY_WA = "77759370598";

const PENDING_KEY = "iitaly_pending_payment";

export const fmt = (n: number) => n.toLocaleString("ru-RU");

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

export function isValidPhone(phone: string): boolean {
  return /^[+0-9() -]{10,18}$/.test(phone);
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
    const r = await fetch(`${BACKEND_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await r.json().catch(() => null);
    if (!r.ok || !data?.ok) {
      return { ok: false, error: data?.error || "Не удалось отправить заявку. Попробуй ещё раз или напиши в WhatsApp." };
    }
    return { ok: true, orderId: typeof data.orderId === "string" ? data.orderId : undefined };
  } catch {
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
    const r = await fetch(`${BACKEND_URL}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await r.json().catch(() => null);
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
  } catch {
    return { ok: false, error: "Нет связи с сервером. Проверь интернет и попробуй ещё раз." };
  }
}

export async function fetchPaymentStatus(orderId: string, orderToken: string): Promise<PaymentStatusResult> {
  if (!BACKEND_URL) return { ok: false, error: "Нет связи с сервером." };
  try {
    const r = await fetch(`${BACKEND_URL}/api/order/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, orderToken }),
    });
    const data = await r.json().catch(() => null);
    if (!r.ok || !data?.ok) return { ok: false, error: data?.error || "Заказ не найден." };
    return data as PaymentStatusResult;
  } catch {
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
