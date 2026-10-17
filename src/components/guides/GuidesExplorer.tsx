"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { GUIDES } from "@/data/guides";
import { GuideDetail } from "./GuideDetail";
import { VisaSection } from "./VisaSection";
import { Vespi, VESPI_NAME } from "@/components/mascot/Vespi";
import { track } from "@/lib/track";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { GuideNextStep } from "./GuideNextStep";
import { isGuideId, openGuideHelper } from "./guideJourney";
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
  const guide = chapter.kind === "guide" ? GUIDES[chapter.index] : null;

  return (
    <>
      {guide ? <GuideDetail guide={guide} /> : <VisaSection />}
      {guide?.id === "permesso" && (
        <>
          <div className="mt-4 border border-white/15 bg-white px-4 py-3 text-apple-body-sm text-cloud-white">
            <b className="block">Актуальная ремарка к тренажёру</b>
            <span className="mt-1 block text-cloud-body">
              Poste отдельно указывает €16 за marca da bollo, €30 за приём kit и €30,46 за электронную карточку; дополнительный contributo зависит от длительности и типа permesso. Для rinnovo требования также зависят от кода 24 / 31 — сверяй свой тип на Portale Immigrazione и у Questura.
            </span>
          </div>
          <div className="mt-5">
            <p className="mt-2 text-apple-caption text-cloud-meta">
              Rilascio и rinnovo · учебное заполнение · сохранение черновика только по твоему действию в браузере.
            </p>
          </div>
        </>
      )}
      {isGuideId(chapter.id) && <GuideNextStep id={chapter.id} />}
    </>
  );
}

const GROUPS = [
  { title: "Выбрать маршрут", ids: ["education", "tests"] },
  { title: "Подготовиться к отъезду", ids: ["apostille", "translation", "cimea", "con", "iseeu", "visa", "minors", "military"] },
  { title: "После приезда", ids: ["permesso", "codice", "health-travel"] },
];
const STARTERS = [
  { id: "education", question: "У меня 11 классов. С чего начать?" },
  { id: "tests", question: "Как разобраться с тестами?" },
  { id: "translation", question: "Что проверить в переводе?" },
] as const;
function searchable(chapter: Chapter) {
  const guide = chapter.kind === "guide" ? GUIDES[chapter.index] : null;
  return [chapter.title, chapter.teaser, guide?.lead, guide?.warn,
    ...(guide?.rows.map(row => row.label + " " + row.value) || []),
    chapter.kind === "visa" ? "банк счет выписка деньги средства страховка консульство VFS финансовая гарантия" : "",
  ].join(" ").toLocaleLowerCase("ru").replaceAll("ё", "е");
}

