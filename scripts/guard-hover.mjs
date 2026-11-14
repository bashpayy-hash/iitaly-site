// One-off codemod (owner, 14 Nov 2026: «поправь элементы именно с дизайном…
// исправь все неточности», after the uxaudit pass). On a phone a tap leaves
// :hover on the element, so a hovered option looks chosen on the next screen
// (the plan questionnaire was the worst case). DESIGN_GUIDE.md already says
// hover only under (hover: hover) and (pointer: fine); 127 rules did not.
// For every rule whose selector has :hover and that is not already inside an
// @media (hover…) block: selectors without :hover stay where they are (so a
// shared «:hover, [aria-pressed=true]» keeps the chosen state on touch), the
// :hover selectors move into an @media (hover: hover) and (pointer: fine)
// block placed right after, in the same spot, so the cascade order holds.
// globals.css is compared byte for byte by design-guard and is skipped.
// Usage: node scripts/guard-hover.mjs [--check]   (--check: exit 1 if any left)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const postcss = createRequire(import.meta.url)('postcss');
const QUERY = '(hover: hover) and (pointer: fine)';
const check = process.argv.includes('--check');
const files = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.css') && !p.endsWith(path.join('app', 'globals.css'))) files.push(p);
  }
})('src');
const guarded = node => { for (let p = node.parent; p; p = p.parent) if (p.type === 'atrule' && p.name === 'media' && /hover\s*:\s*hover/.test(p.params)) return true; return false; };
const inKeyframes = node => { for (let p = node.parent; p; p = p.parent) if (p.type === 'atrule' && /keyframes$/.test(p.name)) return true; return false; };
let total = 0;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const root = postcss.parse(source, { from: file });
  let moved = 0;
  root.walkRules(rule => {
    if (!/:hover/.test(rule.selector) || guarded(rule) || inKeyframes(rule)) return;
    const hover = rule.selectors.filter(s => /:hover/.test(s));
    const rest = rule.selectors.filter(s => !/:hover/.test(s));
    const media = postcss.atRule({ name: 'media', params: QUERY, raws: { before: rule.raws.before, afterName: ' ' } });
    const copy = rule.clone({ selectors: hover });
    copy.raws.before = ' ';
    media.append(copy);
    media.raws.after = ' ';
    if (rest.length) { rule.selectors = rest; rule.after(media); }
    else rule.replaceWith(media);
    moved += hover.length;
  });
  if (moved) {
    total += moved;
    if (!check) fs.writeFileSync(file, root.toString());
    console.log(`${check ? 'unguarded' : 'guarded'} ${String(moved).padStart(3)}  ${file}`);
  }
}
console.log(`${check ? 'unguarded' : 'guarded'} :hover selectors: ${total}`);
if (check && total) process.exit(1);
