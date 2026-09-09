import Link from "next/link";

export function Split() {
  return (
    <section className="border-b-2 border-ink px-5 py-14">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Link
          href="/universities"
          className="group relative overflow-hidden rounded-lg border-2 border-ink p-8 text-cream shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg sm:p-10"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--color-ink) 0%, var(--color-ink) 55%, var(--color-red-deep) 130%)",
          }}
        >
          <p className="text-xs font-extrabold tracking-[0.16em] text-cream/60 uppercase">
            Интерактивная карта
          </p>
          <h3 className="mt-3 font-display text-3xl font-black tracking-tight uppercase sm:text-4xl">
            Найди свой <span className="text-red">университет</span>
          </h3>
          <p className="mt-3 max-w-md text-sm text-cream/70">
            30 городов и 43 вуза: цены по ISEE, тесты, дедлайны и стипендия региона.
          </p>
          <span className="mt-6 inline-block text-sm font-extrabold tracking-wide uppercase underline-offset-4 group-hover:underline">
            Смотреть карту →
          </span>
        </Link>

        <Link
          href="/plan"
          className="group relative overflow-hidden rounded-lg border-2 border-ink p-8 shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg sm:p-10"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--color-paper) 0%, var(--color-paper) 60%, var(--color-cream) 140%)",
          }}
        >
          <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
            Бесплатно
          </p>
          <h3 className="mt-3 font-display text-2xl font-black tracking-tight uppercase sm:text-3xl">
            Получи <span className="text-red">маршрут</span>
          </h3>
          <p className="mt-3 text-sm text-ink-soft">
            Шесть вопросов о твоей ситуации — и персональный план поступления.
          </p>
          <span className="mt-6 inline-block text-sm font-extrabold tracking-wide uppercase underline-offset-4 group-hover:underline">
            Составить план →
          </span>
        </Link>
      </div>
    </section>
  );
}
