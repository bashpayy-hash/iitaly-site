import { ButtonLink } from "@/components/Button";
import { Caption, Body } from "@/components/Typography";
import { ScanlineImage } from "@/components/ScanlineImage";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { EditorialBackground } from "@/components/EditorialBackground";

const IMAGE_SRC = "/positano.jpg";
const IMAGE_ALT = "Позитано на Амальфитанском побережье Италии: разноцветные дома на скалах над морем";

export function PositanoReveal() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 py-16 sm:py-24">
      <EditorialBackground variant="coast" motion="none" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <div className="max-w-lg">
          <Reveal variant="fade">
            <Caption as="p">Прибрежная Италия</Caption>
          </Reveal>
          <AnimatedText
            as="h2"
            text="Италия шире Рима"
            className="mt-3 font-display text-title font-bold uppercase tracking-tight text-balance"
            delay={0.05}
          />
          <Reveal delay={0.1}>
            <Body as="p" className="mt-5">
              На интерактивной карте — 30 городов и 43 университета: от
              мегаполисов до побережья, как Позитано на этой иллюстрации.
            </Body>
            <ButtonLink href="/universities" variant="tertiary" className="mt-7">
              Смотреть карту вузов
            </ButtonLink>
          </Reveal>
        </div>

        <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border-2 border-ink shadow-red lg:mx-0 lg:max-w-none">
          <ScanlineImage src={IMAGE_SRC} alt={IMAGE_ALT} aspectRatio="600/1075" />
          <div className="border-t-2 border-ink bg-cream px-4 py-3">
            <p className="text-xs font-extrabold tracking-[0.16em] text-ink uppercase">
              Позитано · Амальфитанское побережье
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
