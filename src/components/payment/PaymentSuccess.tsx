"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clearPendingPayment, fetchPaymentStatus, PAY_WA, readPendingPayment, type PendingPayment } from "@/lib/payment";

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

  const check = useCallback(async function checkStatus(attempt = 0) {
    const pending = pendingRef.current;
    if (!pending || stoppedRef.current) return;

    const result = await fetchPaymentStatus(pending.orderId, pending.orderToken);
    if (stoppedRef.current) return;

    if (!result.ok) {
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
        text: "Подтверждение ещё не пришло. Проверь статус ещё раз через минуту. Если деньги списались, повторно платить не нужно.",
      });
      return;
    }

    setView({ kind: "checking", text: "Ждём подтверждение платежа от Stripe. Пока статус не подтверждён, повторно платить не нужно." });
    setTimeout(() => checkStatus(attempt + 1), 1250);
  }, []);

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
  }, [check]);

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
      <div className="mx-auto max-w-[620px] rounded-2xl border border-white/15 bg-bone p-6 text-center sm:p-9" aria-busy={view.kind === "checking"}>
        {view.kind === "activated" ? (
          <>
            <p className="text-apple-caption font-medium text-green uppercase">Оплата подтверждена</p>
            <h1 className="gallery-title mt-3">
              Кабинет уже готов
            </h1>
            <p className="mt-3 text-apple-body-sm text-cloud-body">
              Stripe подтвердил платёж, а IITALY автоматически создал твой маршрут.
            </p>
            <div className="mt-6 rounded-xl border border-subtle bg-surface p-6 text-left ">
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
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-pill bg-crimson px-5 py-2 text-sm font-medium text-paper"
            >
              Открыть кабинет
            </Link>
          </>
        ) : view.kind === "paid" ? (
          <>
            <p className="text-apple-caption font-medium text-green uppercase">Оплата подтверждена</p>
            <h1 className="gallery-title mt-3">Готово</h1>
            <p className="mt-3 text-apple-body-sm text-cloud-body">{view.text}</p>
            <Link href="/" className="mt-6 inline-flex rounded-pill bg-crimson px-5 py-3 text-sm font-medium text-paper">
              На главную
            </Link>
          </>
        ) : (
          <>
            <h1 className="gallery-title mt-3">
              {view.kind === "checking" ? "Подтверждаем оплату" : "Статус оплаты"}
            </h1>
            <p role="status" className="mt-4 text-apple-body-sm text-cloud-body">{view.text}</p>
            {view.kind === "checking" && (
              <span aria-hidden className="mx-auto mt-6 block h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-crimson motion-reduce:animate-none" />
            )}
            {(view.kind === "waiting" || view.kind === "error") && (
              <button
                type="button"
                onClick={retry}
                className="mt-6 rounded-pill bg-crimson px-5 py-3 text-sm font-medium text-paper"
              >
                Проверить ещё раз
              </button>
            )}
            {view.kind === "expired" && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/prices" className="rounded-pill bg-crimson px-5 py-3 text-sm font-medium text-paper">
                  Вернуться к оплате
                </Link>
                <Link href="/portal" className="rounded-pill border border-white/20 px-5 py-3 text-sm text-cloud-white">
                  Личный кабинет
                </Link>
              </div>
            )}
            {(view.kind === "missing" || view.kind === "error" || view.kind === "waiting") && (
              <div className="mt-6 border-t border-white/15 pt-5">
                <p className="text-apple-body-sm text-cloud-body">
                  Уже оплатил, но доступа нет? Напиши в поддержку — поможем найти заказ. Повторно платить не нужно.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <a href={`https://wa.me/${PAY_WA}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-pill border border-crimson px-5 py-3 text-sm font-medium text-crimson">
                    Написать в поддержку
                  </a>
                  <Link href="/portal" className="inline-flex min-h-11 items-center justify-center rounded-pill border border-white/20 px-5 py-3 text-sm text-cloud-white">
                    Войти в кабинет
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
