import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import glyphs from './data/dollar-glyph.json'

/**
 * True 3D glyphs for the support page: the `$` (money green) and the BR4M+
 * `+` (violet), extruded and beveled into real meshes. Both tilt toward the
 * pointer and fall back to their CSS spans when WebGL is unavailable.
 * Lazy-loaded on pages that need them.
 */

let font = null

function mountGlyph3D(host, options) {
  if (!host) return null

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  } catch {
    return null
  }

  const em = parseFloat(getComputedStyle(host).fontSize) || 48
  const size = Math.round(em * options.scale)
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.setSize(size, size)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 10)
  camera.position.z = 3.4

  if (!font) font = new FontLoader().parse(glyphs)
  const geo = new TextGeometry(options.char, {
    font,
    size: options.glyphSize,
    depth: 0.42,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.035,
    bevelSegments: 3,
  })
  geo.center()

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: options.color,
      metalness: 0.6,
      roughness: 0.26,
      emissive: options.emissive,
      emissiveIntensity: 0.35,
    }),
  )
  scene.add(mesh)

  scene.add(new THREE.AmbientLight(0xffffff, 0.35))
  const key = new THREE.DirectionalLight(0xffffff, 3.2)
  key.position.set(2, 2.5, 3)
  scene.add(key)
  const rim = new THREE.PointLight(options.rim, 6, 12)
  rim.position.set(-2.4, -1, 2)
  scene.add(rim)

  const canvas = renderer.domElement
  canvas.style.width = `${size}px`
  canvas.style.height = `${size}px`
  host.classList.add(options.hostClass)
  host.textContent = ''
  host.append(canvas)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let raf = 0
  let visible = true

  // Pointer target: how far the glyph leans toward the cursor.
  const aim = { x: 0, y: 0 }
  function onPointer(event) {
    const rect = canvas.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (event.clientX - cx) / (window.innerWidth / 2)
    const dy = (event.clientY - cy) / (window.innerHeight / 2)
    aim.x = Math.max(-1, Math.min(1, dx))
    aim.y = Math.max(-1, Math.min(1, dy))
  }
  if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true })

  function render(now) {
    const t = now / 1000
    // Idle sway plus a smooth lean toward the pointer.
    const targetY = Math.sin(t * 0.55) * 0.3 + aim.x * 0.85
    const targetX = 0.12 + Math.sin(t * 0.37) * 0.08 + aim.y * 0.55
    mesh.rotation.y += (targetY - mesh.rotation.y) * 0.07
    mesh.rotation.x += (targetX - mesh.rotation.x) * 0.07
    mesh.position.y = Math.sin(t * 0.8) * 0.05
    renderer.render(scene, camera)
    if (!reduced && visible) raf = requestAnimationFrame(render)
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && !raf && !reduced) raf = requestAnimationFrame(render)
    if (!visible) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  })
  io.observe(canvas)

  // Static single frame for reduced motion, angled so the depth reads.
  if (reduced) {
    mesh.rotation.set(0.16, -0.4, 0)
    renderer.render(scene, camera)
  }

  return () => {
    io.disconnect()
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onPointer)
    geo.dispose()
    mesh.material.dispose()
    renderer.dispose()
  }
}

export function mountCash3D(host) {
  return mountGlyph3D(host, {
    char: '$',
    scale: 1.5,
    glyphSize: 1.35,
    color: 0x2fd575,
    emissive: 0x0d7a3f,
    rim: 0xb8f5d3,
    hostClass: 'cash--gl',
  })
}

export function mountPlus3D(host) {
  return mountGlyph3D(host, {
    char: '+',
    scale: 1.35,
    glyphSize: 1.6,
    color: 0xc900ff,
    emissive: 0x4c1d95,
    rim: 0xe9c8ff,
    hostClass: 'plus--gl',
  })
}
