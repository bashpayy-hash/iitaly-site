/* Раскладка бенто без дыр (owner, 20 Nov: «должна быть банальная ровность»).
   Сетка бенто — 12 колонок на широкой подложке и 6 на средней; эти функции
   считают, сколько колонок дать каждой ячейке, чтобы каждый ряд был заполнен
   от края до края. */

/** Spans that fill every row of a `cols`-column grid: a cell that does not fit
 *  closes its row, and the row's cells stretch over the free columns (equal
 *  cells share them evenly). No holes, no ragged last row. */
export function packSpans(sizes: number[], cols: number): number[] {
  const spans = [...sizes];
  let row: number[] = [], used = 0;
  const close = () => {
    const free = cols - used;
    if (row.length && free > 0) {
      const same = row.every(index => spans[index] === spans[row[0]]);
      if (same && cols % row.length === 0) row.forEach(index => { spans[index] = cols / row.length; });
      else spans[row[row.length - 1]] += free;
    }
    row = []; used = 0;
  };
  sizes.forEach((size, index) => {
    if (used + size > cols) close();
    row.push(index); used += size;
    if (used === cols) close();
  });
  close();
  return spans;
}

/** The calmest packing: every row holds at least two cells where it can,
 *  then the fewest rows. Tries the step and next-step widths it is given. */
export function planSpans(count: number, current: number, cols: number, bases: number[], wides: number[]): number[] {
  let best: { spans: number[]; score: number } | null = null;
  for (const wide of wides) for (const base of bases) {
    const spans = packSpans(Array.from({ length: count }, (_, index) => index === current ? wide : base), cols);
    let rows = 0, lonely = 0, width = 0, cells = 0;
    // A row of one cell is fine only for the next step, which is meant to stand out.
    spans.forEach((span, index) => { width += span; cells += 1; if (width >= cols) { rows += 1; if (cells === 1 && index !== current && count > 1) lonely += 1; width = 0; cells = 0; } });
    const score = lonely * 100 + rows;
    if (!best || score < best.score) best = { spans, score };
  }
  return best!.spans;
}
