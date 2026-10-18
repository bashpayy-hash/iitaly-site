# Vespi: editorial and product UI pack

Use the approved reference images, not a text-only interpretation of the character. This pack prepares two stills and three motion loops; it does not claim that new images or videos have already been generated.

## Identity lock — prepend to every prompt

> The attached approved character is Vespi, IITALY's Italian–Kazakh AI copilot. Preserve the exact recognizable cream face silhouette, oval dark eyes, eyebrow shape, small curved smile, restrained peach cheeks, and glossy Italian red helmet. Preserve the helmet's cream route stripe and tiny olive landmark dot; they are identity details, not new logos. Keep the same cream, warm olive, coral-red and warm brown materials as the reference. The body has clean matte soft-touch vinyl with a very short, subtle plush finish; no long fuzzy fibers or visible procedural noise. Friendly, capable, calm and contemporary, appropriate for a 17–18-year-old student and their parents. No toddler proportions, baby costume, cape button, exaggerated grin or toy-like oversized eyes. Use a minimal cream knit collar with one restrained olive accent. The helmet remains glossy; the face and clothing remain matte. Do not redesign the face or change its apparent identity.

Supply `public/mascot/vespi/vespi-ride-route-640.webp` as the primary identity reference. For the copilot and scanning images also supply `design/mascot/vespi/roles/inspector-master.webp` as the glasses/document reference. Use the images themselves as attachments in Higgsfield.

## Still 1 — Hero close-up: “Always on the way”

**Output brief:** 16:9 landscape, at least 1920 × 1080. Make a matching 4:5 mobile composition as a separate variation. Keep the typography out of the generated image.

**Prompt**

> [IDENTITY LOCK] Create a premium editorial 3D character portrait for a university application platform. Waist-up to chest-up framing, 85mm portrait lens, shallow depth of field with the face and eyes crisply in focus. Vespi is on the RIGHT 46% of a wide 16:9 frame, turning three-quarter toward the camera as if arriving to help. A slight forward lean and gently offset shoulders suggest motion without motion-blurring the face. Confident direct eye contact, a small reassuring smile. A very small lower-right suggestion of a scooter handle is acceptable, but no wheel, full scooter or complicated vehicle silhouette. Warm golden-hour rim light along the helmet and shoulder, broad soft studio fill, restrained warm contact shadows. Smooth, clean matte cream face and knit collar; rich glossy red helmet with one controlled sun highlight. The LEFT 50% is genuinely quiet negative space for large website typography, with a warm ivory/alabaster field matching #FAF8F5 and a very subtle cream-to-peach atmosphere. Keep the left field low contrast and prop-free; never place facial features, hands or red highlights behind the text area. Subtle foreground/background depth, elegant magazine composition, tactile but not fuzzy, warm and trustworthy. Keep the entire helmet and eyes inside the central 80% safe area. No generated lettering, UI labels, logos or watermarks.

**Mobile variation suffix**

> Recompose as 4:5. Vespi occupies the lower-right 55%, with the entire helmet visible. Leave the upper-left 40% quiet for real HTML typography. Do not shrink the character into a full-body mascot sticker. Keep the face at least 30% of image width.

**Cutout variation suffix**

> Render the same pose and light as an isolated transparent-background PNG/WebP master, with no baked-in aura or text. Preserve natural edge alpha, with no white fringe or opaque ground plane. The website will supply the ivory field and shadows.

## Still 2 — Portal copilot: over-shoulder / three-quarter expert

**Output brief:** square master, at least 1024 × 1024, plus a 4:3 crop. Neutral document state; no implied approval.

**Prompt**

> [IDENTITY LOCK] Create a three-quarter over-the-shoulder editorial portrait of Vespi carefully examining an application document. Camera is just behind and to the left of the near shoulder, at eye level, with the head turned enough that both recognizable eyes and the small friendly smile remain visible. Chest-up framing, thin elegant warm-metal glasses, cream knit collar and a minimal olive trim. Vespi holds a simple warm ivory document panel at a comfortable reading angle; the free hand lightly points to one line. The translucent checklist feels like quiet etched glass illuminated by warm cream and soft amber, NOT a blue sci-fi hologram. Use short abstract rules, one neutral outlined checkbox and subtle document geometry only; no legible words, no institutional seals, no green checkmark or acceptance stamp. Gentle curious head tilt, attentive expert expression, calm concentration. The red helmet has a soft warm rim highlight; the face is matte soft-touch with almost imperceptible short plush texture. Soft studio key and restrained contact shadows. Warm ivory background matching the existing IITALY palette, clean enough to cut out. Leave 20% clear space on the right for interface copy. No extra limbs, no large props, no laptop, no dashboard baked into the artwork. Preserve a clear face silhouette at a 96px crop.

## Motion model and delivery settings

