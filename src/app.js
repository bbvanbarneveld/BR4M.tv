import './style.css'
import { initChrome } from './chrome.js'
import { initCursor } from './cursor.js'
import { applyReveals, initMagnetic, initMotion, pageReveal, refresh } from './motion.js'
import { getCurrency, localizedShopUrl, onCurrency } from './currency.js'

const SHOP_HOST = 'br4m-shop.fourthwall.com'

function isPaidShopLink(link) {
  try {
    const url = new URL(link.href, window.location.href)
    return url.hostname === SHOP_HOST && !/\/supporters\/?$/.test(url.pathname)
  } catch {
    return false
  }
}

/** Point a shop link at the locale of the current currency. */
function localize(link) {
  if (!link.dataset.shopUrl) link.dataset.shopUrl = link.href
  link.href = localizedShopUrl(link.dataset.shopUrl, getCurrency())
}

/**
 * Memberships and donations open in the Fourthwall locale that matches the
 * detected currency (`/en-eur/pages/donations`), so visitors land on their own
 * prices and payment methods without being asked anything first. The members
 * feed has nothing to pay for, so it stays untouched.
 */
function initShopLinks() {
  const paint = () => {
    document.querySelectorAll(`a[href*="${SHOP_HOST}"]`).forEach((link) => {
      if (isPaidShopLink(link)) localize(link)
    })
    document.querySelectorAll('[data-shop-currency]').forEach((node) => {
      node.textContent = getCurrency()
    })
  }

  paint()
  onCurrency(paint)

  // Safety net for links injected after boot.
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest?.(`a[href*="${SHOP_HOST}"]`)
      if (link && isPaidShopLink(link)) localize(link)
    },
    true,
  )
}

/**
 * Shared page boot: chrome, motion layer, cursor, letterbox reveal.
 * `mount` runs before the reveal so above-the-fold content is in place.
 */
export function startApp(mount) {
  const boot = async () => {
    initChrome()
    mount?.()
    initShopLinks()
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
