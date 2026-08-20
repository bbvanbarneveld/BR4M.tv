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
- Movies and releases are data-driven from `src/data/projects.js` (posters, banners, hero art,
  release instants, premiere URLs). Movie detail routes are real paths: `/movies/the-architects`.
  Legacy hashes (`/movies#the-architects`) rewrite to that path.
- The YouTube gallery lives on the homepage only (newest upload); there is no separate videos page.
- The site is about **BR4M** the filmmaker. THE ARCHITECTS is one series among more to come —
  never frame the whole site around a single series.
- The visible clock is **BR4M's local time (Europe/Amsterdam, CET/CEST)** so announced release
  times mean one thing.

## Visual system

- Pure black surface, **white** as the theme colour, **purple** (`#C900FF`, deeper violets `#6B21A8` / `#4C1D95`) as the accent. One exception: **money green** (`--cash`) exists exclusively for donation elements (the 3D `$`). No orange, cyan, gold, or other accent hues anywhere.
- Cinema is expressed through **imagery and framing** — film stills as heroes, letterbox page
  reveals, film grain, big quiet type. **Never** through faux-TV jargon copy ("Transmission 001",
  "On air", "Signal", channel numbers). No space/starfield styling.
- Type: `Climate Crisis` for the wordmark only, `Inter Tight` for headings and body, `JetBrains Mono` only for the timecode and prices.
- Do not turn this into a generic card-grid landing page.

## Motion rules

- Everything animates, but nothing shouts. Ease with expo/quart curves, no bounce.
- Page reveal is a short letterbox open (~1.2s) with content rising in; a fail-safe forces it
  to complete so no renderer stays letterboxed.
- Smooth scroll is Lenis; scroll animation is GSAP ScrollTrigger. Reveals are created in JS
  (`applyReveals`) so a page without JS still shows all content, and a 6s guard clears any
  element that never got its trigger.
- Every interactive element needs a hover state. Respect `prefers-reduced-motion`: no cursor,
  no reveals, bars open instantly.
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
