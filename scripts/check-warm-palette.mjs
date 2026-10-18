import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

// Enforce the user's complete UI palette, including encoded SVG paint and
// motion-template alpha values. Raster artwork is intentionally not recolored.
const manifest = JSON.parse(await readFile('design/warm-tokens.json', 'utf8'));
const allowed = new Set(Object.values(manifest.colors).map(value => value.slice(1).toLowerCase()));
allowed.add('1c1917'); // The explicitly specified warm shadow RGB (28,25,23).
const extensions = new Set(['.css', '.scss', '.tsx', '.ts', '.jsx', '.js', '.html', '.svg', '.json']);
const errors = [];
let files = 0, paints = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { await walk(path); continue; }
    if (!extensions.has(extname(path))) continue;
    files++;
    let source = (await readFile(path, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
    source = source.replace(/%23(?=[a-f\d]{3,8}\b)/gi, '#');
    const fail = (index, value) => errors.push(`${path}:${source.slice(0, index).split('\n').length} ${value}`);
    for (const match of source.matchAll(/#([a-f\d]{8}|[a-f\d]{6}|[a-f\d]{4}|[a-f\d]{3})\b/gi)) {
      let hex = match[1].toLowerCase();
      if (hex.length <= 4) hex = [...hex].map(c => c + c).join('');
      if (hex.length === 8 && hex.slice(6) === '00') continue;
      paints++;
      if (!allowed.has(hex.slice(0, 6))) fail(match.index, match[0]);
    }
    for (const match of source.matchAll(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/gi)) {
      paints++;
      const hex = match.slice(1).map(c => Math.round(Number(c)).toString(16).padStart(2, '0')).join('');
      if (!allowed.has(hex)) fail(match.index, match[0]);
    }
    for (const match of source.matchAll(/\b(?:oklch|oklab|hsl|hsla)\s*\(/gi)) fail(match.index, `Use a canonical token: ${match[0]}`);
    for (const match of source.matchAll(/(?:--color-|\b(?:text|bg|border|ring|outline|fill|stroke|from|via|to|shadow)-)(?:[a-z]+-)?(?:blue|sky|cyan|indigo|violet|purple|slate|cool-gray)(?:-\d+)?\b/gi)) fail(match.index, match[0]);
  }
}
await walk('src');
await walk('public');
await walk('design');
await walk('tools');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Warm palette verified: ${files} source/vector/token files, ${paints} literal paints, zero colors outside the approved palette.`);
