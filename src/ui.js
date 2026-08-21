import { setPageScrollLocked } from './motion.js'
import { parkCursor } from './cursor.js'

export const ICONS = {
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M8 6.2v11.6L18.4 12z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.7" d="M8 6.2v11.6M16 6.2v11.6"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M7 7h10v10M7 17L17 7"/></svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" d="M6 6l12 12M18 6L6 18"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" d="M12 6v12M6 12h12"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" d="M6 12h12"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 9l6 6 6-6"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M12 3.6a8.4 8.4 0 1 0 0 16.8a8.4 8.4 0 0 0 0-16.8Zm0 0c-2.32 0-4.2 3.76-4.2 8.4s1.88 8.4 4.2 8.4s4.2-3.76 4.2-8.4s-1.88-8.4-4.2-8.4ZM4 12h16"/></svg>`,
  check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5.5 12.5l4.2 4.2L18.5 8"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 7.2h14M9.6 7.2V5.4h4.8v1.8M7 7.2l.9 12.4h8.2L17 7.2M10.2 10.4v6M13.8 10.4v6"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.4 8.4h11.2l.8 11.9H5.6zM9 8.4V6.8a3 3 0 0 1 6 0v1.6"/></svg>`,
  member: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.4l2.2 4.6l5 .7l-3.6 3.5l.9 5l-4.5-2.4l-4.5 2.4l.9-5L4.8 9.7l5-.7z"/></svg>`,
  soundOff: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.5 9.5v5h3.4L12.5 18V6L7.9 9.5zM16 9.5l4.5 5M20.5 9.5l-4.5 5"/></svg>`,
  soundOn: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.5 9.5v5h3.4L12.5 18V6L7.9 9.5zM15.5 9.2a4 4 0 0 1 0 5.6M18 7a7.4 7.4 0 0 1 0 10"/></svg>`,
  like: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.2 20.5H5.4A1.9 1.9 0 0 1 3.5 18.6V11.8A1.9 1.9 0 0 1 5.4 9.9h1.8zm0-10.6l3.1-4.7a2.2 2.2 0 0 1 3.8.7l.5 2.1h4.1a2 2 0 0 1 2 2.3l-1.1 7.2a2.2 2.2 0 0 1-2.2 1.9H7.2"/></svg>`,
  comment: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.2 17.4A7.8 7.8 0 1 1 8 19.7L5 20.5z"/></svg>`,
  fullEnter: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 4.5H4.5V8M16 4.5h3.5V8M8 19.5H4.5V16M16 19.5h3.5V16"/></svg>`,
  fullExit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.5 4.5v4h-4M14.5 4.5v4h4M9.5 19.5v-4h-4M14.5 19.5v-4h4"/></svg>`,
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function plainText(value) {
  const host = document.createElement('template')
  host.innerHTML = String(value || '')
  return (host.content.textContent || '').replace(/\s+/g, ' ').trim()
}

function anyDialogOpen() {
  return Boolean(document.querySelector('dialog[open]'))
}

function syncDialogState() {
  const open = anyDialogOpen()
  document.body.classList.toggle('is-dialog', open)
  setPageScrollLocked(open)
  parkCursor()
}

export function bindDialog(dialog, { onClose } = {}) {
  if (!dialog || dialog.dataset.bound === '1') return
  dialog.dataset.bound = '1'

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
    if (event.target.closest('[data-close]')) dialog.close()
  })

  dialog.addEventListener('close', () => {
    syncDialogState()
    onClose?.()
  })
}

export function openDialog(dialog) {
  if (!dialog) return
  if (!dialog.open) dialog.showModal()
  syncDialogState()
}

export function closeDialog(dialog) {
  if (dialog?.open) dialog.close()
}
