import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { premiereIcs } from './src/calendar.js'
import { featuredRelease, PROJECTS } from './src/data/projects.js'
import { SITE_URL } from './src/site.js'
import { VANITY_REDIRECTS } from './src/youtube-feed.js'

const root = dirname(fileURLToPath(import.meta.url))

/** Clean URLs that map to HTML pages (mirrors nginx try_files in production). */
const PAGE_REWRITES = {
  '/movies': '/movies.html',
  '/movies/': '/movies.html',
  '/shop': '/shop.html',
  '/shop/': '/shop.html',
  '/donate': '/donate.html',
  '/donate/': '/donate.html',
  '/press': '/press.html',
  '/press/': '/press.html',
  '/404': '/404.html',
}

function isMoviePath(path) {
  return /^\/movies\/[^/]+\/?$/.test(path)
}

function looksLikeAsset(path) {
  return (
    path.startsWith('/src') ||
    path.startsWith('/@') ||
    path.startsWith('/node_modules') ||
    path.startsWith('/projects') ||
    /\.[a-zA-Z0-9]+$/.test(path)
  )
}

function isKnownPage(path) {
  return path === '/' || Boolean(PAGE_REWRITES[path]) || Boolean(VANITY_REDIRECTS[path]) || isMoviePath(path)
}

function applyPageMeta(html, { title, description, url }) {
  const next = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/g, `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/g, `$1${title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/g, `$1${description}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/g, `$1${title}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/g, `$1${description}$2`)
  return next
}

function routes() {
  const handle = (req, res, next) => {
    const path = req.url?.split('?')[0] || '/'

    if (path === '/premiere.ics') {
      const featured = featuredRelease()
      if (!featured) {
        res.statusCode = 404
        res.end()
        return
      }
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
      res.end(premiereIcs(featured))
      return
    }

    const location = VANITY_REDIRECTS[path]
    if (location) {
      res.statusCode = 302
      res.setHeader('Location', location)
      res.end()
      return
    }

    if (isMoviePath(path)) {
      req.url = '/movies.html'
      next()
      return
    }

    const page = PAGE_REWRITES[path]
    if (page) {
      req.url = page
      next()
      return
    }

    if (!looksLikeAsset(path) && !isKnownPage(path)) {
      res.statusCode = 404
      req.url = '/404.html'
    }

    next()
  }

  return {
    name: 'br4m-routes',
    configureServer(server) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle)
    },
    closeBundle() {
      const dist = resolve(root, 'dist')
      const featured = featuredRelease()
      if (featured) {
        writeFileSync(resolve(dist, 'premiere.ics'), premiereIcs(featured))
      }

      const moviesHtml = readFileSync(resolve(dist, 'movies.html'), 'utf8')
      mkdirSync(resolve(dist, 'movies'), { recursive: true })
      for (const project of PROJECTS) {
        const title = `${project.title}, a BR4M movie`
        const html = applyPageMeta(moviesHtml, {
          title,
          description: project.blurb,
          url: `${SITE_URL}/movies/${project.slug}`,
        })
        writeFileSync(resolve(dist, 'movies', `${project.slug}.html`), html)
      }
    },
  }
}

export default defineConfig({
  plugins: [routes()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        movies: resolve(root, 'movies.html'),
        shop: resolve(root, 'shop.html'),
        donate: resolve(root, 'donate.html'),
        press: resolve(root, 'press.html'),
        notFound: resolve(root, '404.html'),
      },
    },
  },
})
