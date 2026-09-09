"use client";

import { useRef, useState } from "react";
import { WIZ, type WizAnswers } from "@/data/wizard";
import { track } from "@/lib/track";
import { isValidPhone, submitLead } from "@/lib/lead";
import { Button } from "@/components/Button";

export function Wizard({ onDone }: { onDone: (answers: WizAnswers) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizAnswers>({});
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [sending, setSending] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const finished = step >= WIZ.length;
  const progress = finished ? 1 : step / WIZ.length;

  function choose(id: string, value: string) {
    if (step === 0) track("plan_started");
    setAnswers((prev) => ({ ...prev, [id]: value }));
    track("wiz_step", { s: id });
    track("plan_step_completed", { step: step, of: WIZ.length });
    setStep((s) => s + 1);
  }

  async function finish(withPhone: boolean) {
    if (withPhone) {
      if (!isValidPhone(phone)) {
        setPhoneError(true);
        return;
      }
      setSending(true);
      await submitLead({
        phone: phone.trim(),
        education: answers.education || "—",
        goal: answers.goal || "—",
        budget: answers.budget || "—",
      });
      track("lead_captured", { from: "wizard" });
      track("lead_submitted", { from: "wizard" });
      setSending(false);
    }
    track("plan_completed", { withPhone });
    onDone(answers);
  }

  return (
    <div className="rounded-xl border-2 border-ink bg-paper p-5 shadow-lg sm:p-7">
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-line">
          <div
            className="h-full origin-left rounded-pill bg-red transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <span className="shrink-0 text-xs font-bold text-ink-soft">
          {finished ? "Готово" : `${Math.min(step + 1, WIZ.length)} из ${WIZ.length}`}
        </span>
      </div>

      <div ref={liveRef} aria-live="polite" className="mt-6">
        {finished ? (
          <>
            <p className="font-display text-xl font-black">Куда прислать план?</p>
            <p className="mt-2 text-sm text-ink-soft">
              Пришлём маршрут и напоминания о дедлайнах в WhatsApp. Можно
              пропустить — план всё равно откроется прямо здесь.
            </p>
            <label className="mt-4 block">
              <span className="sr-only">Номер телефона для WhatsApp</span>
              <input
                type="tel"
                inputMode="tel"
                placeholder="+7 ___ ___ __ __"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(false);
                }}
                className="w-full rounded-md border-2 border-ink bg-cream px-4 py-3 text-sm font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
              />
            </label>
            {phoneError && (
              <p role="alert" className="mt-1.5 text-xs font-bold text-red">
                Проверь номер телефона.
              </p>
            )}
            <Button
              type="button"
              variant="primary"
              onClick={() => finish(true)}
              disabled={sending}
              className="mt-3 w-full"
            >
              {sending ? "Отправляю…" : "Составить план"}
            </Button>
            <button
              type="button"
              onClick={() => finish(false)}
              className="mt-3 block w-full text-center text-sm font-bold text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Пропустить и посмотреть план
            </button>
            <p className="mt-4 text-xs text-ink-soft">
              Оставляя номер, ты соглашаешься, что мы напишем по поводу
              поступления. Рассылок и передачи третьим лицам не будет,
              отписаться можно в любой момент.{" "}
              <a href="/privacy" className="font-bold text-red">
                Как мы работаем с данными
              </a>
              . Если тебе меньше 18, заполняй вместе с родителем.
            </p>
          </>
        ) : (
          <WizStep
            key={WIZ[step].id}
            question={WIZ[step]}
            value={answers[WIZ[step].id]}
            onChoose={(v) => choose(WIZ[step].id, v)}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t-2 border-line pt-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`text-sm font-bold text-ink-soft hover:text-ink ${step > 0 ? "visible" : "invisible"}`}
        >
          ← Назад
        </button>
      </div>
    </div>
  );
}

function WizStep({
  question,
  value,
  onChoose,
}: {
  question: (typeof WIZ)[number];
  value: string | undefined;
  onChoose: (v: string) => void;
}) {
  return (
    <>
      <p className="font-display text-xl font-black">{question.q}</p>
      {question.hint && <p className="mt-1.5 text-sm text-ink-soft">{question.hint}</p>}
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {question.opts.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChoose(o.v)}
            aria-pressed={value === o.v}
            className={`rounded-lg border-2 border-ink px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
              value === o.v ? "bg-ink text-cream" : "bg-cream hover:bg-paper"
            }`}
          >
            <b className="block text-sm">{o.t}</b>
            {o.s && (
              <span className={`text-xs ${value === o.v ? "text-cream/70" : "text-ink-soft"}`}>{o.s}</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
