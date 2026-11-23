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

## Text over a calm scene on /plan, loops without jerks · 7 November 2026

Owner, /plan screenshot: «здесь должен быть текст, а на фоне Веспи… фон менее
карикатурный, более исторический, детализированный… текст посередине, на фоне
чуть заблюрено»; «проблема с качеством на других анимациях не решена, есть
обрывистость».

- **/plan header.** One 28 px tile (24 px on phones) the width of the content:
  a Renaissance loggia of an old university, pale stone, faded garland
  frescoes, muted palette; Vespi writes at a walnut desk in the lower centre.
  Badge, title and line sit in the middle above it. The blur behind the text is
  baked into the poster and the loop (feathered ellipse, gaussian sigma 7 at
  1920), so phones pay nothing; a soft light radial veil keeps the ink
  readable on every frame. Loop `motion/plan-loggia-{1920.mp4,960.mp4,960.webm}`,
  poster `scenes/plan-loggia-{960,1920}.webp`. The lemon courtyard is gone.
- **Loops without jerks.** Every loop now starts and ends on the same frame
  and the last 16 frames ease into the first: no ping-pong (clouds and leaves
  no longer reverse) and no jump at the seam.
  - Bologna (home hero) and the belvedere (home FAQ) are new Kling loops from
    their own stills at 1752 px (were 1280 px at 400–850 kbit/s);
    `widths={[960, 1752]}`.
  - Tuscany (cabinet «Сейчас»): Vespi used to brake to a full stop for ~0.75 s
    and jump back at the loop point. The frozen frames are cut and the braking
    thinned so it rides through at a steady speed; the background around it is
    blended into the first frame.
- Diagnosis, jobs and hashes: design/illustrations/motion-2026-11-07.json.

## Light that holds, a strip that rolls on its own · 7 November 2026 (later)

Owner, three screenshots: «когда мышку на правую сторону переводишь, чтобы она
автоматически постепенно и плавно переходила на следующие»; home hero
«анимация чуть топорная, качество плохое, и освещение резко меняется просто
так»; /plan «белое освещение меняется на тёмное просто так».

- **Why the light jumped.** The video faded in over a poster that was not its
  own first frame, and the files were encoded with the BT.601 matrix but no
  matrix tag. Browsers that read untagged HD video as BT.709 showed it warmer
  or darker than the WebP underneath, so every fade-in, and every return after
  scrolling away, changed the light. The Bologna and belvedere posters were also
  the sharper original stills, so the picture softened when the loop appeared.
- **Loops now.** Each loop is rebuilt from the raw Kling clip:
  - the duplicate end frame dropped and the last 16 frames eased into the first;
  - interpolated to 30 fps, which plays evenly on 60 Hz screens (24 fps
    judders);
  - laid over its sharp still. Only what really moves comes from the video
    (Vespi, its shadow, the lantern, the cypress, leaves, the olive tree on
    /plan); the rest of every frame is the still itself, so stone and sky
    never boil;
  - the video areas are matched to the still in colour and sharpened toward its
    detail.
  - Every file is tagged BT.709 matrix and primaries with the sRGB transfer, so
    Chrome and Safari show the same colour as the WebP.
  - Each poster is frame 0 of its loop, so the fade-in is invisible.
  - Widths: `[960, 1600, 2400]` (bologna, belvedere, tuscany-ride),
    `[960, 1600, 2560]` (plan-loggia). VP9 960 for Chromium builds without
    H.264.
- **No second fade.** Once a loop has appeared it stays over the poster; off
  screen it pauses on its current frame and resumes there. Reduced motion
  still hides it and shows the poster.
- **Guides strip glides.** With a mouse near either edge of the dark band
  (outer 18% of its width, 96–260 px), the row rolls that way on its own.
  - Speed follows the cursor's depth in the zone on a smoothstep up to
    520 px/s.
  - It speeds up and slows down exponentially (τ 0.4 s), and eases out over
    the last 180 px before the end of the row.
  - When the cursor leaves, a critically damped spring (ω 6/s) carries the
    current speed onto the card the row would have reached, in the direction
    it was going: no dead stop, no roll back. Snapping returns on landing; a
    drag, swipe or wheel cancels the glide at once.
  - Measured at 1440×900: at most 9 px per frame, and the per-frame step never
    changes by more than 1 px from one frame to the next.
  - Touch, keyboard and reduced motion keep the plain row. Dots and ▶ are
    unchanged.
  - Interaction thesis (written by the genjutsu `cast` method; unvalidated,
    since the owner asked for no questions): «the band follows the eye: the
    closer the pointer is to an edge, the faster the next topics come in, and
    the row never jerks into motion or stops dead». Allowed patterns: none.
- Jobs, masks and hashes: design/illustrations/motion-2026-11-07b.json.

## Icons a step more conceptual, a Duolingo path in the cabinet · 7 November 2026 (evening)

Owner: «по иконкам сделай редизайн… чуть более концептуальными, чем они
сейчас… сохраняй нотки реализма»; «в личном кабинете как будто прогресс в
Duolingo: путь, и там отображаются степы, которые надо будет выполнять».

- **Object icons.** All 18 objects (guides, /plan questionnaire and steps,
  home cards, cabinet task pages) and the 8 small `WarmIcon`s are re-rendered
  in one semi-conceptual style. The set now sits between the old studio
  objects and the conceptual stage icons, which are unchanged.
  - Materials stay real: leather, brass, paper, wax.
  - Forms are simplified and softly rounded.
  - The composition carries the idea: a balance scale for ISEE, speech
    bubbles over a book for translation, two seals for parental consent, a
    magnifier on the diploma, a key with a residence card.
  - The palette is cream, sand, terracotta, sage and brass.
  - Same file names and the exact old frames, so no layout moves.
  - Manifest: design/illustrations/objects-2026-11-07.json.
- **Path of steps (cabinet, «Весь путь»).** Under each stage heading its steps
  run as circles along a gentle snake: a sine through the whole route, so the
  path flows from stage to stage.
  - **The trail.** An SVG in amplitude units with non-scaling strokes. It is
    green where walked and dotted ahead.
  - **States:**
    - done — green circle with a check;
    - current — larger terracotta circle with a star and a soft ring, its
      label led by a «Сейчас» chip;
    - ahead — cream circle;
    - later stage or unavailable — pale circle;
    - behind the local access wall — a lock.
  - **Depth.** Circles get it from a solid bottom edge, not a gradient (no
    gradients in the cabinet). They sink 4px when pressed and lift 2px on
    hover; with reduced motion they do neither.
  - **Links.** The whole row (circle and step title) is one link to that
    step's page (`/portal?stage=…&step=…`).
  - **Keyboard.** Tab order runs from a stage heading through its steps to
    the next stage.
  - **Layout.** On a laptop the snake is centred (±96px, column at most
    760px) with titles outside the curve. On a phone the snake keeps to a
    left column (±34px) with titles to its right.
  - Preview stages before the questionnaire show two pale circles that are
    not links.
  - The percentage bar, the stage headings and their status words and
    counts are unchanged.
- **Polish (same evening, owner: «наброски неплохие, но всё ещё сыро…
  максимально приятно глазу»; impeccable `polish`).** A first pass put each
  step's object inside its circle. The owner answered «для каждого шага —
  перебор эмодзи», so circles carry only a state mark.
  - **Marks:**
    - done — solid green with a check;
    - current — larger solid terracotta with a star, the only star on the
      path;
    - ahead — clean paper with a small dot;
    - behind the access wall — a lock;
    - later stages — faded paper.
  - **Current step.** One soft wave spreads from it and fades every 3 s.
  - **Current stage.** Sits on a warm band (`#FBF4EC`) as the «you are
    here» region.
  - **Depth.** A thin rim, a blurred inner bevel and a soft offset shadow.
    No block shadow, no gradient, no one-sided stripe (the impeccable
    detector reports nothing). Hover lifts 3px; press sinks 2px.
  - **Completion.** The step just saved settles in (scale .82→1,
    exponential ease-out, no overshoot) and its check fades up. This is the
    path's one authored moment.
  - **Reduced motion.** No wave, no settle, no lift.
  - **Sizes.** Laptop: ±104px snake, 64px circles (80px current), 96px
    rows. Phone: left column, 56px circles, 88px rows.

## Modulo 1 in three sections, a quiet hint on phones · 7 November 2026 (night)

Owner: «по первому скрину всё хорошо, но формулировки странные… страховка и
поездки просто переформулируй»; «в мобильном приложении… карта лагает»;
«в Permesso, когда открываешь Modulo 1, слишком много информации, надо её
разбить дальше по блокам, или даже на другие сайты… и ещё там всё друг на
друга наслаивается».

- **Home cards.** Two teasers in `guides.ts` now read as plain statements of
  what the topic is:
  - codice fiscale — «Личный налоговый номер в Италии. Выдают бесплатно — в
    Agenzia delle Entrate или через консульство.»;
  - health-travel — «Как оформить медицину на время учёбы и куда можно
    ездить, пока ждёшь карточку ВНЖ.»
  An arrival card shows its small label only when it differs from the title,
  so «Permesso / Permesso di soggiorno» and «Codice fiscale / Codice fiscale»
  no longer repeat. Stage cards keep their labels.
- **Cabinet path on phones.** Ghost circles of preview stages are block
  boxes of one row height, so they no longer slide under the next heading.
- **Modulo 1 is three sections**, one tab row on top of each:
  «Бланк · Коды и расчёты · Перед почтой».
  - `/guides/permesso-modulo-1` — the trainer only. The reference sheet
    that used to follow the form (four tools and three checklists) is gone
    from this page.
  - `/guides/permesso-modulo-1/kody` — one tool at a time: tabs on the left
    (a 2×2 grid on phones) and the tool in one card. The tool is in the
    address (`?tool=16|25|sigla|paese`), arrow keys move between tabs, and
    each tool keeps what was typed while you switch.
  - `/guides/permesso-modulo-1/pochta` — three checklist cards («На бумаге»,
    the scenario's documents, «Деньги»), the sources and the cheat sheet.
  - The scenario (`?scenario=rinnovo`) travels between sections; the
    reference pages have their own switch.
  - The draft lives in tab memory while you move between sections (not in
    storage: a reload still clears it; saving is still only by the button).
    «Бланк» brings you back to the page and field you left.
  - A field that needs a reference (16, 19, 25, provinces, 35, 36) links
    from its panel straight to the right tool. In the cabinet the trainer
    shows no section tabs and these links open in a new tab.
  - The two pointers in the data that said «ниже» now name the section.
    The guard allows exactly those two strings; every rule stays byte-exact.
  - The disclaimer «Бланк остаётся главным источником» folds to one line;
    the text inside is unchanged.
- **No layering on phones.**
  - The tap hint is a sheet across the bottom of the screen, or across the
    top when the field is low. It never covers the field.
  - It carries only the status, the answer, one line and «Не пиши». The
    source, the cells and the caption stay in the field panel.
  - No hint card covers the sticky site header or the stuck workbar on any
    screen.
  - On phones the workbar (scenario, pages, tools) no longer sticks over
    the paper. It stays on its own layer, so the «Инструменты» menu opens
    above the sheet, and the opened menu first lifts to just under the site
    header so none of its items fall off the screen.
  - The onboarding line says «Нажми» on touch screens instead of «Наведи».

## The path stands straight · 7 November 2026 (late)

Owner, on the phone (screenshot of later stages): «иногда вот эти вот
кружочки стоят криво… просто убрать неровности».

- **Cause.** The offset of each circle was one sine through the whole route
  (`sin(i·π/3)`), so every stage got whatever phase it landed on: one pair
  straight, the next leaning right, the next left. On a phone the swing was
  30px against 56px circles — less than half a circle, which reads as a
  misalignment, not a curve.
- **Each stage is one arc.** It starts and ends on the axis and bulges in the
  middle: `sin(π·k/(n−1))`. Neighbouring stages bulge to opposite sides. A
  stage of two circles — every preview stage before the questionnaire —
  stands straight.
- **Phones: one straight axis.**
  - Every circle sits on one axis; the left edge of a circle meets the
    start of its stage title (icon 44px + gap 12px).
  - The trail collapses onto the axis: same dotted line, same green walked
    segments.
  - Labels form one column to the right.
- Colours, sizes, marks, links and motion are unchanged.
- `design-portal-progress-review` now asserts:
  - on phones, one axis for every circle and its edge on the title;
  - on wider screens, each arc starts and ends on the same axis.

## One road through the whole route · 7 November 2026 (late evening)

Owner, on the phone: «я хочу, чтобы это был общий путь, и просто остальное
было серым, чем вот эти по одному маленькие степы, которые разделены таким
образом».

- **One road.** One line runs from the first step to the last, through every
  stage. `PortalRoad` draws it in a single SVG from the measured centres of
  the stops (`data-road-point`): stage stations and step circles in route
  order. The line always meets them, both on the desktop arcs and on the
  straight phone axis. It is redrawn when the size or the progress changes,
  without re-rendering React.
- **Stages are stops on the road.** The stage object sits in a disc on the
  same axis as the steps; the disc is larger than a step circle. The rim
  says the state:
  - green — done;
  - terracotta — current;
  - cream — ahead;
  - grey disc with a faded object — closed.

  The title, its line and the status chip with «1 из 4» stand to the right,
  in the same column as the step labels. The whole stop is one link, as
  before.
- **No dividers.** The rules between stages are gone. Only the warm band of
  the current stage («ты здесь») remains, and the road runs through it.
- **The rest is grey.**
  - Walked — solid green.
  - Open ahead — warm dots.
  - Not open yet (preview stages, later or locked steps) — pale grey dots,
    pale circles and grey stations.
- **Layout.**
  - Phones: one axis 40px from the edge; all titles and labels in one column.
  - Desktop: a centred column with arcs that leave each station on the axis
    and return to it.
- `design-portal-progress-review` asserts:
  - one segment between every pair of neighbouring stops and no dividers;
  - on phones, one axis and one label column;
  - on desktop, stations on one axis and arcs that start and end on it.

## Italy along the road · 7 November 2026 (night)

Owner, on the cabinet path: «можно добавить какие-то дизайн-решения…
иллюстрации… Веспи, но не везде, не на каждом шагу… не прям левитирующие
иконки… итальянские места, достопримечательности… чтобы это было
пространство… через 2–3».

- **A world, not icons.** The road now runs through a small handmade Italy.
  Each piece is a tabletop miniature from the same toy world as Vespi
  (matte clay, felt trees, resin water):
  - Colosseum;
  - Florence Cathedral;
  - the Leaning Tower;
  - the two towers of Bologna;
  - a Tuscan farmhouse with a cypress lane.

  Every other piece is Vespi at work instead of a place: reading a map by
  the scooter, tossing a coin into the Trevi Fountain, rowing a gondola
  under the Rialto Bridge, then an espresso with the suitcase on arrival.
  Vespi pieces alternate with places, so two never stand in a row.
  Manifest: design/illustrations/scenery-2026-11-07.json.
  - 10 November, owner: «здесь добавь веспи на гондоле». The Rialto piece
    was redrawn with Vespi in the gondola; the bridge, the houses and the
    canal follow the old frame, which was passed as a reference.
- **Grounded.**
  - Every piece stands on its own patch of ground with a contact shadow.
    There is no pedestal or floating island; an Amalfi cliff rendered as an
    island was rejected for that reason.
  - On the page, all pieces sit on one bottom line (`object-position: …
    bottom`) instead of hovering at random heights.
- **Where.**
  - Between two steps of one stage, on the side without labels.
  - At most every third stop, counting stations and step circles.
  - A stage's labels now all stand outside its curve, ends included, so the
    other side is free.
  - Desktop:
    - the piece sits close to the axis, at most 260×190px;
    - it adds no height, so steps keep their 96px rhythm.
  - Phones:
    - each piece gets its own 136px band in the label column;
    - the road passes it on the same straight axis.
- **Colour follows the road.**
  - Beside walked or open road the piece is in colour.
  - Beside closed road it is grey, like the road itself: a pre-rendered
    warm-grey copy of the same frame (`-grey` files), not a live filter.
- **Motion.** Scrolling to a piece makes it rise 24px and fade in; it is
  driven by `animation-timeline: view()`, with no timers. The reveal ends
  once the piece is fully in view (`entry 5% → entry 100%`), so even the
  last piece at the very end of the page arrives whole. Under reduced
  motion, or where scroll timelines are not supported, it simply stands.
- **Decorative only.**
  - `aria-hidden`, empty alt text, no pointer events.
  - Never inside a step circle or a stage link.
- **Reviews.**
  - `design-portal-progress-review` asserts:
    - scenery only from `/illustrations/scenery/`;
    - at least three stops between pieces;
    - no piece over a title, label, station or circle;
    - every piece inside the road.
  - `design-vespi-system-review` allows Vespi on the road only as
    decorative scenery.


## Smooth where it stuttered, light that holds still · 7 November 2026 (night, later)

Owner: «исправь анимации на сайте, в некоторых местах они подлагивают, в
некоторых местах освещение плохо; пройдись по дизайну, чтобы не было
неровностей».

Measured first: on a Pixel 7 emulation at 6× CPU every route scrolls at
p95 17 ms with at most 4% slow frames, so the main thread is not where the
stutter comes from. What remained was work the GPU had to redo on every
frame, and scrolling itself being driven by JavaScript on laptops.

- **Native scrolling everywhere.** The Lenis glide (home, /plan, /prices,
  /guides on mouse devices) is gone. It moved the page from a
  requestAnimationFrame loop, so every wheel tick depended on the main
  thread keeping 60 fps while videos, pins and scroll-driven animations
  ran; any busy frame showed as a stutter. The browser's own scrolling
  runs off the main thread. `scroll-behavior: smooth` stays for anchors
  and the `data-scroll-behavior` attribute still lands navigation at the
  top. GSAP ScrollTrigger (the /prices heading pin, the home scrub effects)
  listens to native scrolling as before. `LenisProvider.tsx` is deleted;
  the `lenis` package stays installed only until the next dependency pass.
- **No frosted glass over a playing loop.** The home hero panel and the
  FAQ panel were 94% paper with `backdrop-filter: blur(14px)` over the
  Bologna and belvedere loops: the blur was recomputed on every video frame
  and the panel's tint followed the light moving behind it, which is the
  «освещение меняется» the owner kept seeing. Both panels are solid
  `#FFFDF9` now, as the cabinet hero panel already was.
- **No blurred header on phones.** The marketing header keeps its frosted
  strip on mouse devices; on touch devices (`hover: none`) it is solid
  cream, like the cabinet header. A blurred sticky strip is re-rendered on
  every compositor scroll frame at 3× density and was the one effect that
  could make phone scrolling hitch.
- **Compositor-only motion.**
  - Guides strip countdown: the fill slides in on `transform` inside a
    clipped pill instead of animating `clip-path`.
  - Comparison deck: the big university code rises 10 px instead of
    animating `letter-spacing` (a reflow per frame).
  - Plan step tiles: the hover ring is a pseudo-element fading on
    `opacity`; the tile's `box-shadow` is no longer transitioned.
  - Story navigation: hover darkens the colour instead of a
    `filter: brightness()`.
  - Road scenery: the closed-road pieces are pre-rendered warm-grey WebPs
    (`-grey-280/560`), so nine filtered images no longer animate through a
    filter.
- **Video light re-verified.** Frame 0 of every loop against its poster:
  mean difference under 1/255 in red and green, 1–3/255 in blue, luminance
  within 1/255, on desktop and phone (`harness/light.mjs`). The loops no
  longer change the light; the panels above them did.
- **Evenness.**
  - /universities: the comparison section was a peach-to-mint gradient
    whose cool end broke the warm palette; it is one flat sand band
    (`#F6EEE4`) now, and its two greenish greys became the site's warm
    quiet greys.
  - Everything else checked at 390, 834 and 1440 (home, /plan, /guides,
    a topic, a step, /universities, /prices, /terms, 404, the cabinet
    overview, stage, step pages): no horizontal overflow, one column
    rhythm, one pill style.

## The road winds across the whole column · 8 November 2026

Owner, on a tablet: «хотелось бы, чтобы здесь всё было более в формате
ландшафта… можно сделать подлиннее и побольше… если по факту можно
добавить степы, то да, если нет, то нет… чтобы, как реально в Duolingo,
извилисто было».

- **One sine through every stop.** Stations and step circles take one
  running index along the route and sit at `sin(2π·i/8)` of the amplitude:
  0, .71, 1, .71, 0, −.71, −1, −.71. The road line is still drawn from the
  measured centres, so it follows the snake exactly.
- **A real amplitude, on every width.** Desktop `--amp` is
  `clamp(96px, 50% − 310px, 170px)` of a column up to 1040px wide; phones
  use ±88px around the centre. The 7 November «crooked» complaint came from
  half-circle offsets; a full-width snake reads as a road, so the straight
  phone axis is gone.
- **Longer and bigger, with the same steps.** Rows grew from 96 to 116px
  (phones 88 → 148), stations from 68 to 72px. No step was invented: the
  route has exactly the steps the plan has.
- **Labels.**
  - Desktop: step titles and station text stand outside the bend, on the
    side the curve is heading to (`data-side`), at most
    `min(300px, 50% − amp − node/2 − 40px)` wide.
  - Phones: step titles are centred captions under the circles (13px, up
    to four lines), station text sits inside the bend where the room is.
- **Scenery in the pockets.** A piece stands opposite a circle on an
  extreme point (x = ±1), centred on its row, never at a station and never
  closer than three stops to the last piece. It ends before the
  neighbouring circles (`50% ∓ 0.71·amp ± 56px`) and, on phones, before the
  neighbours' captions, so nothing overlaps.
- **Review.** `design-portal-progress-review` now asserts, on every width:
  amplitude of at least 80–90px, repeated crossings of the centre line, no
  jump wider than ¾ of the amplitude between neighbours, and that no
  circle, station, title, caption or piece of scenery overlaps another or
  leaves the road.

## Sitting under the portico, a FAQ that holds still · 8 November 2026 (afternoon)

Owner, five screenshots: the FAQ «очень топорно… иллюстрация увеличивается
по мере того, как нажимаешь»; the /plan title «наводишь мышку — цвет
меняется, всё лагает»; the document check «почему нет основного DSU… если
есть различия, то только тогда»; the cabinet tile «Веспи полностью не
входит в кадр»; and the first screen: «колонны в Болонье — это нормально,
но я бы хотел, чтобы он там сидел, ветерок дул, читал газету, пил эспрессо
и ел круассан… через Higgsfield».

- **The welcome scene is a café.** Vespi sits on a bentwood chair at a
  small marble table under the Bologna arcade, newspaper in both paws (grey
  print texture only, no letters), espresso and a cornetto on the table.
  The still is GPT Image 2.5 (flare, 2k, the mascot references), upscaled
  to 4k for the 2400 poster; the loop is Kling 4.0 at 1080p for 10 s with
  the still as first and last frame: a page turns, a sip, a bite, the
  breeze in the newspaper and the collar, the lanterns barely swaying. Two
  loops were generated and the calmer one kept; the raw clip has no cuts
  (largest consecutive-frame difference 1.9/255 at 320 px) and its light
  holds within 2.6/255 over the 10 s. Built with the 7 November pipeline
  (`motion-2026-11-08.json`): still outside the motion mask, video inside,
  30 fps, BT.709 + sRGB tags, poster = frame 0. The walking scene and its
  files are gone.
- **The FAQ tile keeps its height.** The panel with an open answer used to
  stretch the tile, and `object-fit: cover` scaled the belvedere with it.
  The desktop tile is now 840px tall for good, one question is open at a
  time (`<details name>`), and the longest answer (731px of panel) fits
  with room; the panel scrolls itself only if a browser renders larger
  type. Answers slide open and closed over 320 ms through
  `::details-content` (height 0 → auto with `interpolate-size`), the same
  curve as the plus sign; browsers without it keep the instant toggle.
  Phones were never affected: the scene is its own 4:3 box there.
- **A flat accent over the video.** On /plan the word «ситуацию» was
  gradient text (`background-clip: text`) sitting on the living scene; no
  `:hover` rule, animation or style recalculation fires on hover in a
  headless run, so the remaining moving part under the pointer was that
  text mask over a video layer, which Chrome re-rasterises and briefly
  shows in the fallback colour. The word is plain `#E63946` there now.
  Elsewhere the brand gradient stays (it sits on paper, not video).
- **Cabinet tiles are 16:10.** The «Проверка документов» and «Напоминания»
  scenes were 16:7, which cut the helmet of the stamping Vespi; at 16:10
  both fit, and the stamp scene is anchored to the top with its camera
  drift growing from the top edge, so the far end of the drift keeps the
  helmet too. Phones use the same ratio.
- **DSU first in the document check.** The program list opens with
  «DSU · общие правила» and groups the four competitions with their own
  verified rules (Bocconi ISU/ISEEU, EDISU Piemonte, DSU Toscana, ER.GO)
  under «Свои правила конкурса». It is a label change: the server's
  allowlist knows exactly these five profiles, and `general` is what it
  already applied to any other DSU file. The helper line under the selects
  says the same in the new words.
- **A quieter folder.** The drop zone's folder is a pre-rendered 30 %
  saturation copy (`objects/folder-quiet-240.webp`), 60px, at .85 opacity
  and without its drop shadow. The colourful original remains for the
  guides and the cabinet.

## Light that stays · 8 November 2026 (evening)

Owner, after the café hero went live: «анимация уже хорошо, но всё ещё есть
резкая перемена света, что на главной, что на „Опиши свою ситуацию“… свет не
должен меняться на протяжении всего. И пусть он только попивает кофеёк,
круассан брать не обязательно».

- **Where the light jumped.** Not inside the loops: the home loop's mean
  luminance moves 2.6/255 over ten seconds and /plan's 0.5/255, both
  because Vespi moves, and both seams measure above 50 dB. It jumped at the
  handover from the poster to the video. The video used to appear while
  already playing, over 900 ms, so a half-transparent Vespi moved over the
  frozen poster, and any difference between how the browser renders an
  image and a video (near zero in a software decode, a few percent on a GPU
  with hardware decoding or an HDR display) read as a change of light.
- **The handover is still to still.** `LivingLandscape` now loads the loop
  with `preload="auto"`, waits for the first frame, shows it paused over
  the poster (the poster *is* that frame), fades it in over 2.4 s and only
  then calls `play()`. Nothing moves during the fade, and a residual
  difference of a percent spread over 2.4 s is below what the eye reads as
  a change. Offscreen the loop pauses on its current frame as before.
- **No overlay plane.** The revealed video sits at `opacity: .999`, not 1:
  Chrome does not promote such a video to a hardware overlay, where
  Windows (and HDR pipelines in particular) convert the colour themselves
  and differently from the page. The frame stays in the page compositor,
  converted the same way the poster is.
- **The café loop only sips.** A new 8 s Kling 4.0 loop on the same still:
  Vespi lowers the newspaper, lifts the espresso, takes a slow sip, puts
  the cup back and returns to reading; the cornetto stays on its plate.
  Same pipeline and checks as the morning loop (`motion-2026-11-08.json`
  now records this one; the bite version is listed as superseded).

## Light that never switches, objects that say the topic · 9 November 2026

Owner, five screenshots: «на первой странице всё равно меняется освещение»;
«иконки немного не по теме: DSU, ISEEU — что-то с деньгами, Codice fiscale —
больше бумажку, не везде конвертики»; «уведомление в личном кабинете без
анимации, выглядит топорно»; «после шагов возвращает на анимацию с Веспи в
Тоскане — нужно сразу на прогресс-бар; при первом открытии пусть видит
Веспи, а потом нет нужды смотреть снова и снова».

- **The source never changes on screen.** A browser draws an image and a
  video through different paths. On Windows a video often goes through the
  graphics card's video processor, where the driver (adaptive contrast,
  «enhance video», RTX Video HDR) changes brightness and colour and the
  image path does not; no cross-fade hides that, which is why the slow
  reveal of 8 November was still seen. `LivingLandscape` now follows one
  rule: the picture on screen is never swapped for the other source.
  - **Scenes above the fold** (home, /plan, cabinet) are rendered with
    `data-living="hold"`: until the first video frame arrives the tile shows
    the scene's average colour (`#9B5C3A`, `#AB9078`, `#9C7146`), then the
    video itself fades in over 450 ms. The still is never painted on screen.
    Measured from first paint: the colour at ~0.26 s, the video full at
    ~0.8 s, then steady. If the loop has not arrived in 1.4 s the still
    fades in instead and stays.
  - **Scenes below** (the FAQ belvedere) show the still; the loop loads a
    screen and a half ahead and replaces the still only while the tile is
    off screen. Scrolling to the FAQ finds the loop already in place.
  - «Меньше движения», Save-Data and no JavaScript (`scripting: none`) see
    the still, as before.
