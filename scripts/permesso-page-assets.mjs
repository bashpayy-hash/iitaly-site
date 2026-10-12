import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Геометрия бланка — TypeScript; для проверок транспилируем её на лету.
export function loadPermessoGeometry() {
  const ts = require('typescript');
  const previous = require.extensions['.ts'];
  require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
  try { return require(resolve('src/components/guides/permesso/permessoOriginalGeometry.ts')); }
  finally { if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts']; }
}

// Страницы Modulo 1 — файлы проекта (public/permesso → out/permesso), их
// отдаёт тот же локальный сервер, что и сайт. До запуска браузера сверяем
// каждую с sha256 и размером из permessoOriginalGeometry.ts: подменённая или
// пережатая страница роняет проверку, а не сдвигает клетки относительно
// координат молча. Адрес обязан быть своим — не сторонний CDN.
export async function verifyPermessoPages(pages, root = resolve('out')) {
  assert.equal(pages.length, 8, 'Eight Modulo 1 pages');
  for (const p of pages) {
    assert.equal(p.url, `/permesso/modulo1-page-${p.page}.webp`, 'Modulo 1 pages are served by the site itself');
    const body = await readFile(resolve(root, '.' + p.url));
    assert.equal(body.length, p.bytes, `${p.url} size`);
    assert.equal(createHash('sha256').update(body).digest('hex'), p.sha256, `${p.url} sha256`);
  }
}
