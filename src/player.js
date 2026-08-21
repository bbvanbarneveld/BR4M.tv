import { loadYouTubeApi } from './reel.js'
import { parkCursor } from './cursor.js'
import { bindDialog, closeDialog, ICONS, openDialog } from './ui.js'
import { reducedMotion, setPageScrollLocked } from './motion.js'

/**
 * On-site player: BR4M chrome over a YouTube iframe on youtube.com.
 * Plays count as YouTube views because the official host is used and the
 * visitor starts playback with sound from a click. Like and Comment open
 * the same video on YouTube. YouTube's own bar never shows.
 *
 * Ads play inside the iframe. While an ad is up, BR4M overlays get out of
 * the way so Skip and visit-advertiser clicks reach YouTube.
 */

let bound = false
let yt = null
let tick = 0
let hideChrome = 0
let playing = false
let muted = false
let duration = 0
let contentDuration = 0
let lastContentTime = 0
let advertising = false
let overChrome = false
let onCloseExtra = null
let videoId = ''
let fitFrame = null

function $(sel, root = document) {
  return root.querySelector(sel)
}

function clock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const rest = `${String(minutes).padStart(hours ? 2 : 1, '0')}:${String(secs).padStart(2, '0')}`
  return hours ? `${hours}:${rest}` : rest
}