- **Guide objects on topic** (`objects-2026-11-09.json`, same
  semi-conceptual set and frames as 7 November): DSU и ISEEU — a stack of
  brass coins and a banded bundle of banknotes; Codice fiscale — a single
  paper certificate with a stamp and a blind seal; Справки семьи — a wooden
  house on clipped certificates; Если ещё нет 18 — a fountain pen on a
  signed sheet with a notary stamp; Воинский учёт — an olive cloth booklet
  with identity tags. No envelope is left in the guides strip; the envelope
  object stays for the consulate step on /plan.
- **A reward that arrives and leaves.** The cabinet's «Штамп получен» notice
  had no styles for its Vespi and text, so the pose rendered at full size.
  It is now a cream pill under the cabinet header (24px radius, soft
  shadow): Vespi in a warm 64px tile, a terracotta label, the step and the
  stage count. It drops in over 420 ms with a slight overshoot, Vespi lands
  with a small stamp bounce, and after 2.2 s it rises out over 240 ms;
  the last reward stays mounted during the exit, so it never vanishes in
  one frame. Transform and opacity only; «меньше движения» shows it still.
- **Back to the progress after a step.** A step saved on its own page, or a
  document whose check completes a step, returns to the overview scrolled
  to «Весь путь»: the percentage, the bar and the road where Vespi drives
  to the next step (`scroll-margin-top` keeps it under the cabinet chrome).
  Opening the cabinet still starts with the Tuscany scene and «Сейчас твой
  шаг»; steps saved on a stage page stay on that page.

## Guides: about 40% open, the rest with the route · 9 November 2026

Owner: «не даем ли мы слишком много информации в гайдах и визе… дай где-то
40% того, что есть… что-то одно из такого ценного, что-то по фигне, мелочи…
дальше открыть уже надо платить». The cut lives in
`src/components/guides/guideAccess.ts`; the purchase is the same as on /plan
(`useWallPurchase`, «Открыть маршрут за 10 990 ₸», the /prices form).

- **The rule.** Each topic opens one step with real use (a sum, a deadline,
  where to start) and, in the larger topics, one small detail. Steps where a
  person decides for their own case (which set of documents, which years of
  certificates, which procedure, how to renew) open with the route. 17 of 41
  steps are open (≈41% of steps, 38% of the words). Topic headers, facts,
  cautions and official sources stay open everywhere.
- **Visa.** Key facts, the VFS link and the funds calculator stay open. In
  «Когда подавать» the first two points, in «Документы для визы» passport and
  form, Universitaly and fees, in «Перед подачей» the origin of funds: 6 of
  18 points. Closed points keep their title in the pills; their text is the
  wall sentence, and the checklist mark still works on every document.
- **Modulo 1.** The application sheet and the sheets a student leaves empty
  stay open; sheets 2–3 show the official page, its title and the wall
  instead of the field guidance; «Переносим на бумагу» becomes the purchase.
  «Коды и расчёты» opens the field 16 code and the province sigla; the
  sheet count and the country code are closed. «Перед почтой» keeps «На
  бумаге» and «Деньги»; the scenario checklist and the skip cheat sheet wait.
- **How a closed place looks.** A closed step card keeps its pips and title
  and says «Откроется с маршрутом» in a quiet pill instead of the first
  sentence; the row header says how many are open. A closed step page keeps
  the title, the topic object, the dots and the pager, and shows as many
  empty numbered rows as the step has, fading down, then the wall: one
  sentence, the black pill with the price, «Что входит и возврат 7 дней» and
  «Уже оплачено — войти» (/portal?view=login). Inside a card that already has
  a border (Modulo 1, «Перед почтой», a tool panel) the wall is flat.
- **Nothing closed reaches the page.** The server cuts the step cards and
  the step pages: closed text is in neither the HTML nor the page data, and a
  closed step's description says only that it opens with the route, so no
  paywall markup is needed. A device that holds a paid cabinet
  (`iitaly_portal_code`, `usePaidDevice`) loads the closed text as a
  separate module and sees everything; the cabinet's embedded trainer is
  never cut. `wall_seen` carries only the place (`guide-step`, `visa`,
  `permesso`) and is not sent by a paid device or a hidden tab.
- **Checks.** `scripts/design-guides-access-review.mjs` reads every step as
  a paid device, then as a guest: the share, the absence of closed text in
  the export and in descriptions, one wall per closed place, the same
  purchase form, the visa points, the Modulo 1 sheets, transfer and tools,
  and the phone fit. The Modulo 1 reviews run as a paid device.

## Guides and visa on a progress path · 10 November 2026

Owner (screenshot of the visa pills): «сделай эти ответвления в гайдах и визе
в формате пути, который как прогресс-бар, так будет намного нагляднее,
местами добавляй иллюстрации по теме обязательно».

- **One path component** (`src/components/story/StoryPath.tsx`). Stops share
  the width on one 4px line; the line is filled in terracotta up to the
  current stop, so the path is the progress bar. Passed stops are filled,
  the current one has a terracotta ring, the next ones are paper circles.
  A stop closed before payment shows a lock in a dashed circle instead of
  its number. Above the path are «Пункт 2 из 5» and one caption: «Открыто 2
  из 5 · остальные — с маршрутом» for a guest, «Всё открыто: на этом
  устройстве выполнен вход в кабинет» on a device with a paid cabinet (so the
  owner sees why nothing is closed). Names sit under the stops; on a phone
  only the circles remain and the heading below names the point. Arrow keys
  move between stops; the fill eases over 480 ms, nothing moves with
  «меньше движения».
- **Where it stands.** Visa «Когда подавать», «Документы для визы» and «Перед
  подачей» (`MediaSwitcher nav="path"`) instead of the pill row; every step
  page of a topic, under the header, instead of the dots at the bottom.
  «Перед подачей» uses short stop names (Средства, Жильё, Валидация и
  документы, Сроки) because its titles only repeat the number.
- **A road over the step cards.** On a topic page and on /guides/visa a line
  runs above the cards with a numbered stop per card; the segment into a
  closed step is dashed and its stop carries the lock. It replaces the pips
  inside the cards.
- **Objects on the topic of each point** (existing set, no new art): timeline
  — cap, coins, passport, alarm clock, permesso kit; documents — passport,
  cap, diploma, translation book, coins, keys, insurance case, receipt,
  signed sheet; before submitting — coins, keys, diploma, alarm clock; the
  funds calculator — coins. The object stands to the right of the point's
  text (220px) and above it on a phone (140px), rising in with the point.

## The guides road, in the cabinet's format · 10 November 2026 (later)

Owner, with a screenshot of the cabinet road: «я имею в виду в этом формате».
The guides and the visa now use the same road as «Весь путь» in the cabinet,
with the same styles (`portal-path.module.css`, imported read-only by
`src/components/guides/GuideRoad.tsx`): medallions on a sine snake, station
stops with an object, a line through the real centres of the stops, and the
cabinet's Italian landmarks in the pockets of the curve (grey beside closed
road).

- **Where.** /guides ends with «Весь путь по гайдам и визе»: three sections as
  stations (the cabinet's stage marks), the 13 topics as stops. /guides/visa
  shows «Путь по визе»: four parts as stations (alarm clock, coins, folder,
  stamp), all 19 points as stops. Each topic page shows «Разбор по шагам» as
  its own short road, without a station (the header is the topic); it
  replaces the row of step cards. Point and step pages keep the compact
  horizontal path from earlier today.
- **What the medallions mean.** Reading, not tasks: read — green with a
  check; «Начни здесь» / «Читать дальше» — the large terracotta medallion
  with the star (one per road); open — paper with a dot; closed before
  payment — the lock. A topic stop on the /guides road is read when every
  page of it this visitor may read is read. The bar above counts every page
  of the road, closed ones too: «Прочитано 1 из 3 · открыто 1, ещё 2 — с
  маршрутом»; a device with a paid cabinet reads «всё открыто: на этом
  устройстве выполнен вход в кабинет» and sees no locks.
- **What is stored.** `iitaly_guides_read_v1` in localStorage holds only page
  keys such as `con/2` or `visa/timeline/3`; nothing is sent anywhere. A
  closed page is never marked read for a guest.
- **Differences from the cabinet** live in `guide-road.module.css`: syllable
  hyphenation instead of letter breaks, room under the last label of the
  highlighted section on a phone, and a short tail when a landmark stands at
  the last stop of a short road.

## A pass over the rough spots · 10 November 2026 (night)

Owner: «пройдись по неровностям». Every key route at 1440 and 390, checked
for overflow, clipped text and edges that do not line up.

- **Step pages.** The reading boxes, the empty rows of a closed step and its
  wall now span the column, like the «Назад / Дальше» cards under them; the
  line length is held by the text (68ch), not by a shorter box.
- **Dense paths.** A path with more than six stops (visa documents) shows
  only its circles: names were cut into syllables at 90px. The names stay in
  the tooltip and for screen readers; the heading below names the point.
- **One progress on visa documents.** The faint «собрано» bar under the
  count is gone; a collected document is a green medallion with a check on
  the path itself, as a finished step on the cabinet road.
- **Road stations on a phone** keep the title and one status line («Сейчас ·
  0 из 8»); the description, which broke into syllables in a palm-wide
  column, stays on the section page.
- **Section pages** (/guides/stages/…) end with the same road as the station
  they open from on /guides, so following a station never lands on a page of
  another kind.
- **/prices on a phone.** The «43 университета» cell had 74px for an 84px
  word; the three stat cells take 6px side padding below `sm`.

## One gutter, one title face, one button · 10 November 2026 (night, later)

Owner: «по всем неровностям… по всему сайту». Every public route and the
cabinet measured at 1440, 1024, 768 and 390: the left edge of the header
logo, the page title and the footer logo, the title face and scale, and the
primary buttons.

- **One gutter.** Content now starts where the header logo starts: 32px,
  and above 1280px the 1216px column ((100vw − 1216px) / 2); 24px from 768
  to 899px; 20px on a phone. Before, the footer sat on its own formula (24px
  at 1024, 24px on a phone), /universities and Modulo 1 used a 1200px column
  (8px inside the logo at 1440, 24px at 1024, 12–16px on a phone), the guide
  column kept 32px on tablets, /plan stood at 120 and 144px, and the legal,
  «Изменения 2026/27», /prices, payment and 404 sections kept 20px on
  tablets. Centred pages (/plan cover copy, /prices hero, payment, 404) keep
  their centred columns; the /plan cover stays almost full-width (8px) on a
  phone. The cabinet keeps its own aligned chrome (12px on a phone).
- **One title face.** Page titles on /privacy, /terms, «Изменения 2026/27»
  and 404 used `font-display` (Onest, the body face); they now use the
  display face like every other title. A guide step title was 56px in the
  text face because `.contentPage .main h1` outranked it; it now matches its
  topic title (clamp(30px, 3.6vw, 46px), display face), and topic, section
  and visa titles moved from 38px to the same scale.
- **One primary button.** «Назад / Далее» in the point switcher used 14px
  semibold next to the 15px medium purchase pill; both are 15px medium now,
  and the guide action pill no longer grows to 49px.
- **Path names** use the whole width of their stop, up to three lines, and
  break between words, not inside them.

## Light that never changes, drawn on a canvas · 11 November 2026

Owner, two screenshots (home and /plan): «здесь проблема в анимации в том,
что резко картинка светлеет, а на втором скрине — резко белое свечение
темнеет; исправь это раз и навсегда».

- **What it was.** The 9 November hold. Above the fold the scene first
  showed a flat «average colour» instead of the still, then the video faded
  in over 450 ms. Measured on the owner's screen (ASUS OLED laptop, AMD
  graphics, Chrome 157), in the same run and the same crop: the hold at
  Y 104, the scene at Y 116, so the picture brightened every time. On /plan
  the white veil under the title first lay on flat beige, so the glow
  darkened when the loggia arrived. The loops themselves are steady
  (Higgsfield ffmpeg, signalstats on the shipped files): largest
  frame-to-frame step 0.18/255, seams 0.02–0.11/255.
- **A measurement withdrawn.** An earlier reading in this session put the
  `<video>` 5–7 levels above the still. That comparison took the still in
  «меньше движения», where the hero has no 1.12 scroll scale, so the crops
  differed. Measured inside one window with the same crop, image, canvas
  and video agree within 0.3 (Y 114.7 / 114.6 / 114.9).
- **The rule now.** The still is on screen from the first paint, and a
  `<video>` is never on screen. `LivingLandscape` draws the loop's frames on
  a `<canvas>` over the still: the browser converts and colour-manages a
  canvas exactly like an image, with no hardware overlay or driver video
  processing in between, whatever the graphics card. The canvas appears with
  frame 0, which is the still (PSNR 36–41 dB on all four scenes), so the
  handover cannot be seen; then the loop plays. The video stays under the
  canvas, covered by it: an invisible (`opacity: 0`) video is refreshed only
  every 250 ms in Chrome and the canvas would stutter.
- **Before the still loads** the tile shows the still's average colour in
  linear light (the same amount of light as the picture): `#A66B4C` home,
  `#AF9782` /plan, `#AD8057` cabinet. It is seen only for the moment the
  WebP takes to arrive.
- «Меньше движения», Save-Data and no JavaScript see the still, as before.
  Offscreen the loop pauses on its current frame.

## Speed and safety pass · 11 November 2026 (evening)

Owner: «теперь максимально оптимизируй сайт и make sure что он безопасный».
Nothing here changes how a page looks; screenshots of the price lines are
byte-identical before and after.

Measured first (Lighthouse 12, phone, the live site): performance 77–90,
LCP 3.6–5.2 s. On the home page the hero picture took 3.3 s to download
because it shared the connection with six preloaded fonts, a seventh 88 KB
font and the hero video.

- **Fonts.** `subsets` in `layout.tsx` is the preload list, not the list of
  what exists. `cyrillic-ext` is not used by any text on the site, yet its
  two files (26 and 10 KB) were preloaded on every page; they now load only
  if such a letter appears. The «₸» sign sits in `latin-ext`, so one price
  pulled 88 KB of Inter Tight (28 KB of Onest in body text); `tenge.css`
  serves the same glyph from two files under 1 KB.
- **The loop waits for the page.** `LivingLandscape` requests its video
  after the `load` event, so it no longer competes with the scene's still.
  On a 2G connection there is no loop, as with Save-Data.
- **Browser cache.** `/_next/static/*` and `/fonts/*` are cached for a year
  (`immutable`): their names change with their content. Pictures and videos
  under `/illustrations` keep revalidating on purpose — they have been
  redrawn under the same name more than once. A file that should be cached
  for long needs a version in its name.
- **Headers.** A Content-Security-Policy (own origin plus the backend for
  requests; inline scripts stay allowed because the static export and the
  Netlify badge need them) and a Permissions-Policy. Checked on 19 pages in a
  browser with the badge script injected: no violations. The backend address
  in the policy must match `NEXT_PUBLIC_BACKEND_URL`.
- **Dependencies.** Next.js 16.3.4 → 16.4.6 (a critical advisory covered
  16.0.0–16.4.0) and `npm audit fix`. No critical or high findings remain;
  seven moderate ones are in the linter's tooling and never reach the site.
- **Checkout link.** The buy dialog follows the payment link only if it is
  `https:`.
- **Not fixed here, the owner's to do.** The backend does not answer
  `https://iitaly.net` (no `Access-Control-Allow-Origin`; it does answer
  `https://iitaly.netlify.app`), so on the main domain the cabinet by code,
  the document check, the assistant, analytics and payment are blocked by
  the browser. Railway needs `https://iitaly.net` and
  `https://www.iitaly.net` in `ALLOWED_ORIGINS` and
  `SITE_URL=https://iitaly.net`.

## Scripts that wait their turn · 12 November 2026

Owner: «Да, сделай» — to loading the chat and the scroll animation library
after the page, the second half of «максимально оптимизируй сайт». Nothing
looks different: the launcher is pixel-identical before and after the real
one takes over (checked on /, /prices and /guides).

Measured on the build (brotli, scripts referenced by the page's HTML):
home 254 → 160 KB, /prices 259 → 166, /plan 257 → 205, /guides 237 → 186,
/universities 241 → 186, the cabinet 301 → 249.

- **The chat arrives after the page.** `ChatWidget` sat in the root layout,
  so every page carried its 15 KB and the 36 KB `motion` library that only
  the chat and «Изменения 2026/27» use. `ChatMount` now renders the launcher
  as a plain button with the same classes (`launcherFace.ts`) and loads the
  chat after `load`, when the browser is idle — or at once on hover, focus,
  a click, or a page's request to open it. Context events sent before the
  chat exists (cabinet step, guide topic) and an early open request are kept
  and replayed once `ChatWidget` listens. `ChatWidget.tsx` is untouched.
- **gsap only where it runs.** `EditorialMotion` (home) and `HeadingPin`
  (/prices) import gsap and ScrollTrigger (39 KB) on demand: from 768px,
  without «меньше движения». A phone never downloads them.
- Anything new in the root layout is on every page. A component that most
  visitors never open should be loaded the same way.

## The cabinet's picture first, the carousel on demand · 12 November 2026

Owner: «Да, сделай» — a third speed pass, for the cabinet and the guides,
the two pages the first two passes helped least (Lighthouse, phone: the
cabinet 77 → 80 with LCP still 5.2 s, the guides 83 → 84). Nothing looks
different.

- **A claim withdrawn.** On 11 November the loop's `<video>` was left
  visible under the canvas, on the assumption that Chrome refreshes an
  invisible video only every 250 ms. Measured on 12 November: with
  `opacity: 0` the canvas still gets 29–30 new frames a second (home, /plan,
  cabinet). The visible video had a cost instead: in the cabinet the browser
  took it for the page's largest element, so LCP waited for the video to
  download. The video is now never painted; it is only the source of frames.
- **The cabinet's hero picture loads with the scripts, not after them.** The
  cabinet is drawn by JavaScript, so the browser learned about the picture
  only once the scripts had run (2.7 s of waiting on a simulated phone).
  `page.tsx` now preloads it; `app/portal/hero-image.ts` keeps the preload
  and the `<img>` on the same addresses and sizes.
- **The guides carousel.** All 13 tile pictures (about 365 KB) were fetched
  at once and competed with the first tile, the page's main picture on a
  phone. The first tile is high priority, the first four load at once, the
  rest when the carousel is scrolled toward them. Checked: four requests
  before any swipe, all thirteen after swiping to the end.
- **Left as is, measured.** The cabinet's feature scenes are 389 px wide on
  a phone and correctly take the 1024 px file on a 2–3× screen.

## A comparison you can read, a map with room · 12 November 2026

Owner, two screenshots of /universities: «сравнение выглядит не прям юзер
френдли, нужно это исправить»; «в целом здесь голова Веспи ни к чему будто,
можно его добавить, но не прям туда, и некоторые иконки слишком близко
стоят местами друг другу».

**Comparison.** The coloured poster cards stay; what got in the way of
comparing goes.
- The perspective arc (Fiddle reference, 27 Oct) tilted the side cards by
  16°, so the rows being compared were read at an angle. Cards stand straight.
- The huge code of the focused university and the «1 из 3» scale under the
  deck (150 px of decoration, mistaken for the selection count) are gone.
- Three 440 px dashed boxes with a non-clickable «Добавь университет» are
  gone. With nothing chosen there is one panel: Vespi holding a map, a line
  of what to do, three quick-add buttons (the same popular three as above
  the map) and «Сравнить все три сразу». With one or two chosen, a single
  «add another» place as tall as its content, with the remaining quick adds.
- «Выбрано 0 из 3» and the view switch are hidden until there is something
  to compare; «Сетка» is now «Карточки»; the table needs two universities.
- The poster is 200 px instead of 310: a card with its choose button fits a
  laptop screen (card 845 → 690 px at 1440).
- On a phone two cards stand side by side and the third scrolls in; before,
  one card filled the width and comparing meant remembering.

**Map.** City coordinates and the outline of Italy are untouched; pin sizes
change. Measured with real label boxes, idle and with each of the 30 cities
selected: 138 overlaps on the live map (pins touching even when idle —
Pavia/Milan, Padua/Venice, Ferrara/Bologna, Salerno/Naples — the selected pin
covering neighbours by 3–7 units, labels on pins), 0 now.
- Pins 9.5 (cities with several universities) and 4.5, at least 4 units
  apart; the selected pin is 11 and drawn last; its close neighbours shrink
  to a dot while it is selected. Tap circles stay generous (up to 12).
- Label width model 6.1 → 7.6 per letter, measured with getBBox.
- Vespi no longer peeks over the Ionian corner of the map; he holds the map
  in the empty comparison instead.
- `design-university-review` now fails if pins or labels crowd again.

## Wide screens and narrow ones: a site-wide evenness pass · 12 November 2026

Owner, screenshot of the home page on a wide monitor: «ну это уже совсем не
серьезно, пройдись по всему сайту и убирай неровности».

Every check so far ran at 1440 and below; the owner's screen (3840 px at
200 %, browser zoomed out) gives the site a window over 1900 px. Audited 19
pages at 320, 390, 768, 1024, 1280, 1440, 1920 and 2560 in a browser: page
scrolling sideways, text outside its box or the screen, framed panels
narrower than their text, buttons wrapping into three lines, tap targets.

