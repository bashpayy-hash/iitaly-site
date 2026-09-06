import type { GuideCard as GuideCardData } from "@/data/guides";
import { Accordion } from "@/components/Accordion";

export function GuideCard({ guide }: { guide: GuideCardData }) {
  return (
    <Accordion
      summary={
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-2xl leading-none">
            {guide.icon}
          </span>
          <div>
            <b className="block font-display text-base font-black">{guide.title}</b>
            <span className="mt-1 block text-sm text-ink-soft">{guide.teaser}</span>
          </div>
        </div>
      }
    >
      {guide.lead && <p className="mb-3 text-sm font-bold">{guide.lead}</p>}
      <dl className="space-y-2">
        {guide.rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-ink-soft">{r.label}</dt>
            <dd className="font-bold sm:text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
      {guide.warn && (
        <div className="mt-3 rounded-md border-2 border-warn bg-warn/10 px-3 py-2.5 text-sm">{guide.warn}</div>
      )}
    </Accordion>
  );
}
