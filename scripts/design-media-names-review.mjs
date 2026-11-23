import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// A picture's name is its version.
//
// Owner, 23 Nov: «в целом оптимизируй сайт, чтобы все быстрее прогружалось».
// Pictures, textures and video were served with max-age=0, because a picture
// redrawn under its old name must not be shown from a cache: so on every page
// a browser asked the server about each of 20–50 files before showing it.
// netlify.toml now lets a browser keep them for 30 days, and this review holds
// the rule that makes it safe:
// 1. a file in a cached folder never changes under its name (a redrawn
//    picture gets a new name, as cartouches and og.jpg already do);
// 2. a name that was used before is not given to a different file;
// 3. every folder of public/ is either cached by a rule in netlify.toml or
//    named here as deliberately uncached, so a new folder is a decision.
// 4. every picture, video, stylesheet, script and page that the built site
//    refers to exists. A browser keeps the answer «not found» for a cached
//    folder as long as it keeps a picture, so a reference to a file that is
//    added a day later would stay broken for that visitor for a month.
// Pure git and files: no browser. BASE_SHA is the reviewed base, as in the
// other reviews; the fourth check reads the build in out/.
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const base = process.env.BASE_SHA || git('merge-base', 'HEAD', 'origin/main').trim();

// The rules the host is given: folder → seconds a browser may keep its files.
const toml = readFileSync('netlify.toml', 'utf8');
const cached = new Map();
for (const block of toml.split('[[headers]]').slice(1)) {
  const path = block.match(/^\s*for\s*=\s*"([^"]+)"/m)?.[1];
  const age = block.match(/Cache-Control\s*=\s*"[^"]*max-age=(\d+)/)?.[1];
  if (path && age && Number(age) > 0 && path.endsWith('/*') && path !== '/*') cached.set(path.slice(1, -1), Number(age));
}
assert(cached.size >= 10, 'netlify.toml lists the cached folders');
const rule = path => [...cached.keys()].find(folder => path.startsWith(folder));

// 3. Every folder with files has a decision.
const UNCACHED = new Set([
  'illustrations/',   // files in the folder's root: old decorative bands, kept revalidating
]);
const folders = new Set();
const walk = directory => {
  for (const name of readdirSync(join('public', directory))) {
    const path = join(directory, name);
    if (statSync(join('public', path)).isDirectory()) walk(path);
    else if (directory) folders.add(directory.split('/').slice(0, directory.startsWith('illustrations') ? 2 : 1).join('/') + '/');
  }
};
walk('');
const undecided = [...folders].filter(folder => !rule(folder) && !UNCACHED.has(folder)).sort();
assert.deepEqual(undecided, [], 'Folders of public/ with no cache rule in netlify.toml and no entry in UNCACHED: ' + undecided.join(', '));
const empty = [...cached.keys()].filter(folder => !folders.has(folder) && folder !== '_next/static/');
assert.deepEqual(empty, [], 'Cache rules for folders that hold no files: ' + empty.join(', '));
// Rules must not overlap: two matching rules would send one header with two terms.
const overlaps = [...cached.keys()].filter(a => [...cached.keys()].some(b => a !== b && a.startsWith(b)));
assert.deepEqual(overlaps, [], 'Cache rules that overlap: ' + overlaps.join(', '));

// 1 and 2. Names are final.
const sha = buffer => createHash('sha256').update(buffer).digest('hex');
const changes = git('diff', '--name-status', '--no-renames', base, 'HEAD', '--', 'public').trim().split('\n').filter(Boolean).map(line => line.split('\t'));
const problems = [];
for (const [status, file] of changes) {
  const path = file.replace(/^public\//, '');
  if (!rule(path)) continue;
  if (status === 'M') problems.push(`${file}: changed under the same name. Browsers keep it for ${Math.round(cached.get(rule(path)) / 86400)} days: give the new version a new name.`);
  if (status === 'A') {
    // The last commit before the base in which this name held a file.
    const before = git('log', '-1', '--format=%H', '--diff-filter=AM', base, '--', file).trim();
    if (before && sha(execFileSync('git', ['show', `${before}:${file}`], { maxBuffer: 256 * 1024 * 1024 })) !== sha(readFileSync(file))) {
      problems.push(`${file}: this name held a different file before (${before.slice(0, 7)}). Give the new one a new name.`);
    }
  }
}
assert.deepEqual(problems, [], problems.join('\n'));

// 4. Nothing the built site refers to is missing.
const out = 'out';
const built = [];
const collect = directory => { for (const name of readdirSync(directory)) { const path = join(directory, name); if (statSync(path).isDirectory()) collect(path); else built.push(path); } };
collect(out);
const isFile = path => { try { return statSync(path).isFile(); } catch { return false; } };
const exists = reference => {
  const path = decodeURIComponent(reference.split('#')[0].split('?')[0]);
  if (!path || path === '/') return true;
  return isFile(join(out, path)) || isFile(join(out, path + '.html')) || isFile(join(out, path, 'index.html'));
};
const missing = new Map();
let references = 0;
const note = (reference, from) => { references++; if (!exists(reference)) missing.set(reference, [...new Set([...(missing.get(reference) || []), from.slice(out.length)])].slice(0, 3)); };
for (const file of built) {
  if (file.endsWith('.html')) {
    const html = readFileSync(file, 'utf8');
    for (const [, reference] of html.matchAll(/(?:href|src|poster)="(\/(?!\/)[^"]*)"/g)) note(reference, file);
    for (const [, set] of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/gi)) for (const part of set.split(',')) { const reference = part.trim().split(/\s+/)[0]; if (reference.startsWith('/') && !reference.startsWith('//')) note(reference, file); }
  } else if (file.endsWith('.css')) {
    for (const [, reference] of readFileSync(file, 'utf8').matchAll(/url\(["']?(\/(?!\/)[^)"']+)/g)) note(reference, file);
  }
}
assert(references > 1000, 'The build in out/ was read');
assert.deepEqual([...missing.keys()], [], 'The built site refers to files that do not exist: ' + [...missing].map(([reference, from]) => `${reference} (${from.join(', ')})`).join('; '));
console.log(JSON.stringify({ cachedFolders: cached.size, foldersInPublic: folders.size, mediaChanges: changes.length, builtFiles: built.length, references, missing: 0, passed: true }, null, 2));
