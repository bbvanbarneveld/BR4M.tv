import { formatMoney, getCurrency } from './currency.js'

const API = 'https://storefront-api.fourthwall.com'
const CART_KEY = 'br4m.tv:cartId'

export const TOKEN = String(import.meta.env.VITE_FOURTHWALL_STOREFRONT_TOKEN || '').trim()

function checkoutOverride() {
  return String(import.meta.env.VITE_FOURTHWALL_CHECKOUT || '').trim()
}

class StorefrontError extends Error {
  constructor(status, body) {
    super(body?.code || `Storefront ${status}`)
    this.status = status
    this.code = body?.code || ''
    this.body = body
  }
}

async function request(path, { method = 'GET', body, extra } = {}) {
  const params = new URLSearchParams({
    storefront_token: TOKEN,
    currency: getCurrency(),
    ...extra,
  })
  const res = await fetch(`${API}${path}?${params}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new StorefrontError(res.status, data)
  return data
}

export function readCartId() {
  try {
    return localStorage.getItem(CART_KEY) || ''
  } catch {
    return ''
  }
}

function writeCartId(id) {
  try {
    if (id) localStorage.setItem(CART_KEY, id)
    else localStorage.removeItem(CART_KEY)
  } catch {
    // private mode / quota
  }
}

export function isPublic(product) {
  return product?.access?.type === 'PUBLIC'
}

export function isSoldOut(item) {
  if (item?.state?.type === 'SOLD_OUT') return true
  const stock = item?.stock
  return stock?.type === 'LIMITED' && Number(stock.quantity) <= 0
}

export function imageUrl(images) {
  const first = images?.[0]
  return first?.url || first?.transformedUrl || ''
}

export function money(amount) {
  if (!amount) return ''
  return formatMoney(amount.value, amount.currency || getCurrency())
}

export function cartTotal(cart) {
  return (cart?.items || []).reduce((sum, line) => {
    const unit = Number(line.variant?.unitPrice?.value) || 0
    return sum + unit * (Number(line.quantity) || 0)
  }, 0)
}

export function cartCount(cart) {
  return (cart?.items || []).reduce((sum, line) => sum + (Number(line.quantity) || 0), 0)
}

export function cartCurrency(cart) {
  return cart?.items?.[0]?.variant?.unitPrice?.currency || getCurrency()
}

export function checkoutUrl(cartId, shop) {
  const raw = checkoutOverride() || shop?.publicDomain || shop?.domain || ''
  if (!raw || !cartId) return ''
  const host = raw.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return `https://${host}/checkout/?cartCurrency=${encodeURIComponent(getCurrency())}&cartId=${encodeURIComponent(cartId)}`
}

export async function fetchShop() {
  return request('/v1/shop')
}

export async function fetchProducts() {
  const page = await request('/v1/collections/all/products', { extra: { page: '0', size: '50' } })
  return page?.results || []
}

export async function fetchCart(cartId = readCartId()) {
  if (!cartId) return null
  try {
    return await request(`/v1/carts/${encodeURIComponent(cartId)}`)
  } catch (error) {
    if (error.status === 404) {
      writeCartId('')
      return null
    }
    throw error
  }
}

export async function addToCart(variantId, quantity = 1) {
  const items = [{ variantId, quantity }]
  const cartId = readCartId()
  try {
    const cart = cartId
      ? await request(`/v1/carts/${encodeURIComponent(cartId)}/add`, { method: 'POST', body: { items } })
      : await request('/v1/carts', { method: 'POST', body: { items } })
    writeCartId(cart.id)
    return cart
  } catch (error) {
    if (cartId && error.status === 404) {
      writeCartId('')
      return addToCart(variantId, quantity)
    }
    throw error
  }
}

export async function changeQty(variantId, quantity, currentQuantity = 1) {
  const cartId = readCartId()
  if (!cartId) return null
  try {
    const cart =
      quantity < 1
        ? await request(`/v1/carts/${encodeURIComponent(cartId)}/remove`, {
            method: 'POST',
            body: { items: [{ variantId, quantity: Math.max(1, currentQuantity) }] },
          })
        : await request(`/v1/carts/${encodeURIComponent(cartId)}/change`, {
            method: 'POST',
            body: { items: [{ variantId, quantity }] },
          })
    writeCartId(cart.id)
    return cart
  } catch (error) {
    if (error.status === 404) {
      writeCartId('')
      return null
    }
    throw error
  }
}
