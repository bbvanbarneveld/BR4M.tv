import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText)

const EASE = 'expo.out'

let lenis = null
let ready = false

export function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function finePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function setPageScrollLocked(locked) {
  document.documentElement.classList.toggle('is-locked', locked)
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

export function refresh() {
  requestAnimationFrame(() => ScrollTrigger.refresh())
}

export function scrollTo(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/* ── Text splitting ──────────────────────────────────────── */

function splitGlyphs(el) {
  if (el.dataset.glyphsDone === '1') {
    return [...el.querySelectorAll('.wordmark__glyph')]
  }
  const glyphs = []

  const walk = (node) => {
    ;[...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment()
        ;[...child.textContent].forEach((char) => {
          if (!char.trim()) {
            frag.append(char)
            return
          }
          const span = document.createElement('span')
          span.className = 'wordmark__glyph'
          span.textContent = char
          frag.append(span)
          glyphs.push(span)
        })
        child.replaceWith(frag)
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child)
      }
    })
  }

  walk(el)
  el.dataset.glyphsDone = '1'
  return glyphs
}

function splitLines(el) {
  try {
    const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' })
    return split.lines
  } catch {
    return [el]
  }
}

/* ── Reveals ─────────────────────────────────────────────── */

/**
 * Safety net: if a renderer never fires the scroll triggers (throttled tab,
 * headless screenshot), nothing is allowed to stay invisible.
 */
function guard(targets) {
  setTimeout(() => {
    targets.forEach((el) => {
      if (Number(gsap.getProperty(el, 'opacity')) < 1) {
        gsap.set(el, { clearProps: 'transform,opacity,y,yPercent' })
      }
    })
  }, 6000)
}

export function applyReveals(root = document) {
  if (!ready || reducedMotion()) return

  root.querySelectorAll('[data-split]').forEach((el) => {
    if (el.dataset.revealed === '1') return
    el.dataset.revealed = '1'
    const lines = splitLines(el)
    gsap.set(lines, { yPercent: 108 })
    gsap.to(lines, {
      yPercent: 0,
      duration: 1.1,
      ease: EASE,
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
    guard(lines)
  })

  root.querySelectorAll('[data-reveal]').forEach((el) => {
    if (el.dataset.revealed === '1') return
    el.dataset.revealed = '1'
    const stagger = el.hasAttribute('data-reveal-stagger')
    const targets = stagger ? [...el.children] : [el]
    if (!targets.length) return
    gsap.set(targets, { y: stagger ? 22 : 26, opacity: 0 })
    gsap.to(targets, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: EASE,
      stagger: stagger ? 0.07 : 0,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onComplete: () => gsap.set(targets, { clearProps: 'transform,opacity' }),
    })
    guard(targets)
  })

  root.querySelectorAll('[data-parallax]').forEach((el) => {
    if (el.dataset.parallaxed === '1') return
    el.dataset.parallaxed = '1'
    const amount = Number(el.dataset.parallax) || 7
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
  })
}

/* ── Page reveal — letterbox opens, content rises ────────── */

export function pageReveal() {
  document.documentElement.classList.add('booted')
  const bars = document.querySelectorAll('[data-bar]')
  const items = [...document.querySelectorAll('[data-load]')]
  const mark = document.querySelector('[data-glyphs]')
  const glyphs = mark ? splitGlyphs(mark) : []

  const done = () => document.body.classList.add('is-ready')

  if (reducedMotion()) {
    gsap.set(bars, { height: 0 })
    done()
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let failSafe = 0
    const tl = gsap.timeline({
      defaults: { ease: EASE },
      onComplete: () => {
        clearTimeout(failSafe)
        done()
        gsap.set(items, { clearProps: 'transform,opacity' })
        resolve()
      },
    })
    // Throttled tabs and headless renderers must never stay letterboxed.
    failSafe = setTimeout(() => tl.progress(1), 4500)

    tl.set(bars, { height: '50.5vh' })
      .set(items, { y: 30, opacity: 0 })
      .set(glyphs, { yPercent: 62, opacity: 0 })
      .to(bars, { height: 0, duration: 1.15 }, 0.05)
      .to(glyphs, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.06 }, 0.28)
      .to(items, { y: 0, opacity: 1, duration: 1, stagger: 0.09 }, 0.42)
  })
}

/* ── Hero parallax ───────────────────────────────────────── */

function posterParallax() {
  if (reducedMotion()) return
  const hero = document.querySelector('.void')
  if (!hero) return

  gsap.to('.void__inner', {
    yPercent: 16,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  })
}

/* ── Chrome driven by scroll ─────────────────────────────── */

function initScrollChrome() {
  const bar = document.querySelector('[data-progress]')
  const topbar = document.querySelector('[data-topbar]')

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (bar) gsap.set(bar, { scaleX: self.progress })
      if (!topbar) return
      const y = self.scroll()
      topbar.classList.toggle('is-stuck', y > 40)
      topbar.classList.toggle('is-hidden', self.direction === 1 && y > 380)
    },
  })
}

/* ── Magnetic hover ──────────────────────────────────────── */

export function initMagnetic(root = document) {
  if (reducedMotion() || !finePointer()) return

  root.querySelectorAll('[data-magnetic]').forEach((el) => {
    if (el.dataset.magnetized === '1') return
    el.dataset.magnetized = '1'
    const strength = Number(el.dataset.magnetic) || 0.28
    const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect()
      moveX((event.clientX - rect.left - rect.width / 2) * strength)
      moveY((event.clientY - rect.top - rect.height / 2) * strength)
    })

    el.addEventListener('pointerleave', () => {
      moveX(0)
      moveY(0)
    })
  })
}

/* ── Boot ────────────────────────────────────────────────── */

export function initMotion() {
  const soft = !reducedMotion()
  document.body.classList.toggle('js-motion', soft)

  if (soft) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.95 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]')
    if (!link) return
    const id = link.getAttribute('href')
    if (!id || id === '#') return
    const target = document.querySelector(id)
    if (!target) return
    event.preventDefault()
    scrollTo(target)
  })

  ready = true
  initScrollChrome()
  posterParallax()
  applyReveals(document)
  initMagnetic(document)
  refresh()
}
