"use client";

import { AssessmentRoadmap } from "./AssessmentRoadmap";
import type { Plan } from "@/lib/planBuilder";
import { AppleButtonLink } from "@/components/apple/Button";
import styles from "./plan-journey.module.css";

/* Результат анкеты без повторов (owner, 5 Nov: «перепроверь перегрузы»):
   одна строка «что это», одна главная кнопка, шаги плитками. Ушли рамка
   с капсом «Персональный план готов» (заголовок выше уже говорит это) и
   вторая заливная кнопка «Собрать документы» внизу — покупка и так стоит
   в каждом закрытом шаге. */
export function PlanResult({ plan, onReset }: { plan: Plan; onReset: () => void }) {
  return (
    <div data-assessment-result>
      <p className={styles.ready} data-plan-ready>
        План собран по твоим ответам. Набор: {plan.intake}.
        Правила проверены {plan.reviewed}; допуск подтверждает выбранный вуз.
      </p>

      <div className="mt-5"><AppleButtonLink href="/portal" variant="filled">Продолжить в личном кабинете ↗︎</AppleButtonLink><p className="mt-2 text-[13px] leading-relaxed text-cloud-meta">Ответы и набор уже сохранены на этом устройстве. Вход не нужен.</p></div>

      <div className={styles.routeHeading}>
        <h2>С чего начать</h2>
        <button type="button" onClick={onReset}>Изменить ответы</button>
      </div>
      <AssessmentRoadmap plan={plan} />

      <details className={styles.reminders}>
        <summary>
          Напоминания на телефоне
        </summary>
        <p className="mt-2 text-apple-body-sm text-cloud-body">
          Подключи Telegram в личном кабинете для напоминаний по сохранённому
          маршруту. Сам по себе этот бесплатный квиз не включает рассылку.
        </p>
        <div className="mt-4">
          <AppleButtonLink href="/portal?view=help" variant="outlined" size="sm">
            Настроить напоминания
          </AppleButtonLink>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-cloud-meta">
          Для подключения понадобится активированный личный кабинет. Telegram
          получит одноразовую ссылку, а не код доступа к кабинету.
        </p>
      </details>
    </div>
  );
}
