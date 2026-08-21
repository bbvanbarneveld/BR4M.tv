# BR4M.tv design system

This is the design source of truth. If a visual, copy, or interaction choice is not
in here, do not invent a second system. **Every relevant change to the site must
update this file, `README.md`, and `AGENTS.md` in the same commit.**

Use this document to *design*. Use `AGENTS.md` to *build* (routes, data, shop
secrets, English lock). They agree. If they conflict, this file wins on look and
feel; `AGENTS.md` wins on engineering constraints.

---

## 1. What you are designing

BR4M.tv is the cinematic brand surface for **BR4M**, a filmmaker who writes, builds
and films original series *inside Minecraft*. The site sells the films and the
world around them: movies, the next premiere, the shop, membership, support.

Success: a first-time visitor feels they found a film studio, not a YouTube
channel with a website. They can watch, calendar, shop, or support without
leaving the brand.

**The site is about BR4M the filmmaker.** THE ARCHITECTS is one series among more
to come. Never frame the whole site, the nav, or the hero around a single series.

### Three words

Cinematic. Expensive. Quiet.

If a mock, a section, or a component is not all three, it is wrong.

### Users

English-speaking Minecraft viewers, film fans, press, and supporters. They often
arrive on a phone from YouTube, Discord, TikTok, or a shared link. They want the
films, not a generic creator homepage.

---

## 2. How cinema is expressed (and how it is not)

Cinema comes from **imagery and framing**, never from costume.

**Do**

- Film stills as heroes and billboards
- Letterbox page reveals (two black bars opening)
- Subtle film grain and a soft vignette over the whole page
- Big, calm type with lots of black around it
- One primary action per view
- Real Minecraft footage, posters, banners. The pictures do the talking

**Do not**

- Faux-TV jargon: "Transmission 001", "On air", "Signal", "Live feed", channel
  numbers, "Now playing"
- Space, starfields, nebulae, scanlines-as-sci-fi, HUD chrome
- Generic card-grid creator landings
- SaaS metric heroes, identical icon cards, tracked eyebrows on every heading
- Neon rainbows, glassmorphism for its own sake, heavy drop shadows, bounce
- Turning the site into a streaming-app clone in copy ("Continue watching",
  "My list"). Netflix-like *layout* on `/movies` is allowed. Netflix-like *voice*
  is not

If you are unsure whether something is "cinematic", remove decoration until only
the still, the type, and the black remain. That is the look.

---

## 3. Hard prohibitions

Agents break the site when they ignore these. They are not suggestions.

1. **English only** on every visitor-facing string: UI, `aria-label`, `title`,
   meta, alt, buttons, empty states, skip link, footer. Never Dutch. Never mixed.
   YouTube titles stay as published (source content, not UI).
2. **No em-dashes or mid-sentence dashes** in visitor-facing copy. Use commas,
   periods, or colons.
3. **No extra accent hues.** Palette is black, white, violet. Money green exists
   only for donation `$`. TBA film tiles may use a per-entry `mark` colour for a
   "?" glyph. Nothing else: no orange, cyan, gold, red error chrome, blue links.
4. **Do not invent films, titles, merch, perks, prices, or ship dates.** Honest
   empty states. Untitled slots stay "To be announced".
5. **Do not send hub play actions to youtube.com.** Play in the BR4M player.
   Like and Comment are the exception: they open that video on YouTube.
6. **Never list BR4M+ perks, tiers, or prices.** They live on Fourthwall and go
   stale here. Name + link + generic "member perks" only.
7. **Never put the Fourthwall shop secret in the frontend or in git.**
8. **Do not disable premiere/watch buttons as grey pills.** Far from release the
   action is Add to calendar. The YouTube link appears only when `url` is set.
9. **Do not build a custom checkout or membership login.**
10. **Every interactive element has a hover (and focus-visible) state.**

---

## 4. Voice

Plain, specific, unhurried. Sounds like a studio, not a thumbnail.

| Do | Do not |
| --- | --- |
| "Original series, written, built and filmed inside Minecraft, then cut like cinema." | "Welcome to the official BR4M universe!!!" |
| "Premieres 30.08.2026 at 15:00 CEST." | "Dropping SOON 🔥" |
| "The first official drop lands here soon." | "Shop now, limited stock, shipping worldwide" |
| "To be announced" + "Expected Q4 2026" + "Estimate" | Invented working titles |
| "Watch ad free on the members site" + "member perks" | Bullet lists of Discord roles and early access |

