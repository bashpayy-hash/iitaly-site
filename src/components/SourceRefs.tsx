import { ADMISSION_SOURCES, REVIEWED_AT, REVIEWED_LABEL, type SourceId } from "@/data/admissions";

export function SourceRefs({ ids }: { ids: readonly SourceId[] }) {
  return (
    <div className="mt-4 border-t border-current/15 pt-3 text-sm leading-relaxed">
      <p>Проверено <time dateTime={REVIEWED_AT}>{REVIEWED_LABEL}</time></p>
      <ul className="mt-2 space-y-2">
        {ids.map((id) => {
          const source = ADMISSION_SOURCES[id];
          return <li key={id}>
            <a href={source.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{source.label} ↗</a>
            <span className="block text-apple-caption leading-relaxed">{source.scope}</span>
          </li>;
        })}
      </ul>
    </div>
  );
}
