"use client";

import { useState } from "react";
import { AppleModal } from "@/components/apple/Modal";
import { AppleButton } from "@/components/apple/Button";
import { track } from "@/lib/track";
import { fmt, isValidName, isValidPhone, startStripeCheckout } from "@/lib/payment";

export interface BuyProduct {
  name: string;
  price: number;
}

type Step = "form" | "sending";

export function BuyModal({ product, onClose }: { product: BuyProduct | null; onClose: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep("form");
    setName("");
    setSurname("");
    setPhone("");
    setError(null);
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
  }

  return (
    <AppleModal open={!!product} onClose={close} labelledBy="buy-modal-title" className="max-w-md">
      {product && (
        <div className="p-6">
          {step === "form" ? (
            <>
              <h3 id="buy-modal-title" className="font-apple-display text-apple-subheading font-semibold text-cloud-white">
                {product.name}
              </h3>
              <p className="mt-1 font-apple-display text-apple-heading-sm font-semibold text-crimson">
                {fmt(product.price)} ₸
              </p>
              <p className="mt-3 text-apple-body-sm text-cloud-body">
                Безопасная оплата через Stripe. Доступные карта, Apple Pay и Google Pay
                появятся на странице Stripe в зависимости от устройства и настроек аккаунта.
              </p>

              <label className="mt-4 block">
                <span className="sr-only">Имя</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Имя"
                  autoComplete="given-name"
                  className="w-full border-0 border-b border-white/25 bg-transparent px-1 py-3 text-apple-body-sm text-cloud-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                />
              </label>
              <label className="mt-2.5 block">
                <span className="sr-only">Фамилия</span>
                <input
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Фамилия"
                  autoComplete="family-name"
                  className="w-full border-0 border-b border-white/25 bg-transparent px-1 py-3 text-apple-body-sm text-cloud-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                />
              </label>
              <label className="mt-2.5 block">
                <span className="sr-only">Телефон</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Телефон"
                  inputMode="tel"
                  autoComplete="tel"
                  className="w-full border-0 border-b border-white/25 bg-transparent px-1 py-3 text-apple-body-sm text-cloud-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                />
              </label>

              {error && (
                <p role="alert" className="mt-3 text-apple-caption font-semibold text-red">
                  {error}
                </p>
              )}

              <AppleButton type="button" variant="filled" onClick={submit} className="mt-5 w-full">
                Перейти к оплате
              </AppleButton>
              <p className="mt-2.5 text-center text-apple-caption text-cloud-meta">
                Реквизиты карты вводятся только на защищённой странице Stripe и не проходят через сервер IITALY.
              </p>
              <p className="mt-2 text-center text-apple-caption text-cloud-meta">
                Продолжая, ты принимаешь <a href="/terms" className="underline underline-offset-2">условия сервиса</a> и{" "}
                <a href="/privacy" className="underline underline-offset-2">политику конфиденциальности</a>.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span
                aria-hidden
                className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-crimson motion-reduce:animate-none"
              />
              <p className="font-apple-display text-apple-subheading font-semibold text-cloud-white">
                Открываю Stripe…
              </p>
              <p className="max-w-xs text-apple-body-sm text-cloud-body">
                Создаём защищённую платёжную сессию. Не закрывай это окно.
              </p>
            </div>
          )}
        </div>
      )}
    </AppleModal>
  );
}
