"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WIZ, type WizAnswers } from "@/data/wizard";
import { track } from "@/lib/track";
import { isValidPhone, submitLead } from "@/lib/lead";
import { buildPlan, situationFromAnswers } from "@/lib/planBuilder";
import { AppleButton } from "@/components/apple/Button";

/** Русское склонение счётного существительного по числу (5 → форма "много" и т.п.). */
function ruPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function Wizard({ onDone }: { onDone: (answers: WizAnswers) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizAnswers>({});
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [sending, setSending] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);
  const previewTracked = useRef(false);
  const stepChanged = useRef(false);

  const finished = step >= WIZ.length;
  const progress = finished ? 1 : step / WIZ.length;

  useEffect(() => {
    if (!stepChanged.current) return;
    liveRef.current?.focus({ preventScroll: true });
    liveRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    stepChanged.current = false;
  }, [step]);

  // Реальный превью того же движка, что строит финальный план (buildPlan) —
  // не отдельная выдуманная "заглушка ради демо-эффекта". Показываем его
  // ДО запроса номера, чтобы у пользователя уже было что-то ценное на руках,
  // прежде чем решать, оставлять контакт или нет.
  const preview = useMemo(
    () => (finished ? buildPlan(situationFromAnswers(answers)) : null),
    [finished, answers],
  );

  useEffect(() => {
    if (finished && !previewTracked.current) {
      previewTracked.current = true;
      track("plan_preview_viewed");
    }
  }, [finished]);

  function choose(id: string, value: string) {
    stepChanged.current = true;
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
    <div className="rounded-apple-card border border-white/15 bg-white p-5 sm:p-7" data-plan-wizard>
      <div className="flex items-center gap-3">
        <div role="progressbar" aria-label="Готовность плана" aria-valuemin={0} aria-valuemax={WIZ.length} aria-valuenow={Math.min(step, WIZ.length)} aria-valuetext={finished ? "Все вопросы пройдены" : `Вопрос ${step + 1} из ${WIZ.length}`} className="h-1 flex-1 overflow-hidden rounded-apple-pill bg-pebble">
          <div
            className="h-full origin-left rounded-apple-pill bg-crimson transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <span className="shrink-0 text-apple-caption text-cloud-meta">
          {finished ? "Готово" : `${Math.min(step + 1, WIZ.length)} из ${WIZ.length}`}
        </span>
      </div>

      <div ref={liveRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className="mt-6 rounded-apple-card">
        {finished ? (
          <>
            {preview && (
              <div className="mb-6 rounded-apple-card border border-white/15 bg-frost p-4">
                <p className="text-apple-caption font-semibold text-crimson uppercase">
                  Уже готово по твоим ответам
                </p>
                <p className="mt-2 text-apple-body-sm font-semibold text-cloud-white">{preview.steps[0]?.t}</p>
                <p className="mt-1 text-apple-body-sm text-cloud-body">{preview.steps[0]?.p}</p>
                <p className="mt-2 text-apple-caption text-cloud-meta">
                  {(() => {
                    const stepsLeft = Math.max(preview.steps.length - 1, 0);
                    const docsCount = preview.docs.length;
                    return (
                      <>
                        Ещё {stepsLeft} {ruPlural(stepsLeft, "шаг", "шага", "шагов")} и{" "}
                        {docsCount} {ruPlural(docsCount, "документ", "документа", "документов")} в
                        чек-листе — дальше на этой странице.
                      </>
                    );
                  })()}
                </p>
              </div>
            )}
            <p className="font-apple-text text-apple-subheading font-semibold text-cloud-white">Куда прислать план?</p>
            <p className="mt-2 text-apple-body-sm text-cloud-body">
              Пришлём маршрут и напоминания о дедлайнах в WhatsApp. Можно
              пропустить — план всё равно откроется прямо здесь.
            </p>
            <label className="mt-4 block">
              <span className="mb-2 block text-apple-body-sm font-medium text-cloud-white">Номер телефона для WhatsApp</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={phoneError || undefined}
                aria-describedby={phoneError ? "plan-phone-error" : undefined}
                placeholder="+7 ___ ___ __ __"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(false);
                }}
                className="w-full rounded-apple-card border border-white/20 bg-frost px-4 py-3 text-apple-body-sm text-cloud-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
              />
            </label>
            {phoneError && (
              <p id="plan-phone-error" role="alert" className="mt-1.5 text-apple-caption text-crimson">
                Проверь номер телефона.
              </p>
            )}
            <AppleButton
              type="button"
              variant="filled"
              onClick={() => finish(true)}
              disabled={sending}
              className="mt-3 w-full"
            >
              {sending ? "Отправляю…" : "Составить план"}
            </AppleButton>
            <button
              type="button"
              onClick={() => finish(false)}
              className="mt-3 block min-h-11 w-full text-center text-apple-body-sm text-cloud-body underline underline-offset-4 hover:text-cloud-white"
            >
              Пропустить и посмотреть план
            </button>
            <p className="mt-4 text-apple-caption text-cloud-meta">
              Оставляя номер, ты соглашаешься, что мы напишем по поводу
              поступления. Рассылок и передачи третьим лицам не будет,
              отписаться можно в любой момент.{" "}
              <a href="/privacy" className="font-semibold text-crimson">
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

      <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
        <button
          type="button"
          onClick={() => { stepChanged.current = true; setStep((s) => Math.max(0, s - 1)); }}
          className={`min-h-11 px-1 text-apple-body-sm text-cloud-body hover:text-cloud-white ${step > 0 ? "visible" : "invisible"}`}
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
      <h2 className="font-apple-text text-apple-subheading font-semibold text-cloud-white">{question.q}</h2>
      {question.hint && <p className="mt-1.5 text-apple-body-sm text-cloud-body">{question.hint}</p>}
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {question.opts.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChoose(o.v)}
            aria-pressed={value === o.v}
            className={`rounded-apple-card border px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
              value === o.v ? "border-crimson bg-crimson text-white" : "border-white/15 bg-frost hover:bg-pebble/40"
            }`}
          >
            <b className="block text-apple-body-sm font-semibold">{o.t}</b>
            {o.s && (
              <span className={`text-apple-caption ${value === o.v ? "text-white/75" : "text-cloud-meta"}`}>{o.s}</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
