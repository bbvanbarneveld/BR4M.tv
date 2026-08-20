import { escapeHtml } from './ui.js'

/**
 * Premiere / watch controls.
 * Watch and premiere links only appear when the entry has a real YouTube URL.
 * After release, a missing URL never falls back to the channel.
 */
export function releaseActionHtml(entry, phase) {
  if (phase === 'live') {
    if (entry.url) {
      return `<a class="btn btn--solid" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" data-magnetic>Watch now</a>`
    }
    return `<button class="btn" type="button" disabled>Watch link not posted yet</button>`
  }
  if (phase === 'soon' && entry.url) {
    return `<a class="btn btn--solid" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" data-magnetic>Go to the premiere</a>`
  }
  return `<button class="btn" type="button" disabled>Premiere not available yet</button>`
}

export function calendarActionHtml() {
  return `<a class="btn" href="/premiere.ics" download data-calendar data-magnetic>Add to calendar</a>`
}

export function youtubeReminderHtml(entry) {
  if (!entry?.url) return ''
  return `<a class="btn" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" data-magnetic>Set a YouTube reminder</a>`
}

export function liveSubtitle(entry) {
  if (entry.url) return `${entry.title} is out now.`
  return `${entry.title} is out. The watch link appears here once it is posted.`
}
