"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clearPendingPayment, fetchPaymentStatus, readPendingPayment, type PendingPayment } from "@/lib/payment";

type View =
  | { kind: "checking"; text: string }
  | { kind: "waiting"; text: string }
  | { kind: "activated"; code: string; surname: string }
  | { kind: "paid"; text: string }
  | { kind: "expired"; text: string }
  | { kind: "missing"; text: string }
  | { kind: "error"; text: string };

const PORTAL_CODE = "iitaly_portal_code";
const PORTAL_SURNAME = "iitaly_portal_surname";

export function PaymentSuccess() {
  const [view, setView] = useState<View>({ kind: "checking", text: "Проверяем подтверждение Stripe…" });
  const [copied, setCopied] = useState(false);
  const pendingRef = useRef<PendingPayment | null>(null);
  const stoppedRef = useRef(false);

  async function check(attempt = 0) {
    const pending = pendingRef.current;
    if (!pending || stoppedRef.current) return;

    const result = await fetchPaymentStatus(pending.orderId, pending.orderToken);
    if (stoppedRef.current) return;

    if (!result.ok) {
      if (attempt < 3) {
        setTimeout(() => check(attempt + 1), 1200);
        return;
      }
      setView({ kind: "error", text: result.error });
      return;
    }

    if (result.status === "activated" && result.portal) {
      try {
        localStorage.setItem(PORTAL_CODE, result.portal.code);
        localStorage.setItem(PORTAL_SURNAME, result.portal.surname);
      } catch {}
      clearPendingPayment();
      setView({ kind: "activated", code: result.portal.code, surname: result.portal.surname });
      return;
    }

    if (result.status === "paid" && result.fulfillment === "manual") {
      clearPendingPayment();
      setView({
        kind: "paid",
        text: "Оплата получена. Для этой услуги кабинет не нужен — мы свяжемся по оставленному номеру.",
      });
      return;
    }

    if (result.status === "expired") {
      clearPendingPayment();
      setView({ kind: "expired", text: "Stripe-сессия истекла без подтверждённой оплаты." });
      return;
    }

    if (attempt >= 24) {
      setView({
        kind: "waiting",
        text: "Пока нет подтверждения оплаты. Подожди немного и проверь статус ещё раз. Если деньги списались, не оплачивай повторно.",
      });
      return;
    }

    setView({ kind: "checking", text: "Ждём подтверждение оплаты от Stripe…" });
    setTimeout(() => check(attempt + 1), 1250);
  }

  useEffect(() => {
    stoppedRef.current = false;
    const timer = setTimeout(() => {
      const pending = readPendingPayment();
      pendingRef.current = pending;
      if (!pending) {
        setView({
          kind: "missing",
          text: "В этой вкладке нет данных платёжной сессии. Если деньги списались, не оплачивай повторно.",
        });
        return;
      }
      check();
    }, 0);
    return () => {
      stoppedRef.current = true;
      clearTimeout(timer);
    };
  }, []);

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  function retry() {
    if (!pendingRef.current) {
      const pending = readPendingPayment();
      pendingRef.current = pending;
    }
    if (!pendingRef.current) {
      setView({ kind: "missing", text: "Не нашли локальные данные заказа." });
      return;
    }
    setView({ kind: "checking", text: "Проверяем статус ещё раз…" });
    check();
  }

  return (
    <section className="px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-[620px] rounded-2xl border border-white/15 bg-black/20 p-6 text-center backdrop-blur-sm sm:p-9">
        {view.kind === "activated" ? (
          <>
            <p className="text-apple-caption font-semibold text-green uppercase">Оплата подтверждена</p>
            <h1 className="mt-3 font-apple-display text-apple-heading font-semibold text-cloud-white">
              Кабинет уже готов
            </h1>
            <p className="mt-3 text-apple-body-sm text-cloud-body">
              Stripe подтвердил платёж, а IITALY автоматически создал твой маршрут.
            </p>
            <div className="mt-6 rounded-xl border border-white/15 bg-carbon p-4 text-left">
              <p className="text-apple-caption text-cloud-meta">Фамилия</p>
              <b className="text-cloud-white">{view.surname}</b>
              <p className="mt-4 text-apple-caption text-cloud-meta">Код кабинета</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <b className="font-mono text-lg text-cloud-white">{view.code}</b>
                <button
                  type="button"
                  onClick={() => copy(view.code)}
                  className="rounded-pill border border-white/20 px-3 py-2 text-xs text-cloud-white"
                >
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
            </div>
            <Link
              href="/portal"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-pill bg-crimson px-5 py-2 text-sm font-semibold text-white"
            >
              Открыть кабинет
            </Link>
          </>
        ) : view.kind === "paid" ? (
          <>
            <p className="text-apple-caption font-semibold text-green uppercase">Оплата подтверждена</p>
            <h1 className="mt-3 font-apple-display text-apple-heading font-semibold text-cloud-white">Готово</h1>
            <p className="mt-3 text-apple-body-sm text-cloud-body">{view.text}</p>
            <Link href="/" className="mt-6 inline-flex rounded-pill bg-crimson px-5 py-3 text-sm font-semibold text-white">
              На главную
            </Link>
          </>
        ) : (
          <>
            <p className="text-apple-caption font-semibold text-crimson uppercase">Stripe checkout</p>
            <h1 className="mt-3 font-apple-display text-apple-heading font-semibold text-cloud-white">
              {view.kind === "checking" ? "Подтверждаем оплату" : "Статус оплаты"}
            </h1>
            <p className="mt-4 text-apple-body-sm text-cloud-body">{view.text}</p>
            {view.kind === "checking" && (
              <span aria-hidden className="mx-auto mt-6 block h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-crimson motion-reduce:animate-none" />
            )}
            {(view.kind === "waiting" || view.kind === "error") && (
              <button
                type="button"
                onClick={retry}
                className="mt-6 rounded-pill bg-crimson px-5 py-3 text-sm font-semibold text-white"
              >
                Проверить ещё раз
              </button>
            )}
            {(view.kind === "expired" || view.kind === "missing") && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/prices" className="rounded-pill bg-crimson px-5 py-3 text-sm font-semibold text-white">
                  Вернуться к оплате
                </Link>
                <Link href="/portal" className="rounded-pill border border-white/20 px-5 py-3 text-sm text-cloud-white">
                  Личный кабинет
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