export function GuidesExplorer() {
  const [activeId, setActiveId] = useState(CHAPTERS[0].id);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = query.trim().toLocaleLowerCase("ru").replaceAll("ё", "е").split(/\s+/).filter(Boolean);
  const visible = CHAPTERS.filter(chapter => terms.every(term => searchable(chapter).includes(term)));
  const active = visible.find(chapter => chapter.id === activeId) || visible[0];
  const groups = GROUPS.map(group => ({ ...group, chapters: visible.filter(chapter => group.ids.includes(chapter.id)) })).filter(group => group.chapters.length);
  const stage = GROUPS.findIndex(group => group.ids.includes(active?.id || activeId));

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("iitaly:guide-context", { detail: { guideId: active?.id } }));
    return () => { window.dispatchEvent(new CustomEvent("iitaly:guide-context", { detail: {} })); };
  }, [active?.id]);

  function selectChapter(id: string, source: "question" | "stage" | "index") {
    setQuery("");
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
    track(source === "question" ? "guide_prompt_selected" : "guide_topic_opened", { topic: id, source });
    requestAnimationFrame(() => {
      if (window.location.hash.slice(1) !== id) return;
      const mobile = document.getElementById(id);
      if (mobile instanceof HTMLDetailsElement) mobile.open = true;
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const target = desktop ? document.getElementById("active-guide-title") : mobile?.querySelector("summary");
      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "start", behavior: "instant" });
      }
    });
  }

  useEffect(() => {
    function openLinkedChapter() {
      const id = window.location.hash.slice(1);
      if (!CHAPTERS.some(chapter => chapter.id === id)) return;
      setQuery("");
      setActiveId(id);
      requestAnimationFrame(() => {
        // A newer deep link can arrive before the previous frame runs.
        if (window.location.hash.slice(1) !== id) return;
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
        <div className={`${art.guidePanel} ${styles.guideHeroArt} ${ui.heroArt} order-2`}>
          <EditorialArtwork scene="terrace" priority />
          <Vespi className={ui.heroVespi} sizes="(max-width: 600px) 100px, (max-width: 1023px) 128px, 172px" priority />
        </div>
      </section>
      <section id="guide-topics" className="px-5 py-8 sm:py-10">
        <div className={ui.searchArea} data-fab-yield>
          <div className={ui.searchGuide}>
            <Vespi variant="avatar" className={ui.tipAvatar} sizes="36px" />
            <p><strong>{VESPI_NAME}</strong><span>Выбери свой вопрос. Разберём по шагам.</span></p>
          </div>
          <div className={ui.starters} aria-label="С чего начать в справочнике">
            {STARTERS.map(starter => <a key={starter.id} href={`#${starter.id}`} onClick={event => { event.preventDefault(); selectChapter(starter.id, "question"); }}>{starter.question}</a>)}
          </div>
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
          <button type="button" onClick={() => openGuideHelper(undefined, query)}>Спросить Веспи</button>
        </div>}
        {active && <nav className={ui.route} data-guide-current={active.id} aria-label="Этапы справочника" style={{ "--guide-stage": Math.max(stage, 0) } as CSSProperties}>
          <div className={ui.routeLine} aria-hidden="true" />
          <div className={ui.routeRider} aria-hidden="true"><Vespi variant="avatar" sizes="32px" /></div>
          {GROUPS.map((group, index) => <a key={group.title} href={`#${group.ids[0]}`} aria-current={stage === index ? "step" : undefined}
            onClick={event => { event.preventDefault(); selectChapter(group.ids[0], "stage"); }}>
            <span className={ui.routePoint} aria-hidden="true" />{group.title}
          </a>)}
        </nav>}
        {active && <div className={ui.desktop}>
          <aside className={ui.index}>
            <nav aria-label="Главы справочника">
            {groups.map(group => <div key={group.title} className={ui.topicGroup}>
              <h2>{group.title}</h2>
              {group.chapters.map(chapter => <button key={chapter.id} type="button"
                aria-controls="guide-chapter-content" aria-current={active.id === chapter.id ? "true" : undefined}
                onClick={() => selectChapter(chapter.id, "index")}>
                {chapter.title}
              </button>)}
            </div>)}
            </nav>
            <div className={ui.helper}>
              <p>Читаешь: <strong>{active.title}</strong></p>
              <button type="button" onClick={() => { if (isGuideId(active.id)) { track("guide_helper_opened", { topic: active.id }); openGuideHelper(active.id); } }}>Разобрать тему с Веспи</button>
              <span>Вопрос можно уточнить перед отправкой.</span>
            </div>
          </aside>
          <div id="guide-chapter-content" className={ui.content} role="region" aria-labelledby="active-guide-title">
            <h2 id="active-guide-title" tabIndex={-1}>{active.title}</h2>
            <p className="mt-3 text-apple-body-sm text-cloud-body">{active.teaser}</p>
            <div className="mt-6"><ChapterBody chapter={active} /></div>
          </div>
        </div>}
        <div className={ui.mobile}>
          {groups.map(group => <div key={group.title} className={ui.topicGroup}>
            <h2>{group.title}</h2>
            {group.chapters.map(chapter => <details key={chapter.id} id={chapter.id} name="guide-chapter" onToggle={event => { if (event.currentTarget.open && !window.matchMedia("(min-width: 1024px)").matches) { setActiveId(chapter.id); window.history.replaceState(null, "", `#${chapter.id}`); track("guide_topic_opened", { topic: chapter.id, source: "disclosure" }); } }} className={`${styles.anchorTarget} ${ui.chapter}`}>
              <summary><span>{chapter.title}</span></summary>
              <div className={ui.chapterBody}>
                <p className="mb-5 text-apple-body-sm text-cloud-body">{chapter.teaser}</p>
                <ChapterBody chapter={chapter} />
                <button className={ui.back} type="button" onClick={backToTopics}>К списку тем</button>
              </div>
            </details>)}
          </div>)}
        </div>
        <div className={ui.cabinetLink}>
          <div>
            <h2>Проверяй документы без лимита</h2>
            <p>В кабинете сохраняются маршрут и разборы файлов. Можно исправлять документы и проверять снова.</p>
          </div>
          <Link href="/prices" onClick={() => track("guide_cabinet_viewed", { topic: active?.id || "" })}>Что входит за {priceLabel(PRICE_MAIN)}</Link>
        </div>
      </section>
      <HeadingPin section="guides-header" />
    </>
  );
}
