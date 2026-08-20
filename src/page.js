import { startApp } from './app.js'

startApp(() => {
  const cash = document.querySelector('.cash')
  const plus = document.querySelector('h2 .plus')
  if (cash || plus) {
    import('./cash3d.js').then(({ mountCash3D, mountPlus3D }) => {
      if (cash) mountCash3D(cash)
      if (plus) mountPlus3D(plus)
    })
  }
})
