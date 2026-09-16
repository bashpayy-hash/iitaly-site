"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/planBuilder";
import { AppleButton } from "@/components/apple/Button";
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
      <div className="flex items-start gap-3 rounded-apple-card border border-mist/30 bg-white p-4">
        <VespaReveal pose="celebrate" className="h-12 w-auto shrink-0" />
        <div>
          <p className="text-apple-caption font-semibold text-rosso uppercase">
            Персональный план готов
          </p>
          <p className="mt-1 text-apple-body-sm text-graphite">
            В продукте план строит Claude AI по полному своду правил ISEEU, DSU
            и вузов.
          </p>
        </div>
      </div>

      <p className="mt-8 text-apple-caption text-ash uppercase">Твои шаги</p>
      <div className="mt-3 space-y-3">
        {plan.steps.map((s, i) => (
          <div key={i} className="flex gap-4 rounded-apple-card border border-mist/30 bg-white p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-carbon font-apple-text text-apple-body-sm font-semibold text-white">
              {i + 1}
            </div>
            <div>
              <b className="text-apple-body-sm text-carbon">{s.t}</b>
              <p className="mt-1 text-apple-body-sm text-graphite">{s.p}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-apple-caption text-ash uppercase">
        Документы · нажми «Проверить»
      </p>
      <div className="mt-3 space-y-2">
        {plan.docs.map((d, i) => {
          const st = docStates[i];
          return (
            <div key={i}>
              <div
                className={`flex items-center justify-between gap-3 rounded-apple-card border px-4 py-3 ${
                  st === "err" ? "border-red bg-red/5" : st === "ok" ? "border-green bg-green/5" : "border-mist/30 bg-white"
                }`}
              >
                <div>
                  <b className="text-apple-body-sm text-carbon">{d.n}</b>
                  <span className="ml-2 text-apple-caption text-ash">{d.d}</span>
                </div>
                <button
                  type="button"
                  disabled={st === "checking"}
                  onClick={() => checkDoc(i, d.err)}
                  className="shrink-0 rounded-apple-pill border border-mist/40 bg-frost px-3.5 py-1.5 text-apple-caption font-semibold whitespace-nowrap text-carbon focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosso"
                >
                  {st === "checking" ? "Проверка…" : st === "err" ? "Ошибка" : st === "ok" ? "✓ Ок" : "Проверить"}
                </button>
              </div>
              {st === "err" && (
                <div className="mt-1.5 rounded-apple-card border border-red bg-red/5 px-3 py-2.5 text-apple-caption text-carbon">
                  Найдена ошибка: справка выдана за 2025 год, а для подачи
                  2026/27 нужен референсный 2024-й. Закажи новую — иначе
                  заявка на DSU будет отклонена.
                </div>
              )}
              {st === "ok" && (
                <div className="mt-1.5 rounded-apple-card border border-green bg-green/5 px-3 py-2.5 text-apple-caption text-carbon">
                  Документ в порядке: апостиль стоит до перевода, данные
                  читаются, формат принимается CAF.
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-apple-caption text-ash">
        В приложении ты фотографируешь документ — Claude AI сверяет его с
        правилами и находит ошибки до подачи.
      </p>

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
