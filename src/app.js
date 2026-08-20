import './style.css'
import { initChrome } from './chrome.js'
import { initCursor } from './cursor.js'
import { applyReveals, initMagnetic, initMotion, pageReveal, refresh } from './motion.js'

/**
 * Shared page boot: chrome, motion layer, cursor, letterbox reveal.
 * `mount` runs before the reveal so above-the-fold content is in place.
 */
export function startApp(mount) {
  const boot = async () => {
    initChrome()
    mount?.()
    initMotion()
    initCursor()
    await pageReveal()
    applyReveals(document)
    initMagnetic(document)
    refresh()
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(boot).catch(boot)
  } else {
    boot()
  }
}
