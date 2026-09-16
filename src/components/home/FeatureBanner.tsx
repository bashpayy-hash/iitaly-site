import { Illustration } from "@/components/illustration/Illustration";
import { ROME_PAPERCUT } from "@/data/illustrations";
import { AppleHeading, AppleBody, AppleCaption } from "@/components/apple/Typography";
import { AppleButtonLink } from "@/components/apple/Button";

/**
 * Feature Banner: фотография заполняет всю высоту своей половины, без
 * рамки, без скругления — «картинка IS the surface». Один из двух
 * разрешённых кадров сайта. `data-role="image"` — точка OVERLAP: кадр
 * заезжает на 15–25vh в следующую секцию (Split), см. ScrollTransitions.
 */
export function FeatureBanner() {
  return (
    <section data-section="feature" className="grid grid-cols-1 lg:grid-cols-2">
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
      <div data-role="image" className="order-1 lg:order-2">
        <Illustration asset={ROME_PAPERCUT} className="h-full object-cover" />
      </div>
    </section>
  );
}