- **Home hero.** The panel column was capped at 580 px while the right
  gutter grew with the screen, so the panel was 524 px at 1280, 444 at
  1440, 204 at 1920 and 80 at 2560: the title spilled out, the buttons
  broke into three lines. The column is now panel + 24 + gutter, and the
  panel is 460 px at every width. From 1920 the scene grows in height with
  the width (37.5vw), so a 2560 screen crops it like 1920 does instead of
  cutting off Vespi's helmet.
- **320 px.** /privacy, /terms and 404 titles scale down (clamp 28–36 px):
  «конфиденциальности» pushed the page 20 px sideways. The Modulo 1
  trainer's «Инструменты» moves to its own line and its panel opens from
  the left edge (it scrolled the page and then opened off screen). The
  /prices stats columns are never narrower than their word (73/82/73 px at
  320, equal from 390); a soft hyphen was tried first and dropped — it
  changes the text, which design-content guards.
- **Cabinet.** The scenery after the last step of the stage in focus stuck
  50–60 px out of the stage's band at every width; the band now leaves room.
- **Footer.** «Условия сервиса» and «Политика конфиденциальности» are 44 px
  tall on phones (were 21).
- **Left as they are, measured.** Long answer tiles on /plan and the
  optional service on /prices wrap by design; Modulo 1 paper fields are a
  replica of the form; the guides road at 320 px overflows its own column
  by 6 px into empty space without touching anything.
- `design-accents-review` now also opens the home page at 1920 and 2560.
- `design-review` compares the map against `main`; for the approved
  pin-spacing revision it holds the outline, every city centre, name and
  button exact and lets only pin sizes and label positions differ.

## Less for free, so that people buy · 12 November 2026

Owner: «мы даём слишком много информации бесплатно… надо продумать
restriction, где именно сколько дать информации, чтобы люди уже брали и
покупали»; then «Да, делай» to the plan below.

**First, found on the way:** on iitaly.net nobody could buy at all. The
backend answers only `https://iitaly.netlify.app` (no
`Access-Control-Allow-Origin` for `https://iitaly.net`), so the browser
blocks the purchase, the cabinet login and the chat on the main domain.
Fixed only on Railway (`ALLOWED_ORIGINS`, `SITE_URL`); no wall can sell
until then.

**What was free.** The chat: 10 questions per tab, and leaving a phone
number lifted the limit for good, so the chat answered everything the
guides close. 17 of 41 guide steps and 6 of 18 visa points in full — the
«how to do it» itself. The free document check with every fix. The
document checklist with explanations on /plan.

**The rule now:** free is understanding what to do and whether you can;
paid is how exactly, in your case, by which date, with a check.
- Chat: 3 questions per device (localStorage); then the purchase wall in
  the chat. A phone number can still be left, it no longer unlocks.
- Document check: the verdict and the list of problems stay; «Что делать»
  and «Что дальше» are behind a wall that counts the problems.
- /plan: document names stay, their explanations open with the route.
- Guides: every step shows its title and first sentence, styled as the
  first point of an open step; the rest are grey lines and a wall that
  says how many points are left. A single-sentence step shows only its
  title (its one sentence is the whole answer). «Codice fiscale» is open in
  full as a sample. Visa: facts and the funds calculator open; every point
  shows its title and first sentence.
- Captions say what is open when nothing opens in full («у каждого шага
  открыта первая фраза»), not «открыто 0».
- Every new wall is the same purchase (`useWallPurchase`), with new
  analytics places `chat` and `document-fixes`.

## Bento for spheres, guides and the visa · 12 November 2026

Owner, with a Lamossa Studio screenshot from godly.design: «информацию в
личных кабинетах по конкретным сферам и в гайдах и визе нужно подавать в
такой вот форме … так намного лучше смотрится»; then «Да, делай бенто».

**The form, taken from the reference:** a light tray with a 32px radius;
inside, white cells of different sizes (24px radius). Every cell has a dark
pill icon on top and its value, label and note anchored to the bottom. One
cell is the action, with a dot texture fading from its corner. One wide
cell carries a list (the reference's awards; here the official sources or
the steps of a stage).

**Where:** `src/components/ui/Bento.tsx` + `bento.module.css`, used by
- the guide topic overview (`GuideOverview.tsx`): four facts, the next
  action, the official sources and the note. The same texts that stood in
  a column under the road; the action now stands above the steps;
- the visa overview: the three key facts, the official VFS link, the funds
  calculator as the action, sources and the note;
- the cabinet stage page (`PortalFocus.tsx`): the stage scene, the stage
  cell (steps done, title, the one-line description), the current step —
  unchanged inside its cell, with its pips and Back / Next — all steps of
  the stage as a list, and the document check when the stage has
  documents.

**The grid is measured on the tray, not the window** (container queries):
under 560px one column, up to 900px six, wider twelve. The caller gives
every cell its span at each width, so no grid has a hole: with the action,
facts go three in a row and the fourth sits beside the wide action; the
sources and the note mirror that row. Without an action the facts go two
by two. On a phone the facts become rows (icon left, text right).

Colours are the site's own: tray `#EFE9DF`, cells `#FFFDF9`, dark icon
`#1F1A17`; the cabinet passes its beige, card and ink tokens through
`--bento-*`. Icons are lucide, the family the site already uses.

### The boundary is visible before the wall · 12 November 2026

Owner: «я все еще не вижу дозирования контента по платной/бесплатной
основе». The walls worked, but only inside a step: the topic and visa
overviews and the guides road showed no difference between free and paid.

- Every topic and the visa overview carry a «Бесплатно / С маршрутом» cell:
  left, what is open now (the first sentence of each point; the whole
  sample topic; the visa facts and calculator); right, what the route
  opens; the same purchase as the step wall. On a paid device the cell
  says why everything is open.
- On `/guides` and the section pages a topic whose steps are all closed
  carries a lock, and its model beside the road is the grey copy. The
  topic page still opens. «Начни здесь» stands on the first place a guest
  can read (the visa calculator).

## The first five guides free, and one design code · 12 November 2026 (evening)

Owner, with three screenshots (/guides in incognito, the document check
saying it is unavailable, the program list open on /plan): «в гайдах и
везде сделай бесплатными вот эти вот только первые 4, возможно, 5 гайдов
и виз, и потом дальше типа скажи, а вот дальше плати… проверка
документов должна быть за деньги, но хотя бы одну бесплатную попытку
давай всем… сделай так, чтобы на всём сайте был такой общий дизайн-код,
потому что иногда он слишком квадратный, иногда слишком круглый… шрифт
другой».

**Guides.** The first five topics on the band and the road are open in
full: education, tests, apostille, translation, DoV/CIMEA. The other eight
and every visa point show only titles; the visa facts and the funds
calculator stay open. Every card on the band says «Бесплатно» or «С
маршрутом»; the road locks the paid topics; each overview says what is
free and what the route opens. The first-sentence teaser of the afternoon
is gone: after the free five, the answer is «дальше — с маршрутом».

**The document check.** It was not closed by payment: the backend still
does not answer https://iitaly.net (CORS), so nobody on the main domain
reaches the one free check. The unavailable state now says so: «Это не
связано с оплатой: одна проверка бесплатна для всех».

**The design code, measured first** (every page at 1440 and 390):

- Three faces were in use: SF Pro / Inter Tight on most text, Onest on
  163 text nodes (bento labels, wall buttons, the road heading, the
  compare buttons, most of the Modulo 1 trainer), Inter Tight in the
  cabinet. On Windows the owner saw Inter Tight next to Onest. Inside the
  page surface `--font-sans`, `--font-display` and `--font-mono` now lead
  to the Apple stack (`marketing.module.css`), so every component that
  asked for «the sans» gets the same face. The universities map keeps
  Onest: its label widths are measured for it.
- Radii had 20 values. The scale now: 999px for every button, toggle and
  chip; 16px for fields and small inner boxes; 20px for inner cards,
  walls and bento cells; 28px for cards and sections (24px on phones).
  0px stays only on list rows and the paper form's own fields.
- The square fields on /plan were a bug: `rounded-apple-input` named a
  token that does not exist, so the selects, the walled box and the
  result got no radius at all. The unavailable notice had none either.
- The cabinet's buttons were 12px rectangles while the rest of the site
  used pills; the trainer used 6–10px. Both now follow the scale.
- The program list used `<optgroup>`: Windows draws its label in bold and
  indents the options, which is the uneven text in the screenshot. The
  options are one flat list now (on /plan and in the cabinet).

## Around the backend's CORS · 12 November 2026 (night)

Owner: «Сделай обход» — to making the document check, sign-in and chat work
on iitaly.net without waiting for the Railway setting.

- The backend answers CORS only for https://iitaly.netlify.app; it still
  processes every request, the browser just hides the answer from
  iitaly.net. On iitaly.net the site now calls its own `/backend/*`, which
  Netlify proxies to Railway (a 200 rewrite): same origin, no CORS.
- Netlify cuts a proxied request at 26 seconds. Measured on the live
  backend with synthetic, personal-data-free documents: a text check 6.9 s,
  a photographed certificate 11.3 s. Photos are already reduced to
  1600 px before sending; a 504 or 413 from the proxy now has its own
  plain message (try again / split the PDF).
- After Stripe the backend sends the buyer to its SITE_URL, still
  iitaly.netlify.app, while the order number sits in the iitaly.net tab.
  iitaly.netlify.app now redirects to iitaly.net (301), so the buyer lands
  where the order is. Deploy previews are untouched.
- Elsewhere (previews, local reviews) the site still calls the backend
  directly. When Railway lists https://iitaly.net in ALLOWED_ORIGINS and
  SITE_URL points to it, both rules and the branch in backend.ts can go.

## Objects as photographs · 13 November 2026

Owner, with the guides band: «чуточку реалистичнее было бы хорошо». The 19
objects shared by the guides, /plan, the visa pages and the home banner were
re-rendered with Higgsfield (gpt_image_2_6) using each 9 November object as
the image reference: the same object, view, framing and palette, now with
real materials — leather grain and stitching, milled coin edges, wood grain,
paper fibres, uneven ink. Same 480×H frames, so nothing moves; the quiet
folder is recomputed at 30% saturation. Provenance:
`design/illustrations/objects-2026-11-13.json`.

After the first pass the owner wrote «по иконкам не вижу разницы»: with the
old object as the image reference the model kept its look, so the change was
invisible at tile size. The set is now generated from text only, as studio
photographs of the same subjects in the same palette — real proportions,
worn cloth, leather, crumpled paper. Lesson: a reference image locks the
style; to change the style, describe the object and leave the reference out.

## Vespi holds up Pisa · 13 November 2026

Owner, with the cabinet road at the Pisa model: «вот здесь сделай ещё Веспи,
который подпирает пизанскую башню». On the cabinet road the Pisa slot now
shows the same diorama with Vespi pressing both arms against the leaning side
(the side the tower falls to — the other variant pushed it over). Bologna moves
before the espresso so no three Vespi pieces stand in a row; the guides road
keeps the plain Pisa. Found on the way: a piece at the very last step of the
road ran past the bottom of the card; the last stage now leaves the same room
under it as the stage in focus.

## The document check comes first · 14 November 2026

Owner: «проверка документов — это такая киллер-фича… в любое время суток, в
неограниченное количество… надо нести в лендинг и потом промоутить по цене».
On the home page it now follows the hero directly; /prices shows the same
block, without the button, before the package
(`src/components/home/DocumentCheckFeature.tsx`). One bento: four facts
(speed, any hour, no limit with the route, item by item), a three-row
comparison with an agency, and one cell with the free check. On phones each
comparison row stacks, with «Агентство:» and «IITALY:» in front.

Only what is true goes on it. The time is measured (12 November, live server:
text 7 s, photo 11 s; PDFs take longer), so «обычно 10–30 секунд». «Без
лимита» is with the route; before paying there is one check. «Никогда не
ошибается» and «надёжнее» are left out: the AI can make mistakes and the
university decides, as the rest of the site says. The agency column describes
how the work is organised — the manager's hours, waiting again after a fix, a
separate contract — with no other firm's deadlines.

Later the same day the owner confirmed the agency price for the «Сколько
стоит» row («Да, добавь»): «Сопровождение — обычно 650 000–1 000 000 ₸», the
range he has named since the start (NEXT_CHAT.md). It sits under the contract
line rather than replacing it, because design-content checks that every
earlier line of copy is still on the page.

On 15 November the owner set a new range («сделай новый диапазон 500 000 —
миллион»). The row now reads «Сопровождение — обычно 500 000–1 000 000 ₸»;
the swap is listed among the approved copy changes in
`scripts/design-content.mjs`.

## After the UX audit: the first question, touch hover, the chat button · 14 November 2026

Owner, after the uxaudit pass (`docs/ux-audit/2026-11-14/`): «поправь
элементы именно с дизайном, а оплата работает, не переживай», then «и в
целом исправь все неточности, потом прогони ещё раз, чтобы наверняка».
Measured on a 390 px phone, before → after:

- **«Составить план» opens on the question.** Every action that starts the
  plan (home hero, the home scene card, «Проверить шансы» on /prices, «Подобрать
  по моей ситуации» on /universities, 404, the rules page) now goes to
  `/plan#questionnaire`, the anchor the page already had. The first question
  was at 980 px, under the loggia cover; it is now at 218 px with the first
  answer on screen (1024 and 768: 213 px). The cover stays for anyone who
  opens /plan from the menu; «Мой план» in the header and footer still goes to
  /plan, because it names a page, not an action.
- **Hover only with a mouse, everywhere.** On a phone a tap leaves :hover on
  the element, so on the next question the option under the finger was filled
  like a chosen one (the audit's «предвыбранные ответы»). This guide already
  said hover only under `(hover: hover) and (pointer: fine)`; 134 selectors in
  42 CSS modules did not follow it. `scripts/guard-hover.mjs` moved each into
  that media block in place, so the cascade order holds; a selector shared
  with the chosen state (`.option:hover, .option[aria-pressed=true]`) is split
  so the chosen state still shows on touch. `globals.css` is untouched.
  `node scripts/guard-hover.mjs --check` lists any new unguarded :hover.
  Measured: the option under the finger on question 2 is transparent on touch;
  with a mouse the hover still fills it (rgb(184, 58, 39)).
- **The chat button yields to the price and the next step.** It already slid
  away from anything marked `data-fab-yield`; the /prices comparison cards,
  the guide step's «Назад / Дальше» pager and the city shortcut on
  /universities were not marked, so the pill lay on «10 990 ₸ открывает…» and
  the round button on «Дальше · Подача». They are marked now.

The same pass fixed two pieces of copy the owner allowed with «исправь все
неточности»: /universities spoke to the reader as «вы» («Кликните», «Выберите
город», «Нажмите») on a site that says «ты» everywhere — now «Нажми», «Выбери»;
and the plan result said «дальше на этой странице» right above «Открыть мой
план», so people scrolled into empty space — now «откроются по кнопке ниже».
The cabinet login gains «Не помню код — написать в WhatsApp» next to «Ещё нет
кода? Посмотреть тарифы», which was the only way out and read as «pay again».

Left as they were, on purpose: the cabinet greeting («Привет!», 19 px) and its
15 px rubric are the cabinet's quiet header, not a hierarchy error; marking a
visa document as collected stays possible on a locked point, because its title
is visible; the «iltaly» reading of the wordmark is the owner's call.

The re-run the owner asked for («прогони ещё раз, чтобы наверняка») — the
uxaudit catalog on the fixed build and two fresh judges that saw only the
screenshots — found three more, all fixed the same day:

- **«Проверить документ» landed on the cover.** From the home page the link
  goes to `/plan#document-check`, but that block is hidden until the client
  reads the hash, so on a client-side navigation the browser had nothing to
  scroll to: the page stayed at the top for two seconds and longer, with the
  uploader 866 px down. `PlanExplorer` now brings the document tool into view
  once it is shown for that hash: at 0.6 s the page is on the check (measured).
  The menu's «Мой план» in the header and footer now goes to
  `/plan#questionnaire` as well, and the header still marks it current on
  /plan; the cover is left for /plan typed by hand.
- **The chat button lay on an answer.** The questionnaire card is marked
  `data-fab-yield`, so the button steps aside while the visitor answers.
- **«Твой план сохранён на этом устройстве» before any plan.** The cabinet's
  local status said so before the questionnaire was filled; until then it now
  reads «Прогресс сохраняется на этом устройстве».

## Plain words on the public pages, and «с маршрутом» instead of «закрыт» · 14 November 2026

Owner: «дай тогда расшифровку терминам… а пометка „закрыт“ исправь». Both
audit judges stopped on DSU, ISEE, CIMEA, DoV, permesso on the public pages,
while the cabinet already explained them in plain words (`plainWords.ts`).
The public pages now use the same glossary, so one word never gets two
explanations (`src/components/ui/PlainTerms.tsx`):

- **The questionnaire** shows one or two plain lines under the answers for
  the words of that question (the budget question: «DSU — стипендия от
  региона Италии…»), in the cabinet's footnote voice: a thin rule on the
  left, the word in bold, one line; a light version on the dark cards.
- **The open plan step** gets the same footnotes for its words (11 классов,
  Foundation, DoV, CIMEA, апостиль…).
- **The home hero** keeps its first screen short: «DSU» carries a small «i»
  (kept on the same line as the word); a tap shows one line in a card at the
  bottom of the screen, above the chat button, with a close button and
  Escape. The card is rendered into <body>: inside the hero it sat in the
  hero's own layer, under the next section (measured).

A locked plan step read «· закрыт» right next to «Открыть шаг» / «Открыт»,
which the judges read as «already done or paid?». It now reads «· (lock) с
маршрутом», the same words as the guides band, in the tile label and in the
step's «Шаг N из M».

## The map first on phones, with «Крупнее» · 14 November 2026

Owner: «начать с Рима — хуйня, убирай… я не хочу список, я хочу именно
карту… для телефонов просто нужно сделать чуть другую структуру именно той
страницы, сделать карту побольше… или сделать upscale на карте».

Measured on a 390 px phone, before → after:

- **The map comes first.** It sat under the navigator card, the filters and
  the «В сравнение» chips, its top at 1063 px (the third screen). Under 768 px
  the explorer is a column with the map grid first: the map's top is at 344 px,
  right under the title, edge to edge (390 × 483 instead of 350 × 433). The
  filters, «Сразу к городу» and the quick chips follow it. Desktop is as it was.
- **«Крупнее» / «Вся карта».** A pill in the map's top-left corner (phones
  only) widens the map 1.8× inside its own frame (702 × 869 in a 390 × 600
  window) that the finger pans; it opens on the north — Milan, Turin, Venice,
  Bologna — where the dots used to touch. Pins keep working while zoomed
  (tapping Milan opens Milan). Only the frame changes: ItalyMap.tsx, its
  geometry and its pins are untouched, as design-guard requires.
- The chat button yields to the map (`data-fab-yield`).
- **«Начать с Рима» is gone** from the empty city panel; «Выбери город» and its
  line stay. design-comparison-review chose Rome with that button; it now
  chooses Rome through «Сразу к городу» and checks the same panel.
- The new order is for the public /universities page only. In the cabinet's
  shortlist picker «Сразу к городу» stays first, above the sticky «Сохранить»
  (design-portal-university-selection-review checks that the first city
  choice is visible on a 390 px screen).

## The audit's items 5–9: the first question, one «Сравнить», short topics, the cabinet header · 14 November 2026

Owner: «Так, выполняй все пункты с 5 по 9» (the list from the UX audit).

- **5 · «Осенью 2027» or «В 2026/27».** The options read as the same thing
  to a school student. Under the answers of the first question there is one
  line: «Учебный год в Италии начинается осенью. «Осенью 2027» — набор
  2027/28, к нему готовятся сейчас. «В 2026/27» — учебный год, который уже
  идёт: проверим, куда ещё можно успеть.» The options, the hint and
  QUESTION_CONTEXT are unchanged (wizard.ts is byte-checked).
- **6 · One «Сравнить».** A red «Сравнить 1 из 3» link (active-looking) and a
  grey disabled «Сравнить» in the bottom bar were two controls in two states.
  The link went with the quick chips (item 9). The bar's button shows only
  when it works (two or more universities); with one, the bar says «Добавь ещё
  один вуз». The third pick scrolls to the cards themselves
  (`[data-comparison-results]`), not to the selectors above them.
- **7 · A topic of one-sentence steps.** In the free topics every step is
  31–131 characters, and «Шаг 1 из 4» for one phrase made a reader tap four
  pages for a paragraph. The overview of a free topic now has «Вся тема
  коротко»: the numbered points with their text on one screen. The road
  («Разбор по шагам») stays below for those who keep track. Paid topics are
  unchanged: their closed text never reaches the HTML.
- **8 · The cabinet header.** On a phone «Помощник», «Документы» and
  «Настройки» were bare icons. Each now has its caption under the icon (11 px;
  10 px on 360 px Android phones, like a phone tab bar). Below 360 px the three
  captions and «Меню» do not fit beside the logo, so there the icons fall back
  to aria-label and title, as before. The road counter before the
  questionnaire said «Сделано 0 из 2 шагов» beside a long road of locked
  stages; it now says «Сделано 0 из 2 шагов первого этапа · остальные
  откроются после анкеты».
- **9 · One action under the map.** «Подобрать по моей ситуации», «Подобрать
  город под ритм» and the quick «В сравнение» chips were three ways to pick.
  «Подобрать город под ритм» stays, because it works on the map itself; a
  university joins the comparison from its city card.
  design-flight-explorers-review picked through the chips; it now opens Padua,
  Bologna and Milan through «Сразу к городу» and ticks «Сравнить» on each card.

## A larger map on desktop, a ride without a jump · 15 November 2026

Owner, two screenshots. /universities on a large monitor: «здесь в целом
сделать нужно большую карту, слишком всё dense и сложно кликать в нужную
точку». /portal: «ещё вот здесь анимация такая, лагучая… по тому же принципу,
чтобы всё ровненько, стык был ровный».

- **The map.** On every desktop width the map is 669 × 829 px (scale 1.6 of
  the 420 × 520 drawing): Italy is tall, so the screen's height, not the
  column, sets its size, and in the north pins sit 16–24 px apart. The
  phone's «Крупнее» now works on desktop too: the map doubles inside the same
  frame (pins 32–48 px apart), the mouse drags it, the wheel and trackpad
  scroll it, and it opens on the north. A press that moves less than 5 px is
  still a click on a city; a real drag never selects one. The frame keeps its
  size, so nothing around it jumps. ItalyMap.tsx (geometry, pins, labels) is
  untouched.
- **The ride.** Measured on the shipped loop: at the loop point Vespi jumped
  forward (the last-to-first step 2.20/255 against 0.6–0.9 around it — about
  six frames of the ride were cut on 7 November with the braking stop), and
  frame 0, which is also the poster, showed Vespi doubled from the old
  ease-in. On top of that, Chrome drops one frame whenever a looping video
  restarts (67–83 ms on the canvas), and a compressed loop's first frame is
  sharper than its last, so the restart shimmers.
  - Six motion-compensated frames now bridge the old end to the clean
    frame 1 (step 0.54), so Vespi rides through without a jump.
  - The loop restarts on the empty road, after Vespi has gone (step 0.014):
    the dropped frame and the shimmer land where nothing moves. One keyframe
    only, at that restart — a keyframe mid-ride made its own pop.
  - The poster (Vespi on the road) is frame 133 of the new loop;
    `LivingLandscape startAt` seeks there before the canvas appears, so the
    handover stays invisible. Still areas match the old poster within
    0.33/255; sizes and bitrates are the old ones.
  - Passport: design/illustrations/motion-2026-11-15.json.

