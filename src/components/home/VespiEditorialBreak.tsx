/* eslint-disable @next/next/no-img-element -- Prepared responsive WebP assets for static export. */
import Link from "next/link";
import styles from "./vespi-editorial.module.css";

/** A close crop of the approved character, not a new or substituted identity. */
export function VespiEditorialBreak() {
  return <section className={styles.scene} aria-labelledby="vespi-editorial-title" data-vespi-editorial>
    <div className={styles.copy}>
      <p className={styles.eyebrow}>Твой ИИ-проводник</p>
      <h2 id="vespi-editorial-title">Веспи всегда<br /><span>на подходе.</span></h2>
      <p className={styles.description}>Проверяй документы, подключай напоминания и двигайся по шагам — от ЦОНа до Questura.</p>
      <Link href="/portal" className={styles.action}>Продолжить с Веспи <span aria-hidden="true">↗</span></Link>
    </div>
    <div className={styles.visual} aria-hidden="true">
      <span className={styles.halo} />
      <img data-vespi="editorial" data-vespi-role="route"
        src="/mascot/vespi/vespi-editorial-route-720.webp"
        srcSet="/mascot/vespi/vespi-editorial-route-480.webp 480w, /mascot/vespi/vespi-editorial-route-720.webp 720w"
        sizes="(max-width: 600px) 340px, (max-width: 1000px) 50vw, 620px"
        width="720" height="700" alt="" loading="lazy" decoding="async" draggable={false} />
    </div>
    <span className={styles.routeLine} aria-hidden="true" />
  </section>;
}
