import { initMagnetic } from './motion.js'

/** GA4 measurement ID. Never load this tag before analytics consent. */
export const GA_MEASUREMENT_ID = 'G-DJJBGLYNVJ'

const STORAGE_KEY = 'br4m.tv:consent'
const VERSION = 1
const TTL_MS = 1000 * 60 * 60 * 24 * 395
const GA_SCRIPT = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`

const listeners = new Set()
let gtagReady = false
let root = null

const DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
}

function gpcOn() {
  return Boolean(navigator.globalPrivacyControl)
}

function blank() {
  return {
    v: VERSION,
    at: '',
    necessary: true,
    analytics: false,
    media: false,
    method: '',
  }
}

function readStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '')
    if (!raw || raw.v !== VERSION || !raw.at) return null
    if (Date.now() - Date.parse(raw.at) > TTL_MS) return null
    return {
      v: VERSION,
      at: String(raw.at),
      necessary: true,
      analytics: Boolean(raw.analytics),
      media: Boolean(raw.media),
      method: String(raw.method || 'custom'),
    }
  } catch {
    return null
  }
}

function writeStored(choice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choice))
  } catch {
    // private mode / quota
  }
}

let current = readStored()

export function getConsent() {
  return current ? { ...current } : null
}

export function hasConsentChoice() {
  return Boolean(current)
}

export function hasAnalyticsConsent() {
  return Boolean(current?.analytics)
}

export function hasMediaConsent() {
  return Boolean(current?.media)
}

export function onConsent(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function emit() {
  listeners.forEach((fn) => {
    try {
      fn(getConsent())
    } catch {
      /* listener errors must not break the banner */
    }
  })
}

function bootGtagStub() {
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
  }
  window.gtag('consent', 'default', {
    ...DENIED,
    wait_for_update: 500,
  })
  window.gtag('set', 'ads_data_redaction', true)
  window.gtag('set', 'url_passthrough', false)
}

function loadGtagScript() {
  if (document.getElementById('ga-gtag')) return
  const script = document.createElement('script')
  script.id = 'ga-gtag'
  script.async = true
  script.src = GA_SCRIPT
  document.head.append(script)
}

function enableAnalytics() {
  bootGtagStub()
  window['ga-disable-' + GA_MEASUREMENT_ID] = false
  window.gtag('consent', 'update', {
    ...DENIED,
    analytics_storage: 'granted',
  })
  loadGtagScript()
  if (!gtagReady) {
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: location.protocol === 'https:' ? 'SameSite=Lax;Secure' : 'SameSite=Lax',
    })
    gtagReady = true
  }
}

function disableAnalytics() {
  window['ga-disable-' + GA_MEASUREMENT_ID] = true
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { ...DENIED })
  }
  clearAnalyticsCookies()
}

function clearAnalyticsCookies() {
  const host = location.hostname
  const names = document.cookie.split(';').map((part) => part.split('=')[0].trim())
  for (const name of names) {
    if (!/^(_ga|_gid|_gat|_gcl|AMP_TOKEN)/.test(name)) continue
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
    document.cookie = `${name}=; Path=/; Domain=${host}; Max-Age=0; SameSite=Lax`
    if (host !== 'localhost' && host.includes('.')) {
      document.cookie = `${name}=; Path=/; Domain=.${host}; Max-Age=0; SameSite=Lax`
    }
  }
}

export function setConsent({ analytics, media, method }) {
  current = {
    v: VERSION,
    at: new Date().toISOString(),
    necessary: true,
    analytics: Boolean(analytics),
    media: Boolean(media),
    method: method || 'custom',
  }
  writeStored(current)
  if (current.analytics) enableAnalytics()
  else disableAnalytics()
  if (root) root.dataset.view = 'banner'
  paint()
  emit()
}

export function acceptAll() {
  setConsent({ analytics: true, media: true, method: 'accept-all' })
}

export function rejectOptional() {
  setConsent({ analytics: false, media: false, method: 'reject' })
}

function openPanel(view = 'banner', { focus = false } = {}) {
  if (!root) return
  root.hidden = false
  root.dataset.view = view
  const box = root.querySelector('[data-consent-box]')
  if (view === 'settings') syncToggles()
  box?.scrollTo?.(0, 0)
  if (!focus) return
  if (view === 'settings') root.querySelector('[data-consent-analytics]')?.focus()
  else root.querySelector('[data-consent-reject]')?.focus()
}

export function openConsentSettings() {
  openPanel('settings', { focus: true })
}

function syncToggles() {
  if (!root) return
  const analytics = root.querySelector('[data-consent-analytics]')
  const media = root.querySelector('[data-consent-media]')
  if (analytics) analytics.checked = hasAnalyticsConsent()
  if (media) media.checked = hasMediaConsent()
}

function saveCustom() {
  setConsent({
    analytics: Boolean(root?.querySelector('[data-consent-analytics]')?.checked),
    media: Boolean(root?.querySelector('[data-consent-media]')?.checked),
    method: 'custom',
  })
}

function markup() {
  return `
    <div class="consent__box" data-consent-box data-lenis-prevent>
      <div class="consent__view" data-consent-banner>
        <div class="consent__copy">
          <p class="label">Cookies</p>
          <h2 class="consent__title" id="consent-title">A choice, before Google runs.</h2>
          <p class="consent__lead">
            Optional cookies here are Google Analytics and YouTube. Both are Google
            services. They stay off until you pick. Necessary storage only remembers
            this choice, and a currency if you set one.
          </p>
        </div>
        <div class="consent__actions">
          <button class="btn" type="button" data-consent-reject>Reject optional</button>
          <button class="btn" type="button" data-consent-accept>Accept all</button>
          <button class="ulink" type="button" data-consent-customize>Customize</button>
        </div>
        <p class="consent__links">
          <a class="ulink" href="/privacy">Privacy</a>
        </p>
      </div>
      <div class="consent__view" data-consent-settings hidden>
        <div class="consent__copy">
          <p class="label">Cookies</p>
          <h2 class="consent__title" id="consent-settings-title">Choose what can run</h2>
          <p class="consent__lead">
            You can change this later from Privacy or Cookies in the footer. Rejecting
            is as easy as accepting. Nothing optional is on unless you turn it on.
          </p>
        </div>
        <div class="consent__opts">
          <label class="consent__opt">
            <span class="consent__opt-text">
              <strong>Necessary</strong>
              <span>This choice, and your currency if you pick one. Always on.</span>
            </span>
            <input type="checkbox" checked disabled tabindex="-1" />
          </label>
          <label class="consent__opt">
            <span class="consent__opt-text">
              <strong>Analytics</strong>
              <span>
                Google Analytics 4, measurement ID ${GA_MEASUREMENT_ID}. Page views so
                BR4M can see what is used. No ads features, no Google Signals.
              </span>
            </span>
            <input type="checkbox" data-consent-analytics />
          </label>
          <label class="consent__opt">
            <span class="consent__opt-text">
              <strong>YouTube</strong>
              <span>
                Loads youtube.com when you play a film or trailer so the play can count
                as a YouTube view. YouTube sets its own cookies. The player does not use
                youtube-nocookie.
              </span>
            </span>
            <input type="checkbox" data-consent-media />
          </label>
        </div>
        <div class="consent__actions">
          <button class="btn" type="button" data-consent-reject>Reject optional</button>
          <button class="btn btn--solid" type="button" data-consent-save>Save choices</button>
          <button class="btn" type="button" data-consent-accept>Accept all</button>
        </div>
        <p class="consent__links">
          <a class="ulink" href="/privacy">Privacy</a>
        </p>
      </div>
    </div>
  `
}

function paint() {
  if (!root) return
  const banner = root.querySelector('[data-consent-banner]')
  const settings = root.querySelector('[data-consent-settings]')
  const view = root.dataset.view || 'banner'
  const showSettings = view === 'settings'
  if (banner) banner.hidden = showSettings
  if (settings) settings.hidden = !showSettings
  root.setAttribute('aria-labelledby', showSettings ? 'consent-settings-title' : 'consent-title')
  syncToggles()
  if (hasConsentChoice() && view !== 'settings') root.hidden = true
  else root.hidden = false
}

function bind() {
  root.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('[data-consent-accept]')) {
      acceptAll()
      return
    }
    if (target.closest('[data-consent-reject]')) {
      rejectOptional()
      return
    }
    if (target.closest('[data-consent-save]')) {
      saveCustom()
      return
    }
    if (target.closest('[data-consent-customize]')) {
      openPanel('settings', { focus: true })
      paint()
    }
  })
}

function bindOpeners() {
  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const opener = target.closest('[data-open-consent]')
    if (!opener) return
    event.preventDefault()
    openConsentSettings()
    paint()
  })
}

export function initConsent() {
  bootGtagStub()
  if (hasAnalyticsConsent()) enableAnalytics()
  else {
    window['ga-disable-' + GA_MEASUREMENT_ID] = true
    if (gpcOn() && !hasConsentChoice()) {
      // GPC is an opt-out for sharing. Do not load Analytics. Still ask, because
      // YouTube is a separate choice and they may want to play films.
    }
  }

  if (root) return
  root = document.createElement('aside')
  root.className = 'consent'
  root.dataset.consent = ''
  root.setAttribute('role', 'dialog')
  root.setAttribute('aria-modal', 'false')
  root.setAttribute('aria-labelledby', 'consent-title')
  root.innerHTML = markup()
  document.body.append(root)
  bind()
  bindOpeners()
  paint()
  initMagnetic(root)

  if (location.hash === '#cookies') {
    openConsentSettings()
    paint()
  }
}

export function renderMediaGate(host, { title = 'this film', watchUrl = '' } = {}) {
  if (!host) return null
  host.innerHTML = `
    <div class="media-gate">
      <p class="label">YouTube</p>
      <h2 class="media-gate__title">Allow YouTube to play</h2>
      <p class="media-gate__lead">
        ${escapeText(title)} plays in the BR4M player on youtube.com so the play can count as a
        YouTube view. YouTube is a Google service and will set cookies. This does not turn
        Analytics on.
      </p>
      <div class="media-gate__actions">
        <button class="btn btn--solid" type="button" data-consent-yt-allow>Allow YouTube</button>
        ${
          watchUrl
            ? `<a class="btn" href="${escapeText(watchUrl)}" target="_blank" rel="noopener noreferrer" data-consent-yt-out>Open on YouTube</a>`
            : ''
        }
        <button class="btn" type="button" data-consent-yt-cancel>Not now</button>
      </div>
    </div>
  `
  host.hidden = false
  const allow = host.querySelector('[data-consent-yt-allow]')
  const cancel = host.querySelector('[data-consent-yt-cancel]')
  allow?.addEventListener('click', () => {
    const next = getConsent() || blank()
    setConsent({
      analytics: Boolean(next.analytics),
      media: true,
      method: next.method === 'accept-all' ? 'accept-all' : 'custom',
    })
  })
  return { allow, cancel, host }
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function hideMediaGate(host) {
  if (!host) return
  host.hidden = true
  host.innerHTML = ''
}
