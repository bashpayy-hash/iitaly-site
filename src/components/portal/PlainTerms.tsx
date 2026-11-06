import { plainTerms } from "./plainWords";
import styles from "./portal-path.module.css";

/* Незнакомые слова шага — по строке на слово, как сноска с линией слева
   (owner, 5 Nov: «разжёвывать»; 6 Nov: без значков-эмодзи). Не больше двух,
   чтобы пояснение не стало ещё одним блоком текста. */
export function PlainTerms({ text, className = "" }: { text: string; className?: string }) {
  const terms = plainTerms(text);
  if (!terms.length) return null;
  return <ul className={`${styles.terms} ${className}`} data-plain-terms aria-label="Что значат слова">
    {terms.map(item => <li key={item.term}><span><strong>{item.term}</strong> — {item.plain}</span></li>)}
  </ul>;
}
