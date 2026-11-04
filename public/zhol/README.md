# Portal zhol assets

Source: the owner's supplied `zhol-style-kit.zip` and `STYLE_PROMPT.md`.

- `bg_cream.jpg` and `bg_dark.jpg` are the supplied paper textures, unchanged. The Now plate uses `bg_dark.jpg`; the page paper is a 13 KB 640px tile cut from `bg_cream.jpg` (`public/textures/zhol-paper.webp`).
- `icon-msg.webp` is the supplied `icon_msg.png`, resized to 80px.
- The kit's Inter Tight WOFF2 subsets were removed on 4 November 2026: the same family is already self-hosted for the whole site through `next/font/google` in `src/app/layout.tsx` (`--font-inter-tight`), so the cabinet now reads that variable instead of shipping a second copy.

The portal uses these local assets without external font requests or image-generation services. The zhol wordmark is not used; iItaly keeps its own branding. Only assets used by the portal are shipped.
