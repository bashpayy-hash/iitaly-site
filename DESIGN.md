# iItaly — единая тёплая система

## Low Arc identity · 24 October 2026

The supplied green fold / red low arc replaces the previous citrus app mark.
Higgsfield informed the refinement; production uses flat vector geometry in
`src/components/brand/mark.json`, shared by the header, portal and link preview.
The open diagonal is transparent, not a white overlay. Brand green `#087C55`
belongs to the mark only; existing UI accent, semantic statuses and global
tokens remain unchanged. The wordmark is upright, monochrome, weight 700 in the
existing display family. Use the white monochrome variant on the dark footer.
No logo shadows, gradients or hover rotation. Normal mark 36px, compact 28px;
the favicon keeps a light backing for dark browser chrome. Export assets with
`node scripts/export-brand-assets.mjs`. The handmade Vespi system stays intact.

## Established product surfaces

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

Operate surfaces share the validated questionnaire draft in localStorage. The public wizard has ten warm progress segments and no decorative mascot. The document workbench has a distinct split geometry and vector utility icons. Examples are labelled demonstrations and never AI results.

The portal opens a local workspace when no authenticated session exists. Cloud access remains code + surname; guest progress grants no cloud or paid privileges and is not silently imported into an account. Completion rings count route tasks, not admission probability. Manual collection flags never create a review verdict. The only additional success colors approved in this brief are sage #1F7A68 and #E6F4F1.

The shared logo is an SVG citrus-petal i emblem with an 800-weight iItaly wordmark. Its warm gradient and hover respect reduced motion.

## Contextual Vespi · 19 October 2026

Preserve the restored warm product identity. Keep one introduction on the landing page; the hero, university filters, questionnaire, pricing and task cards do not repeat Vespi portraits. The floating chat launcher uses a message icon. Assistant artwork is explicitly selected by the calling surface, never added by default.

Higgsfield assets carry distinct roles: a contained avatar in guide search, a helper peeking from the right screen edge, a welcoming wave on portal arrival, and a document-coach pose where document preparation needs support. The old standing guide invitation is superseded. Avoid repeating the same figure across adjacent cards or adding a second promotional introduction in the portal. Home process explanations belong in the FAQ. Guides orient visitors through a horizontal timeline above the selected article; portal checkpoints reflect actual task completion, without invented points or streaks.

## Screenshot refinements · 20 October 2026

The portal overview opens with Vespi and the user's first name, then progress, then the current task and details. Guests without a saved name receive «Привет!». Other portal views retain compact route navigation. The guide-edge speech bubble is a real contextual-chat action. Pricing keeps the amount in its hero and checkout; the package card explains «Что включено» without repeating the large price. A few detached blush and ivory petals overlap the pricing banner; no cropped branches or stems. Preserve the existing warm palette, fonts, payment and account contracts.

## Assessment clarity · 20 October 2026

After the final questionnaire answer, a skippable 1.2-second visual hand-off leads to the plan. It represents a transition, not remote AI verification or admission probability. Reduced motion bypasses it; saved results do not replay it. Show the first action openly, with a short explanation for every following step and official detail on demand. Keep the existing deterministic rules, sources and explicit cloud-task completion. Task copy addresses the applicant directly; legacy owner labels never prepend delegation instructions.

The assistant uses the approved contained Vespi avatar in the chat header and the portal helper control. Floating help remains a message icon, and task cards do not repeat portraits.

## Handmade spatial Vespi · 24 October 2026

Vespi is a mostly smooth cotton toy with a red satin helmet, tiny embroidered eyes, a quiet smile and a few fine threads at real seams. Avoid chunky crochet, plastic eyes and repeated full-body stickers. The fixed Higgsfield reference set is documented in `design/mascot/vespi/handmade-v1.json`.

One meaningful scene accompanies each main portal surface: a waist-up welcome at the edge of progress, a folded map beside the plan, sheets and a folder beside documents. Wide document reports use the previously empty right margin; narrow reports prioritize the action and omit that decoration. Search and chat use a contained avatar. The home introduction and guide invitation use a sideways peeking pose; the floating chat launcher stays an icon.

Only the visible overview welcome can rest after 45 seconds without interaction. The rest pose has a slightly unraveling hem and loose thread. Pointer, keyboard, scrolling and tab visibility reset it. It is a decorative idle state, never an assessment of the student, a progress event or a document verdict. The checking pose appears only during an actual checking operation. Reduced motion removes pose crossfades. Illustrations are noninteractive and hidden from assistive technology; real controls retain focus, hit areas and text.


## Portal stage-focus refinement, 24 October 2026

