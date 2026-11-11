<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# IITALY: что прочитать до правок

0. `NEXT_CHAT.md` — выжимка для нового чата: концепт, что сделано и что
   осталось, что работает и что нет, принципы владельца в дизайне и работе.
1. `HANDOFF.md` — продукт, аудитория, правила, которые нельзя нарушать
   (бэкенд не трогать, тексты, цены и фактуру не менять, PR только в `main`).
2. `DESIGN_GUIDE.md` — дизайн-гайд: стиль, принципы, как владелец даёт
   правки, какими скиллами работать. Читать перед любой правкой интерфейса.
3. `DESIGN.md` — журнал визуального языка: тёплый холст `#FAF8F5`, текст
   `#141413`, акцент `#E63946`. Направление дизайна не менять без просьбы
   владельца.
4. `README.md` — запуск и проверки.

Перед PR: `npx tsc --noEmit && npm run lint && npm run build`, затем
браузерные проверки из `.github/workflows/design-review.yml`.
