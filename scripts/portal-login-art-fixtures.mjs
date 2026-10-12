import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Экран входа берёт акварель кампуса из проекта (public/illustrations/
// editorial/campus-arrival-*), а не со стороннего CDN. Сверяем экспорт с
// манифестом docs/campus-arrival-assets.json; отдаёт файлы тот же
// локальный сервер, что и сайт, поэтому подменять запросы больше нечем —
// карта пустая, а внешние запросы проверки по-прежнему блокируют.
export async function loadLoginArtwork() {
  const catalog = JSON.parse(await readFile('docs/campus-arrival-assets.json', 'utf8'));
  for (const variant of catalog.variants) {
    const bytes = await readFile(resolve('out/illustrations/editorial', variant.file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), variant.sha256, `Login artwork ${variant.file} must not change`);
  }
  return new Map();
}
