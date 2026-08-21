import gsap from 'gsap'
import { CURRENCIES, getCurrency, onCurrency, setCurrency } from './currency.js'
import { ICONS } from './ui.js'
import { parkCursor } from './cursor.js'
import { setPageScrollLocked, reducedMotion } from './motion.js'

/**
 * Currency switcher: a dot-cloud globe built from a real world land map.
 * Picking a currency turns the globe toward the countries that use it
 * and lights them up.
 */

/* Countries per currency as [latitude, longitude, angular radius in degrees]. */
const COUNTRIES = {
  USD: [[39.8, -98.6, 11]],
  EUR: [
    [51.2, 10.4, 4],
    [46.6, 2.2, 4.2],
    [40.2, -3.7, 4],
    [42.8, 12.8, 3.6],
    [52.2, 5.3, 2.2],
    [39.6, -8.0, 2.2],
    [53.2, -8.0, 2.2],
    [47.6, 14.1, 2.2],
    [39.0, 22.0, 2.6],
    [64.0, 26.0, 3.4],
    [50.6, 4.7, 1.8],
  ],
  GBP: [[54.0, -2.0, 4]],
  JPY: [[36.5, 138.0, 5]],
  AUD: [[-25.3, 134.0, 12]],
  BRL: [[-10.8, -52.9, 11]],
  CAD: [[58.5, -103.0, 12]],
  CHF: [[46.8, 8.2, 2.2]],
  DKK: [[56.0, 9.5, 2.4]],
  INR: [[22.9, 79.6, 8.5]],
  MXN: [[23.9, -102.5, 6]],
  MYR: [[3.9, 102.0, 4], [2.5, 113.5, 3.5]],
  NOK: [[62.5, 8.5, 3.5]],
  NZD: [[-41.8, 172.8, 4.5]],
  PLN: [[52.1, 19.4, 3.2]],
  SEK: [[62.8, 16.7, 4]],
  SGD: [[1.35, 103.8, 2]],
}

function toVec(lat, lon) {
  const la = (lat * Math.PI) / 180
  const lo = (lon * Math.PI) / 180
  return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)]
}

/* Real Earth land dots, built lazily from Natural Earth data (src/landdots.js). */
let SPHERE = []

function highlightSet(code) {
  const zones = (COUNTRIES[code] || []).map(([lat, lon, deg]) => ({
    v: toVec(lat, lon),
    cos: Math.cos((deg * Math.PI) / 180),
  }))
  const set = new Set()
  SPHERE.forEach((dot, index) => {
    for (const zone of zones) {
      const d = dot[0] * zone.v[0] + dot[1] * zone.v[1] + dot[2] * zone.v[2]
      if (d > zone.cos) {
        set.add(index)
        break
      }
    }
  })
  // Small countries must always light at least their nearest dot.
  zones.forEach((zone) => {
    let best = -1
    let bestDot = -2
    SPHERE.forEach((dot, index) => {
      const d = dot[0] * zone.v[0] + dot[1] * zone.v[1] + dot[2] * zone.v[2]
      if (d > bestDot) {
        bestDot = d
        best = index
      }
    })
    if (best >= 0) set.add(best)
  })
  return set
}

function focusOf(code) {
  const zones = COUNTRIES[code] || []
  let x = 0
  let y = 0
  let z = 0
  zones.forEach(([lat, lon]) => {
    const v = toVec(lat, lon)
    x += v[0]
    y += v[1]
    z += v[2]
  })
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}

/* ── Dialog ──────────────────────────────────────────────── */

let dialog = null
let renderer = null
let dialogPromise = null

function currencyRow(item) {
  return `
    <button type="button" data-code="${item.code}" ${item.code === getCurrency() ? 'aria-current="true"' : ''}>
      <span class="orb__code">${item.code}</span>
      <span class="orb__name">${item.label}</span>
      <span class="orb__sym">${item.symbol}</span>
      <span class="orb__check">${ICONS.check}</span>
    </button>
  `
}