function watchUrl(id, hash = '') {
  if (!id) return ''
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}${hash}`
}

function fsNode() {
  return document.fullscreenElement || document.webkitFullscreenElement || null
}

function fsTarget(root) {
  return $('[data-stage-shell]', root) || root
}

function inFullscreen(root) {
  if (!root) return false
  const active = fsNode()
  if (root.classList.contains('is-full')) return true
  if (!active) return false
  return active === root || active === fsTarget(root) || root.contains(active)
}

function paintPlay(root, isPlaying) {
  const toggle = $('[data-stage-toggle]', root)
  const big = $('[data-stage-big]', root)
  if (toggle) {
    toggle.innerHTML = isPlaying ? ICONS.pause : ICONS.play
    toggle.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play')
  }
  if (big) big.hidden = advertising || isPlaying
}

function paintMute(root, isMuted) {
  const button = $('[data-stage-mute]', root)
  if (!button) return
  button.innerHTML = isMuted ? ICONS.soundOff : ICONS.soundOn
  button.setAttribute('aria-label', isMuted ? 'Turn sound on' : 'Turn sound off')
}

function paintFullscreen(root) {
  const on = inFullscreen(root)
  const label = on ? 'Exit full screen' : 'Full screen'
  const icon = on ? ICONS.fullExit : ICONS.fullEnter
  root.querySelectorAll('[data-stage-full], [data-stage-full-dock]').forEach((button) => {
    button.innerHTML = icon
    button.setAttribute('aria-label', label)
  })
  root.classList.toggle('is-fs', on)
}

function paintTime(root, current, total) {
  const now = $('[data-stage-now]', root)
  const end = $('[data-stage-end]', root)
  const fill = $('[data-stage-fill]', root)
  const bar = $('[data-stage-scrub]', root)
  if (now) now.textContent = clock(current)
  if (end) end.textContent = clock(total)
  const ratio = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0
  if (fill) fill.style.transform = `scaleX(${ratio})`
  if (bar) bar.setAttribute('aria-valuenow', String(Math.floor(current)))
}

function paintOut(root, id) {
  const like = $('[data-stage-like]', root)
  const comment = $('[data-stage-comment]', root)
  const href = watchUrl(id)
  const comments = watchUrl(id, '#comments')
  ;[like, comment].forEach((link) => {
    if (!link) return
    link.hidden = !id
    if (id) link.rel = 'noopener noreferrer'
  })
  if (like) like.href = href
  if (comment) comment.href = comments
}

function showChrome(root, sticky = false) {
  if (advertising) {
    root.classList.remove('is-chrome')
    clearTimeout(hideChrome)
    return
  }
  root.classList.add('is-chrome')
  clearTimeout(hideChrome)
  if (sticky || overChrome || reducedMotion() || !playing) return
  hideChrome = window.setTimeout(() => root.classList.remove('is-chrome'), 2600)
}

function readAdPlaying() {
  if (!yt) return false
  try {
    const data = yt.getVideoData?.() || {}
    if (videoId && data.video_id && data.video_id !== videoId) return true
    const live = Number(yt.getDuration?.()) || 0
    // Preroll/midroll: the player briefly reports a short clip after we
    // already know the real runtime.
    if (contentDuration >= 60 && live > 0 && live <= 45 && live < contentDuration * 0.45) {
      return true
    }
  } catch {
    return false
  }
  return false
}

function setAdvertising(root, next) {
  const was = advertising
  advertising = Boolean(next)
  root.classList.toggle('is-ad', advertising)
  const notice = $('[data-stage-ad]', root)
  if (notice) notice.hidden = !advertising
  if (advertising) {
    root.classList.remove('is-chrome')
    clearTimeout(hideChrome)
    const big = $('[data-stage-big]', root)
    if (big) big.hidden = true
  } else if (was) {
    showChrome(root, !playing)
    paintPlay(root, playing)
  }
}

function syncPlayback(root) {
  if (!yt) return
  const ad = readAdPlaying()
  setAdvertising(root, ad)
  let live = 0
  let at = 0
  try {
    live = Number(yt.getDuration?.()) || 0
    at = Number(yt.getCurrentTime?.()) || 0
  } catch {
    return
  }
  if (ad) return
  if (live > contentDuration) contentDuration = live
  if (live > duration) duration = live
  if (at >= 0) lastContentTime = at
  paintTime(root, lastContentTime, contentDuration || duration)
  const bar = $('[data-stage-scrub]', root)
  if (bar && (contentDuration || duration)) {
    bar.setAttribute('aria-valuemax', String(Math.floor(contentDuration || duration)))
  }
}

function fitScreen(root) {
  const screen = $('[data-stage-screen]', root)
  if (!screen || !root.open) return
  const host = inFullscreen(root) ? fsNode() || fsTarget(root) : root
  const styles = getComputedStyle(root)
  const padX =
    (Number.parseFloat(styles.paddingLeft) || 0) + (Number.parseFloat(styles.paddingRight) || 0)
  const padY =
    (Number.parseFloat(styles.paddingTop) || 0) + (Number.parseFloat(styles.paddingBottom) || 0)
  const view = window.visualViewport
  const maxW = Math.max(200, (host.clientWidth || view?.width || window.innerWidth) - padX)
  const maxH = Math.max(200, (host.clientHeight || view?.height || window.innerHeight) - padY)
  let width = maxW
  let height = (width * 9) / 16
  if (height > maxH) {
    height = maxH
    width = (height * 16) / 9
  }
  screen.style.width = `${Math.round(width * 100) / 100}px`
  screen.style.height = `${Math.round(height * 100) / 100}px`
  if (yt?.setSize) {
    const mount = $('[data-stage-mount]', root)
    try {
      yt.setSize(mount?.clientWidth || width, mount?.clientHeight || height)
    } catch {
      // YouTube throws if the iframe is mid-ad teardown.
    }
  }
}

async function exitFullscreen(root) {
  root?.classList.remove('is-full')
  const active = fsNode()
  if (!active) {
    if (root) paintFullscreen(root)
    return
  }
  try {
    if (document.exitFullscreen) await document.exitFullscreen()
    else document.webkitExitFullscreen?.()
  } catch {
    // Already left, or the UA blocked the exit.
  }
  if (root) paintFullscreen(root)
  parkCursor()
}

async function enterFullscreen(root) {
  if (!root) return
  const candidates = [fsTarget(root), root].filter(Boolean)
  for (const el of candidates) {
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: 'hide' })
        return
      }
      if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
        return
      }
    } catch {
      // Modal dialogs can reject; try the next node.
    }
  }
  root.classList.add('is-full')
  parkCursor()
}

async function toggleFullscreen(root) {
  if (inFullscreen(root)) await exitFullscreen(root)
  else await enterFullscreen(root)
  paintFullscreen(root)
  fitScreen(root)
  parkCursor()
}

function destroyPlayer() {
  clearInterval(tick)
  clearTimeout(hideChrome)
  tick = 0
  try {
    yt?.destroy?.()
  } catch {
    // YouTube can throw if the iframe is already gone.
  }
  yt = null
  playing = false
  duration = 0
  contentDuration = 0
  lastContentTime = 0
  advertising = false
  videoId = ''
}

function seekFromEvent(event, root) {
  const bar = $('[data-stage-scrub]', root)
  if (!bar || !yt?.seekTo || advertising) return
  const total = contentDuration || duration
  if (!total) return
  const rect = bar.getBoundingClientRect()
  const x = 'clientX' in event ? event.clientX : event.touches?.[0]?.clientX
  if (x == null) return
  const ratio = Math.min(1, Math.max(0, (x - rect.left) / rect.width))
  try {
    yt.seekTo(total * ratio, true)
  } catch {
    return
  }
  lastContentTime = total * ratio
  paintTime(root, lastContentTime, total)
}

function posterFor(id) {
  return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/maxresdefault.jpg`
}

