import { defineConfig } from 'vite'
import { resolve } from 'path'
import { VANITY_REDIRECTS } from './src/youtube-feed.js'

/** Clean URLs that map to HTML pages (mirrors nginx try_files in production). */
const PAGE_REWRITES = {
  '/movies': '/movies.html',
  '/movies/': '/movies.html',
  '/shop': '/shop.html',
  '/shop/': '/shop.html',
  '/donate': '/donate.html',
  '/donate/': '/donate.html',
}

function routes() {
  const handle = (req, res, next) => {
    const path = req.url?.split('?')[0]
    const location = VANITY_REDIRECTS[path]
    if (location) {
      res.statusCode = 302
      res.setHeader('Location', location)
      res.end()
      return
    }
    const page = PAGE_REWRITES[path]
    if (page) req.url = page
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
  }
}

export default defineConfig({
  plugins: [routes()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        movies: resolve(__dirname, 'movies.html'),
        shop: resolve(__dirname, 'shop.html'),
        donate: resolve(__dirname, 'donate.html'),
      },
    },
  },
})
