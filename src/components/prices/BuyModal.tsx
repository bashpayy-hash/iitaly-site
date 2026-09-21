"use client";

import { useState } from "react";
import { AppleModal } from "@/components/apple/Modal";
import { AppleButton } from "@/components/apple/Button";
import { track } from "@/lib/track";
import styles from "@/components/marketing/marketing.module.css";
import {
  STRIPE_ENABLED,
  PAY_NAME,
  PAY_PHONE,
  fmt,
  isValidName,
  isValidPhone,
  startStripeCheckout,
  submitOrder,
  whatsappLink,
} from "@/lib/payment";

export interface BuyProduct {
  name: string;
  price: number;
}

type Step = "form" | "sending" | "manual";

export function BuyModal({ product, onClose }: { product: BuyProduct | null; onClose: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setStep("form");
    setName("");
    setSurname("");
    setPhone("");
    setError(null);
    setCopied(false);
  }

  function close() {
    if (step === "sending") return;
    onClose();
    setTimeout(reset, 200);
  }

  async function submit() {
    if (!product || step === "sending") return;
    if (!isValidName(name) || !isValidName(surname) || !isValidPhone(phone)) {
      setError("Проверь имя, фамилию и телефон.");
      return;
    }

    setError(null);
    setStep("sending");

    if (STRIPE_ENABLED) {
      const result = await startStripeCheckout({
        product: product.name,
        name: name.trim(),
        surname: surname.trim(),
        phone: phone.trim(),
      });
      if (!result.ok) {
        setError(result.error);
        setStep("form");
        return;
      }
      track("order_submitted", { product: product.name, price: product.price, provider: "stripe" });
      track("lead_submitted", { product: product.name, price: product.price, from: "buy_modal" });
      window.location.assign(result.url);
      return;
    }

    const result = await submitOrder({
      product: product.name,
      price: product.price,
      name: name.trim(),
      surname: surname.trim(),
      phone: phone.trim(),
    });
    if (!result.ok) {
      setError(result.error);
      setStep("form");
      return;
    }
    track("order_submitted", { product: product.name, price: product.price, provider: "manual" });
    track("lead_submitted", { product: product.name, price: product.price, from: "buy_modal" });
    setStep("manual");
  }

  async function copyPhone() {
    const num = PAY_PHONE.replace(/[^0-9+]/g, "");
    try {
      await navigator.clipboard.writeText(num);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <AppleModal open={!!product} onClose={close} labelledBy="buy-modal-title" className="max-w-md">
      {product && (
        <div className="px-6 pt-1 pb-6">
          {step === "form" && (
            <form noValidate onSubmit={(event) => { event.preventDefault(); void submit(); }}>
              <h3 id="buy-modal-title" className="font-apple-display text-apple-subheading font-semibold text-cloud-white">
                {product.name}
              </h3>
              <p className="mt-1 font-apple-display text-apple-heading-sm font-semibold text-crimson">
                {fmt(product.price)} ₸
              </p>

              {STRIPE_ENABLED ? (
                <p className="mt-3 text-apple-body-sm text-cloud-body">
                  Безопасная оплата через Stripe. Доступные карта, Apple Pay, Google Pay и другие
                  совместимые способы Stripe покажет автоматически.
                </p>
              ) : (
                <p className="mt-3 text-apple-body-sm text-cloud-body">
                  Оставь данные заказа. После оформления покажем реквизиты для перевода.
                </p>
              )}

              <label className="mt-4 block">
                <span className={styles.fieldLabel}>Имя</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя"
                  autoComplete="given-name"
                  aria-invalid={!!error && !isValidName(name) || undefined}
                  aria-describedby={error ? "checkout-error" : undefined}
                  className={styles.formInput} />
              </label>
              <label className="mt-2.5 block">
                <span className={styles.fieldLabel}>Фамилия</span>
                <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Фамилия"
                  autoComplete="family-name"
                  aria-invalid={!!error && !isValidName(surname) || undefined}
                  aria-describedby={error ? "checkout-error" : undefined}
                  className={styles.formInput} />
              </label>
              <label className="mt-2.5 block">
                <span className={styles.fieldLabel}>Телефон</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон / WhatsApp"
                  type="tel" inputMode="tel" autoComplete="tel"
                  aria-invalid={!!error && !isValidPhone(phone) || undefined}
                  aria-describedby={error ? "checkout-error" : undefined}
                  className={styles.formInput} />
              </label>

              {error && <p id="checkout-error" role="alert" className="mt-3 text-apple-caption font-semibold text-red">{error}</p>}

              <AppleButton type="submit" variant="filled" className="mt-5 w-full">
                {STRIPE_ENABLED ? "Перейти к оплате" : "Оформить заказ"}
              </AppleButton>

              <p className="mt-2.5 text-center text-apple-caption text-cloud-meta">
                {STRIPE_ENABLED
                  ? "Реквизиты карты вводятся только на защищённой странице Stripe и не проходят через сервер IITALY."
                  : "После подтверждения платежа мы активируем доступ или свяжемся по выбранной услуге."}
              </p>
              <p className="mt-2 text-center text-apple-caption text-cloud-meta">
                Продолжая, ты принимаешь <a href="/terms" className="underline underline-offset-2">условия сервиса</a> и{" "}
                <a href="/privacy" className="underline underline-offset-2">политику конфиденциальности</a>.
              </p>
            </form>
          )}

          {step === "sending" && (
            <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-10 text-center">
              <span aria-hidden className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-crimson motion-reduce:animate-none" />
              <p id="buy-modal-title" className="font-apple-display text-apple-subheading font-semibold text-cloud-white">
                {STRIPE_ENABLED ? "Открываю Stripe…" : "Оформляю заказ…"}
              </p>
            </div>
          )}

          {step === "manual" && (
            <div>
              <div className="text-center">
                <div aria-hidden className="text-4xl">✅</div>
                <p id="buy-modal-title" className="mt-2 font-apple-display text-apple-subheading font-semibold text-cloud-white">Заказ принят</p>
                <p className="mt-1 text-apple-body-sm text-cloud-body">
                  Переведи сумму и пришли чек — после подтверждения мы активируем доступ или начнём выполнение услуги.
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-carbon text-apple-caption font-semibold text-white">1</div>
                <div className="min-w-0 flex-1">
                  <b className="text-apple-body-sm text-cloud-white">Переведи {fmt(product.price)} ₸</b>
                  <div className="mt-2 flex items-center justify-between gap-2 border border-white/15 px-3 py-2.5">
                    <span className="font-apple-display text-apple-subheading font-semibold text-cloud-white">{PAY_PHONE}</span>
                    <button type="button" onClick={copyPhone}
                      className="shrink-0 rounded-apple-pill border border-white/20 px-3 py-1.5 text-apple-caption font-semibold text-cloud-white">
                      {copied ? "Скопировано" : "Копировать"}
                    </button>
                  </div>
                  <span className="mt-1.5 block text-apple-caption text-cloud-meta">
                    Получатель: {PAY_NAME} · в комментарии «{product.name}»
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-carbon text-apple-caption font-semibold text-white">2</div>
                <div className="min-w-0 flex-1">
                  <b className="text-apple-body-sm text-cloud-white">Пришли чек в WhatsApp</b>
                  <a href={whatsappLink(product.name, product.price)} target="_blank" rel="noopener noreferrer"
                    className="mt-2.5 block rounded-apple-pill bg-crimson px-4 py-3 text-center text-apple-body-sm font-semibold text-white">
                    Открыть WhatsApp
                  </a>
                </div>
              </div>

              <p className="mt-5 text-apple-caption text-cloud-meta">
                До 7 календарных дней с оплаты вернём деньги полностью, если кабинет ещё не активирован
                и персональный маршрут не выдан.
              </p>
              <AppleButton type="button" variant="outlined" onClick={close} className="mt-3 w-full">Закрыть</AppleButton>
            </div>
          )}
        </div>
      )}
    </AppleModal>
  );
}
