"use client";

import { useEffect, useRef, useState } from "react";
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
import ui from "./guide-browser.module.css";

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

const GROUPS = [
  { title: "Выбрать маршрут", ids: ["education", "tests"] },
  { title: "Подготовиться к отъезду", ids: ["apostille", "translation", "cimea", "con", "iseeu", "visa", "minors", "military"] },
  { title: "После приезда", ids: ["permesso", "codice", "health-travel"] },
];
function searchable(chapter: Chapter) {
  const guide = chapter.kind === "guide" ? GUIDES[chapter.index] : null;
  return [chapter.title, chapter.teaser, guide?.lead, guide?.warn,
    ...(guide?.rows.map(row => row.label + " " + row.value) || []),
    chapter.kind === "visa" ? "банк счет выписка деньги средства страховка консульство VFS финансовая гарантия" : "",
  ].join(" ").toLocaleLowerCase("ru").replaceAll("ё", "е");
}

export function GuidesExplorer() {
  const router = useRouter();
  const [activeId, setActiveId] = useState(CHAPTERS[0].id);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = query.trim().toLocaleLowerCase("ru").replaceAll("ё", "е").split(/\s+/).filter(Boolean);
  const visible = CHAPTERS.filter(chapter => terms.every(term => searchable(chapter).includes(term)));
  const active = visible.find(chapter => chapter.id === activeId) || visible[0];
  const groups = GROUPS.map(group => ({ ...group, chapters: visible.filter(chapter => group.ids.includes(chapter.id)) })).filter(group => group.chapters.length);

  useEffect(() => {
    function openLinkedChapter() {
      const id = window.location.hash.slice(1);
      if (!CHAPTERS.some(chapter => chapter.id === id)) return;
      setQuery("");
      setActiveId(id);
      requestAnimationFrame(() => {
        const mobile = document.getElementById(id);
        if (mobile instanceof HTMLDetailsElement) mobile.open = true;
        const target = window.matchMedia("(min-width: 1024px)").matches ? document.getElementById("guide-topics") : mobile;
        target?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    }
    openLinkedChapter();
    window.addEventListener("hashchange", openLinkedChapter);
    return () => window.removeEventListener("hashchange", openLinkedChapter);
  }, []);

  function backToTopics(event: React.MouseEvent<HTMLButtonElement>) {
    const detail = event.currentTarget.closest("details");
    if (detail) detail.open = false;
    searchRef.current?.focus({ preventScroll: true });
    document.getElementById("guide-topics")?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  return (
    <>
      <section data-section="guides-header" className="grid grid-cols-1 lg:grid-cols-2">
        <div className="order-1 flex flex-col justify-center px-5 py-9 sm:py-12 lg:px-16">
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
      <section id="guide-topics" className="px-5 py-8 sm:py-10">
        <div className={ui.searchArea}>
          <label htmlFor="guide-search">Найти тему</label>
          <div className={ui.searchRow}>
            <input ref={searchRef} id="guide-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Например, апостиль, DSU или виза" />
            {query && <button type="button" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>Сбросить</button>}
          </div>
          <p role="status">{query ? `Найдено тем: ${visible.length}` : "Выбери тему или введи слово из своего вопроса."}</p>
        </div>
        {!visible.length && <div className={ui.empty}>
          <h2>Такой темы не нашли</h2>
          <p>Попробуй другое слово, например «перевод» или «стипендия».</p>
          <button type="button" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>Показать все темы</button>
        </div>}
        {active && <div className={ui.desktop}>
          <nav aria-label="Главы справочника" className={ui.index}>
            {groups.map(group => <div key={group.title} className={ui.topicGroup}>
              <h2>{group.title}</h2>
              {group.chapters.map(chapter => <button key={chapter.id} type="button"
                aria-controls="guide-chapter-content" aria-current={active.id === chapter.id ? "true" : undefined}
                onClick={() => { setActiveId(chapter.id); window.history.replaceState(null, "", `#${chapter.id}`); requestAnimationFrame(() => { const heading = document.getElementById("active-guide-title"); heading?.focus({ preventScroll: true }); heading?.scrollIntoView({ block: "start", behavior: "instant" }); }); }}>
                {chapter.title}
              </button>)}
            </div>)}
          </nav>
          <div id="guide-chapter-content" className={ui.content} role="region" aria-labelledby="active-guide-title">
            <h2 id="active-guide-title" tabIndex={-1}>{active.title}</h2>
            <p className="mt-3 text-apple-body-sm text-cloud-body">{active.teaser}</p>
            <div className="mt-6"><ChapterBody chapter={active} /></div>
          </div>
        </div>}
        <div className={ui.mobile}>
          {groups.map(group => <div key={group.title} className={ui.topicGroup}>
            <h2>{group.title}</h2>
            {group.chapters.map(chapter => <details key={chapter.id} id={chapter.id} name="guide-chapter" onToggle={event => { if (event.currentTarget.open) { setActiveId(chapter.id); window.history.replaceState(null, "", `#${chapter.id}`); } }} className={`${styles.anchorTarget} ${ui.chapter}`}>
              <summary><span>{chapter.title}</span></summary>
              <div className={ui.chapterBody}>
                <p className="mb-5 text-apple-body-sm text-cloud-body">{chapter.teaser}</p>
                <ChapterBody chapter={chapter} />
                <button className={ui.back} type="button" onClick={backToTopics}>К списку тем</button>
              </div>
            </details>)}
          </div>)}
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
