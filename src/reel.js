import { reducedMotion } from './motion.js'

/**
 * Muted YouTube video as a full-bleed hero background.
 * Loops from `start` to the end, sound only after the visitor asks for it.
 */

let apiPromise = null

function loadApi() {
  if (window.YT?.Player) return Promise.resolve()
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve()
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.append(script)
    })
  }
  return apiPromise
}

export async function mountReel(host, { videoId, start = 0, onPlaying } = {}) {
  if (!host || !videoId || reducedMotion()) return null

  await loadApi()

  const mount = document.createElement('div')
  host.append(mount)

  let player = null
  let started = false

  player = new window.YT.Player(mount, {
    host: 'https://www.youtube.com',
    videoId,
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      start,
      rel: 0,
      playsinline: 1,
      modestbranding: 1,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
    },
    events: {
      onReady: (event) => {
        event.target.mute()
        event.target.playVideo()
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.PLAYING && !started) {
          started = true
          onPlaying?.()
        }
        if (event.data === window.YT.PlayerState.ENDED) {
          event.target.seekTo(start, true)
          event.target.playVideo()
        }
      },
    },
  })

  return {
    setSound(on) {
      if (!player?.unMute) return
      if (on) player.unMute()
      else player.mute()
    },
    pause() {
      player?.pauseVideo?.()
    },
    play() {
      player?.playVideo?.()
    },
    destroy() {
      player?.destroy?.()
    },
  }
}
