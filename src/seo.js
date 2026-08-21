import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { featuredRelease, PROJECTS } from './data/projects.js'
import { SITE_URL, absoluteUrl, moviePath } from './site.js'
import {
  DISCORD_URL,
  MEMBERSHIP_URL,
  TIKTOK_URL,
  YOUTUBE_URL,
} from './youtube-feed.js'

const ORG_ID = `${SITE_URL}/#organization`
const PERSON_ID = `${SITE_URL}/#person`
const SITE_ID = `${SITE_URL}/#website`
const LOGO = `${SITE_URL}/logo.png`
const SHARE = `${SITE_URL}/share.jpg`
const HERE = dirname(fileURLToPath(import.meta.url))

/** Public IndexNow key. Hosted at /{key}.txt so Bing can verify the site. */
export const INDEXNOW_KEY = '8f3c2a91b4d06e17c5a0-br4m'

export const SAME_AS = [YOUTUBE_URL, DISCORD_URL, TIKTOK_URL]

export const FAQS = [
  {
    q: 'Who is BR4M?',
    a: 'BR4M is a filmmaker who writes, builds and films original series inside Minecraft. The official site is br4m.tv.',
  },
  {
    q: 'What is The First Word?',
    a: 'The First Word is the first film in The Architects, a scripted trilogy. It premieres 30.08.2026 at 15:00 CEST on YouTube and can be played on br4m.tv/movies.',
  },
  {
    q: 'What is The Architects?',
    a: 'The Architects is a scripted Minecraft trilogy. Three command blocks. Three hidden locations. Whoever holds all three can rewrite the world.',
  },
  {
    q: 'How do I watch BR4M films?',
    a: 'Play them on br4m.tv/movies in the BR4M player, or on YouTube at @br4mtv. Like and comments live on YouTube.',
  },
  {
    q: 'What is BR4M+?',
    a: 'BR4M+ is the membership on Fourthwall. Members watch ad free on the members site and get more films, extras and member perks. Tiers and prices live on the shop, not on this site.',
  },
  {
    q: 'How do I contact BR4M for press?',
    a: 'Reach BR4M on Discord. Stills and type are on br4m.tv/press.',
  },
]

const CRAWLERS = [
  '*',
  'Googlebot',
  'Googlebot-Image',
  'Googlebot-Video',
  'Google-Extended',
  'Google-CloudVertexBot',
  'GoogleOther',
  'Bingbot',
  'DuckDuckBot',
  'DuckAssistBot',
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'claude-web',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'CCBot',
  'meta-externalagent',
  'FacebookBot',
  'Bytespider',
  'YouBot',
  'cohere-ai',
  'MistralAI-User',
  'GrokBot',
  'xAI-Grok',
  'AI2Bot',
  'GoogleAgent-Mariner',
]

function json(value) {
  return JSON.stringify(value)
}

function stamp(iso) {
  return iso ? new Date(iso).toISOString() : undefined
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function prettyDate(iso) {
  const [year, month, day] = String(iso).slice(0, 10).split('-')
  if (!year || !month || !day) return ''
  return `${day}.${month}.${year}`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function loadVideos() {
  try {
    return JSON.parse(readFileSync(resolve(HERE, 'data/videos.json'), 'utf8'))
  } catch {
    return []
  }
}

function longFormVideos() {
  return loadVideos().filter((video) => video?.id && !video.short)
}

function videoById(id) {
  return longFormVideos().find((video) => video.id === id)
}

function namedEntries() {
  return PROJECTS.flatMap((project) =>
    project.entries
      .filter((entry) => entry.title && entry.title !== 'To be announced')
      .map((entry) => ({ project, entry })),
  )
}

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'BR4M',
    alternateName: ['BR4M.tv', 'br4mtv'],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO,
      width: 512,
      height: 512,
    },
    image: SHARE,
    description:
      'BR4M writes, builds and films original cinematic series inside Minecraft.',
    sameAs: SAME_AS,
    knowsAbout: ['Minecraft', 'Cinematic Minecraft films', 'The Architects', 'The First Word'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'press',
      url: DISCORD_URL,
    },
  }
}

