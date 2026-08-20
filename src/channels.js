import { BRAND_ICONS, SOCIALS } from './socials.js'
import { ICONS, escapeHtml } from './ui.js'
import { applyReveals, refresh } from './motion.js'

export function mountChannels() {
  const root = document.querySelector('[data-socials]')
  if (!root) return

  const list = document.createElement('ul')
  list.dataset.reveal = ''
  list.dataset.revealStagger = ''

  SOCIALS.forEach((item) => {
    const li = document.createElement('li')
    li.innerHTML = `
      <a class="chan" href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">
        <span class="chan__icon">${BRAND_ICONS[item.id] || ''}</span>
        <span class="chan__name">${escapeHtml(item.label)}</span>
        <span class="chan__handle">${escapeHtml(item.handle)}</span>
        <span class="chan__go">${ICONS.arrow}</span>
      </a>
    `
    list.append(li)
  })

  root.replaceChildren(list)
  applyReveals(root)
  refresh()
}
