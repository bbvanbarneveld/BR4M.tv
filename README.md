# BR4M.tv

Multi-page brand site for **BR4M** — original series written, built and filmed inside
Minecraft. Black surface, white type, violet accent. The cinema feel comes from imagery:
film stills as heroes, letterbox page reveals, film grain, a live CET clock.

## Pages

| URL | File | Content |
| --- | --- | --- |
| `/` | `index.html` | Lightning wordmark, premiere countdown, newest upload, about, shop/support teasers, channels |
| `/movies` | `movies.html` | Billboard, series rails, BR4M+ strip, trailers, on-site player |
| `/movies/:slug` | `movies.html` | Same page, path-routed detail. Build also emits `movies/:slug.html` for share tags |
| `/shop` | `shop.html` | Fourthwall catalog, currency globe, bag, checkout |
| `/donate` | `donate.html` | BR4M+ membership, one-time donations, Discord |
| `/press` | `press.html` | Logline, premiere stamp, downloadable stills |
| (unknown) | `404.html` | Not-found page. nginx does not fall back to home |

Legacy `/watch` and `/projects` redirect to `/movies`. Legacy `/movies#slug` rewrites to
`/movies/slug`.

Design rules live in `DESIGN.md` (full visual briefing for anyone designing the
site). Keep it in sync with every relevant change, together with this file and
`AGENTS.md`.

Clean URLs are handled by nginx (`try_files $uri $uri.html`) in production and by the
`br4m-routes` plugin in `vite.config.js` during dev.

## Stack

- Vite (vanilla JS, no framework), one HTML entry per page
- GSAP (ScrollTrigger, SplitText) + Lenis for smooth scroll
- Fourthwall Storefront API for the shop
- Google Fonts: Climate Crisis (wordmark), Inter Tight, JetBrains Mono (timecode/prices)

## Develop

```bash
npm install
npm run dev
```

`predev` / `prebuild` run `scripts/fetch-videos.mjs`, which refreshes `src/data/videos.json`
from the YouTube channel feed. A GitHub Action repeats this every 6 hours.

## Build

```bash
npm run build
npm run preview
```

Static output lands in `dist/` (nginx config and Dockerfile included for Dokploy).

## Environment

Copy `.env.example` to `.env.local` and fill in the public Fourthwall Storefront token:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_FOURTHWALL_STOREFRONT_TOKEN` | yes, for the shop | Public `ptkn_` token from the Fourthwall dashboard |
| `VITE_FOURTHWALL_CHECKOUT` | no | Checkout host, e.g. `checkout.br4m.tv`. Falls back to the shop domain from the API |
| `VITE_FOURTHWALL_CURRENCY` | no | Starting currency (default `EUR`); visitors can switch it on the site |

Never put the Fourthwall Platform / secret shop key in this repo — the frontend only uses the
public Storefront API, and checkout is always hosted by Fourthwall.

## Source map

| File | Role |
| --- | --- |
| `src/app.js` | Shared page boot (chrome, motion, cursor, letterbox reveal) |
| `src/main.js` / `src/projects-page.js` / `src/shop-page.js` / `src/page.js` | Page entries |
| `src/premiere.js` | Homepage premiere band (countdown, calendar, film link) |
| `src/release.js` | Shared premiere / watch button markup |
| `src/calendar.js` | `.ics` for the next premiere |
| `src/site.js` | Live origin and movie paths |
| `src/bolt.js` | Hero lightning: WebGL fragment-shader glow (2D canvas fallback) |
| `src/reel.js` | YouTube background reel for hero sections |
| `src/player.js` | On-site player: viewport-fitted BR4M chrome over a youtube.com iframe (views count; Like/Comment open YouTube; ads pass through; real full screen) |
| `src/cash3d.js` | Real 3D extruded `$` and `+` glyphs (Three.js, pointer-reactive, lazy on the donate page) |
| `src/motion.js` | Lenis, ScrollTrigger, reveals, page reveal, magnetic hover |
| `src/cursor.js` | Custom cursor (reparented into dialogs and Fullscreen API views) |
| `src/chrome.js` | CET clock (Europe/Amsterdam), year, mobile menu |
| `src/watch.js` | Video mounts, film stills, hover preview, player dialog |
| `src/projects.js` + `src/data/projects.js` | Movies hub, billboard, rails, TBA "?" tiles, BR4M+ strip, series pages |
| `src/countdown.js` | Premiere countdown with blur ticks and phases |
| `src/channels.js` | Channel rows |
| `src/shop.js` | Product wall, product sheet, bag |
| `src/currency.js` | Currency state and formatting |
| `src/globe.js` | Currency switcher: dot-globe dialog that lights up the countries |
| `src/fourthwall.js` | Storefront API client |
| `src/youtube-feed.js` | Feed parsing, brand URLs, vanity routes |

## Vanity routes

`/youtube`, `/discord`, `/tiktok` redirect out; `/doneer` redirects to `/donate`. Kept in sync
between `nginx.conf` (production) and the Vite plugin in `vite.config.js` (dev).