function armIframe(player) {
  try {
    const iframe = player.getIframe?.()
    if (!iframe) return
    iframe.setAttribute('allowfullscreen', '')
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share',
    )
  } catch {
    // Cross-origin timing: the iframe exists after onReady anyway.
  }
}

async function loadVideo(root, { id, title, start = 0, sound = true }) {
  destroyPlayer()
  const mount = $('[data-stage-mount]', root)
  const label = $('[data-stage-title]', root)
  const poster = $('[data-stage-poster]', root)
  if (!mount || !id) return
  videoId = id
  mount.replaceChildren()
  root.classList.remove('is-on', 'is-ad')
  setAdvertising(root, false)
  if (label) label.textContent = title || ''
  if (poster) {
    poster.hidden = false
    poster.src = posterFor(id)
  }
  paintTime(root, 0, 0)
  paintPlay(root, false)
  paintOut(root, id)
  muted = !sound
  paintMute(root, muted)
  paintFullscreen(root)
  fitScreen(root)

  await loadYouTubeApi()
  if (videoId !== id) return
  const holder = document.createElement('div')
  mount.append(holder)

  yt = new window.YT.Player(holder, {
    host: 'https://www.youtube.com',
    videoId: id,
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      mute: sound ? 0 : 1,
      controls: 0,
      rel: 0,
      playsinline: 1,
      modestbranding: 1,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      cc_load_policy: 0,
      start,
      enablejsapi: 1,
      origin: window.location.origin,
      widget_referrer: window.location.href,
    },
    events: {
      onReady: (event) => {
        armIframe(event.target)
        duration = event.target.getDuration?.() || 0
        if (duration > contentDuration) contentDuration = duration
        fitScreen(root)
        try {
          if (sound) event.target.unMute()
          else event.target.mute()
          event.target.playVideo()
        } catch {
          // Ads can reject an early unMute; the next user gesture still works.
        }
        paintTime(root, start, contentDuration || duration)
        const bar = $('[data-stage-scrub]', root)
        if (bar) {
          bar.setAttribute('aria-valuemin', '0')
          bar.setAttribute('aria-valuemax', String(Math.floor(contentDuration || duration)))
        }
        clearInterval(tick)
        tick = window.setInterval(() => syncPlayback(root), 250)
        syncPlayback(root)
      },
      onStateChange: (event) => {
        const state = event.data
        syncPlayback(root)

        if (state === window.YT.PlayerState.BUFFERING || state === window.YT.PlayerState.UNSTARTED) {
          return
        }

        if (advertising) {
          playing = state === window.YT.PlayerState.PLAYING
          root.classList.toggle('is-on', playing || root.classList.contains('is-on'))
          const big = $('[data-stage-big]', root)
          if (big) big.hidden = true
          return
        }

        if (state === window.YT.PlayerState.ENDED) {
          const at = Number(yt?.getCurrentTime?.()) || 0
          const total = contentDuration || duration
          // Ad end often reports ENDED with the playhead still at the start.
          if (total > 1 && at < Math.max(1, total - 1.25)) {
            try {
              yt.playVideo()
            } catch {
              /* ignore */
            }
            return
          }
          playing = false
          paintPlay(root, false)
          paintTime(root, total, total)
          showChrome(root, true)
          return
        }

        playing = state === window.YT.PlayerState.PLAYING
        paintPlay(root, playing)
        showChrome(root, !playing)
        if (playing) root.classList.add('is-on')
      },
      onError: () => {
        if (advertising) return
        playing = false
        paintPlay(root, false)
        showChrome(root, true)
      },
    },
  })
}

