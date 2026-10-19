"use client";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import styles from "./vespi-intro.module.css";

export function VespiIntroSection({ placement = "home", href = "/portal", action = "Заполнить анкету", onAction, withAction = true }: {
  placement?: "home" | "guides" | "portal";
  href?: string;
  action?: string;
  onAction?: MouseEventHandler<HTMLAnchorElement>;
  withAction?: boolean;
}) {
  // Both the workspace and home introduction stay text-only.
  if (placement === "portal") return <section className="journey-onboarding-intro">
    <h2>Начни со своей ситуации.</h2>
    <p>Образование, цель и год поступления помогут собрать последовательный план.</p>
    {withAction && <Link href={href} className="journey-button" onClick={onAction}><span>{action}</span></Link>}
  </section>;

  const titleId = `vespi-intro-${placement}-title`;
  return <section className={styles.intro} aria-labelledby={titleId} data-vespi-intro={placement}>
    <div className={styles.copy}>
      <p className={styles.eyebrow}>Твой ИИ-помощник</p>
      <h2 id={titleId}>Есть вопрос? <span>Спроси Веспи.</span></h2>
      <p className={styles.description}>Можно спросить своими словами. Веспи объяснит непонятное, поможет разобраться с текущим шагом и подскажет, что проверить перед подачей.</p>
      {withAction && <button type="button" className={styles.action} data-fab-yield data-vespi-intro-action
        onClick={() => window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "vespi-intro" } }))}>
        Задать вопрос Веспи <span aria-hidden="true">↗</span>
      </button>}
      <p className={styles.note}>Начни с вопроса. Сложные требования сверяй с официальным источником.</p>
    </div>
  </section>;
}
