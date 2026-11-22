"use client";

import Link from "next/link";
import { PlanDocuments } from "./AssessmentRoadmap";
import { PlanPath } from "./PlanPath";
import { stepsWord } from "./planRoute";
import type { Plan } from "@/lib/planBuilder";
import { AppleButton, AppleButtonLink } from "@/components/apple/Button";
import { useWallPurchase } from "@/components/access/useWallPurchase";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { RISK_LINE } from "@/components/access/offerCopy";
import styles from "./plan-journey.module.css";
import disclosure from "@/components/ui/disclosure.module.css";

/* Результат анкеты без повторов (owner, 5 Nov: «перепроверь перегрузы»):
   одна строка «что это», одна главная кнопка, шаги (с 20 Nov — короткий
   путь, каждый шаг на своей странице). Ушли рамка
   с капсом «Персональный план готов» (заголовок выше уже говорит это) и
   вторая заливная кнопка «Собрать документы» внизу — покупка и так стоит
   в каждом закрытом шаге. */

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

      {paid && <div className="mt-5"><AppleButtonLink href="/portal" variant="filled" className="max-sm:w-full">Продолжить в личном кабинете</AppleButtonLink><p className="mt-2 text-[13px] leading-relaxed text-cloud-meta">Ответы и набор уже сохранены на этом устройстве. Вход не нужен.</p></div>}

      {/* Owner, 20 Nov (скрин этого места: «очень громоздкие, большие
          степы… помещается только один или два»): весь маршрут короткими
          строками по этапам; шаг открывается на своей странице (/plan/n). */}
      <div className={styles.routeHeading}>
        <h2>Твой маршрут</h2>
        <button type="button" onClick={onReset}>Изменить ответы</button>
      </div>
      <PlanPath plan={plan} />
      {/* Funnel pass (owner, 22 Nov: «сделай все так, чтобы все было
          последовательным и воронка была максимально эффективной»). Since the
          CRO audit of 20 Nov the offer stood first: after ten answers the
          first screen was a price, and the free step the page had promised
          («понятные шаги… Бесплатно») was a screen lower. The route now comes
          first, with «Начни здесь» on the first screen; the offer follows the
          list it speaks about, with one filled button. The cabinet is a quiet
          link in the line that says where the answers are kept. */}
      {!paid && <div className={styles.offer} data-plan-offer>
        <p className={styles.offerTitle}>Первый шаг уже открыт. Остальной маршрут&nbsp;— за один платёж:</p>
        <ul className={styles.offerList}>
          <li>ещё {more} {stepsWord(more)} с датами и чек-листами</li>
          <li>проверка документов без лимита</li>
          <li>напоминания о сроках</li>
        </ul>
        <div className={styles.offerActions}>
          <AppleButton type="button" variant="filled" onClick={wall.open} data-wall-buy data-wall-place="plan-result" aria-haspopup="dialog" className="max-sm:w-full">{wall.label}</AppleButton>
        </div>
        <p className={styles.offerRisk} data-wall-risk>{RISK_LINE}</p>
        <p className={styles.offerKept}>Ответы и набор уже сохранены на этом устройстве. <Link href="/portal">Продолжить в личном кабинете</Link> можно без входа.</p>
      </div>}
      <PlanDocuments plan={plan} />
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
