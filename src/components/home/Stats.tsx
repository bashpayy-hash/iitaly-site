import styles from "@/components/marketing/marketing.module.css";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { DATA_SNAPSHOT, OFFICIAL_SOURCES } from "@/data/sources";

const METRICS = [
  { value: "DSU", label: "условия и сумма по региональному конкурсу твоего года" },
  { value: "43", label: "университета для сравнения; условия программы нужно сверить" },
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
      <p className={styles.sourceNote}>
        Источники правил:{" "}
        <a href={OFFICIAL_SOURCES.padovaDsu.href} target="_blank" rel="noopener noreferrer">Padova DSU 2026/27</a>
        {" · "}
        <a href={OFFICIAL_SOURCES.universitalyInternational.href} target="_blank" rel="noopener noreferrer">Universitaly</a>
        {" · "}
        <a href={OFFICIAL_SOURCES.cimea.href} target="_blank" rel="noopener noreferrer">CIMEA</a>
        {". "}Исходный каталог вузов — {DATA_SNAPSHOT}; это не дата проверки всех программ на 2027/28. Ответы ИИ могут содержать ошибки.
      </p>
    </section>
  );
}