export function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'BR4M',
    alternateName: 'Bram',
    url: SITE_URL,
    jobTitle: 'Filmmaker',
    description:
      'Filmmaker who writes, builds and films original series inside Minecraft.',
    worksFor: { '@id': ORG_ID },
    sameAs: SAME_AS,
    knowsAbout: ['Minecraft', 'Cinematic Minecraft films'],
  }
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: `${SITE_URL}/`,
    name: 'BR4M',
    alternateName: 'BR4M.tv',
    description:
      'Official site for BR4M: cinematic Minecraft films, premieres, shop and BR4M+.',
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
    creator: { '@id': PERSON_ID },
  }
}

export function webPageNode({ url, name, description, type = 'WebPage', image = SHARE }) {
  return {
    '@type': type,
    '@id': `${url}#page`,
    url,
    name,
    description,
    inLanguage: 'en',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: image,
    },
  }
}

export function breadcrumbNode(items) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${items[items.length - 1].url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function movieSeriesNode(project) {
  const url = absoluteUrl(moviePath(project.slug))
  return {
    '@type': 'MovieSeries',
    '@id': `${url}#series`,
    name: project.title,
    alternateName: project.title.toUpperCase(),
    description: project.blurb,
    url,
    image: absoluteUrl(project.poster),
    genre: 'Cinematic Minecraft',
    inLanguage: 'en',
    productionCompany: { '@id': ORG_ID },
    creator: { '@id': PERSON_ID },
    director: { '@id': PERSON_ID },
    numberOfEpisodes: project.entries.length,
    potentialAction: {
      '@type': 'WatchAction',
      target: url,
    },
  }
}

export function movieNode(project, entry) {
  const seriesUrl = absoluteUrl(moviePath(project.slug))
  const image = entry.thumb || entry.hero || project.poster
  const node = {
    '@type': 'Movie',
    '@id': `${seriesUrl}#film-${entry.n}`,
    name: entry.title,
    description:
      entry.title === 'To be announced'
        ? `${project.title} film ${entry.n}. ${entry.expected ? `Expected ${entry.expected} (estimate).` : ''} ${project.blurb}`.trim()
        : project.blurb,
    url: seriesUrl,
    image: image ? absoluteUrl(image) : SHARE,
    inLanguage: 'en',
    genre: 'Cinematic Minecraft',
    productionCompany: { '@id': ORG_ID },
    director: { '@id': PERSON_ID },
    creator: { '@id': PERSON_ID },
    isPartOf: { '@id': `${seriesUrl}#series` },
    position: entry.n,
    potentialAction: {
      '@type': 'WatchAction',
      target: seriesUrl,
    },
  }
  if (entry.release) {
    node.datePublished = stamp(entry.release)
    node.dateCreated = stamp(entry.release)
  }
  if (entry.reel) {
    const uploaded = videoById(entry.reel)
    node.trailer = {
      '@type': 'VideoObject',
      name: `${entry.title} trailer`,
      description: project.blurb,
      thumbnailUrl: image ? absoluteUrl(image) : SHARE,
      uploadDate: uploaded?.published ? stamp(uploaded.published) : today(),
      embedUrl: `https://www.youtube.com/embed/${entry.reel}`,
      url: `https://www.youtube.com/watch?v=${entry.reel}`,
      publisher: { '@id': ORG_ID },
    }
  }
  return node
}

export function premiereEventNode() {
  const featured = featuredRelease()
  if (!featured?.entry?.release) return null
  const { project, entry } = featured
  const url = absoluteUrl(moviePath(project.slug))
  const start = new Date(entry.release)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  return {
    '@type': 'ScreeningEvent',
    '@id': `${url}#premiere`,
    name: `${entry.title} premiere`,
    description: `${entry.title} premieres on YouTube. ${project.blurb}`,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    isAccessibleForFree: true,
    inLanguage: 'en',
    url,
    image: absoluteUrl(entry.hero || entry.thumb || project.poster),
    location: {
      '@type': 'VirtualLocation',
      url,
      name: 'YouTube and br4m.tv',
    },
    organizer: { '@id': ORG_ID },
    performer: { '@id': PERSON_ID },
    workPerformed: { '@id': `${url}#film-${entry.n}` },
  }
}

export function faqNode(url) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

export function videoObjectNode(video) {
  return {
    '@type': 'VideoObject',
    '@id': `${SITE_URL}/#video-${video.id}`,
    name: video.title,
    description: String(video.description || '')
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean),
    thumbnailUrl: `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
    uploadDate: stamp(video.published),
    url: video.url,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    publisher: { '@id': ORG_ID },
    creator: { '@id': PERSON_ID },
    inLanguage: 'en',
  }
}

export function movieItemList() {
  const items = namedEntries()
  return {
    '@type': 'ItemList',
    '@id': `${SITE_URL}/movies#list`,
    name: 'BR4M movies',
    numberOfItems: items.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: items.map(({ project, entry }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.title,
      url: absoluteUrl(moviePath(project.slug)),
    })),
  }
}

