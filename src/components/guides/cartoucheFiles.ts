/* Файлы картушей с хэшем мастера в имени (первые 8 знаков SHA-256 файла в
   design/illustrations/source/cartouche/). Перерисованный картуш получает новое
   имя, поэтому netlify.toml отдаёт /illustrations/cartouche/* с годовым кэшем
   (owner, 19 Nov: «сайт иногда долго загружает эти иконки на мобильной версии»).
   Список и замеры — design/illustrations/cartouche-2026-11-19.json. */
export const CARTOUCHE_FILES: Record<string, string> = {
  "alarm": "alarm.2bef48b3",
  "cap": "cap.4976d876",
  "coins": "coins.1db13fd5",
  "diploma": "diploma.0582dac3",
  "doc-check": "doc-check.dd9cb43a",
  "family-docs": "family-docs.103c51b0",
  "folder": "folder.9157f29b",
  "insurance": "insurance.744ae89e",
  "keys": "keys.ace9e925",
  "military": "military.30160013",
  "minors": "minors.daa9b2ef",
  "passport": "passport.01a982c0",
  "permesso-card": "permesso-card.cadce89c",
  "permesso-kit": "permesso-kit.b3c47f4b",
  "route-map": "route-map.26f1b80c",
  "stamp-pad": "stamp-pad.ac486e56",
  "suitcase": "suitcase.66335db7",
  "tax-card": "tax-card.82dd7723",
  "tests": "tests.cfa61406",
  "translation": "translation.d1911f9d",
};
