import { DataPanel } from "@/components/DataPanel";

export function Stats() {
  return (
    <section className="border-b-2 border-ink px-5 py-14">
      <div className="mx-auto max-w-[1200px]">
        <p className="mb-6 font-editorial text-3xl text-ink italic sm:text-4xl">
          Цифры, а не обещания.
        </p>

        <DataPanel
          watermark="€"
          hero={{ value: "€7 557", label: "Стипендия DSU в год — покрывает жильё и питание" }}
          stats={[
            { value: "€0–4К", label: "Год в госвузе по ISEE семьи" },
            { value: "43", label: "Университета в базе с тестами и дедлайнами" },
            { value: "30", label: "Городов на интерактивной карте" },
          ]}
        />
      </div>
    </section>
  );
}