**Dates:** `30.08.2026`. **Times:** always BR4M local, with zone suffix: `15:00 CEST`.
The visible clock is Europe/Amsterdam (CET/CEST), rendered by `src/chrome.js`.
Announced times mean one clock, not the visitor's.

**Wordmark in copy:** BR4M. The `4` is italic in the mark (`<i>` / `<i class="mark-i">4</i>`).
Membership is **BR4M+** with the plus as `<i class="plus">+</i>`.

Labels (kicker lines above titles) are short, uppercase, tracked out: "Next premiere",
"About", "Channels", "Members site". Never cute, never punny.

---

## 5. Color

The surface is **pure black**. White is the theme colour. Violet is a signal, not
a fill. A view should read as black-and-white first; violet should occupy **under
~10%** of the pixels.

| Token | Value | Use |
| --- | --- | --- |
| `--black` | `#000000` | Page surface, letterbox bars, always |
| `--near` | `#050506` | Dialogs, shop sheets, slightly lifted panels |
| `--panel` | `#0A0A0C` | Tiles, empty shop, recessed blocks |
| `--ink` | `#FFFFFF` | Primary type, primary buttons, wordmark |
| `--ink-88` | white 88% | Strong secondary (player chrome, dense UI) |
| `--ink-70` | white 70% | Body copy |
| `--ink-52` | white 52% | Supporting copy, notes |
| `--ink-36` | white 50% | Labels, timecode, tertiary. Keep at or above ~4.5:1 on black |
| `--line` | white 14% | Visible hairlines, button borders |
| `--line-soft` | white 7% | Quiet hairlines, list rows |
| `--violet` | `#C900FF` | Accent: hovers on solid buttons, BR4M+, focus ring, bag count, progress bar |
| `--violet-deep` | `#6B21A8` | Glows, sheen starts, progress gradient |
| `--violet-pale` | `#E9D5FF` | Accent text on dark (Estimate, member tag) |
| `--cash` | `#2FD575` | **Donations only**: the 3D `$` |
| `--cash-deep` | `#0D7A3F` | `$` shading |
| `--cash-pale` | `#B8F5D3` | `$` highlight |

**Selection:** violet fill, white text. **Focus-visible:** 2px violet outline, 3px offset.

### Allowed exceptions (not theme tokens)

- TBA film tiles without a still: per-entry `mark` on a Climate Crisis "?". Current
  Architects: film 2 `#87BEA8`, film 3 `#7E69D2`. Never reuse another film's photo.
- YouTube stills and Minecraft frames keep their natural colour. Do not recolour them
  orange, teal, or "cinematic grade" overlays beyond the existing black veils.

### How to use violet

- Hover fill on a solid white button (white button becomes violet, type becomes white)
- BR4M+ plus glyph sheen and membership glow
- Hairline progress at the very top of the viewport
- Bag count badge
- Wordmark lightning halo (deep violet, not a purple background)
- Current nav underline is white, not violet. Drawer link hover *is* violet

Do not make large purple sections, purple heroes, or purple cards.

---

## 6. Type

Four families. Do not add a fifth.

| Family | Token | Role |
| --- | --- | --- |
| Climate Crisis | `--font-mark` | Wordmark only: `.wordmark`, `.topbar__mark`, `.foot__mark`, and the TBA "?" glyph |
| Bebas Neue | `--font-title` | Movie and series *display titles* only: `.feature__title`, `.premiere__title`, `.pdetail__title`, `.banner__title`. Always uppercase, tracking `+0.015em`, line-height ~0.88 |
| Inter Tight 300…600 | `--font-sans` | Everything else: UI, headings, body, buttons, labels |
| JetBrains Mono | `--font-mono` | Timecode clock, prices, dates, countdown digits. Never body copy |

### Scale (`:root`)