## A map that changes smoothly, a ride at one speed, a calmer plan · 17 November 2026

Owner, 16 Nov. /universities: «и здесь нужна нормальная анимация, не ровно
как то». /portal: «и здесь всё ещё есть проблема, в чате уже было скинуто, как
оно чинится». /prices: «нужен ли здесь дубляж». /plan: «не нагружает ли это
пользователя, вот эти пространства странноватые».

- **The map.** Choosing a city used to swap everything in one frame: the pin
  jumped from 4.5 to 11, a neighbour lost its drawing, labels leapt to new
  places. Now the new state appears over the old one, transform and opacity
  only (`university-ui.module.css`, `.map*`):
  - the chosen pin grows from its old size to 11 (320 ms,
    `cubic-bezier(.22,1,.36,1)`) while it fades in (160 ms);
  - the old state — the dark pin, a neighbour's drawing — is drawn once more
    as an aria-hidden ghost under the cities and shrinks toward the new size
    as it fades, so a neighbour visibly folds into a dot;
  - a label that keeps its anchor slides to its new place; one that changes
    side, or appears, fades in 80 ms later while the old one fades out.
  - Pin sizes, label placement, coordinates, roles and handlers are the same;
    `prefers-reduced-motion` stops it all through the global rule.
  - The city panel under the map enters like the site's cards: up 8 px with
    a fade, 320 ms, on every change of city but not on load.
- **The ride.** The 7 November rule is a steady speed, and the seam fix of
  15 November kept the old clip's braking: tracking the red helmet, Vespi
  rode at 5–6 px a frame, slowed to 1–1.7 over half a second, then shot off
  at 7.5. That stretch (old frames 72–158) is retimed to an even 5.6 → 7.3,
  59 frames instead of 86. Each frame is interpolated at its exact time, not
  rounded to a grid, so the speed does not flutter. The wrap on the empty
  road is unchanged; the loop is now 10.97 s, the poster is frame 110 at the
  old poster's spot. Passport: design/illustrations/motion-2026-11-17.json.
- **/prices.** «Живой человек» stood three times in a row: at the end of
  «Что система делает сама» («…это отдельная услуга ниже»), in the heading,
  and in the line under it. The pointer sentence is gone; the line under the
  heading now says «По желанию, в 10 990 ₸ не входит», so the 16 900 ₸ card
  no longer reads as a hidden surcharge after «Без доплат».
- **The opened plan step.** The title sat beside a 96 px picture with an
  empty band under it, then a lone «Шаг 1 из 12», then text in three widths
  (666, 1096, 1096 px). The position now sits in the label («Образование ·
  шаг 1 из 12»; the status line stays for screen readers), the picture keeps
  its column at the top right, and the description starts 16 px under the
  title in one column of at most 680 px. Phones keep the full width; the
  picture there is 72 px, as in the closed tiles.

## Scenes that move at once, no icon capsules, a roomier cabinet header · 17 November 2026

Owner, phone screenshots: «Есть всё ещё проблема того, что анимации идут не
сразу и какое-то время просто стоят, затем вот эти иконки довольно
странные, убери иконки, это показатель ИИ-слопа… иногда меню в личном
кабинете на телефоне выглядит сжатым».

- **Loops start at once and do not stand.** Measured on a phone emulation:
  the scenes began to move 1.3–2.5 s after opening, because each video was
  asked for only after the page's `load`, and inside the loops the Tuscan
  ride stood 4.5 s per lap (empty road, then Vespi tiny in the distance),
  the loggia on /plan began where Vespi barely moves and turned the page only
  at 3.7 s. Now:
  - the video is requested as soon as its own scene image has arrived; if
    iOS refuses autoplay, the loop starts on the first touch;
  - the ride's empty stretch passes up to 3.8× faster with smooth ramps (the
    ride itself untouched): 8.4 s per lap, the longest near-still run 1.6 s;
  - the loggia, the café and the belvedere start right before their first
    movement (frames 104, 24, 18); each poster is that frame, so the
    handover from picture to loop stays invisible.
  - Passport: design/illustrations/motion-2026-11-17-starts.json.
- **No icon capsules.** The dark pill with a line icon on top of every bento
  cell (home «Проверка документов», guides, visa, cabinet stages) and the
  lock circles in «Бесплатно / С маршрутом» are gone: a cell is carried by
  its number and words. Where a cell leads elsewhere, an arrow stays in its
  corner — the way Apple marks a branch (› for a page inside, ↗ for an
  outside link), not a picture per block.
- **Cabinet header on phones.** Logo, three icon-over-caption buttons at
  10–11 px and «Меню +» shared one row of a 390 px screen. Under 600 px the
  three actions now take their own row under the logo: equal thirds, words at
  14 px, no icons.

## Icons in authentic Roman mosaic, on guides and visa · 17 November 2026

Owner, step by step: «давай сделаем их в стиле той мозаики» (the pietra dura
of the Instagram highlight covers); «только на гайдах и визе»; «оставь только
мозаичную структуру и сами элементы без кружков, а то кружки ассоциируются с
ИИ-слопом»; with two photos of Italian floor mosaics, «Сделай их реально
похожими на мозаику»; then «Дизайн слишком какой-то детский, а здесь уже в
иконках ставим на аутентичность. Всё ещё слишком мультяшные».

- **What they are.** Fragments of an authentic Roman mosaic, as in Pompeii or
  Ravenna: hundreds of small irregular tesserae of natural stone (travertine,
  Siena ochre, umber, burnt sienna, verde antico) and a few gold smalti on the
  highlights; each object in realistic proportions, modelled with tones of
  tesserae, matte and slightly worn; no black cartoon outline, only a thin
  umber line where a mosaicist would set one. Two or three rows of ivory
  ground follow the object and stop in a ragged edge, as if the piece was
  lifted from a floor. No disc, no ring; the wind rose follows its own points
  instead of a round field.
- **The objects lean old:** a pocket watch, Roman gold coins, a parchment
  calendar page, an unrolled scroll with ticks, a wind rose, a manicule, a
  brass padlock (guides); coins, a wax seal, an hourglass in turned wood, a
  temple front, a wooden counting frame (visa).
- **Where — guides and visa only.** The home page and the cabinet keep their
  cells without icons.
- **How.** `MosaicIcon` (`src/components/icons/MosaicIcon.tsx`), 60 px, 48 px
  in the phone rows; WebP 112 and 224 px; Higgsfield gpt_image_2_6. Earlier
  versions stay as masters in design/illustrations/source/mosaic/: round
  medallions (`*-medallion`), smooth inlaid stone (`*-stone`) and chunky
  outlined tesserae (`*-tessera`). The owner's photos were not uploaded; the
  style is described in words.
- Manifest: design/illustrations/mosaic-icons-2026-11-17.json.

## Icons as Galleria floor cartouches, on guides and visa · 18 November 2026

The Roman fragments did not last: «Слишком косит под старинность, не
аутентично, сделай 10 вариантов». Of ten directions the owner took the floor of
the Galleria Vittorio Emanuele II, but not as a single object in mosaic skin:
«всё ещё напоминает очень сильно этот, просто как эмодзи… чтобы он и по
структуре своей был другим». Four rounds of ten structures followed («1 и 4
нравятся», «3, 7, 9 классные», «3, 4 и 8 нравится»), and the choice was
«Вставь седьмой вариант в сайт».

- **What they are.** A Baroque strapwork cartouche laid in polished marble
  tesserae, seen straight from above: a cream ground in rows, edges curling
  out into slate-blue scrolled straps with small leaf-green sprigs, a
  terracotta and ochre scallop shell on top. The object in the middle is a flat
  symmetrical emblem, part of the ornament, not a standalone 3D thing. No
  square tile, no disc.
- **Palette of the Galleria floor:** cream, warm ochre, terracotta, slate blue,
  a little leaf green.
- **The emblems:** a clock dial, three coins with stars, a calendar tablet with
  a ribbon tab, a scroll with ticks, a wind rose, a quill in an inkwell, an open
  padlock (guides); coins, a wax seal with ribbons, an hourglass, a temple
  front, a counting frame (visa). A calendar page, a document sheet and a
  pointing hand were tried first and dropped: they read as an app icon and an
  emoji.
- **Where and how** stay as before: guides and visa only, `MosaicIcon`, 60 px
  (48 px in phone rows), WebP 112 and 224 px, Higgsfield gpt_image_2_6; later
  icons used two finished ones as references so the cartouche matches. The
  Roman fragments stay as masters (`*-roman`) next to the earlier versions.
- Manifest: design/illustrations/mosaic-icons-2026-11-18.json.

## One large cartouche per topic, no small icons · 19 November 2026

The icons were the wrong target. With a phone screenshot of the visa page
showing the burgundy notebook in its header, the owner wrote: «Надо было
заменить вот это блокнот, он как раз так и проблематичен». Two more notes
followed:

- on the first take: «Почему это отличается от вариантов которые ты делал
  до этого и которые я одобрил»;
- on the small cartouches in the overview cells: «Убери эти мелкие гербы,
  они тут ни к чему, везде применяй этот принцип».

- **One picture per topic, and it is large.**
  - Each topic has one Baroque cartouche from the Galleria floor, in the
    place of the object. It shows in the guide header, the catalogue tile,
    the step page and the visa point switcher.
  - The overview cells have no icons at all. `MosaicIcon` and
    `public/illustrations/mosaic` are gone; the icon masters stay in
    design/illustrations/source/mosaic/.
  - The road thumbs (56 px) keep the shared objects, as in the cabinet.
- **Faithful to variant 7.**
  - Every cartouche is drawn anew, with its own outline, rich strapwork
    (slate blue with ochre and terracotta bands), acanthus and the shell.
  - The emblem is classical and laid in the same tesserae, flat and matte.
  - Higgsfield got the three original variant 7 images as style references.
    The first take had copied one later icon as a template and put app-like
    pictograms (a folder, sheets with arrows) in the middle; it was never
    published.
- **Emblems.**
  - Topics:
    - school leaving certificate: a diploma scroll;
    - tests: an open book;
    - apostille: a wax seal with ribbons;
    - translation: two scrolls with crossed quills;
    - CIMEA: tied papers;
    - family documents: a small house on papers;
    - ISEE: coins with stars;
    - visa: a passport booklet;
    - under 18: a signed scroll with a quill;
    - military: a shield with crossed swords;
    - permesso: crossed keys;
    - codice fiscale: a sealed tablet;
    - insurance: a shield with a cross.
  - The visa switcher also uses a clock face, a graduation cap on a book and
    a sealed letter.
- **Only guides and visa.** The home page, the cabinet and the plan keep the
  shared object set (`objectFrame`). The guides use `cartoucheFrame` in
  `src/components/guides/guideArt.ts`: square, 480 px with a 240 px copy.
- Manifest: design/illustrations/cartouche-2026-11-19.json.

## Sharper topic cartouches and a finished guide road · 19 November 2026

Notes from the owner, on phone screenshots of the catalogue tiles, a guide
road and the document check:

- **Cartouches.**
  - Visa D: first «флаг конкретный Казахстана», then «изобрази именно что
    паспорт Казахстана». The emblem is the Kazakhstan passport: navy cover
    with the golden state emblem and the chip symbol, no writing. The same
    picture serves the visa point about the passport.
  - DSU and ISEEU: the coins looked «слишком по-яичному» («более
    утончённым»), then «отчекань на монетах самого Веспи». Vespi is minted
    on one large thin coin with a laurel rim, with two coins behind it.
  - Family documents: the two «странные» columns, then «справки о семье
    переработай». The emblem is an oval cameo with the profiles of a family
    over a sealed certificate.
- **Permesso di soggiorno.** «Сделай иконку пластиковой карточки пермессо с
  фоткой Веспи». The cartouche shows the plastic residence permit card with
  Vespi's portrait, a chip and the emblem of the Italian Republic, no
  writing. The crossed keys stay with the visa points about housing.
- **Home, «После визы путь продолжается».** «Замени иконки… тоже»: the three
  cards (permesso, codice fiscale, insurance) show the same cartouches.
  Then, on the route stage cards above, «почему здесь остались старые
  иконки»: they show cartouches too. Маршрут has a map with a route and a
  compass, До отъезда a suitcase with a passport and documents, В Италии
  the crossed keys.
- **The upload zone of the document check.** The felt folder («чуть
  страшновата») became the doc-check cartouche: a scroll, a magnifying
  glass and a check. It is shown at 88 px, at full colour, in the plan and
  in the cabinet.
- **The guide road** («чуть будто бы недоделанная, сыровато»; reviewed with
  a design critique).
  - The circles keep their marks: a red ball with a star for the next
    stop, a dot for open stops. A rosette of four tesserae was tried and
    removed: «что за ромбы, исправляй». No numerals (owner, 4 Nov).
  - The line is laid in short rectangular tesserae (7 px with 5 px gaps)
    instead of pale round dots; the part already read is still solid green.
  - The header says the count once: «Прочитано 0 из 5» and the bar; the big
    percentage repeated it.
  - The landmarks beside the road stay the 3D models. Flat mosaic
    vignettes were tried, and the owner kept the models: «Нет, вот этот
    стайл именно на карте прогресса норм».
  - The cabinet road keeps its own look.
- Manifest: design/illustrations/cartouche-2026-11-19.json.

## Five cartouche frames, topic descriptions and a lighter mobile load · 19 November 2026

The owner went through the guide catalogue on a phone.

- **Five frames instead of one.** «У всех гербов сделай разные узоры, где-то
  вариантов 5, и распредели их, чтобы они не повторялись… это выглядит очень
  лениво.» The emblems stay; the frames around them change:
  - A, the Baroque cartouche with the scallop shell (variant 7);
  - B, a round laurel wreath with a terracotta bow;
  - C, an ochre ground in slate-blue acanthus scrolls with a garland below;
  - D, a terracotta shield with an ochre fleur-de-lis;
  - E, a slate-blue pointed quatrefoil with terracotta lilies.

  In the topic row they go A B C D E in turn. In the visa points and on the
  home cards they are set by hand so that no two neighbours share a frame.
  The table is in the manifest.
- **Codice fiscale and DoV/CIMEA are tall sheets.** «Вот этот конверт, он
  слишком короткий… сделать его более нормальным». Codice fiscale is an
  upright paper certificate with a seal and a code line. DoV/CIMEA is an
  upright diploma with a verification seal and a magnifying glass.
- **Each topic says what it is and why it matters.** «Добавь описание, что
  это такое, вкратце, чтобы все поняли, почему это важно».
  - The teaser of every topic is now two sentences: what it is, and why it
    is needed. The facts come from the topic's own rows.
  - The catalogue tile, the topic header and the road show both sentences.
  - The home cards beside a picture show the first sentence.
- **Lighter cartouches.** «Сайт иногда долго загружает эти иконки на
  мобильной версии».
  - Every cartouche file name carries the hash of its master, and
    /illustrations/cartouche/* is cached for a year. Before, the phone asked
    the server about each picture on every page.
  - The renditions are WebP q76 instead of q86: the set went from 2.3 MB to
    1.6 MB, with no visible change at 2× zoom.
  - The topic header picture loads first.
  - Once the page has loaded, the catalogue row fetches its remaining
    pictures in the background, so a swipe never shows an empty tile.
- **Motion on phones.** «Анимации в этот раз не заработали».
  - A finger that lands on the full-width topic band to scroll the page no
    longer stops autoplay; only a sideways swipe takes the row.
  - On touch screens the card in view steps forward (scale 1, full opacity)
    and its neighbours wait a step back (0.86, 62 %), so swiping and
    autoplay visibly move the band. Under reduced motion everything stays
    still.

## The phone pass: captions beside the circles, nothing under the chat button · 19 November 2026

Owner, on an iPhone, about the cabinet road after /plan: «много таких
недочётов» — go through the whole phone version and remove them. His
example: the current step's red circle with the star was enormous, the dotted
road ran straight through «Заполнить анкету», «Выбрать университеты» ran off
the right edge, and the next step was a big pale circle with a dot.

Every page was measured at 360, 375, 390 and 430 px (touch, scale 1), the
questionnaire step by step, the cabinet empty and with a plan, the menu, the
chat, the term sheet and the university panels: page overflow, anything past
the right edge, text over text, text crossed by the road, tap targets under
44 px and what the chat button covers at rest.

- **Both roads (cabinet and guides), phones only.**
  - Why the road crossed the captions: they stood centred under their
    circles, and the road leaves every circle vertically, so it always ran
    through the caption below. Now a caption stands beside its circle, on
    the inner side of the bend, centred on it; the road passes above and
    below. Nothing is clamped: a 104 px row holds four lines, or «Сейчас»
    and three.
  - Circles 44 px, the current one 52 px with a 5 px ring (were 60, 76 and
    8); stage discs 52 px (were 64); the dot 8 px.
  - The inner side now carries the captions, so a landmark no longer shares
    a row with them: on phones its strip has its own height and the road
    makes room for it between the extreme circle and the next. The landmarks
    are the same pictures; desktop is unchanged.
  - Stage discs ahead had lost their rim in the cabinet: the paper reset
    (`.paper :where(*) { box-shadow:none }`) weighed as much as `.thumb` and
    came later. One more class restores it, on every width.
- **The chat button.**
  - At the end of every public page it stood on «Политика
    конфиденциальности». On phones the footer ends 76 px above the edge.
  - It covered the gallery's ▶ on /guides (phones under ~410 px) and the
    «Следующая тема» arrow on the section pages (all of it at 360 px, 32–40
    px of it at 768–1280 px). The section row and, on phones, the /guides
    gallery are yield targets now (`data-fab-yield`), so the button steps
    aside, as it does for primary buttons.
- **Tap targets to 44 px on phones:** the cabinet's three header buttons (40),
  «Есть код доступа? Войти» (36), the stage page's step dots (28, on touch
  screens), the guide step path stops (32), the «Крупнее» map button (40),
  the bottom links of /privacy and /terms (23), the Modulo 1 scenario switch
  (38–40), the «Бланк» tab (38 wide), «Сверить с PDF» (17), the «i» hint
  (an invisible 44 px ring around the 24 px button) and its sheet's close
  button (36).
- **Smaller things.** A link inside a sentence on the cabinet's documents
  page kept its 44 px box and pushed its line apart; in running text it is
  inline now. The stage summary kept a 240 px height meant to match the
  picture beside it, which left a 77 px empty band in the one-column phone
  tray. Source notes in the bento lists read in full on phones (they were
  clamped to two lines). /universities uses `svh` for its full height.
- **Not changed, and why.** The map pins (12–22 px tap circles) are fixed by
  the map's approved revision; the Modulo 1 paper fields keep the paper's
  geometry; the gallery's dots belong to the carousel, which is being
  changed elsewhere.

## Plan steps and questionnaire in cartouches · 19 November 2026

On a screenshot of the plan: «вот они сильно выбиваются из общей картины,
нужны изменения». The studio objects in the plan step tiles and in the
questionnaire were the last ones beside the Galleria cartouches.

- **Plan steps.** Each step shows the cartouche of its topic: education the
  diploma, DoV/CIMEA the verified diploma, the programme the book, the
  university requirements the document check, the calendar the clock, DSU
  and finances the Vespi coin, the status in Italy the permesso card, the
  consulate the seal, visa D the passport of Kazakhstan, the reserve until
  the grant the suitcase, under 18 the signed scroll, conscription the
  shield, enrolment the keys.
- **Questionnaire.** It uses the same set: the clock, the diploma, the book,
  the cap, the coin, the route map, the scrolls of translation, the signed
  scroll, the passport and the family documents. The cabinet's assessment
  uses it too.
- **Unchanged.** The cabinet road keeps its marks and 3D landmarks («вот
  этот стайл именно на карте прогресса норм»).

## Vespi on two topics and the document check in the guides · 19 November 2026

- **Conscription.** «Где воинский учёт сделай Веспи с военным шлемом и
  марширующим». The quatrefoil keeps its frame. In it Vespi marches in
  profile in a round olive helmet, with a high step and no weapon.
- **Insurance.** «Нарисуй Веспи, который идёт к доктору в итальянской
  больнице». The acanthus cartouche shows Vespi walking with a paper to a
  doctor at the loggia of a Renaissance hospital. The round arches,
  terracotta roof and blue roundels follow the Ospedale degli Innocenti.
  There is no cross symbol.
- **The document check, advertised in the guides.** «Проверка документов
  это киллер-фича, её нужно активнее рекламировать».
  - A dark card with the document-check cartouche stands under the
    overview of every topic about a paper the reader holds: education,
    apostille, translation, DoV/CIMEA, family certificates, DSU, the visa
    and its documents page. It also stands under the topic band of
    /guides.
  - The title names the paper: «Поставил апостиль? Проверь документ за
    10–30 секунд».
  - The text says only what the home section already says: what is checked
    against, and that the first check is free with no sign-up. The red
    button leads to /plan#document-check.
  - On the home page, the action cell «Проверь один документ бесплатно»
    shows the same cartouche instead of an empty dotted field.

## The document check leads its section; a scene on /prices; Trevi redrawn · 20 November 2026

- **Home, the document check section.** «Саму кнопку «Проверь документы»,
  она должна быть главной, и эти блоки должны быть снизу… блок «Проверь
  документы» должен быть вот такой большой».
  - The invitation now comes first, full width: a 26–40 px title, the text,
    a large main button and the document-check cartouche at 180–260 px
    beside them. The four facts and the comparison with an agency follow.
  - On a phone the cartouche stays small in the corner, so the page keeps
    nearly its length.
- **/prices.** «Она довольно пустая… одна большая иллюстрация с Веспи,
  который что-то делает именно по тематике… на фоне».
  - The heading of the document check stands on a wide scene: Vespi at a
    walnut desk in a Renaissance study checks a sealed certificate through
    a magnifying glass.
  - A cream wash from the left keeps the heading readable. On a phone the
    scene is a rounded picture above the heading.
  - Manifest: design/illustrations/scenes-2026-11-20.json.
- **Cabinet and guide roads, Trevi.** «Пропорции какие-то не такие. Он
  кидает монетку, но кидает её странно». Vespi is redrawn in his true
  proportions, about a third of the fountain's height. He stands with his
  back to the water and tosses the coin over his shoulder; its arc ends in
  the basin. Same frame size, grey copy for the closed part of the road.

## The document check gets its own page; Trevi natural; the Tuscan ride sharp · 20 November 2026

- **/check.** «Почему здесь сверху всё ещё стоит вот эта иллюстрация, для
  проверки документов должна быть отдельная страница».
  - The document check now lives on its own page, with its own cover:
    Vespi checks a document with a magnifying glass in a loggia with
    Florence behind.
  - The heading, «Проверь документ перед подачей», stands left over a
    cream wash. On a phone it comes first and the scene follows as a
    picture.
  - /plan keeps the questionnaire. «Проверить документ» in its tool row
    links to /check.
  - Old links to /plan#document-check move there. Every public button
    now points at /check.
- **Trevi.** «Ещё странно. Сделай более natural, ты по пропорциям улетел
  не туда». The fountain is drawn at its true grand scale: a wide
  travertine palace front, columns, the central niche with rock-work and a
  broad pool. Vespi is small beside it, like a visitor. He sits on the rim
  with his back to the water and flips a coin over his shoulder; ripples
  show where the last one fell.
- **Cabinet «Сейчас», the Tuscan ride.** «Это пространство становится
  мыльным».
  - The cause: the loop came from a 1024 px still and a 1080p video,
    scaled to 2400 and compressed hard. When it took over from its
    picture, the whole landscape went soft.
  - The fix: the picture was upscaled to 4k in Higgsfield, and the loop
    now takes only what moves (Vespi, the dust, some grass: about 17 % of
    the frame) from the video. Everything else stays the sharp picture.
  - The files are about the same size. The phone's WebM is lighter.
  - Details: design/illustrations/motion-2026-11-20.json.
- **Loops start sooner.** «Чтобы анимации запускались сразу». A scene on
  the first screen asks for its loop together with its picture, not after
  it.

## The phone and tablet finish; no Netlify badge · 20 November 2026

Owner: «теперь мобильную версию прошерсти на неточности, неровности и в целом
адаптивность, люди часто будут смотреть сайт с телефона», then «responsive-craft
тогда начинай с него», then phones and iPad to standard, and the «Powered by
Netlify» badge gone from every page.

Method: responsive-craft's Transform Existing workflow (audit, design forks,
fixes in order, verification), on an exact build of `main`: every route at
320/360/375/390/414/430, 844×390, and iPad 768×1024, 820×1180, 1180×820,
1024×1366, 1366×1024 (touch), plus a continuous drag from 280 to 1440 px in
20 px steps. Forks were decided without asking, keeping the current design:
bento stacks, the snake roads, card-stack comparison, stacked cabinet, the
hero picture above its panel, one sticky header, «Меню», no
`viewport-fit=cover`.

