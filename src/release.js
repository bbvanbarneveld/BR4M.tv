import { escapeHtml } from './ui.js'

/**
 * Premiere / watch controls.
 * Watch and premiere links only appear when the entry has a real YouTube URL.
 * After release, a missing URL never falls back to the channel.
 * Far from release, do not render a disabled pill: the calendar is the action.
 */
export function releaseActionHtml(entry, phase) {
  if (phase === 'live') {
    if (entry.url) {
      return `<a class="btn btn--solid" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" data-magnetic>Watch now</a>`
    }
    return ''
  }
  if (phase === 'soon' && entry.url) {
    return `<a class="btn btn--solid" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" data-magnetic>Go to the premiere</a>`
  }
  return ''
}

export function releaseNote(entry, phase) {
  if (phase === 'live' && !entry.url) {
    return `${entry.title} is out. The watch link appears here once it is posted.`
  }
  if (phase !== 'live' && !entry.url) {
    return 'The YouTube premiere appears here when it is listed.'
  }
  return ''
}

export function calendarActionHtml({ solid = false } = {}) {
  const klass = solid ? 'btn btn--solid' : 'btn'
  return `<a class="${klass}" href="/premiere.ics" download data-calendar data-magnetic>Add to calendar</a>`
}

export function liveSubtitle(entry) {
  if (entry.url) return `${entry.title} is out now.`
  return `${entry.title} is out. The watch link appears here once it is posted.`
}
