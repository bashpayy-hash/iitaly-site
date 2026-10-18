/** A face-free, code-native helmet mark. Not a generated 2D character pose. */
export function VespiMark({ className = "" }: { className?: string }) {
  return <svg className={className} data-vespi="editorial-mark" data-vespi-presence="mark" data-vespi-role="route" viewBox="0 0 80 72" fill="none" aria-hidden="true">
    <path d="M13 45C10 26 19 11 38 9c17-2 31 10 32 28l-8 20-17 6-18-6-14-12Z" fill="var(--color-coral-soft)" />
    <path d="M17 45c-5-18 4-34 21-36 17-2 30 10 31 27l-8 16-8-2 2-17c0-8-6-14-14-14-11 0-18 8-18 19l2 10-8-3Z" fill="var(--color-coral)" />
    <path d="M41 10C27 16 21 28 23 44M18 45l9 5m26 0 8 2 8-16M30 57c8 7 18 8 29 3" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M41 11c-6 5-10 11-12 18" stroke="var(--color-warm-white)" strokeWidth="4" strokeLinecap="round" />
    <path d="M51 60c2 4 7 6 12 4" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>;
}
