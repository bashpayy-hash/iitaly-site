# iItaly — единая тёплая система

Актуальный запрос пользователя, 18 октября 2026, отменяет прежний запрет
на смену палитры и локальную синюю тему `/guides`.

- Холст всех маршрутов: `#FAF8F5`. Поверхности: белый и `#FFFDF9`.
- Текст и действия: `#141413`. Сигнал бренда: `#E63946`.
- Акцент заголовка: `135deg, #D92B38 0%, #E63946 45%, #F4845F 100%`.
- Подложки: `#EFECE6`, персик `rgba(253,238,228,.7)`, лимон `rgba(254,246,230,.6)`.
- Карточки: 24–32px, тёплая обводка, `--shadow-warm-card`. Контролы — капсулы.
- Шрифты и реальные редакционные изображения сохранены. Веспи сохраняет
  утверждённую идентичность и контекстные роли, без повторов на одном экране.
- Белые подписи мелких кнопок используют угольную заливку для контраста.
  Коралловый — сигнал, крупный знак, подчёркивание и градиент заголовка.

Публичные страницы сохраняют воздушный Hero с иллюстрацией. Кабинет остаётся
компактным рабочим пространством с одной следующей задачей; большой рекламный
Hero не вытесняет действие с телефона. Навигация: Обзор / План / Документы.

Не меняются маршруты, Stripe, авторизация, пользовательские данные, API,
статусы документов, факты, цены, сроки, геометрия карты и MOD. 209.
Не добавляются обещания приёма документов, поступления, визы и стипендии.

Проверка цветов: `node scripts/design-warm-palette-review.mjs --source-only`.
Полный визуальный и функциональный контроль сохраняется в CI.


## Plan and local workspace · 18 October 2026

Operate surfaces share the validated questionnaire draft in localStorage. The public wizard has one Vespi portrait and ten warm progress segments. The document workbench has a distinct split geometry and vector utility icons, with no repeated portrait. Examples are labelled demonstrations and never AI results.

The portal opens a local workspace when no authenticated session exists. Cloud access remains code + surname; guest progress grants no cloud or paid privileges and is not silently imported into an account. Completion rings count route tasks, not admission probability. Manual collection flags never create a review verdict. The only additional success colors approved in this brief are sage #1F7A68 and #E6F4F1.

The shared logo is an SVG citrus-petal i emblem with an 800-weight iItaly wordmark. Its warm gradient and hover respect reduced motion.
