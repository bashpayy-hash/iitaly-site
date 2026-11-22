import { STRIPE_ENABLED } from "@/lib/paymentMode";
import { PRICE_MAIN, fmtPrice } from "@/data/pricing";

/* The home page's questions and answers, in one place for the page and for
   search engines (StructuredData). Until 22 Nov the search-engine copy was
   its own older text, and its refund answer named the condition of manual
   payment («если личный кабинет ещё не активирован»): with Stripe the cabinet
   opens at payment, so a search result read as «no refund». Not a "use client"
   module: StructuredData is a server component (see pricing.ts).

   Audit with the copy-editing skill, same day (owner: «примени и если реально
   полезно имплементи на сайте»): the guarantee answer promised «ничего не
   упущенное по срокам» right after «we do not guarantee», and two answers
   opened with a reversal («Нет — это решают…, а не мы», «Это не конец
   доступа — …»). They say who decides what and what the service gives.
   An answer of several paragraphs separates them with a blank line. The
   price keeps its «₸» on its line (on a phone it wrapped alone). */
export const FAQ = [
  {
    q: "Как проходит работа с iItaly?",
    a: `Начни бесплатно: за 2 минуты заполни анкету о своей ситуации или загрузи документ на проверку. До оплаты ты увидишь маршрут и условия проверки стипендии. Затем — один платёж ${fmtPrice(PRICE_MAIN)}\u00A0₸, без подписки.\n\n${STRIPE_ENABLED
      ? "После подтверждения Stripe кабинет создаётся автоматически, а код доступа появляется сразу на сайте."
      : "После подтверждения оплаты мы активируем кабинет и присылаем код доступа в WhatsApp."} В кабинете — персональный чек-лист: аттестат, DoV/CIMEA, Universitaly и стипендия DSU. Документы проверяет ИИ до подачи.\n\nCIMEA Verification занимает 60 рабочих дней; сроки вуза и DSU нужно проверять отдельно. Досье на визу D готовим заранее: рассмотрение может занять до 90 дней. После прилёта кабинет ведёт по первым шагам в Италии — codice fiscale, kit giallo и Questura.`,
  },
  {
    q: "Гарантируете поступление, визу или стипендию?",
    a: "Нет. Поступление решает университет, визу — консульство, стипендию — регион Италии. Мы даём маршрут под твой случай, проверку документов до подачи и напоминания о сроках.",
  },
  {
    q: "Что если университет откажет?",
    a: "Кабинет остаётся открытым, и система пересобирает план: другие университеты, следующий набор, донабор. Отдельно за это не платишь.",
  },
  {
    q: "Можно вернуть деньги?",
    a: STRIPE_ENABLED
      ? "Да. В течение 7 календарных дней с оплаты вернём деньги полностью, если ты ещё не использовал платные функции кабинета: не загружал документы на проверку и не отмечал шаги маршрута выполненными."
      : "Да. В течение 7 календарных дней с оплаты вернём деньги полностью, если личный кабинет ещё не активирован и персональный маршрут не выдан.",
  },
  {
    q: "ИИ может ошибиться?",
    a: "Может. Обновлённые гайды ссылаются на правила 2026/27–2027/28 и региональные bando. Критичные условия по документам, визе и стипендии нужно подтверждать у принимающего органа.",
  },
];

/** An answer as its paragraphs. */
export const faqParagraphs = (answer: string) => answer.split("\n\n");
