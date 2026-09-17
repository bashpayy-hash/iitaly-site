import styles from "@/components/marketing/marketing.module.css";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";

const METRICS = [
  { value: "до €7 557", label: "Стипендия DSU в год — потолок в Риме, зависит от города и дохода семьи" },
  { value: "43", label: "университета в базе с тестами и дедлайнами" },
  { value: "30", label: "городов на интерактивной карте" },
  { value: priceLabel(PRICE_MAIN), label: "полный цикл поступления, разово" },
];

/** Quiet factual strip, never animated counters or invented success rates. */
export function Stats() {
  return (
    <section className={styles.metrics} aria-label="IITALY в цифрах">
      <dl className={styles.metricsGrid}>
        {METRICS.map((m) => <div key={m.label} className={styles.metric}><dt className={styles.metricValue}>{m.value}</dt><dd className={styles.metricLabel}>{m.label}</dd></div>)}
      </dl>
      <p className={styles.sourceNote}>База: правила приёма 2026/27 (MUR, CIMEA, bando регионов). Ответы ИИ могут содержать ошибки — критичное проверяет эксперт.</p>
    </section>
  );
}