| Step | Size |
| --- | --- |
| `--step--2` | `clamp(0.64rem, 0.62rem + 0.1vw, 0.72rem)` |
| `--step--1` | `clamp(0.76rem, 0.73rem + 0.14vw, 0.84rem)` |
| `--step-0` | `clamp(0.95rem, 0.92rem + 0.16vw, 1.05rem)` body |
| `--step-1` | `clamp(1.1rem, 1rem + 0.4vw, 1.35rem)` |
| `--step-2` | `clamp(1.4rem, 1.15rem + 1.1vw, 2.1rem)` |
| `--step-3` | `clamp(1.9rem, 1.4rem + 2.2vw, 3.2rem)` |
| `--step-4` | `clamp(2.4rem, 1.6rem + 3.8vw, 4.75rem)` section titles |

Home wordmark is larger than the scale: `clamp(4.25rem, 19vw, 15rem)`, line-height 0.84.
Movies billboard title: `clamp(3.6rem, 12vw, 9rem)` in Bebas Neue.

### Typographic rules

- UI headings: weight 600, letter-spacing −0.03 to −0.045em, line-height ≤1
- Labels: weight 500, uppercase, tracking 0.2em+, `--ink-36`
- Body: weight 400, line-height 1.6, `--ink-70`, max ~52ch, `text-wrap: pretty` where it helps
- Statement headings (`.statement`) may italicize one word (`<em>cinema</em>`)
- The `4` in BR4M is italic. Nothing else in the wordmark is
- Never set body in Climate Crisis or Bebas Neue. Never set a film title in Inter Tight
  when it is the hero/billboard title

---

## 7. Layout

| Token | Value |
| --- | --- |
| `--gutter` | `clamp(1.15rem, 4vw, 4rem)` |
| `--shell` | `1480px` (used as `min(1480px, 100% − 2×gutter)`) |
| `--band` | `clamp(4.5rem, 9vw, 9.5rem)` section padding |
| `--gap-xs` … `--gap-xl` | 0.4rem / 0.75rem / 1.15rem / clamp 1.5–2.5rem / clamp 2.5–4.5rem |

**.shell** is the content column. Full-bleed things (void hero, movies billboard,
series banner, teasers) ignore the shell or only put *copy* in it.

**Hairlines**, not boxes, separate list rows (channels, press kit, specs).

**Breakpoints (do not invent more):**

| Width | What changes |
| --- | --- |
| 640 | Clock in the topbar, 2-column grids |
| 860 / 880 / 900 | Nav appears, burger hides, section heads go 2-col, donate split, globe 2-col |
| 1024 | Shop product grid 3-col |

**Must hold at 320px through 2560px with zero horizontal page overflow.**
`body` uses `overflow-x: clip`. Rails scroll internally, they do not widen the page.

Home and interior pages share chrome: skip link, grain, vignette, letterbox bars,
custom cursor node, scroll progress, topbar, drawer, footer. Do not restyle chrome
per page except: footer wordmark is full-scale on home and smaller on interior pages;
topbar does not hide on scroll for touch.

---

## 8. Texture and depth

A fixed `.fx` layer sits above the page (`--z-fx: 40`) and ignores pointer events:

- **Grain:** fractal noise, opacity ~0.045, overlay blend, slow stepped drift
- **Vignette:** radial, transparent centre, ~50% black at the edges

Do not add a second grain, a heavier vignette, or a colour overlay on the whole site.

**Letterbox:** two black bars (`.bar--top`, `.bar--bottom`) cover 50.5vh each until
the page reveal opens them (~1.15s expo). Critical inline CSS on every HTML page
paints them before the stylesheet arrives so raw HTML never flashes. A CSS
fallback opens the bars at ~4s if JS never runs. A JS fail-safe completes the
timeline at 4.5s. No renderer may stay letterboxed.

**Progress:** 2px, top of the viewport, violet gradient, scaleX from the left.

**Z-order (do not reshuffle):** media 0, content 1, fx 40, bars 45, topbar 60,
drawer 70, stage/player 80, cursor 90, skip 120.

**Elevation** is rarely a shadow. Use hairlines, a slightly lifted `--near` or
`--panel`, and light. Dialogs: `--near` fill, `--line-soft` border, 88% black
backdrop with a 6px blur.

---

## 9. Motion

Everything animates. Nothing shouts.

| Token | Curve / time |
| --- | --- |
| `--ease-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` primary |
| `--ease-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` |
| `--ease-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` colour, opacity |
| `--t-fast` / `--t-mid` / `--t-slow` | 0.28s / 0.5s / 0.85s |

**Never bounce. Never elastic. Never spring past the rest pose.**

### Page load

