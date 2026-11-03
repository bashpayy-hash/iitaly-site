# IITALY interface system

Saved 3 November 2026 after the «убери все неровности и неточности» pass. `DESIGN.md` stays the source of truth for direction; this file holds the measured values to keep new work on the grid.

## Direction and feel
Warm paper, riso objects, Apple-calm. Flat (no cast shadows): level is colour — paper `#F4F0E7` → white card → cocoa band `#2A2420`.

## Column and gutters
- One column: 1216px content, 32px gutters (edges at 112px on 1440px). Header, home sections, guides index and footer share it. Topic pages: 880px reading column. Prices: 640px column.
- Phone gutter: 20px everywhere (no 16 or 24).

## Radius scale
- 999px — pills, chips, small badges.
- 28px — cards and tiles (route card, scene cards, Vespi card, prices cards, questionnaire tile, step cards).
- 16px — elements inside a card and fields (scene windows, stats strip, answer capsules, search field, step-page sentence tiles and pager, topic facts).
- Circles 50% for round buttons. No 20/22/24/26/32/980.

## Card padding
- Home cards: 36px desktop, 20px phone, so text in neighbouring cards starts on one line.
- Prices cards: 32px desktop (`sm:p-8`), 24px phone (`p-6`).

## Type
- Floor: 11px for Space Mono caps labels, 12px for any other text (the Modulo 1 form replica is the only exception).
- Peer card titles share one size: `clamp(28px,3vw,40px)/1.08`, weight 600.
- Section titles 44–52px; mega band titles 68px.

## Text greys on paper (guides)
`#141413` page title · `#241F1C` ink · `#3F3933` body · `#57514B` secondary/meta. Home scene captions use `#57514B` too.

## Motion
`cubic-bezier(.22,1,.36,1)` for movement, `cubic-bezier(.4,0,.2,1)` for colour; 160 / 320 / 520ms.

## Patterns
- Topic carousel: cocoa band, unframed object on a 260px stage (210 phone), equal 340px slides, subgrid rows (stage, title 26px, teaser 15px, actions), cream pill + quiet link.
- Carousel controls: 48px round buttons (44 in rows), dots capsule `#3A322D` on dark, `#E8E1D5` on paper.
