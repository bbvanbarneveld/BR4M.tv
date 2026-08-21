import {
  TOKEN,
  addToCart,
  cartCount,
  cartCurrency,
  cartTotal,
  changeQty,
  checkoutUrl,
  fetchCart,
  fetchProducts,
  fetchShop,
  imageUrl,
  isPublic,
  isSoldOut,
  money,
} from './fourthwall.js'
import { formatMoney, onCurrency } from './currency.js'
import { mountCurrencyControl } from './globe.js'
import { ICONS, bindDialog, closeDialog, escapeHtml, openDialog, plainText } from './ui.js'
import { applyReveals, initMagnetic, refresh } from './motion.js'

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']

let shopMeta = null
let cart = null
let busy = false

/* ── Helpers ─────────────────────────────────────────────── */

function unique(list) {
  return [...new Set(list.filter(Boolean))]
}

function sizeRank(name) {
  const index = SIZE_ORDER.indexOf(String(name).toUpperCase())
  return index === -1 ? 90 + String(name).length : index
}

function sizesOf(product) {
  return unique(product.variants.map((v) => v.attributes?.size?.name)).sort(
    (a, b) => sizeRank(a) - sizeRank(b),
  )
}

function colorsOf(product) {
  const seen = new Map()
  product.variants.forEach((v) => {
    const name = v.attributes?.color?.name
    if (name && !seen.has(name)) seen.set(name, v.attributes.color.swatch || '')
  })
  return [...seen.entries()].map(([name, swatch]) => ({ name, swatch }))
}

function pickVariant(product, size, color) {
  return (
    product.variants.find((v) => {
      const s = v.attributes?.size?.name || ''
      const c = v.attributes?.color?.name || ''
      return (size ? s === size : true) && (color ? c === color : true)
    }) || product.variants[0]
  )
}

function fromPrice(product) {
  const live = product.variants.find((v) => !isSoldOut(v)) || product.variants[0]
  return money(live?.unitPrice)
}

function setBagCount() {
  const count = cartCount(cart)
  document.querySelectorAll('[data-bag-count]').forEach((node) => {
    node.textContent = count > 99 ? '99+' : String(count)
    node.hidden = count < 1
  })
}

function showBagButtons() {
  document.querySelectorAll('[data-open-bag]').forEach((button) => {
    button.hidden = false
  })
}

const EMPTY_COPY = 'Merch is in the works. The first official BR4M drop lands here soon.'

function note(root, text = EMPTY_COPY) {
  root.innerHTML = `
    <div class="empty-shop" data-reveal>
      <p class="empty-shop__copy">${escapeHtml(text)}</p>
      <a class="btn" href="/movies" data-magnetic>Movies</a>
    </div>
  `
  applyReveals(root)
  initMagnetic(root)
  refresh()
}

/* ── Bag ─────────────────────────────────────────────────── */

function renderBag() {
  const sheet = document.querySelector('[data-bag-sheet]')
  if (!sheet) return
  const items = cart?.items || []
  const count = cartCount(cart)
  const total = formatMoney(cartTotal(cart), cartCurrency(cart))

  sheet.innerHTML = `
    <div class="sheet__inner">
      <header class="sheet__head">
        <h2>Bag${count ? ` <span class="sheet__count">${count}</span>` : ''}</h2>
        <div class="sheet__tools">
          <span data-bag-currency></span>
          <button class="icon-btn" type="button" data-close aria-label="Close bag">${ICONS.close}</button>
        </div>
      </header>

      ${
        items.length
          ? `<ul class="lines">
              ${items
                .map((line) => {
                  const variant = line.variant
                  const name = variant.product?.name || variant.name
                  const meta = variant.attributes?.description || variant.name
                  const src = imageUrl(variant.images)
                  return `
                    <li class="line" data-variant="${escapeHtml(variant.id)}">
                      <span class="line__still">${src ? `<img src="${escapeHtml(src)}" alt="" width="160" height="200" />` : ''}</span>
                      <span class="line__copy">
                        <span class="line__name">${escapeHtml(name)}</span>
                        ${meta && meta !== name ? `<span class="line__meta">${escapeHtml(meta)}</span>` : ''}
                        <span class="line__price">${escapeHtml(money(variant.unitPrice))}</span>
                      </span>
                      <span class="line__side">
                        <span class="qty">
                          <button type="button" data-step="-1" aria-label="One less">${ICONS.minus}</button>
                          <span>${escapeHtml(line.quantity)}</span>
                          <button type="button" data-step="1" aria-label="One more">${ICONS.plus}</button>
                        </span>
                        <button class="line__remove" type="button" data-remove aria-label="Remove ${escapeHtml(name)}">
                          ${ICONS.trash}
                        </button>
                      </span>
                    </li>`
                })
                .join('')}
            </ul>
            <div class="sheet__foot">
              <p class="total"><span>Subtotal</span><strong>${escapeHtml(total)}</strong></p>
              <p class="sheet__note">Shipping and taxes are calculated at checkout.</p>
              <p class="notice" data-bag-note hidden></p>
              <button class="btn btn--solid btn--block" type="button" data-checkout>Checkout</button>
            </div>`
          : `<div class="sheet__foot sheet__foot--center">
              <span class="sheet__glyph" aria-hidden="true">${ICONS.bag}</span>
              <p class="empty">Your bag is empty.</p>
              <button class="btn" type="button" data-close>Back to the shop</button>
            </div>`
      }
    </div>
  `

  mountCurrencyControl(sheet.querySelector('[data-bag-currency]'))

  sheet.querySelectorAll('[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const host = button.closest('[data-variant]')
      const id = host?.dataset.variant
      const line = items.find((item) => item.variant.id === id)
      if (!id || !line) return
      updateQty(id, Number(line.quantity) + Number(button.dataset.step))
    })
  })

  sheet.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.closest('[data-variant]')?.dataset.variant
      if (id) updateQty(id, 0)
    })
  })

  sheet.querySelector('[data-checkout]')?.addEventListener('click', goCheckout)
  initMagnetic(sheet)
}

