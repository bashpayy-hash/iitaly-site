import { ButtonLink } from "@/components/Button";
import { Caption, Body } from "@/components/Typography";
import { ScanlineImage } from "@/components/ScanlineImage";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { EditorialBackground } from "@/components/EditorialBackground";
import { RegisterFrame } from "@/components/motion/RegisterFrame";
import {
  RegistrationMark,
  HairlineGuide,
  MicroLabel,
  SpecTag,
} from "@/components/EditorialMarks";

const IMAGE_SRC = "/positano.jpg";
const IMAGE_ALT = "Позитано на Амальфитанском побережье Италии: разноцветные дома на скалах над морем";

export function PositanoReveal() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 py-16 sm:py-24">
      {/* Вторая показательная секция бумажного слоя: здесь он проверяется
         на кадрированном изображении — фактура не должна ни ложиться на
         фотографию как фильтр, ни обрываться на её границе. */}
      <EditorialBackground variant="coast" motion="none" grain />
      <RegistrationMark corner="top-left" />
      <RegistrationMark corner="bottom-right" />
      {/* Габаритная линия во всю ширину листа — держится в стороне от
         контента, у самого верхнего края секции. */}
      <HairlineGuide className="top-7 right-0 left-0 h-1.5 w-full" />
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
            <div className="mt-6 flex flex-wrap gap-2">
              <SpecTag>30 городов</SpecTag>
              <SpecTag>43 университета</SpecTag>
            </div>
            <ButtonLink href="/universities" variant="tertiary" className="mt-7">
              Смотреть карту вузов
            </ButtonLink>
          </Reveal>
        </div>

        <RegisterFrame
          className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none"
          delay={0.1}
        >
          {/* Была жёсткая красная тень-стикер: рядом с приводочным эхом она
             стала лишней и спорила с ним — это два разных объяснения одного
             и того же смещения кадра, причём красное громче. Осталась
             мягкая тень, смещение отрабатывает эхо. */}
          <div className="overflow-hidden rounded-xl border-2 border-ink shadow-soft-lg">
            <ScanlineImage src={IMAGE_SRC} alt={IMAGE_ALT} aspectRatio="600/1075" />
            {/* Подпись кадра как в спецификации оттиска. Обе метки — факты
               из данных сайта: Позитано в Кампании, а стипендию в этом
               регионе платит ADISURC (src/data/italy.ts, Federico II).
               Так красивый кадр побережья привязан к делу, а не просто
               «атмосферный». Дубль «30 городов» тут не ставим — это число
               уже стоит слева спец-тегом. */}
            <div className="border-t-2 border-ink bg-cream px-4 py-3">
              <p className="text-xs font-extrabold tracking-[0.16em] text-ink uppercase">
                Позитано · Амальфитанское побережье
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-t border-line pt-2">
                <MicroLabel label="Регион" value="Кампания" layout="inline" />
                <MicroLabel label="Стипендия" value="ADISURC" layout="inline" />
              </div>
            </div>
          </div>
        </RegisterFrame>
      </div>
    </section>
  );
}
