import { BACKEND_URL } from "./backend";

/* «Не помню код» (owner, 20 Nov: «Почему для восстановления пароля он должен
   писать WhatsApp? У нас нету формы восстановления?» — «Да, давай делай»).

   POST /api/portal/recover принимает фамилию и телефон, указанные при оплате.
   Сервер отправляет код только в Telegram и на почту, которые клиент подключил
   сам, и отвечает одинаково, есть такой кабинет или нет. Код в браузер не
   приходит никогда.

   Сайт и сервер выкатываются порознь. Пока на сервере нет этого маршрута
   (старый Express отвечает 404 HTML-страницей), а также при сбое сети или
   сервера, форма честно говорит, что код пришлют вручную, и даёт WhatsApp. */

export type RecoveryResult =
  | { ok: true }
  | { ok: false; kind: "invalid"; error: string }
  | { ok: false; kind: "unavailable" };

export async function requestPortalCode(surname: string, phone: string): Promise<RecoveryResult> {
  if (!BACKEND_URL) return { ok: false, kind: "unavailable" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${BACKEND_URL}/api/portal/recover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surname, phone }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (response.ok && data?.ok === true) return { ok: true };
    if ((response.status === 400 || response.status === 429) && typeof data?.error === "string") {
      return { ok: false, kind: "invalid", error: data.error };
    }
    return { ok: false, kind: "unavailable" };
  } catch {
    return { ok: false, kind: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
