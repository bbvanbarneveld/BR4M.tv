# BR4M.tv — agent rules

This repository is the **BR4M** site: a cinematic, English-language brand surface for Minecraft.

## Language (absolute)

- **Every visitor-facing string is English.** UI copy, `aria-label`s, `title`, `meta description`, alt text, button labels, empty states, skip links, footer, donate page — all of it.
- **Never add Dutch or any other language** to the site. Not a single word. Not “Doneer”, not “Terug”, not mixed sentences.
- Code comments, commit messages, and these agent files are English too.
- **No em-dashes or mid-sentence dashes** in visitor-facing copy. Use commas, periods or colons.
- If a user writes in another language in chat, reply in their language if you want — **the website stays English**.
- Film titles coming from YouTube stay as published (they are source content, not UI copy).

## Vanity routes

- `/youtube` → YouTube channel
- `/discord` → Discord invite
- `/tiktok` → TikTok
- `/donate` is the support page, linking out to the Fourthwall membership. Legacy `/doneer` redirects there.

Keep these working in `nginx.conf` and the Vite plugin in `vite.config.js`.

## Docs discipline

- `DESIGN.md` is the design source of truth. **Every relevant change updates `DESIGN.md`,
  `README.md` and this file in the same commit.**

## Site structure

- Multi-page: `/` (home), `/movies`, `/shop`, `/donate`, `/press`. Clean URLs come from nginx
  `try_files $uri $uri.html` and the `br4m-routes` plugin in `vite.config.js`. Keep both in sync.
  Legacy `/watch` and `/projects` redirect to `/movies`. Unknown paths serve `404.html`.
- Movies and releases are added by hand in `src/data/projects.js` (posters, banners, hero art,
  release instants, expected quarters, premiere URLs, trailer ids). `/movies` is the catalog
  hub (billboard + rails + on-site player). Movie detail routes are real paths:
  `/movies/the-architects`. Legacy hashes (`/movies#the-architects`) rewrite to that path.
- Play films and trailers in the BR4M player (`src/player.js`) on top of YouTube. Do not send
  the visitor to youtube.com for a hub play action. Embed on `www.youtube.com` (not
  youtube-nocookie) so a play counts as a YouTube view. Like and Comment in the player
  are the exception: they open that video on YouTube. Full screen uses the Fullscreen API
  (with a CSS cover fallback) and must exit when the player closes. During YouTube ads,
  lift BR4M overlays so Skip works; do not seek or rewrite the timeline from ad time.
  Untitled films stay "To be announced"; expected quarters must be labelled as estimates.
  Films without a still use a Climate Crisis "?" in the entry's `mark` colour, never a
  reused photo.
- The YouTube gallery lives on the homepage only (newest upload); there is no separate videos page.
- The homepage hero has one door: the current film. Shop stays a teaser until merch is live.
  BR4M+ is not billed on home; it lives on `/donate`.
- Premiere / watch buttons never render as disabled pills. Far from release, Add to calendar
  is the action. The YouTube link appears when `url` is set.
- The site is about **BR4M** the filmmaker. THE ARCHITECTS is one series among more to come —
  never frame the whole site around a single series.
- The visible clock is **BR4M's local time (Europe/Amsterdam, CET/CEST)** so announced release
  times mean one thing.

## Visual system

- Pure black surface, **white** as the theme colour, **purple** (`#C900FF`, deeper violets `#6B21A8` / `#4C1D95`) as the accent. One exception: **money green** (`--cash`) exists exclusively for donation elements (the 3D `$`). No orange, cyan, gold, or other accent hues anywhere.
- Cinema is expressed through **imagery and framing** — film stills as heroes, letterbox page
  reveals, film grain, big quiet type. **Never** through faux-TV jargon copy ("Transmission 001",
  "On air", "Signal", channel numbers). No space/starfield styling.
