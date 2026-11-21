"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { AppleCaption, AppleHeading } from "@/components/apple/Typography";
import { AppleButton } from "@/components/apple/Button";
import styles from "@/components/marketing/marketing.module.css";
import { GuidePlanContext } from "@/components/guides/GuidePlanContext";
import { DocCheck } from "./DocCheck";
import { PlanUniversityContext } from "./PlanExplorer";
import Link from "next/link";
import { Bento, BentoCell } from "@/components/ui/Bento";
import { useWallPurchase } from "@/components/access/useWallPurchase";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { RISK_LINE } from "@/components/access/offerCopy";
import workspace from "./plan-workspace.module.css";
import check from "./check-page.module.css";

/* The document check on its own page (owner, 20 Nov, on /plan#document-check
   under the plan's cover: «почему здесь сверху всё ещё стоит вот эта
   иллюстрация, для проверки документов должна быть отдельная страница»). Its
   cover is its own scene: Vespi checking a certificate through a magnifying
   glass in a loggia with Florence behind (design/illustrations/scenes-2026-11-20.json).
   The heading says only what the home section already says. */
/* CRO audit (owner, 20 Nov: «делай тогда те самые 5 правок»). Whoever tapped
   «Проверить документ» landed on a heading and a picture: the upload began
   1.9 screens down on a phone and below the fold on a laptop. The first screen
   now carries the action. It opens the same file picker as the form below (one
   input, one state) and then brings the chosen file and «Проверить документ»
   into view; while the service is still being checked it just scrolls there. */
function UploadNow() {
  function choose() {
    const zone = document.getElementById("document-check");
    const input = zone?.querySelector<HTMLInputElement>('input[type="file"]');
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!zone || !input || input.disabled) {
      zone?.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
      return;
    }
    input.addEventListener("change", () => {
      window.setTimeout(() => {
        const run = [...zone.querySelectorAll("button")].find(button => /Проверить документ/.test(button.textContent || ""));
        (run ?? zone).scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" });
      }, 200);
    }, { once: true });
    input.click();
  }
  return <div className="mt-6" data-check-upload-now>
    <AppleButton type="button" variant="filled" onClick={choose} className="max-sm:w-full">Загрузить документ</AppleButton>
    <p className="mt-2 text-[13px] leading-relaxed text-cloud-meta">Фото, PDF или Word · первая проверка бесплатно</p>
  </div>;
}

/* Owner, 21 Nov, with this row on a tablet: «тексты не прям ровные, и идёт
   перенасыщение каких-то блоков текстом». The first card had 21 words beside
   12 and 13 — six ragged lines in a 200px column next to three. One short
   sentence each now, 11–13 words; what the dropped words said (the kinds of
   competition, «пункт за пунктом») stands in the tool above and in the
   heading of the home section. */
const HOW = [
  { title: "Выбери заявку", text: "Программа и учебный год. Если ещё не знаешь, проверим по общим правилам DSU." },
  { title: "Загрузи файл", text: "Справка, перевод, выписка или аттестат: фото, PDF или Word до 5 МБ." },
  { title: "Получи разбор", text: "Обычно за 10–30 секунд: что в порядке и что нужно уточнить." },
] as const;

