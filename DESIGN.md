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

## Gamified cabinet in zhol style · 25 October 2026

Built on the official zhol kit above. The owner's later requests (one rewarded step at a time, visible tactile texture) supersede it on these points:

- **Stamps are terracotta**, like an ink stamp: task marks, the stage stamp track and finished route stages. Green `#356450` stays for status text such as «Выполнено».
- **Exactly two gradients**, both asked for by the owner: a terracotta glow behind Vespi on the Now plate and a diagonal micro-gradient on the current step. A faint dot grid sits behind the greeting.
- **Paper grain is a background layer**, not a fixed overlay: inline SVG noise at 6% multiply on the cabinet and its sticky header, matte noise at 8% overlay on the Now plate, kraft noise at 7% on the current step. Blending a fixed full-screen layer repaints on every scroll frame on cheap Androids. The paper is a 640px tile cut from the kit's `bg_cream.jpg` (13 KB instead of 250 KB).
- **The Now plate hugs its content** and stays beside the list while scrolling on desktop. Stretched to the column height it left an empty hole between the text and Vespi.
- **Locked preview stages are the ones that will really open.** The local workspace previews its own phases (four locked after «Выбор программы»); a server plan previews the six stage names.
- **Each stage has its own souvenir** (risograph objects below). The kit's map illustration shows a logistics brand's trucks and ships, so the cabinet does not use it.

The cabinet turns the route into one small step at a time and rewards each saved step.

**One step in focus.** The dark «Сейчас» plate (kit `bg_dark.jpg` over `#392A22`, labels `#F29A89`, text `#FAF9F3`) names the stage («Этап 2 из 7 · Документы»), the next step, its orientir and Vespi's quote. On phones the order is greeting → plate → route progress → current stage tasks, so progress stays in the first viewport.

**Stamps and souvenirs.** A saved task becomes a terracotta stamp (`#B83A27`, double ring rotated −8°). Each stage shows its stamp track and, as a tilted clipping, the risograph souvenir it awards: map, diploma, folder with seal, envelope, coin jar, passport, keys (`src/components/portal/portalStageArt.ts`). The souvenir is grey and translucent until every step of the stage is saved. A saved step shows the reward card «Штамп получен» with the stamping Vespi; the last step of a stage shows «Этап пройден» with the jumping Vespi and the souvenir. Rewards come only from `usePortalFeedback.confirm` after a real save, never on login, reload, navigation, undo or an uncertain document. The route count, progress formula and document verdicts are unchanged.

**Vespi never repeats.** Situational poses live in `src/components/mascot/VespiPose.tsx`; each has exactly one owner: a costume per stage in the Now plate, stamp and celebrate in rewards, oops on a failed action outside the overview, thinking in the first-run questionnaire, first-plan for an empty route, encourage when the route is complete, reading on /guides (the home intro keeps the peek pose). The round chat avatar is the assistant's identity and the only image allowed in more than one entry point. `scripts/design-vespi-unique-review.mjs` enforces this. Provenance: `design/mascot/vespi/handmade-v2.json`.

**zhol inside the cabinet only.** Tokens live in `src/app/portal/portal-paper.module.css` and are mapped to `--portal-*` in `portal.module.css`. Brand green `#087C55` belongs to the logo only. Stage illustrations in task pages are single risograph objects on a beige plate. Public pages keep their own palette.

**One type and motion system.** The cabinet uses the kit's self-hosted Inter Tight for headings and text; no serif headline. Motion uses `--portal-fast` 160ms, `--portal-base` 240ms, `--portal-slow` 360ms with `cubic-bezier(.2,.8,.2,1)`, transform and opacity only, no spring overshoot; reduced motion removes it. On task and document pages the route collapses into a single-line tracker so the main action stays in the first viewport.
