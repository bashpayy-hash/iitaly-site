"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GUIDES } from "@/data/guides";
import { GuideDetail } from "./GuideDetail";
import { VisaSection } from "./VisaSection";
import { AppleButton } from "@/components/apple/Button";
import { EditorialArtwork } from "@/components/marketing/EditorialArtwork";
import art from "@/components/marketing/editorial-art.module.css";
import Link from "next/link";
import { HeadingPin } from "@/components/motion/HeadingPin";
import styles from "@/components/marketing/marketing.module.css";

/** Desktop chapter index and native mobile disclosures share stable deep links. */
type Chapter =
  | { kind: "guide"; id: string; title: string; teaser: string; index: number }
  | { kind: "visa"; id: string; title: string; teaser: string };

const guideChapters: Chapter[] = GUIDES.map((guide, index) => ({
  kind: "guide", id: guide.id, title: guide.title, teaser: guide.teaser, index,
}));
const visaIndex = guideChapters.findIndex((chapter) => chapter.id === "minors");
const CHAPTERS: Chapter[] = [
  ...guideChapters.slice(0, visaIndex),
  { kind: "visa", id: "visa", title: "Виза D", teaser: "Подача через VFS: средства, документы и сроки." },
  ...guideChapters.slice(visaIndex),
];

function ChapterBody({ chapter }: { chapter: Chapter }) {
  if (chapter.kind === "visa") return <VisaSection />;
  const guide = GUIDES[chapter.index];

  return (
    <>
      <GuideDetail guide={guide} />
      {guide.title === "Permesso di soggiorno" && (
        <>
          <div className="mt-4 border border-white/15 bg-white px-4 py-3 text-apple-body-sm text-cloud-white">
            <b className="block">Актуальная ремарка к тренажёру</b>
            <span className="mt-1 block text-cloud-body">
              Poste отдельно указывает €16 за marca da bollo, €30 за приём kit и €30,46 за электронную карточку; дополнительный contributo зависит от длительности и типа permesso. Для rinnovo требования также зависят от кода 24 / 31 — сверяй свой тип на Portale Immigrazione и у Questura.
            </span>
          </div>
          <div className="mt-5">
            <Link href="/guides/permesso-modulo-1" className={styles.button + " " + styles.filled}>
              Открыть тренажёр Modulo 1
            </Link>
            <p className="mt-2 text-apple-caption text-cloud-meta">
              Rilascio и rinnovo · учебное заполнение · сохранение черновика только по твоему действию в браузере.
            </p>
          </div>
        </>
      )}
    </>
  );
}