Letterbox opens. `[data-load]` items rise ~30px and fade in. `[data-glyphs]`
wordmark letters stagger up. Expo out. ~1.15s bars, ~1.1s glyphs.

### Scroll

Lenis (`lerp` ~0.085, `allowNestedScroll: true`) plus GSAP ScrollTrigger.

- `[data-reveal]`: rise once at 90% viewport
- `[data-reveal-stagger]`: children stagger
- `[data-split]`: masked line reveal
- `[data-parallax]`: slow image drift
- 6s guard force-shows anything still at opacity 0 (throttled tabs, headless)

After injecting DOM: `applyReveals(root)`, `initMagnetic(root)`, `refresh()`.
A page without JS must still show all content (reveals are progressive).

**Movie rails:** `overflow-x: auto; overflow-y: hidden`. Never `data-lenis-prevent`
on the rail, or the vertical wheel dies. Pad the track so hover-scale does not clip.

### Hover house styles (reuse these, do not invent a fourth)

1. **White fill sweep from below** (`.btn`, `.chan`, `.teaser`): a `::after` slab
   translates from `y: 101%` to `y: 0`. Type flips to black. Solid buttons sweep
   *violet* instead, type flips to white
2. **Underline draw** (`.ulink`): scaleX 0 → 1 from the left
3. **Still zoom:** image 1.04 rest → ~1.06–1.10 on hover, 1s expo
4. **Magnetic:** `[data-magnetic]` on primary CTAs, strength ~0.28
5. **Arrow disc rotate** 45° on teasers and member go-buttons

### Countdown

Mono digits. On change the old value blurs up and out, the new one blurs in from
below (~550–700ms expo). Colons are transparent white with a soft pulse. **Never
violet digits.**

### Reduced motion

`prefers-reduced-motion: reduce`:

- No custom cursor
- No scroll reveals, no magnetic, no bolt autorotation
- Letterbox opens instantly
- 3D `$` / `+` render one static angled frame
- Plus sheen is static violet
- Tile hover scale off

Touch / coarse pointer: hide the custom cursor. Do not hide the topbar on scroll.

---

## 10. Cursor

Fine pointer + motion allowed: a difference-blend **dot** with a trailing **ring**.
Native cursor is `none !important` on `body.has-cursor`.

- Default: small white dot + ring
- Link: ring grows slightly
- `[data-hint]`: ring swells into a white disc with a label (Play, Open, View)

**Native `<dialog>` is top-layer** and would hide the cursor. `parkCursor()` moves
the cursor node into:

1. The Fullscreen API element, if any (player shell)
2. Else an open `.stage` or `.orb` dialog
3. Else `document.body`

Smaller dialogs (bag, product sheet, homepage player) restore the **system**
pointer so the visitor is never cursor-less.

---

## 11. Imagery

| Asset | Ratio | Size | Notes |
| --- | --- | --- | --- |
| Project poster | 2:3 | 600×900+ | Series identity on the catalog rail |
| Project banner | ~4:1 | 2048×512+ | Detail page hero |
| Entry thumbnail | 16:9 | 1280×720 | YouTube-sized still |
| Movies billboard | 16:9 | **2560×1440** | Subject in the middle 60%. Bottom third will be veiled |
| Home hero | none | n/a | Black + lightning. No still |
| Share card | 1.91:1 | **1200×630** | `public/share.jpg` |

Files live in `public/projects/` and are referenced from `src/data/projects.js`.
Do not hotlink random screenshots. Do not generate "concept art" for unreleased
films: use the coloured "?" mark.

**Veils:** dark gradients over stills so type stays readable. Billboard with a
looping reel uses a heavier *left* veil (type sits left). Do not put type on a
busy still without a veil.

**Object-fit:** cover, slightly scaled (1.04) so hover can push to 1.06+.

---

## 12. Icons

Thin stroke SVGs, 1.5–1.7, round caps, from `ICONS` in `src/ui.js` and brand
glyphs in `src/socials.js`. **Never emojis. Never filled fat icons. Never icon
fonts.**

Buttons that are icon-only are 2.9rem circles with a hairline (`icon-btn`).
Player controls are quieter 2.4rem hits.

---

## 13. Interaction components

Use what exists. New UI should look like a relative of these, not a new kit.

### Buttons (`.btn`)

