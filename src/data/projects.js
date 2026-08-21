/**
 * All BR4M projects (series and films). Added by hand.
 *
 * A project has a vertical poster (2:3) and a wide banner (~4:1).
 * Entries inside a project use a YouTube-size 16:9 thumbnail.
 *
 * Entry fields:
 * - release:  exact premiere instant (ISO with offset).
 * - expected: quarter estimate when no date exists yet (e.g. "Q4 2026").
 *             Shown as an estimate, never as a locked premiere.
 * - url:      YouTube premiere/video URL. Paste it here once it exists;
 *             the watch action appears in the final 24h of the countdown
 *             and turns into the watch button after release.
 * - reel:     YouTube id for the muted hero loop and the trailer in the
 *             on-site player. Swap for the official trailer later.
 * - mark:     hex colour for a Climate Crisis "?" tile when there is no
 *             still yet. Never reuse another film's photo as a stand-in.
 * - tba:      no title yet. Do not invent names.
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
        reel: 'XfytNGNBYww',
        reelStart: 8,
        release: '2026-08-30T15:00:00+02:00',
        url: '',
      },
      {
        n: 2,
        title: 'To be announced',
        mark: '#87BEA8',
        expected: 'Q4 2026',
      },
      {
        n: 3,
        title: 'To be announced',
        mark: '#7E69D2',
        expected: 'Q1 2027',
      },
    ],
  },
]

/** The release the movies hub features in its billboard. */
export function featuredRelease() {
  for (const project of PROJECTS) {
    const entry = project.entries.find((item) => item.release)
    if (entry) return { project, entry }
  }
  return null
}

export function projectBySlug(slug) {
  return PROJECTS.find((project) => project.slug === slug) || null
}
