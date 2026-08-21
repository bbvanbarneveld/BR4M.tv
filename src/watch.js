import videos from './data/videos.json'
import { fetchLatestVideos, withoutShorts, YOUTUBE_URL } from './youtube-feed.js'
import { ICONS, bindDialog, escapeHtml, openDialog } from './ui.js'
import { applyReveals, refresh } from './motion.js'

const CACHE_KEY = 'br4m.tv:videos'

function thumb(id, big = true) {
  return `https://i.ytimg.com/vi/${id}/${big ? 'maxresdefault' : 'hqdefault'}.jpg`
}

function bindFallback(img, id) {
  img.addEventListener('error', () => {
    if (img.dataset.fallback === '1') return
    img.dataset.fallback = '1'
    img.src = thumb(id, false)
  })
}

function splitTitle(title) {
  const parts = String(title)
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
  return {
    series: parts[0] || String(title),
    beat: (parts.slice(1).join(', ') || '').replace(/\s*\(.*?\)\s*/g, ' ').trim(),
  }
}

function stamp(published) {
  const date = new Date(published)
  if (Number.isNaN(date.valueOf())) return ''
  const pad = (value) => String(value).padStart(2, '0')
  return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`
}

function readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || '')
    const list = withoutShorts(raw?.videos)
    return list.length ? list : null
  } catch {
    return null
  }
}

function writeCache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), videos: list }))
  } catch {
    // private mode / quota
  }
}

export function latestVideos() {
  return withoutShorts(readCache() || videos)
}

function embed(id, title) {
  return `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0"
    title="${escapeHtml(title)}"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen></iframe>`
}

/* ── Player dialog ───────────────────────────────────────── */

export function openPlayer(video) {
  const dialog = document.querySelector('[data-player]')
  const frame = dialog?.querySelector('[data-player-frame]')
  const title = dialog?.querySelector('[data-player-title]')
  if (!dialog || !frame) return

  bindDialog(dialog, {
    onClose: () => {
      frame.innerHTML = ''
    },
  })
  if (title) title.textContent = video.title
  frame.innerHTML = embed(video.id, video.title)
  openDialog(dialog)
}

/* ── Compact latest-upload row (homepage) ────────────────── */

export function mountLatest(list = latestVideos()) {
  const host = document.querySelector('[data-latest]')
  if (!host) return

  const video = list[0]
  if (!video) {
    host.innerHTML = `<p class="empty" data-reveal>Nothing loaded. Watch the channel on <a href="${YOUTUBE_URL}" target="_blank" rel="noopener noreferrer">YouTube</a>.</p>`
    applyReveals(host)
    refresh()
    return
  }

  const { series } = splitTitle(video.title)
  host.innerHTML = `
    <button class="latest" type="button" data-hint="Play" data-reveal aria-label="Play ${escapeHtml(video.title)}">
      <span class="latest__media">
        <img src="${thumb(video.id)}" alt="${escapeHtml(video.title)}" width="1280" height="720" loading="lazy" />
      </span>
      <span class="latest__copy">
        <span class="latest__label">Latest upload</span>
        <span class="latest__title">${escapeHtml(video.title)}</span>
        <span class="latest__meta">
          <span>${escapeHtml(series)}</span>
          ${stamp(video.published) ? `<span class="latest__date">${escapeHtml(stamp(video.published))}</span>` : ''}
        </span>
      </span>
      <span class="latest__go">${ICONS.play}</span>
    </button>
  `

  bindFallback(host.querySelector('img'), video.id)
  host.querySelector('.latest').addEventListener('click', () => openPlayer(video))
  applyReveals(host)
  refresh()
}

/** Film stills used as page imagery (series banner). */
export function mountStills(list = latestVideos()) {
  document.querySelectorAll('[data-still]').forEach((img, index) => {
    const video = list[Math.min(index + 1, list.length - 1)] || list[0]
    if (!video) return
    img.src = thumb(video.id)
    bindFallback(img, video.id)
  })
}

export async function hydrateVideos(onUpdate) {
  const live = await fetchLatestVideos(8)
  if (!live?.length) return false
  writeCache(live)
  onUpdate?.(live)
  return true
}