- **Netlify badge.** `#nl-badge-frame` is hidden site-wide
  (`chat-placement.module.css`); the rules that lifted the chat above it are
  gone. The chat button sits 16 px from the corner (`max(1rem,
  env(safe-area-inset-bottom))`).
- **Nothing past its column.** Legal titles scale with `clamp(22px, 8vw,
  36px)` («конфиденциальности» overflowed at 300–460 px). The hero picture
  keeps the full width below 1024 px in short windows. Visa's nine-document
  path fits the column from 320 px (a specificity bug kept a 52 px minimum).
- **No two-line buttons.** At 320 px every main button keeps one line: full
  width on phones, or 12 px sides and 14 px type below 375/360 px.
- **One edge.** Every block stands on the site edge at every width: 20 px
  phones, 24 px at 768–899, 32 px and the 1216 px column above. The Vespi
  card, the FAQ, the two home scenes and the «Твой маршрут» stage were 8–26 px
  off at 641–1263 px. The cabinet header is on the cabinet frame (12 px on
  phones, 20 px to 900 px). /prices' document check fills its column.
- **One radius.** Top-level cards are 24 px on phones (they were 28 beside
  24 on the same page). The /prices package card keeps 28 px: its style is
  pinned by `design-prices-landscape-review`.
- **Tablet in-betweens.** The topic and visa source lists stay one column
  with full notes until their tray is 660 px wide (at 600–715 px windows they
  split into two 160 px columns with cut notes).
- **Headings.** A sentence after `<br>` is its own balanced block (home
  document check, «Одна Италия…», «Знакомься, это Веспи…»); the dash in
  «Пункт за пунктом — в любое время.» is bound to «пунктом» with a no-break
  space. «Одна Италия…» scales on small phones; the topic cartouche is 96 px
  below 375 px; /plan step titles are not hyphenated on phones; captions on
  the roads and answer lines are balanced.
- **Rhythm and alignment.** 48 px between home blocks on phones; the FAQ's
  last question has no hairline at the rounded edge; the carousel's dots and
  ▶ are both 44 px; the cabinet stage dots line up with their label.
- **Left as they are:** map pins (approved geometry), Modulo 1 paper fields
  (paper geometry; iOS zooms on focus), carousel dots 14 px wide at ≤480,
  secondary text at 14–15 px, two-line pills at 280 px (Galaxy Fold).
- **Desktop.** 1280 px is pixel-identical except two headings that were
  wrong there too: /prices reads «Пункт за пунктом — / в любое время.», and
  the home «Твой собственный выбор.» is one line (from 1240 px it needed
  809 px in an 800 px column; the column is 840 px).

Audit and verification: `/tmp/claude-0/polish/responsive-audit.md` in the
session that made it; the findings are summarised above.

## «Не помню код» on the login card; email at purchase · 20 November 2026

The owner, on the cabinet login: «Почему для восстановления пароля он должен
писать WhatsApp? У нас нету формы восстановления или как?» — then «Да, давай
делай». There was none: the code is issued by hand after payment and the
only way back was a WhatsApp link.

- **The card turns over.** «Не помню код — восстановить» swaps the login form
  for a recovery form in the same card: «Не помню код», surname (carried over
  from the login card) and phone, «Прислать код». Focus moves to the heading;
  «Код нашёлся? Ввести код» turns it back with what was typed kept.
- **The code never reaches the page.** The server sends it to the cabinet's
  own Telegram and email and answers the same for everyone, so the form
  cannot tell who studies with us. The page says «Запрос принят: если кабинет
  с такими фамилией и телефоном есть, код уже в Telegram или на почте…».
- **WhatsApp stays as the fallback**, a quiet outlined pill in the result
  card, with the surname and phone already in the message. On a server
  without the route (or any failure) the result is «Пришлём код вручную».
- **Email at purchase**, optional, under the phone: «Почта (по желанию)» with
  «Пришлём сюда код доступа к кабинету, если потеряешь его.» A typo stops
  the order and is marked; empty sends nothing extra. The privacy page names
  the email among order data and the code among the uses.
- **Server.** bashpayy-hash/iitaly#31 (`POST /api/portal/recover`, optional
  order email), deployed the same day; see HANDOFF §3.

## The cabinet fits the first screen; FAQ that stays under the cursor; even topic links · 20 November 2026

The owner, at 100 % in Chrome on a laptop, next to apple.com: «на странице
Apple айфон помещается, и композиция выглядит лаконично… у нас нету ощущения
масштаба»; on the home links: «Виза D… там всё ещё есть неровности»; on the
FAQ: «менюшка лагучая, нужно всё это исправить и протестить».

- **Cabinet overview follows the window's height.** At 1320×723 the hero tile
  was 775 px tall from y=170, so Vespi and the road fell below the fold. The
  overview column is now `min(1296px, max(860px, (100svh − 172px) × 1296/800))`
  (4:3 between 641 and 1100 px): the tile keeps its proportion, so greeting,
  step, button and Vespi on the road fit one screen, as on a zoomed-out page.
  The tiles below and the «Прогресс сохраняется…» line take the same width.
  On windows up to 960 px tall the panel is set tighter (title
  `clamp(28px, 4.3svh, 44px)`, 15 px line, 44 px button). Measured: 1320×723
  hero 150–701, 1440×900 150–878, 1024×700 150–682.
- **Topic links under the home hero.** Each link filled its quarter, so the
  pink hover box ran far past the words with the text on its left edge. The
  box now hugs the words with 10 px each side; the words stay on the column
  edge (negative margin).
- **FAQ.** Frames were fine (52 per 900 ms, two over 20 ms); what felt laggy
  was the clicked question running away by 55–100 px while it opened: the
  panel re-centred in the tile and the answer open above folded at the same
  time. The panel now stands at the top of the tile and questions open
  independently — measured movement of the clicked question: 0 px. If an
  answer opens past the panel's bottom, the panel (not the page) scrolls to
  show it. On laptops the tile is `min(840px, max(640px, 100svh − 64px))`.
- **«Одна Италия» band.** Five ways to draw the real outline (`ITALY_PATH`,
  read-only) were shown to the owner; he chose the second, the night map
  (next section).

## «Одна Италия» on a night map of Italy · 20 November 2026

The owner on the dark band: «там пустовато, добавь иллюстрацию очертаний
страны Италии… не то чтобы plain, а что-то типа играние с пространством,
чтобы было реально эффектно»; of five variants — «развивай второй вариант».

- **What it is.** The university map's own outline (`ITALY_PATH`, imported,
  never changed) drawn as a halftone of dots (#5a4d40 on #1b1711), with the
  30 catalogue cities as warm lights. A light's size follows the number of
  universities in its city (one: 4.4 % of the map's width, +1.2 % for each
  more, up to five), so Milan and Rome burn brightest.
- **Space.** The map is 148 % of the band's height, cropped by it and set
  right of centre: the Alps above the heading, Sicily past the button. On
  phones it is 112 % and the lights are 0.8×, so the whole boot shows and the
  text keeps the stage.
- **Motion.** The first time the band is seen the dots fade in and the
  lights switch on as a wave from the Alps to Sicily; while it stays on
  screen each light breathes in its own 3–6 s rhythm. Off screen the
  animation stops (`data-live` from one IntersectionObserver). The cursor on
  «Открыть карту Италии» lights every city fully. Opacity and transform
  only; with reduced motion the map is simply on and still; hidden in
  forced colours and from assistive technology.
- **Cost.** The markup is rendered on the server (no map data in the
  browser); the only script is `ItalyNightMapLive.tsx`. Measured at 4× CPU
  slowdown while scrolling into the band: the same frame times with and
  without the map (phone: 0 frames over 20 ms in 4 s).
- `design-review` checks: decorative, 30 lights, cropped by the band rather
  than stretching it, heading above the map, lights on when seen and off
  when the band leaves the screen.

## CRO pass: five changes from the buyer-journey audit · 20 November 2026

The owner asked for a live simulation of a cold, skeptical buyer from an ad on
a phone (two minutes at most) and a CRO audit with the marketingskills
frameworks (cro, signup, paywalls, copywriting — read as text, not installed),
then: «делай тогда те самые 5 правок».

1. **/check: the upload on the first screen.** «Проверить документ» led to a
   heading and a picture; the upload began 1.9 screens down on a phone and
   below the fold on a laptop. «Загрузить документ» now stands under the
   heading (phone: y 411–459 of 664; laptop 478–526 of 900). It opens the same
   file input as the form below and then brings the file and «Проверить
   документ» into view; while the service is still being checked it scrolls
   there.
2. **Home first screen says the job.** «Поступление в Италию / без агентства.»
   (was «Твоё будущее. Теперь в Италии.» — agency? study? travel?), the line
   starts «Из Казахстана:», and under the buttons: «Первый шаг и одна проверка
   документа — бесплатно · Возврат 7 дней · Агентства — от 500 000 ₸». On
   phones the heading is a step smaller so it stays on two lines.
3. **Plan result sells the next step; the 11-class step reads as solvable.**
   Before payment the result opens with the offer: what 10 990 ₸ opens (the
   remaining steps, unlimited checks, reminders), «Открыть маршрут за 10 990 ₸»,
   the cabinet as the second button and the risk line. The 11-class first step
   is shown as «11 классов — не приговор: добери 12-й год» with «Вуз должен
   признать компенсацию 11-летней школы: недостающий год закрывают одним из
   трёх способов». The builder keeps the old title as the step's key (the local
   cabinet derives task ids from it), so saved progress stays attached; the
   tile's group and cartouche still follow the key.
4. **Paywall with the risk taken away.** On a locked plan step and a locked
   cabinet step: «Возврат 7 дней · один платёж, без подписки · агентства — от
   500 000 ₸» under the button; on the plan «Назад» and «Далее» are quiet text
   links so the purchase is the one action.
5. **Shorter questionnaire.** One short line per question; why it matters is
   behind «Зачем спрашиваю». The 1.2 s «Ответы собраны» hand-off after the last
   answer is gone in the public and local questionnaire (the cloud assessment
   keeps it); the preview with «Открыть мой план» opens at once.

Shared copy: `src/components/access/offerCopy.ts`. Reviews:
`design-assessment-review` now checks the direct preview.

## The plan as a short path, each step on its own page; Vespi on the Amalfi coast · 20 November 2026

Owner, screenshots of /plan and /portal: «очень громоздкие, большие степы… не
даёт понять весь масштаб пути… путь дан для того, чтобы пользователь понимал,
где он, отмечал его прогресс, и прогресс его поощрялся»; «нажимал на „Далее“ —
его переносило на другую страницу, где всё описывается в стиле всего сайта»;
«мотоциклский райд в виде гифки будет очень плох… пусть он едет по Амальфи…
сохраняя все пропорции… максимально бесшовно».

- **Plan result.** The step tiles gave way to `PlanPath`: the whole route as
  short rows under the cabinet's stage names (stage cartouche, «шаги 3–5»),
  one circle per step on a line. Read — green with a check; next — the one
  paper card with a terracotta circle, the step's first sentence and «Начни
  здесь»; open — a numbered paper circle; closed before payment — a lock and
  «с маршрутом». Above: «Разобрано N из M», a green bar and one line that
  cheers progress. On a desktop the stage sits left of its steps, so 12 steps
  fit one screen (788 px at 1440 × 900); on a phone 12 steps take about 1.3
  screens instead of one or two steps per screen.
- **Step pages** `/plan/1…16` (static; the plan is built in the browser from
  the questionnaire, so they are not indexed). The layout of a guide step:
  stage over the heading, the step's cartouche, a `StoryPath` over all steps
  (read ones checked, locked ones with a lock), the summary as numbered cards,
  «Что сделать сейчас» with the conditions and official sources folded,
  «Шаг отмечен на маршруте · разобрано N из M», then «Назад / Дальше» cards.
  A locked step: its first sentence, grey lines for the rest, the guide wall
  and the risk line. Opening a step marks it read on this device
  (`plan/<id>` in the guides' reading store, id from the step itself, so new
  answers never mark a different step).
- **Cabinet hero.** The Tuscan ride is replaced by an Amalfi coastal road
  (4:3 like before; same tile, crop and object-position). The landscape is
  one still sharp frame, only Vespi and his shadow move over it, cut from the
  generated video along his silhouette — the background never shimmers and
  the wrap is the same empty-road frame on both sides. 8.5 s at 24 fps;
  1.4 MB at 1600 px (the Tuscan loop was 2.4 MB). Record:
  `design/illustrations/motion-2026-11-20-amalfi.json`.

## Blocks, not rows: the plan, the cabinet documents and settings; a steady Amalfi ride · 20 November 2026 (evening)

Owner, iPad screenshots: «на первом скрине дизайн неровный и корявый… делай
блочно, как на лендинге… чтобы много умещалось, но не коряво»; «на Амальфи всё
ещё лагает»; «страница [документов] выглядит на подвальный вайб… сделай как на
лендинге»; «кнопки неровно расположены… должна быть банальная ровность».

- **One rule for evenness: `ui/bentoPack.ts`.** The bento grid (12 columns on a
  wide tray, 6 on a medium one, 1 on a phone) gets its spans from `planSpans`:
  every row runs edge to edge, a cell that does not fit closes its row and the
  row's cells share the free columns evenly, and of the allowed sizes the
  calmest layout wins (no row of a single cell except a deliberate one, then
  the fewest rows). Measured at 390, 820, 1024, 1180 and 1440 px: every row
  of the plan, the documents and the settings is flush with the tray on both
  sides.
- **/plan route.** One bento tray of step cells: number (or check, or lock),
  stage, title. The next step takes a whole row with its cartouche, its first
  sentence and a dark «Начни здесь» pill; read steps are green, locked ones
  carry only the lock (no repeated «с маршрутом»). Four cells a row on a
  desktop, three on a tablet, one compact row each on a phone. 12 steps:
  the tray is about 570 px tall at 1440 and 710 px at 820.
- **Cabinet documents** (local cabinet). The landing's pattern: a two-tone
  heading («Документы твоего маршрута. / Где взять и как проверить.»), then one
  tray — the free check as the action cell with Vespi at the stamp and a dark
  «Проверить документ» (now to /check; the old note sent people to «Мой план»,
  where the check no longer is), and each document as a paper cell: what it is
  for (a coloured chip: вуз, DSU, виза), name, where to get it, status and
  «Открыть».
- **Cabinet settings.** The same heading pattern and tray: the profile and the
  reminders as two equal cells, the sound switch as a quiet row under them.
- **Home «Твой маршрут».** The four links are equal tiles filling their
  columns (four in a row, two by two below 900 px) instead of words at the
  left of each quarter with gaps of 105–229 px.
- **Amalfi ride.** 30 fps (24 fps judders on a 60 Hz iPad) and one steady
  speed (the generated ride went 9 to 22 px a frame); see
  `design/illustrations/motion-2026-11-20-amalfi.json`.

## The cabinet ride without video; /check as a page; a scene on «Твой маршрут»; Vespi's face at Trevi · 20 November 2026 (late)

Owner, iPad: «Проверь документ было бы полноценной страницей»; «в личном
кабинете эта сцена всё ещё капец лагучая… исправь любой ценой»; on the road,
Vespi at Trevi: «странно у него выражение лица… соблюдай его анатомию»; on the
home «Твой маршрут» card: «слишком белое… добавь иллюстрацию по теме».

- **Cabinet ride on CSS.** No video, no canvas: the Amalfi road is a still
  picture and Vespi is a clean cut-out that rides across it on `translate` and
  `scale` only, so the compositor runs it at 60/120 Hz, in Low Power Mode too.
  The stage keeps 4:3 inside a size container and covers like object-fit, so
  the path stays on the road at every width. A soft CSS shadow, a light bump.
  Details: `design/illustrations/motion-2026-11-20-amalfi.json`.
- **/check is a page of its own.** No «Составить план / Проверить документ»
  tabs and no second «Проверь документ перед подачей» under the hero; the tool
  is «Загрузи документ» (badge «Одна проверка бесплатно», not «AI Document
  Audit»). Then «Как это работает» (three cells), «Быстрее агентства» (the
  facts and the comparison from the home section, without its invitation to
  /check) and «Проверки без лимита — с маршрутом» with the purchase, the risk
  line and «Составить план».
- **Home «Твой маршрут».** The card's upper part has a scene: Vespi tracing a
  dotted route on a map of Italy in the site's Renaissance study, as the right
  half of the card melting into the paper; the words stand in one column on
  the left. On a phone the scene is a picture above the words.
- **Vespi's face is canonical everywhere.** Two open dot eyes, a small smile,
  pink cheeks — never closed or curved eyes. The Trevi piece on the road was
  redrawn with only the face changed.
- **Guide and visa pages on a textured band** (owner, same night, with a
  reference of a grainy sage-to-sand section: «такие страницы мне тоже
  нравятся, имплементи такого рода текстуру в страницы с гайдами и визой»).
  Topic, visa and guide-step pages open on a full-width band under the path
  and the header: the site's olive fading into sand, with paper grain from an
  inline SVG noise tile (no image request). The bento and the reading stay on
  the plain canvas. Intro text on the band is #4E4A44 (4.8:1 on the darkest
  sage).
- **Fewer background requests.** In output: "export" Next 16 prefetches each
  visible link with a HEAD request plus its segment files. The plan's twelve
  step links and the twelve stops on a step page no longer prefetch (a step
  page loads on the tap); the media-switcher review waits for the restored
  university instead of network idle when it returns from /plan, where those
  prefetches could still be in flight.

## Document check as a section of the site; a ride with physics · 21 November 2026

Owner, with screenshots of the cabinet hero, the dark promo on /guides and
/check: «вместо того, чтобы бесконечно в разных ответвлениях писать то, что
есть опция проверки документа, просто сделай так, чтобы проверка документов
была отдельным разделом… в личном кабинете бесшовность появилась, но…
там нет нормальной физики».

- **«Проверка документов» is a section of the main navigation** (/check),
  between «Мой план» and «Цены», and a link in the footer. The header keeps
  one line down to the tablet: gaps 22px below 1080px, 13px type and 14px gaps
  below 900px. The cabinet's own header does not carry it.
- **No promos for it elsewhere.** Gone: the dark «Готовишь документы? Проверь
  их за 10–30 секунд» card on /guides and on topic and visa-documents pages
  (DocCheckPromo), the «Составить план / Проверить документ» switch on /plan
  and its «Проверка файла доступна отдельно», the «Проверить документ» link at
  the foot of a plan step, and the big «Проверь документ перед подачей» cell
  in the cabinet's documents. There the heading keeps Vespi at the stamp
  beside it and one line names the free check with a link to the section.
  Kept, because they are the site's main offer rather than a repeat: the
  «Проверить документ» button in the home hero, the home section «Быстрее
  агентства» and the compact block on /prices.
- **The Amalfi ride has physics.** The cut-out is split into a body and a
  head (same pixels). The scooter climbs a little slower and speeds up on the
  flat, leans with the road under it, its wheels turn by the distance
  travelled (five nuts and a valve on each hub), the suspension takes three
  joints in the asphalt — front wheel first, rear a wheelbase later — and the
  head nods on a soft neck a beat after each jolt. The wheels stay on the road;
  nothing hops as one block. All of it is baked into CSS keyframes on the
  compositor: `design/illustrations/motion-2026-11-21-amalfi-physics.json`.

## The Amalfi ride follows the road · 21 November 2026 (later)

Owner: «ты по итогу не исправил, как Веспи по Амальфи по нормальной
траектории едет».

- **The path was the fault, not the bounce.** The cut-out slid almost level
  across the picture at one size, while the road runs away to the upper
  right: Vespi began on the painted edge line and ended a third of the road
  below it. Now the midpoint between his tyres keeps to the lane beside that
  line, measured on the plate itself.
- **Perspective.** He is 1.2 of the cut-out when he enters on the left, 0.9 in
  the middle and half of it where the road leaves the frame, like the parapet
  beside him. At a constant real speed he passes close and fast, then slows
  on screen as he rides away and up the bend. The scooter lines up with the
  lane (part rotation, part shear, so the rider stays upright).
- **Phone.** The sheet with the step no longer hides the wheels: the picture
  stands whole above the sheet's top edge.
- Suspension, head and wheels as before, on the new clock (9.2 s loop).
  `design/illustrations/motion-2026-11-21-amalfi-physics.json`, «trajectory_same_day».

## One style across the site: the consistency pass · 21 November 2026 (night)

Owner: «пройдись по всему сайту, чтобы не было неровностей, чтобы был весь
один стиль». Every page was measured at 390, 820 and 1440px (gutters,
heading scale, buttons, radii, grids, vertical gaps) and read as full-page
screenshots at the three widths; what follows is what was off and is now on
the system.

- **One edge.** /check: the sections under the tool stood 32px from the edge
  on a tablet and 16px on a phone (the cover above them 24 and 20). The
  universities comparison sat in a 1200px column, 8px inside the map. The
  cabinet login cards stood 8px inside the logo on a desktop and 4px outside
  it on tablet and phone. /changes-2026-27 used two centred columns, 900 and
  1100px, so its headings stepped left and right down the page. All of them
  now start at the site's gutter: 1216px column, 24px on a tablet, 20px on a
  phone.
- **One frame in the cabinet.** The overview followed the window's height
  while the header, «Документы» and «Настройки» kept 1296px: on a 1440 × 900
  window the logo hung 58px left of the hero tile and the page changed width
  from tab to tab. The header and every view share the overview's column
  (`--cabinet-frame`).
- **One heading scale.** Page titles are `clamp(34px, 4vw, 56px)` on every
  section page — «Университеты Италии» was 64px on a desktop and 28px on a
  phone. Section headings on /check share the landing's scale (40px stood
  beside 52px). Reading pages keep `clamp(30px, 3.6vw, 46px)`, now on the
  legal pages too (they were 48px on a tablet beside 34px elsewhere). On
  /changes the section headings are 34px again (a shared rule had made them
  52px, next to a 56px title). «Одна Италия» is weight 600 like every other
  heading. Scene-card headings on the home page are ink, not brown.
- **Whole tiles.** Home «Твой маршрут»: square bottom corners and pure white
  → a 28px tile in warm white. The «Знакомься, это Веспи» card: the post
  Vespi holds showed as a 4px strip outside the card; he now looks in from
  behind its edge. Cards on /universities and the login are warm white
  (#FFFDF9), not #FFF; the /prices cards keep their white (the pricing card's
  look is held by its own review). The /check workbench is 28px, scene pictures
  20px, login cards 28/24px with 16px fields, in two tiles of one height.
- **Even rhythm.** Home: 80px around the Vespi card (was 60 above, 124
  below; 64 on a tablet). /prices: blocks 24px apart (were 16, 24, 40, 40,
  32). Guides: chips 12px under the search (5px); 36px before «Разбор по
  шагам» (8px). Doubled rules are gone under «Официальные источники» on visa
  pages and between the two rows under the plan. /changes: every row of
  status cards is full; no pure-white bands.
- **One button.** The cabinet's dark buttons are the site's black at 48px
  (they were #241F1C, #352B28 and #141413). The dark map band on the home
  page uses the light pill of the dark guide gallery instead of a pink
  outline. /check: «Открыть маршрут за 10 990 ₸» stays on one line on a
  phone (it wrapped to 75px). 404 and payment status: one black primary and
  a quiet link. The guarantees on /prices use the site's disclosure sign and
  a terracotta rubric, not green. The active chip on /guides is ink.
- **Details.** The cabinet's progress knob has its green ring again (the
  cabinet's «no inherited shadows» rule had removed it: at 0% the bar looked
  bitten). Guide road labels no longer break mid-word; «12-й» never breaks at
  its hyphen; the breadcrumb slash stays with the crumb before it; the date
  in «Правила проверены…» stays whole. «Мой план» is marked current on plan
  step pages. On a phone the guides chip rail runs to the screen's edge, the
  universities count is a chip of its own width and «Выбери город» is as tall
  as its words. The footer's seven links are two lists (four and three), not
  rows of two with one left over. /check: the two selects stand side by side
  only where both values fit.
- **Left as they are, deliberately:** the cabinet's own outer frame and its
  Inter Tight weight (600) on buttons; the terracotta action in the cabinet
  hero; the narrow centred column of /prices; the Modulo 1 trainer (a copy of
  a paper form); the bento trays' 8px inner gap; fact tiles that mute a value
  that is not a figure («по ситуации»).