async function ensureDialog() {
  if (dialog) return dialog
  if (dialogPromise) return dialogPromise
  dialogPromise = buildDialog()
  return dialogPromise
}

async function buildDialog() {
  if (!SPHERE.length) {
    const { buildLandDots } = await import('./landdots.js')
    SPHERE = buildLandDots()
  }

  dialog = document.createElement('dialog')
  dialog.className = 'orb'
  dialog.setAttribute('aria-label', 'Choose currency')
  const popular = CURRENCIES.filter((item) => item.popular)
  const rest = CURRENCIES.filter((item) => !item.popular)

  dialog.innerHTML = `
    <div class="orb__inner" data-lenis-prevent>
      <header class="orb__head">
        <h2>Currency</h2>
        <button class="icon-btn" type="button" data-close aria-label="Close">${ICONS.close}</button>
      </header>
      <div class="orb__stage">
        <canvas data-orb-canvas aria-hidden="true"></canvas>
      </div>
      <div class="orb__side" data-lenis-prevent>
        <p class="orb__group">Popular</p>
        <div class="orb__list">${popular.map(currencyRow).join('')}</div>
        <p class="orb__group">All currencies</p>
        <div class="orb__list">${rest.map(currencyRow).join('')}</div>
      </div>
    </div>
  `
  document.body.append(dialog)

  const sync = () => {
    const open = Boolean(document.querySelector('dialog[open]'))
    document.body.classList.toggle('is-dialog', open)
    setPageScrollLocked(open)
    parkCursor()
  }

  const inner = dialog.querySelector('.orb__inner')
  let closing = false

  const closeWith = () => {
    if (closing || !dialog.open) return
    if (reducedMotion()) {
      dialog.close()
      return
    }
    closing = true
    dialog.classList.add('is-closing')
    gsap.to(inner, {
      y: 18,
      scale: 0.97,
      opacity: 0,
      duration: 0.32,
      ease: 'power2.in',
      onComplete: () => {
        closing = false
        dialog.classList.remove('is-closing')
        dialog.close()
      },
    })
  }

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.closest('[data-close]')) closeWith()
  })
  dialog.addEventListener('cancel', (event) => {
    // Esc: run the exit animation instead of snapping shut.
    if (!reducedMotion()) {
      event.preventDefault()
      closeWith()
    }
  })
  dialog.addEventListener('close', () => {
    renderer?.stop()
    sync()
  })

  dialog.querySelectorAll('[data-code]').forEach((button) => {
    button.addEventListener('pointerenter', () => renderer?.preview(button.dataset.code))
    button.addEventListener('focus', () => renderer?.preview(button.dataset.code))
    button.addEventListener('click', () => {
      setCurrency(button.dataset.code)
      renderer?.preview(button.dataset.code)
      setTimeout(closeWith, 750)
    })
  })
  dialog.querySelector('.orb__side').addEventListener('pointerleave', () => {
    renderer?.preview(getCurrency())
  })

  onCurrency((code) => {
    dialog.querySelectorAll('[data-code]').forEach((button) => {
      if (button.dataset.code === code) button.setAttribute('aria-current', 'true')
      else button.removeAttribute('aria-current')
    })
  })

  renderer = createRenderer(dialog.querySelector('[data-orb-canvas]'))
  dialog.openWith = () => {
    if (!dialog.open) dialog.showModal()
    sync()
    renderer.start()
    renderer.preview(getCurrency(), true)
    if (!reducedMotion()) {
      gsap.fromTo(
        inner,
        { y: 26, scale: 0.95, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.65, ease: 'expo.out', clearProps: 'all' },
      )
    }
  }

  return dialog
}

/* ── Renderer ────────────────────────────────────────────── */

