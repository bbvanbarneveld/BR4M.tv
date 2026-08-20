/**
 * All BR4M projects (series and films).
 *
 * A project has a vertical poster (2:3) and a wide banner (~4:1).
 * Entries inside a project use a YouTube-size 16:9 thumbnail.
 *
 * Entry fields:
 * - release: exact premiere instant (ISO with offset). Omit for TBA slots.
 * - url:     YouTube premiere/video URL. Paste it here once it exists;
 *            the premiere button appears in the final 24h of the countdown
 *            and turns into the watch button after release.
 * - tba:     placeholder slot, renders a question mark tile.
 */
export const PROJECTS = [
  {
    slug: 'the-architects',
    title: 'The Architects',
    tag: 'Scripted trilogy',
    poster: '/projects/the-architects-poster.png',
    banner: '/projects/the-architects-banner.png',
    blurb:
      'Three command blocks. Three hidden locations. Whoever holds all three can rewrite the world.',
    entries: [
      {
        n: 1,
        title: 'The First Word',
        thumb: '/projects/the-architects-movie-1.png',
        hero: '/projects/the-architects-hero.png',
        // Background reel behind the featured hero (muted, loops from reelStart).
        // Swap the id for the trailer once it is published.
        reel: 'XfytNGNBYww',
        reelStart: 8,
        release: '2026-08-30T15:00:00+02:00',
        url: '',
      },
      { n: 2, tba: true },
      { n: 3, tba: true },
    ],
  },
]

/** The release the projects page features in its hero. */
export function featuredRelease() {
  for (const project of PROJECTS) {
    const entry = project.entries.find((item) => item.release && !item.tba)
    if (entry) return { project, entry }
  }
  return null
}

export function projectBySlug(slug) {
  return PROJECTS.find((project) => project.slug === slug) || null
}
