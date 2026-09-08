# IItaly — бриф для генерации маскота в Nano Banana (по референсам)

Этот промпт описывает концепцию сайта и его стилистику — конкретного
персонажа не диктует, потому что визуальную основу задают референсы,
которые прикладываются к генерации отдельно.

## Готовый промпт (копировать в Nano Banana вместе с референсами)

```
I'm designing a brand mascot for IItaly, a service that helps Kazakhstani
high-school students (16–18 years old) and their parents apply to
universities in Italy. The product's positioning is "a system instead of
an agency" — it's calm, procedural, and trustworthy rather than flashy or
salesy. The tone is honest and understated: short factual statements, no
exaggerated excitement, no drama even when flagging a problem. The brand
needs to feel credible to cautious parents while still feeling current and
appealing to teenagers — not childish, not corporate-stiff.

Using the attached reference image(s) as the visual basis for the
character, generate the mascot in the following style:

Flat 2D vector illustration style. A bold, uniform ink-colored outline
(#211a14) with rounded line joins, and completely flat solid color fills —
no gradients, no gloss, no metallic reflections, no drop shadows or
ambient shading baked into the character itself, no 3D rendering, no
photorealism. The color palette is limited to: #b4262b (primary accent,
warm red), #8f1d21 (darker shadow/panel tone of the same red), #211a14
(ink outline and dark details), #fffdf8 (off-white highlights), and
#3f6b4f (a muted green, used sparingly if needed). Do not introduce colors
outside this palette.

Keep the character's expression restrained and calm rather than
cartoonishly exaggerated — convey mood through posture, the angle of a
limb or feature, or a simple curved line, rather than through a wide-open
mouth, big cartoon eyes, or dramatic eyebrows. The character should read
as a steady, quietly confident travel companion, not a hyperactive mascot.

Background: fully transparent, no scenery, no ground shadow, no text, no
watermark, no logos. The silhouette should stay clean and simple enough to
be recognizable even at a small icon size (around 32–48px).
```

## Если нужно сгенерировать несколько поз одного персонажа

После того как утвердите первую (референсную) генерацию — прикладывайте
её саму как дополнительный референс к каждой следующей позе вместе с
исходными референсами, и добавляйте к промпту одну строку с нужным
состоянием, например:

- `, in a welcoming pose as if gesturing hello`
- `, in a focused pose as if carefully reviewing something`
- `, in a quietly celebratory pose`
- `, in a calm waiting pose`
- `, in an alert pose, without panic`

Не описывайте персонажа заново другими словами — так silhouette и палитра
разойдутся между позами; всегда используйте один и тот же base-промпт выше
плюс одну короткую добавку про позу.
