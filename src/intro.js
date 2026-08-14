/**
 * Clean startup sequence:
 * 1. Black void → beam ignites & blooms
 * 2. Title reveals from the beam slit
 * 3. CTA + footer settle in
 * 4. Class cleanup with no visual delta (anti-flicker)
 */

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

function easeOutQuint(t) {
  return 1 - (1 - t) ** 5
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Wait two animation frames so style/layout settles before class swaps. */
function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

/**
 * Animate a numeric value over duration with an easing fn.
 */
function animateValue(from, to, duration, ease, onUpdate) {
  return new Promise((resolve) => {
    const start = performance.now()
    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      onUpdate(from + (to - from) * ease(t))
      if (t < 1) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
}

/**
 * @param {Array<{ setIntroState?: Function }>} fluidInstances
 */
export async function runIntro(fluidInstances = []) {
  const body = document.body
  body.classList.add('is-intro')

  const skip = prefersReducedMotion()
  const setAll = (state) => {
    fluidInstances.forEach((inst) => inst.setIntroState?.(state))
  }

  if (skip) {
    setAll({ intensity: 1, scale: 1, speed: 1 })
    body.style.setProperty('--intro-beam', '1')
    body.classList.add('is-ready')
    await nextFrame()
    body.classList.remove('is-intro')
    return
  }

  // Phase 0 — void: beam off, tight scale, slow motion
  setAll({ intensity: 0, scale: 1.55, speed: 0.15 })
  body.classList.add('is-intro-beam')

  await wait(180)

  // Phase 1 — ignite the light string (smooth 0→1, no overshoot flash)
  const beamDuration = 1500
  await animateValue(0, 1, beamDuration, (t) => t, (raw) => {
    const e = easeOutCubic(raw)
    setAll({
      intensity: e,
      scale: 1.55 - 0.55 * easeOutQuint(raw),
      speed: 0.15 + 0.85 * easeInOutCubic(raw),
    })
    body.style.setProperty('--intro-beam', String(e))
  })

  setAll({ intensity: 1, scale: 1, speed: 1 })
  body.style.setProperty('--intro-beam', '1')

  await wait(160)

  // Phase 2 — title opens from the beam
  body.classList.add('is-intro-title')
  await wait(1000) // match clip-path transition (1s)

  // Phase 3 — CTA + footer
  body.classList.add('is-intro-ui')
  await wait(1100) // cover longest UI transition + delay

  // Phase 4 — seamless handoff to ready
  // 1) Add is-ready while intro classes still on (styles must be identical)
  // 2) Wait a frame so the browser commits that tree
  // 3) Strip intro classes — no clip-path / transform delta
  body.style.setProperty('--intro-beam', '1')
  body.classList.add('is-ready')
  await nextFrame()
  body.classList.remove('is-intro', 'is-intro-beam', 'is-intro-title', 'is-intro-ui')
}
