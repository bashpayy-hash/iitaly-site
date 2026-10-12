import { SourceRefs } from "@/components/SourceRefs";
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
        <AppleBody as="p" className="text-apple-body-sm text-cloud-white">
          {guide.lead}
        </AppleBody>
      )}
      <dl className={`space-y-2.5 ${guide.lead ? "mt-4" : ""}`}>
        {guide.rows.map((r) => (
          <div key={r.label} className="border-t border-white/10 pt-4 pb-2 text-apple-body-sm first:border-t-0 first:pt-0">
            <dt className="font-semibold text-cloud-white">{r.label}</dt>
            <dd className="mt-1 max-w-[68ch] text-cloud-body">{r.value}</dd>
          </div>
        ))}
      </dl>
      {guide.warn && (
        <div className="mt-4 border border-warn bg-warn/10 px-4 py-3 text-apple-body-sm text-cloud-white">{guide.warn}</div>
      )}
      <div className="text-cloud-meta"><SourceRefs ids={guide.sources} /></div>
    </div>
  );
}