Pill, `min-height: 3.05rem`, `padding: 0 1.5rem`, hairline, Inter Tight, no
shadow. Default is ghost (transparent, white type). Primary is `.btn--solid`
(white fill, black type). Hover: fill sweeps up, type inverts. Solid hover:
violet fill, white type.

Do not use rectangles, 8px radius "app" buttons, or coloured outlines.

**Never a disabled watch pill.** If the visitor cannot watch yet, show Add to
calendar (and Play trailer when a reel exists).

### Text links (`.ulink`)

Quiet, `--ink-70`, underline draws on hover and on `aria-current="page"`. Nav
uses this.

### Icon button

Circle, hairline, `--ink-70` to `--ink` on hover.

### Labels (`.label`)

Uppercase, tracked, `--ink-36`, sit above a title with `--gap-md`.

### Section head (`.sec-head`)

Title left (`--step-4`, max ~20ch). Optional note right on desktop, `--ink-52`,
max ~32ch.

### Teasers (`.teaser`)

Giant type row, full width of the shell, white sweep, rotating arrow disc.
Home uses two: Shop and Support. Subline is honest ("lands here soon", not a
shipping promise).

### Channels (`.chan`)

Brand icon + name + note, hairline row, white sweep. Official links only.

### Tiles (`.tile`)

16:9 in a horizontal rail. Hover: scale ~1.07, play disc fades in (white fill
on hover). Copy sits on a bottom gradient. Upcoming: `.tile--soon`, no play,
Climate Crisis "?" in `mark` colour, kicker "Film n", "To be announced",
"Expected Q…", violet-pale "Estimate". Poster tiles are 2:3 (`.tile--poster`).

### Membership strip (`.member`)

Not on the homepage. On `/movies` as `.member--hub`: star tag "Members site",
BR4M+ in the title, one paragraph, solid CTA "Become a member". Violet radial
glow on the right, scales on hover. No prices.

### Dialogs

Black/near panels, no drop shadow beyond the dimmed backdrop. Globe (`.orb`)
is a transparent full-viewport dialog with the panel inside, so the cursor can
live in the top layer. Player (`.stage`) is a black 100dvh dialog. Sheets
(bag, product) slide from the right. Esc closes. Reduced motion snaps.

### Countdown (`.cd`)

Huge mono numbers, tiny uppercase unit labels. Used on the movies billboard
and the homepage premiere band.

---

## 14. Page-by-page design

### Home `/`

Black void, centred. Giant Climate Crisis wordmark. One line of intent. **One
CTA:** the current film (today: "The First Word"), not Shop, not BR4M+. Hovering
the wordmark crackles electricity (WebGL bolts, white-hot core, violet halo).
Ambient strikes every 4–8s. No background image.

Then: compact premiere band (still + title + countdown + Open the film + Add to
calendar) → newest long-form upload row → about statement and specs → Shop and
Support teasers → official channels.

BR4M+ is **not billed on home**. Shop in the hero stays out until merch is live.

### Movies `/movies`

Already a catalog, even with one series. Full-bleed billboard of the next
premiere (muted looping reel, Bebas title, logline, countdown, Play trailer,
calendar). Rails overlap the billboard slightly (negative margin, Netflix-like
*structure*). Order: the current series' films → BR4M+ strip → trailers/extras
from the YouTube feed → series posters.

It must feel like a studio library, not an empty waiting room.

### Movie detail `/movies/:slug`

Wide veiled banner, series title, logline, Play trailer, then the same film
rail. Back link: "All movies". Real path, not a hash.

### Shop `/shop`

