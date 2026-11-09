import styles from "./guide-step-page.module.css";

/** Разбор шага: каждое предложение — пронумерованный пункт; одно — абзацем. */
export function GuideSentences({ sentences, text }: { sentences: string[]; text: string }) {
  return sentences.length > 1 ? <ol className={styles.sentences} data-guide-step-body>
    {sentences.map((sentence, index) => <li key={index}><span aria-hidden="true">{index + 1}</span><p>{sentence}</p></li>)}
  </ol> : <p className={styles.single} data-guide-step-body>{text}</p>;
}
