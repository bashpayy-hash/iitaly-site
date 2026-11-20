"use client";

import { AssessmentRoadmap } from "./AssessmentRoadmap";
import type { Plan } from "@/lib/planBuilder";
import { AppleButton, AppleButtonLink } from "@/components/apple/Button";
import { useWallPurchase } from "@/components/access/useWallPurchase";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { RISK_LINE } from "@/components/access/offerCopy";
import styles from "./plan-journey.module.css";
import disclosure from "@/components/ui/disclosure.module.css";

/* Результат анкеты без повторов (owner, 5 Nov: «перепроверь перегрузы»):
   одна строка «что это», одна главная кнопка, шаги плитками. Ушли рамка
   с капсом «Персональный план готов» (заголовок выше уже говорит это) и
   вторая заливная кнопка «Собрать документы» внизу — покупка и так стоит
   в каждом закрытом шаге. */
function stepsWord(n: number) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "шагов";
  if (mod10 === 1) return "шаг";
  if (mod10 >= 2 && mod10 <= 4) return "шага";
  return "шагов";
}

export function PlanResult({ plan, onReset }: { plan: Plan; onReset: () => void }) {
  const paid = usePaidDevice();
  const wall = useWallPurchase("plan-result", !paid);
  const more = Math.max(plan.steps.length - 1, 0);
  return (
    <div data-assessment-result>
      <p className={styles.ready} data-plan-ready>
        План собран по твоим ответам. Набор: {plan.intake}.
        Правила проверены {plan.reviewed}; допуск подтверждает выбранный вуз.
      </p>

      {/* CRO audit (owner, 20 Nov: «делай тогда те самые 5 правок»). The result
          led only to the cabinet, and the price surfaced first inside step 2.
          Before payment the main action is now the offer itself — what opens
          for 10 990 ₸, the button, and the risk line; the cabinet stays as the
          second, quiet way on. After payment only the cabinet remains. */}
      {paid ? <div className="mt-5"><AppleButtonLink href="/portal" variant="filled" className="max-sm:w-full">Продолжить в личном кабинете</AppleButtonLink><p className="mt-2 text-[13px] leading-relaxed text-cloud-meta">Ответы и набор уже сохранены на этом устройстве. Вход не нужен.</p></div>
      : <div className={styles.offer} data-plan-offer>
        <p className={styles.offerTitle}>Первый шаг уже открыт. Остальной маршрут — за один платёж:</p>
        <ul className={styles.offerList}>
          <li>ещё {more} {stepsWord(more)} с датами и чек-листами</li>
          <li>проверка документов без лимита</li>
          <li>напоминания о сроках</li>
        </ul>
        <div className={styles.offerActions}>
          <AppleButton type="button" variant="filled" onClick={wall.open} data-wall-buy data-wall-place="plan-result" aria-haspopup="dialog" className="max-sm:w-full">{wall.label}</AppleButton>
          <AppleButtonLink href="/portal" variant="outlined" className="max-sm:w-full">Продолжить в личном кабинете</AppleButtonLink>
        </div>
        <p className={styles.offerRisk} data-wall-risk>{RISK_LINE}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-cloud-meta">Ответы и набор уже сохранены на этом устройстве. Вход не нужен.</p>
      </div>}

      <div className={styles.routeHeading}>
        <h2>С чего начать</h2>
        <button type="button" onClick={onReset}>Изменить ответы</button>
      </div>
      <AssessmentRoadmap plan={plan} />
      {wall.modal}

      <details className={styles.reminders}>
        <summary className={disclosure.row}>
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
