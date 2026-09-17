import styles from "@/components/marketing/marketing.module.css";
import art from "@/components/marketing/editorial-art.module.css";
import { EditorialArtwork } from "@/components/marketing/EditorialArtwork";
import { AppleHeading, AppleBody, AppleCaption } from "@/components/apple/Typography";
import { AppleButtonLink } from "@/components/apple/Button";

/** The approved balcony occupies the existing image slot; copy and controls stay intact. */
export function FeatureBanner() {
  return (
    <section data-section="feature" className={`${styles.feature} grid grid-cols-1 lg:grid-cols-2`}>
      <div className="order-2 flex flex-col justify-center px-5 py-20 sm:py-28 lg:order-1 lg:px-16">
        <div className="mx-auto max-w-md lg:mx-0">
          <AppleCaption as="p">После прилёта</AppleCaption>
          <AppleHeading as="h2" className="mt-3">
            Кабинет ведёт и после визы
          </AppleHeading>
          <AppleBody as="p" className="mt-4">
            Виза — не финал. Кабинет держит порядок первых недель в новом
            городе: codice fiscale, kit giallo, приём в Questura — что,
            когда и к какому сроку.
          </AppleBody>
          <AppleButtonLink href="/guides" variant="outlined" className="mt-6">
            Смотреть гайды по визе
          </AppleButtonLink>
        </div>
      </div>
      <div data-role="image" className={`${art.arrivalPanel} order-1 lg:order-2`}>
        <EditorialArtwork scene="balcony-scene" />
      </div>
    </section>
  );
}
