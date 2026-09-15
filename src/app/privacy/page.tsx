import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Политика конфиденциальности",
  description: "Какие данные IItaly собирает, как их использует и как их можно удалить.",
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Какие данные мы собираем",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          <b>Имя и телефон</b> — только если ты сам оставил их в форме заказа или подписался на
          напоминания о дедлайнах.
        </li>
        <li>
          <b>Ответы в онбординге</b> — уровень образования, цель и бюджет, чтобы подобрать
          рекомендации.
        </li>
        <li>
          <b>Сообщения ИИ-чату</b> — для формирования ответа.
        </li>
        <li>
          <b>Документы</b>, которые ты загружаешь на проверку.
        </li>
        <li>
          <b>Анонимная аналитика</b> — обезличенный идентификатор устройства и события вроде
          «открыл раздел цен», чтобы понимать, где сервис неудобен.
        </li>
      </ul>
    ),
  },
  {
    title: "Как мы их используем",
    body: (
      <p>
        Данные нужны исключительно для оказания услуги: подбор программ, проверка документов,
        связь по заказу и напоминания о сроках. Мы не продаём и не передаём их третьим лицам для
        рекламы.
      </p>
    ),
  },
  {
    title: "Документы",
    body: (
      <p>
        Загруженный документ передаётся в сервис Anthropic (Claude) для анализа и возвращается
        тебе в виде разбора. Мы не публикуем документы и не используем их для обучения моделей.
        Если хочешь удалить свои данные — напиши нам, удалим.
      </p>
    ),
  },
  {
    title: "Хранение",
    body: (
      <p>
        Код входа в личный кабинет хранится на твоём устройстве. Заказы и заявки хранятся у нас
        столько, сколько нужно для оказания услуги и выполнения требований законодательства.
      </p>
    ),
  },
  {
    title: "Твои права",
    body: (
      <p>
        Ты можешь запросить, какие данные о тебе есть, исправить их или потребовать удаления. Для
        этого достаточно написать в тот же контакт, через который оформлялся заказ, — или удалить
        данные самостоятельно в личном кабинете.
      </p>
    ),
  },
  {
    title: "Дети",
    body: (
      <p>
        Сервис рассчитан на абитуриентов. Если тебе нет 18 лет, пользуйся им вместе с родителем
        или опекуном — особенно в части оплаты.
      </p>
    ),
  },
  {
    title: "Контакты",
    body: <p>Вопросы по данным — через контакт, указанный при оформлении заказа, или в ИИ-чате на сайте.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="px-5 py-10 sm:py-14">
          <div className="mx-auto max-w-[720px]">
            <h1 className="font-display text-3xl font-bold tracking-tight uppercase sm:text-4xl">
              Политика конфиденциальности
            </h1>
            <p className="mt-1.5 text-xs text-ink-soft">IItaly · обновлено при запуске сервиса</p>

            <div className="mt-8 space-y-6">
              {SECTIONS.map((s) => (
                <div key={s.title}>
                  <h2 className="font-display text-lg font-bold">{s.title}</h2>
                  <div className="mt-1.5 text-sm text-ink-soft [&_a]:font-bold [&_a]:text-red [&_b]:text-ink">
                    {s.body}
                  </div>
                </div>
              ))}
            </div>

            <Link href="/" className="mt-10 inline-block text-sm font-bold text-ink underline underline-offset-4">
              ← Вернуться на сайт
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
