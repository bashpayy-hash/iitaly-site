"use client";

import { AssessmentRoadmap } from "./AssessmentRoadmap";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/planBuilder";
import { AppleButton, AppleButtonLink } from "@/components/apple/Button";
import { VespiAssistant } from "@/components/mascot/VespiAssistant";
import styles from "./plan-journey.module.css";

export function PlanResult({ plan, onReset }: { plan: Plan; onReset: () => void }) {
  const router = useRouter();

  return (
    <div data-assessment-result>
      <VespiAssistant
        variant="celebrate"
        layout="editorial-callout"
        appearance="none"
        label=""
        title={<p className="text-apple-caption font-semibold text-crimson uppercase">Персональный план готов</p>}
        message={<>
            План собран по твоим ответам. Набор: {plan.intake}.
            Правила проверены {plan.reviewed}; допуск подтверждает выбранный вуз.
        </>}
      />

      <div className="mt-5"><AppleButtonLink href="/portal" variant="filled">Продолжить в личном кабинете ↗</AppleButtonLink><p className="mt-2 text-apple-caption text-cloud-meta">Ответы и набор уже сохранены на этом устройстве. Вход не нужен.</p></div>

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
        <p className="mt-3 text-apple-caption text-cloud-meta">
          Для подключения понадобится активированный личный кабинет. Telegram
          получит одноразовую ссылку, а не код доступа к кабинету.
        </p>
      </details>

      <div className="mt-6 flex flex-wrap gap-3">
        <AppleButton type="button" variant="filled" size="sm" onClick={() => router.push("/prices")}>
          Собрать документы с IITALY
        </AppleButton>
      </div>
    </div>
  );
}
