import { PaperTexture } from "@/components/marketing/PublicPaper";
import paper from "@/components/marketing/public-paper.module.css";
import { AppleButtonLink } from "@/components/apple/Button";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import styles from "@/components/marketing/marketing.module.css";
import { CampusArtwork } from "@/components/marketing/CampusArtwork";
import Link from "next/link";
import assistant from "./home-assistant.module.css";

/** An honest service diagram, not a fabricated screenshot or applicant result. */
export function Hero() {
  return (
    <section data-section="hero" className={styles.hero}>
      <div className={`${styles.heroIntro} ${assistant.heroIntro} ${paper.surface}`}>
        <PaperTexture />
        <div className={`${styles.heroCopy} ${assistant.heroCopy}`}>
          <p className={styles.eyebrow}><span className={styles.signal} aria-hidden />Из Казахстана — в Италию</p>
          <h1 className={styles.heroTitle}>Твоё будущее.<br /><span>Теперь в Италии.</span></h1>
          <p className={styles.heroDescription}><strong>Поступление по понятному плану.</strong> Подбор вузов, документы, стипендия DSU и виза — с ИИ. Один платёж {priceLabel(PRICE_MAIN)} вместо агентства.</p>
          <div className={assistant.entryActions}>
            <AppleButtonLink href="/plan">Составить план бесплатно <span aria-hidden>↗</span></AppleButtonLink>
            <div className={assistant.entryAlternatives}>
              <Link href="/plan#document-check">Проверить документ <span aria-hidden>↗</span></Link>
              <Link href="/universities">Смотреть университеты <span aria-hidden>↗</span></Link>
            </div>
          </div>
          <p className={styles.heroNote}>Короткий опрос · Для абитуриентов и студентов</p>
          <Link href="/changes-2026-27" className="mt-3 inline-block min-h-11 py-2 text-sm underline underline-offset-4">Правила 2026/27–2027/28 · проверено 9 октября</Link>
        </div>
        <CampusArtwork />
      </div>

    </section>
  );
}
