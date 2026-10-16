# Design analysis: `src/ref/mainref.mp4`

- Source: `src/ref/mainref.mp4` (22.0 s, 720×1280, direct vertical screen capture, no device bezel)
- Run: 2026-10-11 · frames in `frames/` (1 fps, 22 frames) · batch notes `frames/batch_001–003.md`
- Representative frame: `screens/screen_01_poster_page.png`
- Target: the whole portfolio UI (`index.html`, `src/App.jsx`, `src/styles/**`, `src/components/**`, `src/animations/**`, `src/data/ribbons.js`)

---

## Artifact 1: design system observed

**Palette**
- bg paper `~#ECECEC` with a crumpled-paper shade `~#DADADA` (frames 001–022)
- graph-paper grid lines `~#D4D4D4`–`#D6D6D6` (frames 001–022)
- ink, headings and body `#111111`; body copy is dark grey `~#3A3A3A` (frames 001–022)
- band black `~#0B0B0B`–`#0F0F0F`, with band text off-white `~#F0F0F0` (frames 001–022)
- accent red for the sticker outline: `~#F2231B` / `~#FF2B1E` / `~#F0281E` (frames 001, 009, 016)
- selection-box stroke and handles: pink-red `~#E05A64` / `~#E07580` (frames 001, 009, 016)
- skill tiles keep their brand colours (Ps `#001E36`/`#31A8FF`, Ai `#330000`/`#FF9A00`, Blender `#E87D0D`) (frame 001)

**Type**
- Display: ultra-wide, extended, heavy grotesque, all caps, tight tracking. The batch notes match it to the "Archivo Expanded Black / Monument Extended" class (frames 001–022)
  - wordmark ≈ 78–80% of viewport width
  - "HELLO" ≈ ¼ of the wordmark
  - section heads ("EDUCATION", "SKILLS", "EXPERIENCE") ≈ ½ of "HELLO"
  - kickers ("DESIGNER / ILLUSTRATOR", "2026") ≈ 2.5% of width, bold extended caps, set on the wordmark's top corners
- Body: small regular sans, left-aligned, dark grey. Dates and roles are bold small, organisations regular small (frames 001, 009, 016)
- Script: a handwritten marker signature in thin black pen, next to a hand-drawn curved arrow (frames 001–022)
- Marquee: the same extended black in off-white, filling the band height (frames 001–022)

**Spacing / layout rhythm**
- One centred poster stack: wordmark → dingbat row → 3-column About → full-bleed band → next section heading + cards (frames 001–022)
- About grid ≈ 20% (photo) | 40% (HELLO + bio + education) | 40% (skills + experience) (frame 009)

**Corner radii**
- 0 on everything structural (band, boxes, photos)
- ~6–8px on skill tiles only (frames 001, 016)

**Buttons**
- None visible in the capture.

**Cards / surfaces**
- Polaroids: thick white border (thicker at the bottom), rotated a few degrees, small shadow (frames 001–022, bottom edge)
- Photo frame: a design-tool selection box. Thin 1px pink-red stroke with 8 small white square handles (corners + mid-edges) (frames 001, 009, 016)
- Sticker cut-out: a photo cut out to the person's silhouette with a thick red offset outline (frames 001, 009, 016)

**Iconography**
- Real app/brand icons on rounded-square tiles, 3×2 grid (frames 001, 009, 016)
- Dingbats ✸ (8-point burst), ✦ (4-point star) and ♣ (club), used both as section ornaments and as marquee separators (frames 001, 009, 016)

**Signature motifs**
- Paper textures (frames 001–022):
  - crumpled paper with a graph grid over the whole page
  - torn-paper edges, with white fibres visible, top and bottom of the black band
- B/W line-art self-caricature replacing the "O" of the wordmark (frames 001–022)
- Collage layering: the sticker portrait sits on the band and breaks above its top torn edge, with the marquee running *behind* it (frames 001, 009, 016)
- No site chrome or nav visible (frames 001–022)

**Animation language** (all time-driven; the page never scrolls in the capture)
- Signature write-on, left → right, with the arrow drawn first (frames 001–006). It holds (frames 006–019), then erases right → left (frames 020–022); it loops.
- Turnaround inside the selection box: an image sequence of the full-body photo (back / ¾ / profile / front), stepped. The pose changes are separated by a white flash (frames 001–008, 009–015, 016–022).
- Wordmark head: swaps between eyes-open/scowl and eyes-closed (blink) (frames 014, 016–022)
- Marquee: continuous right → left at ≈ 1 word/s, on a slightly wavy or skewed baseline (frames 001–022)
- Everything else is static.

---

## Artifact 2: screen inventory

1. **Poster page** (frames 001–022), the only screen. It covers:
   - the masthead (kickers, wordmark with head, signature, dingbat row)
   - the About row (selection-box turnaround | HELLO + bio + education | skills + experience)
   - the torn marquee band with the sticker portrait
   - the top of the next section: "THE STU…" with tilted polaroids, cut off by the viewport