## Vespi looks at the road; advantages told once · 21 November 2026 (morning after)

Owner, with two screenshots: «вот здесь убери… повторение… преимуществ» (the
«Быстрее агентства» section on /check) and «у него голова не в то
направление направлена. Нужно, чтобы он на дорогу смотрел» (the cabinet hero).

- **/check without the repeat.** «Быстрее агентства» — the four facts and the
  comparison with an agency — is gone from the page of the tool itself. The
  page is: the cover with the upload, the tool, «Как это работает», and what
  opens with the route. The advantages stay on the home page, where they
  argue for the check, and in one sentence of this page's cover.
- **The rider is redrawn with his head turned ahead.** Same scooter, body,
  light and angle; from behind-left we now see the back of the helmet and the
  edge of a cheek, so he looks where he rides on every part of the road,
  the far bend included. The picture is fitted to the old one by its tyre
  contact points, so the lane, the perspective, the suspension and the
  turning wheels are unchanged. A soft shadow lies under the wheelbase,
  darkest under each tyre (the new cut-out brought none of its own).
  `design/illustrations/motion-2026-11-21-amalfi-physics.json`,
  «looks_ahead_same_day».

## The cabinet scene has depth: a road that runs away from us · 21 November 2026 (noon)

Owner, with a screenshot of the hero: «Здесь всё равно чувствуется плоскость…
всё переработай, чтобы чувствовалось то, что он реально куда-то едет вглубь».

- **Why it stayed flat.** The road crossed the picture from side to side. A
  cut-out moving along it never comes toward us or goes away; four passes at
  its path, lean and wheels could not change that.
- **A new scene.** The same Amalfi coast at golden hour, redrawn from the
  road itself: we look along it, the parapet with bougainvillea and the sea
  on the left, the stone wall with lemon terraces and the village on the
  right, the two lanes converging to a vanishing point low in the frame.
- **Vespi rides into it.** Seen from behind, he passes us in the right lane
  and rides away at a constant speed, so perspective does the work: large
  as he comes in at the lower right, a third of that two seconds later, a
  small figure far down the road, gone where it bends. His helmet stays just
  under the horizon the whole way, as it does for anything our own height.
- **Measured, not guessed.** The vanishing point and the lane come from the
  painted lines of the picture; position and size follow 1/distance. Joints
  in the asphalt still lift him, he leans a little, the head answers late.
  The turning wheel nuts are gone: from behind a wheel shows only its tread.
- **Every width.** The horizon sits at 74% of the 4:3 stage: on a tablet the
  whole road is in the band under the panel, on a desktop there is sea above
  it, on a phone the picture stands whole above the sheet.
- Still CSS on the compositor, no video. `design/illustrations/motion-2026-11-21-amalfi-depth.json`.

## The cabinet hero is one still picture · 21 November 2026 (afternoon)

Owner, after the ride into the depth: «Ладно, просто убери видео, просто
сделай динамичную, классную картинку, где он просто едет, всё, больше ничего
не надо».

- **Nothing moves in the hero.** No video, no canvas, no cut-out on CSS: the
  ride and its keyframes are gone (the cabinet stylesheet is 20 KB lighter).
- **The motion is in the picture.** Vespi rides toward us down the Amalfi
  road at golden hour, scarf streaming, headlight on, petals in the air, the
  asphalt streaked toward the vanishing point behind him; the village with
  the dome on one side, the sea with the low sun on the other. His face is
  in full: two dot eyes and a small smile.
- **One picture, three frames.** A desktop shows the whole view around the
  panel. A tablet hides the upper two thirds under the panel, so the stage is
  enlarged there and Vespi sits whole in the band under it. A phone gets a
  closer frame of the same picture as its own, lighter file.
- **He keeps to the right.** The generated picture had him on the left of his
  road; it is mirrored, so he rides where traffic in Italy does.
- An upscaled copy was tried and dropped: it turned the plush into plastic.
  `design/illustrations/landscape-2026-11-21-amalfi-still.json`.

## The guide band is alive: a grainy gradient that moves · 21 November 2026 (evening)

Owner, with a screenshot of a reel «10/10 niche GH libraries to unslop your AI
designs», item 5 — ShaderGradient, «grainy moving gradients»: «примени этот
плагин где полезно будет который пятый».

- **The effect, not the library.** `@shadergradient/react` 2.4.20 is 114 KB of
  gzipped code (measured on the published package) and needs `three` and
  `@react-three/fiber` on top, with a WebGL canvas that renders every frame.
  The site is for a cheap phone on a slow connection, dependencies are
  protected, and there is no 3D here. What the library shows — a grainy
  gradient that slowly flows — is built with what the site already has.
- **Where.** On the sage-to-sand band of topic, visa and guide-step pages:
  the one place that already was a grainy gradient. Not in the cabinet (no
  gradients there), not on the heroes that are illustrations, not on the
  night map.
- **How.** The band's wash is no longer one painted background but a field
  (`GuideBandField`): the base wash, three soft colour fields — sage, sand
  and a cream light — and the grain on top. Each field walks a closed figure
  (sines of different frequencies on x and y, a little turn and swell), baked
  into `transform` keyframes, linear between 24 samples; periods 34, 43 and
  29 s, so the picture does not repeat for minutes. The grain stands still.
- **Cost, measured.** Five seconds of the moving band in a trace, desktop and
  a phone with the processor slowed six times: 0 paints, 0 layouts, 0 long
  tasks — the compositor moves three ready layers. No script, no request.
- **Still when asked.** With «меньше движения» the fields stand where the
  painted wash had its sage and sand.
- **Text on the band is readable at every moment.** Measured on rendered
  pixels, grain included (16 px cells under each line, 60 moments of the
  cycle, 320–1440 px): the grey #4E4A44 had 3.7–4.0:1 over the darkest sage
  already on the painted wash — the 4.8:1 noted on 20 Nov did not count the
  grain. Grey text on the band is now #3F3933, the third of the site's four
  greys: at least 4.75:1 at any moment. The topic's name over a step title
  was terracotta #A33421 with 3.0:1 there; it takes the same grey.
- The guides review checks: the field is there, three endless animations of
  `transform` only with three different periods, none with «меньше
  движения», and 4.5:1 for every line at eight moments of the cycle.

## Text stands evenly; blocks say one thing once · 21 November 2026 (night)

