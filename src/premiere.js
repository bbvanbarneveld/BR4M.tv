import { featuredRelease } from './data/projects.js'
import { moviePath } from './site.js'
import { mountCountdown, phaseOf, releaseStamp } from './countdown.js'
import { calendarActionHtml, liveSubtitle, releaseActionHtml, releaseNote } from './release.js'
import { bindCalendarDownload } from './calendar.js'
import { escapeHtml } from './ui.js'
import { applyReveals, initMagnetic, refresh } from './motion.js'

/**
 * Homepage premiere band: still, date, countdown, calendar.
 * Watch / premiere links only appear when a real YouTube URL is set.
 * Never fall back to the channel. Never show a disabled pill.
 */
export function mountPremiere() {
  const host = document.querySelector('[data-premiere]')
  const featured = featuredRelease()
  if (!host) return
  if (!featured) {
    host.hidden = true
    return
  }

  const { project, entry } = featured
  const still = entry.hero || entry.thumb || project.poster
  const year = new Date(entry.release).getUTCFullYear()
  const filmHref = moviePath(project.slug)

  host.hidden = false
  host.innerHTML = `
    <div class="premiere__media" aria-hidden="true">
      <img src="${escapeHtml(still)}" alt="" width="1280" height="720" />
    </div>
    <div class="premiere__veil" aria-hidden="true"></div>
    <div class="premiere__inner">
      <p class="label" data-load data-premiere-label>Next premiere</p>
      <h2 class="premiere__title" data-load>${escapeHtml(entry.title)}</h2>
      <p class="premiere__meta" data-load>
        <span>${escapeHtml(project.title)}</span>
        <i></i>
        <span>${escapeHtml(project.tag)}</span>
        <i></i>
        <span>${year}</span>
      </p>
      <p class="premiere__sub" data-load data-premiere-sub>
        Premieres ${escapeHtml(releaseStamp(entry.release))}.
      </p>
      <div class="premiere__cd" data-load data-premiere-cd></div>
      <div class="premiere__actions" data-load>
        <span data-premiere-actions></span>
        <span data-premiere-calendar></span>
        <a class="btn" href="${escapeHtml(filmHref)}" data-magnetic data-open-film>Open the film</a>
      </div>
      <p class="release-note" data-premiere-note hidden></p>
    </div>
  `

  const actions = host.querySelector('[data-premiere-actions]')
  const calendar = host.querySelector('[data-premiere-calendar]')
  const label = host.querySelector('[data-premiere-label]')
  const sub = host.querySelector('[data-premiere-sub]')
  const note = host.querySelector('[data-premiere-note]')

  const paint = (phase) => {
    if (label) label.textContent = phase === 'live' ? 'Out now' : 'Next premiere'
    if (sub) {
      sub.textContent =
        phase === 'live'
          ? liveSubtitle(entry)
          : `Premieres ${releaseStamp(entry.release)}.`
    }
    const watch = releaseActionHtml(entry, phase)
    if (actions) {
      actions.innerHTML = watch
      initMagnetic(actions)
    }
    const openFilm = host.querySelector('[data-open-film]')
    if (openFilm) openFilm.hidden = Boolean(watch) || phase === 'live'
    if (calendar) {
      calendar.hidden = phase === 'live'
      if (phase !== 'live') {
        calendar.innerHTML = calendarActionHtml({ solid: !watch })
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

  mountCountdown(host.querySelector('[data-premiere-cd]'), entry.release, { onPhase: paint })
  applyReveals(host)
  initMagnetic(host)
  refresh()
}
