/** Public origin of the live site. Used for share cards, calendar URLs, JSON-LD. */
export const SITE_URL = 'https://br4m.tv'

export function moviePath(slug) {
  return `/movies/${encodeURIComponent(slug)}`
}

export function absoluteUrl(path) {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${suffix}`
}

/** Read a movie slug from `/movies/:slug` or a leftover `#slug` hash. */
export function movieSlugFromLocation(pathname = '', hash = '') {
  const path = String(pathname).replace(/\/+$/, '') || '/'
  const match = path.match(/^\/movies\/([^/]+)$/)
  if (match) {
    return decodeURIComponent(match[1].replace(/\.html$/i, ''))
  }
  return String(hash).replace(/^#/, '')
}
