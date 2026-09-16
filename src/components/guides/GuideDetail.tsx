import type { GuideCard as GuideCardData } from "@/data/guides";
import { AppleBody } from "@/components/apple/Typography";

/**
 * Содержимое одной главы справочника — без своей рамки/эмодзи/заголовка:
 * заголовок и номер главы рисует индекс (десктоп) или summary аккордеона
 * (мобильный), это только тело.
 */
export function GuideDetail({ guide }: { guide: GuideCardData }) {
  return (
    <div>
      {guide.lead && (
        <AppleBody as="p" className="text-apple-body-sm text-carbon">
          {guide.lead}
        </AppleBody>
      )}
      <dl className={`space-y-2.5 ${guide.lead ? "mt-4" : ""}`}>
        {guide.rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-0.5 border-t border-mist/20 pt-2.5 text-apple-body-sm first:border-t-0 first:pt-0 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-graphite">{r.label}</dt>
            <dd className="font-semibold text-carbon sm:text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
      {guide.warn && (
        <div className="mt-4 rounded-apple-card border border-warn bg-warn/10 px-4 py-3 text-apple-body-sm text-carbon">{guide.warn}</div>
      )}
    </div>
  );
}