The latest user request supersedes the earlier three-link sidebar and zero-button list rules. The six real backend stages (plus any conditional education stage) are the sole stage navigator. Overview and legacy `?view=plan` share `PortalFocus`; `?stage=` selects a read-only preview of any stage. Deep task, document, settings, assessment and university URLs remain valid.

Use one white canvas on #FAF8F5: compact name, intake and university pills; one upper-right original Vespi scene; the real progress pipeline; one focus task; remaining stage tasks in disclosures; quiet links to all documents and the existing rules. Keep real stored names, reports, deadlines and context. Never invent a university deadline. The old document review UI and all API contracts remain intact.

A manual task may offer a secondary completion circle. Document tasks must never be manually approved: `portalTaskDone` and the saved report remain authoritative. Confirmation SVG and original Web Audio chord occur only after a new saved completion, never on navigation, reload, an uncertain document, failed storage or undo. Retain reduced-motion support and a persistent sound preference. The route count and actual progress formula are unchanged.

The portal assistant entry uses `VespiOutline`. The original detailed Vespi appears inside the existing chat header and beside its latest assistant response. Desktop chat retains a separate column; mobile is full-screen with focus management. Do not replace the actual chat API with the standalone example's responses.

The downloadable single-file HTML is explicitly a local prototype with synthetic data and prepared chat responses. It is separate from production and must not claim real document checks, account synchronization or university decisions.


## Portal polish, 24 October 2026

The latest explicit brief supersedes the earlier portal scene placements. Exactly one Vespi portrait is visible, inside the assistant panel. Overview, document preparation and saved reports contain no mascot. The chat uses the approved handmade portrait with restrained CSS breathing; optional reviewed video sources can be attached to VespiVideoAvatar. No generated MP4 is claimed or requested at runtime.

The selected stage is one aligned task accordion. The current available task opens by default, instructions open the existing contextual assistant, and saved files retain direct report/upload links. Completion remains server-confirmed; document checks cannot be bypassed by a cosmetic checkbox. Existing task IDs, availability rules, progress, API and stored answers remain unchanged. Dated entries are displayed chronologically without changing underlying task records.

Statistics replace the removed overview portrait. The small indicator describes actual stage completion, not invented activity. Paper grain, muted atmospheric color and a faint architectural watermark are decorative and pointer-transparent. Reduced motion disables motion/particles; the existing sound setting remains available. A confirmed completion draws the green check, produces 15 restrained particles from its checkbox and then advances after 400 ms. No celebration is shown on failed saves or hydration.


## Portal modular correction, 25 October 2026

The latest layout supersedes the single white canvas and chat-only overview mascot. The greeting and chosen-university pills sit on #F7F5F0, followed by two separate white cards: route, then stage task list. The existing welcome Vespi rests over the route edge and retreats when chat opens. The route contains its title, real count, actual stages and progress only. No route hint, new explanatory banners, decorative watermark, confetti or footer resource links. Full document access remains an icon in the existing header.

An expanded task pairs its title/description/date-duration-location badges on the left with the sole “Открыть разбор” action on the right. Other tasks use 64px rows with checks, dates and disclosure controls. Manual checklist completion now uses the existing saved done flag for document preparation too. This explicitly changes the earlier review-only task count; it must never change the saved document review or claim university acceptance. Foundational form/selection tasks still collect actual answers. Completion feedback remains gated by successful persistence and respects the sound setting and reduced motion.

## Portal zhol editorial refinement, 25 October 2026

Adapt the supplied zhol deck's paper material, map connections and terracotta focus stripe to the existing two-card portal. The explicit brief requests a Cyrillic editorial serif even though the deck itself primarily uses sans-serif headlines. Spectral 600/700 covers the greeting, expanded task title and progress numerals; Inter covers the portal interface. Both are self-hosted through next/font in the portal layout. Public pages retain their typography. Taste is applied contextually to this working dashboard: design variance 4, motion intensity 3, visual density 5; no marketing-layout conversion.

Canvas #F6F3EC uses pointer-transparent fixed SVG fractal noise at opacity .035. Expanded tasks have #FAF8F3, a 1px #E2DDD3 border, a 4px #C84B31 left edge and 12px corners. The map connects real stages using 2px solid #1B5E55 for completed sections and 2px dashed #D5CFC4 for future sections; the selected point is terracotta with a restrained halo. Reduced motion removes its pulse. The rubric uses actual task position and count, not hardcoded demo values. The new outlined completion action shares the existing persisted checkbox action.

