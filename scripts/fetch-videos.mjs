#!/usr/bin/env node
/**
 * Pull the latest long-form uploads from the BR4M YouTube RSS feed.
 * Fails open: if YouTube is unreachable, the committed videos.json stays.
 */
import { writeFile, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RSS_URL, parseYouTubeRss, withoutShorts } from '../src/youtube-feed.js'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../src/data/videos.json')
const LIMIT = 8

async function main() {
  try {
    const res = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'BR4M.tv/1.0 (video index)' },
    })
    if (!res.ok) throw new Error(`YouTube RSS ${res.status}`)
    const videos = withoutShorts(parseYouTubeRss(await res.text()), LIMIT)
    if (!videos.length) throw new Error('Empty feed after filtering shorts')
    await writeFile(OUT, `${JSON.stringify(videos, null, 2)}\n`)
    console.log(`Wrote ${videos.length} videos → src/data/videos.json`)
  } catch (err) {
    try {
      await readFile(OUT)
      console.warn(`YouTube fetch failed (${err.message}); keeping existing videos.json`)
    } catch {
      console.warn(`YouTube fetch failed (${err.message}); no cache yet`)
      await writeFile(OUT, '[]\n')
    }
  }
}

main()
