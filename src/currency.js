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

let current = (() => {
  try {
    const stored = String(localStorage.getItem(KEY) || '').toUpperCase()
    return CODES.has(stored) ? stored : fallback()
  } catch {
    return fallback()
  }
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