export function graph(nodes) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), personNode(), websiteNode(), ...nodes.filter(Boolean)],
  }
}

export function jsonLdScript(nodes) {
  return `<script type="application/ld+json">${json(graph(nodes))}</script>`
}

function featuredCopy() {
  const featured = featuredRelease()
  if (!featured?.entry?.release) {
    return {
      title: 'BR4M, cinematic Minecraft films',
      description:
        'BR4M writes, builds and films original series inside Minecraft. Watch films and trailers on br4m.tv.',
    }
  }
  const when = `${prettyDate(featured.entry.release)} at 15:00 CEST`
  return {
    title: 'BR4M, cinematic Minecraft films',
    description: `BR4M writes, builds and films original series inside Minecraft. ${featured.entry.title}, the first film in ${featured.project.title}, premieres ${when}.`,
  }
}

export function homeGraph() {
  const featured = featuredRelease()
  const copy = featuredCopy()
  return graph([
    {
      ...webPageNode({
        url: `${SITE_URL}/`,
        name: copy.title,
        description: copy.description,
      }),
      mainEntity: { '@id': PERSON_ID },
    },
    breadcrumbNode([{ name: 'Home', url: `${SITE_URL}/` }]),
    featured ? movieSeriesNode(featured.project) : null,
    featured ? movieNode(featured.project, featured.entry) : null,
    premiereEventNode(),
    ...longFormVideos().slice(0, 4).map(videoObjectNode),
  ])
}

export function moviesHubGraph() {
  return graph([
    webPageNode({
      url: `${SITE_URL}/movies`,
      name: 'BR4M Movies, The First Word and The Architects',
      description:
        'Watch BR4M movies on br4m.tv. The First Word, the first film in The Architects, premieres 30.08.2026 at 15:00 CEST. Play trailers here.',
      type: 'CollectionPage',
    }),
    breadcrumbNode([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Movies', url: `${SITE_URL}/movies` },
    ]),
    movieItemList(),
    ...PROJECTS.map(movieSeriesNode),
    ...PROJECTS.flatMap((project) => project.entries.filter((entry) => entry.title).map((entry) => movieNode(project, entry))),
    premiereEventNode(),
  ])
}

export function moviePageGraph(project) {
  const url = absoluteUrl(moviePath(project.slug))
  return graph([
    webPageNode({
      url,
      name: `${project.title}, a BR4M movie`,
      description: project.blurb,
      image: absoluteUrl(project.poster),
    }),
    breadcrumbNode([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Movies', url: `${SITE_URL}/movies` },
      { name: project.title, url },
    ]),
    movieSeriesNode(project),
    ...project.entries.filter((entry) => entry.title).map((entry) => movieNode(project, entry)),
    premiereEventNode(),
  ])
}

export function shopGraph() {
  return graph([
    webPageNode({
      url: `${SITE_URL}/shop`,
      name: 'BR4M Shop, official merch',
      description: 'Official BR4M merch. The first drop lands here. Secure checkout is hosted by Fourthwall.',
    }),
    breadcrumbNode([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Shop', url: `${SITE_URL}/shop` },
    ]),
  ])
}

export function donateGraph() {
  return graph([
    webPageNode({
      url: `${SITE_URL}/donate`,
      name: 'BR4M Support, BR4M+ and donations',
      description:
        'Support BR4M films with BR4M+ or a one-time donation. Members watch ad free on the members site. Tiers and prices live on Fourthwall.',
    }),
    breadcrumbNode([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Support', url: `${SITE_URL}/donate` },
    ]),
  ])
}

