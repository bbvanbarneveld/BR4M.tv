# BR4M.tv design system

The single source of truth for how this site looks, moves and speaks.
**Every relevant change to the site must be reflected here, in `README.md` and in
`AGENTS.md` in the same commit.**

## Identity

- BR4M is a filmmaker inside Minecraft. The site sells the films, not one series.
- Feel: cinematic, expensive, quiet. Imagery and framing do the talking.
- Absolutely no faux-TV jargon in copy ("Transmission 001", "On air", "Signal").
- No space/starfield styling. Cinema is expressed with film stills, letterbox reveals,
  film grain and big calm type.

## Color

| Token | Value | Use |
| --- | --- | --- |
| `--black` | `#000000` | Page surface, always |
| `--ink` | `#ffffff` | Primary type, the theme colour |
| `--ink-70/52/36` | white alphas | Body, secondary, tertiary type |
| `--line` / `--line-soft` | white 14% / 7% | Hairlines |
| `--violet` | `#C900FF` | The main accent. Hovers, highlights, BR4M+ |
| `--violet-deep` | `#6B21A8` | Glows, gradients |
| `--violet-pale` | `#E9D5FF` | Accent text on dark |
| `--cash` / `--cash-deep` / `--cash-pale` | `#2FD575` family | **Donations only**: the 3D `$` mark (`.cash`). Never anywhere else |

No other hues. Violet stays under ~10% of any view; green appears only on donation elements.

## Type

| Family | Role |
| --- | --- |
| Climate Crisis | The BR4M wordmark only (`.wordmark`, `.topbar__mark`, `.foot__mark`, TBA "?" glyph) |
| Bebas Neue (`--font-title`) | Movie/series titles only: `.feature__title`, `.pdetail__title`, `.banner__title`. Uppercase, tracking +0.015em |
| Inter Tight (300…600) | Everything else: headings, body, buttons, labels |
| JetBrains Mono | Timecode clock, prices, dates, countdown digits only |

Headings: weight 600, letter-spacing −0.03…−0.045em, line-height ≤1. Labels: 500,
uppercase, tracking 0.2em+, `--ink-36`. Body max ~52ch.

### Copy rules

- English only, everywhere (see `AGENTS.md`).
- **No em-dashes or mid-sentence dashes.** Use commas, periods or colons.
- Dates: `30.08.2026`. Times always in BR4M's own timezone with suffix, `15:00 CEST`.
- The visible clock is Europe/Amsterdam (CET/CEST), rendered by `src/chrome.js`.

## Motion

- Ease: expo/quart out only (`--ease-expo`, `--ease-soft`). No bounce, no elastic.
- Page load: letterbox bars open (~1.15s) while `[data-load]` items rise in;
  `[data-glyphs]` wordmark letters stagger. Fail-safe completes the timeline after 4.5s.
- Scroll: Lenis smooth scroll + GSAP ScrollTrigger. `[data-reveal]` rises once at 90%,
  `[data-reveal-stagger]` staggers children, `[data-split]` masks heading lines,
  `[data-parallax]` drifts imagery. A 6s guard force-shows anything left invisible.
- Hover: every interactive element responds. House styles: white fill sweep from below
  (`.btn`, `.chan`, `.teaser`), underline draw (`.ulink`), image zoom 1.02→1.06 on stills,
  violet border-bottom shift on meta rows, magnetic pull on `[data-magnetic]`.
- Cursor: difference-blend dot + trailing ring; `[data-hint]` swells the ring into a
  white disc with a label (Play, Open, View). Hidden for touch, reduced motion, dialogs.
- Countdown ticks re-blur each digit on change (blur 7px, rise 0.3em, 550ms expo).
- `prefers-reduced-motion`: no cursor, no reveals, no autorotation, bars open instantly.

## Components

| Component | File | Notes |
| --- | --- | --- |
| Void hero | `index.html` + `.void` + `src/bolt.js` | Pure black, everything centered. **Hovering the wordmark makes electricity crackle across the letters** (small arcs every ~95ms + `.is-live` glow); ambient bolts still strike every 4 to 8s. Text flashes with strikes (`.is-struck`), pulsing violet glow behind. No background image. Rendered by a **WebGL fragment shader** (per-pixel distance to the bolt polylines, white-hot exponential core + wide violet halo); a small 2D-canvas path exists only as a no-WebGL fallback |
| Featured hero | `.feature` (movies) + `src/reel.js` | Netflix-style: Bebas Neue title, meta dot row (year, tag, entry), countdown, phase actions. Hero art (subtle drift) is the poster frame; once the muted YouTube reel plays it crossfades in and loops from `reelStart` to the end. Sound only via the corner toggle. Reel id lives in `src/data/projects.js` (swap for the trailer later) |
| Latest upload row | `.latest` (homepage) + `src/watch.js` | Compact hairline row: 16:9 thumb, label + title + date, play disc. Opens the dialog player |
| Countdown | `src/countdown.js` + `.cd` | Mono digits; each tick crossfades: old value blurs up and out while the new one blurs in from below (700ms). Colons are transparent white with a soft pulse, never violet. Phases far/soon/live |
| Poster wall | `.cards` | 2:3 posters, hover lift −6px + zoom, meta row underneath |
| Movie banner | `.pbanner` | Wide banner image, veiled, above movie detail |
| Entry tiles | `.ep` | 16:9 thumbs; released = link + play disc, upcoming = date chip, TBA = "?" |
| Dialog player | `[data-player]` | 16:9 modal player for YouTube uploads |
| Currency globe | `src/globe.js` + `src/landdots.js` + `.orb` | Dot cloud built from **real Natural Earth land polygons** (`world-atlas` land-110m rasterized to a 2.2 degree grid, lazy chunk); the selected currency's countries light up violet and the globe turns toward them. List shows code, name and symbol; scrollable with the wheel (`data-lenis-prevent`). Map is drawn unmirrored (east to the right). The dialog animates open (panel rises + scales in, backdrop fades) and closes through the same motion, including Esc; reduced motion snaps. It only ever opens from the shop's own currency button, never in front of an outgoing link. The starting currency is guessed from the device time zone (language region as backup), so a visitor in Europe lands on EUR without touching anything |
| Bag | `src/shop.js` + `.sheet` | Count badge, qty stepper, trash remove, subtotal |
| Membership banner | `.member` | Name + link only, violet glow, star tag |
| Teasers | `.teaser` | Giant type rows with white sweep + rotating arrow disc |
| Channels | `.chan` | Brand icon rows with white sweep |