The exact requested secondary rubric (#8C857B, 11px) has approximately 3.4:1 contrast on #FAF8F3 and is a documented WCAG AA exception. Browser checks report this one explicit attribute/color/size combination rather than claiming an AA pass; all other contrast nodes and accessibility rules remain blocking. The readable title and accessible summary repeat its navigation context.

The shared logo is a real Next Link to / with a pointer cursor and the requested hover. It no longer intercepts navigation to open the portal overview. Internal return navigation uses the existing stage pipeline. Saved answers, selection and reports survive leaving and returning.

The original welcome Vespi remains above the route edge when chat is closed and retreats by 20px with zero opacity and no pointer events when chat opens. Only the chat portrait then remains visible. No new assets or generated video are introduced.

The full requested Web Audio synthesis is in playDopamineSound: sine notes 587.33/880/1174.66 Hz, 55ms stagger, .001 → .18 attack in 20ms, exponential decay to .0001 over 650ms and stop at 700ms. Reusing the gesture-unlocked AudioContext supports mobile autoplay restrictions and avoids accumulating contexts; nodes disconnect after playback. Sound/feedback still follow a confirmed save, respect the existing mute setting and never imply a document review verdict. Failed saves, restored state and foundational form tasks do not produce false completion.

## Official zhol kit integration, 25 October 2026

The supplied `STYLE_PROMPT.md` supersedes all preceding portal typography and color choices. Use self-hosted Inter Tight 400/500/600 including Cyrillic and extended Cyrillic; no serif or synthetic bold. Headings track at -.02em and large figures at -.03em. Paper #F7F4EA and dark #392A22 use the owner's actual textures plus pointer-transparent SVG grain. Ink #352B28, strong ink #2A211D, quiet #5C6056, tracker-off #6E685D, accent #B83A27, accent-text #A33421, card #FBF9F3, border #DCD3C3 and beige #EFE7D8 are scoped to the portal. Green #356450 denotes completion; amber #8A5A12 denotes caution. Public pages retain their existing typography.

The two-column workspace has route and stage on the left, and a dark Now/Vespi panel on the right. On narrower viewports Now precedes the route; only the stage chips scroll horizontally. The header uses a 2px rule and a 4px active underline. The current task is a 2px ink-bordered message card with a beige explanation, terracotta action and quiet completion text. A small tilted clipping uses the supplied map. These two cards alone have shadows; no gradients or emoji.

An unanswered local questionnaire previews all six route labels, with five disabled, locked placeholders. They never enter the progress data: the count remains the real 0/2. Existing full plans retain their own stages and ordered/ahead counts, including 4/26 plus 2 ahead. Stamps read saved completion and animate only on a newly confirmed save. The quote derives its question count from WIZ (currently 10), rather than promising four questions while displaying ten. The actual form, reports, stored answers, APIs, payment logic and progress formula are unchanged. Vespi retires when the assistant opens. Motion and sound preferences remain respected.

## University selection and notary correction, 25 October 2026

In the existing portal catalogue, put “Выбрать университет” directly below each university name. Preserve its checkbox semantics and show “Университет выбран” after selection. The single “Сохранить выбор” action remains visible at the viewport bottom, including before a choice; it is disabled for an empty or unchanged saved list. Reserve space after the catalogue and beside the desktop assistant so the action cannot cover content or the chat. Selection still saves through the existing explicit operation; checking a card never completes the task automatically.

Align the neighbouring cards' name, selection and detail rows with CSS subgrid, retain a one-column mobile layout, and use the portal's existing zhol tokens. Label the independent comparison section clearly. Preserve the map, filters, factual university data and comparison model.

The notary breakdown omits the generic documents illustration. Its original explanation and three preparation steps occupy one readable column; dates are quiet text, and detailed instruction indices align on a consistent grid. Other tasks keep their existing visual slots. No copy about legal requirements, progress logic or review outcomes changes.

## Remove stage souvenir, 26 October 2026

The latest explicit user correction removes the decorative “Сувенир за этап / Карта маршрута” clipping from every portal stage. Stage headers contain only the title and real completion stamps. Remove its reserved layout and hover styles; progress, task text, mascot and completion feedback remain unchanged.

## Progressive portal pages, 26 October 2026

The user's Apple reference authorizes a clearer hierarchy of separate URL-addressable views while preserving the existing zhol identity. The overview shows the real route and one current task. Each stage link opens that stage's full checklist, without a duplicate welcome or Now panel. Task pages separate the short overview, complete instructions and actual action. University selection separates the map/catalogue from the full comparison; document results separate the verdict, full analysis and a new check.

Use standard links, descriptive breadcrumbs, current-page state, browser Back/Forward, page titles and heading focus. Existing query URLs remain valid in the static export. Keep selected files, form answers and shortlist selections mounted while switching sections; reading content never saves or completes a step. The parent stage and overview remain one click away. Detail navigation uses a compact route, not the full overview header. Keep all existing rules, sources, original task copy, API boundaries, status semantics and saved progress.

## One problem at a time, 26 October 2026

The latest user correction removes the full route, including its compact variant, from every portal page except the overview. Stage, task, document, university and settings screens keep the site header and contextual return links. A task brief omits generic filler microsteps when there are no task-specific ones; maintained instructions and original task copy remain available.

Guides use a short index, three category pages and separate static pages for all thirteen existing topics. Visa D has separate timeline, funds calculator, document checklist and pre-submission pages. Topic pages show only their own content, sources, contextual action and a quiet return or adjacent-topic link. Old /guides#topic links resolve to the new page. Preserve all existing admissions copy, source dates, calculations, trainer geometry and questionnaire state. Search stays local and does not trigger the assistant. Warm public typography and surfaces remain; no persistent reading timeline or large decorative hero.

## Purchase visibility and small polish, 26 October 2026

Preserve refinement: variance 3, motion 2, density 4. Keep the approved public fonts, warm watercolor artwork, logo, copy and pricing. The prices hero has a visible black “Купить за 10 990 ₸” action before the quieter section links; the same label ends the package contents. Both open the existing product modal and preserve analytics and payment-mode behavior. Do not add a second large pricing header to the contents card.

Comparison cards align; narrow layouts give actions room and stack optional-service prices. Shared navigation identifies the current section with weight and its existing red rule. Invalid fields use the existing error token. Purchase feedback uses the existing icon system, transfer details wrap safely, and keyboard focus remains inside dialogs when request states replace the form.


## Minimal route and document action, 26 October 2026

Only the portal route and step execution surfaces change. Keep the current font, paper, terracotta tokens, task copy and ordered/ahead progress calculation. The overview route is unboxed: its title, a 40px two-digit current stage number, the existing counts, and one 2px rule. Only ordered completed tasks fill the rule. Desktop stage names use the header’s active underline; below 761px only the current stage name remains. Preserve native stage links and accessible progress metadata; adjacent-stage navigation remains available on stage pages.

Document actions use one readable column: the existing task title and tabs, one outcome sentence, two context fields in one row, the conditional citizenship checkbox, a content-width file button, and two quiet 13px notes. The preparation checklist belongs to the instruction view; context fields stay visible. Do not add illustrations or decorative containers. File selection, confirmation, retries, API requests, status semantics and persistence are unchanged in both local and cloud workspaces. Keep the mounted action when switching tabs. The Now panel retains its existing salmon day count and sole mascot.


## Quiet public paper and Higgsfield vignettes, 26 October 2026

Refinement of the main site only, based on the newly supplied zhol kit. Preserve public typography, colors, all text, existing artwork and interactions. Use the kit’s scanned cream paper in the home FAQ, guides directory introduction and plan tool area at 10–12% opacity, reducing to 8% on phones. The scan is an inert isolated background layer; do not texture inputs or add paper to the portal, payment forms, article bodies or Modulo 1.

Two real Higgsfield GPT Image 2.5 illustrations follow the supplied risograph reference: a folded Italy map in the home FAQ’s empty left margin, and a document folder in the guide index’s empty right field. Both use transparent backgrounds at 160px with fixed dimensions, lazy loading and no motion. Hide them when the existing copy leaves insufficient room (FAQ below 1280px, guides below 1100px); do not increase mobile page length to accommodate decoration. Keep the functional university map and every CTA untouched. Source job IDs, texture provenance and final asset hashes are in docs/public-paper-assets.json.


## Visible public paper and sequential instructions · 26 October 2026

The latest correction supersedes the barely visible local paper pass. Apply the supplied scanned cream texture to the public marketing canvas, guide reading pages and existing home sections at 38% opacity (28% on phones). Keep it behind content, inputs and dialogs, with no new gradients or overlay over the interface. The Modulo 1 workbench opts out; portal material and typography remain untouched. Existing art stays in place. Three additional real Higgsfield GPT Image 2.5 cutouts — calendar, envelope and key — occupy 160px desktop guide margins. Collapse decoration below 1280px, without consuming mobile reading space.

Remove the isolated Padova admissions-round row and its source from the general tests guide. Other university information, factual rules and copy are unchanged.

Portal instruction views show one existing point at a time at `part=guide&item=N`, with a real URL, previous/next links, an optional table of contents and a direct action tab. The brief contains only its purpose and next link, not a repeated checklist. Authored microsteps, maintained guide rows, warnings and file preparation remain reachable in sequence. Reading never updates task completion, status, ordered/ahead counts or stored answers. Keep upload forms mounted when reading so selected files survive navigation. Focus and document titles identify the current point; browser history, reloads and copied links restore it. No repeated roadmap, illustration or nested card on the task page.
