import land from 'world-atlas/land-110m.json'
import { feature } from 'topojson-client'

/**
 * Real Earth land dots for the currency globe.
 * The Natural Earth land polygons (world-atlas) are rasterized onto a tiny
 * equirectangular canvas; every land pixel becomes one dot on the sphere.
 * Loaded lazily, only when the currency dialog first opens.
 */

function toVec(lat, lon) {
  const la = (lat * Math.PI) / 180
  const lo = (lon * Math.PI) / 180
  return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)]
}

export function buildLandDots(step = 2.2) {
  const geo = feature(land, land.objects.land)
  const width = Math.round(360 / step)
  const height = Math.round(180 / step)

  const raster = document.createElement('canvas')
  raster.width = width
  raster.height = height
  const ctx = raster.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'

  const geometries =
    geo.type === 'FeatureCollection' ? geo.features.map((f) => f.geometry) : [geo.geometry]

  geometries.forEach((geometry) => {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    polygons.forEach((rings) => {
      ctx.beginPath()
      rings.forEach((ring) => {
        ring.forEach(([lon, lat], index) => {
          const x = ((lon + 180) / 360) * width
          const y = ((90 - lat) / 180) * height
          if (index) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
        })
        ctx.closePath()
      })
      ctx.fill('evenodd')
    })
  })

  const pixels = ctx.getImageData(0, 0, width, height).data
  const dots = []
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] > 120) {
        const lat = 90 - (y + 0.5) * step + (Math.random() - 0.5) * step * 0.45
        const lon = -180 + (x + 0.5) * step + (Math.random() - 0.5) * step * 0.45
        dots.push(toVec(lat, lon))
      }
    }
  }
  return dots
}
