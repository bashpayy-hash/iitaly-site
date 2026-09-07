const STAGES = [
  {
    n: "1",
    title: "Бесплатно · 10 минут",
    body: "Отвечаешь на 6 вопросов о своей ситуации или загружаешь документ на проверку. Видишь план и шансы на стипендию сразу, без оплаты.",
    time: "сегодня",
  },
  {
    n: "2",
    title: "Оплата 25 000 ₸",
    body: "Один платёж, без подписки. Личный кабинет открывается сразу — код доступа приходит в WhatsApp в течение часа.",
    time: "сразу после оплаты",
  },
  {
    n: "3",
    title: "Маршрут и документы",
    body: "Персональный чек-лист по стадиям — аттестат и CIMEA, Universitaly, стипендия DSU. Каждый документ проверяет ИИ до подачи, дедлайны — с напоминаниями в Telegram и на почту.",
    time: "CIMEA 30–60 дней · Universitaly май–июль · DSU до приезда",
  },
  {
    n: "4",
    title: "Виза и вылет",
    body: "Досье на визу D собираем заранее, подача не позднее чем за 15 дней до выезда. После прилёта — 8 рабочих дней на permesso di soggiorno, дальше кабинет ведёт первые шаги в Италии.",
    time: "рассмотрение визы до 90 дней",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b-2 border-ink px-5 py-16">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
          Как проходит работа с нами
        </p>
        <h2 className="mt-2 font-display text-4xl font-black tracking-tight uppercase sm:text-5xl">
          От вопроса до посадки
          <br />
          в самолёт
        </h2>

        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border-2 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s) => (
            <div key={s.n} className="flex flex-col bg-paper p-6">
              <span className="font-display text-3xl font-black text-red">{s.n}</span>
              <h3 className="mt-3 text-base font-extrabold tracking-tight uppercase">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm text-ink-soft">{s.body}</p>
              <p className="mt-4 text-xs font-bold text-sec uppercase">{s.time}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