async function updateQty(variantId, quantity) {
  if (busy) return
  busy = true
  try {
    const line = (cart?.items || []).find((item) => item.variant.id === variantId)
    cart = await changeQty(variantId, quantity, Number(line?.quantity) || 1)
    setBagCount()
    renderBag()
  } catch {
    const noteEl = document.querySelector('[data-bag-note]')
    if (noteEl) {
      noteEl.hidden = false
      noteEl.textContent = 'Could not update the bag.'
    }
  } finally {
    busy = false
  }
}

async function goCheckout() {
  const noteEl = document.querySelector('[data-bag-note]')
  if (!cart?.id) return
  try {
    shopMeta = shopMeta || (await fetchShop())
    const href = checkoutUrl(cart.id, shopMeta)
    if (!href) throw new Error('missing checkout host')
    window.location.assign(href)
  } catch {
    if (noteEl) {
      noteEl.hidden = false
      noteEl.textContent = 'Checkout could not be opened.'
    }
  }
}

/* ── Product ─────────────────────────────────────────────── */

function openProduct(product) {
  const sheet = document.querySelector('[data-product-sheet]')
  if (!sheet) return

  const sizes = sizesOf(product)
  const colors = colorsOf(product)
  let size = sizes[0] || ''
  let color = colors[0]?.name || ''

  const paint = () => {
    const variant = pickVariant(product, size, color)
    const src = imageUrl(variant?.images?.length ? variant.images : product.images)
    const sold = isSoldOut(product) || isSoldOut(variant)
    const desc = plainText(product.description)

    sheet.innerHTML = `
      <div class="sheet__inner">
        <header class="sheet__head">
          <h2>Piece</h2>
          <button class="icon-btn" type="button" data-close aria-label="Close product">${ICONS.close}</button>
        </header>

        <article class="product">
          <figure class="product__still">
            ${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(product.name)}" width="900" height="1125" />` : ''}
          </figure>

          <div class="product__copy">
            <h3 class="product__title">${escapeHtml(product.name)}</h3>
            <p class="product__price">${escapeHtml(money(variant?.unitPrice))}</p>
            ${desc ? `<p class="product__desc">${escapeHtml(desc)}</p>` : ''}

            ${
              colors.length > 1
                ? `<fieldset class="pick">
                    <legend>Color: ${escapeHtml(color)}</legend>
                    <div class="pick__row">
                      ${colors
                        .map(
                          (item) => `<button class="swatch" type="button" data-color="${escapeHtml(item.name)}"
                            aria-pressed="${item.name === color}" aria-label="${escapeHtml(item.name)}"
                            style="--swatch:${escapeHtml(item.swatch || '#8b8b8b')}"></button>`,
                        )
                        .join('')}
                    </div>
                  </fieldset>`
                : ''
            }

            ${
              sizes.length > 1
                ? `<fieldset class="pick">
                    <legend>Size</legend>
                    <div class="pick__row">
                      ${sizes
                        .map((item) => {
                          const candidate = pickVariant(product, item, color)
                          const dead = !candidate || isSoldOut(candidate)
                          return `<button class="chip" type="button" data-size="${escapeHtml(item)}"
                            aria-pressed="${item === size}" ${dead ? 'disabled' : ''}>${escapeHtml(item)}</button>`
                        })
                        .join('')}
                    </div>
                  </fieldset>`
                : ''
            }

            <p class="notice" data-product-note hidden></p>

            <button class="btn btn--solid" type="button" data-add ${sold ? 'disabled' : ''}>
              <span class="btn__dot"></span>
              ${sold ? 'Sold out' : 'Add to bag'}
            </button>
          </div>
        </article>
      </div>
    `

    sheet.querySelectorAll('[data-color]').forEach((button) => {
      button.addEventListener('click', () => {
        color = button.dataset.color
        paint()
      })
    })

    sheet.querySelectorAll('[data-size]').forEach((button) => {
      button.addEventListener('click', () => {
        size = button.dataset.size
        paint()
      })
    })

    sheet.querySelector('[data-add]')?.addEventListener('click', async () => {
      const noteEl = sheet.querySelector('[data-product-note]')
      const cta = sheet.querySelector('[data-add]')
      if (!variant?.id || busy) return
      busy = true
      cta.disabled = true
      try {
        cart = await addToCart(variant.id, 1)
        setBagCount()
        renderBag()
        closeDialog(sheet)
        openDialog(document.querySelector('[data-bag-sheet]'))
      } catch (error) {
        if (noteEl) {
          noteEl.hidden = false
          noteEl.textContent =
            error.code === 'CART_FORBIDDEN_MEMBERS_ONLY_OFFERS_ERROR'
              ? 'This piece is for members only.'
              : 'Could not add this piece.'
        }
        cta.disabled = false
      } finally {
        busy = false
      }
    })

    initMagnetic(sheet)
  }

  paint()
  openDialog(sheet)
}

/* ── Wall ────────────────────────────────────────────────── */

function pieceNode(product) {
  const button = document.createElement('button')
  button.className = 'piece'
  button.type = 'button'
  button.dataset.hint = 'View'
  const src = imageUrl(product.images)
  const sold = isSoldOut(product)

  button.innerHTML = `
    <span class="piece__still">
      ${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(product.name)}" width="900" height="1125" />` : ''}
      ${sold ? '<span class="piece__tag">Sold out</span>' : ''}
    </span>
    <span class="piece__row">
      <span class="piece__name">${escapeHtml(product.name)}</span>
      <span class="piece__price">${sold ? 'Sold out' : escapeHtml(fromPrice(product))}</span>
    </span>
  `

  button.addEventListener('click', () => openProduct(product))
  return button
}

function renderWall(products) {
  const root = document.querySelector('[data-shop]')
  if (!root) return

  if (!products.length) {
    note(root)
    return
  }

  const wall = document.createElement('div')
  wall.className = 'wall'
  wall.dataset.count = String(products.length)
  wall.dataset.reveal = ''
  wall.dataset.revealStagger = ''
  products.forEach((product) => wall.append(pieceNode(product)))
  root.replaceChildren(wall)
  applyReveals(root)
  refresh()
}

/* ── Boot ────────────────────────────────────────────────── */

async function load() {
  const root = document.querySelector('[data-shop]')
  if (!root) return
  try {
    const [products, liveCart, shop] = await Promise.all([
      fetchProducts(),
      fetchCart(),
      shopMeta ? Promise.resolve(shopMeta) : fetchShop().catch(() => null),
    ])
    shopMeta = shop
    cart = liveCart
    setBagCount()
    renderBag()
    renderWall(products.filter(isPublic))
  } catch {
    note(root, 'The shop could not be reached. Try again later.')
  }
}

export async function mountShop() {
  const root = document.querySelector('[data-shop]')
  if (!root) return

  document.querySelectorAll('dialog[data-bag-sheet], dialog[data-product-sheet]').forEach((dialog) => {
    bindDialog(dialog)
  })

  document.querySelectorAll('[data-open-bag]').forEach((button) => {
    button.addEventListener('click', () => {
      renderBag()
      openDialog(document.querySelector('[data-bag-sheet]'))
    })
  })

  document.querySelectorAll('[data-currency-mount]').forEach((host) => {
    mountCurrencyControl(host)
  })

  if (!TOKEN) {
    note(root)
    return
  }

  showBagButtons()
  await load()
  onCurrency(() => {
    load()
  })
}
