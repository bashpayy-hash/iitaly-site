// Веспа — маскот IItaly, попутчик. Ассеты — статические SVG в
// public/mascot/source/, сгенерированные из одной геометрии (см.
// docs/mascot-bible.md и public/mascot/mascot.config.yaml) — каждая поза
// гарантированно не расходится с остальными. Компонент — тонкая обёртка
// над <img>, не переизобретает разметку.
export type VespaPose =
  | "master"
  | "hero"
  | "avatar"
  | "wave"
  | "compare"
  | "documents"
  | "deadline"
  | "visa"
  | "dsu"
  | "plan"
  | "thinking"
  | "empty"
  | "success"
  | "warning"
  | "error"
  | "404"
  | "celebrate";

export function Vespa({
  pose,
  className = "",
  alt = "",
  priority = false,
}: {
  pose: VespaPose;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    // next/image не даёт выигрыша на статичном 1-3КБ векторе с гибким
    // className-размером (h-X w-auto) и требует explicit width/height.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/mascot/source/mascot-${pose}.svg`}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
