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

export type OrderResult = { ok: true } | { ok: false; error: string };

/* Заказ — единственное место, где у нас на кону деньги человека, поэтому
   здесь нельзя врать об успехе.

   Раньше при пустом BACKEND_URL функция возвращала { ok: true }: если
   переменная не доехала до сборки (а она вшивается на этапе сборки, а не
   читается в рантайме), студент видел «заявка принята», а на сервер не
   уходило ничего. Заявка исчезала бесследно, и узнать об этом можно было
   только от самого человека. Теперь любой сбой — честная ошибка, и у
   пользователя остаётся рабочий запасной путь: написать в WhatsApp. */
export async function submitOrder(fields: {
  product: string;
  price: number;
  name: string;
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
    if (!r.ok || !data || !data.ok) {
      // 429 от сервера приходит с понятным текстом — показываем его, а не общий
      return { ok: false, error: (data && data.error) || "Не удалось отправить заявку. Попробуй ещё раз или напиши в WhatsApp." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Нет связи с сервером. Проверь интернет или напиши в WhatsApp." };
  }
}

export function whatsappLink(product: string, price: number) {
  const text = encodeURIComponent(
    `Здравствуйте! Оформил заказ: ${product} — ${fmt(price)} ₸. Отправляю чек об оплате.`,
  );
  return `https://wa.me/${PAY_WA}?text=${text}`;
}
