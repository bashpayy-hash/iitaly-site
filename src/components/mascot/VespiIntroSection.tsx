/* eslint-disable @next/next/no-img-element -- Reviewed responsive artwork for static export. */
import Link from "next/link";
import type { MouseEventHandler } from "react";
import styles from "./vespi-intro.module.css";

const BENEFITS = ["Документы до ЦОНа и консульства", "Сроки CEnT-S и вузов", "Расчёт и шаги по DSU"];

/** Shared introduction, not a tour. Each placement replaces an existing block. */
export function VespiIntroSection({ placement = "home", href = "/portal", action = "Начать с Веспи", onAction, withAction = true }: {
  placement?: "home" | "guides" | "portal";
  href?: string;
  action?: string;
  onAction?: MouseEventHandler<HTMLAnchorElement>;
  withAction?: boolean;
}) {
  const id = placement === "home" ? "vespi-editorial-title" : `vespi-intro-${placement}`;
  return <section className={`${styles.intro} ${styles[placement]}`} aria-labelledby={id} data-vespi-intro={placement} data-vespi-editorial={placement === "home" ? "" : undefined}>
    <div className={styles.copy}>
      <h2 id={id}>Знакомься, это Веспи —<br /><span>твой ИИ-проводник в Италию.</span></h2>
      <ul aria-label="Чем поможет Веспи">{BENEFITS.map(item => <li key={item}>{item}</li>)}</ul>
      {withAction && <Link href={href} className={styles.action} onClick={onAction}>{action}<span aria-hidden="true">↗</span></Link>}
    </div>
    <div className={styles.portrait} aria-hidden="true">
      <img data-vespi="editorial" data-vespi-role="route"
        src="/mascot/vespi/vespi-editorial-route-720.webp"
        srcSet="/mascot/vespi/vespi-editorial-route-480.webp 480w, /mascot/vespi/vespi-editorial-route-720.webp 720w"
        sizes={placement === "portal" ? "112px" : "(max-width: 600px) 190px, 360px"}
        width="720" height="700" alt="" loading="lazy" decoding="async" draggable={false} />
    </div>
  </section>;
}
