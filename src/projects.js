import gsap from 'gsap'
import { PROJECTS, featuredRelease, projectBySlug } from './data/projects.js'
import { moviePath, movieSlugFromLocation } from './site.js'
import { mountCountdown, phaseOf, releaseStamp } from './countdown.js'
import { calendarActionHtml, releaseActionHtml, releaseNote } from './release.js'
import { bindCalendarDownload } from './calendar.js'
import { hasMediaConsent, onConsent } from './consent.js'
import { mountReel } from './reel.js'
import { openStage, warmPlayer } from './player.js'
import { MEMBERSHIP_URL, youtubeIdFrom } from './youtube-feed.js'
import { latestVideos } from './watch.js'
import { ICONS, escapeHtml } from './ui.js'
import { applyReveals, initMagnetic, reducedMotion, refresh, resetScroll } from './motion.js'

let stoppers = []
let activeReel = null

function stopTimers() {
  stoppers.forEach((stop) => stop())
  stoppers = []
}

function currentSlug() {
  return movieSlugFromLocation(window.location.pathname, window.location.hash)
}

function adoptHashRoute() {
  if (window.location.pathname.replace(/\/+$/, '') !== '/movies') return
  const hash = window.location.hash.replace(/^#/, '')
  if (hash && projectBySlug(hash)) {
    history.replaceState(null, '', moviePath(hash))
  }
}

function videoId(value) {
  return youtubeIdFrom(value)
}

function trailerOf(entry) {
  return videoId(entry?.reel) || videoId(entry?.url)
}

function watchId(entry) {
  const phase = entry?.release ? phaseOf(entry.release) : ''
  if ((phase === 'live' || phase === 'soon') && entry.url) return videoId(entry.url)
  return ''
}

function entryName(entry) {
  return entry.title || 'To be announced'
}

function entryStamp(entry) {
  if (entry.release) {
    const phase = phaseOf(entry.release)
    if (phase === 'live') return entry.url ? 'Out now' : 'Watch link not posted yet'
    return `Premieres ${releaseStamp(entry.release)}`
  }
  if (entry.expected) return `Expected ${entry.expected}`
  return 'Date not set'
}

function playPayload(entry, extraTitle = '') {
  const watch = watchId(entry)
  const trailer = trailerOf(entry)
  const id = watch || trailer
  if (!id) return null
  return {
    id,
    title: extraTitle || entryName(entry),
    start: watch ? 0 : entry.reelStart || 0,
    sound: true,
  }
}

function openPlay(payload) {
  if (!payload) return
  activeReel?.pause()
  openStage({
    ...payload,
    onClose: () => activeReel?.play(),
  })
}

/* ── Billboard ───────────────────────────────────────────── */

function renderFeature() {
  const host = document.querySelector('[data-feature]')
  const featured = featuredRelease()
  if (!host || !featured) return

  const { project, entry } = featured
  const live = phaseOf(entry.release) === 'live'
  const year = new Date(entry.release).getUTCFullYear()
  const trailer = trailerOf(entry)

  host.innerHTML = `
    <div class="feature__media" aria-hidden="true">
      <img src="${escapeHtml(entry.hero || entry.thumb)}" alt="" width="1280" height="720" />
    </div>
    <div class="feature__reel" data-reel aria-hidden="true"></div>
    <div class="feature__veil" aria-hidden="true"></div>
    <div class="feature__inner">
      <p class="label" data-load data-feature-label>${live ? 'Out now' : 'Next premiere'}</p>
      <h1 class="feature__title" data-load>${escapeHtml(entry.title)}</h1>
      <p class="feature__meta" data-load>
        <span>${escapeHtml(project.title)}</span>
        <i></i>
        <span>${escapeHtml(project.tag)}</span>
        <i></i>
        <span>${year}</span>
      </p>
      <p class="feature__sub" data-load data-feature-sub>${escapeHtml(project.blurb)}</p>
      <div class="feature__cd" data-load data-feature-cd></div>
      <div class="feature__actions" data-load>
        ${
          trailer
            ? `<button class="btn btn--solid" type="button" data-play-trailer data-magnetic>
                ${ICONS.play}
                ${live && watchId(entry) ? 'Play' : 'Play trailer'}
              </button>`
            : ''
        }
        <span data-feature-actions></span>
        <span data-feature-calendar></span>
      </div>
      <p class="release-note" data-feature-note hidden></p>
    </div>
  `

  const actions = host.querySelector('[data-feature-actions]')
  const calendar = host.querySelector('[data-feature-calendar]')
  const label = host.querySelector('[data-feature-label]')
  const note = host.querySelector('[data-feature-note]')

  host.querySelector('[data-play-trailer]')?.addEventListener('click', () => {
    const watch = watchId(entry)
    openPlay({
      id: watch || trailer,
      title: entry.title,
      start: watch ? 0 : entry.reelStart || 0,
      sound: true,
    })
  })

  const paintActions = (phase) => {
    if (label) label.textContent = phase === 'live' ? 'Out now' : 'Next premiere'
    const watch = releaseActionHtml(entry, phase)
    if (actions) {
      actions.innerHTML = trailer && watch ? watch.replace('btn btn--solid', 'btn') : watch
      initMagnetic(actions)
    }
    if (calendar) {
      calendar.hidden = phase === 'live'
      if (phase !== 'live') {
        calendar.innerHTML = calendarActionHtml({ solid: !watch && !trailer })
        bindCalendarDownload(calendar, featured)
        initMagnetic(calendar)
      } else {
        calendar.innerHTML = ''
      }
    }
    const line = releaseNote(entry, phase)
    if (note) {
      note.hidden = !line
      note.textContent = line
    }
  }

  stoppers.push(
    mountCountdown(host.querySelector('[data-feature-cd]'), entry.release, {
      onPhase: paintActions,
    }),
  )

  mountFeatureReel(host, entry)
}

async function mountFeatureReel(host, entry) {
  if (!entry.reel) return

  const startReel = async () => {
    if (!hasMediaConsent() || activeReel) return
    const reel = await mountReel(host.querySelector('[data-reel]'), {
      videoId: entry.reel,
      start: entry.reelStart || 0,
      onPlaying: () => host.classList.add('has-reel'),
    })
    if (!reel) return
    activeReel = reel
  }

  await startReel()
  stoppers.push(
    onConsent((choice) => {
      if (choice?.media) startReel()
      else {
        activeReel?.destroy()
        activeReel = null
        host.classList.remove('has-reel')
      }
    }),
  )
  stoppers.push(() => {
    activeReel?.destroy()
    activeReel = null
  })
}

/* ── Tiles ───────────────────────────────────────────────── */

function filmStill(project, entry) {
  if (entry.mark) {
    return `
      <span class="tile__still tile__still--mark" style="--mark:${escapeHtml(entry.mark)}" aria-hidden="true">
        <span class="tile__mark">?</span>
      </span>
    `
  }
  const img = entry.thumb || entry.hero || project.poster
  return `
    <span class="tile__still">
      <img src="${escapeHtml(img)}" alt="" width="1280" height="720" loading="lazy" />
    </span>
  `
}

function filmTile(project, entry) {
  const play = playPayload(entry, `${project.title}: ${entryName(entry)}`)
  const soon = Boolean(entry.expected) && !entry.release
  const tag = `Film ${entry.n}`
  const note = soon ? 'Estimate' : ''
  const inner = `
    ${filmStill(project, entry)}
    <span class="tile__veil" aria-hidden="true"></span>
    ${play ? `<span class="tile__play">${ICONS.play}</span>` : ''}
    <span class="tile__copy">
      <span class="tile__kicker">${escapeHtml(tag)}</span>
      <span class="tile__name">${escapeHtml(entryName(entry))}</span>
      <span class="tile__sub">${escapeHtml(entryStamp(entry))}</span>
      ${note ? `<span class="tile__note">${note}</span>` : ''}
    </span>
  `

  if (play) {
    return `<button class="tile" type="button" data-hint="Play" data-play="${escapeHtml(play.id)}" data-play-title="${escapeHtml(play.title)}" data-play-start="${play.start}">${inner}</button>`
  }
  return `<article class="tile tile--soon">${inner}</article>`
}

function extraTile(video) {
  return `
    <button class="tile" type="button" data-hint="Play" data-play="${escapeHtml(video.id)}" data-play-title="${escapeHtml(video.title)}" data-play-start="0">
      <span class="tile__still">
        <img src="https://i.ytimg.com/vi/${escapeHtml(video.id)}/maxresdefault.jpg" alt="" width="1280" height="720" loading="lazy" data-yt="${escapeHtml(video.id)}" />
      </span>
      <span class="tile__veil" aria-hidden="true"></span>
      <span class="tile__play">${ICONS.play}</span>
      <span class="tile__copy">
        <span class="tile__kicker">YouTube</span>
        <span class="tile__name">${escapeHtml(video.title)}</span>
      </span>
    </button>
  `
}

function seriesPoster(project) {
  return `
    <a class="tile tile--poster" href="${escapeHtml(moviePath(project.slug))}" data-hint="Open">
      <span class="tile__still">
        <img src="${escapeHtml(project.poster)}" alt="${escapeHtml(project.title)} poster" width="600" height="900" loading="lazy" />
      </span>
      <span class="tile__veil" aria-hidden="true"></span>
      <span class="tile__copy">
        <span class="tile__kicker">${escapeHtml(project.tag)}</span>
        <span class="tile__name">${escapeHtml(project.title)}</span>
      </span>
    </a>
  `
}

function railMarkup(id, kicker, title, note, tiles) {
  return `
    <section class="rail" id="${escapeHtml(id)}">
      <header class="rail__head">
        <div>
          <p class="label">${escapeHtml(kicker)}</p>
          <h2 class="rail__title">${escapeHtml(title)}</h2>
        </div>
        ${note ? `<p class="rail__note">${escapeHtml(note)}</p>` : ''}
      </header>
      <div class="rail__track" data-rail-track>
        ${tiles}
      </div>
    </section>
  `
}

function bindPlayables(root) {
  root.querySelectorAll('[data-play]').forEach((node) => {
    node.addEventListener('click', () => {
      openPlay({
        id: node.dataset.play,
        title: node.dataset.playTitle,
        start: Number(node.dataset.playStart) || 0,
        sound: true,
      })
    })
  })
  root.querySelectorAll('img[data-yt]').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallback === '1') return
      img.dataset.fallback = '1'
      img.src = `https://i.ytimg.com/vi/${img.dataset.yt}/hqdefault.jpg`
    })
  })
}

