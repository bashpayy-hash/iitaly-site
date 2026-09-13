# IItaly — сайт

Next.js 16 (App Router, Turbopack) со статическим экспортом. Бэкенд живёт
отдельно и этим репозиторием не управляется.

Визуальный язык описан в [DESIGN.md](./DESIGN.md) — это источник правды.
Перед любой правкой интерфейса читай его.

## Разработка

```bash
npm install
cp .env.example .env.local   # адрес бэкенда
npm run dev                  # http://localhost:3000
```

Проверки перед коммитом:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Сборка и деплой

```bash
npm run build     # → out/
```

`output: "export"` в `next.config.ts` — сборка отдаёт статику, серверной
части у фронтенда нет. Публикуется каталог `out`.

Netlify собирает по `netlify.toml`: команда `npm run build`, каталог
`out`, Node 22, заголовки `X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options`. Любой другой статический хостинг (Vercel, Cloudflare
Pages, S3 + CDN) подойдёт с теми же тремя параметрами.

Проверить сборку локально ровно так, как её увидит хостинг:

```bash
npx serve out -l 4321
```

### Переменные окружения

| Переменная | Значение | Зачем |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | адрес Express-сервера на Railway | все запросы фронтенда |

Она вшивается в бандл на этапе сборки (префикс `NEXT_PUBLIC_`), поэтому
после её изменения нужен новый деплой, а не перезапуск. На Netlify она
задана в `netlify.toml` → `[build.environment]`; локально — в
`.env.local` (см. `.env.example`).

## Бэкенд

Node/Express на Railway, **в этом репозитории его нет и трогать его не
нужно**. Фронтенд только читает адрес из `NEXT_PUBLIC_BACKEND_URL`
(единственная точка — `src/lib/backend.ts`) и обращается к:

```
POST /api/chat · /api/check-document · /api/order · /api/lead · /api/event
GET  /api/portal/:code?surname=
POST /api/portal/:code/task · /doc · /notify · /delete
```

Контракты менять нельзя: на них завязан уже работающий сервер.

## Что лежит в корне

`index.html`, `privacy.html`, `tokens.css`, `robots.txt` — предыдущая
версия сайта одним файлом. Оставлены намеренно как справочный материал,
в сборку не попадают. Актуальная статика — в `public/`.

`design/` — исходники и разборы иллюстраций, риг маскота.
`docs/` — заметки по использованию маскота и моторике.
