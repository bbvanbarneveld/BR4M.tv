import { featuredRelease } from './data/projects.js'
import { moviePath } from './site.js'
import { mountCountdown, phaseOf, releaseStamp } from './countdown.js'
import { calendarActionHtml, liveSubtitle, releaseActionHtml, youtubeReminderHtml } from './release.js'
import { bindCalendarDownload } from './calendar.js'
import { escapeHtml } from './ui.js'
import { applyReveals, initMagnetic, refresh } from './motion.js'

/**
 * Homepage premiere band: still, date, countdown, calendar.
 * Premiere / watch buttons stay disabled until a real YouTube URL is set.
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
        <a class="btn btn--solid" href="${escapeHtml(moviePath(project.slug))}" data-magnetic>Open the film</a>
        <span data-premiere-calendar>${calendarActionHtml()}</span>
      </div>
    </div>
  `

  const actions = host.querySelector('[data-premiere-actions]')
  const calendar = host.querySelector('[data-premiere-calendar]')
  const label = host.querySelector('[data-premiere-label]')
  const sub = host.querySelector('[data-premiere-sub]')

  const paint = (phase) => {
    if (label) label.textContent = phase === 'live' ? 'Out now' : 'Next premiere'
    if (sub) {
      sub.textContent =
        phase === 'live'
          ? liveSubtitle(entry)
          : `Premieres ${releaseStamp(entry.release)}.`
    }
    if (actions) {
      actions.innerHTML = `${releaseActionHtml(entry, phase)}${phase !== 'live' ? youtubeReminderHtml(entry) : ''}`
      initMagnetic(actions)
    }
    if (calendar) calendar.hidden = phase === 'live'
  }

  paint(phaseOf(entry.release))
  mountCountdown(host.querySelector('[data-premiere-cd]'), entry.release, { onPhase: paint })
  bindCalendarDownload(host, featured)
  applyReveals(host)
  initMagnetic(host)
  refresh()
}
