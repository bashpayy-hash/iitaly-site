# iItaly — единая тёплая система

## Low Arc identity · 24 October 2026

The supplied green fold / red low arc replaces the previous citrus app mark.
Higgsfield informed the refinement; production uses flat vector geometry in
`src/components/brand/mark.json`, shared by the header, portal and link preview.
The open diagonal is transparent, not a white overlay. Brand green `#087C55`
belongs to the mark only; existing UI accent, semantic statuses and global
tokens remain unchanged. The wordmark is upright, monochrome, weight 700 in the
existing display family. The white monochrome variant exists for dark
surfaces (the dark public footer it was drawn for is gone since 4 November;
every public page now shares the paper footer).
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
- **No stage souvenir.** The owner removed it on review (25 October, evening): it left an empty block beside the stamps. The kit's map illustration is not used either; it shows a logistics brand's trucks and ships.
- **Stamps and checks stand upright.** A tilted check read as crooked; the stamp is the terracotta double ring, not a rotation. Step rings line up with the stage heading and, on phones, with the text of the current card.

The cabinet turns the route into one small step at a time and rewards each saved step.

**One step in focus.** The dark «Сейчас» plate (kit `bg_dark.jpg` over `#392A22`, labels `#F29A89`, text `#FAF9F3`) names the stage («Этап 2 из 7 · Документы»), the next step, its orientir and Vespi's quote. On phones the order is greeting → plate → route progress → current stage tasks, so progress stays in the first viewport.

**Stamps.** A saved task becomes a terracotta stamp (`#B83A27`, upright double ring). Each stage shows its stamp track. A saved step shows the reward card «Штамп получен» with the stamping Vespi; the last step of a stage shows «Этап пройден» with the jumping Vespi and «Все штампы этапа: N из N». Rewards come only from `usePortalFeedback.confirm` after a real save, never on login, reload, navigation, undo or an uncertain document. The route count, progress formula and document verdicts are unchanged.

**Vespi never repeats.** Situational poses live in `src/components/mascot/VespiPose.tsx`; each has exactly one owner: a costume per stage in the Now plate, stamp and celebrate in rewards, oops on a failed action outside the overview, thinking in the first-run questionnaire, first-plan for an empty route, encourage when the route is complete, reading on /guides (the home intro keeps the peek pose). The round chat avatar is the assistant's identity and the only image allowed in more than one entry point. `scripts/design-vespi-unique-review.mjs` enforces this. Provenance: `design/mascot/vespi/handmade-v2.json`.

**zhol inside the cabinet only.** Tokens live in `src/app/portal/portal-paper.module.css` and are mapped to `--portal-*` in `portal.module.css`. Brand green `#087C55` belongs to the logo only. Stage illustrations in task pages are single risograph objects on a beige plate. Public pages keep their own palette.

**One type and motion system.** The cabinet uses the kit's self-hosted Inter Tight for headings and text; no serif headline. Motion uses `--portal-fast` 160ms, `--portal-base` 240ms, `--portal-slow` 360ms with `cubic-bezier(.2,.8,.2,1)`, transform and opacity only, no spring overshoot; reduced motion removes it. On task and document pages the route collapses into a single-line tracker so the main action stays in the first viewport.

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

## Illustrated progressive disclosure · 26 October 2026

The latest explicit brief supersedes hidden desktop margin art, unillustrated reading points and full stage task lists. Use only committed images; no image generation. Public sections follow a 14px category, a 32–56px compact heading and a 600px highlight paragraph. Existing facts become textured 28px bento cards with 32px padding, 20px gutters, a subtle inner boundary and soft layered shadow. The user explicitly requests SVG paper grain at .08 over the supplied cream scan (.07 on phones). This is an intentional override of the generic skill's grain/eyebrow/card guidance; keep the site's type and existing factual data.

Home replaces the dense route preview with illustrated topic entries, including one Vespi card. Padova belongs to the shared university tab switcher with Bologna and LUISS; do not restore its isolated admissions-round block. Reuse the calendar, envelope, key, folder, map and approved mascot at readable sizes on mobile too.

Portal stage pages show one actual task at `stage=...&step=taskId`. Instructions retain `part=guide&item=N`, document report findings use `part=review&finding=N`, and public guide points use `point=N`. Pills, previous/next controls and reading-position labels expose the navigation. Only one point is mounted; a 400ms opacity/translate transition respects reduced motion. Reading and navigation never save completion. Upload/action forms remain mounted so files and context survive reading switches. Task titles, statuses, ordered/ahead counters, authored requirements, payment, API and authentication stay intact. Do not illustrate the upload form or repeat the entire roadmap inside reading pages.


### Latest correction — 26 October 2026
Restore the pre-bento public page hierarchy. Paper is a continuous body canvas, including public navigation and hero sections, not a lower-page patch. Retain reading pagination and only one active portal task; remove large decorative images from guide cards and reading screens. The public plan workspace is 1200px wide, with a two-column question/options composition and separate plan/check tools. Public comparison has a locally saved main-university choice, per-column actions and a plan handoff. This preference must not mark tasks complete, change admissions rules or modify cloud review data.

## Flight Plan, scene cards and selection inspectors · 27 October 2026

The latest explicit brief replaces the previous flat route and plain guide directory with four supplied reference mechanisms. Keep the full-page warm paper, existing type and terracotta brand. Use Butter-style self-contained 28–32px containers, heading/44px arrow, an interactive HTML/CSS scene and a quiet caption. Home has two useful topic previews; no new images or generation.

Use a shared Flight Plan instrument on the public questionnaire/result and portal overview, with a compact version on portal stage pages. A blue SVG plane follows the selected stop; the dashed rail and current badge distinguish actual completion from browsing. Dates come from actual tasks. Blur only inactive secondary previews; titles and controls remain legible, keyboard focus clears blur, reduced motion removes it. Never modify ordered/ahead counts, completion or cloud operations. Detail/action pages retain their focused layout without a roadmap.

Guides use a numbered topic index, one inline inspector and existing deep links. Search, category filtering, copied selection URLs and history remain functional. Unknown procedure-specific timing/cost/complexity is explicitly conditional rather than invented. University quick buttons share the map/catalogue comparison state (maximum three). Grid cards use aligned factual rows; table mode retains the existing full model. Only complete comparable living-cost ranges may receive a relative marker. Primary choice persists locally; /plan displays the chosen university context without asserting that it changes eligibility. Portal shortlist continues to use its existing save operation.

## Reference mechanics, second pass · 2 November 2026

The owner re-issued the four-reference brief (Butter, mikes.cv, Fiddle, sebneil) on top of the 27 October implementation. This pass sharpens the same components instead of adding parallel ones.

