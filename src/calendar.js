import { SITE_URL, moviePath } from './site.js'

function pad(value) {
  return String(value).padStart(2, '0')
}

function icsEscape(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

/** UTC stamp `20260830T130000Z` for an ICS date field. */
export function toIcsUtc(value) {
  const date = value instanceof Date ? value : new Date(value)
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    'T',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    'Z',
  ].join('')
}

/**
 * Calendar event for a premiere instant.
 * DTEND is one hour after start so the file is valid ICS. That hour is a
 * reminder window, not a claimed runtime.
 */
export function premiereIcs({ project, entry }, stamp = new Date()) {
  const start = new Date(entry.release)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const title = `${project.title}: ${entry.title}`
  const url = `${SITE_URL}${moviePath(project.slug)}`
  const description = `${entry.title} premieres on YouTube. ${project.blurb}`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BR4M//site//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${project.slug}-${entry.n || 'premiere'}@br4m.tv`,
    `DTSTAMP:${toIcsUtc(stamp)}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `URL:${url}`,
    'LOCATION:YouTube',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

export function calendarFileName(entry) {
  const slug = String(entry?.title || 'premiere')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'premiere'}.ics`
}

/** Wire Add to calendar links so the file always matches `projects.js`. */
export function bindCalendarDownload(root, featured) {
  if (!root || !featured) return
  root.querySelectorAll('[data-calendar]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      const blob = new Blob([premiereIcs(featured)], {
        type: 'text/calendar;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const temp = document.createElement('a')
      temp.href = url
      temp.download = calendarFileName(featured.entry)
      document.body.append(temp)
      temp.click()
      temp.remove()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    })
  })
}
