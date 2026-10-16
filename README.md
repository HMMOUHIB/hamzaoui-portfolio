# Hamzaoui Mouhib — Portfolio

An engineer's digital awakening.

**Stack:** React 19 + Vite · GSAP + ScrollTrigger (`@gsap/react`) · Lenis smooth scroll ·
Motion (mobile menu) · Three.js · React Three Fiber + drei (animated WebGL backgrounds) ·
react-fast-marquee (chapter ribbons) · react-icons (Simple Icons / Tabler / Font Awesome).

> `.npmrc` sets `legacy-peer-deps=true` — React Three Fiber lists optional Expo peers
> that npm otherwise refuses to resolve. Nothing Expo-related is installed.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build
```

## Your photo

`src/assets/profile.webp` is a BiRefNet cut-out of `me.png`. It is detected automatically
(`src/data/profile.js`) and used by the transformation/particle dissolve and the Contact portrait.
Replace it with any transparent photo (`profile.png` / `.webp` / `.avif`); delete it to fall back to
the placeholder silhouette.
Tip: export ~1000px tall WebP for a good size/quality balance; keep transparency.

## Edit content

All personal content lives in `src/data/` — nothing is hard-coded in components.

| File | What it holds |
| --- | --- |
| `identity.js` | name, roles, statement, email, GitHub/LinkedIn, chapter list |
| `timeline.js` | Origin timeline + experience rows |
| `skills.js` | Arsenal categories (`learning: true` = in progress), Mind verbs, evolution path, certification targets |
| `projects.js` | project panels, links, visual type |

## Structure

```
src/
  animations/   gsap setup, hero intro, scroll reveals, text effects, page transitions
  components/   one file per section + shared pieces (cursor, nav, figure, particles…)
  data/         content
  hooks/        media queries, near-viewport
  styles/       one stylesheet per section + global tokens
```

## Palette

Black, off-white and charcoal, with two energies: crimson (`--crimson`) and spirit blue
(`--blue`), plus `--duo` / `--duo-v` gradients where they meet. Red marks pressure and the
past, blue marks spirit and the cloud future. Chapter 02 (Mind) is deliberately pure white
and black — no accent colour at all.

## Icons

Every icon on the site is an animated, colour-coded `IconBox` (`src/components/IconBox.jsx`):
brand-tinted tile, pop-in on first view, a light sweep every few seconds, a gentle float,
and a lift + glow on hover. Names and colours live in one registry: `src/data/icons.js` —
add a line there and use `<IconBox name="…" />` anywhere.

## Animated backgrounds

`src/background/` holds one fixed, full-screen WebGL layer with a mood per chapter:

| Chapter | Mood |
| --- | --- |
| 00 Awakening | crimson spirit smoke rising |
| 01 Origin | topographic contour lines, one red ridge travelling |
| 02 Mind | its own CSS ink-wash on paper, over a pale manga print (WebGL rests) |
| 03 Arsenal | **painted plate**: the field of blades — churning sky, light through the gap, the eyed shadow's tatters flutter and its eyes open red, embers |
| 04 Work | perspective grid floor with a scanning line |
| 05 Evolution | data rain |
| 06 Next world | **painted plate**: eclipse over the tower — the corona pours out of the black moon, a reiatsu pillar climbs to it, the city flickers |
| 07 Contact | calm crimson aurora |

Sections opt in with `data-bg="<n>"` (or `"none"` for opaque ones). Moods crossfade over 1.6s.

The painted plates live in `src/assets/bleach/` (built from the references in `src/ref/`: Real-ESRGAN
anime ×3 then downsized to 2400px WebP). Each has a small packed mask — R depth for pointer parallax,
G where the sky may move, B effects (city lights / the eyed shadow) — so motion never smears the swords
or the tower. They are prefetched during the opener. The interlude after Evolution drifts the hollow discs
(`hollows.webp`) behind the figure, and Mind prints `manga.webp` into its paper.

Performance: rendered at 45–70% resolution (80% / 100% on mobile while a painted plate is on screen), capped at 50fps desktop / 30fps mobile, paused
behind opaque chapters and hidden tabs, one static frame with reduced motion, and silently
skipped if WebGL is unavailable. Edit the moods in `shaders.js`.

## Behaviour notes

- Intro plays fully once per session, then ~1s on repeat visits; any key/click/scroll skips it.
- `prefers-reduced-motion`: no intro, no pinning, no smooth scroll, static network — all content still shown.
- Three.js loads lazily, desktop only, pauses off-screen and disposes its GPU resources on unmount.
- Custom cursor only on fine-pointer devices.

## Deploy

Static site — works on Vercel, Netlify or GitHub Pages (`npm run build`, publish `dist/`).
Update `og:image` in `index.html` to an absolute URL once you have a domain.