function createRenderer(canvas) {
  const ctx = canvas.getContext('2d')
  const still = reducedMotion()
  const rotation = { yaw: 0.6, pitch: -0.35 }
  let highlight = highlightSet(getCurrency())
  let raf = 0
  let last = 0
  let size = 0
  let dpr = 1

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect()
    size = Math.max(220, Math.min(rect.width, rect.height || rect.width))
    dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function draw() {
    const half = size / 2
    const radius = half * 0.82
    ctx.clearRect(0, 0, size, size)

    // Soft globe rim.
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
    ctx.lineWidth = 1
    ctx.arc(half, half, radius, 0, Math.PI * 2)
    ctx.stroke()

    const cosY = Math.cos(rotation.yaw)
    const sinY = Math.sin(rotation.yaw)
    const cosX = Math.cos(rotation.pitch)
    const sinX = Math.sin(rotation.pitch)

    for (let i = 0; i < SPHERE.length; i += 1) {
      const [px, py, pz] = SPHERE[i]
      const x1 = px * cosY + pz * sinY
      const z1 = pz * cosY - px * sinY
      const y2 = py * cosX - z1 * sinX
      const z2 = z1 * cosX + py * sinX

      const hot = highlight.has(i)
      const front = z2 > 0
      const depth = (z2 + 1) / 2

      if (!front && !hot) {
        // Faint far side keeps the sphere readable (rects are cheap at this size).
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.025 + depth * 0.03).toFixed(3)})`
        ctx.fillRect(half - x1 * radius, half - y2 * radius, 1, 1)
        continue
      }

      const alpha = hot ? 0.3 + depth * 0.7 : 0.08 + depth * 0.34
      const r = hot ? 1.5 + depth * 1.7 : 0.75 + depth * 0.95

      ctx.beginPath()
      ctx.fillStyle = hot
        ? `rgba(201, 0, 255, ${alpha.toFixed(3)})`
        : `rgba(255, 255, 255, ${alpha.toFixed(3)})`
      ctx.arc(half - x1 * radius, half - y2 * radius, r, 0, Math.PI * 2)
      ctx.fill()

      if (hot && front) {
        ctx.beginPath()
        ctx.fillStyle = `rgba(201, 0, 255, ${(alpha * 0.16).toFixed(3)})`
        ctx.arc(half - x1 * radius, half - y2 * radius, r * 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!still && !gsap.isTweening(rotation)) rotation.yaw += dt * 0.05
    draw()
    raf = requestAnimationFrame(frame)
  }

  function focus(code, instant = false) {
    const [fx, fy, fz] = focusOf(code)
    const targetYaw = -Math.atan2(fx, fz)
    const targetPitch = Math.atan2(fy, Math.hypot(fx, fz))

    const twoPi = Math.PI * 2
    let yaw = targetYaw
    while (yaw - rotation.yaw > Math.PI) yaw -= twoPi
    while (yaw - rotation.yaw < -Math.PI) yaw += twoPi

    gsap.killTweensOf(rotation)
    if (instant || still) {
      rotation.yaw = yaw
      rotation.pitch = targetPitch
      draw()
    } else {
      gsap.to(rotation, { yaw, pitch: targetPitch, duration: 1.1, ease: 'expo.out' })
    }
  }

  return {
    start() {
      resize()
      last = performance.now()
      if (!raf) raf = requestAnimationFrame(frame)
    },
    stop() {
      cancelAnimationFrame(raf)
      raf = 0
    },
    preview(code, instant = false) {
      highlight = highlightSet(code)
      focus(code, instant)
    },
  }
}

/* ── Trigger ─────────────────────────────────────────────── */

export function mountCurrencyControl(host) {
  if (!host) return

  const paintLabel = () => {
    const item = CURRENCIES.find((entry) => entry.code === getCurrency())
    return `${item?.symbol || ''} ${getCurrency()}`
  }

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'cur-btn'
  button.setAttribute('aria-label', 'Change currency')
  button.setAttribute('aria-haspopup', 'dialog')
  button.innerHTML = `${ICONS.globe}<span data-cur-label>${paintLabel()}</span>`

  button.addEventListener('click', async () => {
    const modal = await ensureDialog()
    modal.openWith()
  })

  onCurrency(() => {
    const label = button.querySelector('[data-cur-label]')
    if (label) label.textContent = paintLabel()
  })

  host.replaceChildren(button)
}
