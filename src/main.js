import { mountAllFluidBackgrounds } from './light-strings.js'
import { runIntro } from './intro.js'

function initYear() {
  const year = String(new Date().getFullYear())
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = year
  })
}

function boot() {
  initYear()
  const instances = mountAllFluidBackgrounds()
  // Start beam cold until intro drives it
  instances.forEach((inst) => inst.setIntroState?.({ intensity: 0, scale: 1.55, speed: 0.15 }))
  runIntro(instances)
}

if (document.fonts?.ready) {
  document.fonts.ready.then(boot).catch(boot)
} else {
  boot()
}
