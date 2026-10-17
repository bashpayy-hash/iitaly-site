# Vespi: три промпта для продуктового интерфейса

Подготовлено по запросу пользователя 17 октября 2026 года. Это готовые промпты
для Higgsfield, а не отчёт о генерации: новые изображения и видео не заказывались.

## Референс и единая идентичность

Загрузить `design/mascot/vespi/vespi-route-master.webp` как **визуальный референс
персонажа** в поле reference image выбранной модели. Не ограничиваться путём
в тексте промпта. Для крупного плана дополнительно можно приложить
`public/mascot/vespi/vespi-avatar-route-192.webp`, но большой мастер — главный
источник формы и материалов.

Сохранить узнаваемое лицо: кремовый округлый силуэт, чёрные овальные глаза,
тонкие дуги бровей, маленькая улыбка и мягкие персиковые щёки. Сохранить красный
глянцевый шлем с кремовой отделкой, одной слегка смещённой кремовой полосой-маршрутом
и небольшой оливковой точкой на ней. Это фирменная деталь Веспи Баурысакова,
а не логотип Meta. Шлем, лицо и выражение важнее новых аксессуаров.

Новый запрос пользователя разрешает три позы без скутера и замену пелерины
на лаконичный воротник. Остальной сайт и принятый персонаж на дороге не меняются
автоматически. Капсулы, радужное кольцо и подсветку интерфейса рисует CSS;
не запекать их в изображение.

Промпты ниже написаны по-английски для прямой вставки в генератор. Указания
к формату — требования к результату, а не названия или неподтверждённые параметры
конкретной модели Higgsfield.

## 1. Vespi — AI Avatar

**Назначение:** круглый аватар в поиске, помощнике и нижней плашке; видимый
размер 40–64 px. Квадратный мастер, желательно 1024 × 1024 px или больше.

**Prompt**

```text
Create a premium product-UI portrait of Vespi, the exact friendly IITALY mascot
in the attached reference image. This is the same individual, not a redesign
or a new species. Preserve the reference's softly rounded ivory face, small
black oval eyes, thin curved eyebrows, subtle peach cheeks and gentle curved
smile. Preserve the glossy Italian-red open-face helmet, cream edge trim,
the single slightly off-center cream route stripe and its small olive waypoint.
Keep the helmet's route marking in the same position and direction as the
reference. No brand logos and no writing.

Chest-up portrait without a scooter. Replace the short cape and round button
with a minimal cream knit sweater collar and a narrow muted-olive inner collar
detail. Use a clean, contemporary student-companion silhouette: relaxed
shoulders, quiet confidence and no toddler outfit. Do not age the face into
a human adult or change its friendly proportions. The face remains recognizably
Vespi. Material is refined soft-touch matte vinyl blended with extremely short,
even micro-plush; softness is visible in broad shading, not in noisy long fur.
The helmet alone has a controlled glossy highlight.

Face the camera directly with warm, confident eye contact and a restrained
smile. Use a level eye-line and a very subtle natural head tilt. The helmet
and face dominate the frame; the collar occupies only the bottom fifth.
Square composition. Keep all essential facial features, the full helmet and
the cream route stripe within the central 80 percent of the canvas so a circle
crop will not cut the helmet or cheeks. Leave a small clear breathing margin
above the helmet. Both eyes and the smile must remain legible at 40 pixels.
No hands, props, vehicle, scene, speech bubble or interface elements.

Soft studio key light from upper left, gentle fill, subtle warm bounce and
balanced neutral color. Smooth clean contours, no hard rim glow, no dramatic
contrast. Isolated transparent background if the selected model supports
real alpha. Otherwise use an absolutely flat light neutral background, with
no cast shadow, texture, vignette or baked checkerboard, suitable for clean
background removal. Premium friendly 3D character rendering, calm and credible
for students aged 16–18 and their parents.
```

**Negative prompt**

```text
different face, changed eye shape, large human eyes, human skin, photoreal
person, toddler proportions, baby outfit, pacifier, childish cape, giant grin,
teeth, fluffy long fur, noisy fibers, extra accessories, scooter, handlebars,
hands, cropped helmet, distorted stripe, extra helmet symbols, Meta logo,
Italian flag logo, lettering, watermark, app interface, gradient ring,
neon rim light, glitter, busy background, ground shadow, checkerboard pattern,
blurred eyes, face asymmetry, oversharpening, waxy orange skin
```

