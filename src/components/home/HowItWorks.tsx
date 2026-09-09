import { Title, Heading, Body, Caption } from "@/components/Typography";
import { Reveal } from "@/components/motion/Reveal";

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
    <section className="border-b-2 border-ink px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px]">
        <Reveal variant="fade">
          <Caption as="p">Как проходит работа с нами</Caption>
          <Title as="h2" className="mt-3">
            От вопроса до посадки
            <br />
            в самолёт
          </Title>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border-2 border-ink bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => (
            <Reveal key={s.n} delay={Math.min(i * 0.06, 0.24)} amount={0.3} className="h-full">
              <div className="relative flex h-full flex-col bg-paper p-6 sm:p-7">
                <span className="font-display text-3xl font-black text-red">{s.n}</span>
                <Heading as="h3" className="mt-3 text-heading!">
                  {s.title}
                </Heading>
                <Body as="p" className="mt-2 flex-1">
                  {s.body}
                </Body>
                <p className="mt-4 text-xs font-bold text-sec uppercase">{s.time}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
