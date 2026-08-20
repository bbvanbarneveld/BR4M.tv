export const CHANNEL_ID = 'UC0wCmTinU6_ij3zgk5gTwfg'
export const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
export const YOUTUBE_URL = 'https://www.youtube.com/@br4mtv'
export const DISCORD_URL = 'https://discord.gg/Unb7Y2GxNT'
export const TIKTOK_URL = 'https://www.tiktok.com/@br4m.tv'
export const MEMBERSHIP_URL = 'https://br4m-shop.fourthwall.com/pages/memberships'
export const DONATIONS_URL = 'https://br4m-shop.fourthwall.com/pages/donations'
export const MEMBERS_FEED_URL = 'https://br4m-shop.fourthwall.com/supporters'

export const VANITY_REDIRECTS = {
  '/youtube': YOUTUBE_URL,
  '/youtube/': YOUTUBE_URL,
  '/discord': DISCORD_URL,
  '/discord/': DISCORD_URL,
  '/tiktok': TIKTOK_URL,
  '/tiktok/': TIKTOK_URL,
  '/doneer': '/donate',
  '/doneer/': '/donate',
  '/doneer.html': '/donate',
  '/watch': '/movies',
  '/watch/': '/movies',
  '/projects': '/movies',
  '/projects/': '/movies',
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))
  return m ? m[1].trim() : ''
}

export function isShort(video) {
  return Boolean(video?.short) || /\/shorts\//i.test(video?.url || '')
}

export function parseYouTubeRss(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
    const block = m[1]
    const id = tag(block, 'yt:videoId')
    const link =
      block.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ||
      `https://www.youtube.com/watch?v=${id}`
    return {
      id,
      title: tag(block, 'title'),
      url: link,
      published: tag(block, 'published'),
      description: tag(block, 'media:description'),
      short: /\/shorts\//.test(link),
    }
  })
}

function fromRss2Json(json) {
  if (!json?.items?.length) return []
  return json.items.map((item) => {
    const url = item.link || item.guid || ''
    const id = url.match(/[?&]v=([^&]+)/)?.[1] || url.match(/youtu\.be\/([^?]+)/)?.[1] || ''
    return {
      id,
      title: item.title || '',
      url: url.includes('/watch') || url.includes('/shorts/') ? url : `https://www.youtube.com/watch?v=${id}`,
      published: item.pubDate || item.published || '',
      description: item.description || '',
      short: /\/shorts\//.test(url),
    }
  })
}

async function fetchText(url, ms = 4500) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/rss+xml, application/json, text/xml, */*' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.text()
  } finally {
    clearTimeout(timer)
  }
}

export function withoutShorts(videos, limit = 8) {
  return (videos || []).filter((video) => video.id && !isShort(video)).slice(0, limit)
}

export async function fetchLatestVideos(limit = 8) {
  const inBrowser = typeof window !== 'undefined'
  const attempts = [
    async () =>
      parseYouTubeRss(
        await fetchText(`https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`),
      ),
    async () =>
      fromRss2Json(
        JSON.parse(
          await fetchText(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`,
          ),
        ),
      ),
  ]
  if (!inBrowser) {
    attempts.unshift(async () => parseYouTubeRss(await fetchText(RSS_URL)))
  }

  for (const attempt of attempts) {
    try {
      const parsed = withoutShorts(await attempt(), limit)
      if (parsed.length) return parsed
    } catch {
      // try the next source
    }
  }
  return null
}
