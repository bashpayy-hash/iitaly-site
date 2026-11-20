/* eslint-disable @next/next/no-img-element -- Local cartouche renditions with explicit dimensions. */
import { AppleButtonLink } from "@/components/apple/Button";
import { Bento, BentoCell, BentoStat, bento } from "@/components/ui/Bento";
import { PRICE_MAIN, fmtPrice, priceLabel } from "@/data/pricing";
import { cartoucheFrame } from "@/components/guides/guideArt";
import styles from "./document-check-feature.module.css";

const CTA_ART = cartoucheFrame("doc-check");

/* Проверка документов — главная фишка (owner, 13 Nov: «проверка документов —
   это такая киллер-фича… в любое время суток, в неограниченное количество…
   надо нести в лендинг и промоутить: не как у агентств — быстрее, дешевле,
   доступнее»; ещё 6 Nov: «главная фишка сайта»).
   Только то, что правда:
   - время — замер 12 Nov на живом сервере: справка-фото 11 с, текст 7 с;
     PDF дольше, поэтому «обычно 10–30 секунд»;
   - «без лимита» — с маршрутом, как в пакете; до оплаты одна проверка;
   - что сверяется — пункты, которые проверка показывает сама (апостиль,
     даты справок, имена в переводе, владелец и период выписки);
   - «никогда не ошибается» не пишем: ИИ может ошибаться, решение
     принимает вуз — так сказано на всём сайте.
   Сравнение с агентством — про устройство работы (рабочие часы менеджера,
   повторная правка, отдельный договор), без чужих сроков. Цена агентств —
   та, что владелец называет с начала проекта (NEXT_CHAT.md: «агентства
   берут 650 000 – 1 000 000 ₸»), показать её он подтвердил 14 Nov: «Да,
   добавь». Прежняя строка «Отдельный договор с агентством» остаётся,
   цена идёт под ней: design-content сверяет весь прежний текст.
   15 Nov владелец задал новый диапазон: «сделай новый диапазон 500 000 —
   миллион». Замена разрешена в design-content.mjs. */

const AGENCY_SUPPORT = { from: 500_000, to: 1_000_000 };

const FACTS = [
  { value: "10–30 секунд", label: "обычно до ответа", note: "Без очереди и записи к менеджеру." },
  { value: "24/7", label: "днём, ночью, в выходные", note: "Проверяй, когда документ готов, а не когда открыт офис." },
  { value: "Без лимита", label: "проверок с маршрутом", note: "Исправил — проверь снова, сколько нужно. Первая — бесплатно." },
  { value: "По пунктам", label: "имена, даты, печати, перевод", note: "Сверка с правилами твоего вуза, DSU и визы на твой учебный год." },
] as const;

const COMPARE = [
  { row: "Когда ответят", agency: "В рабочие часы менеджера", us: "В любое время, обычно за 10–30 секунд" },
  { row: "Повторная проверка после правки", agency: "Снова ждать ответа", us: "Сразу и сколько угодно раз" },
  { row: "Сколько стоит", agency: "Отдельный договор с агентством", agencyPrice: `Сопровождение — обычно ${fmtPrice(AGENCY_SUPPORT.from)}–⁠${priceLabel(AGENCY_SUPPORT.to)}`, us: `Входит в ${priceLabel(PRICE_MAIN)} за весь путь, первая проверка бесплатно` },
] as const;

/* Owner, 20 Nov, on the home section: «саму кнопку «Проверь документы», она
   должна быть главной, и эти блоки должны быть снизу… блок «Проверь
   документы» должен быть вот такой большой». The invitation comes first, full
   width, with the cartouche of the check and the main button; the facts and
   the comparison follow. On /prices («страница с ценами довольно пустая…
   одна большая иллюстрация с Веспи, который что-то делает по тематике… на
   фоне») the heading stands on a wide scene: Vespi checking documents at a
   desk (design/illustrations/scenes-2026-11-20.json). */
const SCENE = {
  src: "/illustrations/scenes/prices-check-1600.webp",
  srcSet: "/illustrations/scenes/prices-check-960.webp 960w, /illustrations/scenes/prices-check-1600.webp 1600w, /illustrations/scenes/prices-check-2400.webp 2400w",
};

export function DocumentCheckFeature({ compact = false }: { compact?: boolean }) {
  const head = <div className={styles.head}>
    <h2 id={compact ? "document-check-promo-title" : "document-check-feature-title"} className={styles.title}>
      Проверка документов.<br /><span>Пункт за пунктом — в любое время.</span>
    </h2>
    <p className={styles.lead}>
      Загрузи справку, перевод, выписку или аттестат. ИИ сверит их с требованиями твоего вуза, DSU и визы
      на твой учебный год и скажет, что исправить, — пока агентство ещё не открылось.
    </p>
  </div>;
  return <section className={`${styles.section} ${compact ? styles.compact : ""}`} data-section={compact ? undefined : "document-check-feature"} data-document-check-feature aria-labelledby={compact ? "document-check-promo-title" : "document-check-feature-title"}>
    {compact ? <div className={styles.scene} data-document-check-scene>
      <img className={styles.sceneArt} src={SCENE.src} srcSet={SCENE.srcSet} sizes="(max-width: 700px) 100vw, 1160px" width={2400} height={1357} alt="" loading="lazy" decoding="async" draggable={false} />
      {head}
    </div> : head}
    <Bento label="Чем проверка документов отличается от агентства" className={styles.bento}>
      {!compact && <BentoCell span={{ md: 6, lg: 12 }} tone="action" className={styles.cta} data-document-check-cta>
        <div className={styles.ctaCopy}>
          <p className={styles.ctaTitle}>Проверь один документ бесплатно</p>
          <p className={styles.ctaText}>Без регистрации. Проверка помогает не потерять время на ошибках; решение о приёме принимает вуз.</p>
          <AppleButtonLink href="/check" className={styles.ctaButton}>Проверить документ</AppleButtonLink>
        </div>
        <img className={styles.ctaArt} src={CTA_ART.src} srcSet={CTA_ART.srcSet} sizes="(max-width: 767px) 64px, 260px" width={CTA_ART.width} height={CTA_ART.height} alt="" loading="lazy" decoding="async" draggable={false} data-document-check-art />
      </BentoCell>}
      {FACTS.map(fact => <BentoCell key={fact.value} span={{ md: 3, lg: 3 }} className={styles.fact} data-bento-row data-document-check-fact>
        <BentoStat value={fact.value} label={fact.label} note={fact.note} />
      </BentoCell>)}
      <BentoCell span={{ md: 6, lg: 12 }} data-document-check-compare>
        <table className={styles.compare}>
          <caption className={bento.heading}>Проверка у агентства и здесь</caption>
          <thead><tr><th scope="col"><span className={styles.srOnly}>Что сравниваем</span></th><th scope="col">Агентство</th><th scope="col">IITALY</th></tr></thead>
          <tbody>{COMPARE.map(item => <tr key={item.row}><th scope="row">{item.row}</th><td>{item.agency}{"agencyPrice" in item && <span className={styles.agencyPrice} data-document-check-agency-price>{item.agencyPrice}</span>}</td><td>{item.us}</td></tr>)}</tbody>
        </table>
      </BentoCell>
    </Bento>
  </section>;
}