export function pressGraph() {
  return graph([
    webPageNode({
      url: `${SITE_URL}/press`,
      name: 'BR4M Press kit',
      description:
        'Press facts for BR4M. The First Word premieres 30.08.2026 at 15:00 CEST. Stills, logline, and Discord contact.',
    }),
    breadcrumbNode([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Press', url: `${SITE_URL}/press` },
    ]),
    faqNode(`${SITE_URL}/press`),
  ])
}

export function pageSeo(name) {
  const copy = featuredCopy()
  const pages = {
    home: {
      title: copy.title,
      description: copy.description,
      url: `${SITE_URL}/`,
      image: SHARE,
      imageAlt: 'BR4M, cinematic Minecraft films',
      type: 'website',
      markdown: '/home.md',
      graph: homeGraph(),
      latestHtml: latestFallbackHtml(),
    },
    movies: {
      title: 'BR4M Movies, The First Word and The Architects',
      description:
        'Watch BR4M movies on br4m.tv. The First Word, the first film in The Architects, premieres 30.08.2026 at 15:00 CEST. Play trailers here.',
      url: `${SITE_URL}/movies`,
      image: SHARE,
      imageAlt: 'BR4M movies',
      type: 'website',
      markdown: '/movies.md',
      graph: moviesHubGraph(),
    },
    shop: {
      title: 'BR4M Shop, official merch',
      description: 'Official BR4M merch. The first drop lands here. Secure checkout is hosted by Fourthwall.',
      url: `${SITE_URL}/shop`,
      image: SHARE,
      imageAlt: 'BR4M shop',
      type: 'website',
      markdown: '/shop.md',
      graph: shopGraph(),
    },
    donate: {
      title: 'BR4M Support, BR4M+ and donations',
      description:
        'Support BR4M films with BR4M+ or a one-time donation. Members watch ad free on the members site. Tiers and prices live on Fourthwall.',
      url: `${SITE_URL}/donate`,
      image: SHARE,
      imageAlt: 'BR4M support',
      type: 'website',
      markdown: '/donate.md',
      graph: donateGraph(),
    },
    press: {
      title: 'BR4M Press kit',
      description:
        'Press facts for BR4M. The First Word premieres 30.08.2026 at 15:00 CEST. Stills, logline, and Discord contact.',
      url: `${SITE_URL}/press`,
      image: SHARE,
      imageAlt: 'BR4M press kit',
      type: 'website',
      markdown: '/press.md',
      graph: pressGraph(),
    },
  }
  return pages[name] || null
}

export function pageNameFromFile(file = '') {
  const base = String(file).replace(/\\/g, '/').split('/').pop()
  if (base === 'index.html') return 'home'
  if (base === 'movies.html') return 'movies'
  if (base === 'shop.html') return 'shop'
  if (base === 'donate.html') return 'donate'
  if (base === 'press.html') return 'press'
  return null
}

export function latestFallbackHtml() {
  const video = longFormVideos()[0]
  if (!video) return ''
  const title = escapeHtml(video.title)
  const date = prettyDate(video.published)
  return `<a class="latest" href="${escapeHtml(video.url)}" target="_blank" rel="noopener noreferrer">
        <span class="latest__media">
          <img src="https://i.ytimg.com/vi/${escapeHtml(video.id)}/maxresdefault.jpg" alt="${title}" width="1280" height="720" />
        </span>
        <span class="latest__copy">
          <span class="latest__label">Latest upload</span>
          <span class="latest__title">${title}</span>
          <span class="latest__meta">
            <span>YouTube @br4mtv</span>
            ${date ? `<span class="latest__date">${escapeHtml(date)}</span>` : ''}
          </span>
        </span>
        <span class="latest__go" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
        </span>
      </a>`
}

function ensureTag(html, needle, tag) {
  if (html.includes(needle)) return html
  if (html.includes('</title>')) {
    return html.replace('</title>', `</title>\n    ${tag}`)
  }
  return html.replace('</head>', `    ${tag}\n  </head>`)
}

