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
| `--ink-70/52/36` | white 70% / 52% / 50% | Body, secondary, tertiary type. Tertiary stays at or above ~4.5:1 on black |
| `--line` / `--line-soft` | white 14% / 7% | Hairlines |
| `--violet` | `#C900FF` | The main accent. Hovers, highlights, BR4M+ |
| `--violet-deep` | `#6B21A8` | Glows, gradients |
| `--violet-pale` | `#E9D5FF` | Accent text on dark |
| `--cash` / `--cash-deep` / `--cash-pale` | `#2FD575` family | **Donations only**: the 3D `$` mark (`.cash`). Never anywhere else |

No other hues as theme tokens. Violet stays under ~10% of any view; green appears only on donation elements. Untitled film tiles may use a per-entry `mark` colour for a Climate Crisis "?" (Architects film 2 `#87BEA8`, film 3 `#7E69D2`). Never reuse another still as a stand-in.

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
- Scroll: Lenis smooth scroll + GSAP ScrollTrigger (`allowNestedScroll` so a
  horizontal rail does not swallow the page wheel). `[data-reveal]` rises once at 90%,
  `[data-reveal-stagger]` staggers children, `[data-split]` masks heading lines,
  `[data-parallax]` drifts imagery. A 6s guard force-shows anything left invisible.
  Movie rails are `overflow-x: auto; overflow-y: hidden` and must not carry
  `data-lenis-prevent`.
- Hover: every interactive element responds. House styles: white fill sweep from below
  (`.btn`, `.chan`, `.teaser`), underline draw (`.ulink`), image zoom 1.02→1.06 on stills,
  violet border-bottom shift on meta rows, magnetic pull on `[data-magnetic]`.
- Cursor: difference-blend dot + trailing ring; `[data-hint]` swells the ring into a
  white disc with a label (Play, Open, View). Native pointer is hidden while the custom
  cursor is active. Hidden for touch and reduced motion. Native `<dialog>` elements
  paint in the top layer, so the cursor node is moved into fullscreen dialogs
  (`.stage`, `.orb`). When the player uses the Fullscreen API, the cursor moves into
  that fullscreen node (the player shell). Other dialogs restore the system pointer.
  The visitor is never left without a cursor.
- Countdown ticks re-blur each digit on change (blur 7px, rise 0.3em, 550ms expo).
- `prefers-reduced-motion`: no cursor, no reveals, no autorotation, bars open instantly.

## Components

| Component | File | Notes |
| --- | --- | --- |
| Void hero | `index.html` + `.void` + `src/bolt.js` | Pure black, everything centered. One CTA: the current film. **Hovering the wordmark makes electricity crackle across the letters** (small arcs every ~95ms + `.is-live` glow); ambient bolts still strike every 4 to 8s. Text flashes with strikes (`.is-struck`), pulsing violet glow behind. No background image. Rendered by a **WebGL fragment shader** (per-pixel distance to the bolt polylines, white-hot exponential core + wide violet halo); a small 2D-canvas path exists only as a no-WebGL fallback |
| Movies hub | `/movies` + `src/projects.js` | Netflix-like catalog: full-bleed billboard, horizontal rails of 16:9 tiles, a BR4M+ members-site strip, a series poster row. Always looks like a hub, even with one series. Data is added by hand in `src/data/projects.js`. |
| Featured hero | `.feature` (movies) + `src/reel.js` | Billboard of the next premiere. Bebas Neue film title, series in the meta row, logline, countdown. Muted looping reel. **Play trailer** opens the on-site player. Calendar stays the reminder. A heavier left veil keeps type readable over burned-in titles. |
| On-site player | `.stage` + `src/player.js` | Viewport-fitted 16:9 BR4M chrome over a `youtube.com` iframe (not nocookie) so plays count as YouTube views. Play, pause, seek, mute, time, **full screen** (real Fullscreen API, portrait and landscape; CSS cover if the UA blocks it). Closing the player always exits full screen. Like and Comment open that video on YouTube. Space / K / arrows / M / F / Esc. While a YouTube ad plays, BR4M overlays lift so Skip stays clickable and the scrubber does not follow ad time. The YouTube bar never shows. |
| Homepage premiere | `.premiere` + `src/premiere.js` | Compact feature band: still, film title, countdown, Add to calendar, Open the film. Watch / premiere links only appear when `url` is set. Never a disabled pill. Never fall back to the channel. |
| Latest upload row | `.latest` (homepage) + `src/watch.js` | Compact hairline row: 16:9 thumb, label + title + date, play disc. Opens the dialog player |
| Countdown | `src/countdown.js` + `.cd` | Mono digits; each tick crossfades: old value blurs up and out while the new one blurs in from below (700ms). Colons are transparent white with a soft pulse, never violet. Phases far/soon/live |
| Poster wall | `.cards` | Legacy 2:3 posters. The movies hub uses `.tile--poster` in a rail instead |
| Movie banner | `.series-hero` | Wide banner, veiled, on `/movies/:slug` |
| Film tiles | `.tile` | 16:9 stills in a horizontal rail. Hover scale, play disc, title overlay. Upcoming tiles with no art use a Climate Crisis "?" in the entry's `mark` colour, never a reused still, plus an expected quarter and the word Estimate. Do not invent titles. |
| Homepage player | `[data-player]` | 16:9 modal for homepage latest-upload. Movies uses `.stage` |
| Currency globe | `src/globe.js` + `src/landdots.js` + `.orb` | Fullscreen transparent dialog with the panel inside, so the custom cursor can live in the top layer. Dot cloud built from **real Natural Earth land polygons** (`world-atlas` land-110m rasterized to a 2.2 degree grid, lazy chunk); the selected currency's countries light up violet and the globe turns toward them. List shows code, name and symbol; scrollable with the wheel (`data-lenis-prevent`). Map is drawn unmirrored (east to the right). The dialog animates open (panel rises + scales in, backdrop fades) and closes through the same motion, including Esc; reduced motion snaps. It only ever opens from the shop's own currency button, never in front of an outgoing link. The starting currency is guessed from the device time zone (language region as backup), so a visitor in Europe lands on EUR without touching anything |
| Bag | `src/shop.js` + `.sheet` | Count badge, qty stepper, trash remove, subtotal |
| Membership banner | `.member` | Name + link only, violet glow, star tag. Not on the homepage. On `/movies` a `.member--hub` strip says BR4M+ watches ad free on the members site, plus more films, extras and member perks. Never list specific perks, tiers or prices. BR4M+ signup still lives on Fourthwall. |
| Teasers | `.teaser` | Giant type rows with white sweep + rotating arrow disc |
| Channels | `.chan` | Brand icon rows with white sweep |
| Press kit | `.kit` + `/press` | Hairline download rows for the wordmark and existing stills. Footer link, not top nav. Discord is the press contact |
| Lost page | `.lost` + `404.html` | Quiet not-found. nginx and the Vite plugin serve it for unknown paths |

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