function renderHub() {
  const host = document.querySelector('[data-hub]')
  if (!host) return

  const extras = latestVideos()
  const seriesRails = PROJECTS.map((project) =>
    railMarkup(
      project.slug,
      project.tag,
      project.title,
      project.blurb,
      project.entries.map((entry) => filmTile(project, entry)).join(''),
    ),
  ).join('')

  const extrasRail = extras.length
    ? railMarkup(
        'trailers',
        'Watch now',
        'Trailers and extras',
        'Played here, in the BR4M player.',
        extras.map(extraTile).join(''),
      )
    : ''

  const catalogRail = railMarkup(
    'series',
    'Catalog',
    'Series',
    'Every world BR4M is building. More series join this row over time.',
    PROJECTS.map(seriesPoster).join(''),
  )

  host.innerHTML = `${seriesRails}${membershipPlug()}${extrasRail}${catalogRail}`
  bindPlayables(host)
}

function membershipPlug() {
  return `
    <aside class="member member--hub" data-reveal>
      <p class="member__tag">${ICONS.member} Members site</p>
      <h2 class="member__title">Watch ad free with BR<i class="mark-i">4</i>M<i class="plus">+</i></h2>
      <p class="member__copy">
        Every video on the members site plays without ads. You also get more films, extras and member perks.
      </p>
      <a
        class="btn btn--solid member__cta"
        href="${MEMBERSHIP_URL}"
        target="_blank"
        rel="noopener noreferrer"
        data-magnetic
      >
        Become a member
        ${ICONS.arrow}
      </a>
    </aside>
  `
}

