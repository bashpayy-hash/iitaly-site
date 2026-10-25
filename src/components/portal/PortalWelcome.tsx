import styles from "./portal-welcome.module.css";
import type { ReactNode } from "react";
import { VespiScene } from "@/components/mascot/VespiScene";

/** A personal greeting on arrival; route state and actions remain below it. */
export function PortalWelcome({ name, intakeYear, children }: { name?: string; intakeYear?: number; children?: ReactNode }) {
  const firstName = name?.trim().split(/\s+/)[0];

  return <section className={styles.welcome} aria-labelledby="portal-welcome-title" data-portal-welcome>
    <div className={styles.copy}>
      <h1 id="portal-welcome-title">{firstName ? `Привет, ${firstName}!` : "Привет!"}</h1>
      <p>Я рядом. Продолжим твой путь в Италию?</p>
      {intakeYear && <p className={styles.intake}>Поступление: сентябрь {intakeYear}</p>}
      {children}
    </div>
    <VespiScene pose="welcome" canRest priority className={styles.scene} sizes="(max-width: 600px) 112px, (max-width: 1000px) 240px, 300px" />
  </section>;
}
