import { DISCORD_URL, MEMBERSHIP_URL, TIKTOK_URL, YOUTUBE_URL } from './youtube-feed.js'

/**
 * Confirmed public channels. Add a row here when a new network goes live.
 */
export const SOCIALS = [
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@br4mtv',
    href: YOUTUBE_URL,
    rel: 'me',
    note: 'Films and trailers',
  },
  {
    id: 'discord',
    label: 'Discord',
    handle: "Bram's Universe",
    href: DISCORD_URL,
    rel: 'me',
    note: 'Behind the scenes',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@br4m.tv',
    href: TIKTOK_URL,
    rel: 'me',
    note: 'Short cuts',
  },
  {
    id: 'membership',
    label: 'BR4M+',
    handle: 'Membership',
    href: MEMBERSHIP_URL,
    note: 'Become a member',
  },
]

export const BRAND_ICONS = {
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.498 6.186a3.02 3.02 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.02 3.02 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.02 3.02 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.02 3.02 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814M9.545 15.568V8.432L15.818 12z"/></svg>`,
  discord: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0a13 13 0 0 0-.617-1.25a.08.08 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.1.1 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057a19.9 19.8 0 0 0 5.993 3.03a.08.08 0 0 0 .084-.028a14 14 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13 13 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10 10 0 0 0 .372-.292a.07.07 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .078.01q.181.149.373.292a.077.077 0 0 1-.006.127a12.3 12.3 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028a19.8 19.8 0 0 0 6.002-3.03a.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03M8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 8.24a6.9 6.9 0 0 1-4.02-1.27v7.28a6.75 6.75 0 1 1-5.82-6.69v3.05a3.72 3.72 0 1 0 2.58 3.54V2h3.06a6.9 6.9 0 0 0 4.2 6.24z"/></svg>`,
  membership: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 4.4l2.2 4.6l5 .7l-3.6 3.5l.9 5l-4.5-2.4l-4.5 2.4l.9-5L4.8 9.7l5-.7z"/></svg>`,
}
