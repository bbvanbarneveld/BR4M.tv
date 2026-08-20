const KEY = 'br4m.tv:currency'
const EVENT = 'br4m:currency'

/**
 * Supported currencies. The first group is the most used worldwide,
 * everything after it is alphabetical.
 */
export const CURRENCIES = [
  { code: 'USD', label: 'US dollar', symbol: '$', popular: true },
  { code: 'EUR', label: 'Euro', symbol: '€', popular: true },
  { code: 'GBP', label: 'British pound', symbol: '£', popular: true },
  { code: 'JPY', label: 'Japanese yen', symbol: '¥', popular: true },
  { code: 'AUD', label: 'Australian dollar', symbol: 'A$' },
  { code: 'BRL', label: 'Brazilian real', symbol: 'R$' },
  { code: 'CAD', label: 'Canadian dollar', symbol: 'C$' },
  { code: 'CHF', label: 'Swiss franc', symbol: 'CHF' },
  { code: 'DKK', label: 'Danish krone', symbol: 'kr' },
  { code: 'INR', label: 'Indian rupee', symbol: '₹' },
  { code: 'MXN', label: 'Mexican peso', symbol: 'MX$' },
  { code: 'MYR', label: 'Malaysian ringgit', symbol: 'RM' },
  { code: 'NOK', label: 'Norwegian krone', symbol: 'kr' },
  { code: 'NZD', label: 'New Zealand dollar', symbol: 'NZ$' },
  { code: 'PLN', label: 'Polish zloty', symbol: 'zł' },
  { code: 'SEK', label: 'Swedish krona', symbol: 'kr' },
  { code: 'SGD', label: 'Singapore dollar', symbol: 'S$' },
]

const CODES = new Set(CURRENCIES.map((item) => item.code))

function fallback() {
  const env = String(import.meta.env.VITE_FOURTHWALL_CURRENCY || '')
    .trim()
    .toUpperCase()
  return CODES.has(env) ? env : 'EUR'
}

/* Country to currency, limited to the currencies this site supports. */
const BY_COUNTRY = {
  AD: 'EUR', AT: 'EUR', BE: 'EUR', CY: 'EUR', DE: 'EUR', EE: 'EUR', ES: 'EUR',
  FI: 'EUR', FR: 'EUR', GR: 'EUR', HR: 'EUR', IE: 'EUR', IT: 'EUR', LT: 'EUR',
  LU: 'EUR', LV: 'EUR', MC: 'EUR', ME: 'EUR', MT: 'EUR', NL: 'EUR', PT: 'EUR',
  SI: 'EUR', SK: 'EUR', SM: 'EUR', VA: 'EUR', XK: 'EUR',
  GB: 'GBP', GG: 'GBP', IM: 'GBP', JE: 'GBP',
  US: 'USD', AU: 'AUD', BR: 'BRL', CA: 'CAD', CH: 'CHF', LI: 'CHF',
  DK: 'DKK', FO: 'DKK', GL: 'DKK', IN: 'INR', JP: 'JPY', MX: 'MXN',
  MY: 'MYR', NO: 'NOK', SJ: 'NOK', NZ: 'NZD', PL: 'PLN', SE: 'SEK', SG: 'SGD',
}

/* Time zones that differ from their region's default currency. */
const BY_ZONE = {
  'Europe/London': 'GBP',
  'Europe/Belfast': 'GBP',
  'Europe/Guernsey': 'GBP',
  'Europe/Isle_of_Man': 'GBP',
  'Europe/Jersey': 'GBP',
  'Europe/Copenhagen': 'DKK',
  'Europe/Oslo': 'NOK',
  'Europe/Stockholm': 'SEK',
  'Europe/Warsaw': 'PLN',
  'Europe/Zurich': 'CHF',
  'Europe/Busingen': 'CHF',
  'Europe/Vaduz': 'CHF',
  'Atlantic/Faroe': 'DKK',
  'America/Toronto': 'CAD',
  'America/Vancouver': 'CAD',
  'America/Edmonton': 'CAD',
  'America/Winnipeg': 'CAD',
  'America/Halifax': 'CAD',
  'America/St_Johns': 'CAD',
  'America/Regina': 'CAD',
  'America/Montreal': 'CAD',
  'America/Mexico_City': 'MXN',
  'America/Tijuana': 'MXN',
  'America/Monterrey': 'MXN',
  'America/Cancun': 'MXN',
  'America/Sao_Paulo': 'BRL',
  'America/Bahia': 'BRL',
  'America/Fortaleza': 'BRL',
  'America/Manaus': 'BRL',
  'America/Recife': 'BRL',
  'Asia/Tokyo': 'JPY',
  'Asia/Kolkata': 'INR',
  'Asia/Calcutta': 'INR',
  'Asia/Kuala_Lumpur': 'MYR',
  'Asia/Kuching': 'MYR',
  'Asia/Singapore': 'SGD',
  'Pacific/Auckland': 'NZD',
  'Pacific/Chatham': 'NZD',
}

/* Broad region defaults, used when the exact zone is not listed. */
const BY_REGION = {
  Europe: 'EUR',
  America: 'USD',
  Australia: 'AUD',
}

/**
 * Best guess at the visitor's currency, so a visitor in Europe sees euros
 * without touching the switcher. The device time zone is the location signal;
 * the browser language region is the backup. Everything is read locally, no
 * geo lookup, and an explicit pick always wins over this guess.
 */
export function detectCurrency() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (BY_ZONE[zone] && CODES.has(BY_ZONE[zone])) return BY_ZONE[zone]

    const region = BY_REGION[zone.split('/')[0]]
    if (region && CODES.has(region)) return region
  } catch {
    // Intl unavailable
  }

  const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of tags) {
    const country = String(tag || '')
      .split('-')
      .pop()
      .toUpperCase()
    const code = BY_COUNTRY[country]
    if (code && CODES.has(code)) return code
  }

  return fallback()
}

let current = (() => {
  try {
    const stored = String(localStorage.getItem(KEY) || '').toUpperCase()
    if (CODES.has(stored)) return stored
  } catch {
    // private mode
  }
  // Nothing chosen yet: guess, but do not store it, so the guess can improve.
  return detectCurrency()
})()

export function getCurrency() {
  return current
}

export function setCurrency(code) {
  const next = String(code || '').toUpperCase()
  if (!CODES.has(next) || next === current) return
  current = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // private mode
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { code: next } }))
}

export function onCurrency(handler) {
  window.addEventListener(EVENT, (event) => handler(event.detail?.code || current))
}

/**
 * Fourthwall serves a locale per currency, so a shop link becomes
 * `/en-eur/pages/donations`. That gives visitors their own currency and the
 * payment methods that belong to it.
 */
export function localizedShopUrl(url, code = getCurrency()) {
  const locale = `en-${String(code || '').toLowerCase()}`
  if (!/^en-[a-z]{3}$/.test(locale)) return url
  try {
    const next = new URL(url, window.location.origin)
    next.pathname = /^\/en-[a-z]{3}(\/|$)/.test(next.pathname)
      ? next.pathname.replace(/^\/en-[a-z]{3}/, `/${locale}`)
      : `/${locale}${next.pathname}`
    return next.toString()
  } catch {
    return url
  }
}

export function formatMoney(amount, currency = getCurrency()) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return ''
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value)
  } catch {
    return `${value} ${currency}`
  }
}
