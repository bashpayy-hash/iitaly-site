const words = [
  "DSU",
  "UNIVERSITALY",
  "ВИЗА D",
  "CIMEA",
  "APOSTILLE",
  "ISEEU",
  "PERMESSO DI SOGGIORNO",
  "CODICE FISCALE",
];

/**
 * Лента терминов — первая полоса «листа» с разделами. Скруглённую кромку
 * несёт сам лист (см. page.tsx), а не эта полоса: радиус в 64px на
 * элементе высотой 48px браузер ужимает пропорционально, и вместо края
 * листа получается просто скруглённая плашка — пробовал, не читается.
 */
export function Ticker() {
  const line = [...words, ...words];
  return (
    <div className="overflow-hidden border-b-2 border-ink bg-ink py-3 text-cream">
      <div className="animate-[ticker_24s_linear_infinite] flex w-max gap-8 motion-reduce:animate-none">
        {[...line, ...line].map((w, i) => (
          <span
            key={i}
            className="font-sans text-sm font-extrabold tracking-[0.16em] whitespace-nowrap uppercase"
          >
            {w} <span className="text-red">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
