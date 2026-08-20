import './style.css'
import { initChrome } from './chrome.js'
import { initCursor } from './cursor.js'
import { applyReveals, initMagnetic, initMotion, pageReveal, refresh } from './motion.js'

const SHOP_HOST = 'br4m-shop.fourthwall.com'

/**
 * Anything that can be paid for on Fourthwall (memberships, donations) first
 * asks for a currency, then opens the matching locale so visitors get their
 * own prices and payment methods. The members feed has nothing to pay for,
 * so it stays a direct link.
 */
function initShopGate() {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return

    const link = event.target.closest?.('a[href]')
    if (!link) return

    let url
    try {
      url = new URL(link.href, window.location.href)
    } catch {
      return
    }
    if (url.hostname !== SHOP_HOST) return
    if (/\/supporters\/?$/.test(url.pathname)) return

    event.preventDefault()
    import('./globe.js').then(({ openCurrencyGate }) => openCurrencyGate(link.href))
  })
}

/**
 * Shared page boot: chrome, motion layer, cursor, letterbox reveal.
 * `mount` runs before the reveal so above-the-fold content is in place.
 */
export function startApp(mount) {
  const boot = async () => {
    initChrome()
    initShopGate()
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
