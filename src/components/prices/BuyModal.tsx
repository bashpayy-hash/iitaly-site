"use client";

import { useState } from "react";
import { AppleModal } from "@/components/apple/Modal";
import { AppleButton } from "@/components/apple/Button";
import { track } from "@/lib/track";
import {
  PAY_MODE,
  PAY_NAME,
  PAY_PHONE,
  fmt,
  isValidName,
  isValidPhone,
  submitOrder,
  whatsappLink,
} from "@/lib/payment";

export interface BuyProduct {
  name: string;
  price: number;
}

type Step = "form" | "sending" | "paid";

export function BuyModal({ product, onClose }: { product: BuyProduct | null; onClose: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setStep("form");
    setName("");
    setPhone("");
    setError(null);
    setCopied(false);
  }

  function close() {
    onClose();
    setTimeout(reset, 200);
  }

  async function submit() {
    if (!product) return;
    if (!isValidName(name) || !isValidPhone(phone)) {
      setError("Проверь имя и телефон.");
      return;
    }
    setError(null);
    setStep("sending");
    const res = await submitOrder({ product: product.name, price: product.price, name, phone });
    if (!res.ok) {
      // Текст берём из ответа: «слишком много заявок», «нет связи» и
      // «приём заявок не настроен» требуют от человека разных действий,
      // и одна общая фраза про интернет их только путала.
      setError(res.error);
      setStep("form");
      return;
    }
    track("order_submitted", { product: product.name, price: product.price });
    track("lead_submitted", { product: product.name, price: product.price, from: "buy_modal" });
    setStep("paid");
  }

  async function copyPhone() {
    const num = PAY_PHONE.replace(/[^0-9+]/g, "");
    try {
      await navigator.clipboard.writeText(num);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — the number is still visible to copy manually
    }
  }

  const isPkg = product ? product.price >= 45900 : false;

  return (
    <AppleModal open={!!product} onClose={close} labelledBy="buy-modal-title" className="max-w-md">
      {product && (
        <div className="p-6">
          {step === "form" && (
            <>
              <h3 id="buy-modal-title" className="font-apple-display text-apple-subheading font-semibold text-carbon">
                {product.name}
              </h3>
              <p className="mt-1 font-apple-display text-apple-heading-sm font-semibold text-rosso">{fmt(product.price)} ₸</p>
              {isPkg && (
                <div className="mt-3 rounded-apple-card border border-warn bg-warn/10 px-3 py-2.5 text-apple-body-sm text-carbon">
                  🔒 Ты в числе первых 30 — стартовая цена зафиксируется за тобой навсегда. Взамен
                  попросим отзыв, когда поступишь.
                </div>
              )}
              <label className="mt-4 block">
                <span className="sr-only">Имя</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Имя"
                  className="w-full rounded-apple-card border border-mist/40 bg-frost px-4 py-3 text-apple-body-sm text-carbon outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosso"
                />
              </label>
              <label className="mt-2.5 block">
                <span className="sr-only">Телефон / WhatsApp</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Телефон / WhatsApp"
                  inputMode="tel"
                  className="w-full rounded-apple-card border border-mist/40 bg-frost px-4 py-3 text-apple-body-sm text-carbon outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosso"
                />
              </label>
              {error && (
                <p role="alert" className="mt-2 text-apple-caption font-semibold text-red">
                  {error}
                </p>
              )}
              <AppleButton type="button" variant="filled" onClick={submit} className="mt-4 w-full">
                {PAY_MODE === "kaspi" ? "Оплатить через Kaspi" : "Оформить заказ"}
              </AppleButton>
              <p className="mt-2.5 text-center text-apple-caption text-ash">
                {PAY_MODE === "kaspi"
                  ? "Оплата откроется в приложении Kaspi. Продукт придёт в WhatsApp после оплаты."
                  : "После оформления покажем реквизиты для перевода. Продукт придёт в WhatsApp после оплаты."}
              </p>
            </>
          )}

          {step === "sending" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span
                aria-hidden
                className="h-6 w-6 animate-spin rounded-full border-2 border-mist/30 border-t-rosso motion-reduce:animate-none"
              />
              <p className="text-apple-body-sm text-graphite">Отправляю…</p>
            </div>
          )}

          {step === "paid" && (
            <div>
              <div className="text-center">
                <div aria-hidden className="text-4xl">
                  ✅
                </div>
                <p className="mt-2 font-apple-display text-apple-subheading font-semibold text-carbon">Заказ принят</p>
                <p className="mt-1 text-apple-body-sm text-graphite">Осталось оплатить — два шага, минута времени.</p>
              </div>

              <div className="mt-5 flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-carbon font-apple-text text-apple-caption font-semibold text-white">
                  1
                </div>
                <div className="min-w-0 flex-1">
                  <b className="text-apple-body-sm text-carbon">
                    Переведи {fmt(product.price)} ₸ в Kaspi
                  </b>
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-apple-card border border-mist/30 bg-frost px-3 py-2.5">
                    <span className="font-apple-display text-apple-subheading font-semibold text-carbon">{PAY_PHONE}</span>
                    <button
                      type="button"
                      onClick={copyPhone}
                      className="shrink-0 rounded-apple-pill border border-mist/40 bg-white px-3 py-1.5 text-apple-caption font-semibold whitespace-nowrap text-carbon focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosso"
                    >
                      {copied ? "Скопировано" : "Копировать"}
                    </button>
                  </div>
                  <span className="mt-1.5 block text-apple-caption text-ash">
                    Получатель: {PAY_NAME} · в комментарии укажи «{product.name}»
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-carbon font-apple-text text-apple-caption font-semibold text-white">
                  2
                </div>
                <div className="min-w-0 flex-1">
                  <b className="text-apple-body-sm text-carbon">Пришли скриншот чека в WhatsApp</b>
                  <span className="mt-1 block text-apple-caption text-ash">
                    {isPkg ? "Куратор ответит" : "Продукт придёт"} в течение часа на {phone}
                  </span>
                  <a
                    href={whatsappLink(product.name, product.price)}
                    target="_blank"
                    rel="noopener"
                    className="mt-2.5 block rounded-apple-pill bg-rosso px-4 py-3 text-center text-apple-body-sm font-semibold text-white"
                  >
                    Открыть WhatsApp
                  </a>
                </div>
              </div>

              <p className="mt-5 text-apple-caption text-ash">
                Без предоплаты «в никуда»: до 7 дней с оплаты, если ещё не начал работать с планом
                — вернём деньги полностью, без объяснений.
              </p>
              <AppleButton type="button" variant="outlined" onClick={close} className="mt-3 w-full">
                Закрыть
              </AppleButton>
            </div>
          )}
        </div>
      )}
    </AppleModal>
  );
}
