/* eslint-disable @next/next/no-img-element -- Pre-sized local WebP for the static export. */
import styles from "./portal-welcome.module.css";
import type { ReactNode } from "react";

/** A personal greeting on arrival; route state and actions remain below it. */
export function PortalWelcome({ name, intakeYear, children }: { name?: string; intakeYear?: number; children?: ReactNode }) {
  const firstName = name?.trim().split(/\s+/)[0];

  return <section className={styles.welcome} aria-labelledby="portal-welcome-title" data-portal-welcome>
    <img src="/mascot/vespi-portal-welcome.webp" alt="" width={136} height={160} decoding="async" draggable={false} data-vespi="portal-welcome" />
    <div className={styles.copy}>
      <h1 id="portal-welcome-title">{firstName ? `Привет, ${firstName}!` : "Привет!"}</h1>
      <p>Я рядом. Продолжим твой путь в Италию?</p>
      {intakeYear && <p className={styles.intake}>Поступление: сентябрь {intakeYear}</p>}
      {children}
    </div>
  </section>;
}
