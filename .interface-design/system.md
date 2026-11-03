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

## Cabinet tiles (3 Nov, apple.com home grid)

- Overview = tile stack on the full 1296px width: hero «Now» (light `#FFFDF9`) → route board (dark `#2A2420`) → 2×N grid; 12px gaps, 28px radius, no shadows or hairlines.
- Tile anatomy: label (mono 11px caps) → title `clamp(28px,3vw,36px)` 600 → line 17px → meta (mono 11px caps) → two 44px pills (filled terracotta `#B83A27` / outlined; cream `#FAF6EE` on dark) → object at the bottom (250px stage, ≤72% width; 210px on phones).
- Grid: two columns from 700px of container width, checkerboard tones (`4n+2`, `4n+3` dark); an odd last tile spans both columns; one column below 700px, even tiles dark.
- Hero: greeting 21px as the label, headline `clamp(32px,3.4vw,48px)`, one 17px line, mono cite, the deadline in 13px sans (the day count 22px terracotta), pills; no porthole, no mascot element (3 Nov).
- Every tile row is `max-width:100%` with `overflow-wrap:anywhere`: nothing may spill past a tile edge (the live overlap of 3 Nov).
- Hero landscape (3 Nov): the «Now» tile is 700px tall (600 on phones), cream for the top 40% (scrim to transparent by 78%), the Tuscan landscape with Vespi on a scooter covering the tile (`object-position: 30% 62%`; `100% 62%` on phones, where only the road shows), 290px of bottom padding (300 / 220) under the pills. Home theme tiles: 4:5, 20px radius, flat light `#FFFDF9` / dark `#2A2420` by turns, label 11px mono terracotta, title 21px 600, line 14px quiet; the object alone at the bottom centre (≤68% wide); phones: one column, copy left, object right. Landscapes never sit on navigation tiles.
- Route lines (3 Nov): dashed `#A69E90`, solid progress `#A33421` (1.5px), current dot 11px with a 2px terracotta ring; no plane, no callsign. On the dark board the accent is `#F29A89`.
