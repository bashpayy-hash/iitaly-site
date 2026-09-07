"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/planBuilder";
import { Button } from "@/components/Button";
import { Aldo } from "@/components/Aldo";

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
      <div className="flex items-start gap-3 rounded-lg border-2 border-red bg-paper p-4 shadow-red">
        <Aldo pose="celebrating" className="h-12 w-12 shrink-0" />
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-red uppercase">
            Персональный план готов
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            В продукте план строит Claude AI по полному своду правил ISEEU, DSU
            и вузов.
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs font-extrabold tracking-[0.16em] text-sec uppercase">Твои шаги</p>
      <div className="mt-3 space-y-3">
        {plan.steps.map((s, i) => (
          <div key={i} className="flex gap-4 rounded-lg border-2 border-ink bg-paper p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-black text-cream">
              {i + 1}
            </div>
            <div>
              <b className="text-sm">{s.t}</b>
              <p className="mt-1 text-sm text-ink-soft">{s.p}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
        Документы · нажми «Проверить»
      </p>
      <div className="mt-3 space-y-2">
        {plan.docs.map((d, i) => {
          const st = docStates[i];
          return (
            <div key={i}>
              <div
                className={`flex items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 ${
                  st === "err" ? "border-red bg-red/5" : st === "ok" ? "border-green bg-green/5" : "border-ink bg-paper"
                }`}
              >
                <div>
                  <b className="text-sm">{d.n}</b>
                  <span className="ml-2 text-xs text-ink-soft">{d.d}</span>
                </div>
                <button
                  type="button"
                  disabled={st === "checking"}
                  onClick={() => checkDoc(i, d.err)}
                  className="shrink-0 rounded-pill border-2 border-ink bg-cream px-3.5 py-1.5 text-xs font-extrabold uppercase whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
                >
                  {st === "checking" ? "Проверка…" : st === "err" ? "Ошибка" : st === "ok" ? "✓ Ок" : "Проверить"}
                </button>
              </div>
              {st === "err" && (
                <div className="mt-1.5 rounded-md border-2 border-red bg-red/5 px-3 py-2.5 text-xs text-ink">
                  Найдена ошибка: справка выдана за 2025 год, а для подачи
                  2026/27 нужен референсный 2024-й. Закажи новую — иначе
                  заявка на DSU будет отклонена.
                </div>
              )}
              {st === "ok" && (
                <div className="mt-1.5 rounded-md border-2 border-green bg-green/5 px-3 py-2.5 text-xs text-ink">
                  Документ в порядке: апостиль стоит до перевода, данные
                  читаются, формат принимается CAF.
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        В приложении ты фотографируешь документ — Claude AI сверяет его с
        правилами и находит ошибки до подачи.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" variant="dark" onClick={() => router.push("/prices")}>
          Собрать документы с IItaly
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Заново
        </Button>
      </div>
    </div>
  );
}
