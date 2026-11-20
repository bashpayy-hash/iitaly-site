import type { CSSProperties, ElementType, ReactNode } from "react";
import styles from "./bento.module.css";

/* Бенто (owner, 12 Nov, референс Lamossa Studio на godly.design: «информацию
   в личных кабинетах по конкретным сферам и в гайдах и визе нужно подавать в
   такой вот форме»). Светлая подложка с крупным скруглением, внутри ячейки
   разного размера: крупное значение, подпись и короткое пояснение снизу;
   одна ячейка-действие на точечной фактуре.
   Тёмных значков-капсул сверху больше нет (owner, 17 Nov: «эти иконки
   довольно странные, убери иконки, это показатель ИИ-слопа»): ячейку
   держат цифра и слова, а переход в другой раздел — стрелка у заголовка.
   Мозаичные значки на их месте тоже сняты (owner, 19 Nov, о мелких
   картушах в гайдах и визе: «Убери эти мелкие гербы, они тут ни к чему,
   везде применяй этот принцип»): картинка у темы одна, крупная, в шапке.
   Сетка считается от ширины самой подложки (container query): меньше 560px —
   одна колонка, до 900px — шесть, шире — двенадцать. Размер ячейки на каждой
   ширине задаёт тот, кто собирает сетку, чтобы в ней не оставалось дыр. */

export type BentoSpan = { md: number; lg?: number; rowsMd?: number; rowsLg?: number };

type DataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };

export function Bento({ label, labelledBy, children, className, as: Tag = "section", ...data }: { label?: string; labelledBy?: string; children: ReactNode; className?: string; as?: ElementType } & DataAttributes) {
  return <Tag className={`${styles.tray}${className ? ` ${className}` : ""}`} aria-label={label} aria-labelledby={labelledBy} {...data}>
    <div className={styles.grid}>{children}</div>
  </Tag>;
}

export function BentoCell({ span, tone = "plain", children, className, as: Tag = "div", ...rest }: {
  span: BentoSpan;
  href?: string;
  target?: string;
  rel?: string;
  /** Passed to next/link when the cell is a Link. */
  prefetch?: boolean;
  tone?: "plain" | "action" | "media" | "quiet";
  children?: ReactNode;
  className?: string;
  as?: ElementType;
} & DataAttributes) {
  const style = { "--s-md": span.md, "--s-lg": span.lg ?? span.md * 2, "--r-md": span.rowsMd ?? 1, "--r-lg": span.rowsLg ?? span.rowsMd ?? 1 } as CSSProperties;
  return <Tag className={`${styles.cell} ${styles[tone]}${className ? ` ${className}` : ""}`} style={style} data-bento-cell={tone} {...rest}>
    {children}
  </Tag>;
}

/** Значение, подпись и пояснение внизу ячейки. */
export function BentoStat({ value, label, note, quiet = false, long = false }: { value: ReactNode; label: ReactNode; note?: ReactNode; quiet?: boolean; long?: boolean }) {
  return <dl className={styles.stat} data-quiet={quiet || undefined} data-long={long || undefined}>
    <dt className={styles.label}>{label}</dt>
    <dd className={styles.value}>{value}</dd>
    {note && <dd className={styles.note}>{note}</dd>}
  </dl>;
}

export const bento = styles;
