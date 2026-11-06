import { WarmIcon } from "@/components/icons/WarmIcon";
import { plainTerms } from "./plainWords";
import styles from "./portal-path.module.css";

/* Незнакомые слова шага — по строке на слово, маленьким значком «i»
   (owner, 5 Nov: «разжёвывать маленькими символами»). Не больше двух,
   чтобы пояснение не стало ещё одним блоком текста. */
export function PlainTerms({ text, className = "" }: { text: string; className?: string }) {
  const terms = plainTerms(text);
  if (!terms.length) return null;
  return <ul className={`${styles.terms} ${className}`} data-plain-terms aria-label="Что значат слова">
    {terms.map(item => <li key={item.term}><WarmIcon name="info" size={22} /><span><strong>{item.term}</strong> — {item.plain}</span></li>)}
  </ul>;
}
