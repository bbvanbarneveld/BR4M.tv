import { scrollTo } from './motion.js'

/**
 * Local time for BR4M — Europe/Amsterdam, so "video at 20:00" means
 * the same thing for everyone watching.
 */
function tickClock() {
  const nodes = document.querySelectorAll('[data-clock]')
  if (!nodes.length) return

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })

  const paint = () => {
    const stamp = formatter.format(new Date())
    nodes.forEach((node) => {
      node.textContent = stamp
      node.setAttribute('aria-label', `BR4M local time ${stamp}`)
      node.title = 'BR4M local time'
    })
  }
  paint()
  setInterval(paint, 1000)
}

function initYear() {
  const year = String(new Date().getFullYear())
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = year
  })
}

function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]')
  const drawer = document.querySelector('[data-menu]')
  if (!toggle || !drawer) return

  let lastFocus = null
  const links = () => [...drawer.querySelectorAll('a')]

  const setOpen = (open) => {
    drawer.classList.toggle('is-open', open)
    toggle.classList.toggle('is-on', open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    drawer.inert = !open
    if (open) {
      lastFocus = document.activeElement
      links()[0]?.focus()
    } else {
      lastFocus?.focus?.()
    }
  }

  drawer.inert = true

  toggle.addEventListener('click', () => {
    setOpen(!drawer.classList.contains('is-open'))
  })

  drawer.addEventListener('click', (event) => {
    const link = event.target.closest('a')
    if (!link) return
    if (link.getAttribute('href')?.startsWith('#')) {
      event.preventDefault()
      setOpen(false)
      setTimeout(() => scrollTo(link.getAttribute('href')), 260)
      return
    }
    setOpen(false)
  })

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false)
  })
}

export function initChrome() {
  initYear()
  tickClock()
  initMenu()
}
