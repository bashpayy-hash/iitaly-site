import Link from "next/link";
import { Heading, Body, Caption } from "@/components/Typography";

const chevron = (
  <svg aria-hidden viewBox="0 0 16 10" className="h-2.5 w-4 shrink-0 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:translate-x-[3px]">
    <path
      d="M1 5h13m0 0L9.5 1M14 5l-4.5 4"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Split() {
  return (
    <section className="border-b-2 border-ink px-5 py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Link
          href="/universities"
          className="group relative overflow-hidden rounded-xl border-2 border-ink p-8 text-cream shadow-soft-md transition-[transform,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-standard)] hover:-translate-y-1 hover:shadow-soft-lg sm:p-10"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--color-ink) 0%, var(--color-ink) 55%, var(--color-red-deep) 130%)",
          }}
        >
          <Caption as="p" className="text-cream/60">
            Интерактивная карта
          </Caption>
          <Heading as="h3" className="mt-3 text-title!">
            Найди свой <span className="text-red">университет</span>
          </Heading>
          <Body as="p" className="mt-3 max-w-md text-cream/70">
            30 городов и 43 вуза: цены по ISEE, тесты, дедлайны и стипендия региона.
          </Body>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold">
            Смотреть карту {chevron}
          </span>
        </Link>

        <Link
          href="/plan"
          className="group relative overflow-hidden rounded-xl border-2 border-ink p-8 shadow-soft-md transition-[transform,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-standard)] hover:-translate-y-1 hover:shadow-soft-lg sm:p-10"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--color-paper) 0%, var(--color-paper) 60%, var(--color-cream) 140%)",
          }}
        >
          <Caption as="p">Бесплатно</Caption>
          <Heading as="h3" className="mt-3 text-heading!">
            Получи <span className="text-red">маршрут</span>
          </Heading>
          <Body as="p" className="mt-3">
            Шесть вопросов о твоей ситуации — и персональный план поступления.
          </Body>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-ink">
            Составить план {chevron}
          </span>
        </Link>
      </div>
    </section>
  );
}
