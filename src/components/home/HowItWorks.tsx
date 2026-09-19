import styles from "@/components/marketing/marketing.module.css";
import { ItalianAccent } from "@/components/marketing/ItalianAccent";
import { AppleHeading, AppleCaption } from "@/components/apple/Typography";
import { AppleButtonLink } from "@/components/apple/Button";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";

const STAGES = [
  {
    n: "1",
    title: "Бесплатно · 10 минут",
    body: "Отвечаешь на 6 вопросов о своей ситуации или загружаешь документ на проверку. Видишь план и шансы на стипендию сразу, без оплаты.",
    time: "сегодня",
  },
  {
    n: "2",
    title: `Оплата ${priceLabel(PRICE_MAIN)}`,
    body: "Один платёж через Stripe. После подтверждённой оплаты кабинет создаётся автоматически — код появляется сразу на сайте.",
    time: "сразу после подтверждения Stripe",
  },
  {
    n: "3",
    title: "Маршрут и документы",
    body: "Персональный чек-лист по стадиям — аттестат и CIMEA, Universitaly, стипендия DSU. Каждый документ проверяет ИИ до подачи.",
    time: "CIMEA 30–60 дней · Universitaly май–июль · DSU до приезда",
  },
  {
    n: "4",
    title: "Виза, вылет и первые недели",
    body: "Досье на визу D собираем заранее. После прилёта кабинет ведёт первые шаги в Италии: codice fiscale, kit giallo, Questura.",
    time: "рассмотрение визы до 90 дней",
  },
];

/** Four stages, with a native sticky title on desktop only. */
export function HowItWorks() {
  return (
    <section data-section="how" className={styles.how}>
      <div className={styles.howInner}>
        <div className={styles.howHeading}>
          <AppleCaption>Как проходит работа с нами</AppleCaption>
          <AppleHeading>От вопроса до посадки в самолёт.</AppleHeading>
          <p>Не нужно разбираться во всём сразу. У каждого этапа — свой понятный следующий шаг.</p>
          <AppleButtonLink href="/guides" variant="ghost" className="mt-5">Смотреть гайды по визе <span aria-hidden>↗</span></AppleButtonLink>
          <ItalianAccent kind="moka" />
        </div>
        <ol className={styles.steps}>
          {STAGES.map((s) => (
            <li key={s.n} className={styles.step}>
              <span className={styles.stepNumber}>0{s.n}</span>
              <div><h3>{s.title}</h3><p>{s.body}</p><small>{s.time}</small></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