function renderDetail(project) {
  const host = document.querySelector('[data-project-detail]')
  if (!host) return
  const lead = project.entries.find((item) => item.release) || project.entries[0]
  const trailer = trailerOf(lead)

  host.innerHTML = `
    <div class="series-hero">
      <img src="${escapeHtml(project.banner)}" alt="" width="2048" height="512" />
      <div class="series-hero__veil" aria-hidden="true"></div>
      <div class="series-hero__inner">
        <a class="ulink pdetail__back" href="/movies">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M17 17H7V7M17 7L7 17"/></svg>
          All movies
        </a>
        <p class="label">${escapeHtml(project.tag)}</p>
        <h1 class="pdetail__title">${escapeHtml(project.title)}</h1>
        <p class="pdetail__blurb">${escapeHtml(project.blurb)}</p>
        <div class="feature__actions">
          ${
            trailer
              ? `<button class="btn btn--solid" type="button" data-play="${escapeHtml(trailer)}" data-play-title="${escapeHtml(project.title)}" data-play-start="${lead?.reelStart || 0}" data-magnetic>
                  ${ICONS.play}
                  Play trailer
                </button>`
              : ''
          }
        </div>
      </div>
    </div>
    <div class="hub hub--page">
      ${railMarkup(
        `${project.slug}-films`,
        'The films',
        project.title,
        'Dates marked as expected are estimates.',
        project.entries.map((entry) => filmTile(project, entry)).join(''),
      )}
    </div>
  `
  bindPlayables(host)
}

/* ── View switching ──────────────────────────────────────── */

function show(el, visible) {
  if (!el) return
  el.hidden = !visible
  if (visible && !reducedMotion()) {
    gsap.fromTo(
      el,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', clearProps: 'transform,opacity' },
    )
  }
}

function route() {
  const slug = currentSlug()
  const project = projectBySlug(slug)
  const feature = document.querySelector('[data-feature]')
  const hub = document.querySelector('[data-hub]')
  const detail = document.querySelector('[data-project-detail]')

  if (project) {
    renderDetail(project)
    show(feature, false)
    show(hub, false)
    show(detail, true)
    activeReel?.pause()
    document.title = `${project.title}, a BR4M movie`
    resetScroll()
  } else {
    show(detail, false)
    show(feature, true)
    show(hub, true)
    activeReel?.play()
    document.title = 'BR4M Movies'
  }
  applyReveals(document)
  initMagnetic(document)
  refresh()
}

export function mountProjects() {
  if (hasMediaConsent()) warmPlayer()
  onConsent((choice) => {
    if (choice?.media) warmPlayer()
  })
  adoptHashRoute()
  stopTimers()
  renderFeature()
  renderHub()
  window.addEventListener('popstate', route)
  window.addEventListener('hashchange', () => {
    adoptHashRoute()
    route()
  })
  route()
}