Out of scope: the video shows none of the site's other chapters (Mind, Arsenal, Evolution, Next World, Contact) or any navigation. Those get the design *system* above, not a copied layout.

---

## Artifact 3: diff list

### Flags (read first)

- **Different families.** The current site is a dark cinematic neon/anime system: black bg, pink⇄violet pulse, condensed display, kanji, WebGL plates. The video is a light paper/ink collage with one red accent. They don't half-merge. You said "change totale", so this is a **full migration**.
- **Hero conflict.** You earlier said the hero must keep its old style. A total change replaces it with the masthead below. It is listed as its own block so you can include or exclude it.
- **Content.** The video's copy belongs to another person ("Raagav Sundar", a graphic designer). Only the layout and visual language are borrowed. Every word on the site stays yours, from `src/data/*`.
- **Assets the video has that you don't**, with what I'll use instead:
  - line-art caricature → generated from your own photos (ink line filter on `me.png` and `MENIGGA.PNG`)
  - 360° turnaround photos → your two real cut-outs, alternating with a white flash (2 poses, not 360°)
  - "studio" polaroids → your project media (CareerHive film poster, the generative project marks) and the Bleach refs as collage photos
- **Cost.** The WebGL layer, the GIF opener, the Orb (WebGL) and the neon pulse all go away. The new effects are CSS/GSAP, so the page gets lighter.

### Tokens: `src/styles/global.css` (frames 001–022)

- Replace `--paper` `#ece7df` → `#ececec` (paper bg, frames 001–022).
- Replace `--black` `#000000` → `#111111` (ink, frames 001–022).
- Replace `--charcoal` `#161616` → `#0e0e0e` (band black, frames 001, 009, 016).
- Replace `--ash` `#8f887e` → `#4a4a4a` (dark-grey body copy, frames 001, 016).
- Replace `--crimson` `#b3121f` → `#f2231b` and `--crimson-hi` `#e23a47` → `#e05a64`: sticker red / selection-box red (frames 001, 009, 016).
- Replace `--line` → `rgba(17,17,17,0.16)` and add `--grid: #d6d6d6` (graph lines, frames 001–022).
- Swap `--duo` / `--duo-v` from the crimson → violet → blue gradient to flat `var(--crimson)`. The video has no gradients (frames 001–022).
- Replace `--f-display` `'Big Shoulders Display'` → `'Archivo'` at `font-stretch: 125%` / `wdth 125`, weight 900: the extended heavy grotesque (frames 001–022).
- Add `--f-hand` (handwriting) for the signature and polaroid captions (frames 001–006, 016–022).
- Flip the page: `html`/`body` get `background: var(--paper)` plus a grid layer and a crumpled-paper texture, with `color: var(--black)` (frames 001–022).
- Remove the `.bg-canvas` rules; the paper is the background (frames 001–022).
- Replace `.btn` fills with ink on paper (`--black` / `--paper`), using extended caps and square corners (radius 0 everywhere structural, frames 001–022).

### `index.html` (frames 001–022)

- Replace the font request: Big Shoulders Display + Shippori Mincho → Archivo (wdth 62–125, wght 300–900, already loaded) + one handwriting face for the signature (frames 001–006).
- Replace `theme-color` `#000000` → `#ececec` (paper, frames 001–022).

### `src/styles/pulse.css` (frames 001–022)

- Remove the pink⇄violet `glow-pulse` animation. The video has no glow or neon; strokes are flat ink and red (frames 001–022).
- Pin `--glow` → `var(--crimson)` and `--glow-b` → `var(--black)`, so every existing consumer (card, rail, labels) turns flat red/ink without being rewritten (frames 001, 009, 016).
- Remove the glowing outline + text-shadow on display headings; headings are solid ink (frames 001–022).

### `src/App.jsx` (frame 001)

- Remove `<IntroVideo>` (the GIF opener). The capture opens directly on the poster (frame 001).
- Remove `<BackgroundCanvas>` and the plate prefetch; the background is paper (frames 001–022).
- Reorder `<main>` to the poster order: masthead → HELLO/about → torn marquee band → work → the remaining chapters (frames 001, 009, 016).

### Hero: `Hero.jsx`, `hero.css`, `heroAnimations.js` (frames 001–022) ⚠ protected section, see flags

- Replace the name / orb / pink swirl / ID card composition with the masthead:
  - kickers: top-left `identity.roles[1]` ("Full-Stack Developer"), top-right "2026" (frames 001, 009)
  - wordmark: "PORTF◯LIO", with the "O" replaced by your ink-line head (frames 001–022)
  - h1 keeps your name for screen readers and SEO.
