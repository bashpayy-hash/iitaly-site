import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PAY_PHONE, PAY_WA } from "@/lib/payment";
import { STRIPE_ENABLED } from "@/lib/paymentMode";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Политика конфиденциальности",
  description: "Какие данные IITALY собирает, зачем они нужны, как работают Telegram-напоминания и как удалить данные.",
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Какие данные мы собираем",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li><b>Имя и телефон</b>&nbsp;— если ты оставляешь заявку или оформляешь заказ.</li>
        <li><b>Ответы в онбординге</b>&nbsp;— образование, цель, бюджет и другие ответы, нужные для маршрута.</li>
        <li><b>Сообщения ИИ-чату</b>&nbsp;— чтобы сформировать ответ.</li>
        <li><b>Документы</b>, которые ты сам загружаешь на проверку.</li>
        <li><b>Данные личного кабинета</b>&nbsp;— прогресс, результаты проверок и настройки уведомлений.</li>
        <li><b>Данные заказа</b>&nbsp;— выбранная услуга, сумма, имя, фамилия, телефон, почта (если ты её указал), статус оплаты и технический идентификатор Stripe-сессии. Полные реквизиты банковской карты IITALY не получает и не хранит.</li>
        <li><b>Telegram chat ID и статусы доставки</b>&nbsp;— только после того, как ты сам подключил Telegram-бота.</li>
        <li><b>Псевдонимная аналитика</b>&nbsp;— случайный идентификатор устройства и события вроде открытия страницы цен. Это не имя, но такой идентификатор всё равно относится к данным об использовании сервиса.</li>
      </ul>
    ),
  },
  {
    title: "Как мы используем данные",
    body: (
      <p>
        Данные нужны для оказания услуги: построить маршрут, проверить документ, сохранить прогресс,
        связаться по заказу, прислать выбранные тобой напоминания и код доступа к кабинету, если ты
        его забыл. Код приходит только в Telegram и на почту, которые ты сам указал. Мы не продаём пользовательские
        данные рекламодателям.
      </p>
    ),
  },
  ...(STRIPE_ENABLED ? [{
    title: "Оплата через Stripe",
    body: (
      <p>
        Оплата проходит на защищённой странице Stripe. Stripe обрабатывает платёжные реквизиты
        и присылает IITALY подписанный webhook со статусом платежа. IITALY хранит только данные
        заказа, технические идентификаторы Stripe и факт успешной оплаты, необходимые для
        исполнения заказа и разрешения спорных ситуаций.
      </p>
    ),
  }] : []),
  {
    title: "Документы и ИИ",
    body: (
      <p>
        Загруженный файл передаётся в сервис Anthropic для анализа. Сам файл IITALY не сохраняет
        в личном кабинете: при сохранении результата остаются только итог проверки, краткая сводка
        и технические сведения о попытке. ИИ может ошибаться, поэтому критичные решения по подаче
        нужно сверять с официальными правилами или человеком.
      </p>
    ),
  },
  {
    title: "Telegram-напоминания",
    body: (
      <p>
        Код доступа к кабинету не отправляется в Telegram. Кабинет создаёт случайную одноразовую
        ссылку, которая действует 15 минут; на сервере хранится только её хеш. После подключения
        сохраняется Telegram chat ID, чтобы отправлять сводку и напоминания за 7, 3 и 1 день.
        Отключить канал можно в кабинете или командой <b>/stop</b>.
      </p>
    ),
  },
  {
    title: "Хранение и удаление",
    body: (
      <p>
        Данные личного кабинета хранятся, пока кабинет нужен для оказания услуги, и удаляются
        сразу по команде «Удалить мои данные» в кабинете. Неиспользованный токен Telegram живёт
        не более 15 минут. Данные заказов и платёжных обращений могут храниться дольше, если это
        нужно для исполнения договора, разрешения спора или выполнения применимых требований
        учёта и законодательства.
      </p>
    ),
  },
  {
    title: "Твои права",
    body: (
      <p>
        Ты можешь попросить показать, исправить или удалить относящиеся к тебе данные. Данные
        кабинета можно удалить самостоятельно. По другим запросам напиши в WhatsApp IITALY по
        номеру <a href={`https://wa.me/${PAY_WA}`} target="_blank" rel="noopener noreferrer">{PAY_PHONE}</a>.
      </p>
    ),
  },
  {
    title: "Пользователи младше 18 лет",
    body: (
      <p>
        IITALY рассчитан в том числе на школьников 16–18 лет. Если тебе нет 18, оплату и решения,
        связанные с передачей документов и персональных данных, лучше оформлять вместе с законным представителем.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <MarketingLayout>
        <section className="px-5 md:px-6 py-10 sm:py-14" data-legal-page>
          <div className="mx-auto max-w-[760px]">
            <h1 className="font-apple-display text-[clamp(30px,3.6vw,46px)]! font-semibold leading-[1.1]! tracking-[-0.03em]">
              Политика конфиденциальности
            </h1>
            <p className="mt-3 text-[13px] text-ink-soft">IITALY · обновлено 19 сентября 2026</p>

            <div className="mt-10 space-y-8">
              {SECTIONS.map((s) => (
                <div key={s.title}>
                  <h2 className="font-apple-display text-[22px]! font-semibold leading-[1.3]! tracking-[-0.02em]! text-ink">{s.title}</h2>
                  <div className="mt-2 text-[16px] leading-[1.6] text-ink-soft [&_a]:font-semibold [&_a]:text-red [&_a]:underline [&_a]:underline-offset-4 [&_b]:text-ink">
                    {s.body}
                  </div>
                </div>
              ))}
            </div>

            {/* 19 Nov (phone pass): on phones these two links were 23px tall; there they are 44px targets. */}
            <div className="mt-12 flex flex-wrap gap-6 text-[15px] font-medium max-sm:gap-y-0">
              <Link href="/terms" className="text-ink underline underline-offset-4 max-sm:inline-flex max-sm:min-h-11 max-sm:items-center">Условия сервиса</Link>
              <Link href="/" className="text-ink underline underline-offset-4 max-sm:inline-flex max-sm:min-h-11 max-sm:items-center">Вернуться на сайт</Link>
            </div>
          </div>
        </section>
    </MarketingLayout>
  );
}