**Проверка:** сначала посмотреть результат в круге 40 × 40 px. Если лицо
перестаёт читаться, приблизить кадр и убрать лишнюю ткань, а не увеличивать глаза.
Для сайта подготовить статичные прозрачные WebP 96 и 192 px; мастер оставить
отдельно. Не назначать новый файл в интерфейс до проверки сходства.

## 2. Vespi — Bureaucracy Expert

**Назначение:** иллюстрация внутри совета и блока проверки документов.
Мастер 3:2, желательно 1536 × 1024 px. Полная поза читается при ширине 160–240 px;
для маленького аватара нужен отдельный портретный кроп лица, а не уменьшение всей
фигуры с документом.

**Prompt**

```text
Create a waist-up product illustration of Vespi, using the attached IITALY
mascot as the strict identity reference. Preserve the same ivory face,
small black oval eyes, thin brows, peach cheeks, gentle smile and glossy red
Italian helmet. Keep the reference's cream helmet trim and the single
off-center cream route stripe with its small olive waypoint. Preserve the
same clean soft-touch matte micro-plush material and the same restrained
cream sweater collar with a narrow olive accent as the companion portrait.
No scooter and no cape.

Add delicate, understated round-rectangular eyeglasses with thin warm-gray
frames. The lenses are clear, without glare hiding the eyes. Vespi looks
competent, approachable and attentive, never stern or officious. This is a
friendly document-preparation assistant, not a government official.

Waist-up composition on a 3:2 canvas. Place Vespi in the left two thirds,
leaving clean breathing room toward screen-right. One hand holds a small
off-white sheet at lower chest height. On the sheet show only two or three
faint abstract horizontal lines and a single small green checklist tick.
The tick is a simple preparatory checklist mark, not a stamped approval.
There must be no seal, signature, institutional emblem, passport, personal
data, country crest, official stamp, approval wording or readable text.

The other arm makes one clear welcoming pointing gesture toward screen-right,
at a slight downward angle, where a separate real UI action will sit outside
the illustration. Keep the entire pointing hand inside the image bounds.
Use the reference's soft rounded hand anatomy and a clean, readable gesture;
do not introduce human skin, extra fingers or a giant hand. The eyes gently
follow the direction of the pointing gesture, while the face remains in an
open three-quarter view and both eyes remain visible. The gesture suggests
"let's check this together", not "officially approved".

Keep the face and helmet large enough to survive a portrait crop. The document
must not cover the mouth or sweater collar. Separate hand, paper and torso
with clear negative space; avoid tangencies and overlapping silhouettes.
Quiet studio light from upper left, broad soft shading, clean edges,
one restrained helmet highlight. Isolated on a real transparent background
if supported, or a perfectly flat light neutral background ready for removal.
No environment, desk, UI, button, speech bubble, gradient ring, floating icons,
certificate border or cast ground shadow. Premium calm 3D product art.
```

**Negative prompt**

```text
government uniform, consular officer, official badge, approval seal, rubber
stamp, Approvato text, admitted text, visa approval, guarantee, red cross,
passport details, readable document, institution logo, multiple checkmarks,
neon green glow, changed face, old professor, human hands, extra fingers,
missing fingers, extra arms, pointing off the left side, hand outside canvas,
document covering face, oversized glasses, sunglasses, lens glare hiding eyes,
childish cape, scooter, clipboard blocking body, crowded accessories,
office scene, rendered CTA button, text overlay, watermark, noisy fur
```

**Проверка:** направление жеста должно совпадать с настоящей кнопкой в вёрстке.
На телефоне, где кнопка переносится вниз, использовать портретный кроп либо
поставить персонажа слева от текста. Не зеркалить готовый рисунок: это поменяет
сторону фирменной полосы. Зелёный значок на иллюстрации не заменяет фактический
статус проверки документа, не появляется как результат проверки и не означает,
что документ примет вуз или консульство.

## 3. Vespi — Dynamic Motion

**Назначение:** спокойная микроанимация помощника, 2,8 секунды. Сначала получить
и утвердить статичную позу эксперта; затем использовать её как first-frame /
image-to-video reference в поддерживаемом выбранной моделью поле. Не просить
видеомодель заново придумывать персонажа только по тексту.