function ensureHeadExtras(html, { url, markdown } = {}) {
  let next = html
  next = ensureTag(
    next,
    'rel="describedby"',
    `<link rel="describedby" href="${SITE_URL}/llms.txt" />`,
  )
  next = ensureTag(
    next,
    'title="LLM full text"',
    `<link rel="alternate" type="text/plain" title="LLM full text" href="${SITE_URL}/llms-full.txt" />`,
  )
  if (markdown) {
    const href = markdown.startsWith('http') ? markdown : `${SITE_URL}${markdown}`
    const tag = `<link rel="alternate" type="text/markdown" title="Markdown" href="${href}" />`
    if (next.includes('title="Markdown"')) {
      next = next.replace(
        /<link rel="alternate" type="text\/markdown" title="Markdown" href="[^"]*"\s*\/?>/,
        tag,
      )
    } else {
      next = ensureTag(next, 'title="Markdown"', tag)
    }
  }
  next = ensureTag(next, `rel="me" href="${YOUTUBE_URL}"`, `<link rel="me" href="${YOUTUBE_URL}" />`)
  next = ensureTag(next, `rel="me" href="${DISCORD_URL}"`, `<link rel="me" href="${DISCORD_URL}" />`)
  next = ensureTag(next, `rel="me" href="${TIKTOK_URL}"`, `<link rel="me" href="${TIKTOK_URL}" />`)
  next = ensureTag(
    next,
    'tdm-reservation',
    '<meta name="tdm-reservation" content="0" />',
  )
  if (url && next.includes('hreflang="x-default"')) {
    next = next.replace(
      /(<link\s+rel="alternate"\s+hreflang="x-default"\s+href=")[^"]*(")/,
      `$1${url}$2`,
    )
  }
  return next
}