- Data lives in `src/data/projects.js` and is added by hand. A movie project = slug, title,
  tag, poster, banner, blurb, entries. Entries = title, 16:9 thumb or a `mark` colour
  for a "?" tile, optional `hero` art, `release` instant, `expected` quarter (an estimate,
  never a locked date), `url` (YouTube), `reel` (trailer id for the hub player).
- `/movies` is the catalog hub: billboard plus rails (the current series' films, a BR4M+
  members-site strip, trailers and extras from the YouTube feed, then every series poster).
  It must already feel like a studio library, not an empty page waiting for the first premiere.
- Untitled slots stay "To be announced". Current Architects estimates: film 2 expected
  Q4 2026 (mark `#87BEA8`), film 3 expected Q1 2027 (mark `#7E69D2`). Copy must say it is an estimate.
- The BR4M player embeds on `www.youtube.com` with sound from the visitor's play click so
  the watch counts as a YouTube view. Like and Comment leave to that YouTube page. Full
  screen is the Fullscreen API and must exit on close. YouTube ads keep the iframe
  clickable: BR4M chrome lifts, the scrubber holds the film time.
- Premiere flow: **Play trailer** uses the on-site player. **Add to calendar** is the
  reminder. Watch / premiere links only appear when `url` is set. A missing URL never
  falls back to the channel. No disabled pills.
- Paste the YouTube premiere URL into the entry's `url` field as soon as it exists.
  "Add to calendar" writes `/premiere.ics` from that same release instant (one-hour
  reminder window, not a claimed runtime).
- Movie detail is a real path (`/movies/the-architects`). Legacy `/movies#the-architects`
  rewrites there. `/watch` and `/projects` redirect to `/movies` (nginx + Vite plugin).
- Press (`/press`) lists the wordmark, existing stills, the real logline and premiere stamp,
  and Discord as the press contact. Footer only, not top nav.
- Unknown URLs serve `404.html` (nginx `=404`, Vite plugin in preview). Do not fall
  back to the homepage.
- Share cards use `https://br4m.tv/share.jpg` (1200×630 crop of the current hero still),
  plus `og:url`, canonical, and Twitter large-image tags on every page.
- Shop empty state copy: "Merch is in the works. The first official BR4M drop lands
  here soon." Homepage shop teaser uses the same honest line, not a shipping promise.
  The empty shop is a composed block with a Movies exit. The currency globe stays
  visible. The homepage hero does not link to Shop until the drop is live.
- Custom cursor hides the native pointer (`cursor: none`) while `body.has-cursor`.
  In dialogs and Fullscreen API views the cursor node is reparented (`parkCursor`);
  other dialogs restore `cursor: auto`. The topbar does not hide on scroll for touch.
  The giant outlined footer wordmark is full-scale on home and smaller on interior pages.

## Imagery specs

| Asset | Ratio | Recommended size |
| --- | --- | --- |
| Project poster | 2:3 | 600×900 or larger |
| Project banner | ~4:1 | 2048×512 or larger |
| Entry thumbnail | 16:9 | 1280×720 (YouTube size) |
| Featured hero background (movies page) | 16:9 | **2560×1440**, keep faces/subject in the middle 60%, bottom third gets a dark gradient overlay. Current: `the-architects-hero.png` |
| Home hero | none | No image: black + lightning |
| Share card | 1.91:1 | **1200×630**, `public/share.jpg`, cropped from the current hero still |

Files live in `public/projects/` and are referenced from `src/data/projects.js`.

## Layout

- Shell `min(1480px, 100% − 2×gutter)`, gutter `clamp(1.15rem, 4vw, 4rem)`.
- Section rhythm `--band: clamp(4.5rem, 9vw, 9.5rem)`; hairlines separate list rows.
- Breakpoints: 640 (2-col grids), 860/900 (nav, dialogs 2-col), 1024 (3-col shop).
- Everything must hold at 320…2560px wide with zero horizontal overflow.
- Every page carries an inline critical `<style>` that letterboxes the screen black before
  the stylesheet arrives (no raw HTML flash), with a 4s CSS fallback that opens the bars
  even if JS never runs.