**Prompt**

```text
Animate the exact Vespi character in the supplied approved portrait. Preserve
the first frame's face, helmet, cream route stripe and olive waypoint, glasses,
cream-and-olive collar, lighting, material and proportions without any identity
drift. A calm 2.8-second seamless micro-loop, locked camera, square chest-up
composition. No scooter. Keep the whole helmet and both hands within a generous
circle-safe central area; the face remains the dominant readable element.

Vespi holds a small plain sheet near the bottom of the frame with one hand.
The paper has only subtle abstract lines: no readable text, approval seal,
status label or personal information. Opening pose: relaxed shoulders,
friendly neutral smile, gaze lowered slightly toward the sheet.

0.0–0.7 seconds: a tiny attentive eye movement scans the sheet from upper left
to lower right, with one subtle natural blink. The head and paper stay stable.
0.7–1.2 seconds: Vespi looks up toward the viewer and makes one small warm nod;
the smile brightens only slightly, without changing the mouth shape or showing
teeth. The motion communicates understanding and encouragement.
1.2–1.8 seconds: the free hand rises beside the shoulder into one clear gentle
thumbs-up, held briefly. No exaggerated pumping, jumping or celebration.
1.8–2.8 seconds: the hand eases back down, the smile settles and the gaze returns
to the same spot on the paper. End at the exact opening pose with matching
hand position, eye-line, lighting and background for an invisible loop seam.

Keep movements small, slow and organic, with soft ease-in and ease-out.
Maintain perfectly consistent glasses, face outline and helmet markings in
every frame. The body does not bob continuously. No camera movement, zoom,
focus pull, perspective change, particle effects, glowing approval mark or
changing document. Fixed neutral studio lighting and clean background matching
the source image. Silent. The gesture is friendly guidance, not a claim that
a real document has passed review or obtained official approval.
```

**Negative prompt**

```text
face morphing, identity drift, changing glasses, changing helmet stripe,
different clothes, extra arms, extra fingers, paper morphing, fake text,
official approval, success badge, animated stamp, confetti, sparkles, sound,
speaking mouth, lip sync, exaggerated grin, teeth, wink, frantic blinking,
rapid scan, head bounce, camera movement, zoom, shaking, heavy motion blur,
lighting flicker, background changes, loop jump, cropped hand, strobing
```

**Экспорт и воспроизведение:**

- Сохранить чёткий первый кадр как статичный WebP-постер. На маленьких 40–64 px
  аватарах по умолчанию использовать постер: документ и жест там не читаются.
- Экспортировать короткое видео без аудиодорожки. Прозрачность использовать
  только в формате и браузерах, где она действительно поддерживается;
  иначе сделать вариант на ровном цвете поверхности карточки. Не имитировать
  прозрачность шахматным фоном. Не доставлять тяжёлый GIF.
- Источник может быть бесшовным, но на сайте по умолчанию проигрывать **один цикл**
  при появлении осмысленной подсказки. Не заставлять помощника бесконечно
  кивать рядом с длинным текстом; непрерывной анимации нужна доступная остановка.
- При `prefers-reduced-motion: reduce` показывать только постер, не загружать
  и не запускать видео. Так же поступать при экономии трафика или недоступности
  видео. Вне видимой области и на скрытой вкладке воспроизведение останавливать.
- Зафиксировать размеры контейнера до загрузки. Анимация декоративная:
  итог проверки и следующее действие всегда остаются настоящим текстом.
- Не запускать жест как подтверждение приёма документа. Закрытие шага, статус
  проверки и решение вуза определяются данными продукта, а не эмоцией маскота.

## Приёмка набора перед подключением к сайту

Сверить три результата рядом с исходным мастером: одно лицо, одна форма шлема,
одинаковая полоса и один характер материалов. Проверить реальный круглый кроп
40 / 48 / 64 px на светлой карточке и в градиентном кольце, затем экспертную позу
на мобильной ширине 390 px. Любой текст, зелёный официальный штамп, лишние пальцы,
сломанная петля или изменившееся лицо — основание исправить ассет до публикации.

Для текущей реализации страницы использовать существующие локальные ассеты,
пока эти новые позы не созданы и не приняты. Промпт сам по себе не является
изображением; не подключать несуществующие пути и не подменять ими рабочий аватар.
