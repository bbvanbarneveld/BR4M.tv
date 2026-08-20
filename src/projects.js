import gsap from 'gsap'
import { PROJECTS, featuredRelease, projectBySlug } from './data/projects.js'
import { mountCountdown, phaseOf, releaseStamp } from './countdown.js'
import { mountReel } from './reel.js'
import { ICONS, escapeHtml } from './ui.js'
import { applyReveals, initMagnetic, reducedMotion, refresh } from './motion.js'
import { YOUTUBE_URL } from './youtube-feed.js'

let stoppers = []
let activeReel = null

function stopTimers() {
  stoppers.forEach((stop) => stop())
  stoppers = []
}

function releaseActions(entry, phase) {
  if (phase === 'live') {
    const href = entry.url || YOUTUBE_URL
    return `<a class="btn btn--solid" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" data-magnetic>Watch now</a>`
  }
  if (phase === 'soon' && entry.url) {
    return `<a class="btn btn--solid" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" data-magnetic>Go to the premiere</a>`
  }
  return `<button class="btn" type="button" disabled>Premiere not available yet</button>`
}

/* ── Featured hero ───────────────────────────────────────── */

function renderFeature() {
  const host = document.querySelector('[data-feature]')
  const featured = featuredRelease()
  if (!host || !featured) return

  const { project, entry } = featured
  const live = phaseOf(entry.release) === 'live'
  const year = new Date(entry.release).getUTCFullYear()

  host.innerHTML = `
    <div class="feature__media" aria-hidden="true">
      <img src="${escapeHtml(entry.hero || entry.thumb)}" alt="" width="1280" height="720" />
    </div>
    <div class="feature__reel" data-reel aria-hidden="true"></div>
    <div class="feature__veil" aria-hidden="true"></div>
    <div class="feature__inner">
      <p class="label" data-load>${live ? 'Out now' : 'Next premiere'}</p>
      <h1 class="feature__title" data-load>${escapeHtml(project.title)}</h1>
      <p class="feature__meta" data-load>
        <span>${year}</span>
        <i></i>
        <span>${escapeHtml(project.tag)}</span>
        <i></i>
        <span>${escapeHtml(entry.title)}</span>
      </p>
      <p class="feature__sub" data-load>
        ${live ? `${escapeHtml(entry.title)} is out now.` : `Premieres ${releaseStamp(entry.release)}.`}
      </p>
      <div class="feature__cd" data-load data-feature-cd></div>
      <div class="feature__actions" data-load>
        <span data-feature-actions></span>
        <a class="btn" href="#movies" data-magnetic>All movies</a>
      </div>
    </div>
  `

  const actions = host.querySelector('[data-feature-actions]')
  const paintActions = (phase) => {
    actions.innerHTML = releaseActions(entry, phase)
    initMagnetic(actions)
  }

  stoppers.push(
    mountCountdown(host.querySelector('[data-feature-cd]'), entry.release, {
      onPhase: paintActions,
    }),
  )

  mountFeatureReel(host, entry)
}

/** Muted video reel behind the hero, with a sound toggle. */
async function mountFeatureReel(host, entry) {
  if (!entry.reel) return

  const reel = await mountReel(host.querySelector('[data-reel]'), {
    videoId: entry.reel,
    start: entry.reelStart || 0,
    onPlaying: () => host.classList.add('has-reel'),
  })
  if (!reel) return
  activeReel = reel

  let sound = false
  const toggle = document.createElement('button')
  toggle.className = 'icon-btn feature__sound'
  toggle.type = 'button'
  toggle.setAttribute('aria-label', 'Turn sound on')
  toggle.innerHTML = ICONS.soundOff
  toggle.addEventListener('click', () => {
    sound = !sound
    reel.setSound(sound)
    toggle.innerHTML = sound ? ICONS.soundOn : ICONS.soundOff
    toggle.setAttribute('aria-label', sound ? 'Turn sound off' : 'Turn sound on')
  })
  host.append(toggle)

  stoppers.push(() => {
    reel.destroy()
    toggle.remove()
  })
}

