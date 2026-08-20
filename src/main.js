import { startApp } from './app.js'
import { mountChannels } from './channels.js'
import { initBolts } from './bolt.js'
import { hydrateVideos, mountLatest, mountStills } from './watch.js'

startApp(() => {
  mountStills()
  mountLatest()
  mountChannels()
  initBolts(document.querySelector('[data-bolts]'), document.querySelector('[data-strike]'))

  hydrateVideos((live) => {
    mountStills(live)
    mountLatest(live)
  })
})
