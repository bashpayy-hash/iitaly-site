import { AppleButtonLink } from "@/components/apple/Button";
import styles from "@/components/marketing/marketing.module.css";

/** An entry point, not a reimplementation of the protected university map. */
export function Split() {
  return (
    <section data-section="split" className={styles.university}>
      <span className={styles.eyebrow} style={{ color: "#b9b9c2" }}>Интерактивная карта</span>
      <h2 className={styles.universityTitle}>Одна Италия.<br /><span>Твой собственный выбор.</span></h2>
      <p>Найди свой университет: цены по ISEE, тесты, дедлайны и стипендия региона.</p>
      <div className={styles.universityNumbers}><div><b>43</b><small>университета</small></div><div><b>30</b><small>городов</small></div></div>
      <div className={styles.actions}><AppleButtonLink href="/universities" variant="outlined">Открыть карту Италии <span aria-hidden>↗</span></AppleButtonLink></div>
    </section>
  );
}