When the catalog is empty: composed block, honest line ("Merch is in the works.
The first official BR4M drop lands here soon."), Movies as the exit, **currency
globe stays**. When live: product wall, sheets, bag. Checkout is Fourthwall.
Prices in JetBrains Mono.

### Support `/donate`

BR4M+ and Donate as **equals**: two panels, violet vs money green, stack under
880px (plus above dollar). 3D `$` and `+` (Three.js, lean toward the pointer).
"Just hang out" teasers below (watch, like, comment, subscribe, Discord). One
quiet currency note under the split. Never a third "tier comparison" column.

### Press `/press`

Quiet kit. Hairline download rows for the wordmark and existing stills. Real
logline, premiere stamp, and a short FAQ (`.faq`) so people and crawlers get the
same facts. Discord is the press contact. Footer only, not top nav.

### Privacy `/privacy`

Quiet policy page, same interior hero as Press. Hairline table for cookies.
Footer only, not top nav. Cookie settings is a real button, not a fake link.

### Cookie bar

Fixed bottom panel on black, hairline, equal **Reject optional** and **Accept
all** (both `.btn`, not a solid Accept that shouts). Customize is an underline.
Visitor copy only: which pages people visit, and YouTube to play films. No
measurement IDs, no nocookie talk. Do not trap the page. Do not show it over
the player (`body.is-dialog` hides it). The player then carries its own YouTube
gate: Allow YouTube, Open on YouTube, Not now. Analytics stays off unless they
already allowed it.

### 404

Quiet not-found on black. Do not dump the visitor on home. Do not be funny at
length.

---

## 15. Player

The BR4M player (`.stage` + `src/player.js`) is a black cinematic chrome over a
`www.youtube.com` iframe (not nocookie), so a play can count as a YouTube view.

- 16:9 frame **contained** in the viewport (and in real Fullscreen API, portrait
  and landscape). JS sizes the frame; CSS is the fallback
- YouTube's own bar never shows (`controls: 0`)
- BR4M chrome: play/pause, scrub, time, volume (mute plus a level slider), full screen, title, Like, Comment
- Full screen is the Fullscreen API on the player shell; CSS cover if the UA
  blocks it. Close always exits full screen. `F` toggles
- Like / Comment open that YouTube page in a new tab
- **Ads:** lift hit layer, big play, and dock so Skip stays clickable. Do not
  seek or rewrite the timeline from ad time. Keep close (and full screen) available
- Keyboard: Space / K, arrows (seek), up/down (volume), M, F, Esc
- Custom cursor must live inside the fullscreen node
- While a film is playing, cursor and chrome idle after a short still moment.
  Move again and they come back. Keep the cursor during ads so Skip stays findable.

Homepage latest-upload still uses a simpler `[data-player]` dialog. Movies use
`.stage`. Do not send the visitor to youtube.com for a hub play once YouTube
cookies are allowed. Before that, the gate offers Open on YouTube as the
equivalent path.

---

## 16. Membership, money, shop honesty

**BR4M+** is the membership name. Plus is violet with a sheen (`.plus`). Copy:
you unlock member perks by subscribing. That is all.

Movies strip may say: watch ad free on the members site, plus more films, extras
and member perks. Still no prices, no named tiers.

**Donate** may mention a high chance of a personal thank you from Bram (message,
voice note or video). Green appears only here (the `$`).

Fourthwall URLs are links, never printed as visible text:

- Memberships: `https://br4m-shop.fourthwall.com/pages/memberships`
- Donations: `https://br4m-shop.fourthwall.com/pages/donations`
- Members feed: `https://br4m-shop.fourthwall.com/supporters`

Paid links get a locale prefix (`/en-eur/...`) from the detected or chosen
currency. Never hardcode the prefix in HTML. Never intercept the click with a
currency dialog. The globe only opens from the shop's own currency button.

Currency start: device time zone, then language region, then `VITE_FOURTHWALL_CURRENCY`
or EUR. Never geo-IP. A guess is not stored; only an explicit pick is.

---

## 17. Facts for people and machines

Search engines and AI crawlers should be able to answer "who is BR4M" from the
HTML, not only from JavaScript. Keep a quiet facts block on `/movies` (`.facts`,
same hairline `dl` as `.specs`) and a FAQ on `/press` (`.faq`). Copy stays
English, short, and true. Do not keyword-stuff. Do not hide a second page of
facts from visitors while showing it to bots.

The homepage latest-upload row has a real link in the HTML so a crawler that
does not run JavaScript still sees the current film. JS replaces that link with
the player control.

Machine files at the root (`/llms.txt`, `/llms-full.txt`, `/about.md`, plus
`/home.md` and the other page `.md` files) repeat the same facts in Markdown.
They are generated from `src/seo.js`, not a second voice. `/llms.txt` is also at
`/.well-known/llms.txt`. HTML pages point to it with `rel="describedby"`.

---

## 18. Accessibility (design implications)

- Skip link on every page
- Contrast: body on black at or above WCAG AA. Do not fade type below `--ink-36`
  for essential copy
- Focus-visible is violet and obvious. Do not `outline: none` without a replacement
- Reduced motion is a first-class design, not an afterthought
- Do not trap people in timed actions. Premiere watch does not appear until a
  real URL exists
- `lang="en"` on every document
- Player and dialogs must be closable with Esc and a visible close control
- Hidden native `<dialog>` must actually `display: none` until `[open]`

---

## 19. How to design something new

When asked to add or redesign a surface, walk this list in order.

1. **What is the one thing this view is for?** One primary action. Everything
   else is quieter.
2. **Is the content real?** If the still, title, date, product, or perk does not
   exist, design the empty or TBA state. Do not fake a catalog.
3. **Black, white type, one still or none.** If you need a third colour, you are
   probably decorating. Violet is for interaction and BR4M+. Green is for `$`.
4. **Pick a type role.** Wordmark / film title / UI / mono. Do not mix for fun.
5. **Reuse a house pattern.** Button sweep, teaser row, hairline list, tile rail,
   member strip, split panel. If none fit, design a close cousin, not a card grid.
6. **Give every control a hover.** Prefer the existing sweeps and underlines.
7. **Motion is expo, short, once.** If it loops and shouts, cut it. Lightning on
   the home wordmark is the one loud exception, and even that is still on black.
8. **Write the copy in English, short, no dash in the middle of a sentence.**
   Read it out loud. If it sounds like a thumbnail or a TV station, rewrite.
9. **Check 320px and 1440px.** No horizontal page scroll. Touch has no custom
   cursor and a visible topbar.
10. **Update this file** with the new pattern so the next agent does not invent
    a sixth one.

### Quick "is this BR4M?" test

A screenshot should still look like BR4M if you cover the logo: black field,
one large still or one large word, white type, almost no colour, quiet motion.
If it looks like a startup landing, a streaming dashboard, or a gamer HUD, start
over.

---

## 20. Component index (implementation)

| Component | Where | Design notes |
| --- | --- | --- |
| Void hero | `index.html` `.void` `src/bolt.js` | Black, centred, one film CTA. Wordmark lightning is WebGL (2D canvas fallback) |
| Movies hub | `/movies` `src/projects.js` | Billboard + rails + BR4M+ strip. Data in `src/data/projects.js` |
| Billboard | `.feature` `src/reel.js` | Next premiere, muted reel, Play trailer, calendar |
| On-site player | `.stage` `src/player.js` | Viewport-fit 16:9, ads pass through, real full screen, Like/Comment to YouTube |
| Homepage premiere | `.premiere` `src/premiere.js` | Compact band. No disabled watch pill |
| Latest upload | `.latest` `src/watch.js` | One long-form row, homepage only |
| Countdown | `.cd` `src/countdown.js` | Mono, blur ticks, far/soon/live |
| Series banner | `.series-hero` | Wide, veiled, detail route |
| Film tiles | `.tile` | 16:9 rails. TBA = coloured "?", never a reused still |
| Homepage player | `[data-player]` | Simpler 16:9 dialog for the latest upload |
| Currency globe | `.orb` `src/globe.js` | Real land dots, violet countries, shop button only |
| Bag | `.sheet` `src/shop.js` | Count badge, steppers, subtotal |
| Membership | `.member` | Name + link. Movies hub strip. Not on home |
| Teasers | `.teaser` | Giant type, white sweep |
| Channels | `.chan` | Official links, white sweep |
| Press kit | `.kit` `/press` | Hairline downloads. Footer, not nav |
| Lost page | `.lost` `404.html` | Quiet. Real 404, not a home fallback |
| 3D glyphs | `src/cash3d.js` | `$` and `+` on donate only |

Icons: `src/ui.js` `ICONS`. Brand channel glyphs: `src/socials.js`.

---

## 21. Data the design depends on

Movies are added by hand in `src/data/projects.js`: slug, title, tag, poster,
banner, blurb, entries. An entry is a title, a 16:9 `thumb` **or** a `mark`
colour, optional `hero`, `release` instant, `expected` quarter (always labelled
an estimate), `url` (YouTube, paste when it exists), `reel` (trailer id).

Untitled: "To be announced". Current Architects estimates: film 2 Q4 2026
(`#87BEA8`), film 3 Q1 2027 (`#7E69D2`).

Share cards: `https://br4m.tv/share.jpg` plus `og:url`, canonical, Twitter
large-image on every page.
