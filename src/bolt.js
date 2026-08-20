import { reducedMotion } from './motion.js'

/**
 * Purple lightning for the homepage hero, rendered with a WebGL fragment
 * shader: every pixel measures its distance to the live bolt polylines and
 * gets a white-hot exponential core plus a wide violet halo, so the glow
 * blooms like real electricity instead of a blurred stroke.
 *
 * Renders only while a bolt is alive; between strikes it costs nothing.
 * Falls back to a 2D canvas version when WebGL is unavailable.
 */

const MAX_BOLTS = 4
const MAX_POINTS = 16

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 uRes; /* device px */
uniform float uDpr;
uniform vec2 uPts[${MAX_BOLTS * MAX_POINTS}];
uniform vec4 uMeta[${MAX_BOLTS}]; /* count, fade, coreWidth(px), intensity */

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec3 col = vec3(0.0);

  for (int b = 0; b < ${MAX_BOLTS}; b++) {
    vec4 m = uMeta[b];
    if (m.x < 2.0) continue;
    float d = 1e6;
    for (int i = 0; i < ${MAX_POINTS - 1}; i++) {
      if (float(i) >= m.x - 1.0) break;
      d = min(d, segDist(p, uPts[b * ${MAX_POINTS} + i], uPts[b * ${MAX_POINTS} + i + 1]));
    }
    float core = exp(-(d * d) / (m.z * m.z));
    float halo = exp(-d / (m.z * 9.0)) * 0.55;
    float flick = 0.85 + 0.15 * sin(d * 0.55 + m.y * 40.0);
    col += (vec3(1.0, 0.94, 1.0) * core + vec3(0.79, 0.0, 1.0) * halo * flick) * m.y * m.w;
  }

  col = clamp(col, 0.0, 1.0);
  float a = max(col.r, max(col.g, col.b));
  gl_FragColor = vec4(col, a);
}
`

function rand(min, max) {
  return min + Math.random() * (max - min)
}

/** Jagged polyline from one point toward another, capped at MAX_POINTS. */
function path(x1, y1, x2, y2, spread) {
  const points = [[x1, y1]]
  const steps = Math.min(
    MAX_POINTS - 2,
    Math.max(5, Math.round(Math.hypot(x2 - x1, y2 - y1) / 30)),
  )
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps
    points.push([
      x1 + (x2 - x1) * t + rand(-spread, spread),
      y1 + (y2 - y1) * t + rand(-spread * 0.4, spread * 0.4),
    ])
  }
  points.push([x2, y2])
  return points
}

function createGlRenderer(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  })
  if (!gl) return null

  function compile(type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('bolt shader:', gl.getShaderInfoLog(shader))
      return null
    }
    return shader
  }

  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null

  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(program, 'uRes')
  const uDpr = gl.getUniformLocation(program, 'uDpr')
  const uPts = gl.getUniformLocation(program, 'uPts')
  const uMeta = gl.getUniformLocation(program, 'uMeta')

  const pts = new Float32Array(MAX_BOLTS * MAX_POINTS * 2)
  const meta = new Float32Array(MAX_BOLTS * 4)

  return {
    gl,
    resize(w, h, dpr) {
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    },
    /** dpr-independent CSS pixel coordinates; the shader works in CSS px. */
    draw(bolts, dpr) {
      pts.fill(0)
      meta.fill(0)
      const slots = bolts.slice(0, MAX_BOLTS)
      slots.forEach((bolt, b) => {
        const fade = Math.max(0, 1 - bolt.life / bolt.span)
        meta[b * 4] = bolt.points.length
        meta[b * 4 + 1] = fade * fade
        meta[b * 4 + 2] = bolt.width
        meta[b * 4 + 3] = bolt.intensity
        bolt.points.forEach((point, i) => {
          pts[(b * MAX_POINTS + i) * 2] = point[0]
          pts[(b * MAX_POINTS + i) * 2 + 1] = point[1]
        })
      })
      // Shader converts device-px gl_FragCoord to CSS px via uDpr.
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uDpr, dpr)
      gl.uniform2fv(uPts, pts)
      gl.uniform4fv(uMeta, meta)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    clear() {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
    },
  }
}

/** Minimal 2D fallback used only when WebGL is unavailable. */
function createCanvasRenderer(canvas) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  let dprNow = 1
  return {
    resize(w, h, dpr) {
      dprNow = dpr
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    },
    draw(bolts) {
      ctx.setTransform(dprNow, 0, 0, dprNow, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      bolts.forEach((bolt) => {
        const fade = Math.max(0, 1 - bolt.life / bolt.span)
        const alpha = fade * fade
        ctx.beginPath()
        ctx.moveTo(bolt.points[0][0], bolt.points[0][1])
        for (let i = 1; i < bolt.points.length; i += 1) ctx.lineTo(bolt.points[i][0], bolt.points[i][1])
        ctx.shadowColor = 'rgba(201, 0, 255, 0.9)'
        ctx.shadowBlur = 20
        ctx.strokeStyle = `rgba(201, 0, 255, ${(alpha * 0.35).toFixed(3)})`
        ctx.lineWidth = bolt.width * 2.4
        ctx.stroke()
        ctx.strokeStyle = `rgba(244, 226, 255, ${(alpha * 0.85).toFixed(3)})`
        ctx.lineWidth = Math.max(1, bolt.width * 0.8)
        ctx.stroke()
      })
    },
    clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
  }
}

export function initBolts(canvas, target) {
  if (!canvas || reducedMotion()) return

  const renderer = createGlRenderer(canvas) || createCanvasRenderer(canvas)
  if (!renderer) return

  let width = 0
  let height = 0
  let dpr = 1
  let bolts = []
  let raf = 0
  let last = 0
  let timer = 0

  function resize() {
    const rect = canvas.getBoundingClientRect()
    dpr = Math.min(1.75, window.devicePixelRatio || 1)
    width = Math.max(1, Math.round(rect.width))
    height = Math.max(1, Math.round(rect.height))
    renderer.resize(width, height, dpr)
  }

  function push(points, span, widthPx, intensity) {
    if (bolts.length >= MAX_BOLTS) bolts.shift()
    bolts.push({ points, life: 0, span, width: widthPx, intensity })
    if (!raf) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }

  function strike() {
    const rect = target?.getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()
    const cx = rect ? rect.left - canvasRect.left + rand(rect.width * 0.1, rect.width * 0.9) : width / 2
    const cy = rect ? rect.top - canvasRect.top + rand(0, rect.height * 0.6) : height / 2

    const fromX = cx + rand(-width * 0.22, width * 0.22)
    const main = path(fromX, -20, cx, cy, 26)
    const span = rand(0.4, 0.6)
    push(main, span, 3.2, 1.25)

    // One or two forks branching off the main channel.
    const forks = Math.random() > 0.45 ? 2 : 1
    for (let i = 0; i < forks; i += 1) {
      const at = main[Math.floor(rand(main.length * 0.3, main.length * 0.75))]
      push(path(at[0], at[1], at[0] + rand(-140, 140), at[1] + rand(60, 160), 18), span * rand(0.7, 0.95), 1.5, 0.6)
    }

    target?.classList.add('is-struck')
    setTimeout(() => target?.classList.remove('is-struck'), 320)
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    bolts.forEach((bolt) => {
      bolt.life += dt
    })
    bolts = bolts.filter((bolt) => bolt.life < bolt.span)
    renderer.draw(bolts, dpr)

    if (bolts.length) {
      raf = requestAnimationFrame(frame)
    } else {
      renderer.clear()
      raf = 0
    }
  }

  /** Short electric arc crackling across the letters while hovering. */
  function crackle() {
    const rect = target?.getBoundingClientRect()
    if (!rect) return
    const canvasRect = canvas.getBoundingClientRect()
    const top = rect.top - canvasRect.top
    const left = rect.left - canvasRect.left
    const x1 = left + rand(0, rect.width * 0.55)
    const x2 = x1 + rand(rect.width * 0.12, rect.width * 0.42)
    const y1 = top + rand(-8, rect.height)
    const y2 = top + rand(-8, rect.height)
    push(path(x1, y1, x2, y2, 9), rand(0.16, 0.26), 1.2, 0.75)
  }

  let hoverTimer = 0

  function startHover() {
    if (hoverTimer) return
    target?.classList.add('is-live')
    crackle()
    hoverTimer = setInterval(crackle, 95)
  }

  function stopHover() {
    clearInterval(hoverTimer)
    hoverTimer = 0
    target?.classList.remove('is-live')
  }

  function schedule() {
    timer = setTimeout(() => {
      if (!document.hidden && !hoverTimer) strike()
      schedule()
    }, rand(3800, 8000))
  }

  resize()
  window.addEventListener('resize', resize, { passive: true })
  target?.addEventListener('pointerenter', startHover)
  target?.addEventListener('pointerleave', stopHover)
  setTimeout(strike, 900)
  schedule()

  return () => {
    clearTimeout(timer)
    stopHover()
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
  }
}
