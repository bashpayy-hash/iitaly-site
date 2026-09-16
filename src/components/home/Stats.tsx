import { AppleCaption } from "@/components/apple/Typography";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";

const METRICS = [
  { value: "до €7 557", label: "Стипендия DSU в год — потолок в Риме, зависит от города и дохода семьи" },
  { value: "43", label: "университета в базе с тестами и дедлайнами" },
  { value: "30", label: "городов на интерактивной карте" },
  { value: priceLabel(PRICE_MAIN), label: "полный цикл поступления, разово" },
];

export function Stats() {
  return (
    <section className="bg-white px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-[980px]">
        <AppleCaption as="p" className="text-center">Цифры, а не обещания</AppleCaption>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <p className="font-apple-display text-apple-heading-sm font-semibold text-carbon tabular-nums sm:text-apple-heading">
                {m.value}
              </p>
              <p className="mt-2 text-apple-caption text-ash">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-apple-caption text-ash">
          База: правила приёма 2026/27 (MUR, CIMEA, bando регионов). Ответы ИИ
          могут содержать ошибки — критичное проверяет эксперт.
        </p>
      </div>
    </section>
  );
}