Owner, with three tablet screenshots (the «Как это работает» cards and the
offer on /check, the free/paid cell of a guide topic, the cover of /check with
a paragraph over Vespi's helmet): «в целом много где тексты не прям ровные, и
идёт перенасыщение каких-то блоков текстом. Вот тоже исправь эту причину».

Measured first: every text block on 18 pages at 1440 / 1024 / 820 / 390 (lines,
their widths, words per card, sibling cards, repeated phrases). The causes and
what replaced them:

- **No line-breaking rule.** `text-wrap` stood in 28 of 80 stylesheets; the
  rest broke greedily. Found: 57 orphan words, 15 ragged paragraphs. Now one
  rule for the site (`src/app/typography.css`, layer `base`, zero specificity):
  headings balance, running text is broken by the whole paragraph. After: 2
  orphans.
- **A dash could start a line** (5 found, one in the owner's screenshot). The
  dash is bound to the word before it with a non-breaking space in the copy of
  the public pages — 116 dashes in 38 files, by a script over string literals
  and markup; the cabinet, the Modulo 1 trainer and the map with the
  comparison are protected and untouched.
- **Words over the picture's subject.** On /check the cover's words kept
  their 560px while the picture, cropped by height on a tablet, put Vespi at
  64% of the cover: the paragraph's box lay 28–80px over his helmet from 761
  to 834px. Whether it showed depended on where the lines happened to break —
  on the owner's iPad the type sets narrower than in Chromium, so they reached
  him. Up to 1023px the words take at most 60% of the cover: 33–47px short of
  the helmet at every width.
- **Columns too narrow for their sentences.** The note of a guide overview
  stood in a third of the grid (207px: six to eight lines of 13–21
  characters) — it reads across the grid now. On a phone a topic's intro
  stood beside the 120px cartouche (218px: seven lines) — the title keeps its
  place beside the cartouche, the intro runs under both.
- **Unequal and repeated text.**
  - /check, «Как это работает»: 21, 12 and 13 words → 13, 12 and 11, one
    sentence each. The cover's paragraph 28 → 22 words; «первая проверка
    бесплатно» is said once on the cover, not three times before the tool.
    The offer lost the same sentence. «Что проверяем в файле» (four lines)
    opens on request.
  - A guide topic's free/paid cell: 23 and 28 words → 9 and 22; the five free
    guides are not listed by name (the directory marks them). The boundary is
    the same.
  - The document check on the home page and /prices: each fact had a third
    line repeating the comparison under it, the invitation above it or the
    lead; a fact is a value and its name (−40 words). The lead ends where its
    statement ends. `design-content.mjs` lists these for /prices.
  - Home, «После визы»: a topic card carried the teaser's first sentence
    (13–14 words in a 140–180px column, six lines on a phone); now one line of
    3–5 words, like the stage cards above.
- Prices, terms, the comparison with an agency, guide teasers written at the
  owner's request (19 Nov) and all reference text (rules, FAQ answers, step
  bodies) are unchanged.
- **Not done here:** binding short prepositions («в», «и», «на») to the next
  word. It needs the same non-breaking space in every sentence of the site and
  touches most text assertions in the reviews; it is a pass of its own.
- `design-text-review` (new, in CI) holds the rules on 12 pages at three
  widths: a line-breaking rule on every heading and paragraph, no loose dash,
  the /check cover's gap to Vespi at four tablet widths, the word budgets, the
  disclosure, the note's and the intro's width.

## Agent Skills pass: security, speed, accessibility · 21 November 2026 (late)

Owner, with a reel screenshot («Agent Skills» of addyosmani and `/graphify`):
«В целом этот полезно? Если да то установи и используй для улучшения сайта».

- **Agent Skills** were already installed (`.claude/install-skills.sh`, since
  3 Nov). **Graphify** is not installed: it maps code for the agent and hooks
  every search; it changes nothing on the site, and the repository is small.
- Three skills were run against the live site, each «measure first».

**Security (`security-and-hardening`) — nothing to change.** Live headers:
CSP, HSTS with preload, nosniff, frame-ancestors, referrer and permissions
policy. Production dependencies: 0 advisories (7 moderate in the lint
toolchain, development only, not reachable at run time; dependencies are
protected, so not bumped). No secrets in the tree or its history. The four
raw-HTML sinks take constants of the repository; model replies are rendered
as text. The checkout link is followed only over https (11 Nov).

**Speed (`performance-optimization`).** Transfer weight of ten live pages on
a phone and a desktop, then which file each picture took against the size it
is drawn at. Three causes:

- **No step between 960 and 1600px.** A phone needs 1040–1170 device pixels
  for a full-width cover and took 1600 (1920 on /plan). Added 1200px for the
  six covers and the nine cabinet scenes.
- **`sizes` that were not true.** Cabinet tiles said «100vw» for a 360px box;
  the directory's tiles said 340px for 180px; the home route picture said
  1216px for 607px. Each now states the measured width. Cartouches got a
  360px copy (41 KB on average against 61 KB) for the 88–120px uses.
- **A breadcrumb that prefetched.** On a topic or step page the link to the
  stage pulled the stage page and the pictures of its first two tiles —
  134 KB, the first at high priority. The path no longer prefetches.

| Throttled phone profile, median of 3 | Largest paint before | After |
|---|---|---|
| Home | 6.0 s | 4.4 s |
| /check | 5.1 s | 4.0 s |
| /plan | 6.2 s | 4.0 s |
| Topic, directory, cabinet | no change beyond noise | |

Picture bytes at load, like for like on the local build: phone /plan −41%,
/check −29%, topic −44%, step −54%, cabinet −17%, /prices −19%; desktop
/guides −60%, /plan −48%, topic −56%. Layout shift is 0 before and after.

Ledger of what was tried:

| Idea | Result | Verdict |
|---|---|---|
| 1200px covers and scenes | LCP −1.1…−2.1 s on three pages | kept |
| True `sizes` + 360px cartouche | −20…−60% picture bytes | kept |
| Breadcrumbs without prefetch (with the 360px cartouche) | −86 KB and 5–12 requests on topic and step pages | kept |
| AVIF for cartouches | −30% at matching quality, needs `<picture>` in six components, sources are already lossy | not done |
| Lazy tiles in the directory's row | all 13 load after `load` by the owner's request of 19 Nov | not touched |
| Nav prefetch of other sections' scripts | ~90 KB after load, makes the next page instant | not touched |

**Accessibility (axe on 17 live pages, phone and desktop).** Two findings:
the directory's carousel dots were 20px wide (a pointer target needs 24px) —
24px now from a tablet up; on a phone thirteen dots cannot stand 24px apart
beside the play button, so they stay as they were (the row is swiped; a
two-row variant was drawn and left for the owner's decision). The note in the
/prices offer was an `<aside>` inside `<main>`; it is a plain block.

`design-image-fit-review` (new, in CI): covers on two phones are the 1200px
file or smaller and not upscaled; cabinet tiles the same; a topic and a step
fetch one cartouche of 360px and no stage page; a 1× desktop takes 240px
tiles. It fails on the previous build.

## Nothing typed is lost; the way on is one control · 22 November 2026

Owner, 21 Nov, about the design skills from a reel: «И что из этого реально
поможет сайту чтобы юзеру было максимально интуитивно без потери данных».
The answer was a pass with `impeccable` (critique) and `break-ui` over the
phone flows: home → questionnaire → plan → purchase, the document check, a
guide, the cabinet's sign-in. An independent reviewer walked the live site at
390 and 320px; every finding was then checked in code before it was touched.

What was wrong and what stands now:

| Place | Before | Now |
|---|---|---|
| /plan, «Начать заново» | one tap erased all ten answers, no question, no way back | the button asks «Стереть все ответы?»; «Оставить» has the focus, «Стереть» erases |
| /plan, «Изменить ответы» | dropped to question 1 and hid the plan; the way back was ten taps through answers already given | a list of the ten answers; a tap opens one question, the choice returns to the list; «Вернуться к плану» stands beside the heading and under the list. The draft stays complete, so a reload lands on the plan |
| /plan, questionnaire | after «Назад» the only way forward was to tap the same answer again | an answered question has «Далее» |
| /plan, hand-off | the first step's title broke as «12-/й год» | the same non-breaking form as in the route |
| Purchase sheet | Escape or a tap beside the sheet wiped name, surname, phone and e-mail | the typed fields stay for the next opening, in memory only; a finished order starts clean |
| /check | «или перетащи сюда» on a phone; the example opened below the fold and the button looked dead; «не связано с оплатой» said twice when the service is down | the drag hint only where there is a mouse; the example scrolls into view; the payment note is said once, in the notice |
| Cabinet sign-in | «восстановить» 88×22, «Ввести код» 71×22, «Посмотреть тарифы» 132×17 under a finger | 44px hit areas, the lines stand where they stood, the two do not overlap |
| Cabinet, university step | «Как выполнить этот шаг» carried two plus signs, one over the other | one sign, the shared one |
| /prices at 320px | «Спросить Веспи» lay over «Проверка экспертом» | the chat button steps aside for the links under the price |
| Guides road at 320px | «Сейчас · 0 из 8» stood 19px outside the tile, «0 из 9» past its edge | the count goes under the badge on a phone that narrow |

The list of answers is built from what the questionnaire already has: the
short titles of the question tiles («Набор», «Образование»…), the white paper
card and hairlines of the plan, one word of action per row. No new colour,
shape or picture.

Left for the owner, because they change the offer, copy or the purchase form
rather than how a control behaves:

- the plan result shows the paid offer before the free «Начни здесь» step;
- e-mail at purchase is optional, so a lost code cannot always be sent back;
- the refund condition sits low on /prices and names no contact channel;
- the questionnaire is «~2 минуты» on /plan and «за 10 минут» in the home FAQ;
- three different step counts (11 / 19 / 28) and two product names across pages;
- in a free guide the offer stands before the steps.

`design-intuitive-review` (new, in CI) walks all of the above at 1440, 390 and
320px. On the previous build it stops in the questionnaire (no «Далее»), and
the measures it holds read there: one link covered by the chat button, two
road labels outside their tile, 22px and 17px targets, the drag hint shown on
touch, the payment note twice.

## One story from the first screen to the purchase · 22 November 2026 (later)

Owner, after the list of six things the intuitiveness pass had left for his
decision: «Так, получается, сделай все так, чтобы все было последовательным и
воронка была максимально эффективной сразу, хорошо?» All six are done, and
three more of the same kind that the walk through the pages turned up.

**The order: what was promised first, the offer after it.**

| Page | Before | Now |
|---|---|---|
| /plan, the result | after ten answers the first screen was the offer («Открыть маршрут за 10 990 ₸» and an outlined «Продолжить в личном кабинете»); the free step the page had promised stood a screen lower | the route first, «Начни здесь» on the first screen; the offer follows the list of steps it speaks about, with one filled button; the cabinet is a text link in the line about where the answers are kept |
| A guide topic | one bento above the steps (12 Nov): on a phone a free topic showed «Проверить документ» and the purchase 1 400px before its first line | the facts above the reading; then the topic and its steps; then what to do next, what the route adds, the sources and the note. Same cells, two groups. The visa page the same way |

The offer on the result had been put first by the CRO audit of 20 Nov, when
the result had no offer at all. Its place after the route is not a retreat
from that audit: the button, the three lines of what opens and the risk line
are the same, and every locked step still leads to the wall.

**One name for each thing.**

| Thing | Before | Now |
|---|---|---|
| The purchase button | «Открыть маршрут за 10 990 ₸» on the walls, «Купить за 10 990 ₸» on /prices | «Открыть маршрут за 10 990 ₸» everywhere |
| The form's heading | «Поступление под ключ» | «Весь маршрут поступления», the words of /prices. The string sent to the server stays «Поступление под ключ» (`PRODUCT_ID`): the server finds the price by it |
| The free way in | «Составить план» on the home page, in guides and on /check; «Проверить шансы» on /prices, promising to say «реально ли поступить» | «Составить план бесплатно» on /prices too; the text promises what the plan gives: where to start, the route, the first step |
| Time of the questionnaire | «~2 минуты» on /plan, «за 10 минут» in the home FAQ | two minutes in both |
| Size of the route | 11 steps on the plan, «28 шагов в маршруте» on /prices, a figure kept from the old site | /prices takes the figure from the same `buildPlan`: «9–12», and on a device with a finished questionnaire that plan's own count |
| The scholarship field of the check | «Программа» on /check, «Стипендиальная программа» in the cabinet | «Стипендиальная программа» in both |

**Risk, said where the decision is made.** «Возврат 7 дней» stood all over the
site without its condition; on /prices the condition was 3 768px below the
button on a phone and no way to ask was named. Under the button now: «Возврат
7 дней, пока не загружал документы на проверку и не отмечал шаги выполненными.
Вопросы и возврат — в WhatsApp.» The words are those of /terms; the manual
payment mode has its own condition there and here.

**A lost code.** The recovery form already offered WhatsApp after sending; its
first line now says so before sending. E-mail at purchase stays optional: a
required field would cost purchases, and the manual way back covers the case.

Also: on a 390×844 phone the chat button stood over the last word of the
home page's trust line; the line keeps clear of the button's column.

Not changed, with the reason:

- The local cabinet counts 19 steps where the plan counts 11: it adds the
  questionnaire, the choice of universities and six document tasks to the
  plan's own steps, and its first open step is the choice of universities. Its
  order is what `design-workspace-review` walks; the plan no longer sends
  an unpaid visitor there with a button.
- The paid cabinet's route comes from the server; its size was not touched.
- «Виза D» is «С маршрутом» on its card and open on the map by the owner's
  rule of 12 Nov (facts and the calculator open, the points with the route).
- The boundary between free and paid, the price and the terms are the same.

`design-funnel-review` (new, in CI): the free step on the first screen after
the questionnaire; the offer after the route, one button; no offer among a
topic's facts and the steps before it, free topic and paid; one purchase label
on six places; the form's heading; the count on /prices equal to the plan's;
the refund line under the button on the first screen with a WhatsApp link;
the free way in by its name; two minutes; the field's name; the manual way
back in recovery. The content guard holds the six changed lines of /prices
with the owner's words.

## The funnel walked again: repeats, mismatches, lost threads · 22 November 2026 (evening)

Owner: «Да, вроде нормально, просто назови их… даже в личном кабинете» (about
11 steps on the plan against 19 in the cabinet), and: «А что еще именно по
воронке продаж повторяется, или есть неконсистенции, или есть какие-то, типа,
где пользователю будет сложно ориентироваться в сайте, вот это проанализируй».

An independent reviewer walked the live site at 390 and 1440px with three
questions only: what repeats, what disagrees, where the thread is lost. It
collected every call to action with its target. The states it could not reach
(after payment, the paid cabinet) were read in code. Every finding was checked
before it was touched.

**Fixed.**

| Where | Before | Now |
|---|---|---|
| The cabinet's count | «Сделано 1 из 19 шагов» beside the plan's 11 | «Шаги плана: 0 из 11 · Подготовка и документы: 1 из 8»; a route from the server: «Шаги · Документы» |
| The hand-off after the last question | the first step's whole action, repeated on the result and on its page; «Ещё 10 шагов… откроются по кнопке ниже» over a plan where those ten are locked | the step's name and orientation; «Первый шаг открыт целиком. В плане ещё 10 шагов и список из 5 документов.» |
| A locked step (plan and guides) | a dark «Назад» and a red «Дальше» under the wall's own button; the red one opened the next wall; the last locked step said «Готово» and offered the cabinet | the purchase is the one filled button; the pager is two quiet cards; «Дальше · с маршрутом»; the last one leads back to the plan or the topic |
| The cabinet's «Изменить ответы анкеты» | un-finished the questionnaire and restarted it at question 1; the plan and its step pages vanished | opens the same list of answers as /plan; the plan stays |
| The guest cabinet | nothing said it is the free one on this device; no way back to the plan; «Напоминания · Подключить Telegram» led to a sign-in form | «Бесплатный кабинет: план сохранён на этом устройстве» with «Открыть план»; the tile says «Подключаются с маршрутом · Как подключить» |
| After payment | «Код кабинета»; nothing about keeping it | «Код доступа», as everywhere; one line on what the code is for |
| /privacy | «Код доступа… не отправляется в Telegram» under «Код приходит только в Telegram и на почту» | the first is scoped to connecting reminders |
| Home, under Vespi | «Начать с Веспи» led to the cabinet's «Заполнить анкету» | «Составить план с Веспи» leads to the plan |
| Words | «Далее» in two controls, «Дальше» in the rest; «тарифы» on the sign-in against «не тарифы» on /prices; «квиз», «разбор ситуации»; «закрыт до оплаты» | «Дальше»; «Посмотреть цену»; «план»; «откроется с маршрутом» |
| /prices | the line under «Сначала составь план» repeated the «Бесплатно» card above it; the link «Состав пакета» led to «Что включено» | the line says how long the plan takes; the link is «Что включено» |
| A guide topic's bottom link | a bare topic name | «Следующая тема: …» |

**Left for the owner**, because each changes a structure or wording he set:

- «Мой план» is /plan in the public menu and the cabinet's home inside the
  cabinet (its menu and breadcrumbs, and «Перейти в Мой план» of 2 Nov).
- «Маршрут» names the paid product, the free list of steps and a guides
  stage («Выбрать маршрут»).
- /plan with a finished plan still opens with «Опиши свою ситуацию».
- «Что включено» on /prices lists a shortlist of programmes and drafts of
  motivation letters, named nowhere else; the guides' walls promise topics,
  visa points and the Modulo 1 trainer, absent from that list.
- Repeats by design: a free topic's steps repeat «Вся тема коротко» (14 Nov);
  /guides lists the topics as a carousel and as a map; the home page shows
  «После приезда» as a card and then as a section; /check tells its three
  steps after the form; /universities says «выбери город» four times.
- The assistant is «Веспи», «ИИ-помощник», «ИИ-консультант» and «Помощник».
- /universities ends without a way on to the plan.

`design-funnel-review` now also holds: the hand-off's promise; the quiet
pager and its labels on locked steps, plan and guides; the guest cabinet's
line, link and reminders tile; the cabinet's count against the plan's; the
home button's name and target; «Посмотреть цену»; the next-topic link.

## Six sets of skills, and an audit by one of them · 22 November 2026 (night)

Owner, with a reel's «Design» and «Marketing» lists: «Вот, влей тогда Taste
Skill, Hyperframes, GSAP, потом проведи с ними аудит, то, что нужно в целом
можно исправить. Вот, Marketing Skill, Social Media Skills, Humanizer тоже
устанавливай. Вот. Promotion, наверное, потом, но запомни, или сразу тоже
установи, когда будем видео делать».

**Installed** (`.claude/install-skills.sh`; they load from the next session).
Each repository was read first and is pinned to the commit that was read, so
a later change upstream does not reach a session unread.

| Skills | From | Note |
|---|---|---|
| `design-taste-frontend` | Leonxlnx/taste-skill | Its `SKILL.md` declares a Stop hook that would run the skill's own `gate.mjs` at the end of every turn; the hook is removed on install. Its 38 MB kit of effects, photographs and icons is not installed: this site has its own world. Here it is a lens for review, and `DESIGN.md` decides what the site looks like |
| `gsap-core`, `-react`, `-timeline`, `-scrolltrigger`, `-performance`, `-plugins`, `-utils` | greensock/gsap-skills | Plain instructions. The site itself has no GSAP: dependencies are protected and its motion is CSS |
| `hyperframes`, `hyperframes-cli`, `hyperframes-registry` | heygen-com/hyperframes | Video from HTML. The skill asks to send a usage beacon when it starts: turn its telemetry off before the first command |
| `social`, `video`, `image`, `content-strategy`, `ad-creative`, `influencer-marketing`, `copywriting`, `copy-editing`, `marketing-psychology`, `product-marketing` | coreyhaines31/marketingskills | Ten of 53: what serves Instagram |
| `reels-scripting`, `hook-generator`, `content-matrix`, `voice-builder`, `gemini-carousel` | charlie947/social-media-skills | Five of 17 |
| `humanizer` | blader/humanizer | Takes the marks of a model out of a text |

Remotion is not installed: it is added (remotion-dev/skills, pinned the same
way) the day a video is built with it.

**The audit.** taste-skill's written rules, applied to fourteen pages at 1440
and 390px with measurements made here. Its own scripts were not run:
`consistency.mjs` alone is eleven thousand lines that nobody here has read.

Within its budget: requests (55 at most), pictures (1 010 K at most, the
largest 298 K), fonts (four files, 109 K, one family), layout shift (0), every
picture has its size, headings go in order, every field has a label.

**Fixed.**

| What | Before | Now |
|---|---|---|
| The picture a link arrives with | `opengraph-image`, a file without an extension: the host served it as `text/plain` with `nosniff`, which is not a picture to WhatsApp, Instagram or Telegram | `/og.png`, served as a picture by its extension; the address carries the price printed on it |
| The preview of a page | every page arrived as the home page: «IITALY — поступление в Италию ведёт ИИ», the home page's description, no address | 73 pages carry their own title, description and address (`src/app/pageMeta.ts`) |
| A guide's tab and search result | «Апостиль», «Виза D»: a plain title in the guides layout cut the site's name off every page below | «Апостиль — IITALY» |
| /changes, from 900 to 1279px | its left edge stood 8px left of the header's: `md:px-6 min-[900px]:px-8` never reached 32px, because the stylesheet writes an arbitrary breakpoint before `md` | the ranges do not overlap; the edge is the header's at every width |
| /changes, the 25 source links | 22px tall, 10px apart, under a finger | 44px on a touch screen; under a mouse the list keeps its step |
| The questionnaire's pictures | loaded with the page | lazy |
| /plan's description | promised the document check, which has had its own page since 20 Nov | «Бесплатно, без регистрации» |

**Not fixed, for the owner to decide.**

- Styles weigh 303–373 K on every page (59–79 K as sent), of which a page
  uses about a fifth: the build groups the styles of unrelated pages into
  three shared files. Scripts are 687 K on the lightest page and up to
  1 175 K. Splitting them is a change to `next.config.ts`, which is protected.
- What taste-skill calls marks of a model in texts (headings of two short
  fragments, strips of facts, badges) is this site's own manner; texts
  change only when the owner asks.
- Small things left as they are: the visa's fact icons are 240px files shown
  at 50px; the carousel's dots are 14px on a phone (known, awaiting his word).

`design-share-review` (new, in CI) holds the picture's type and size, every
page's own preview, the site's name in every tab, the edge of /changes at six
widths, the source links' height and the lazy pictures.

## Dropdowns drawn by the site; a pill for the cabinet's way in · 22 November 2026 (late night)

Owner, with two iPad screenshots (the guest cabinet and /check): «Кнопка войти
справа сверху чуть кривая, и на втором скрине эти кнопки все еще кривоватые».

Both screenshots were measured pixel by pixel before anything was changed. The
headers stand evenly: every item of both headers shares one top line, and the
edges match the content's. What was uneven was the controls themselves.

| Where | Before | Now |
|---|---|---|
| Every dropdown (9 on the site: /check, the cabinet's document page, /universities, the Modulo 1 codes) | no dropdown switched the system look off, so Safari on an iPad and an iPhone drew each as its own capsule: 28px tall on the screenshot where the page asks for 44px, larger text, system arrows, the page's radius ignored. Chromium obeyed the page, which is why no review saw it | `src/app/controls.css`: the system look is off for every `select`; the page's own height, radius and padding apply in every browser; one drawn chevron |
| The guest cabinet's way in | «Есть код доступа? Войти», one underlined run of words beside the underlined «Открыть план», under the header's rule | the question is plain text and «Войти» is a quiet pill of the header's shape. One link, the same words, the same 44px target |

On the first screenshot the line also stood 10px under the header's rule: the
page was scrolled by 18px under the sticky header. At rest it has 25px above.

`design-intuitive-review` now holds both: every dropdown on three pages has
the system look off, is at least 44px tall, carries the chevron and does not
cut its text; the cabinet's way in is one link with the same name, not
underlined, with a pill that ends at the content's right edge.

Not checkable here: Safari itself. The reviews run in Chromium, which already
obeyed the page; the cause was read from the owner's screenshot and from the
stylesheet, and the result needs one look on the iPad.

## The marketing skills applied to the funnel's words · 22 November 2026 (night)

Owner, about the skills installed the same day: «примени и если реально
полезно имплементи на сайте».

The `copy-editing` skill's seven sweeps and its check for the marks of a
model were run over home, /plan, /check, /prices, a guide's wall, a locked
step, the guest cabinet and the purchase form (text read from the build).
`humanizer` looks for the same marks, so it adds nothing here. Facts, the
price, the agency figure, refund and terms, the free/paid boundary and the
owner's two-phrase headings were not touched.

**Changed.**

| Where | Before | Now | Why |
|---|---|---|---|
| Search engines' copy of the home FAQ | an older text of its own; its refund answer named the condition for manual payment («если личный кабинет ещё не активирован»): with Stripe the cabinet opens at payment, so a search result read as «no refund» | the answers the page shows, from one module (`faqData.ts`) | a search result contradicted /terms |
| «Гарантируете поступление…?» (home) and «Мы не обещаем…» (/prices) | «…а не мы и не ИИ. Мы обещаем другое: … ничего не упущенное по срокам» | «Поступление решает университет, визу — консульство, стипендию — регион Италии. Мы даём маршрут под твой случай, проверку документов до подачи и напоминания о сроках.» | it promised what the heading says is not promised |
| «Что если университет откажет?» / «Если вуз отказал» | «Это не конец доступа — …», «следующий интейк» | «Кабинет остаётся открытым, и система пересобирает план: …следующий набор…» | a reversal; a word an 11th-grader does not know |
| /prices, under the price | «Не подписка, не тарифы, без доплат… поэтому это стоит столько, а не как в агентстве» | «…без подписки и доплат за этапы. Маршрут, сроки и проверку документов ведёт система, поэтому это в десятки раз дешевле агентства: там сопровождение стоит от 500 000 ₸.» | a list of negatives and a reversal; the agency's figure is the proof |
| The purchase form | «Доступные карта, Apple Pay, Google Pay и другие совместимые способы Stripe покажет автоматически» | «Он сам покажет способы, доступные на твоём устройстве: карту, Apple Pay, Google Pay и другие.» | not a sentence; did not say why Apple Pay may be missing |
| /plan, reminders under the result | «Напоминания на телефоне» · «Настроить напоминания» over «бесплатный план не включает рассылку», said twice | «Напоминания о сроках» · «Как подключить», as the cabinet's tile | a button offered a setup the free plan does not have |
| Home FAQ, «Как проходит работа» | nine sentences in one block; «пройди опрос» | three paragraphs (before payment, the cabinet, timings); «заполни анкету», the cabinet's word | a wall of text; a third name for the questionnaire |
| /plan's badge | «~2 минуты · Персональный трек» | «~2 минуты» | a third name for the route |

**Left as they are.** «iItaly» in the FAQ is the wordmark, not a typo. The
two-phrase headings are the owner's manner. «11 классов — не приговор» is the
owner's wording of 20 Nov.

**For the owner.** The package list on /prices says «shortlist» and «AI-проверка»
where the site says «список» and «ИИ»: the list is guarded and is part of the
open question of what «Что включено» promises. The funnel has no proof from
people (reviews, how many students used it): the skills ask for it, and only
real words with names may go there.

Reviews: `design-funnel-review` and `design-reminders-review` follow the new
words; the content guard holds the three changed lines of /prices.

## The Galleria floor: mosaic tiles in the cabinet, floor panels on the home page · 22 November 2026 (night)

Owner, with two screenshots. The guest cabinet's tiles «Проверка документов»
and «Напоминания о сроках»: «вот эти вот две иллюстрации, они пока что
странненькие… нужно как-то их поменять. Может, как-то с мозаикой
сравнивать, может, добавить каких-то приколов». The home page's route cards:
«слишком plain white… нужно с ними что-то тоже сделать… добавить какие-то
текстуры или узоров… чтобы было на что обратить внимание… стильно».

The site's mosaic is the floor of the Galleria Vittorio Emanuele II that the
cartouches are laid in (19 Nov). Both answers come from it.

**The cabinet's two tiles.** The felt Vespi in a photograph became a floor
mosaic of the same Galleria, with one joke each:

| Tile | Before | Now |
|---|---|---|
| Проверка документов | felt Vespi with a stamp at a desk | Vespi studies a scroll with a red seal through a brass magnifying glass, one eye huge behind it; a pigeon at the other end of the scroll checks it too; a stamp and an ink pad beside |
| Напоминания о сроках | felt Vespi with an alarm clock on a balcony | Vespi rides his scooter, as at the top of the cabinet, with a ringing alarm clock strapped to the rack |

Six variants were drawn (gpt_image_2_6 with Vespi, the permesso cartouche
with Vespi in tesserae and the topic's own cartouche as references); the
other four are in `design/illustrations/scenes-2026-11-22.json`. The panels
show whole, at their own proportions; the scene's slow camera drift is a
breath of 3.5% from the centre, so it never cuts the clock's bells or the
pigeon. 1200 px is 229 KB at WebP q72: the joints between stones are the
picture, and a filter that halved the file blurred them. The tiles are below
the first screen and load lazily.

**The home page's six route cards** are panels of that floor: a ground of
small cream tesserae laid in slightly wavy rows (dark tesserae on the dark
cards), and inside the card a border of two ochre rows around a slate-blue
one (terracotta on the dark card) with a terracotta block at each corner, as
in Roman floor borders. The palette is sampled from the cartouches. Words and
the cartouche stay inside the border at 1440, 820, 390 and 320px; on phones the
border stands 8px from the card's edge instead of 12. The textures are drawn
by a script (`design/illustrations/source/textures/mosaic-textures.py`) and
weigh about 15 KB together.

Reviews: `design-portal-focus-review` names the two mosaic scenes;
`design-flight-explorers-review` holds the ground, the border and that
nothing leaves it.

## Three effects from a reel: a floor inscription, words that rise, a deck of tiles · 22 November 2026 (night)

The owner sent a reel, «20 things to make your website look less AI-made», and
asked: «что еще из этих можно имплементнуть? Подумай.» Five of the twenty were
already here (grainy gradients, paper texture, the parallax of the home and FAQ
scenes, a soft page transition, the cabinet's completion chord). Ten were left
out because they belong to a tech startup's look, not to paper, mosaic and
Vespi: pixel and mesh gradients, dithering, halftone, fluted glass, text
scramble, spotlight and custom cursors, hover and click sounds; blur-in text
costs frames on phones. Three were proposed and the owner answered: «Да,
давай имплементни, что считаешь нужным».

| Effect | Where | How |
|---|---|---|
| Fade-out logo footer | the end of every public page | «iItaly» across the content column, laid in terracotta tesserae with cream joints (a 15 KB texture seen through the letters), its lower half fading into the paper. Decorative (`aria-hidden`); the link with the name is the logo above |
| Word-by-word reveal | four home headings: «Одна Италия. Твой собственный выбор.», «Один шаг. Понятный маршрут.», «После визы путь продолжается.», «Можно ли нам доверять» | `WordReveal`: each word rises a third of a line from 15% opacity as the heading crosses the lower part of the screen, the next 2.5% of the travel later. CSS only (`animation-timeline: view()`): the words are in the HTML, nothing waits for JavaScript, and a browser without scroll timelines or a reader with reduced motion sees the heading as before. Not the heroes (the first screen does not wait for animation) and not /prices (the content guard counts its text nodes) |
| Stacking scroll cards | the two home scenes, phones only | the three tiles stick under the header one after another, each 12px lower, and the next slides over the one before; when the list ends the deck leaves with it |

The headings measure the same as before at 1440 and 390px. «Одна Италия»'s
second sentence had been styled as «every span of the heading»; it is a named
line now, so its words stay inline.

`design-flight-explorers-review` holds the deck on phones (and no deck side by
side), each heading split into its words and reading whole, and the footer's
wordmark.

## The footer's word laid as a mosaic, not bricks · 22 November 2026 (night)

Owner, on the footer wordmark of the same evening: «А че надпись кирпичная,
сделай мозаичной в общем стиле тогда». The first version showed a texture of
stones in straight rows through the letters: a wall, not a floor.

The word is laid now as the cartouches are (opus vermiculatum): the letters'
distance field gives rows parallel to every edge, one slate-blue row outside,
an ochre one inside it, terracotta to the middle; stones are seeded along each
row at one stone's length, each pixel goes to its nearest seed, and every stone
is shrunk toward its centre so the joint stays open to the paper. The face is
Inter Tight 700, the wordmark's face where SF Pro Display is absent.

One SVG with one path per colour (first 4 843 stones; see below): sharp at every
size, 47 KB as Netlify sends it at first, fetched only near the end of
the page (`loading="lazy"`). The 15 KB brick texture is gone. The generator is
`design/illustrations/source/wordmark/mosaic-wordmark.py` (deterministic; it
reads the face from the build).

## A test purchase for friends: /test, 667 ₸ · 22 November 2026 (night)

Owner: «Сделай еще тестовое отдельное отделение моим друзьям за 667 тенге,
пометь что оно тестовое».

- The server (bashpayy-hash/iitaly#32) has a second portal product,
  «Тестовый доступ · для друзей», 667 ₸: the same cabinet as the full route.
  The server owns the price; its name says «Тестовый» at Stripe and in the
  order log, and the owner's paid alert starts with «🧪 ТЕСТ».
- The site sells it only from /test: one card on the paper with a red «Тест»
  pill before the heading «Тестовый доступ для друзей», «667 ₸ вместо 10 990 ₸»,
  a line that says it is a test purchase (real Stripe payment, real cabinet),
  three lines on what it opens, the site's own purchase form, and WhatsApp for
  what breaks. No page links to it, it is not in the sitemap, and its robots
  meta is noindex, nofollow.
- Anyone with the link can buy the full cabinet for 667 ₸: the link is given
  by hand. Turning it off is removing one line of the server's catalogue.

`design-test-offer-review` (CI, group portal) holds the noindex, the absence
from the sitemap and from every other page, the badge before the heading, the
price line, and that the order names the test product.

Same night, two corrections. CI's warm-palette review forbids cold colours in
any code or SVG on the site (raster art is exempt), and the word's slate-blue
outer row was seven cold literals: the outer row is umber now (86, 54, 38).
Then the owner, on the live footer: «Так, оно уже слишком большое. Вот. Сделай
поменьше». The word stands at half the column, 600px at most (280px on a
phone), at the column's left edge; its stones are drawn larger for that size
(1 494 stones, about 7px each), and the SVG is 17 KB as sent.

## The footer's word: plain type, stone on paper · 22 November 2026 (night)

Owner, on the live mosaic word: «Также сделать другой дизайн вот этого, типа
слишком колхозно выглядит, нужно быть более stylish, more like in a modern
attitude like of the website».

The rows of umber, ochre and terracotta stones read as folk craft next to a
page of plain type. Three versions were set in the real footer at 1440 and
390px: the word in one warm stone tone; the same word filled with square
tesserae tone on tone (it read as a blurred, low-resolution picture); and the
word in ink (strong, but it outweighed everything above it). The first stays.

- «iItaly» in the header's face (Inter Tight 700, -0.055em), its outlines taken
  from the font, filled with one warm stone tone, #E3DACB, a few steps darker
  than the paper. The one colour is the dot of the first «i», in the site's
  red #E63946: the accent the site already uses once per screen.
- Size and place are unchanged («Сделай поменьше»: half the column, 600px at
  most, 280px on a phone, at the column's left edge), and the CSS still fades
  the lower part into the paper.
- One SVG of two paths, 1.8 KB (it was 63 KB of stones). The generator is
  `design/illustrations/source/wordmark/footer-wordmark.py`; the mosaic
  generator is removed.

`design-flight-explorers-review` now also holds the file to these two fills, so
a multicolour word does not come back unnoticed.

## /plan's hero as a still picture; the friends' test on the site · 22 November 2026 (night)

Owner, on the /plan hero: «Так, вот здесь, знаешь, анимацию убери, поставь
какую-то другую, но нормальную иллюстрацию. И потом внеси вот этот вот
особый этот для друзей за 667 тенге… сам сайт неси, а не отдельной ссылкой».
Earlier the same night, on generated Vespi: «ты вообще не соблюдаешь
пропорции и вес тела».

- **/plan hero.** The loggia poster and its video loop are gone (the four
  webp sizes and four video files with them). It took three tries, and the
  owner's words set the rule each time. The approved Vespi pasted behind a
  desk in an empty generated study: «Это пиздец, экспериментируй… иллюстрация
  должна быть динамичной, живой, итальянской. Пропорции должны сохраняться».
  A bright, rendered terrace over Rome: «нет, другую иллюстрацию в другом,
  более таком реалисте… Вернись к этому стилю, который был раньше… все
  иллюстрации, которые на сайте… сделай в таком же стиле». The site's manner
  is an editorial photograph of a real Italian place with the cotton toy
  standing in it (the Bologna arcade, the Florence belvedere, the loggias):
  natural muted light, real stone, shallow depth of field. A scene with
  movement is made the same way, with the same prompt formula and one of the
  site's own pictures as the style reference.
  The hero now: a stone terrace over Florence at golden hour, Vespi mid-step
  launching a paper plane, three more gliding toward the Duomo, sheets
  lifting off an iron table under a lemon tree. His face, helmet, collar and
  proportions were checked against the references at full size. Two swallows
  that flew where the heading stands and one plane that touched the paragraph
  were painted out into the sky. The picture is not upscaled (the upscaler
  turns cotton into plastic). Phones get their own square crop around Vespi
  (the tile there is a tall strip of the scene): sharper at the 1200px
  ceiling a phone is sent. Seven other scenes in the same manner are kept as
  alternatives. Recorded in `design/illustrations/scenes-2026-11-22.json`.
  `design-media-switcher-review` holds the header to one still picture: no
  video, no canvas.
- **The friends' test on the site.** /prices ends its column with a card under
  the main purchase: the red «Тест» pill, «Тестовый доступ для друзей»,
  «667 ₸ вместо 10 990 ₸», one line (a real payment and a real cabinet, the
  price lowered to check payment, the code and the cabinet), «Оплатить тест ·
  667 ₸» opening the site's own purchase form for the test product, and «Подробнее
  о тесте» to /test. The footer links «Тест для друзей» to /test on every page.
  /test no longer says its link is given by hand. It stays out of the sitemap
  and asks search engines not to index it. `TEST_OFFER_ON_SITE` in
  `testOffer.ts` takes the card and the link off the site; the server's
  catalogue line takes the product off sale.
- Anyone who opens /prices can now buy the full cabinet for 667 ₸ instead of
  10 990 ₸: that is the owner's call, said to him with the change.

## The share picture: the terrace with Vespi under the headline · 23 November 2026

Owner, with a Telegram screenshot of the home page's link preview (the card
of 22 Nov: words on plain paper in a fallback typeface): «почему эта страница
такая страшная, сделай ее нормально красивой с иллюстрацией в нашем стиле».
Then, on the first new card (it carried «10 990 ₸ · разово» and «Казахстан →
Италия»): «убери ценник и казахстан италия, скажи что это современный подход».

- The card is the site's own hero: the /plan terrace over Florence with
  Vespi launching a paper plane across the whole picture, the headline
  «Поступление в Италию. По понятному плану.» in Inter Tight on the sky, the
  logo with «Современный подход» beside it, and one paper pill, «iitaly.net».
  No price and no «Казахстан → Италия». Three layouts were set first: paper
  with the scene as a tile (the headline broke into four lines), the Florence
  belvedere (the red line fell on the city), and this one.
- The three planes that glide where the headline stands are painted out for
  the card (`design/social/source/share-card-scene.py`); the plane in Vespi's
  paw stays.
- The old card's line of six subjects is not on the picture: a messenger
  prints the page's description, with the same subjects, right above it.
- It is `public/og.jpg`, a JPEG of 179 KB, drawn once by
  `design/social/source/share-card.mjs` and committed. The route that built
  `/og.png` with next/og is removed: a photograph as PNG weighs over a
  megabyte, and WhatsApp shows no preview for a heavy picture. The generator
  refuses to draw without the site's typefaces.
- The picture's address ends in the first eight characters of its hash
  (`design/social/share-card.json`, `SHARE_IMAGE_VERSION` in `pageMeta.ts`),
  so a redrawn card is a new address to every cache. `design-share-review`
  checks the JPEG (1200×630, 300 KB at most, served as image/jpeg), that it
  is the drawn file, and that the address carries its hash.
- Messengers keep the preview of a link they have already seen. Telegram
  refreshes it when the link is sent to @WebpageBot.

## Motion pass: what replaces something arrives; the questionnaire ends with a mark · 23 November 2026

Owner: «добавить анимации в целом по сайту, которые будут как-то расплавнять
все, а то как-то просто на сайте иногда все топорно именно по анимациям, по
переходам выглядит. И после опроса оно сразу выдает, куда тебя бросает. А я
хочу… кружочек зеленый, и то, что вот эта вот галочка появляется, все это
было, ну, с анимацией чуть-чуть».

An audit of the same day listed where the site changed state in one frame.
Each place was weighed by how often a visitor meets it and what the motion
is for; what happens on every keystroke (the guides' search) and on a first
page load stays instant.

- **The questionnaire's last screen.** A green circle (the brand's
  `#087C55`) settles with the cabinet's «done» spring, a white check draws
  itself, one ring goes out; «Уже готово по твоим ответам», which stood as a
  small label inside the box, is the mark's caption, and the box, the button
  and the rest follow 60ms apart. About 0.9s; the button works from the first
  frame, so the CRO rule of 20 Nov (no hand-off screen between the answers
  and the plan) holds.
- **The plan after «Открыть мой план».** Its blocks rise one after another
  (50ms apart) while the page glides up to it; the list of answers and the
  way back arrive the same way. A saved plan opened by a page load does not
  animate.
- **Dialogs** (the purchase, a university's card, the comparison). The
  backdrop fades in and the panel settles; on a phone the panel is a sheet
  and comes up from the bottom edge. Closing: the dialog is gone at once, as
  before, and a copy of it fades for 160ms (`motion/leave.ts`), so focus and
  scrolling return without a wait.
- **Rows with the «плюс» sign** (guarantees on /prices, «Напоминания о
  сроках», the cabinet's rules, «Оставить номер для связи», «Зачем
  спрашиваю»). The row grows to its open height in 280ms
  (`motion/useDisclosureMotion.ts`). The home FAQ had this in CSS since
  8 Nov, but through `interpolate-size`, which only Chromium has: on an
  iPhone it snapped. The listener covers Safari and Firefox too.
- **The phone menu** comes down from the header in 200ms.
- **States that replace each other**: the order form, «Открываю Stripe…» and
  «Заказ принят»; the upload zone and the chosen file, the status line, the
  error and the result of a document check; «Вход» and «Не помню код» in the
  cabinet; a new chat message and the «печатает» row; «Стереть все ответы?».
- **A press is answered**: the site's button gives 2% under the finger (it
  moved 1px in one frame, because `transform` was not eased); the home route
  tiles, the guide chips and the step pager, which only answered a mouse,
  answer a touch.

One set of classes does the arriving (`motion/swap.module.css`): `.rise`,
`.fade`, `.cascade`, `.scrim`, `.dialog`. Only `transform` and `opacity`
move, once, on the site's curve `cubic-bezier(.22,1,.36,1)`. With reduced
motion nothing moves and nothing waits.

## Speed pass: fewer styles before the first paint, pictures kept by the browser · 23 November 2026

Owner: «в целом оптимизируй сайт, чтобы все быстрее прогружалось, быстрее
работало, и не было других проблем».

Measured first, on the built site: a phone profile (4× slower processor,
1.6 Mbit/s, 150 ms latency, text compressed as the host does), medians of
seven loads, the same script before and after
(the method is in the pull request). Three things were found and changed.

- **Styles.** The bundler merged the styles of the cabinet, the guides and
  the questionnaire into two files that every page loaded before it could
  draw: the home page fetched 325 KB of styles and used 45% of them. The
  documented `cssChunking: "graph"` groups styles by the routes that import
  them. Compressed styles before the first paint: home 53 → 30 KB, /plan
  63 → 35, /prices 53 → 37, /check 63 → 35, /universities 59 → 35, /guides
  66 → 34. The cabinet keeps its weight (64 → 60 KB) in 15 small files
  instead of 7; they are cached for a year after the first visit.
  First paint on the phone profile: home 1.32 → 0.98 s, /plan 1.07 → 0.89 s,
  /check 1.48 → 1.28 s, /prices 1.30 → 1.14 s.
- **The first picture of /plan.** The same frames in AVIF stand first in the
  `<picture>`, a third lighter at the same measured likeness to the master
  (the phone's 1170px: 128 → 86 KB); WebP stays for browsers without AVIF.
  The page's largest picture arrives in 2.75 s instead of 3.22 s.
- **Pictures, textures and video are kept by the browser for 30 days.** They
  were served with `max-age=0`, because pictures used to be redrawn under the
  same name: on every page load the browser asked the server about each of
  20–50 files before showing it from its own cache. On a return visit to the
  home page that was 24 questions; now 11 (the page and its data). The rule
  that makes it safe: a redrawn picture gets a new name.
  `design-media-names-review` fails a file changed under its name, a name
  given to a different file, and a new folder of `public/` with no cache rule.
  It also fails a built page or stylesheet that refers to a file which does
  not exist (a browser keeps «not found» for a cached folder as long as it
  keeps a picture, so a broken reference would stay broken for a month).

Tried and left as it was:

- A higher `requestCost` for the style grouping (40 000, 70 000): one file
  fewer per page, 7–9 KB more styles on every public page. The default stays.
- AVIF for the home page's first picture: it is the first frame of the video
  that replaces it, and a different encoder would show at the swap.
- AVIF for the cabinet's first picture (185 KB on a phone): its master is
  not in the repository. It is the heaviest first picture left.
- The four typefaces loaded first (110 KB): all four set words on the first
  screen. The home page's second scene already loads lazily.

Other problems looked for: the 94 built pages reference 4037 local files and
pages, and none is missing; no page logs an error while loading.

## The phone: nothing travels with the page; the comparison in two sides · 23 November 2026 (later)

Owner, with three iPhone screenshots from Telegram's browser: «все еще есть
какие-то лаги… почему вот эти вот штуки друг на друга наслаиваются. Затем,
когда идет сравнение именно на телефоне, вот это вот типа Италии, там до
конца непонятно, типа что да как… и в целом вот эта вот плашка, она следует
за сайтом всегда, это тоже надо пофиксить. И вот иногда идет именно в
мобильном приложении перенасыщение… информации».

- **The route tiles do not stack.** For a day the three tiles of a home
  scene stuck under the header on a phone and each next one slid over the
  one before (a reel's «stacking scroll cards»). On the screenshot a dark
  tile lies across a light one, and it was read as a glitch. The tiles stand
  one under another and stay there.
- **The header is the top of the page on a phone** (up to 767px) and scrolls
  away with it. In Telegram's browser the page shows above a sticky header
  as well as below it, so the strip lay across the home picture with the
  picture on both sides. From the tablet up it sticks as before. The menu is
  one swipe up, and the footer repeats its links. What used to stop under
  the header stops at the top of the screen: the guide's bars and a jump to
  a section read their offset from `--header-stick` (64px where the header
  sticks, 0 on a phone).
- **«Проверка у агентства и здесь» on a phone.** A row was three lines of
  text, two of them opening with «Агентство: » and «IITALY: » inside the
  line. Now: the row's question across the card and the two answers under
  it, the agency's quiet on stone, IITALY's dark on a warm tint. From 400px
  the answers stand side by side under the two names, as in the wide table;
  under 400px (a column there is narrower than «Сопровождение —») one under
  the other, each under the name of its side. The same words and figures;
  «₸» no longer starts a line and «10–30 секунд» no longer breaks at its
  dash.
- **The four facts of the document check stand two in a row** on a phone
  (from 360px): four full-width tiles were a screen of scrolling for eight
  short lines.

Measured for the last point: words per phone screen on the main pages. The
home page holds about 40 words a screen, /prices 65–90 on every screen of
its eight: that page is where a phone is fullest. Left as it is for now:
its guarantees, the package list and «Что система делает сама, а где
решаешь ты» are statements a buyer checks before paying, and none repeats
another on the page.

Not touched: the chat button. It also stays on the screen while the page
scrolls; on /prices it carries its label by the owner's request of 18 Oct.

## The phone, second layer: one telling, one tinted answer, a long paragraph folded · 23 November 2026 (later)

Owner, after the first phone pass: «Используй любой дизайн скилл при
надобности». Two were read against the phone pages: mobile-native (what
makes a site feel like a site on a phone) and impeccable's distill (remove
what does not earn its place).

mobile-native: the baseline was already in place from 5 Nov (no tap
highlight, no ungated hover in any stylesheet, no double-tap wait, 16px
fields, `svh` heights). One line was missing: a phone turned on its side
enlarged some text and not other (`text-size-adjust`, now in
typography.css).

distill, on /prices, the fullest page on a phone (65–90 words a screen):

- **One telling.** «Проверяй снова без доплаты» was said five times on the
  page: the fact «Без лимита», the comparison's «Сразу и сколько угодно
  раз», the price card, the package list, and the note «Можно исправить и
  проверить снова», a card inside the package card. On a phone the note is
  not shown.
- **One tinted answer in a comparison row.** The first pass gave both
  answers a box; two boxes in every row were cards inside the card. The
  agency's answer is plain text now, IITALY's stands on its warm tint.
- **A long paragraph folds.** «Что система делает сама, а где решаешь ты»
  ran eleven lines on a phone; four are shown and «Показать полностью»
  opens the rest (`ui/PhoneFold`). The words are always in the page, so a
  screen reader and a search read all of them; from the tablet up nothing is
  folded.

Left as it is, on purpose: the refund line under the price (its conditions
were added on 22 Nov so that «Возврат 7 дней» is not a bare promise), the
package list, the guarantees. `design-text-review` holds the three changes
at 390px and their absence at 820 and 1440px.

## The site through taste-skill's checker: the keyboard's ring, a row of chips, a thumb's room · 23 November 2026 (evening)

Owner: «прогони через этот плагин» (`/design-taste-frontend`). Its three
checkers were run over the built site: `consistency.mjs` on /, /prices,
/check, /plan, /universities, /guides, /portal and /test at 390px with its
320px walk (the home page at 1440 too), `copy-lint.mjs` and `perf.mjs`. Each
script was read first for what it touches: a server on 127.0.0.1, its own
headless Chrome with a temporary profile, a report folder.

**How the report is read.** The checker holds a page against the skill's
own page model: one section per screen, equal container edges, one heading
scale, one button style, body text at 7:1. That model is not this site's
(this file decides how IITALY looks), and it makes most of the count: on
/prices 51 FAIL, about 35 of them these. They are listed, not acted on.
The rest was checked by hand, one by one.

**Real, fixed:**

1. **The keyboard's ring had no colour.** `globals.css` draws the ring of
   every focused control in `var(--color-rosso)`. The name left the theme
   when the reds became one, and a declaration whose variable does not exist
   is dropped whole. Whatever had no ring of its own had none: the chat
   button, the thirty cities of the map. The name is defined again
   (`controls.css`) as the accent `#E63946`: 3.9:1 on paper, 4.5:1 on the
   dark map.
2. **A dark ring on the dark band.** On /guides the page shell's ring for
   links outranked the band's own light one: «Подробнее» showed 1.11:1. The
   band's and the carousel's rules are named through their container and
   win.
3. **Five filter chips in three lines.** On /universities a phone showed the
   chips as 2 + 2 + 1. Up to 480px they are one row swiped sideways, running
   to the card's edges, so a chip cut by the edge says there are more; the
   row keeps 8px above and below for the ring. In the cabinet the same row
   stays inside its column.
4. **A thumb's room.** «Подробнее о тесте» (22px tall) and the WhatsApp link
   under the purchase (43px) are 44 and 45px now. The carousel's dots on /guides,
   a dozen of them 14px apart, do not take a tap under a finger: the cards
   are swiped, the dots show the place; a mouse and the keyboard still pick
   a card by its dot.
5. **The «Тест» badge** read 4.1:1 (cream on `#E63946`, 14px). The badge
   alone is `#D52B3B`, 4.9:1; the accent itself is unchanged.

**Checked and left, the checker was wrong here:** «the focus lands on
something you cannot see» (it reads 60 ms after Tab, while the page still
scrolls to the control); «link goes to a page that does not exist» and
«broken requests» (its server does not know that /plan is plan.html);
overlapping words in `PhoneFold` (the folded lines are clipped on purpose);
`:focus { outline: none }` (it stands with `:focus-visible`); the faint ring
of «Крупнее» (measured against paper; on the map it is 8.8:1); `lang="ru"`
with Italian terms; the WhatsApp number (it is the real contact).

**Reported to the owner, not changed:**

- `copy-lint`: three headings of the home page are two fragments each
  («Проверка документов. Пункт за пунктом — в любое время.», «Одна Италия.
  Твой собственный выбор.», «Один шаг. Понятный маршрут.»). Words change
  only on request. Its count of dashes is an English rule.
- `perf`: paint and stability pass (layout shift 0, blocking time 26 ms on
  a wide screen, 0 on a phone). A full scroll of the home page downloads
  3.4 MB on a wide screen, 2.2 MB of it the two living pictures; 1.7 MB and
  0.85 MB on a phone. They start after their still picture, only near the
  screen, never on Save-Data, 2g or reduced motion.
- Phone covers are enlarged by height: /plan about 1.6× on a 3× phone,
  /check about 1.24×. A taller source needs a new picture.

`design-keyboard-touch-review` (new, guides group) holds 1–5 at 1440 and
390px, the chips at 320px too; it fails on the build before this pass.

## The cabinet road: mosaic medallions in the stage circles, Vespi on the map of Italy · 23 November 2026 (evening)

Owner, with a screenshot of the road at «Выбор программы»: «вот этих, что в
кругляшках milestones, делай, короче, тоже мозаичными. И вот та самая первая
иллюстрация, где Веспи смотрит на карту, она слишком простая. Вот играй с тем
свободным пространством и сделай ее более такой, ну, в целом итальянской, и в
целом более креативной… so it would look so much more immersive.»

**The stage circles.** The seven stage things (map and compass, books and
diploma, clipped papers, postbox, coins with a sprout, passport, house and
key) were soft 3D objects at 70% of the disc. They are round floor medallions
of the Galleria mosaic now, the site's cartouche style, all in one frame:
frame B of the cartouches (a cream disc in a thin ochre ring, a slim laurel
ring with terracotta berries, an ochre rosette above, a terracotta bow below),
the stage's thing in the middle. Round, the medallion fills the disc 4px
inside its rim, so the rim still says done (green), current (terracotta) or
ahead (sand). Of three frames tried, a band of running waves left the emblem
a third of the disc at 64px and an ochre disc in a dotted blue ring was loud
beside the road's calm circles. Files `stages/<stage>-mosaic-128/256.webp`,
9–30 KB each. The guide roads keep their studio objects.

**The first scene.** Vespi by the scooter with a map (280×200) became a
panorama of the stage itself: Vespi kneels at the edge of a huge unfolded map
with a pencil, and the Italy of the road rises out of the paper (felt Tuscan
hills and cypresses, the Colosseum, Florence's dome, a Venetian bridge over a
resin canal, a leaning tower), a dotted red route running from his pencil
across it, as the road's own dotted line runs on. It takes the empty half of
the first bend: up to 560×246 on a wide screen (box 260px high, centred on the
gap between the circles), 300px wide on a phone in a strip of its own. Of four
concepts drawn, the other three were landscapes (a white road to a hill town,
a belvedere with a lemon tree, a cypress avenue), as the old piece was; their
jobs are in `design/illustrations/road-2026-11-23.json`. 51 KB at 560px, 165 KB
at 1120 for sharp screens, lazy; the grey copy for a closed road is drawn with
the recipe of 7 Nov. The guide road and the universities comparison keep the
old `vespi-map`.

`design-portal-progress-review` holds the medallion files, that each fills its
disc inside the rim, the panorama's files, and that nothing on the road
overlaps.

## The questionnaire's second track: the master's · 23 November 2026 (evening)

Owner: «что у нас там по магистратуре… подруга сказала, что типа, когда она
нажала на магистратуру, дальше идут все равно вопросы, будто она школьница.
Вот, тогда нужно сделать типа и для магистратуры, типа вот кларифайнуть, и
сделать типа отдельный трек со всеми особенностями».

**What there was.** The level was the fourth question. Before it the applicant
had already said what school she finishes and what her marks are on the
five-point scale; after it she was asked whether she will be 18. The plan
had one master's step; the rest was the school route (CEnT-S, the 11-year
school, Foundation).

**The questionnaire.** The level is the second question. After «Магистратура»
the ten questions are her own (`src/data/wizardTracks.ts`):

| № | Bachelor's | Master's |
|---|---|---|
| 3 | Что заканчиваешь? (school, NIS, IB, college, a university year) | Диплом бакалавра уже есть? (on hand · still studying) |
| 4 | Какой средний балл? (4,7 и выше…) | Магистратура по профилю твоего диплома? (same · changing · not sure) |
| 5 | budget | Какой у тебя средний балл (GPA)? on the 4.0 scale |
| 7 | Какое направление? | Какое направление магистратуры? (medicine: «на врача в Италии учатся шесть лет с первого курса») |
| 8 | На момент отъезда тебе будет 18? | not asked |

Both tracks have ten questions, so «10 вопросов» stays true everywhere. A
changed level keeps the answers both tracks share and asks the rest again:
a school answer does not stay in a master's draft. The tiles, pictures and
the list «Твои ответы» are the same components; the new question has the
`folder` cartouche.

**No answer arrives marked** (the same evening; owner, a phone screenshot of
question 9 with «Уже в Италии» red: «Почему здесь по дефолту будто уже
нажали»). It was his earlier answer: after a changed level the questionnaire
led through every later question, and the answered ones arrived marked, as
if chosen for him. An answer now leads to the next question that has none,
or to the end: after «Магистратура» in the list of answers that is two
questions, the diploma and its profile. A marked answer is seen only where
the applicant goes back himself.

**A mark saved late does not pull the reader back** (the same evening, found
by CI on that fix). In the cabinet, someone who marked a step and opened
«Обзор» at once was returned to the stage page when the server's answer
came: the return ran whatever page the reader was on by then. It happens
only if the reader is still where the mark was made. On a fast connection
nobody saw it; a slow CI runner did, and `design-portal-focus-review` now
holds the case with the server's answer delayed by 700 ms.

**The plan.** The master's route (`buildPlan`, branch `master`):
«Проверь доступ в магистратуру» (Laurea Magistrale: two years, 120 credits;
the university judges the diploma, the transcript and the subjects; a
separate wording for someone still studying), «Сверь предметы диплома с
программой» when the field changes, «Выбери программу и узнай, как она
отбирает» (no school tests; Laurea Magistrale is not Master universitario;
the six-year medical programme is entered from school), then the shared
steps: DoV/CIMEA, language, calendar, DSU, visa, money, the draft, arrival.
No minor's step, no Foundation. The first document is «Диплом бакалавра и
приложение с оценками».

**Sources.** Three were added (`system`, `curricular`, `gmat`). The official
hosts were closed to the working environment that day, so they were read
through search results; `NEXT_CHAT.md` asks to open and re-read them.

**Not done then:** the paid cabinet's route had no master's wording. It has
since the same night, on the site's side (the next entry).

`admissions-review` holds the two tracks, the values the server accepts and
the master's plan; `admissions-browser-review` walks the master's
questionnaire at 1440, 390 and 320px.

## The master's from the first tap · 23 November 2026 (night)

Owner, on the track above: «Нет, ты уже в вопросе должен понять, что типа
вот человек магистр, и… перенаправлять его автоматически на магистрский
трек… если когда человек в вопросе первоначально нажимает на магистратуру,
ты должен понять, что это уже магистратура, так что все это нужно оформить.
Не должны быть такие детского формата вопросы, это уже серьезный человек,
который закончил или заканчивает бакалавр».

**What there was.** The level was the second question, after «Когда хочешь
начать учёбу?». Five of the master's ten questions were still the school
leaver's: «Как у тебя с английским?» with «Нужно подтягивать», the marks
captioned «почти отличник» and «хорошист», «поможем выбрать», a budget hint
about the family's help, «Где ты обычно законно проживаешь?». The paid
cabinet's profile form asked about school first («11 классов», «NIS Grade
12»), then the level, then «Какой бюджет комфортен семье?»; its route named
«вступительный тест» and «аттестат».

**The questionnaire.** «Куда поступаешь?» is question 1 for everyone, and
each answer says whom it is for: «после школы или колледжа», «диплом
бакалавра есть или скоро будет». After «Магистратура» nine screens follow in
the master's own order and wording (`src/data/wizardTracks.ts`):

| № | Label | Question | Answers |
|---|---|---|---|
| 2 | Диплом | Диплом бакалавра уже получен? | on hand · finishing |
| 3 | Профиль | Магистратура по профилю диплома? | same or adjacent · changing · not known |
| 4 | Направление | Какое направление магистратуры? | four fields · «Ещё выбираю» |
| 5 | Средний балл | Какой средний балл диплома (GPA)? | four bands of the 4.0 scale, no captions |
| 6 | Набор | Когда планируешь начать магистратуру? | the shared three |
| 7 | Язык | Чем подтверждаешь язык обучения? | certificate · level without one · below B2 · a programme in Italian |
| 8 | Бюджет | Какой бюджет на год учёбы и жизни? | the server's four, in her words |
| 9 | Проживание | В какой стране живёшь постоянно? | the shared three |
| 10 | Стипендия | the shared scholarship question | |

A question may carry its own short label (`WizQuestion.label`): «Вопрос 2 из
10 · Диплом». The line «Если тебе меньше 18, заполняй вместе с законным
представителем» under the phone field is not shown to a master's applicant.
The bachelor's track keeps its wording; only the level moved before the
intake.

**The plan.** A final-year student is told to settle the date of graduation
and the exact name of the degree; the sentence about a school certificate
stays only for an answer that is not a university's. The master's list of
documents gains «CV и мотивационное письмо» (conditional: if the programme
asks), after the four the local cabinet reads by their place.

**The cabinet, both the paid and the guest one.**
- The profile form (`PortalOnboarding.tsx`) asks the level first and shows
  nothing else before that tap. A master's applicant is then asked «Диплом
  бакалавра уже получен?» and «Какой бюджет на год учёбы и жизни?»; a school
  answer left from the other level is neither shown marked nor sent. The
  values sent are the server's own («Бакалавр», «Студент вуза КЗ»).
- «И все данные потом через код ты и пополни»: someone who answered the
  questionnaire on the site before buying is not asked from zero. An empty
  profile opens with the level, the education and the budget this device
  already holds (in the server's values), under the line «Отметили ответы из
  твоей анкеты на сайте. Проверь их и поправь, если что-то изменилось».
  Nothing is saved until «Построить маршрут»; a profile the server already
  holds is never replaced by the device's answers.
- The route comes from the server in a school leaver's words, and the server
  is not changed. For a profile whose level is the master's the site shows
  its own words for those steps (`trackRoadmap` in
  `src/lib/portalNavigation.ts`): «Выполнить условия отбора программы»
  instead of «…вступительный тест (TOLC, IMAT…)», «диплом и приложение»
  instead of «аттестат или диплом»; the stage lines «Поступление» and
  «Документы» have a master's wording (`stagePlain` in `plainWords.ts`). Ids,
  order, availability, dates and completion are the server's.
- Settings and the saved answers show «Диплом бакалавра: уже получен / будет
  до начала магистратуры», not «Студент вуза КЗ» and «Путь 12 лет».

**Left as it is.** The university cards and the comparison still show the
bachelor's entrance test of each university («Экзамен»): the catalogue has
no master's data per university, and none is invented. The glossary lines
(«CIMEA оценивает твой аттестат или диплом») are shared.

`design-master-cabinet-review` (new, guides group) walks the profile form
(empty, and opened with the questionnaire's answers), the master's route and
settings at 1440 and 390px with a server that answers
in the school leaver's words; `admissions-review` and
`admissions-browser-review` hold the order, the wording and the plan.

## Nothing cut by its container · 23 November 2026 (night)

Owner, a screenshot of /plan/9: «Вот видишь, здесь, короче, неровность, и
нужно вот такие неровности решать. Вот причеши весь сайт на такие вот…
точка, она… обрезается, и это очень нехорошо». Then, on the cabinet road:
«при наведении как-то вот страшно все это обрезается. Лучше бы был бы такой
легкий блюр».

**How it was found.** A detector (`scripts/review-clip-detector.js`) went
over all 93 pages at 1440, 768 and 390px, empty and with a twelve-step plan,
and over the paid cabinet: the page as it stands, every control under the
keyboard and every `:hover` rule that moves or rings something. It reports
a ring or soft shadow (box-shadow, outline, a ring drawn by a pseudo-element)
or a small round mark that an ancestor's overflow cuts. A full-bleed band
painted by a huge spread, and a card half out of a carousel, are left alone.

**What it found and what changed.**
- *The step path* (StoryPath: every step of the plan and of the guides). The
  row scrolls sideways and a scroller clips on both axes; the current stop's
  ring (5px round a circle scaled 1.08) and the keyboard's ring had 4px above
  the circles and were cut flat on top, on 122 pages and widths. The scroller
  now has 8px on every side and gives it back in its margins, so the row
  stands where it stood.
- *Twelve steps on a phone.* The plan of an 11-class leaver under 18 has
  twelve steps; 35px stops made 420px in a 350px column and the last circle
  stood cut in half at the edge. A dense row on a phone divides its own width
  (container units): twelve fit at 390px (24px circles) and at 320px (19px).
- *The keyboard's ring of the first and last chip* in the guides categories
  (desktop) and the universities filters inside the cabinet: 6px of room.
- *The cabinet road under the mouse.* A stage got a grey 1040px block: hard
  edges, square against the current stage's rounded panel, over the road
  line. It is now a soft warm glow round the medallion and the title that
  fades out on every side (a radial gradient on `::before`, opacity only),
  the road shows through, and the medallion rises 2px as a step's circle does.

**The medallions** (the same night; owner: «вместо вот этих двух на паспорте
должен быть паспорт Казахстана, и на монетках там должен быть веспи
начеканенный на монете, как на древних римских монетах»). The visa stage
shows the passport of Kazakhstan: the cover in the flag's sky blue with the
gold state emblem (the shanyrak, two winged horses, a star) and the red check;
the scholarship stage a gold coin with Vespi minted in a laurel wreath and a
beaded rim, as on a Roman aureus, before a short stack of coins. New names
(`visa-kz-mosaic`, `dsu-aureus-mosaic`); jobs in
`design/illustrations/road-2026-11-23.json`.

`design-clip-review` (new, portal group) runs the detector on the pages that
carry each kind of row, at 1440 with hover and at 390 and 320px, and holds
the owner's page, the road's glow and the two medallions. On the build before
this change it fails with «the current step's ring has room above it
(-2.4px)».

