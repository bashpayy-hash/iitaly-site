"use client";

import { SourceRefs } from "@/components/SourceRefs";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/planBuilder";
import { AppleButton, AppleButtonLink } from "@/components/apple/Button";
import { VespaReveal } from "@/components/VespaReveal";
import styles from "./plan-journey.module.css";

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
            План собран по твоим ответам. Набор: {plan.intake}.
            Правила проверены {plan.reviewed}; допуск подтверждает выбранный вуз.
          </p>
        </div>
      </div>

      <div className={styles.routeHeading}>
        <h2>С чего начать</h2>
        <button type="button" onClick={onReset}>Изменить ответы</button>
      </div>
      <p className="mt-2 text-apple-body-sm text-cloud-body">Первый шаг уже открыт. Остальные раскрывай по мере необходимости.</p>
      <div className={styles.steps}>
        {plan.steps.map((s, i) => (
          <details key={s.t} className={styles.step} open={i === 0}>
            <summary><span className={styles.stepNumber}>{i + 1}</span><span>{s.t}</span></summary>
            <div className={styles.stepBody}>
              <p className="text-apple-body-sm text-cloud-body">{s.p}</p>
              {i === 0 && <AppleButtonLink href="/guides#education" variant="outlined" size="sm" className="mt-4">Открыть разбор аттестата и диплома</AppleButtonLink>}
              {s.sources && <details className="mt-2 text-cloud-meta"><summary className="cursor-pointer min-h-11 py-2 text-sm">Источники и применимость</summary><SourceRefs ids={s.sources} /></details>}
            </div>
          </details>
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
        документ, загрузи его в блок «Проверка документа» ниже — там работает
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
      </div>
    </div>
  );
}