Higgsfield's current read-only model catalogue lists **Kling 3.0 Turbo** (`kling3_0_turbo`) with image-to-video start-frame input, whole-second durations **3–15**, and **720p / 1080p** output. Select **duration = 3 seconds**, **resolution = 1080p**, **1:1** for UI portraits or **16:9** for the editorial scooter crop. Attach the approved still as the start image. A prompt cannot guarantee frame-perfect looping: inspect the first and last frames and trim a stable cycle after generation. Do not claim a matching-end-frame control in this model; the listed input is a start frame.

Use a locked camera, no cuts, no camera travel, no speech, music, sound effects or generated subtitles. Deliver an original master plus a silent, trimmed 3.000-second WebM/MP4 loop with a still poster. Do not convert to GIF. Keep the video off the critical rendering path; use `preload="none"`, play only while visible, pause off-screen, and show the still poster under `prefers-reduced-motion: reduce`. Do not ship a generated clip until its identity and loop seam have been reviewed.

## Loop 1 — On the way

**Prompt**

> [IDENTITY LOCK] Animate the supplied Vespi scooter close-up as a perfectly calm three-second UI loop. Locked camera and unchanged composition. 0.0–0.8 seconds: a tiny suspension vibration, less than 1% of frame height; the rider remains stable and the eyes stay sharp. 0.8–1.6 seconds: one warm sunlight highlight moves gently across the glossy red helmet; Vespi gives one small confident nod and a brief natural wink. 1.6–3.0 seconds: return smoothly to the exact starting posture, neutral open eyes and original helmet highlight. The scooter does not travel across the frame. Keep hands attached to the handlebar and preserve all facial proportions. Match the first and last pose and lighting as closely as possible. No bouncing cartoon physics, speed streaks, wheel blur, particles, camera movement, text or sound. A quiet “I am on my way” feeling, not a celebration.

## Loop 2 — Scanning

**Neutral scanning loop — use during a pending check**

> [IDENTITY LOCK] Animate the supplied expert portrait for exactly three seconds. Locked camera. Vespi wears the same thin glasses and reads the same warm ivory document. During 0.0–1.5 seconds, the eyes make three tiny left-to-right reading movements along the abstract lines, followed by one small downward glance. During 1.5–2.2 seconds, the head tilts by about two degrees in concentration. During 2.2–3.0 seconds, return to the exact starting gaze and head position. Breathing stays subtle. The document geometry and glasses never morph. Keep illumination warm and neutral throughout. No green light, checkmark, approval stamp, triumphant expression, progress percentage or implied final decision. First and last frames should match.

**Approved-result variant — run only after a real approved IITALY check**

> [IDENTITY LOCK] Make an exactly three-second, restrained approved-result loop from the same expert start frame. 0.0–1.2 seconds: Vespi finishes the small reading glance. 1.2–1.8 seconds: a faint sage reflection, limited to the existing approved success palette #1F7A68 / #E6F4F1, softly lights the lower document edge; Vespi gives one small satisfied nod. 1.8–3.0 seconds: the reflection fades and the portrait returns to the original neutral pose. No green stamp, institutional acceptance, confetti, sparkle burst or guarantee. A successful internal document check only. Keep the first and last frames neutral and visually matched.

**Product binding:** the green variant must never run while uploading, scanning, retrying, unavailable, unreadable or awaiting clarification. It represents only the actual `approved` review outcome. A “passed” internal check is not acceptance by a university or consulate.

## Loop 3 — Idle waiting

**Prompt**

> [IDENTITY LOCK] Animate the supplied calm Vespi portrait as a seamless three-second idle UI loop. Locked camera, fixed crop and fixed soft warm lighting. One shallow breathing cycle moves the shoulders by less than 1% of frame height. Between 0.8 and 1.6 seconds, Vespi turns the head just two degrees toward the document area, then smoothly returns to the initial camera-facing posture by 3.0 seconds. Use one very subtle natural blink away from the loop seam. The glossy helmet reflection stays stable. The face remains reassuring and attentive, never impatient, sleepy or demanding. No waving, typing, talking, large gestures, moving background, glowing badges or additional props. Match the first and last frame as closely as possible. No sound.

## Shared negative prompt

> identity drift, different face, changed eye shape, baby, toddler, childish cape, long furry fibers, noisy fur, waxy skin, over-polished face, oversized grin, visible teeth, deformed hands, extra fingers, extra limbs, detached glasses, floating props, morphing document, generated letters, institutional seal, fake approval, visa guarantee, university acceptance, confetti, flash, strobe, particles, neon, cyan, blue, violet, purple glow, cold background, camera shake, orbit, zoom, hard cut, motion blur across eyes, watermark, subtitles, audio

## Assets actually shipped with this UI revision

The live editorial scene uses a responsive upper-body crop of the **existing approved** `design/mascot/vespi/vespi-route-master.webp`, encoded as 480px and 720px WebP files. The portal uses the existing approved inspector and copilot roles. No ungenerated close-up, new angle or motion clip is referenced by the product. Replace these with reviewed Higgsfield outputs only after identity and small-size checks pass; the prompt pack does not authorize spending generation credits.
