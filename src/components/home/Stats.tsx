import { EditorialStatsPanel } from "@/components/home/EditorialStatsPanel";

export function Stats() {
  return (
    <section className="border-b-2 border-ink px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px]">
        <p className="mb-8 font-display text-heading font-semibold text-ink sm:text-title">
          Цифры, а не обещания.
        </p>

        <EditorialStatsPanel
          watermark="€"
          viewEvent="dsu_section_viewed"
          hero={{
            value: "до €7 557",
            label: "Стипендия DSU в год — потолок в Риме, покрывает жильё и питание. Сумма зависит от города и дохода семьи",
          }}
          metrics={[
            { value: "43", numeric: 43, label: "университета в базе с тестами и дедлайнами" },
            { value: "30", numeric: 30, label: "городов на интерактивной карте" },
            {
              value: "25 000 ₸",
              numeric: 25000,
              suffix: " ₸",
              label: "полный цикл поступления, разово",
            },
          ]}
          metaLine="База: правила приёма 2026/27 (MUR, CIMEA, bando регионов). Ответы ИИ могут содержать ошибки — критичное проверяет эксперт."
        />
      </div>
    </section>
  );
}
