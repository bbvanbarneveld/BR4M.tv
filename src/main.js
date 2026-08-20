import { startApp } from './app.js'
import { mountChannels } from './channels.js'
import { initBolts } from './bolt.js'
import { mountPremiere } from './premiere.js'
import { hydrateVideos, mountLatest } from './watch.js'

startApp(() => {
  mountPremiere()
  mountLatest()
  mountChannels()
  initBolts(document.querySelector('[data-bolts]'), document.querySelector('[data-strike]'))

  hydrateVideos((live) => {
    mountLatest(live)
  })
})