/* What opens with the route — the same purchase as on /prices and the walls. */
function CheckOffer() {
  const paid = usePaidDevice();
  const wall = useWallPurchase("document-check", !paid);
  return <section className={check.section} aria-labelledby="check-offer-title" data-check-offer>
    <Bento label="Проверки без лимита" className={check.bento}>
      <BentoCell span={{ md: 6, lg: 12 }} tone="action" className={check.offer}>
        <div className={check.offerCopy}>
          <h2 id="check-offer-title" className={check.offerTitle}>Проверки без лимита&nbsp;— с маршрутом</h2>
          <p className={check.offerText}>{paid ? "На этом устройстве кабинет уже открыт: проверяй документы там, сколько нужно." : "Исправил\u00A0— проверь снова, сколько нужно. Вместе с маршрутом: шаги с датами, чек-листы и напоминания о сроках."}</p>
          <div className={check.offerActions}>
            {paid ? <Link className={check.offerButton} href="/portal?view=docs">Открыть документы в кабинете</Link>
              : <button type="button" className={check.offerButton} onClick={wall.open} data-wall-buy data-wall-place="document-check" aria-haspopup="dialog">{wall.label}</button>}
            <Link className={check.offerLink} href="/plan#questionnaire">Составить план</Link>
          </div>
          {!paid && <p className={check.offerRisk} data-wall-risk>{RISK_LINE}</p>}
        </div>
      </BentoCell>
    </Bento>
    {wall.modal}
  </section>;
}

export function DocumentCheckPage() {
  return (
    <>
      <section data-section="check-header" className={workspace.header}>
        <div className={`${workspace.hero} ${check.hero}`}>
          <div className={`${workspace.heroScene} ${check.scene}`} data-check-hero-scene aria-hidden="true">
            <img className={`${workspace.heroArt} ${check.art}`} src="/illustrations/scenes/check-loggia-1600.webp"
              srcSet="/illustrations/scenes/check-loggia-960.webp 960w, /illustrations/scenes/check-loggia-1600.webp 1600w, /illustrations/scenes/check-loggia-2400.webp 2400w"
              sizes="(max-width: 1240px) calc(100vw - 24px), 1200px" width={2400} height={1357} alt=""
              decoding="async" fetchPriority="high" draggable={false} data-check-scene="loggia" />
            <span className={`${workspace.heroVeil} ${check.veil}`} />
          </div>
          <div className={`${workspace.heroCopy} ${check.copy}`} data-role="heading">
            <AppleCaption as="p" className="warm-badge">Проверка документов · 24/7</AppleCaption>
            <AppleHeading as="h1" className="mt-3 max-w-xl">
              Проверь <span className="warm-highlight">документ</span> перед подачей
            </AppleHeading>
            {/* 21 Nov: 28 words here said «первая проверка бесплатно» a line
                above the same words under the button, and «без регистрации»
                stands in «Как это работает». One sentence and the time. */}
            <p className="mt-5 max-w-lg text-apple-body">
              ИИ сверит справку, перевод, выписку или аттестат с требованиями твоего вуза, DSU и визы
              на твой учебный год. Обычно за 10–30 секунд.
            </p>
            <UploadNow />
          </div>
        </div>
      </section>

      {/* A page of its own (owner, 20 Nov, evening: «я бы хотел, чтобы
          «Проверь документ» было полноценной страницей отдельной»). No plan /
          check tabs and no second «Проверь документ перед подачей» under the
          hero: the tool, then how it works, and what opens with the route.
          Owner, 21 Nov, on «Быстрее агентства» with its four facts and the
          comparison table here: «убери… повторение… преимуществ» — the
          advantages are told once, on the home page, and briefly in this
          page's own hero. */}
      <section className={`${workspace.tools} ${check.tools}`} data-public-paper-zone="check-tools">
        <PlanUniversityContext />
        <div className={styles.planWorkspace}>
          <div id="document-check" className={workspace.document}>
            <GuidePlanContext target="document" />
            <DocCheck />
          </div>
        </div>
      </section>

      <section className={check.section} aria-labelledby="check-how-title" data-check-how>
        <h2 id="check-how-title" className={check.title}>Как это работает.<span>Три шага, без регистрации.</span></h2>
        <Bento label="Как работает проверка" className={check.bento}>
          {HOW.map(item => <BentoCell key={item.title} span={{ md: 2, lg: 4 }} className={check.how}>
            <h3 className={check.howTitle}>{item.title}</h3>
            <p className={check.howText}>{item.text}</p>
          </BentoCell>)}
        </Bento>
      </section>

      <CheckOffer />
    </>
  );
}