Icons: thin 1.5–1.7 stroke SVGs from `ICONS` in `src/ui.js` (and brand glyphs in
`src/socials.js`). Never emojis.

## BR4M+ (membership and support)

- The membership is named **BR4M+**. "BR4M" in white with the 4 in italic
  (`<i class="mark-i">4</i>`), the `+` wrapped as `<i class="plus">+</i>`: violet with an
  animated light sheen and soft glow (static violet under reduced motion).
- Copy says you unlock **member perks** by subscribing, but never names specific perks,
  tiers or prices.
- **The support page treats BR4M+ and donating as equals**: a two-panel split
  (`.split`), BR4M+ left / Donate right on desktop, BR4M+ above Donate on mobile
  (stack under 880px). Each panel has its own tinted glow and hover border (violet
  vs money green). Free support (watch, like, comment, subscribe) and Discord stay
  as teasers below under "Just hang out".
- Donations copy mentions the high chance of a personal thank you from Bram (message,
  voice note or video).
- The two brand glyphs are **real Three.js extruded meshes** (`src/cash3d.js`,
  lazy-loaded on the donate page only, glyph data in `src/data/dollar-glyph.json`):
  the money-green `$` (`.cash`) and the violet `+` (`.plus` inside the split heading).
  Both idle-sway and **lean toward the pointer**; the CSS gradient spans stay as the
  no-WebGL / pre-load fallback, and reduced motion renders one static angled frame.
- Paid Fourthwall links (memberships, donations) point straight at the locale of
  the current currency, `/en-eur/pages/donations`, so prices and payment methods
  match the visitor with no popup in the way. Under the two panels one quiet line
  names the currency and says it can be changed on the shop page if the guess is
  wrong. The members feed link stays plain, there is nothing to pay for.
- Fourthwall URLs (link directly, never print a URL as visible text):
  tiers `https://br4m-shop.fourthwall.com/pages/memberships`,
  one-time donations `https://br4m-shop.fourthwall.com/pages/donations`,
  members feed `https://br4m-shop.fourthwall.com/supporters`.

## Movies & releases

- Data lives in `src/data/projects.js`. A movie project = slug, title, tag, poster, banner,
  blurb, entries. Entries = title, 16:9 thumb, optional `hero` art, `release` instant,
  `url` (YouTube).
- Premiere flow: greyed "Premiere not available yet" button until 24h before release
  ("far"), premiere link appears in the last 24h if `url` is set ("soon"), watch link
  only after release ("live").
- Paste the YouTube premiere URL into the entry's `url` field as soon as it exists.
- The movies page routes with the URL hash (`/movies#the-architects`); legacy `/watch`
  and `/projects` redirect to `/movies` (nginx + Vite plugin).
- Shop empty state copy: "Merch is in the works. The first official BR4M drop lands
  here soon."

## Imagery specs

| Asset | Ratio | Recommended size |
| --- | --- | --- |
| Project poster | 2:3 | 600×900 or larger |
| Project banner | ~4:1 | 2048×512 or larger |
| Entry thumbnail | 16:9 | 1280×720 (YouTube size) |
| Featured hero background (movies page) | 16:9 | **2560×1440**, keep faces/subject in the middle 60%, bottom third gets a dark gradient overlay. Current: `the-architects-hero.png` |
| Home hero | none | No image: black + lightning. The series banner still pulls a YouTube maxres still |

Files live in `public/projects/` and are referenced from `src/data/projects.js`.

## Layout

- Shell `min(1480px, 100% − 2×gutter)`, gutter `clamp(1.15rem, 4vw, 4rem)`.
- Section rhythm `--band: clamp(4.5rem, 9vw, 9.5rem)`; hairlines separate list rows.
- Breakpoints: 640 (2-col grids), 860/900 (nav, dialogs 2-col), 1024 (3-col shop).
- Everything must hold at 320…2560px wide with zero horizontal overflow.
- Every page carries an inline critical `<style>` that letterboxes the screen black before
  the stylesheet arrives (no raw HTML flash), with a 4s CSS fallback that opens the bars
  even if JS never runs.
