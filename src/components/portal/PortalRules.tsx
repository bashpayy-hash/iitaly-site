"use client";

import { SourceRefs } from "@/components/SourceRefs";
import { ADMISSION_SOURCES, type SourceId } from "@/data/admissions";
import {
  ADMISSION_ROUTES,
  CHANGES,
  CONSULATE_DISCREPANCY,
  DISCLAIMER,
  FAQ,
  MED_EDITORIAL_NOTE,
  MED_PRIVATE_NOTE,
  MED_ROUTES,
  STATUSES,
  STATUSES_NOTE,
  VERIFIED_AT,
  VERIFIED_AT_HUMAN,
} from "@/data/changes2026";
import styles from "./portal-rules.module.css";

/** On-demand reference, using exactly the public page's scoped source data. */
export function PortalRules() {
  return <div className={styles.content} data-portal-rules>
    <p className={styles.scope}>Казахстан → Италия · 2026/27 и 2027/28<br />
      Проверено <time dateTime={VERIFIED_AT}>{VERIFIED_AT_HUMAN}</time>
    </p>
    <p>Зачисление в университет и выдача визы — разные процедуры. Принятие заявки вузом или её валидация в Universitaly не гарантирует ни запись в консульство, ни выдачу визы. У университета, конкретной программы и консульства могут быть более ранние внутренние сроки и дополнительные требования.</p>

    <details className={styles.topic}>
      <summary>Главные статусы на {VERIFIED_AT_HUMAN}</summary>
      <p>{STATUSES_NOTE}</p>
      <dl className={styles.records}>
        {STATUSES.map(status => <div key={status.title}>
          <dt>{status.title} · {status.status}</dt>
          <dd>{status.body}</dd>
        </div>)}
      </dl>
    </details>

    {CHANGES.map(change => <details className={styles.topic} key={change.n} data-rule={change.n}>
      <summary>{change.title}</summary>
      {change.body.map(text => <p key={text}>{text}</p>)}
      {change.note && <p className={styles.note}>{change.note}</p>}
      {change.n === 1 && <p className={styles.note}>{CONSULATE_DISCREPANCY}</p>}
      {change.n === 7 && <>
        <dl className={styles.records}>
          {MED_ROUTES.map(route => <div key={route.title}>
            <dt>{route.lang} · {route.title}</dt>
            <dd>
              {route.body.map(text => <p key={text}>{text}</p>)}
              {route.note && <p className={styles.note}>{route.note}</p>}
            </dd>
          </div>)}
        </dl>
        <p>{MED_PRIVATE_NOTE}</p>
        <p className={styles.note}>{MED_EDITORIAL_NOTE}</p>
      </>}
      <details className={styles.sources}>
        <summary>Источники</summary>
        <SourceRefs ids={change.sources} />
      </details>
    </details>)}

    <details className={styles.topic}>
      <summary>Маршруты поступления</summary>
      {ADMISSION_ROUTES.map(route => <details className={styles.route} key={route.route}>
        <summary>{route.route}</summary>
        <dl className={styles.records}>
          <div><dt>Отбор</dt><dd>{route.selection}</dd></div>
          <div><dt>Universitaly и виза для non-EU abroad</dt><dd>{route.visa}</dd></div>
          <div><dt>Предостережение</dt><dd>{route.warning}</dd></div>
        </dl>
      </details>)}
    </details>

    <details className={styles.topic}>
      <summary>Частые вопросы</summary>
      {FAQ.map(item => <details className={styles.route} key={item.q}>
        <summary>{item.q}</summary>
        <p>{item.a}</p>
      </details>)}
    </details>

    <details className={styles.topic}>
      <summary>Первичные источники</summary>
      <SourceRefs ids={Object.keys(ADMISSION_SOURCES) as SourceId[]} />
    </details>
    <p className={styles.scope}>{DISCLAIMER}</p>
  </div>;
}
