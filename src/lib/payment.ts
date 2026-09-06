import { BACKEND_URL } from "./backend";

// Портировано из старого сайта (index.html, PAY_MODE/PAY_PHONE/PAY_NAME/PAY_WA).
export const PAY_MODE: "transfer" | "kaspi" = "transfer";
export const PAY_PHONE = "+7 775 937 0598";
export const PAY_NAME = "Алихан Б.";
export const PAY_WA = "77759370598";

export const fmt = (n: number) => n.toLocaleString("ru-RU");

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

export function isValidPhone(phone: string): boolean {
  return /^[+0-9() -]{10,18}$/.test(phone);
}

export async function submitOrder(fields: { product: string; price: number; name: string; phone: string }) {
  if (!BACKEND_URL) return { ok: true };
  try {
    const r = await fetch(`${BACKEND_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await r.json();
    if (!data || !data.ok) throw new Error("bad");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function whatsappLink(product: string, price: number) {
  const text = encodeURIComponent(
    `Здравствуйте! Оформил заказ: ${product} — ${fmt(price)} ₸. Отправляю чек об оплате.`,
  );
  return `https://wa.me/${PAY_WA}?text=${text}`;
}