**Flight Plan (mikes.cv).** One shared instrument for the portal overview, the /plan result and the compact question/stage strips. The left margin carries a mono month («НОЯ 2026», from the next task's deadline) or the stop number; a 1.5px dashed rail starts with an SVG curve; a solid blue line marks real progress up to the current stage, while the blue plane only shows what is open for reading. The current stage has a «Текущий шаг» badge. The instrument line shows the destination: the locally chosen main university's city with its coordinates (`src/components/journey/flightCoordinates.ts`, WGS84 city centres), otherwise «Италия». Depth of field: future stages outside the middle of the screen (or of a scrolling rail) are blurred 2px at 45% opacity; reaching them, selecting, hovering or focusing makes them sharp. Reduced motion and forced colours show everything sharp. Completion, counts and saved progress are untouched.

**Comparison deck (Fiddle).** Three tall cards in their own tones (olive, terracotta, sky) with the city glyph as a poster; above each card a mono code such as «01 / UNIPD • PADOVA». Rows stay level through subgrid; cards fly in on `cubic-bezier(.22,1,.36,1)` with a 90ms stagger and lift slightly on hover. Adding the third university from the map or quick buttons scrolls the deck into view. «Сетка / Таблица» sits on the deck bar, mono, like Fiddle's LIST/GRID. Only complete living-cost ranges get the relative marker. «Выбрать этот университет ✓» saves the main choice locally; the decision then becomes a sticky dark plaque: «Отличный выбор! Маршрут поступления (Flight Plan) адаптирован под …» with «Перейти в Мой план». The /plan Flight Plan shows that university's city.

**Guides inspector (sebneil).** The numbered index carries a mono stage tag and a sliding terracotta marker. The inspector is a Butter card (40px padding, 32px radius) with the dark document scene, four badges and the deep link. Badges quote the guide's own copy (`GUIDE_FACTS` in `GuideDirectory.tsx`; update together with `src/data/guides.ts`); where a guide states no time, price or deadline, the badge says «по ситуации» / «по условиям заявки» in a dashed outline. «Сложность» counts the points of the detailed page.

**Butter cards.** Scene cards, the guides inspector, the portal route card and the /plan Flight Plan frame share 32px radius and 40px padding (22–24px on phones). The caption tone is rgba(20,20,19,.62): the brief's .5 measures 4.1:1 on this paper, below AA.

## Radical pass: closer to the references · 2 November 2026

The owner judged the second pass "not similar at all" and allowed radical changes. This section supersedes the 2 November details above where they differ.

**Cabinet overview = mikes.cv.** Top-left: a mono manifest with a dotted left rule (`FlightManifest`): passenger first name, «Казахстан → city», destination coordinates, and local times for Almaty and the destination (computed in the browser with `Intl`, dashes before hydration). Centre: a code-drawn porthole (`Porthole`, inline SVG: cream frame, sky over a cloud sea, slow cloud drift, a shade that lifts with real progress). Vespi leans on the porthole sill (the same `PortalRouteVespi`, one per page). Right: the «Сейчас» board in the same mono language (stage rubric, next step, days to the deadline, Vespi's line, ahead-of-time list); no dark plate. Under the porthole the centred greeting. Below: one centred Flight Plan column (`variant="timeline"`): month small over the year on the left margin, «FLIGHT PLAN» label at the start of the curve, the current task card (`data-portal-overview`) opened right under the current stage with «Открыть этап»; browsing another stage opens a light preview under it. Distant future stages blur progressively (1/2/3px) until scrolled into the middle band; a fixed fog with backdrop blur softens the bottom edge. Reduced motion: no drift, no shade lift, no blur.

The SVG porthole uses SVG gradients for sky and frame; CSS gradients stay out of the portal (the fog uses a mask, not a background).

**/plan result.** The same timeline: the reading card opens under the selected step (light, 2px ink border), «Далее» moves the plane down the column.

**Universities = Fiddle arc.** Three vivid poster cards (violet, red, teal) stand on a perspective arc; the focused one is straight and slightly closer. A mono index sits above each card, a vertical giant university code runs along the poster, and the focused code is set huge under the arc with a position scale. The pastel lilac-to-mint section background frames the arc. Rows stay level; the bleed never exceeds the section gutter.

**Guides = sebneil index.** A giant typographic list of topics (28–52px, mono numbers and stage tags); the chosen topic is dark with a terracotta dot, the rest dimmed to a tone that still holds 3:1 for large text. The inspector is a Butter card that slides in from the right and stays sticky; on phones it unfolds right under the chosen topic (CSS `order`, one DOM node). Above the index, two Butter cards (Виза D, Permesso) with dark scenes and tabs; all figures there are the same checked quotes as the inspector badges (`guideFacts.ts`).

## Calm questionnaire · 2 November 2026

The owner found the /plan question screen overloaded. The question Flight Plan is now a single line of ten equal points (`variant="dots"`): answered points filled blue, the plane on the open question, one mono caption «03 / 10 · Оценки» and the «Flight plan» callsign; the other question names stay for screen readers and as a hover title, with no labels, counters or scrollbar on screen. Answers are a quiet list of rows (title and its existing note) separated by hairlines; no repeated document icons or radio circles. An arrow appears on hover, the saved answer gets a terracotta check and a left rule. «~2 минуты · Персональный трек» is plain text, not a pill.

## Apple tiles, step pages and the stage lineup · 2 November 2026

The owner pointed at apple.com: a home of product tiles where every problem has its own picture, an iPhone lineup of models in one even row, and a quiet «Learn all about» row of cards. Information must not shrink; instead there are more pages, each telling one thing step by step. This section supersedes the sebneil guides index above.

**/guides = product tiles.** Every topic is a tile in a two-column grid (one column ≤760px), 28px radius, light `#F1ECE3` and dark `#2A2420` alternating. The title (30–44px) and teaser sit centred at the top, then two pills: «Подробнее» (filled terracotta, the topic page) and «Пошагово» (outlined, the topic's first step page). The topic's own risograph object stands at the bottom and lifts slightly on hover. An odd last tile spans both columns. Search, category pills and the topic count stay above the tiles; a selected category shows a link to its stage page, which uses the same tiles. Each topic has its own picture (`guideArt.ts`): eight reuse the approved riso set, five are new (tests, translation, minors, codice, military; provenance in `design/illustrations/riso-guides-2026-11-02.json`). No text, flags or people in the art.

**Topic page.** The header pairs the title and teaser with the topic's object; under it four fact badges (dashed where the guide states no figure). «Разбор по шагам» is a row of tall cards in alternating tones: «Шаг 0N», the point's title, a big pale numeral and a plus. Arrows appear when there are more than two cards; the row scrolls with snap. Every card is a link to its own page.

**Step pages** (`/guides/[topic]/[step]`, statically generated; visa keeps its existing part pages). One point per page: «Шаг 0N из 0M · topic» in mono, the point as the heading, the topic object, then the point's text split into numbered sentence cards. Below, dots for the topic's steps, and large previous/next cards (dark back, terracotta forward). The last step ends with the topic's action link. The text is the guide's own copy, unchanged; only the presentation is split.

**Cabinet: «Дальше по маршруту».** The overview timeline now runs only up to the current stage. The stages ahead are an iPhone-style lineup: a scrolling row of 220–250px cards (200px on phones, the next card peeking). Each card has the stage's riso object on a tinted square plate, step dots (done in green), a terracotta label (Этап 0N / Начат заранее / После анкеты), the title, the first step, a mono meta line (steps, done, timing) and two actions: «Открыть этап» (dark pill, the stage page) and «Первый шаг ›» (opens that step). Rows are aligned with CSS subgrid, so titles and buttons sit on one line even when a title wraps. Locked stages are greyed with no actions. The cards only navigate; a step is marked done on its own page.

## Questionnaire as tiles · 2 November 2026

The owner asked for the /plan questions in the same format as the /guides tiles. Each question is one tile (28px radius, `#F1ECE3` / `#2A2420` alternating by question): the question at 28–44px and its reason centred at the top, the answers as capsule buttons in two columns (one column ≤700px, an odd last capsule centred) with the answer and its note inside, and the question's own riso object at the bottom (`questionArt.ts`; alarm clock, graduation cap and books are new, provenance in `design/illustrations/riso-plan-2026-11-02.json`, the other seven reuse the approved set). Capsules are outlined in terracotta and fill on hover and when chosen (light tiles `#B83A27` with cream text, dark tiles `#F29A89` with dark text), with a small check on the saved answer. The dots line stays above the tile on the paper; the result and phone step keep the white card. On phones, if the next question's title went above the header, the page returns to the top of the tile. Questions, answers and their notes are unchanged.

**Scholarship question, honest framing (3 November 2026).** The owner read the scholarship answers as «strange, overly specific programs». Пьемонт · EDISU, IULM and Padova are not a recommendation or a full list: they are the only competitions with checked 2026/27 rules in the plan. The tile now offers three general answers first («Пока не знаю», «Уже знаю регион или вуз», «Не планирую стипендию»); the checked competitions appear only after «Уже знаю», with «Другой регион или вуз», the note that their rules are checked, and a way back (`plan/dsuChoice.ts`). The cabinet form lists the general answers first and the three under the caption «Конкурсы, правила которых мы уже сверили». Answer values are unchanged.

**Comparison deck.** Empty places stand straight (only real posters take the arc tilt) and carry no disabled «Выбрать» button.

## Motion identity · 3 November 2026

The owner asked for a smoother site, using the design-dna and motion-design skills. The site's DNA is recorded in `design/design-dna.json` (design-dna phase 2 on the live build; colours measured with its `measure-colors.mjs`, and `verify.mjs` confirms the pass changed none: ΔE 0). Motion now follows one system (motion-design, «Premium» personality, calm and without overshoot in the interface):

- **Curves.** `cubic-bezier(.22,1,.36,1)` for everything that moves or arrives; `cubic-bezier(.4,0,.2,1)` for colour, border and background changes. The overshoot curve stays only on celebratory stamps and saved checks.
- **Durations.** 160ms hover and colour (120ms press), 320ms cards, capsules, icons and dots, 520ms entrances and long travel (the plane, progress fills); the comparison arc swings in 560ms and its posters arrive in 620ms. No transition over 620ms; ambient loops excepted.
- **One entrance.** Rise 8–16px with a fade on the signature curve; staggers 30–40ms, never longer than 300ms in all. Guide tiles rise with the scroll (scroll-driven `view()` timeline, translate only, so text is never transparent), their object a little later as a secondary layer. Step pages arrive heading → object → sentence cards → dots and pager; questionnaire answers follow the question 30ms apart and the object last; the cabinet lineup cards line up 40ms apart.
- **Press feedback.** Pills and capsules scale to .97–.98 while pressed; step cards dip 1px; pager arrows nudge 3px toward their direction.
- **Removed.** The blur on the opened flight-plan step (costly, no meaning).
- **Reduced motion.** Every new animation sits under `prefers-reduced-motion: no-preference`; with reduce, pages are static and complete.

## Topic carousels · 3 November 2026

The owner pointed at two apple.com galleries (iPhone Duo page): «First of all, the news» — cards one after another with dots and a play button — and «iOS and Apple Intelligence» — a row of frames of different widths with the caption under each frame and arrows. They asked for the guide topics in a row like that, the illustrations played with the same way (an object large in the frame, cut by its edge), and everything compact. Recorded with design-dna (the references were measured with `measure-colors.mjs`; Apple's cool palette is not adopted, the warm paper stays) and motion-design. This section supersedes the two-column tiles above.

- **One row.** /guides and the section pages (/guides/stages/…) show the topics in a single horizontal row (`GuideCarousel.tsx`). The row bleeds to the window edges; the first card stands on the text column (scroll-snap to the start, padding measured from the column so a classic scrollbar does not shift it) and the next card peeks in. /guides went from about 5,300px to 1,760px tall at 1440px.
- **Frames and captions.** Each topic is a frame (28px radius, 420px tall, 300px on phones; light `#EDE6D9`, dark `#2A2420` alternating) with a caption under it: title (21px), the one-line teaser, «Подробнее» and «Пошагово». Frames alternate wide (600px, 80vw on phones) and narrow (360px, 64vw) in a wide–narrow–wide rhythm. The frame itself also opens the topic page (not a separate tab stop).
- **Objects play with the frame.** Three poses: *bleed* — large, anchored bottom-right, cut by the frame; *float* — centred; *rise* — wider than a narrow frame, coming up from below and cut on both sides. Never tilted. While the row scrolls, each object drifts 34px against its frame (scroll-driven `view(inline)`, translate only); hover lifts it 8px.
- **Gallery on /guides.** Under the row: a capsule of dots (the active one stretches into a pill) and a round play/pause button. When the gallery is on screen the topics go one after another, 5 seconds each; the active pill fills to show the time left. Pointer, wheel, touch, a dot or the keyboard stop it; it pauses while the mouse or focus is on the cards, when it scrolls away and in a background tab; after the last topic the button offers «Показать темы сначала». It does not start by itself with reduced motion or once the visitor searches or filters; play still works.
- **Rows on section pages.** The same frames with previous/next arrows on the right, disabled at the ends.
- **Motion.** The row rises 40px into place on page scroll; dots stretch in 320ms on the signature curve; the progress fill is linear (it is a timer). Reduced motion: no autoplay, instant scrolling, no drift.

## Flat bands, unframed objects, one column · 3 November 2026

The owner sent the Busy Bee Honey style reference (DESIGN.md, tokens, theme) and asked to fix all animations, make the design Apple-like, improve the carousels and adapt that reference's way of presenting information. Adopted principles, translated into the IITALY palette (no new colours: cocoa `#2A2420`, sand `#EAD7BB`, cream `#FAF6EE`, terracotta `#B83A27`); the reference's cornflower, sage, honey gold and display serif are not used. This section supersedes the frame-and-caption carousel above.

- **Flat.** No cast shadows on public surfaces: the shared `paper` surface keeps its warm hairline and grain but no drop shadow; the header keeps its frosted material and inner highlight only. Level is set by colour (paper → white → cocoa band), never by elevation.
- **Full-bleed bands.** The guide topics sit on a cocoa band that runs edge to edge (the colour is extended with a 100vmax shadow clipped to the band, so the page never scrolls sideways). The sand marquee strip that ran above the band was removed on 3 November (see «Cabinet as the apple.com home grid»).
- **Unframed objects.** Each topic's riso object stands on the band without a card, centred on a shared baseline (260px stage, 210px on phones). Under it: one statement (the title, 26px), one line (the teaser) and one action (a cream pill «Подробнее», inverted on the dark band); «Пошагово →» is a quiet text link.
- **Even rows.** Slides are equal width (340px, 76vw on phones). The row is a grid and every slide shares its rows through `subgrid`, so titles, teasers and actions line up across topics whatever their length.
- **One column.** Home sections, the guides index and the footer share the header's column: 1216px with 32px gutters (112px edges at 1440px). Topic pages keep their 880px reading column, but their step-card row now uses the same carousel and runs to the window edges with arrows on the right.
- **Even facts.** A topic's four facts are the same flat tile; an unknown value is only quieter text (no dashed outline).
- **Motion.** One system everywhere: `cubic-bezier(.22,1,.36,1)` for movement, `cubic-bezier(.4,0,.2,1)` for colour, 160/320/520ms. Removed: the per-object drift inside the row (it made identical objects look misaligned) and the scroll-scrubbed row rise. Shortened: the assessment's route line (1s → 520ms), its reveal (200–260ms ease-out → 320ms), the story frame (400ms → 320ms), the cabin shade (1.6s → 1.1s). Hover is colour or an 8px lift; carousel scrolling is native smooth scrolling.

## Evenness pass · 3 November 2026

The owner asked to remove every unevenness and inaccuracy. Measured first (left edges of text blocks, type sizes, radii, pill heights, text colours on every public page at 1440 and 390px), then fixed to one scale; the values are recorded in `.interface-design/system.md`.

- **Edges.** No more near-misses: home card text starts on one line (cards padded 36px; 20px on phones), prices cards share 32px padding (24px on phones), and phones use a 20px gutter everywhere (the questionnaire had 16, the map band and Vespi card 24 and 18). Remaining differences are centred text only.
- **Radii.** One scale: 999 pills, 28 cards, 16 inner elements and fields. Replaced 20/22/24/26/32/980px (scene cards and windows, answer capsules, prices stats strip, search field, step-page tiles, flight-plan badge).
- **Type floor.** No text under 11px (mono caps) / 12px (everything else) outside the Modulo 1 form replica: flight-plan labels, scene windows, facts, counts, the rules page labels.
- **Peer headings.** The Vespi card title matches the scene cards (`clamp(28px,3vw,40px)`), the route card title is semibold like its peers.
- **Greys.** Guides use four text levels (`#141413`, `#241F1C`, `#3F3933`, `#57514B`) instead of seven near-identical greys; the greenish `#5C6056` is gone.

## Less data, whole cards, straight lines · 3 November 2026

Owner on the live site: «слишком много данных, иконки слишком большие, сверху линии совсем бесполезные, линия с самолётиком очень кривая, здесь всё обрезается на пол пути — всё должно перераспределяться по всей длине в зависимости от масштаба».

- **Home scenes.** Both dark windows are the same: title, one line and capsule switches at the bottom. Removed the window bar («FLIGHT PLAN / ОБЗОР», «СПРАВОЧНИК / ПОСЛЕ ПРИЕЗДА»), the underlined numbered tabs, the «ЭТАП 01» / «ТВОЙ СЛЕДУЮЩИЙ ВОПРОС» labels, the arrow and the dashed Kazakhstan–Italy line with the plane.
- **Whole cards across the length.** Carousels show only whole cards and share the available length between them: the guide band spans the window (32px gutter, 20px on phones) with 1 / 2 / 3 / 4 / 5 / 6 cards from 0 / 600 / 900 / 1200 / 1600 / 2000px; topic step rows and the cabinet lineup fill their column by container width (1 to 4–5 cards). The rest is one page away (arrows, dots, swipe); nothing is cut at an edge.
- **Smaller objects.** Guide band objects stand on a 180px stage (170px on phones) at most 78% of the card width; cabinet lineup art sits in a 4:3 tile.
- **Straight timeline.** The cabinet timeline is one straight dashed line with the plane on it; the curve from a «Flight plan / Казахстан» caption is gone. Its month labels are 11px (were 8.5px).

## Cabinet as the apple.com home grid · 3 November 2026

Owner, with the Apple style reference (DESIGN.md, tokens, theme) and three screenshots: «на первом скрине убери эти символы наверху, на втором сделай иконки пореалистичнее, сделай в личном кабинете разграничения как на сайте эпл, почти один в один, в целом активно полагайся на эпл референс». Apple's structure is adopted one to one; its colours are not (warm paper, cocoa and terracotta stay; Apple's blues would fail the warm-palette review).

- **Nothing above the guide band.** The sand marquee strip with topic titles and the mono «13 тем · у каждой свой пошаговый разбор» caption are gone. The count is announced only while searching («Найдено тем: N», plain 14px text); the «Раздел целиком» link appears only with a section filter.
- **Tiles, not a composition.** The cabinet overview is a stack of 28px tiles with 12px gaps on the full 1296px width (Apple: 12px gutters, white/black tiles on #f5f5f7). Light tile `#FFFDF9`, dark tile `#2A2420` (the guide band), no shadows, no hairlines. The former mikes.cv composition (manifest top-left, porthole centre, «Now» board right, fog at the bottom) is retired.
- **Hero «Now».** Greeting as the small label (21px), the next step as the headline (`clamp(32px,3.4vw,48px)`), one line (Vespi's explainer, 17px) with its cite, the deadline («98 дней до ориентира · 31 янв 2027», mono caps), two pills («Открыть разбор» filled terracotta, «Открыть этап» outlined) and the porthole with Vespi below — the tile's «product render», like Apple's iPhone tile.
- **Dark route board.** The flight manifest and «Уже сделано заранее» head the board; the Flight Plan runs in a 760px column in cream on cocoa (`--flight-ink #FAF6EE`, `--flight-quiet #CFC6BA`, line `#6E6054`, plane in the whitelisted light blue `#A8C9F7`), the stage number in light terracotta `#F29A89`; the current task card stays a light card on the dark board.
- **Grid 2×N.** Every stage ahead, then Documents, Universities and Reminders, is a tile: label (mono caps), title (`clamp(28px,3vw,36px)`), one line (17px), a short mono meta («0 / 4 шагов · ориентир апр 2027»), two 44px pills and the object standing at the bottom (250px stage, at most 72% of the tile). Two columns from 700px of container width in a checkerboard (light, dark / dark, light); an odd last tile spans both columns; one column below 700px, alternating. Every line is limited to its tile (`max-width:100%`, `overflow-wrap:anywhere`): the live overlap of «Стипендия и льготы (DSU)» and «7 шагов · ориентир апр 2027» onto neighbouring cards came from centred grid items that were never constrained. No horizontal scrolling, no arrows: all tiles are visible.
- **Realistic objects.** The stage objects are studio product renders (Higgsfield gpt_image_2_5, transparent background, `design/illustrations/objects-2026-11-03.json`): kraft folder, envelope with a wax seal, jar of coins, plain burgundy passport, brass keys, compass on a contour map, diploma scroll, rubber stamp with an ink pad, twin-bell alarm clock. No text, numerals, emblems, flags or people; exported as WebP 240/480 (340 KB for all nine). The riso drawings stay for the portal artwork and step posters.
- **Reviews.** `design-portal-focus-review` now asserts the tile stack (hero → board 12px below → grid), two tiles per row from 1024px, one column on phones, alternating tones, 28px radii, nothing spilling past a tile and the three cabinet tiles; `design-portal-progress-review` asserts that the «Now» tile fits the first desktop viewport; `design-portal-route-action-review` expects the stage number in `#F29A89` on the dark board.

## No aviation theme; Italian landscapes · 3 November 2026

Owner, on the live home and cabinet: «убери эту странную тему с посадочным и прогресс-линиями в виде самолётов, местами добавляй итальянские пейзажи, сделанные в Higgsfield, на фон; суть информации в окнах не сильно понятна — впиши её красивее с фото пейзажа на фоне».

- **No aircraft, no boarding pass.** The route component (`journey/FlightPlan.tsx`, kept under its file name) lost the plane, the «Flight plan» callsign with coordinates, the take-off curve and the «Казахстан → Италия» line: it is now a dashed line with numbered dots whose solid terracotta part is real progress; the current dot has a terracotta ring; the questionnaire dots keep one caption («03 / 10 · Оценки»). The porthole and the flight manifest left the cabinet (`Porthole.tsx`, `FlightManifest.tsx`, `flight-cabin.module.css` deleted); stage pages and the assessment timeline use the same plain route. The whitelisted aircraft blues are no longer used anywhere.
- **Landscapes.** Eight photoreal Italian landscapes (Higgsfield gpt_image_2_5, 3:2; `design/illustrations/landscapes-2026-11-03.json`): no people, text, signs, flags or logos. Only the Tuscan one ships (WebP 640/1024/1600, the last from a 2k upscale), for the cabinet hero; the five other Vespi scenes are archived as JPEG masters in `design/illustrations/source/landscapes/` for the cabinet or other non-navigation places.
- **Cabinet hero on a landscape.** The «Now» tile keeps its cream text zone (greeting, step, line, deadline, pills) and fades into the Tuscan road below through a cream-to-transparent scrim on a pseudo-element; a 290px bottom padding (250 / 220 on smaller screens) keeps real landscape under the pills. The Vespi cut-out that first peeked over the landscape was removed on the owner's word («смотрится топорно»); instead, on the owner's next word («Веспи можно для смеха вписать непосредственно в пейзажи»), the scenes were regenerated with the mascot's reference images so Vespi is part of the photograph — riding a cream scooter along the Tuscan road in the hero (the tile is 700px tall so the scooter clears the pills; a phone tile has no room under its text, so it shows the right side of the scene, road and cypresses, instead). The generator left a cluster of tiny figures at the right edge of that scene, so the right 10.5% is cropped from every rendition. The DOM carries no mascot element on the overview; Vespi lives in the chat.
- **Home scenes as flat object tiles.** Each of the two scenes («Один шаг. Понятный маршрут.», «После визы путь продолжается.») shows its three themes at once as 4:5 tiles (20px radius, no borders, shadows or photos), light and dark by turns like the cabinet tiles (the second scene starts dark): label (mono caps, terracotta `#A33421` / `#F29A89` on dark), title (21px 600) and one line at the top; the theme's object alone at the bottom centre, ≤68% wide — map, folder, keys for the stages; postal kit, tax card, first-aid pouch for permesso, codice fiscale and insurance (`objects-2026-11-03.json`). The strings are the ones the dark window used to switch between (stage title/description; topic title/teaser). The owner's rules from this round, in order: landscapes never replace a theme's object («не заменяй иконки фотками пейзажей»); then — cards that send you somewhere carry only a picture of their content, and Vespi-in-a-landscape scenes belong in the cabinet or other places, never on these navigation tiles («просто картинки пермессо … по содержанию; Веспи … в личный кабинет … но не на иконки, которые должны перераспределять»). Tiles link to the stage or guide page; the scenes stack one under the other so each tile is ~400px wide; on phones one column with the copy left and the object right (≥200px tall). No switches, nothing hidden.
- **Reviews (3 Nov).** `design-flight-explorers-review` asserted no aircraft on the questionnaire dots and that the selected dot follows each answer (the dots left on 4 Nov, see below), six theme tiles with their objects, no landscape images and no buttons on them, loaded images and the codice link; `design-portal-focus-review` asserts no porthole/manifest/aircraft and no mascot on the hero, the landscape filling the hero with room under the pills; `design-portal-progress-review`, `design-vespi-unique-review` and `design-vespi-handmade-review` expect no mascot figure on the overview; `design-portal-progress-review` and `design-portal-route-action-review` check the solid fill instead of the plane.

## One object style, Vespi scenes in the cabinet, Apple blocks · 4 November 2026

Owner, on the live site: «вот эта часть всё ещё страшная» (the stage board), «страницы вроде таких пустых всё ещё страшны — туда можно добавить тематические генерации в Higgsfield, где Веспи что-то делает, и информацию преподносить блоками и более наглядно» (settings), «прогресс-бар вообще убери» (/plan), «хочу, чтобы это всё передвигалось при наведении мышкой, а то выглядит довольно статично; по иконкам более-менее, но добавь элементы иллюстрированности, но всё ещё с упором на реализм, чтобы с остальным сайтом сочеталось» (/guides), «сделай общий стиль везде, остались подобного рода страницы, которые выглядят странно» (Modulo 1), «в подобных ответвлениях тоже подавай информацию в блоках как на сайте Apple» (topic pages, apple.com/iphone-duo), «на фон добавь один из пейзажей Италии с Веспи, где он воодушевлённо смотрит вдаль, на смотровой площадке с видом на город» (home FAQ), «добавь из угла выглядывающего Веспи, который выглядывает в карту, и карту можно сделать побольше» (/universities); plus «добавь этот плагин (ui-ux-pro-max), ещё добавь скил impeccable, потом используй весь свой арсенал для аудита правок».

- **One object set.** Eighteen objects (Higgsfield gpt_image_2_5, 4:3, transparent; `design/illustrations/objects-2026-11-04.json`) in one manner — photoreal materials with gentle illustrative touches: softly simplified forms, hand-painted highlights, a faint warm ink line along the silhouette. They replace the 3 November studio renders of the same names and the risograph set everywhere: the guide band and topic pages (`guideArt.ts`), the cabinet tiles, stage art and the documents page (`PortalStageLineup`, `higgsfieldVisuals.ts`, `PortalArtwork`), the home theme tiles and the questionnaire of /plan (`questionArt.ts`, with the new cap and books). `public/illustrations/riso` is gone; its provenance stays in `riso-*.json`.
- **Vespi scenes in the cabinet** (`design/illustrations/scenes-2026-11-04.json`, 3:2, mascot references): one per stage — choosing brochures, unrolling a diploma, stamping, sealing an envelope, dropping a coin into the jar, waiting with a passport in a stone hall, at an apartment door with keys and a suitcase — and one for settings, writing a list beside an alarm clock. Vespi stands in the left half so the right half can carry text where needed. Scenes never sit on navigation tiles (3 November rule).
- **Stage board as blocks.** The dark route tile becomes two columns from 1100px: the route (status row, timeline with the open step) on the left; on the right the stage's scene (20px radius) over three stat blocks — large value, mono caption — «шагов этого этапа», «шагов всего маршрута», «ориентир · через N дней» (`PortalRoad` `boardAside`, `PortalFocus`). Below 1100px the scene and the stats come first; on phones the stats are rows with the caption on the right.
- **Settings as tiles.** A header (mono label, 48px title, one line) beside the notebook scene; then 28px tiles on the cabinet grid: the profile data (two rows tall, `dl` with hairlines, a filled pill), reminders on a dark tile whose `details` summary is the tile title, the task list with a terracotta figure, access with an outlined pill, deletion as a quiet disclosure. All ids, texts and actions are the old ones (`ProfileSection`, `portal-settings.module.css`).
- **No progress bar on the questionnaire.** The dots strip over the /plan tile is gone (`FlightPlan` lost its `dots` variant); the tile carries a mono step label («Вопрос 3 из 10 · Оценки») and the hidden `progressbar` stays for screen readers.
- **The guide band drifts.** Under a mouse the row moves up to 28px towards the cursor and every object leans after it (translate ≤10px, rotateY ≤8°, rotateX ≤6°, lift ≤12px by proximity; titles follow by 3px). `GuideCarousel` sets `--drift`, `--lean-x`, `--lean-y`, `--near` per frame; touch, keyboard (focus lifts the object) and reduced motion see the plain row.
- **Home FAQ on the belvedere.** «Можно ли нам доверять» sits on a 28px tile covered by the Florence viewpoint scene (Vespi on the wall, paw shading its eyes, Ponte Vecchio and the Duomo behind; 640/1024/1600 from a 2k upscale) with the questions on a translucent cream panel on the right; on phones the photo (4:3) stands above the panel.
- **Universities map.** The map column takes 1.3fr from 1024px, the frame has no border or shadow and 28px corners, and a peeking Vespi (head, helmet, two paws over the bottom edge, looking up at Sicily) sits in the Ionian corner — decorative, no pointer events, never over a city. `ItalyMap.tsx`, its geometry and filters are untouched.
- **Topic pages as Apple blocks.** The facts under a topic header are stat tiles — the value first (18–22px, 600), the mono caption under it; with a lead paragraph they stand as a column beside it on a 28px tile, without one as a row of four. The header object grew to 260px.
- **One shell for the odd pages.** `/terms`, `/privacy`, `/changes-2026-27` and the 404 page moved from the legacy `Header`/`Footer` onto `MarketingLayout`; their uppercase display titles became sentence-case 36–48px, sections 22px/600, body 16px/1.6. Modulo 1 keeps its tool layout but its headings (`.intro h1`, inspector, review, helpers, transfer, light sheet) use the site's display face and the helpers' accent is terracotta.
- **Skills.** `impeccable` joins the SessionStart hook (installed from its GitHub repository, since its bundle host is unreachable from the cloud proxy); `ui-ux-pro-max` was already there.
- **Reviews.** `design-flight-explorers-review` asserts no flight plan over the questionnaire, that each answer advances the hidden progress value and the tile's step label, six theme tiles with objects and no landscapes; `design-workspace-review` expects no progress bar and a ten-step `progressbar`; the board aside, settings tiles, FAQ tile and map peek are covered by screenshots in the review artifacts.

## Cyrillic mono, text arrows, a calmer narrow board · 4 November 2026

Owner, from an iPad split view of the live cabinet: «вот здесь конкретно странновато по дизайну, кривые тексты много где, и в целом на первом скрине всё друг на друга наслаивается и некрасиво».

- **JetBrains Mono instead of Space Mono.** Space Mono carries no Cyrillic, so every mono caps label («ЭТАП 1 ИЗ 1», «0 / 2 ШАГОВ», «ВЕСПИ БАУРЫСАКОВ · ИИ-ПОМОЩНИК») was set on iOS in a system monospace with Latin digits and dots from Space Mono — two faces in one word. The mono token (`--font-mono`, `--font-jetbrains-mono` in `layout.tsx`, every `var(--font-space-mono)` in the modules) now points at JetBrains Mono with the `cyrillic` and `cyrillic-ext` subsets; sizes, tracking and caps stay as they were. `design-vespi-system-review` checks the mono token by name and keeps comparing the other type tokens with the base.
- **Arrows as text.** `↗` has an emoji form, and iOS draws the bare character as a blue square. Every `↗` in the components («Личный кабинет ↗», «Подключить облачный кабинет ↗», «Составить план бесплатно ↗», source links) carries the text-presentation selector U+FE0E; the review names follow.
- **Board without repeats.** With the stat blocks beside the route, the summary row no longer prints the route figure (`[data-road-count]` stays in the DOM for the reviews; the «Шаг сохранён» note is inline); below 1100px, where the scene and stats stand above the route, the big stage marker is hidden too — the current stop names the stage right under the figures. The opened step is a full-width card from 760px down (`FlightPlan` `.detail` has no left margin there); the «ahead» list aligns left on the stacked board.
- **Hero frame on 480–640px.** The right-aligned Tuscan frame still showed the scooter's front wheel at the left edge; the image is scaled 1.45× from its right edge in that range (1.1× below 480px) so Vespi is out of frame on phones and in full from 641px up.

## No second typeface · 4 November 2026

Owner, on the live cabinet board: «Убери вот этот второй шрифт».

- **One face.** The monospace face is gone: `layout.tsx` loads Onest and Inter Tight only, `--font-mono` in `globals.css` resolves to the Onest stack (the token stays so `font-mono` utilities keep working), and every `var(--font-jetbrains-mono), monospace` in the modules became `var(--font-sans)`. Technical labels, counters, stage indices, poster codes and eyebrows keep their sizes, caps and tracking (11px, .06–.08em), now in Onest. The Modulo 1 form replica keeps Courier New in its cells, because it reproduces the paper form.
- **Reviews.** `design-vespi-system-review` asserts the mono token points at Onest and that `layout.tsx` loads no `*Mono(` face; the `globals.css` comparisons in `design-guard` and `design-portal-progress-review` keep ignoring the mono token line.

## A roomier cabinet: the step leaves the board · 4 November 2026

Owner: «в личном кабинете идёт перебор информации на маленькое пространство — не бойся его расширять, не бойся делать дополнительные ссылки; главное, чтобы всё было наглядно, понятно, продемонстрировано».

- **The current step has its own tile.** The open step no longer hangs under its stop inside the dark route board. The overview now reads hero («Сейчас») → dark board → light step tile → lineup. The tile (`PortalRoad` `afterBoard`, `PortalFocus` `stepTile`, `[data-step-tile]`) carries a caps label («Текущий шаг · этап 2 из 6 · Документы»), the flat step card (check, 34px index, 22px title, explainer, dates) with its actions on the right, and the «Открыть этап» link. All the step's ids and controls (`[data-portal-overview]`, `[data-task-check]`, `[data-road-open]`, `[data-task-ready]`) are the same elements in a new place.
- **The board is the route only.** Scene and stat blocks beside the stage list; the current stage opens a preview under its stop only when chosen (`previewId`), labelled «Сейчас». Padding grew to 44/40/48px, stops to 20px.
- **Reviews.** `design-portal-focus-review` asserts the tile right after the board (≤13px), the step inside the tile, no check control and no preview inside the board, and the phone action spanning the flat card; `design-portal-progress-review` lets keyboard focus pass through the step tile between the last stop and the lineup.

## Living landscapes · 4 November 2026

Owner: «ты можешь начать добавлять какие-то анимации… с этими пейзажами заигрывать, с Веспи — мне кажется, это добавило бы визитную карточку всему сайту».

- **Two scenes move.** The Tuscan road under the cabinet hero and the Florence belvedere behind the home FAQ carry a short video loop of the same still (Higgsfield image-to-video from the shipped 2k frames, `design/illustrations/motion-2026-11-04.json`): Vespi stays put, the cape and collar stir, grass and cypress tops sway, a few swallows and thin clouds cross the city. Locked-off camera, forward + reverse concatenated into a seamless 10 s ping-pong, no audio; H.264 and VP9 at 1280 and 640 px (`public/illustrations/motion/`, 5.2 MB for all eight).
- **The still stays in charge.** `LivingLandscape` (`src/components/motion/`) lays the `<video>` over the `<img>` with the image's own layout class, loads it only when the tile is in view (`preload="none"`, IntersectionObserver with a 120px margin, the 640 file at phone width, H.264 where `canPlayType` allows it, else VP9), fades it in on the first played frame (900ms), pauses it off-screen and never starts under `prefers-reduced-motion` or Save-Data. Screenshots and reviews keep seeing the image; the video is `aria-hidden`.
- **Parallax without JavaScript.** The hero landscape and the FAQ scene drift ±5% against the scroll (`animation-timeline: view()`, frame scaled 1.12 so no edge shows), from 641px / 1024px up and only without reduced motion; browsers without scroll-driven animations see the still frame. The tiles clip with `overflow: clip`, not `hidden`, because a hidden overflow makes the tile its own scroll container and the parallax would measure against it instead of the window.
- **Vespi peeks for real.** On /universities the mascot rises from behind the map's bottom edge as the frame enters the viewport (`map-peek-rise`, entry 10–70%, translateY 72% → 0 with a 3° tilt), by the same scroll-driven rule; reduced motion keeps him where he was.
- **Reviews.** `design-portal-focus-review` accepts `overflow: clip` on the hero tile; the landscape assertions keep measuring the `<img>`.

## Polish pass: one style on every branch · 4 November 2026

Owner: «полишни это всё… пройдись по всем ответвлениям, и если есть несовпадения по стилю — унифицируй». Every secondary route was screenshotted at 1440 and 390 (topic, step, stage and checklist pages, Modulo 1, /prices, /plan, /terms, /privacy, /changes-2026-27, 404, /payment/success, the cabinet's documents, settings, stage, task and login views) and compared with the home page and the cabinet overview. Most of the site already read as one system; the drift was in four places.

- **One footer.** `/universities` was the only public page still rendering the legacy dark footer (`Footer.tsx`, white wordmark, four links, no tagline); every other page had the paper footer from `MarketingLayout`. The footer is now its own component, `src/components/marketing/MarketingFooter.tsx`, used by `MarketingLayout` and by `/universities`; the legacy `Footer.tsx` and the equally unused legacy `Header.tsx` are deleted. `/universities` still stays outside `MarketingLayout` (its reviews assert that).
- **The payment card is a tile.** `/payment/success` had a white 16px card with a hairline; it now uses the tile language of the rest of the site: `#FFFDF9`, 28px radius (24px on phones), warm hairline, 40px padding; the dark code block inside uses the 16px inner radius.
- **The stage card in the cabinet is a tile too.** The stage page's card (`.stageBody`, stamps + step pills + heading) was the one 16px card left in the cabinet beside 28px tiles; it is 28px (24px on phones) with tile padding.
- **One Inter Tight.** The cabinet shipped its own 12 Inter Tight WOFF2 subsets (`src/app/portal/zhol-fonts.css`, `public/zhol/fonts`, 260 KB) while `layout.tsx` already self-hosts the same family through `next/font` for the whole site. The cabinet tokens now read `var(--font-inter-tight)`; the duplicate files and stylesheet are gone. No external font request appears, as before.
- **Dead rule.** `.onboardingError` (a terracotta side border) had no usage; removed.
- **Kept on purpose.** The brand gradient on hero titles, the stamp overshoot easing in the cabinet, the underline tabs (`/plan`, cabinet sections, header navigation) and the terracotta outline answers of the questionnaire are committed decisions, not drift; the detector's remarks on them are expected.
- **Reviews.** `design-portal-focus-review` and `design-vespi-system-review` match the cabinet face as `/Inter[ _]Tight/` (this Next keeps the family name; older versions hashed it), check that the face is loaded (first family only: next/font's size-adjusted fallback is a `local()` face) and that no `@font-face` points at `/zhol/fonts` any more. `design-university-review` counts the home link in the header only and asserts the shared paper footer on `/universities`.

## Plan steps as tiles, guide steps without numerals · 4 November 2026

Owner, two phone screenshots of the live site: «список… должен быть более дофаминовый, более понятный пользователю, он выглядит просто как Word-файл» (the plan route) and «что за 01, 02 — тупо так обозначать; интуитивнее, в виде блоков Apple, как мы прогоняли» (the guide step cards and step pages).

- **The plan route is a grid of step tiles.** `/plan` results (and the same component inside the cabinet's questionnaire) no longer render the timeline list of `FlightPlan`; `src/components/plan/PlanStepTiles.tsx` lays the steps out as the cabinet lineup does: two columns from a 700px container (one below), 12px gaps, light `#FFFDF9` and dark `#2A2420` tiles in a checkerboard, 28px radius, no shadows. Each tile carries a caps label naming the step's theme (Образование, Подтверждение документов, Программа, Требования вуза, Сроки, Стипендия, Статус в Италии, Консульство, Виза D, Финансы, Бюджет, До 18 лет, Призыв, Зачисление), the step title, its one-line summary, an «Открыть шаг» pill and the matching object from the shared set at the bottom. The whole tile is the link to `?step=n`. The mapping from title to theme and object lives in `planStepArt.ts`; the plan data in `src/lib/planBuilder.ts` is untouched.
- **The opened step stays in its cell.** It turns paper-light with a 2px terracotta ring, hides its summary line and pill, and unfolds the step inside: «Шаг n из N», the explanation, the concrete action, the «Условия и официальные источники» disclosure and «Назад / Далее» pills; the object moves to the bottom. The grid never reflows, so the checkerboard keeps its rhythm; an odd last tile spans both columns. On a change of step only the tile scrolls into view (`block: nearest`), never the page on first render.
- **Guide step cards without «Шаг 01» and the big numeral.** The cards of «Разбор по шагам» show a row of pips (the card's own pip is a terracotta pill), the step title (22px) and the first sentence of the step as a teaser, with the plus in the corner; light and dark alternate as before. The accessible name still says «Шаг n из N: title».
- **Step pages name things, not numbers.** The eyebrow above the heading is the topic title; the breadcrumb's last crumb is the step title; the pager cards say «Назад» / «Дальше» (or «К теме» / «Готово») over the neighbouring step's title; the dots row keeps the position. `guideSentences` moved to `guideText.ts` with the new `guideTeaser`.
- **Reviews.** `admissions-browser-review` asserts one 28px tile with its object per step, exactly one open tile and two tiles per row at 1440px; `design-flight-explorers-review` asserts pips on every card and no zero-padded step labels on the topic and step pages. The existing contracts stay: `[data-flight-stop]` per step, one `[data-instruction-point]`, `[data-instruction-next]`, `?step=` history, three visible paragraphs in the open step.

## One block per screen in the cabinet, a welcome scene on the home page · 4 November 2026

Owner, two more notes on the live site. On the stage page of the cabinet: «информации слишком много… перед глазами должен быть максимум один блок и один поинт; не так, что сначала карта, а снизу другое — one point at a time». On the home page: «добавь на первую страницу пейзаж, где Веспи что-то делает; welcome page на фоне Веспи в пейзаже Италии, welcoming, просто, с тонкой анимацией, которая говорит, что сайт делали понимающие люди».

- **The stage page is one tile.** `/portal?stage=…` renders the breadcrumbs and a single 28px tile: a caps eyebrow «Документы · шаг 2 из 5» (the `h1` is the stage title), a row of pips, the current step with its explanation, dates, «Открыть разбор» and «Отметить готовым», then «Назад / Далее» and the quiet links to the neighbouring stages. Gone from that page: the route strip with every stage and its counts, the «Шаги этапа» heading, «Штампы: 1 / 5» and the row of «01–05» circles. The pips replace all three: each is the link to its step (`[data-story-pill]`, `href` with `step=`), the current one is a terracotta pill, saved steps are green (`[data-stamp][data-stamped]`, the stamp pop keeps its overshoot), and a visually hidden «Готово: 1 / 5» (`[data-stamp-count]`) stays for screen readers. The overview keeps its route board; the route lives there only.
- **A welcome scene opens the home page.** The first screen is the Bologna arcade with Vespi walking through it with a tiny backpack (Higgsfield scene «bologna» from `landscapes-2026-11-03.json`, archived on 3 November, now upscaled to 2k and shipped at 640/1024/1600px) under the header, full width, and the hero copy on the cream panel from the FAQ tile (`rgba(255,253,249,.94)`, blur, 28px) on the right; on phones the scene sits on top at 4:3 and the panel follows on `#FAF6EE`. The campus illustration left the home page (it still opens the cabinet login). Texts, actions and the example route below are unchanged.
- **Three quiet motions, nothing else.** The still carries a 10 s video loop of the same frame (`LivingLandscape`, see the motion passport): backpack straps and collar in the breeze, the evening light flickering through the arches, dust in the sunbeams. The frame drifts ±5% against the scroll from 1024px up (`animation-timeline: view()`, scaled 1.12). The panel's lines rise in once, 14px over 520ms, 60ms apart. `prefers-reduced-motion` stops all three; the still stays the poster and the only image for reviews.
- **Reviews.** `design-portal-progress-review` now asserts that inner pages carry no route strip and that the stage page's pips are the stamps and carry no numerals; the other stage-page contracts (`[data-stage-switcher] [data-story-pill]`, `[data-task-check]`, `[data-stamp]`, «Соседние этапы») are unchanged.

## Access wall: the first step and one document check are free · 5 November 2026

Owner, after the funnel research («Давай тогда имплементи эти изменения конкретно в структуру»), then on the first preview: «выглядит топорно… не меняй структуру этих блоков; старайся не менять то, что уже было, просто поменяй, как это устроено до оплаты и после». The research said: people pay for «сделай под мой случай, проверь и не дай пропустить срок», not for information; a wall converts when it stands at the moment of doing; what is locked is shown by name and date, never blurred. Until now everything was free — guides, the whole plan with actions, the local cabinet with check marks and unlimited document checks — and payment bought only the cloud and Telegram.

- **One module decides.** `src/lib/access.ts`: `FREE_PLAN_STEPS = 1`, `FREE_DOCUMENT_CHECKS = 1`, `planStepOpen(index)`, `freeTaskIds(data)` (the questionnaire, the university choice and the first route step), `localTaskLocked(data, task)`, and the free-check fingerprint store (`iitaly_free_check_v1`: a hash of file name and size, never the name, the text or the report). It never calls the backend and grants nothing; the cloud cabinet after payment does not see it.
- **No new blocks.** The first version put a cream «wall» card and a «Собрано» counter strip on the pages; the owner called it clunky, and both are gone. Every locked place keeps the block it always had and only swaps the action: `useWallPurchase(place)` (`src/components/access/useWallPurchase.tsx`) gives the host `open()`, the label «Открыть маршрут за 10 990 ₸» and the same `BuyModal` as `/prices`, rendered once; the host draws its own usual button with `[data-wall-buy][data-wall-place]`. Analytics: `wall_seen` once per place and address, `wall_cta` + `checkout_started` with `from: wall:<place>`.
- **`/plan`: step 1 in full, the rest by name.** The result page is exactly as before (Vespi's «Персональный план готов», the cabinet link, the tile grid). Every tile keeps its label, title, line, pill «Открыть шаг» and object; a locked tile adds «· закрыт» to its label (`[data-plan-step-locked]`). Opened, a locked step shows «Шаг n из N · закрыт», the orienting sentence and one quiet line (`[data-step-locked-note]`, 14px `#57514B`) instead of the action and sources; the «Назад / Далее» row stays, with the purchase pill on the right and «Далее» as a quiet outlined pill beside it (`.quietNext`). `[data-instruction-point]` and `[data-instruction-next]` are unchanged.
- **The local cabinet: three open tasks, then the lock.** `PortalFocus` takes `locked`; a locked row keeps its check ring (dashed, `[data-task-locked]`, label «Закрыт до оплаты»), title, explainer and dates, and its action column holds the usual `.primary` button, now the purchase, instead of «Открыть разбор» and «Отметить готовым»; the «Сейчас» card's primary becomes the purchase too (`[data-now-locked]`). A locked step page (`LockedTaskPage`, `[data-task-locked][data-step-detail]`) is the step's usual «Кратко» page — breadcrumbs, title, date, the plan's orienting sentence — with one quiet note and the purchase where «Как выполнить →» was, plus «Что входит и возврат 7 дней»; no instruction, no upload, no «Готово». The vault names the one free check on `/plan` (`[data-documents-free-note]`). The assistant receives only the title of a locked step.
- **One free document check.** On `/plan#document-check` the badge reads «одна проверка бесплатно»; the first file is checked in full and may be checked again with another programme or year (same fingerprint). A different file, or the empty workbench after the first check, shows the usual file area with the purchase button and one caption instead of the drop zone or the check button (`[data-document-walled]`). The cabinet inspector (`portalInspector`) knows no limit.
- **`/prices` says the same.** «Бесплатно: ИИ оценит шансы, соберёт весь маршрут под твой случай, откроет первый шаг и одну проверку документа» → «10 990 ₸: открывает остальные шаги с датами и чек-листами, проверки без лимита и напоминания — до permesso». The price, the feature list and the refund terms are unchanged.
- **Reviews.** `admissions-browser-review` asserts step 1 open with its action and every later step locked with the purchase button and without its requirements; `design-workspace-review` walks the guest funnel to the locked step on the overview, the stage page and the step page, opens the purchase form from it, checks the vault note, and runs the one free check on `/plan` (one fingerprint stored, same file rechecked, second file walled). `design-media-switcher-review`, `design-ux-review` and `launch-document-review` pass unchanged: the first step and a rechecked file are still free.

## Smoothness on phones: glide, arrive, carry less · 5 November 2026

Owner, on the live site after the access wall: «анимации где-то подлагивают, где-то на телефоне в целом тебя перебрасывает слишком резко. И вот плавность анимации, над этим нужно поработать… то, что всё перешло в блочность, я это поддерживаю». Measured before changing anything, on a Pixel 7 emulation (390 px, DPR 3, CPU 6× slower, real touch drags through CDP, reduced motion off) with two probes: the page movement per frame after each tap (an instant jump shows as one frame that moves hundreds of pixels) and the main thread while scrolling (rAF deltas, long tasks, long-animation-frame attribution). The throws were real: the city pick on /universities moved the page 1655 px in one frame; on a 700 px viewport the questionnaire pulled the next question back 224–453 px in one frame; the plan result, the cabinet report, the upload zone and the error notice all scrolled instantly. Scrolling itself was mostly fine (p95 frame 17–33 ms, 2–9 % slow frames); the script time there was came from Next.js prefetching links as they entered the viewport and from React work, not from the paper, the video loops or the entrances (variants that removed each of them changed nothing measurable).

- **Glide, don't throw.** `src/components/motion/scroll.ts`: `revealElement(element, block)` scrolls smoothly, instantly under `prefers-reduced-motion`. It replaces every `behavior: "instant"` that answered a tap: the next question (public `Wizard` and cabinet `PortalAssessment`), the plan result focus, the opened step tile (on phones it lands under the header with `block: "start"`; in the two-column grid only the row comes into view), the chosen city, the cabinet document report, the upload zone and the error notice. After: the same taps move 10–37 px per frame over 6–39 frames, and no single-frame jump above 160 px remains in the probe.
- **Arrive, don't cut.** A cabinet section, task or document page swaps in place and resets the page to the top before paint — a cut, which is right — and now the panel arrives with one short rise: `useViewEntrance(ref, key)` (`src/components/motion/useViewEntrance.ts`), 240 ms, opacity and an 8 px translate on `cubic-bezier(.22,1,.36,1)`, a 160 ms fade under reduced motion, through the Web Animations API so screenshots of a loaded page and the global reduced-motion rule are untouched; the first render never animates and a new key cancels the run in progress. `RouteEntrance` in the root layout does the same for client-side route changes with a 220 ms opacity fade of `#main` — no transform, so scroll-driven measurements stay exact — while the header stays put.
- **Carry less on phones.** The plan grid and the cabinet lineup animate only the two tiles that can be on screen (`.tile:nth-child(n+3) { animation: none }` under 600 px) instead of five composited layers at DPR 3; the guide band's drift, lean and `will-change` live under `(hover: hover) and (pointer: fine)`, so on touch no tile carries a 3D layer; the guide step object decodes asynchronously before its entrance; Lenis is not started on touch-only devices (it only mirrored native scrolling there, 40 ms of handlers per flick on /plan); the header and footer links prefetch on hover or touch (`prefetch={false}`) instead of parsing every visible route's payload on the main thread in the first seconds after load — the largest script cost the probe found during an early flick. The paper, the video loops and the blend layers stay: they did not show up in the measurement, and they are the material of the site.
- **Unchanged.** The durations and curves of the existing entrances (tiles 520 ms, question 420 ms, step 320–520 ms), Lenis on the marketing routes (touch scrolling is native there), the sticky header, the instant reset to the top on cabinet navigation, `html { scroll-behavior: smooth }`.
- **Reviews.** `design-ux-review` waits for the city result to glide into view instead of reading its position right after the pick. The probes live outside the repository; the contracts (`[data-instruction-point]`, `[data-flight-stop]`, `[data-story-pill]`, `?step=` history) are unchanged.

## The cabinet for someone who knows nothing about Italy · 5 November 2026

Owner: «у тебя всегда непонятно расположена информация… ресерчни, как должен быть UI, чтобы пользователь всё схватывал, zero brain cell, особенно в личном кабинете… маленькими символами, максимально разжёвывая… минимализм Apple… без вот этих 0.1, 0.2… думай как человек, который ничего не знает об Италии, в 11 классе». Measured before changing anything (guest cabinet after the questionnaire, 390 px): the overview was 6.3 phone screens with 22 buttons and links, 10 headings and the stage codes «01–05»; the current step appeared twice (the «Сейчас» hero and a step tile under the board), progress three times (board figures, route count, stage marker), every stage tile had two pills, and stage lines read «Согласуй DoV или CIMEA», «Подготовь визу D через VFS» with no explanation.

**What the research says.** GOV.UK's «one thing per page» pattern was researched on Register to Vote and GOV.UK Verify; DWP's accessibility manual says it is less disorientating and lowers cognitive load. GOV.UK's task list shows each task's status as a short word and a summary above the list; its research found uppercase statuses harder to read. GOV.UK's step-by-step navigation, made for journeys with a start and an end, was tested in 8 rounds including people with low digital literacy. GOV.UK writes for a reading age of 9 and treats jargon and acronyms as hard to read; the Australian Style Manual targets 15-word sentences. Progressive disclosure (Nielsen, 1995) shows the most important options first and the rest on request. Hick's law: the more options, the longer the decision; mark the recommended one. Duolingo replaced its skill tree with one guided path in 2022. NN/g's teen studies found a 55 % task success rate for teenagers against 66 % for adults, less patience and still-developing reading skills; Apple's HIG asks for a clear hierarchy that separates the primary action from supporting content. (Sources were read through search summaries; gov.uk and nngroup.com were not reachable from this environment.)

**The rules, applied to the cabinet.**
- **Every screen answers three questions in order:** what to do now, why, how far along I am.
- **One primary button per block.** Anything else is a quiet text link, at most one.
- **Nothing twice.** The current step lives in «Сейчас» only; progress is one sentence and one bar.
- **Words, not codes.** No «01–05», «ЭТАП 02», «1 / 4 ШАГОВ» or capitals; statuses are «Сейчас», «Дальше», «Готово», «Начат заранее»; counts read «1 из 4».
- **Explain every unfamiliar word where it appears.** A small «i» and one line: DSU, CIMEA, DoV, апостиль, bando, Universitaly, виза D, VFS, permesso, ISEE, codice fiscale, ЦОН, eGov, Foundation, «11 классов вместо 12» (`src/components/portal/plainWords.ts`, `PlainTerms.tsx`). The lines repeat what the guides already say and add no new requirement or date.
- **Facts as small icons.** Calendar: «Лучше успеть до 12 февраля · осталось 98 дней»; clock: «Займёт 15 мин». A vague «По ситуации» is not shown.

**The overview is three blocks.** (1) «Сейчас» — the landscape tile, a visible «Сейчас твой шаг», the step in large type, one plain line, the word explanations, the icon facts and one button whose label says what happens: «Ответить на вопросы», «Выбрать вузы», «Как подготовить», «Открыть итог проверки», «Как сделать», or the purchase for a locked step (`stepActionLabel`). (2) «Весь путь до учёбы в Италии» — «Сделано 4 из 26 шагов · заранее 2», a thin green bar, then every stage as one row like iPhone Settings: its object, name, one plain sentence of what happens there (`STAGE_PLAIN`), the status word and «1 из 4»; the whole row is one link to the stage page; before the questionnaire the five later stages are rows without links, «Откроется после анкеты». (3) «Ещё в кабинете» — three rows: documents («Проверено 0 из 5»), universities (the saved names or «Пока не выбраны»), reminders («Включены в Telegram» or «Пока выключены»). Gone: the dark route board with the stage scene and three figures, the «Уже сделано заранее» list, the duplicate current-step tile, the flight line with its previews, the stage tiles with «Открыть этап / Первый шаг», the three utility tiles with two pills each, the Vespi caption. Result on the same guest at 390 px: 2 screens, 10 controls, 4 headings, no stage codes.

**Stage and step pages.** The stage page keeps one step: check ring, title, one line, word explanations, icon facts, the primary with the same labels and a quiet «Уже сделано»; the step numerals are gone; «Назад / Далее» stay, and the last step links to the next stage instead of a separate «Соседние этапы» bar. The step page shows «Займёт…» only for a concrete duration, explains its words, and keeps one primary «Как выполнить»; the quiet link stays only for a document already in hand. Instruction pills read their titles without «01 ·».

**Cabinet chrome and documents.** The local status line reads «Твой план сохранён на этом устройстве · Есть код доступа? Войти» (was «Локальный профиль активен · Подключить облачный кабинет ↗︎»). The header «Документы» gets its word next to the icon on wide screens, like «Настройки». The documents vault drops the four filter pills (five cards need none) and the repeated «Что сделать: подготовить документ по инструкции» on untouched cards; each card says what the document is for («Нужен для вуза / для стипендии DSU / для визы») and where to get it.

**Unchanged.** Roadmap, task IDs, completion only after a confirmed save, the «Шаг сохранён» announcement and bar travel (the route engine moved into `PortalRoad`'s path mode with the same `data-portal-road` contract), the access wall, the documents' verdicts, prices and every requirement and date. Removed files: `journey/FlightPlan.tsx` and its styles, `portal-journey.module.css`, `portal-lineup.module.css`; `PortalStageLineup.tsx` keeps only the stage object.

**Reviews.** `design-portal-focus-review`, `design-portal-progress-review`, `design-portal-route-action-review`, `design-portal-pages-review`, `design-portal-targeted-review`, `design-portal-document-clarity-review`, `design-portal-document-report-review`, `design-vespi-system-review`, `design-workspace-review` and the shared `portal-review-navigation.mjs` now assert the three blocks: one action in «Сейчас», no completion control on the overview, rows in one column with one link each and status words, no stage codes, «Ещё в кабинете» with three rows, the word explanations and icon facts on the stage page, and the same counts, ahead work, locked preview stages, saved-only feedback and reduced-motion behaviour as before.

## The whole site without overload · 5 November 2026

Owner: «ещё раз перепроверь всякие перегрузы информации. Это может быть очень болезненная тема». Measured every public page and the cabinet at 390 and 1440 px (screens, controls, words, headings, capitals, text under 13 px, repeated sentences, codes «01–09», jargon) before changing anything. The worst were the rules page `/changes-2026-27` (14.6 phone screens, 1 827 words, 11 numbered sections with every paragraph open, 25 numbered sources, 22 caps labels, 62 tiny labels), the `/plan` result (7.8 screens: «Персональный план готов» twice, eleven full-height tiles with «ПРИЗЫВ · ЗАКРЫТ» labels, two filled buttons) and the home page (the «01–04» route, a caps stage label, three small lines under the main button).

**Rules applied everywhere.** The cabinet rules of the section above now hold site-wide: words, not codes; no capitals in labels — the 11 px caps eyebrow is retired, labels are 13 px semibold in sentence case (guides' fact labels and «4 шага · …», step-page eyebrows, the questionnaire's «Вопрос 1 из 10», the plan tiles, the cabinet stage rubric and settings labels, prices labels, the rules page, the comparison deck, the 404 page); nothing said twice; a long reference reads as a table of contents first.

**Rules page.** One intro and the «Важно» note, the five dated statuses, then «Что учитывать при подаче» as eleven disclosure rows (GOV.UK details): the rule's title is the summary, the paragraphs, notes, medical routes and the rule's sources open on tap; the browser's find-in-page opens them by itself. The six questions are disclosure rows too, and the 25 official links sit behind «Все ссылки на официальные страницы · 25» under the «Первичные источники» heading, with the dated disclaimer and the next-step links still visible. Texts, figures, dates and sources are unchanged. After: 6.9 phone screens, about 500 visible words, no caps, no codes.

**Plan result.** One plain line under «Твой план поступления» («План собран по твоим ответам. Набор: … Правила проверены …») instead of the caps callout; one filled button («Продолжить в личном кабинете»); the second filled «Собрать документы с IITALY» is gone — the purchase stands in every locked step; the «~2 минуты» badge and the footer with «Начать заново» show only during the questionnaire («Изменить ответы» covers it after). The step tiles keep their grid, objects and wall; on a phone a closed tile is a short row — label, title, two lines, a quiet «Открыть шаг ›» and the object at the right — and only the opened step is a full tile. After: 5.4 screens.

**Home and the rest.** The sample route shows an icon per stage instead of «01–04»; «Большой путь. По одному шагу.» in sentence case; the «Короткий опрос · …» line under the buttons and the «От идеи до Италии» pill are gone. The university comparison drops «01 / ———» and «01 / 03» for «Свободное место» and «1 из 3», city facts get a dot instead of «01–03». The source scope lines, the cabinet's «1 из 4» and welcome line and the login eyebrow moved from 12 px to 13 px. Not changed: the Modulo 1 form replica (it mirrors the paper form), the map, the guides gallery, prices and every fact.

## No arrows, one progress bar, warm icons · 6 November 2026

Owner: «полностью убери эти маленькие стрелки, которые показывают, что там что-то есть — топорно смотрятся; прогресс-бар сделай максимально юзер-френдли; иконки заредизайнь — золотая середина, один дизайн-код, с упором на реализм, но не до конца».

**Arrows.** No affordance arrows anywhere: the «↗︎», «→», «←», «›» glyphs after link and button labels, lucide `ArrowRight / ArrowUpRight / ArrowLeft / ChevronRight` inside links, the chevrons at the end of cabinet rows, the round arrow button in the corner of the home scene cards (now a worded pill: «Составить мой план», «Открыть гайд»), the arrow between the free and paid cards on /prices, the «←» on back buttons. A link reads as a link by its words, its underline or its pill. Kept: the round prev/next buttons of the guide rows (they are the control itself, not a hint), the sketchbook's own arrows, the map, and «Казахстан — Италия» now uses a dash instead of an arrow.

**Disclosures.** Every `<details>` uses one mark, `src/components/ui/disclosure.module.css`: a 26 px warm circle with a plus that turns into a minus when open (the vertical bar collapses, 240 ms), drawn by the summary's own `::after`. `.row` puts it at the right of a full-width row, `.inline` right after the text; dark surfaces set `--disclosure-bg` / `--disclosure-ink`. It replaced the chevrons of the home FAQ, the rules page, the prices guarantees, the plan result and the system triangles of the cabinet, guides, documents, universities and Modulo 1 disclosures.

**Progress bar.** «Весь путь до учёбы в Италии» shows a large green percentage («5 % пройдено»), the same count line («Сделано 1 из 19 шагов · заранее 2»), a 12 px bar cut into one segment per stage (segment length = the stage's steps), a white knob with a green ring at the end of the fill — «you are here» — and the two ends of the journey under it: «Старт» and «Учёба в Италии». The fill and the knob travel together on `transform` with the same 920 ms curve; under reduced motion both stand still. Contracts unchanged: `--route-fill`, one `[data-flight-fill]`, `[data-road-count]`, the `progressbar` «Выполненные шаги маршрута».

**Icons: one code, realism but not all the way.** Two layers:
- **Object icons** (`src/components/icons/ObjectIcon.tsx`) — the site's own studio-real objects (design/illustrations/objects-2026-11-04.json) at 32–76 px: the home route (cap, folder, passport, keys), «Ещё в кабинете» (folder, cap, alarm clock), every document card (stamp pad for the apostille, translation, diploma for CIMEA, coins for ISEE, tax card for statements, insurance, keys for housing, envelope for Universitaly), the document drop zone.
- **Small object icons** (`src/components/icons/WarmIcon.tsx`, `public/illustrations/icons`, recipe in design/illustrations/icons-2026-11-06.json) — eight new renders made with the same prompt as the stage objects, composed for small sizes: a tear-off calendar with brass rings (deadlines), a cream alarm clock (durations), a brass magnifying glass (word explanations, instead of an «i»), a red push pin in a folded map («где взять»), a green wax seal with a check (done, «Шаг сохранён»), a brass padlock (privacy, locked), a kraft folder with a red band, a paper sheet with a paperclip. 128 px WebP frames shown at 18–44 px (22–26 px next to text, so the details still read). A first flat SVG set was rejected by the owner as too minimal («ушёл в слишком минимализм»): small icons are objects too, not line art.
- **Controls stay line icons**: search, close, play/pause, settings, the header «Документы», add/remove in the comparison and the selected-answer tick are buttons, not objects.

**Reviews.** Labels lost their arrows in `design-workspace-review`, `design-portal-focus-review`, `design-portal-targeted-review`, `design-portal-document-report-review`, `design-media-switcher-review` and the two Modulo 1 reviews; everything else is unchanged.

## Fewer small things, no emoji, Vespi at work · 6 November 2026 (later)

Owner, on the live site from a phone: «на первом экране очень много мелких — всё выбивается, особенно на телефоне; эмодзи перебор, выглядит слопно — замени; белое свечение не нужно, колхозно; в кабинете понизить градиент; добавь иллюстрации, где Веспи что-то делает, с анимациями».

- **Home on a phone.** A later mobile rule set `.heroCopy { padding: 0 }` on the same element as the hero panel, so the button and links touched the screen edges; the panel keeps its 20 px gutters now. Gone from the first screens: the «Из Казахстана — в Италию» pill, the rules link under the buttons (it moved to the footer as «Правила 2026/27»), the inline logo in «Твой маршрут», the «Начнём с главного» pill, the «Интерактивная карта» pill; «Стипендия DSU» is a plain label; the sample route is four underlined words. Secondary links are 15 px.
- **No emoji-like icons.** The small object icons of the morning read as emoji at text size. Facts are words separated by a dot («Лучше успеть до 12 февраля · Займёт 15 мин»), word explanations are a footnote with a thin left rule, «Где взять:» is a bold label, «Готово» and «Шаг сохранён» are words, check lists use small green dots, the plan transition is two plain circles. Document cards and «Ещё в кабинете» rows carry no icons. Objects stay where they are the subject: the stage rows of «Весь путь», the document drop zone. `WarmIcon` and `ObjectIcon` remain in the code base, unused by the cabinet.
- **No white glow.** The cabinet hero no longer fades the landscape into a white haze under the text: the text stands on paper, and the landscape is its own window (22 px radius, 4:3 on phones) with a crisp edge, so Vespi on the scooter is visible and the video loop keeps playing.
- **Vespi at work, moving.** `src/components/illustration/StageScene.tsx` shows the scenes of design/illustrations/scenes-2026-11-04.json: the stage page opens with its stage's scene (Vespi choosing programmes, holding the diploma, stamping, sealing an envelope, saving coins, waiting with the passport, holding the keys), the documents page with Vespi stamping a sheet. Motion is a slow camera drift towards Vespi (20 s, alternate) and a warm light passing over the scene every 10 s — transform and opacity only; under reduced motion the frame stands still. The attribute is `data-stage-scene`, not `data-vespi-scene` (that one stays for mascot cut-outs, which the hero still must not carry).

## Vespi rides, documents first, sharp on laptops · 6 November 2026 (evening)

Owner, 6 Nov: «иллюстрация должна быть на фоне, и Веспи должен реально ехать»,
«картинки ниже качеством, чем остальной сайт», «прогресс-бару не хватает
видимости», «проверка документов должна выйти на первые планы — главная фишка
наряду с уведомлениями».

- **«Сейчас» stands on the landscape.** The Tuscan road is the background of
  the whole hero tile (phones: on top, the panel overlaps it like a sheet).
  The text sits on a solid `#FFFDF9` panel — never a haze or gradient over
  the photo. The tile keeps a road band under the panel at every width.
- **Vespi really rides.** `public/illustrations/motion/tuscany-ride-*` is a
  12.8 s loop: two locked-camera MiniMax H3 clips (empty road → Vespi in
  place; Vespi in place → empty road over the hill), joined with 0.25 s
  fades on the identical frames. The empty road was made from the original
  still: a GPT Image edit pasted back only where Vespi stood, so every other
  pixel is the original. The loop starts on the poster frame, so the hand-over
  from still to video does not jump. 1920 px H.264 for laptops, 960 px for
  phones (VP9 960 as the fallback).
- **Sharp on laptops.** `LivingLandscape` picks the first width that covers
  window × pixel ratio (up to 2×); stills ship at 2400 px (Tuscany, Bologna,
  belvedere) and the Vespi scenes at 1600 px (bytedance 4k upscales of the
  1024 px originals). No image is stretched past its pixels at 125% scaling.
- **Documents and reminders first.** Right under «Сейчас»: «Проверка
  документов» (Vespi stamping, «Проверено N из M», «Проверить документ») and
  «Напоминания о сроках» (Vespi with the notebook and the clock, status,
  «Подключить Telegram»). «Ещё в кабинете» is gone; the saved universities
  are already named in the greeting. On the home hero «Проверить документ»
  is a second button next to «Составить план бесплатно», not a small link.
- **Progress bar you can see.** Open track `#DDD0BC` with a hairline edge,
  14 px bar, 26 px knob with a 5 px ring.
- **No light sweeps.** The Vespi scenes keep their slow camera drift only;
  the gradient light sweep is gone (no gradients inside the cabinet).
- **Navigation lands at the top.** `<html data-scroll-behavior="smooth">`
  and a Lenis glide that stops on a link click: a page opened from a
  scrolled one starts at its top (was: /guides at its footer).

- **Reminders on their own background** (owner, 6 Nov, later: «вот здесь
  хотелось бы другой фон»). The reminders tile no longer repeats the wooden
  desk of the documents tile: Vespi winds an alarm clock on a sunny Italian
  balcony with geraniums, lemons and rooftops (`scenes/alarm-*`,
  design/illustrations/scenes-2026-11-06.json). The notebook scene stays on
  the settings page. Feature scenes are 16:7 on wide screens, 16:9 on phones.

## Vespi plans on /plan, physical guides, conceptual cabinet · 6 November 2026 (night)

Owner, phone and laptop screenshots: «на /plan должен быть Веспи, делающий
что-то, с анимацией»; the guide objects with a white outline (coin jar, first
aid kit) «поменяй, сделай красивее, с упором на реализм»; in the cabinet
«иконки страшные… сделай их более концептуальными», on the guides «более
физические»; the cabinet questionnaire «всё ещё старый формат»; the plan result
«нагляднее, в хронологическом порядке»; «что за артефакты на фоне».

- **/plan header has a living scene.** Under the subtitle, one 28 px tile
  (2:1, 4:3 on phones): Vespi at an iron table in a lemon courtyard with a
  fountain, writing the plan and thinking. Still
  `scenes/plan-courtyard-{960,1600}.webp` (the loop's first frame, so the
  swap is invisible), loop `motion/plan-courtyard-{1600.mp4,960.mp4,960.webm}`
  made with Kling 4.0, the still as both start and end frame, last 8 frames
  blended into the first (seam 36.9 dB). Reduced motion and Save-Data keep the
  still. design/illustrations/motion-2026-11-06.json.
- **Guides: physical objects without halos.** DSU/ISEEU is now a linen coin
  pouch with a red cord and a stack of coins, «Страховка и поездки» a tan
  leather suitcase with a stethoscope, apostille a re-shot wooden stamp and
  ink tin. Same names and frames in `objects/` (480 × 367/362/371), so every
  place that shows them (guides, questionnaire, plan steps, home banner)
  updates at once. Studio-photo realism, transparent, no glow or white rim.
- **Cabinet: conceptual stage icons.** «Весь путь» rows use their own set,
  `public/illustrations/stages/{start,education12,docs,apply,dsu,visa,arrival}-{128,256}.webp`:
  compass pointing at a pin on a map, a diploma on two books, sheets with a
  paper clip and a check, an envelope going into a mailbox, coins with a
  sprout, a passport with a stamp, a key with a little house. Soft 3D, warm
  cream / sand / terracotta / sage. Physical objects stay in the guides.
  design/illustrations/objects-2026-11-06.json.
- **Cabinet questionnaire = /plan tile.** The cloud cabinet's «Расчёт» asks
  in the same tile as /plan: «Вопрос n из 10 · тема», large question, reason,
  answer capsules, the question's object; light and dark alternate. Answers
  are still radios (a transparent radio over each capsule) with «Назад /
  Продолжить» under the tile, so saving works as before.
- **Plan result is a chronology.** One column top to bottom instead of the
  2×N checkerboard: the cabinet's stage names as groups («1. Документы ·
  шаги 1–2», «Поступление», «Стипендия DSU», «Виза», «После приезда»), a line
  on the left with each step's number, the same 28 px step tile with its
  label, title, line, pill and object on the right. The opened step keeps a
  terracotta ring and number; locked steps keep «· закрыт». The builder's
  order is untouched (`planStepPhase` only groups consecutive steps).
- **Plain cabinet background.** The `zhol-paper.webp` tile was mirrored
  (kaleidoscope) and drew diamonds and blotches every 640 px; the header used
  a photo of paper (`zhol/bg_cream.jpg`). Both are gone from the cabinet: a
  flat canvas plus the seamless fractal grain.