function bindStage(root) {
  if (bound) return
  bound = true

  const closer = $('[data-close]', root)
  if (closer) closer.innerHTML = ICONS.close
  const big = $('[data-stage-big]', root)
  if (big) big.innerHTML = `<span class="stage__big-disc">${ICONS.play}</span>`
  const like = $('[data-stage-like]', root)
  const comment = $('[data-stage-comment]', root)
  if (like) like.innerHTML = `${ICONS.like}<span>Like</span>`
  if (comment) comment.innerHTML = `${ICONS.comment}<span>Comment</span>`
  paintPlay(root, false)
  paintMute(root, false)
  paintFullscreen(root)

  bindDialog(root, {
    onClose: () => {
      exitFullscreen(root)
      destroyPlayer()
      $('[data-stage-mount]', root)?.replaceChildren()
      const poster = $('[data-stage-poster]', root)
      if (poster) {
        poster.removeAttribute('src')
        poster.hidden = true
      }
      root.classList.remove('is-on', 'is-chrome', 'is-ad', 'is-fs', 'is-full')
      onCloseExtra?.()
    },
  })

  fitFrame = () => {
    fitScreen(root)
    paintFullscreen(root)
    parkCursor()
  }
  new ResizeObserver(fitFrame).observe(root)
  window.addEventListener('resize', fitFrame)
  window.addEventListener('orientationchange', fitFrame)
  window.visualViewport?.addEventListener('resize', fitFrame)
  document.addEventListener('fullscreenchange', fitFrame)
  document.addEventListener('webkitfullscreenchange', fitFrame)

  $('[data-stage-toggle]', root)?.addEventListener('click', (event) => {
    event.stopPropagation()
    if (!yt || advertising) return
    try {
      if (playing) yt.pauseVideo()
      else yt.playVideo()
    } catch {
      /* ignore */
    }
  })

  $('[data-stage-big]', root)?.addEventListener('click', (event) => {
    event.stopPropagation()
    if (advertising) return
    try {
      yt?.playVideo?.()
    } catch {
      /* ignore */
    }
  })

  $('[data-stage-mute]', root)?.addEventListener('click', (event) => {
    event.stopPropagation()
    if (!yt) return
    muted = !muted
    try {
      if (muted) yt.mute()
      else yt.unMute()
    } catch {
      muted = !muted
      return
    }
    paintMute(root, muted)
  })

  const onFull = (event) => {
    event.stopPropagation()
    toggleFullscreen(root)
  }
  $('[data-stage-full]', root)?.addEventListener('click', onFull)
  $('[data-stage-full-dock]', root)?.addEventListener('click', onFull)

  $('[data-stage-hit]', root)?.addEventListener('click', () => {
    if (!yt || advertising) return
    if (!root.classList.contains('is-chrome')) {
      showChrome(root)
      return
    }
    try {
      if (playing) yt.pauseVideo()
      else yt.playVideo()
    } catch {
      /* ignore */
    }
  })

  const keepChrome = (on) => {
    overChrome = on
    if (on) showChrome(root, true)
  }
  $('[data-stage-dock]', root)?.addEventListener('pointerenter', () => keepChrome(true))
  $('[data-stage-dock]', root)?.addEventListener('pointerleave', () => keepChrome(false))
  closer?.addEventListener('pointerenter', () => keepChrome(true))
  closer?.addEventListener('pointerleave', () => keepChrome(false))

  const bar = $('[data-stage-scrub]', root)
  bar?.addEventListener('pointerdown', (event) => {
    if (advertising) return
    event.preventDefault()
    event.stopPropagation()
    seekFromEvent(event, root)
    const move = (next) => seekFromEvent(next, root)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  })

  root.addEventListener('mousemove', () => showChrome(root))
  root.addEventListener('touchstart', () => showChrome(root), { passive: true })
  root.addEventListener('keydown', (event) => {
    if (!root.open) return
    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault()
      toggleFullscreen(root)
      return
    }
    if (!yt) return
    if (event.key === ' ' || event.key === 'k' || event.key === 'K') {
      event.preventDefault()
      if (advertising) return
      try {
        if (playing) yt.pauseVideo()
        else yt.playVideo()
      } catch {
        /* ignore */
      }
    }
    if (event.key === 'm' || event.key === 'M') {
      muted = !muted
      try {
        if (muted) yt.mute()
        else yt.unMute()
      } catch {
        muted = !muted
        return
      }
      paintMute(root, muted)
    }
    if (advertising) return
    const total = contentDuration || duration
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      try {
        yt.seekTo(Math.min(total, (yt.getCurrentTime?.() || 0) + 5), true)
      } catch {
        /* ignore */
      }
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      try {
        yt.seekTo(Math.max(0, (yt.getCurrentTime?.() || 0) - 5), true)
      } catch {
        /* ignore */
      }
    }
  })
}

/** Prefetch the IFrame API so a play click still counts as a user gesture. */
export function warmPlayer() {
  loadYouTubeApi()
}

export function openStage({ id, title, start = 0, sound = true, onClose } = {}) {
  const root = document.querySelector('[data-stage]')
  if (!root || !id) return
  onCloseExtra = onClose || null
  bindStage(root)
  openDialog(root)
  setPageScrollLocked(true)
  overChrome = false
  showChrome(root, true)
  fitScreen(root)
  loadVideo(root, { id, title, start, sound })
  root.focus()
}

export function closeStage() {
  const root = document.querySelector('[data-stage]')
  exitFullscreen(root)
  closeDialog(root)
}