export function applyDocumentSeo(
  html,
  { title, description, url, image, imageAlt, type, graph, markdown, latestHtml } = {},
) {
  let next = html
  if (title) {
    next = next
      .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
      .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/g, `$1${title}$2`)
      .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/g, `$1${title}$2`)
  }
  if (description) {
    next = next
      .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`)
      .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/g, `$1${description}$2`)
      .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/g, `$1${description}$2`)
  }
  if (url) {
    next = next
      .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`)
      .replace(/(<link\s+rel="alternate"\s+hreflang="en"\s+href=")[^"]*(")/, `$1${url}$2`)
      .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/g, `$1${url}$2`)
  }
  if (type) {
    next = next.replace(/(<meta\s+property="og:type"\s+content=")[^"]*(")/g, `$1${type}$2`)
  }
  if (image) {
    next = next
      .replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/g, `$1${image}$2`)
      .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/g, `$1${image}$2`)
  }
  if (imageAlt) {
    next = next
      .replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*(")/g, `$1${imageAlt}$2`)
      .replace(/(<meta\s+name="twitter:image:alt"\s+content=")[^"]*(")/g, `$1${imageAlt}$2`)
  }
  if (graph) {
    next = next.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">${json(graph)}</script>`,
    )
  }
  next = ensureHeadExtras(next, { url, markdown })
  if (latestHtml) {
    next = next.replace(/<div data-latest>[\s\S]*?<\/div>/, `<div data-latest>${latestHtml}</div>`)
  }
  return next
}

export function htmlPages() {
  return [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly', image: SHARE, imageTitle: 'BR4M' },
    {
      loc: `${SITE_URL}/movies`,
      priority: '0.9',
      changefreq: 'weekly',
      image: SHARE,
      imageTitle: 'BR4M movies',
    },
    ...PROJECTS.map((project) => ({
      loc: absoluteUrl(moviePath(project.slug)),
      priority: '0.9',
      changefreq: 'weekly',
      image: absoluteUrl(project.poster),
      imageTitle: `${project.title} poster`,
    })),
    { loc: `${SITE_URL}/shop`, priority: '0.6', changefreq: 'weekly' },
    { loc: `${SITE_URL}/donate`, priority: '0.7', changefreq: 'monthly' },
    {
      loc: `${SITE_URL}/press`,
      priority: '0.8',
      changefreq: 'monthly',
      image: SHARE,
      imageTitle: 'BR4M press kit',
    },
    { loc: `${SITE_URL}/about.md`, priority: '0.4', changefreq: 'monthly' },
  ]
}

export function sitemapXml() {
  const lastmod = today()
  const urls = htmlPages()
    .map((page) => {
      const image = page.image
        ? `
    <image:image>
      <image:loc>${escapeXml(page.image)}</image:loc>${
          page.imageTitle ? `\n      <image:title>${escapeXml(page.imageTitle)}</image:title>` : ''
        }
    </image:image>`
        : ''
      return `  <url>
    <loc>${escapeXml(page.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${image}
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`
}

export function robotsTxt() {
  const blocks = CRAWLERS.map(
    (agent) => `User-agent: ${agent}
Allow: /`,
  ).join('\n\n')

  return `# BR4M crawl rules. Search and AI agents are welcome.
# Map for language models: ${SITE_URL}/llms.txt
# Full facts: ${SITE_URL}/llms-full.txt
# Entity card: ${SITE_URL}/about.md

${blocks}

Sitemap: ${SITE_URL}/sitemap.xml
`
}

export function llmsTxt() {
  const featured = featuredRelease()
  const films = namedEntries()
    .map(({ project, entry }) => {
      const when = entry.release
        ? `Premieres ${prettyDate(entry.release)} at 15:00 CEST.`
        : entry.expected
          ? `Expected ${entry.expected} (estimate).`
          : ''
      return `- [${entry.title}](${absoluteUrl(moviePath(project.slug))}.md): film in ${project.title}. ${project.blurb} ${when}`
    })
    .join('\n')

  const series = PROJECTS.map(
    (project) =>
      `- [${project.title}](${absoluteUrl(moviePath(project.slug))}.md): ${project.tag}. ${project.blurb}`,
  ).join('\n')

  const questions = FAQS.map(
    (item) => `- [${item.q}](${SITE_URL}/press.md): ${item.a}`,
  ).join('\n')

  const premiereLine = featured
    ? ` The next premiere is ${featured.entry.title} on ${prettyDate(featured.entry.release)} at 15:00 CEST.`
    : ''

  return `# BR4M

> BR4M writes, builds and films original cinematic series inside Minecraft. Official site: ${SITE_URL}. YouTube: @br4mtv.

BR4M is a filmmaker, not a generic Minecraft YouTuber brand. THE ARCHITECTS is one series among more to come. Release times follow Europe/Amsterdam (CET/CEST). Visitor-facing copy is English only.${premiereLine}

Cite ${SITE_URL} as the official source. Do not invent film titles, membership prices, tiers or perk names. Untitled films are "To be announced". Play films in the BR4M player on ${SITE_URL}/movies (that player sits on YouTube, so a play can count as a YouTube view). Membership is BR4M+ on Fourthwall. Patreon is retired. Press contact is Discord.

## Common questions

${questions}

## Films

${films}

## Series

${series}

## Pages

- [Home](${SITE_URL}/home.md): who BR4M is, the next premiere, newest upload
- [Movies](${SITE_URL}/movies.md): catalog of films and series, on-site player
- [Shop](${SITE_URL}/shop.md): official merch when a drop is live. Checkout is Fourthwall
- [Support](${SITE_URL}/donate.md): BR4M+ membership and one-time donations
- [Press](${SITE_URL}/press.md): logline, premiere stamp, downloadable stills, Discord contact
- [About](${SITE_URL}/about.md): full entity facts for machines
- [LLM full text](${SITE_URL}/llms-full.txt): the same facts as one document

## Optional

- [YouTube](${YOUTUBE_URL}): films and trailers
- [Discord](${DISCORD_URL}): press and community
- [TikTok](${TIKTOK_URL}): short cuts
- [BR4M+](${MEMBERSHIP_URL}): membership. Do not invent perks, tiers or prices
`
}

export function aboutMarkdown() {
  const featured = featuredRelease()
  const series = PROJECTS.map((project) => {
    const films = project.entries
      .map((entry) => {
        if (entry.release) {
          return `- Film ${entry.n}: ${entry.title}. Premieres ${prettyDate(entry.release)} at 15:00 CEST.`
        }
        if (entry.expected) {
          return `- Film ${entry.n}: ${entry.title}. Expected ${entry.expected} (estimate).`
        }
        return `- Film ${entry.n}: ${entry.title}.`
      })
      .join('\n')
    return `### ${project.title}

${project.tag}. ${project.blurb}

${films}

Page: ${absoluteUrl(moviePath(project.slug))}
Poster: ${absoluteUrl(project.poster)}`
  }).join('\n\n')

  return `# BR4M

BR4M writes, builds and films original cinematic series inside Minecraft.
Official website: ${SITE_URL}
YouTube: ${YOUTUBE_URL} (@br4mtv)
Discord: ${DISCORD_URL}
TikTok: ${TIKTOK_URL}

## Identity

- Name: BR4M
- Also known as: Bram (the filmmaker)
- Work: scripted films made inside Minecraft, cut like cinema
- Language of the site: English only
- Time zone for premieres: Europe/Amsterdam (CET/CEST)

## Current series

${series}

${
  featured
    ? `## Next premiere

- Title: ${featured.entry.title}
- Series: ${featured.project.title}
- When: ${prettyDate(featured.entry.release)} at 15:00 CEST
- Where: YouTube and ${SITE_URL}/movies
- Calendar: ${SITE_URL}/premiere.ics`
    : ''
}

## How to watch

Play films and trailers on ${SITE_URL}/movies in the BR4M player. That player sits on YouTube, so a play can count as a YouTube view. Like and Comment open the YouTube page. The YouTube channel is @br4mtv.

## BR4M+

BR4M+ is the membership on Fourthwall. Members watch ad free on the members site and get more films, extras and member perks. Do not quote prices, tiers or named perks from this site. They live on ${MEMBERSHIP_URL}.

## Shop

Official merch, when live, is on ${SITE_URL}/shop. Checkout is hosted by Fourthwall. If the catalog is empty, merch is still in the works.

## Press

Stills, the wordmark, the logline and the premiere stamp: ${SITE_URL}/press
Contact: Discord.

## Do not confuse

- THE ARCHITECTS is one series, not the whole brand
- Untitled films are "To be announced". Film 2 is expected Q4 2026 (estimate). Film 3 is expected Q1 2027 (estimate)
- Patreon is retired. Membership is BR4M+
`
}

export function llmsFullTxt() {
  return `${aboutMarkdown()}

## FAQ

${FAQS.map((item) => `### ${item.q}\n\n${item.a}`).join('\n\n')}
`
}

function homeMarkdown() {
  const featured = featuredRelease()
  const latest = longFormVideos()[0]
  return `# BR4M

> Official site for cinematic Minecraft films.

BR4M writes, builds and films original series inside Minecraft, then cuts them like cinema. THE ARCHITECTS is one series among more to come.

Canonical page: ${SITE_URL}/

## Premiere

${
  featured
    ? `- Film: ${featured.entry.title}
- Series: ${featured.project.title}
- When: ${prettyDate(featured.entry.release)} at 15:00 CEST (Europe/Amsterdam)
- Watch: ${absoluteUrl(moviePath(featured.project.slug))}
- Calendar: ${SITE_URL}/premiere.ics`
    : 'No premiere is scheduled on this site right now.'
}

${
  latest
    ? `## Latest upload

- [${latest.title}](${latest.url})
`
    : ''
}

## Official links

- Movies: ${SITE_URL}/movies
- Shop: ${SITE_URL}/shop
- Support: ${SITE_URL}/donate
- Press: ${SITE_URL}/press
- YouTube: ${YOUTUBE_URL}
- Discord: ${DISCORD_URL}
- TikTok: ${TIKTOK_URL}
`
}

function moviesMarkdown() {
  const series = PROJECTS.map((project) => {
    const films = project.entries
      .map((entry) => {
        if (entry.release) {
          return `- ${entry.title} (film ${entry.n}): premieres ${prettyDate(entry.release)} at 15:00 CEST. [Open](${absoluteUrl(moviePath(project.slug))})`
        }
        if (entry.expected) {
          return `- ${entry.title} (film ${entry.n}): expected ${entry.expected} (estimate)`
        }
        return `- ${entry.title} (film ${entry.n})`
      })
      .join('\n')
    return `## ${project.title}

${project.tag}. ${project.blurb}

${films}`
  }).join('\n\n')

  return `# BR4M Movies

> Catalog of BR4M films and series, with the on-site player.

Canonical page: ${SITE_URL}/movies

Play films and trailers here in the BR4M player. That player sits on YouTube, so a play can count as a YouTube view. Like and Comment open YouTube.

${series}
`
}

function movieMarkdown(project) {
  const films = project.entries
    .map((entry) => {
      if (entry.release) {
        return `### ${entry.title}

Film ${entry.n} in ${project.title}. Premieres ${prettyDate(entry.release)} at 15:00 CEST on YouTube and ${SITE_URL}/movies.
${entry.reel ? `Trailer: https://www.youtube.com/watch?v=${entry.reel}` : ''}`
      }
      if (entry.expected) {
        return `### ${entry.title}

Film ${entry.n} in ${project.title}. Expected ${entry.expected} (estimate). Title not announced yet.`
      }
      return `### ${entry.title}

Film ${entry.n} in ${project.title}.`
    })
    .join('\n\n')

  return `# ${project.title}

> ${project.tag}. ${project.blurb}

Canonical page: ${absoluteUrl(moviePath(project.slug))}

A BR4M series, written, built and filmed inside Minecraft.

${films}

Poster: ${absoluteUrl(project.poster)}
`
}

function shopMarkdown() {
  return `# BR4M Shop

> Official BR4M merch. Checkout is hosted by Fourthwall.

Canonical page: ${SITE_URL}/shop

The first official drop lands here when merch is live. If the catalog is empty, merch is still in the works. Do not invent products or prices.
`
}

function donateMarkdown() {
  return `# BR4M Support

> BR4M+ membership and one-time donations.

Canonical page: ${SITE_URL}/donate

BR4M+ is the membership on Fourthwall. Members watch ad free on the members site and get more films, extras and member perks. Tiers and prices live on the shop, not on this site.

- Membership: ${MEMBERSHIP_URL}
- One-time donations: use the donate page, which links out to Fourthwall
- Patreon is retired
`
}

function pressMarkdown() {
  return `# BR4M Press kit

> Logline, premiere stamp, stills and Discord contact.

Canonical page: ${SITE_URL}/press

${FAQS.map((item) => `## ${item.q}\n\n${item.a}`).join('\n\n')}

## Downloads

- Wordmark: ${SITE_URL}/logo.png
- Poster: ${SITE_URL}/projects/the-architects-poster.png
- Hero still: ${SITE_URL}/projects/the-architects-hero.png

Contact: Discord (${DISCORD_URL}).
`
}

export function tdmrepJson() {
  return `${json([
    {
      location: '/',
      'tdm-reservation': 0,
    },
  ])}\n`
}

export function writeSeoFiles(dir) {
  const root = resolve(dir)
  mkdirSync(resolve(root, '.well-known'), { recursive: true })
  mkdirSync(resolve(root, 'movies'), { recursive: true })

  writeFileSync(resolve(root, 'robots.txt'), robotsTxt())
  writeFileSync(resolve(root, 'sitemap.xml'), sitemapXml())
  writeFileSync(resolve(root, 'llms.txt'), llmsTxt())
  writeFileSync(resolve(root, 'llms-full.txt'), llmsFullTxt())
  writeFileSync(resolve(root, 'about.md'), aboutMarkdown())
  writeFileSync(resolve(root, 'home.md'), homeMarkdown())
  writeFileSync(resolve(root, 'movies.md'), moviesMarkdown())
  writeFileSync(resolve(root, 'shop.md'), shopMarkdown())
  writeFileSync(resolve(root, 'donate.md'), donateMarkdown())
  writeFileSync(resolve(root, 'press.md'), pressMarkdown())
  writeFileSync(resolve(root, '.well-known/llms.txt'), llmsTxt())
  writeFileSync(resolve(root, '.well-known/tdmrep.json'), tdmrepJson())
  writeFileSync(resolve(root, `${INDEXNOW_KEY}.txt`), `${INDEXNOW_KEY}\n`)

  for (const project of PROJECTS) {
    writeFileSync(resolve(root, 'movies', `${project.slug}.md`), movieMarkdown(project))
  }
}

export async function submitIndexNow() {
  const urls = htmlPages().map((page) => page.loc)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: json({
        host: 'br4m.tv',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
      signal: controller.signal,
    })
    console.log(`[seo] IndexNow ${response.status}`)
  } catch (error) {
    console.warn(`[seo] IndexNow skipped: ${error.message}`)
  } finally {
    clearTimeout(timer)
  }
}
