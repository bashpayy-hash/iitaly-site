"use client";

import { useEffect, useMemo, useState } from "react";
import { BACKEND_URL } from "@/lib/backend";

type Order = {
  id: string;
  status: string;
  createdAt: string;
  product: string;
  price: number | null;
  name: string;
  surname: string;
  phone: string;
  portalCode: string | null;
  activatedAt: string | null;
};

type Client = {
  code: string;
  name: string;
  surname: string;
  phone: string;
  createdAt: string;
  intakeYear: number;
  tgLinked: boolean;
  progress: { done: number; total: number; pct: number };
  sourceOrderId: string | null;
};

type Overview = {
  ok: true;
  orders: Order[];
  clients: Client[];
  reminder: null | { checked: number; sent: number; accepted: number; failed: number; storageErrors: number; at: string };
  storage: { persistent: boolean };
};

function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : "";
}

export function AdminExplorer() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [surnameDrafts, setSurnameDrafts] = useState<Record<string, string>>({});
  const [activated, setActivated] = useState<Record<string, { code: string; name: string; surname: string; phone: string }>>({});

  useEffect(() => {
    try { setKey(sessionStorage.getItem("iitaly_admin_key") || ""); } catch {}
  }, []);

  const pending = useMemo(() => data?.orders.filter(o => o.status !== "activated") || [], [data]);

  async function call(path: string, options: RequestInit = {}) {
    if (!BACKEND_URL) throw new Error("Backend URL не настроен");
    const response = await fetch(BACKEND_URL + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        ...(options.headers || {}),
      },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) throw new Error(body?.error || "Ошибка сервера");
    return body;
  }

  async function load() {
    setBusy("load"); setError("");
    try {
      const body = await call("/api/admin/overview");
      setData(body);
      try { sessionStorage.setItem("iitaly_admin_key", key); } catch {}
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Не удалось загрузить");
    } finally { setBusy(""); }
  }

  async function confirm(order: Order) {
    const surname = (order.surname || surnameDrafts[order.id] || "").trim();
    if (surname.length < 2) {
      setError("Для активации заказа нужна фамилия.");
      return;
    }
    setBusy(order.id); setError("");
    try {
      const body = await call(`/api/admin/orders/${encodeURIComponent(order.id)}/confirm`, {
        method: "POST",
        body: JSON.stringify({ surname }),
      });
      setActivated(prev => ({ ...prev, [order.id]: { code: body.code, name: body.name, surname: body.surname, phone: body.phone } }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось активировать");
      setBusy("");
    }
  }

  async function runReminders() {
    setBusy("reminders"); setError("");
    try {
      await call("/api/admin/reminders/run", { method: "POST", body: "{}" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось запустить reminders");
      setBusy("");
    }
  }

  function accessText(value: { code: string; name: string; surname: string }) {
    return `IITALY: кабинет активирован.\n\nВход: https://iitaly.kz/portal\nФамилия: ${value.surname}\nКод: ${value.code}\n\nПосле входа подключи Telegram в разделе «Помощь → Напоминания».`;
  }

  return (
    <section className="px-5 py-8 sm:py-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-ink-soft uppercase">IITALY ops</p>
            <h1 className="mt-1 text-3xl font-semibold">Admin</h1>
          </div>
          <div className="flex w-full max-w-xl gap-2 sm:w-auto">
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") load(); }}
              placeholder="Admin key"
              autoComplete="current-password"
              className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            />
            <button onClick={load} disabled={!key || busy === "load"} className="rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50">
              {busy === "load" ? "Загрузка…" : "Войти"}
            </button>
          </div>
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg border border-red/30 bg-red/5 p-3 text-sm text-red">{error}</p>}

        {data && (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-paper p-4"><b className="text-2xl">{pending.length}</b><p className="text-sm text-ink-soft">заказов ждут подтверждения</p></div>
              <div className="rounded-xl border border-line bg-paper p-4"><b className="text-2xl">{data.clients.length}</b><p className="text-sm text-ink-soft">активных кабинетов</p></div>
              <div className="rounded-xl border border-line bg-paper p-4"><b className="text-2xl">{data.storage.persistent ? "OK" : "WARN"}</b><p className="text-sm text-ink-soft">persistent storage</p></div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Заказы</h2>
                <p className="text-sm text-ink-soft">Подтверди перевод — кабинет создастся автоматически.</p>
              </div>
              <button onClick={runReminders} disabled={busy === "reminders"} className="rounded-pill border border-line bg-paper px-4 py-2 text-sm font-medium disabled:opacity-50">
                {busy === "reminders" ? "Запускаю…" : "Проверить reminders"}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {data.orders.length === 0 && <div className="rounded-xl border border-line bg-paper p-5 text-sm text-ink-soft">Пока заказов нет.</div>}
              {data.orders.map(order => {
                const ready = activated[order.id] || (order.portalCode ? { code: order.portalCode, name: order.name, surname: order.surname, phone: order.phone } : null);
                return (
                  <article key={order.id} className="rounded-xl border border-line bg-paper p-4 sm:p-5">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="text-xs text-ink-soft">{new Date(order.createdAt).toLocaleString("ru-RU")} · {order.id}</p>
                        <h3 className="mt-1 font-semibold">{order.product}</h3>
                        <p className="mt-1 text-sm">{order.name} {order.surname} · {order.phone}</p>
                      </div>
                      <div className="text-right">
                        <b>{order.price == null ? "—" : order.price.toLocaleString("ru-RU") + " ₸"}</b>
                        <p className="text-xs text-ink-soft">{order.status}</p>
                      </div>
                    </div>

                    {!ready && (
                      <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
                        {!order.surname && (
                          <input
                            value={surnameDrafts[order.id] || ""}
                            onChange={e => setSurnameDrafts(prev => ({ ...prev, [order.id]: e.target.value }))}
                            placeholder="Фамилия"
                            className="min-h-11 rounded-lg border border-line bg-cream px-3 text-sm"
                          />
                        )}
                        <button onClick={() => confirm(order)} disabled={busy === order.id} className="min-h-11 rounded-pill bg-red px-4 text-sm font-semibold text-cream disabled:opacity-50">
                          {busy === order.id ? "Активирую…" : "Подтвердить оплату и создать кабинет"}
                        </button>
                      </div>
                    )}

                    {ready && (
                      <div className="mt-4 rounded-lg bg-cream p-3 text-sm">
                        <b>Кабинет: {ready.code}</b>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button onClick={() => navigator.clipboard.writeText(accessText(ready))} className="rounded-pill border border-line bg-paper px-3 py-2">Скопировать доступ</button>
                          {waLink(ready.phone, accessText(ready)) && <a href={waLink(ready.phone, accessText(ready))} target="_blank" rel="noopener noreferrer" className="rounded-pill bg-ink px-3 py-2 text-cream">Отправить в WhatsApp</a>}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-semibold">Клиенты</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-paper">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead><tr className="border-b border-line text-ink-soft"><th className="p-3">Клиент</th><th className="p-3">Код</th><th className="p-3">Набор</th><th className="p-3">Прогресс</th><th className="p-3">Telegram</th></tr></thead>
                  <tbody>{data.clients.map(client => (
                    <tr key={client.code} className="border-b border-line last:border-0">
                      <td className="p-3">{client.surname} {client.name}</td>
                      <td className="p-3 font-mono">{client.code}</td>
                      <td className="p-3">{client.intakeYear}</td>
                      <td className="p-3">{client.progress.done}/{client.progress.total} · {client.progress.pct}%</td>
                      <td className="p-3">{client.tgLinked ? "подключён" : "нет"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-line bg-paper p-4 text-sm">
              <b>Reminder health</b>
              <p className="mt-1 text-ink-soft">
                {data.reminder ? `Последний запуск: ${new Date(data.reminder.at).toLocaleString("ru-RU")} · accepted ${data.reminder.accepted} · failed ${data.reminder.failed} · storage errors ${data.reminder.storageErrors}` : "После текущего деплоя reminder-run ещё не выполнялся."}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