- Add the head swap: two ink heads (from `me.png` / `MENIGGA.PNG`) alternate as the blink/expression loop (frames 014, 016–022).
- Add the signature "Mouhib Hamzaoui" in `--f-hand`, with a hand-drawn arrow pointing at the head. It writes on left → right, holds, erases, and loops (frames 001–006, 020–022).
- Add the centred dingbat row ✸ ✦ ♣ under the wordmark (frames 001, 009, 016).
- Remove `ParticleField`, `Orb`, `hero__pulse` and the hero ID card (frames 001–022 show none).
- Replace the 3.5 s neon intro timeline with: wordmark letters rise (existing `riseChars`), kickers fade in, signature starts. Keep it under 1.5 s and skip it under reduced motion (frames 001–006).

### About / Origin: `About.jsx`, `about.css` (frames 001–022)

- Replace the chapter header + tall neon ID card + story rail with the 3-column HELLO row (frames 001, 009, 016):
  - Left: your full cut-out inside a selection box (1px `--crimson-hi` stroke, 8 white square handles). The turnaround alternates the two cut-outs with a white flash every ~2 s (frames 001–008, 016–017, 022).
  - Middle: "HELLO" (extended black), then "Hi, I'm Mouhib Hamzaoui.", then a bio built from `identity.statement` + `story[*].tale`. Below it EDUCATION: ISAAS Licence 2019–2024 and TEK-UP engineering cycle 2026, from `story.js` (frames 001, 009, 016).
  - Right: SKILLS as a 3×2 grid of the existing `IconBox` tiles (React, Symfony, Spring Boot, MySQL, Linux, AWS), radius ~6px with brand colours. Below it EXPERIENCE from `timeline.js` `experience`: bold date, bold role, regular org (frames 001, 009, 016).
- Remove the neon border / glow from `.story__fact`; rows are plain ink type (frames 001, 016).

### Marquee band: `Ribbon.jsx`, `ribbon.css`, `ribbons.js` (frames 001–022)

- Replace the two crossing pink/blue bands with **one** full-bleed `--charcoal` band. It gets torn-paper edges top and bottom (SVG mask) and runs right → left at ≈ 1 word/s (frames 001–022).
- Replace the band items with your words plus dingbat separators, from `identity` (frames 001, 009, 016):
  "MOUHIB HAMZAOUI ✸ ✦ ♣ PORTFOLIO ✸ ✦ ♣ 2026 ✸ ✦ ♣ FULL-STACK DEVELOPER ✸ ✦ ♣ CLOUD & INFRASTRUCTURE"
- Add the sticker portrait: your head-and-shoulders cut-out with a thick `--crimson` outline (baked into a new `profile-sticker.webp`). It is centred on the band and breaks above its top torn edge, with the marquee behind it (frames 001, 009, 016).
- Add a slight skew (−2°) to the band text, for the wavy baseline (frames 016–022).
- Place the first band right after the HELLO row (frame 001). Keep the second band before Contact.

### Work: `Projects.jsx`, `ProjectCard.jsx`, `projects.css` (frames 001–022, bottom edge)

- Replace the chapter header with a centred extended heading, "THE WORK", the same treatment as "THE STU…" (frames 001, 009, 016).
- Replace the 12-col split cards with tilted polaroids (frames 001–022):
  - white border, thicker at the bottom
  - rotated ±3–6° alternately
  - CareerHive film/poster, Aura and Nexos generative marks inside
  - a handwritten caption (`--f-hand`)
- Keep the role/stack/summary/CTA under each polaroid in plain ink type (frames 001, 016).
- Remove the neon hover glow, the outlined second title line, and the kanji (frames 001–022 show none). Keep the hover tilt-straighten as the interaction.

### Chapters the video doesn't show: Mind, Arsenal, Evolution + interlude, Next World, Contact, Footer (design system from frames 001–022)

- Swap the dark section surfaces for paper with ink text through the new tokens. `.mind` is already white and just loses its special case (frames 001–022).
- Replace `ChapterIntro`'s kanji column and gradient rule with: centred extended heading + dingbat row ✸ ✦ ♣ (frames 001, 009, 016).
- Swap the Bleach WebGL plates for collage pieces:
  - manga panel (`manga.webp`) as a torn-paper inset in Mind
  - eclipse and swords plates as taped polaroids in Next World and Arsenal (polaroid motif, frames 001–022)
- Replace the transformation's neon glow with ink + red. Keep its pinned scrub (frames 001, 016).
- Restyle the Contact CTA as an ink block on paper, with the red sticker portrait instead of the grey rim-lit figure (frames 001, 009).

### Navigation: `Navigation.jsx`, `navigation.css` (frames 001–022)

- Replace the neon glass pills with paper chips: 1px ink border, extended bold caps, active chip filled `--black`. Nothing in the video shows a nav, so the rail stays (usability) but in the paper language (frames 001–022).

---

## Open choices (no frame evidence either way; my default in brackets)

- Hero CTAs "Explore the journey" / "Contact me": the video has no buttons [keep, restyled ink-on-paper]
- Flaming-kunai cursor: the capture has no pointer [remove; it is pink/neon]
- Origin's terminal (WorkLog) and horizontal timeline: not in the video [keep, restyled to paper]
- Kanji ornaments site-wide: the video uses dingbats instead [replace with ✸ ✦ ♣]
