"use client";

import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/planBuilder";
import { AppleButton, AppleButtonLink } from "@/components/apple/Button";
import { VespaReveal } from "@/components/VespaReveal";

export function PlanResult({ plan, onReset }: { plan: Plan; onReset: () => void }) {
  const router = useRouter();

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
        Документы, которые понадобятся
      </p>
      <div className="mt-3 divide-y divide-white/10 border border-white/15">
        {plan.docs.map((d) => (
          <div key={d.n} className="px-4 py-3">
            <b className="text-apple-body-sm text-cloud-white">{d.n}</b>
            <span className="ml-2 text-apple-caption text-cloud-meta">{d.d}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-apple-caption text-cloud-meta">
        Это чек-лист, а не результат проверки файла. Чтобы проверить настоящий
        документ, загрузи его в блок «Проверка документа» выше — там работает
        реальный анализ загруженного файла.
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
          <AppleButtonLink href="/portal?view=help" variant="outlined" size="sm">
            Настроить напоминания
          </AppleButtonLink>
        </div>
        <p className="mt-3 text-apple-caption text-cloud-meta">
          Для подключения понадобится активированный личный кабинет. Telegram
          получит одноразовую ссылку, а не код доступа к кабинету.
        </p>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <AppleButton type="button" variant="filled" size="sm" onClick={() => router.push("/prices")}>
          Собрать документы с IITALY
        </AppleButton>
        <AppleButton type="button" variant="outlined" size="sm" onClick={onReset}>
          Заново
        </AppleButton>
      </div>
    </div>
  );
}
