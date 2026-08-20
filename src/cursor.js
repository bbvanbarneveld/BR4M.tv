import gsap from 'gsap'
import { finePointer, reducedMotion } from './motion.js'

/**
 * Difference-blend cursor: fast dot, trailing ring, contextual label.
 * Pointer glow follows further behind for the space feel.
 */
export function initCursor() {
  const root = document.querySelector('[data-cursor]')
  if (!root || reducedMotion() || !finePointer()) return

  const dot = root.querySelector('.cursor__dot')
  const ring = root.querySelector('.cursor__ring')
  const label = root.querySelector('[data-cursor-label]')
  const glow = document.querySelector('[data-glow]')

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' })
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' })
  const glowX = glow ? gsap.quickTo(glow, 'x', { duration: 1.1, ease: 'power2.out' }) : null
  const glowY = glow ? gsap.quickTo(glow, 'y', { duration: 1.1, ease: 'power2.out' }) : null

  window.addEventListener(
    'pointermove',
    (event) => {
      document.body.classList.add('has-cursor')
      dotX(event.clientX)
      dotY(event.clientY)
      ringX(event.clientX)
      ringY(event.clientY)
      glowX?.(event.clientX)
      glowY?.(event.clientY)
    },
    { passive: true },
  )

  document.addEventListener('pointerover', (event) => {
    const target = event.target instanceof Element ? event.target : null
    const hinted = target?.closest('[data-hint]')
    const clickable = target?.closest('a, button, [role="button"], input, select')

    if (hinted) {
      if (label) label.textContent = hinted.dataset.hint || ''
      document.body.classList.add('cursor-hot')
      document.body.classList.remove('cursor-link')
      return
    }

    document.body.classList.remove('cursor-hot')
    document.body.classList.toggle('cursor-link', Boolean(clickable))
  })

  window.addEventListener('blur', () => {
    document.body.classList.remove('cursor-hot', 'cursor-link')
  })
}
