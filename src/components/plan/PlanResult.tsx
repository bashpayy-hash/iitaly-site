"use client";

import { AssessmentRoadmap } from "./AssessmentRoadmap";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/planBuilder";
import { FREE_PLAN_STEPS } from "@/lib/access";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { AppleButton, AppleButtonLink } from "@/components/apple/Button";
import { VespiAssistant } from "@/components/mascot/VespiAssistant";
import styles from "./plan-journey.module.css";

const stepWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? "шаг" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "шага" : "шагов";
const documentWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? "документ" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "документа" : "документов";

export function PlanResult({ plan, onReset }: { plan: Plan; onReset: () => void }) {
  const router = useRouter();
  const year = /^\d{4}\/\d{2}$/.test(plan.intake) ? plan.intake : null;

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

      {/* «Собрано»: что уже сделано под этот случай и что из этого открыто
          (owner, 5 Nov; эффект вложенного прогресса — закрытое названо по
          счёту, а не спрятано). Цифры — из самого плана. */}
      <ul className={styles.collected} data-plan-collected aria-label="Что собрано по твоим ответам">
        <li><strong>{plan.steps.length}</strong><span>{stepWord(plan.steps.length)} под твой случай</span></li>
        <li><strong>{plan.docs.length}</strong><span>{documentWord(plan.docs.length)} к сбору</span></li>
        <li><strong>{year || "—"}</strong><span>{year ? "год набора" : "год набора не выбран"}</span></li>
      </ul>
      <p className={styles.collectedNote} data-plan-open-count>
        Открыт шаг {FREE_PLAN_STEPS} из {plan.steps.length} и одна проверка документа. Остальные шаги с датами и чек-листами — за {priceLabel(PRICE_MAIN)} один раз.
      </p>

      <div className="mt-5"><AppleButtonLink href="/portal" variant="filled">Продолжить в личном кабинете ↗︎</AppleButtonLink><p className="mt-2 text-apple-caption text-cloud-meta">Ответы и набор уже сохранены на этом устройстве. Вход не нужен.</p></div>

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
