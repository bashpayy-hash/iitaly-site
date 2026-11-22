import { Fragment, type CSSProperties } from "react";
import styles from "./word-reveal.module.css";

/* Word-by-word reveal for a few section headings (owner, 22 Nov, after a
   reel «20 things to make your website look less AI-made»: «давай
   имплементни, что считаешь нужным»). Pure CSS on the scroll position
   (animation-timeline: view()), so nothing waits for JavaScript and the text
   is in the HTML as plain words: a browser without scroll timelines, a reader
   with reduced motion, a search engine and a screen reader all get the
   heading as it is. A word never starts below 15% opacity. `start` continues
   the count when one heading is split into several parts. */
export function WordReveal({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(" ");
  return <>{words.map((word, index) => <Fragment key={index}>
    <span className={styles.word} style={{ "--word": start + index } as CSSProperties}>{word}</span>{index < words.length - 1 ? " " : null}
  </Fragment>)}</>;
}
