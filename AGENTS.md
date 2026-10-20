<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# IITALY: что прочитать до правок

1. `HANDOFF.md` — продукт, аудитория, правила, которые нельзя нарушать
   (бэкенд не трогать, тексты, цены и фактуру не менять, PR только в `main`).
2. `DESIGN.md` — визуальный язык: тёплый холст `#FAF8F5`, текст `#141413`,
   акцент `#E63946`. Направление дизайна не менять без просьбы владельца.
3. `README.md` — запуск и проверки.

Перед PR: `npx tsc --noEmit && npm run lint && npm run build`, затем
браузерные проверки из `.github/workflows/design-review.yml`.
