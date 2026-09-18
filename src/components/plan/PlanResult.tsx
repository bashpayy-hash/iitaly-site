"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/planBuilder";
import { AppleButton, AppleButtonLink } from "@/components/apple/Button";
import { VespaReveal } from "@/components/VespaReveal";

type DocState = "idle" | "checking" | "ok" | "err";

export function PlanResult({ plan, onReset }: { plan: Plan; onReset: () => void }) {
  const router = useRouter();
  const [docStates, setDocStates] = useState<DocState[]>(() => plan.docs.map(() => "idle"));

  function checkDoc(i: number, hasErr: boolean) {
    setDocStates((prev) => {
      const next = [...prev];
      next[i] = "checking";
      return next;
    });
    // Демо-вердикт: показывает, как выглядит результат проверки. Реальную
    // проверку с загрузкой файла делает виджет «Проверка документов» выше.
    setTimeout(() => {
      setDocStates((prev) => {
        const next = [...prev];
        next[i] = hasErr ? "err" : "ok";
        return next;
      });
    }, 1100);
  }

  return (
    <div>
      <div className="flex items-start gap-3 border border-white/15 p-4">
        <VespaReveal pose="celebrate" className="h-12 w-auto shrink-0" />
        <div>
          <p className="text-apple-caption font-semibold text-crimson uppercase">
            Персональный план готов
          </p>
          <p className="mt-1 text-apple-body-sm text-cloud-body">
            План собран по твоим ответам. Ниже — основные шаги и список
            документов для поступления.
          </p>
        </div>
      </div>

      <p className="mt-8 text-apple-caption text-cloud-meta uppercase">Твои шаги</p>
      <div className="mt-3 space-y-3">
        {plan.steps.map((s, i) => (
          <div key={i} className="flex gap-4 border border-white/15 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-carbon font-apple-text text-apple-body-sm font-semibold text-white">
              {i + 1}
            </div>
            <div>
              <b className="text-apple-body-sm text-cloud-white">{s.t}</b>
              <p className="mt-1 text-apple-body-sm text-cloud-body">{s.p}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-apple-caption text-cloud-meta uppercase">
        Документы · нажми «Проверить»
      </p>
      <div className="mt-3 space-y-2">
        {plan.docs.map((d, i) => {
          const st = docStates[i];
          return (
            <div key={i}>
              <div
                className={`flex items-center justify-between gap-3 border px-4 py-3 ${
                  st === "err" ? "border-red bg-red/5" : st === "ok" ? "border-green bg-green/5" : "border-white/15"
                }`}
              >
                <div>
                  <b className="text-apple-body-sm text-cloud-white">{d.n}</b>
                  <span className="ml-2 text-apple-caption text-cloud-meta">{d.d}</span>
                </div>
                <button
                  type="button"
                  disabled={st === "checking"}
                  onClick={() => checkDoc(i, d.err)}
                  className="shrink-0 rounded-apple-pill border border-white/20  px-3.5 py-1.5 text-apple-caption font-semibold whitespace-nowrap text-cloud-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                >
                  {st === "checking" ? "Проверка…" : st === "err" ? "Ошибка" : st === "ok" ? "✓ Ок" : "Проверить"}
                </button>
              </div>
              {st === "err" && (
                <div className="mt-1.5 border border-red bg-red/5 px-3 py-2.5 text-apple-caption text-cloud-white">
                  Найдена ошибка: справка выдана за 2025 год, а для подачи
                  2026/27 нужен референсный 2024-й. Закажи новую — иначе
                  заявка на DSU будет отклонена.
                </div>
              )}
              {st === "ok" && (
                <div className="mt-1.5 border border-green bg-green/5 px-3 py-2.5 text-apple-caption text-cloud-white">
                  Документ в порядке: апостиль стоит до перевода, данные
                  читаются, формат принимается CAF.
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-apple-caption text-cloud-meta">
        Для проверки своего документа загрузи его в блок «Проверка документов» выше.
      </p>

      <section aria-labelledby="plan-reminders-heading" className="mt-6 rounded-apple-card border border-white/15 p-5">
        <h2 id="plan-reminders-heading" className="text-apple-body font-semibold text-cloud-white">
          Напоминания на телефоне
        </h2>
        <p className="mt-2 text-apple-body-sm text-cloud-body">
          Подключи Telegram в личном кабинете для напоминаний по сохранённому
          маршруту. Сам по себе этот бесплатный квиз не включает рассылку.
        </p>
        <div className="mt-4">
          <AppleButtonLink href="/portal#notifications" variant="outlined" size="sm">
            Настроить напоминания
          </AppleButtonLink>
        </div>
        <p className="mt-3 text-apple-caption text-cloud-meta">
          Понадобятся фамилия и код доступа к кабинету. Затем открой бота
          и нажми «Запустить» в Telegram.
        </p>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <AppleButton type="button" variant="filled" size="sm" onClick={() => router.push("/prices")}>
          Собрать документы с IItaly
        </AppleButton>
        <AppleButton type="button" variant="outlined" size="sm" onClick={onReset}>
          Заново
        </AppleButton>
      </div>
    </div>
  );
}
