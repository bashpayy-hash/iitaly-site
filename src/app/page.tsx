import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { StructuredData } from "@/components/marketing/StructuredData";
import { JourneyTitle } from "@/components/journey/JourneyUI";
import { RoutePreview } from "@/components/journey/RoutePreview";
import { VespiIntroSection } from "@/components/mascot/VespiIntroSection";
import { FramedArtwork } from "@/components/marketing/FramedArtwork";
import { Reveal } from "@/components/motion/Reveal";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { UNIS, CITIES } from "@/data/italy";
import styles from "@/components/marketing/marketing.module.css";

const STAGES = [
  { title: "Подбор и стратегия", text: "Сопоставь образование, язык и бюджет с требованиями программ. Выбери университеты и свой путь поступления.", result: "Результат: список программ и календарь подачи" },
  { title: "Документы и подача", text: "Подготовь аттестат, уточни требования к CIMEA или DoV и отправь заявки в выбранные университеты.", result: "Результат: учебный комплект и поданные заявки" },
  { title: "Стипендия и переезд", text: "Подготовь заявку на DSU, пройди предзапись Universitaly и собери досье на визу D. После приезда — оформление в Италии.", result: "Результат: готовность к отъезду и первым неделям учёбы" },
];
const FEATURES = ["Персональный чек-лист на весь цикл поступления", "AI-проверка каждого документа до подачи", "Сохранённые разборы и отметки выполнения", "Напоминания о важных сроках"];

export default function Home() {
  return <MarketingLayout home>
    <StructuredData />
    <section className="journey-hero" data-section="hero">
      <div className="journey-hero-grid">
        <Reveal>
          <p className={styles.eyebrow}><span className={styles.signal} aria-hidden />Из Казахстана — в Италию</p>
          <h1 className={styles.heroTitle}>Твоё будущее.<br />Теперь в <span className="editorial-accent">Италии.</span></h1>
          <p className={styles.heroDescription}>Поступление становится понятнее, когда знаешь свой следующий шаг. Собери личный маршрут — от первого решения до начала учёбы.</p>
          <div className="journey-actions">
            <Link href="/plan#questionnaire" className="journey-button" data-fab-yield>Составить план бесплатно <span aria-hidden>↗</span></Link>
            <Link href="/universities" className="journey-link">Выбрать университет <span aria-hidden>↗</span></Link>
          </div>
          <p className={styles.heroNote}>Короткий опрос · Без регистрации</p>
          <div className="journey-stats"><span><strong>{UNIS.length}</strong> университета</span><span><strong>{Object.keys(CITIES).length}</strong> городов</span></div>
        </Reveal>
        <Reveal delay={0.06} className="journey-hero-art">
          <FramedArtwork scene="piazza" variant="landscape" priority />
          <RoutePreview />
        </Reveal>
      </div>
    </section>
    <section className={styles.how} data-section="how" aria-label="Три этапа поступления">
      <div className={styles.howInner}>
        <div className={styles.howHeading}>
          <p className={styles.eyebrow}>Твой путь</p>
          <JourneyTitle>От вопроса до посадки в <em>самолёт.</em></JourneyTitle>
          <p>Три последовательных этапа. На каждом — понятный результат.</p>
        </div>
        <ol className={styles.steps}>{STAGES.map((stage, index) => <li className={styles.step} key={stage.title}>
          <div><span className={styles.stepNumber}>0{index + 1}</span><FramedArtwork scene={(["piazza", "canal", "lagoon"] as const)[index]} variant="vignette" /></div><Reveal delay={index * 0.06}><h3>{stage.title}</h3><p>{stage.text}</p><small>{stage.result}</small></Reveal>
        </li>)}</ol>
      </div>
    </section>
    <VespiIntroSection />
    <section className="journey-price-section" aria-labelledby="home-price-title">
      <div className="journey-price-card">
        <p className="journey-eyebrow">Доступ на весь цикл поступления</p>
        <h2 id="home-price-title" className="journey-title">Одна цена. <em>Весь маршрут.</em></h2>
        <div className="journey-price-line"><strong>{priceLabel(PRICE_MAIN)}</strong><span>один платёж · без подписки</span></div>
        <ul>{FEATURES.map(text => <li key={text}><Check size={17} strokeWidth={1.5} aria-hidden="true" />{text}</li>)}</ul>
        <Link href="/prices#main-package" className="journey-button" data-fab-yield>Что входит в доступ <span aria-hidden>↗</span></Link>
        <p className="journey-small">Решения о поступлении, стипендии и визе принимают соответствующие учреждения.</p>
      </div>
    </section>
    <section className="journey-faq"><JourneyTitle>Перед первым <em>шагом.</em></JourneyTitle><div>
      <details><summary>Можно начать без регистрации?</summary><p>Да. Анкета и локальный маршрут доступны бесплатно. Ответы сохраняются на твоём устройстве.</p></details>
      <details><summary>Что делать, если пока не выбран вуз?</summary><p>Начни с каталога: посмотри города, фильтруй программы и сравни до трёх университетов.</p></details>
      <details><summary>С чего начать разбираться в документах?</summary><p>В гайдах выбери свою ситуацию. Проводник покажет материалы в нужном порядке и ссылки на официальные источники.</p><Link href="/guides" className="journey-link">Открыть проводник ↗</Link></details>
    </div></section>
  </MarketingLayout>;
}
