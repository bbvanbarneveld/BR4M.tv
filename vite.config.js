import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { premiereIcs } from './src/calendar.js'
import { featuredRelease, PROJECTS } from './src/data/projects.js'
import {
  applyDocumentSeo,
  moviePageGraph,
  pageNameFromFile,
  pageSeo,
  submitIndexNow,
  writeSeoFiles,
} from './src/seo.js'
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
  return /^\/movies\/[^/]+\/?$/.test(path) && !/\.[a-zA-Z0-9]+$/.test(path)
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

function applyPageMeta(html, options) {
  return applyDocumentSeo(html, options)
}

function sendNotFound(res, fromDist) {
  const file = fromDist ? resolve(root, 'dist/404.html') : resolve(root, '404.html')
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(readFileSync(file))
}

function routes() {
  const handle = (req, res, next, { rewriteMovies, fromDist }) => {
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
      if (rewriteMovies) {
        req.url = '/movies.html'
        next()
        return
      }
      const slug = path.replace(/^\/movies\//, '').replace(/\/$/, '').replace(/\.html$/i, '')
      if (!existsSync(resolve(root, 'dist/movies', `${slug}.html`))) {
        sendNotFound(res, true)
        return
      }
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
      sendNotFound(res, fromDist)
      return
    }

    next()
  }

  return {
    name: 'br4m-routes',
    buildStart() {
      writeSeoFiles(resolve(root, 'public'))
    },
    configureServer(server) {
      writeSeoFiles(resolve(root, 'public'))
      server.middlewares.use((req, res, next) =>
        handle(req, res, next, { rewriteMovies: true, fromDist: false }),
      )
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) =>
        handle(req, res, next, { rewriteMovies: false, fromDist: true }),
      )
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const name = pageNameFromFile(ctx.filename || ctx.path)
        const seo = name ? pageSeo(name) : null
        return seo ? applyDocumentSeo(html, seo) : html
      },
    },
    async closeBundle() {
      const dist = resolve(root, 'dist')
      const featured = featuredRelease()
      if (featured) {
        writeFileSync(resolve(dist, 'premiere.ics'), premiereIcs(featured))
      }

      writeSeoFiles(dist)

      const moviesHtml = readFileSync(resolve(dist, 'movies.html'), 'utf8')
      mkdirSync(resolve(dist, 'movies'), { recursive: true })
      for (const project of PROJECTS) {
        const title = `${project.title}, a BR4M movie`
        const html = applyPageMeta(moviesHtml, {
          title,
          description: project.blurb,
          url: `${SITE_URL}/movies/${project.slug}`,
          image: `${SITE_URL}${project.poster}`,
          imageAlt: `${project.title}, a BR4M movie`,
          type: 'video.movie',
          markdown: `/movies/${project.slug}.md`,
          graph: moviePageGraph(project),
        })
        writeFileSync(resolve(dist, 'movies', `${project.slug}.html`), html)
      }

      await submitIndexNow()
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