export function GuidesExplorer() {
  const router = useRouter();
  const [activeId, setActiveId] = useState(CHAPTERS[0].id);
  const activeIndex = Math.max(
    0,
    CHAPTERS.findIndex((c) => c.id === activeId),
  );
  const active = CHAPTERS[activeIndex];

  useEffect(() => {
    function openLinkedChapter() {
      const id = window.location.hash.slice(1);
      if (!CHAPTERS.some((chapter) => chapter.id === id)) return;
      setActiveId(id);
      const mobileChapter = document.getElementById(id);
      if (mobileChapter instanceof HTMLDetailsElement) mobileChapter.open = true;
      requestAnimationFrame(() => {
        const target = window.matchMedia("(min-width: 1024px)").matches
          ? document.getElementById("guide-topics") : mobileChapter;
        target?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    }
    openLinkedChapter();
    window.addEventListener("hashchange", openLinkedChapter);
    return () => window.removeEventListener("hashchange", openLinkedChapter);
  }, []);

  return (
    <>
      <section data-section="guides-header" className="grid grid-cols-1 lg:grid-cols-2">
        <div className="order-1 flex flex-col justify-center px-5 py-12 sm:py-16 lg:px-16">
          <div data-role="heading" className="mx-auto max-w-md lg:mx-0">
            <p className="text-apple-caption text-cloud-meta">Справочник · бесплатно</p>
            <h1 className="mt-2 font-apple-display text-[32px] font-semibold uppercase text-cloud-white sm:text-[44px]">
              Как пройти бюрократию
            </h1>
            <p className="mt-5 text-apple-body text-cloud-body">
              Темы, в которых чаще всего теряют месяцы, плюс отдельный разбор
              визы D. Где делать в Казахстане, сколько стоит и в каком
              порядке. Всё бесплатно.
            </p>
            <p className="mt-4 text-apple-body-sm text-cloud-body">
              Правила 2026/27 изменились —{" "}
              <Link href="/changes-2026-27" className="font-semibold text-crimson">
                что именно и с какими датами
              </Link>
              .
            </p>
            <a href="#guide-topics" className={`${styles.button} ${styles.outlined} mt-6`}>Открыть справочник</a>
          </div>
        </div>
        <div className={`${art.guidePanel} ${styles.guideHeroArt} order-2`}>
          <EditorialArtwork scene="terrace" priority />
        </div>
      </section>

      <section id="guide-topics" className={`${styles.anchorTarget} ${styles.guideTopics} px-5 py-10 sm:py-14`}>
        {/* Десктоп: sticky-индекс + активная глава. */}
        <div className="mx-auto hidden max-w-[1100px] gap-12 lg:grid lg:grid-cols-[0.85fr_1.15fr]">
          <nav aria-label="Главы справочника" className="lg:sticky lg:top-24 lg:max-h-[75vh] lg:overflow-y-auto lg:h-fit">
            <ol className="space-y-0.5 border-t border-white/15">
              {CHAPTERS.map((c, i) => {
                const isActive = c.id === activeId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => { setActiveId(c.id); window.history.replaceState(null, "", `#${c.id}`); }}
                      aria-controls="guide-chapter-content"
                      aria-current={isActive ? "true" : undefined}
                      className={`flex w-full items-baseline gap-3 border-b border-white/10 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                        isActive ? "text-cloud-white" : "text-cloud-meta hover:text-cloud-white"
                      }`}
                    >
                      <span className={`text-apple-caption tabular-nums ${isActive ? "text-crimson" : "text-cloud-meta"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`text-apple-body-sm ${isActive ? "font-semibold" : "font-normal"}`}>{c.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div key={active.id} id="guide-chapter-content" className="relative min-w-0" aria-live="polite">
            <p className="text-apple-caption text-cloud-meta">
              {String(activeIndex + 1).padStart(2, "0")} · {active.title}
            </p>
            <p className="mt-2 max-w-[60ch] text-apple-body-sm text-cloud-body">{active.teaser}</p>
            <div className="mt-6">
              <ChapterBody chapter={active} />
            </div>
          </div>
        </div>

        {/* Мобильный/планшет: нативный accordion. */}
        <div className="mx-auto max-w-[900px] space-y-2 lg:hidden">
          {CHAPTERS.map((c, i) => (
            <details key={c.id} id={c.id} className={`${styles.anchorTarget} group rounded-apple-card border border-white/15 bg-white`}>
              <summary className="flex cursor-pointer list-none items-baseline gap-3 px-4 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="text-apple-caption text-cloud-meta tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <b className="block text-apple-body-sm font-semibold text-cloud-white">{c.title}</b>
                  <span className="mt-1 block text-apple-caption text-cloud-meta">{c.teaser}</span>
                </div>
                <svg aria-hidden="true" viewBox="0 0 16 10" className="mt-2 h-2.5 w-4 shrink-0 text-crimson transition-transform group-open:rotate-180 motion-reduce:transition-none"><path d="M1 1.5 8 8.5 15 1.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </summary>
              <div className="border-t border-white/10 px-4 pt-4 pb-5">
                <ChapterBody chapter={c} />
              </div>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-[900px] flex-col items-start justify-between gap-4 border border-white/15 p-5 text-cloud-white sm:flex-row sm:items-center lg:max-w-[1100px]">
          <div>
            <b className="block">Запутался в порядке шагов?</b>
            <span className="text-apple-body-sm text-cloud-meta">
              Ответь на вопросы — получишь маршрут по своей ситуации и
              сможешь отдельно проверить документы.
            </span>
          </div>
          <AppleButton type="button" variant="filled" onClick={() => router.push("/plan")} className="shrink-0">
            Составить план
          </AppleButton>
        </div>
      </section>
      <HeadingPin section="guides-header" />
    </>
  );
}