- Type: `Climate Crisis` for the wordmark and TBA "?" tiles, `Inter Tight` for headings and body, `JetBrains Mono` only for the timecode and prices.
- Do not turn this into a generic card-grid landing page.

## Motion rules

- Everything animates, but nothing shouts. Ease with expo/quart curves, no bounce.
- Page reveal is a short letterbox open (~1.2s) with content rising in; a fail-safe forces it
  to complete so no renderer stays letterboxed.
- Smooth scroll is Lenis (`allowNestedScroll`); scroll animation is GSAP ScrollTrigger.
  Movie rails must use `overflow-y: hidden` and must not set `data-lenis-prevent`, or
  vertical wheel over a row traps the page. Reveals are created in JS (`applyReveals`)
  so a page without JS still shows all content, and a 6s guard clears any element that
  never got its trigger.
- Every interactive element needs a hover state. Respect `prefers-reduced-motion`: no cursor,
  no reveals, bars open instantly. Native dialogs sit in the top layer: move the custom
  cursor into fullscreen dialogs (player, currency globe) and into the Fullscreen API
  node when the player goes full screen. Restore the system pointer in smaller popups
  so a popup is never cursor-less.
- After injecting DOM async, call `applyReveals(root)`, `initMagnetic(root)` and `refresh()`.

## YouTube feed (homepage)

- Long-form uploads only. Filter Shorts.
- Keep `scripts/fetch-videos.mjs`, the GitHub Action cron (every 6 hours), and the client refresh in `src/youtube-feed.js` working so the homepage stills and newest upload update without a manual edit.

## Shop (Fourthwall)

- The homepage **Shop** section is user-facing only. Catalog, cart, and checkout redirect use the **Storefront API** (`ptkn_` via `VITE_FOURTHWALL_STOREFRONT_TOKEN`).
- Never put the Platform / shop secret key in this frontend, in the browser, or in git.
- Checkout is always Fourthwall-hosted. Do not build a custom checkout or membership login here.
- **The membership is named BR4M+** and lives on Fourthwall. On this site show only the name
  and a link, with the `+` styled via the `.plus` class (animated violet sheen). Never list
  perks, tiers or prices, they change on Fourthwall and must not go stale here. Patreon is retired.
  The movies hub may carry a BR4M+ strip: ad-free watching on the members site, plus more
  films, extras and member perks. Still no prices or named tiers.
- Fourthwall URLs (link directly, never print a URL as visible text):
  membership tiers `https://br4m-shop.fourthwall.com/pages/memberships`,
  one-time donations `https://br4m-shop.fourthwall.com/pages/donations`,
  members feed `https://br4m-shop.fourthwall.com/supporters`.
- The currency switcher is the dot-globe dialog in `src/globe.js` (real world land map,
  countries light up per currency); supported codes and symbols live in
  `src/currency.js` (popular four first, rest alphabetical).
- **The starting currency is detected locally** by `detectCurrency` in `src/currency.js`:
  device time zone first (so Europe gets EUR), browser language region as backup, then
  `VITE_FOURTHWALL_CURRENCY` or EUR. Never call a geo IP service for this. A guess is
  never written to storage; only an explicit pick is remembered, and it always wins.
- **Paid Fourthwall links carry the currency locale.** `initShopLinks` in `src/app.js`
  rewrites every link to `br4m-shop.fourthwall.com` (except `/supporters`) through
  `localizedShopUrl`, so a link becomes `/en-eur/pages/donations` and visitors land on
  their own prices and payment methods. Never hardcode a locale prefix in HTML, and
  never interrupt the click with a dialog. The support page carries one quiet line
  (`.split__note` with `[data-shop-currency]`) telling visitors they can change the
  currency on the shop page if the guess is wrong.
- Optional: `VITE_FOURTHWALL_CHECKOUT` (host), `VITE_FOURTHWALL_CURRENCY` (default `EUR`).
- If the token is missing, keep the Shop section and show the empty state. Do not invent products.