/* ── Poster grid ─────────────────────────────────────────── */

function renderGrid() {
  const host = document.querySelector('[data-cards]')
  if (!host) return

  host.innerHTML = PROJECTS.map(
    (project) => `
      <a class="card" href="#${escapeHtml(project.slug)}" data-hint="Open">
        <span class="card__poster">
          <img src="${escapeHtml(project.poster)}" alt="" width="600" height="900" loading="lazy" />
        </span>
        <span class="card__row">
          <span class="card__title">${escapeHtml(project.title)}</span>
          <span class="card__tag">${escapeHtml(project.tag)}</span>
        </span>
      </a>`,
  ).join('')
}

/* ── Project detail ──────────────────────────────────────── */

function entryTile(entry) {
  if (entry.tba) {
    return `
      <article class="ep ep--tba">
        <span class="ep__still"><span class="ep__q" aria-hidden="true">?</span></span>
        <span class="ep__row">
          <span class="ep__name">${escapeHtml(entry.title)}</span>
          <span class="ep__meta">To be announced</span>
        </span>
      </article>
    `
  }

  const phase = phaseOf(entry.release)
  const linked = (phase === 'live' && (entry.url || YOUTUBE_URL)) || (phase === 'soon' && entry.url)
  const href = phase === 'live' ? entry.url || YOUTUBE_URL : entry.url
  const meta =
    phase === 'live'
      ? 'Out now'
      : `Premieres ${releaseStamp(entry.release)}`
  const tag = phase === 'live' ? ICONS.play : ''

  const inner = `
    <span class="ep__still">
      <img src="${escapeHtml(entry.thumb)}" alt="" width="1024" height="576" loading="lazy" />
      ${tag ? `<span class="ep__play">${tag}</span>` : ''}
      ${phase !== 'live' ? `<span class="ep__chip">${escapeHtml(releaseStamp(entry.release))}</span>` : ''}
    </span>
    <span class="ep__row">
      <span class="ep__name">${escapeHtml(entry.title)}</span>
      <span class="ep__meta">${escapeHtml(meta)}</span>
    </span>
  `

  return linked
    ? `<a class="ep" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" data-hint="${phase === 'live' ? 'Play' : 'Premiere'}">${inner}</a>`
    : `<article class="ep ep--wait">${inner}</article>`
}

function renderDetail(project) {
  const host = document.querySelector('[data-project-detail]')
  if (!host) return

  host.innerHTML = `
    <div class="pbanner">
      <img src="${escapeHtml(project.banner)}" alt="" width="1024" height="249" />
      <div class="pbanner__veil" aria-hidden="true"></div>
    </div>
    <div class="shell pdetail">
      <button class="ulink pdetail__back" type="button" data-back>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M17 17H7V7M17 7L7 17"/></svg>
        All movies
      </button>
      <header class="pdetail__head">
        <p class="label">${escapeHtml(project.tag)}</p>
        <h1 class="pdetail__title">${escapeHtml(project.title)}</h1>
        <p class="pdetail__blurb">${escapeHtml(project.blurb)}</p>
      </header>
      <div class="eps">
        ${project.entries.map(entryTile).join('')}
      </div>
    </div>
  `

  host.querySelector('[data-back]')?.addEventListener('click', () => {
    window.location.hash = ''
  })
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
  const slug = window.location.hash.replace('#', '')
  const project = projectBySlug(slug)
  const feature = document.querySelector('[data-feature]')
  const home = document.querySelector('[data-projects-home]')
  const detail = document.querySelector('[data-project-detail]')

  if (project) {
    renderDetail(project)
    show(feature, false)
    show(home, false)
    show(detail, true)
    activeReel?.pause()
    document.title = `${project.title}, a BR4M movie`
    window.scrollTo(0, 0)
  } else {
    show(detail, false)
    show(feature, true)
    show(home, true)
    activeReel?.play()
    document.title = 'BR4M Movies'
  }
  refresh()
}

export function mountProjects() {
  renderFeature()
  renderGrid()
  window.addEventListener('hashchange', route)
  route()
  applyReveals(document)
  initMagnetic(document)
}
