import { reducedMotion } from './motion.js'

/**
 * Countdown with a blurred crossfade on every tick.
 * Phases:
 * - "far":  more than 24h out, countdown only
 * - "soon": final 24h, premiere link may appear
 * - "live": past the release instant, watch link only
 */

const DAY = 86400000

export function phaseOf(release, now = Date.now()) {
  const target = new Date(release).getTime()
  const left = target - now
  if (left <= 0) return 'live'
  if (left <= DAY) return 'soon'
  return 'far'
}

function parts(msLeft) {
  const total = Math.max(0, Math.floor(msLeft / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

const SEGMENTS = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Minutes'],
  ['seconds', 'Seconds'],
]

/**
 * Mounts a countdown into `host`.
 * `onPhase(phase)` fires on mount and whenever the phase changes.
 * Returns a stop() function.
 */
export function mountCountdown(host, release, { onPhase } = {}) {
  if (!host) return () => {}

  const target = new Date(release).getTime()
  const still = reducedMotion()

  host.innerHTML = `
    <div class="cd" role="timer" aria-label="Time until release">
      ${SEGMENTS.map(
        ([key, label]) => `
          <span class="cd__seg">
            <span class="cd__num" data-cd="${key}"><span class="cd__val">00</span></span>
            <span class="cd__lab">${label}</span>
          </span>`,
      ).join('<span class="cd__dots" aria-hidden="true">:</span>')}
    </div>
  `

  const nodes = {}
  host.querySelectorAll('[data-cd]').forEach((node) => {
    nodes[node.dataset.cd] = node
  })

  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

  /** The old value blurs upward out while the new one blurs in from below. */
  const swap = (wrapper, next) => {
    const value = wrapper.firstElementChild
    const prev = value.textContent
    value.textContent = next
    if (still) return

    const ghost = document.createElement('span')
    ghost.className = 'cd__ghost'
    ghost.setAttribute('aria-hidden', 'true')
    ghost.textContent = prev
    wrapper.append(ghost)
    ghost.animate(
      [
        { opacity: 0.9, filter: 'blur(0px)', transform: 'translateY(0)' },
        { opacity: 0, filter: 'blur(6px)', transform: 'translateY(-0.55em)' },
      ],
      { duration: 700, easing: EASE, fill: 'forwards' },
    ).onfinish = () => ghost.remove()

    value.animate(
      [
        { opacity: 0, filter: 'blur(6px)', transform: 'translateY(0.45em)' },
        { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
      ],
      { duration: 700, easing: EASE },
    )
  }

  let phase = ''
  let timer = 0

  const tick = () => {
    const now = Date.now()
    const values = parts(target - now)

    SEGMENTS.forEach(([key]) => {
      const node = nodes[key]
      const next = pad(values[key])
      if (node.firstElementChild.textContent === next) return
      swap(node, next)
    })

    const nextPhase = phaseOf(release, now)
    if (nextPhase !== phase) {
      phase = nextPhase
      host.classList.toggle('cd-live', phase === 'live')
      onPhase?.(phase)
    }

    if (phase === 'live') {
      clearInterval(timer)
      timer = 0
    }
  }

  tick()
  if (phase !== 'live') timer = setInterval(tick, 1000)

  return () => clearInterval(timer)
}

/** 30.08.2026, 15:00 CEST style stamp for a release instant. */
export function releaseStamp(release) {
  const date = new Date(release)
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  const raw = Object.fromEntries(
    fmt.formatToParts(date).map((part) => [part.type, part.value]),
  )
  return `${raw.day}.${raw.month}.${raw.year} at ${raw.hour}:${raw.minute} ${raw.timeZoneName}`
}
