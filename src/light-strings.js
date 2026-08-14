/**
 * Light-strings WebGL background
 * Three braided beams (violet, ember, cyan) over a sparse starfield.
 */

const VERTEX = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT = `
  precision highp float;

  uniform vec3  uColorStops[6];
  uniform vec3  uBackgroundColor;
  uniform float uTime;
  uniform vec3  uResolution;
  uniform float uIntensity;
  uniform float uScale;
  uniform float uNoise;
  uniform vec2  uMouse;
  uniform float uSpeed;
  uniform float uProgress;
  uniform float uOffsetX;
  uniform float uOffsetY;
  uniform float uAngle;

  float tanhApprox(float x) {
    return (2.0 / (1.0 + exp(-2.0 * x))) - 1.0;
  }

  float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Three-phase braid: same path, 120° apart, with front/back shading
  // so strands read as weaving over and under each other.
  float braid(vec2 p, float t, float grain, float phase, float amp, float freq, float thick0) {
    float theta = p.x * freq + t * 0.88 + phase + grain * 0.35;
    float y = amp * sin(theta) + amp * 0.24 * sin(p.x * 0.32 - t * 0.42 + phase);
    float depth = 0.5 + 0.5 * cos(theta);
    float thick = mix(thick0 * 0.7, thick0 * 1.08, depth);
    float glow = tanhApprox(thick / (abs(p.y - y) + 0.0006));
    return glow * mix(0.5, 1.0, depth);
  }

  vec3 starLayer(vec2 uv, float time, float scale, float threshold, float tightness) {
    vec2 cell = uv * scale;
    vec2 id = floor(cell);
    vec2 gv = fract(cell) - 0.5;
    float rnd = hash21(id);
    vec2 jitter = vec2(hash21(id + 3.1), hash21(id + 7.9)) - 0.5;
    gv -= jitter * 0.62;
    float d = length(gv);
    float on = smoothstep(threshold, min(1.0, threshold + 0.028), rnd);
    float twinkle = 0.58 + 0.42 * sin(time * (0.9 + rnd * 2.6) + rnd * 40.0);
    float core = exp(-d * d * tightness);
    float halo = exp(-d * d * tightness * 0.07) * 0.28;
    float spikeAmt = smoothstep(0.993, 0.999, rnd);
    float spikes =
      exp(-abs(gv.x) * 72.0) * exp(-abs(gv.y) * 16.0) +
      exp(-abs(gv.y) * 72.0) * exp(-abs(gv.x) * 16.0);
    vec3 tint = mix(vec3(0.76, 0.84, 1.0), vec3(1.0, 0.90, 0.78), hash21(id + 11.0));
    return tint * on * twinkle * (core + halo + spikes * spikeAmt * 0.45);
  }

  void main() {
    vec2 pixelOffset = vec2(
      (uOffsetX / 100.0) * (uResolution.x * 0.5),
      (uOffsetY / 100.0) * (uResolution.y * 0.5)
    );

    vec2 p = ((gl_FragCoord.xy + pixelOffset) * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);

    float angle = radians(uAngle);
    p = vec2(
      p.x * cos(angle) - p.y * sin(angle),
      p.x * sin(angle) + p.y * cos(angle)
    );

    float time = uSpeed > 0.0 ? uTime * uSpeed : (uMouse.x + uMouse.y) * 1.3 + uProgress * 0.3;

    float scale = mix(0.4, 2.6, (uScale * 1.2));
    p *= scale;

    float n = mod(dot(gl_FragCoord.xy, sin(gl_FragCoord.yx)), 0.1);

    // Starfield in screen space — does not rotate or scale with the braid.
    vec2 starUv = gl_FragCoord.xy / uResolution.y;
    starUv += vec2(uTime * 0.0035, uTime * 0.0012);
    float starFade = smoothstep(0.0, 1.4, uTime);
    vec3 stars = vec3(0.0);
    stars += starLayer(starUv, uTime, 22.0, 0.972, 1600.0) * 0.7;
    stars += starLayer(starUv + 19.7, uTime, 48.0, 0.988, 3200.0) * 1.2;
    stars += starLayer(starUv + 47.3, uTime, 84.0, 0.995, 6400.0) * 1.8;
    stars *= starFade;

    vec3 ribbons = vec3(0.0);
    float amp = 0.5;
    float freq = 1.18;
    float third = 2.094395;
    ribbons += uColorStops[1] * braid(p, time, n, 0.0, amp, freq, 0.095);
    ribbons += uColorStops[3] * braid(p, time, n, third, amp, freq, 0.095);
    ribbons += uColorStops[5] * braid(p, time, n, third * 2.0, amp, freq, 0.095);
    ribbons += uColorStops[0] * braid(p, time, n, 0.22, amp * 0.92, freq * 0.97, 0.055) * 0.45;
    ribbons += uColorStops[2] * braid(p, time, n, third + 0.22, amp * 0.92, freq * 0.97, 0.055) * 0.45;
    ribbons += uColorStops[4] * braid(p, time, n, third * 2.0 + 0.22, amp * 0.92, freq * 0.97, 0.055) * 0.45;
    ribbons *= mix(0.4, 1.25, (uIntensity * 0.6));

    vec3 color = uBackgroundColor + stars + ribbons;
    color = clamp(color, 0.0, 1.0);
    color += (rand(gl_FragCoord.xy + uTime) - 0.5) * uNoise * 0.06;

    gl_FragColor = vec4(color, 1.0);
  }
`

function hexToRgb(hex) {
  const h = hex.replace('#', '').trim()
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = parseInt(full, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const DEFAULT_COLORS = ['#6D28D9', '#C900FF', '#EA580C', '#FF5A1F', '#0F766E', '#1EECC4']

function padColors(arr) {
  const out = []
  for (let i = 0; i < 6; i++) {
    out.push(arr[i] || hexToRgb(DEFAULT_COLORS[i]))
  }
  return out
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${info}`)
  }
  return shader
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`)
  }
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  return program
}

/**
 * Normalize UICore settings the same way as light-strings.js
 */
function normalizeSettings(raw) {
  const parsed = (raw.colors || DEFAULT_COLORS).map(hexToRgb)
  return {
    colorArray: padColors(parsed),
    backgroundColor: hexToRgb(raw.backgroundColor || '#000000'),
    scale: parseFloat(raw.scale ?? 35) * 0.02,
    noise: parseFloat(raw.noise ?? 0) * 0.09,
    intensity: parseFloat(raw.intensity ?? 50) * 0.01,
    speed: parseFloat(raw.speed ?? 20) * 0.017,
    angle: parseFloat(raw.angle ?? 0),
    offsetX: parseFloat(raw.offsetX ?? 0),
    offsetY: parseFloat(raw.offsetY ?? 0),
    progress: parseFloat(raw.progress ?? 0),
  }
}

/**
 * @param {HTMLElement} el  container
 * @param {HTMLCanvasElement} canvas
 * @param {Record<string, string|number>} userSettings
 */
export function initLightStrings(el, canvas, userSettings = {}) {
  const settings = normalizeSettings(userSettings)
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  })

  if (!gl) {
    console.warn('WebGL not available; light-strings background disabled.')
    el.style.background =
      'radial-gradient(ellipse at center, #c900ff 0%, #ff3b12 28%, #1eecc4 52%, #000 78%)'
    return { destroy() {} }
  }

  const program = createProgram(gl, VERTEX, FRAGMENT)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  )

  const aPosition = gl.getAttribLocation(program, 'a_position')
  const uniforms = {
    uTime: gl.getUniformLocation(program, 'uTime'),
    uResolution: gl.getUniformLocation(program, 'uResolution'),
    uIntensity: gl.getUniformLocation(program, 'uIntensity'),
    uScale: gl.getUniformLocation(program, 'uScale'),
    uNoise: gl.getUniformLocation(program, 'uNoise'),
    uMouse: gl.getUniformLocation(program, 'uMouse'),
    uSpeed: gl.getUniformLocation(program, 'uSpeed'),
    uProgress: gl.getUniformLocation(program, 'uProgress'),
    uOffsetX: gl.getUniformLocation(program, 'uOffsetX'),
    uOffsetY: gl.getUniformLocation(program, 'uOffsetY'),
    uAngle: gl.getUniformLocation(program, 'uAngle'),
    uBackgroundColor: gl.getUniformLocation(program, 'uBackgroundColor'),
    uColorStops: [0, 1, 2, 3, 4, 5].map((i) =>
      gl.getUniformLocation(program, `uColorStops[${i}]`),
    ),
  }

  let raf = 0
  let start = performance.now()
  let destroyed = false

  // Intro multipliers — start cold so the first frame is starfield-only
  let intensityMul = 0
  let scaleMul = 1
  let speedMul = 1

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = el.clientWidth || window.innerWidth
    const h = el.clientHeight || window.innerHeight
    canvas.width = Math.max(1, Math.floor(w * dpr))
    canvas.height = Math.max(1, Math.floor(h * dpr))
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  function frame(now) {
    if (destroyed) return
    const t = (now - start) / 1000

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    gl.uniform1f(uniforms.uTime, t)
    gl.uniform3f(uniforms.uResolution, canvas.width, canvas.height, canvas.width / canvas.height)
    gl.uniform1f(uniforms.uIntensity, settings.intensity * intensityMul)
    gl.uniform1f(uniforms.uScale, settings.scale * scaleMul)
    gl.uniform1f(uniforms.uNoise, settings.noise)
    gl.uniform2f(uniforms.uMouse, 0.5, 0.5)
    gl.uniform1f(uniforms.uSpeed, settings.speed * speedMul)
    gl.uniform1f(uniforms.uProgress, settings.progress)
    gl.uniform1f(uniforms.uOffsetX, settings.offsetX)
    gl.uniform1f(uniforms.uOffsetY, settings.offsetY)
    gl.uniform1f(uniforms.uAngle, settings.angle)
    gl.uniform3fv(uniforms.uBackgroundColor, settings.backgroundColor)
    settings.colorArray.forEach((c, i) => {
      gl.uniform3fv(uniforms.uColorStops[i], c)
    })

    gl.drawArrays(gl.TRIANGLES, 0, 3)
    raf = requestAnimationFrame(frame)
  }

  const ro = new ResizeObserver(resize)
  ro.observe(el)
  resize()
  raf = requestAnimationFrame(frame)

  return {
    /**
     * Drive the beam during page intro.
     * @param {{ intensity?: number, scale?: number, speed?: number }} state
     * intensity/scale/speed are 0..1+ multipliers (1 = final look)
     */
    setIntroState(state = {}) {
      if (state.intensity !== undefined) intensityMul = Math.max(0, state.intensity)
      if (state.scale !== undefined) scaleMul = Math.max(0.01, state.scale)
      if (state.speed !== undefined) speedMul = Math.max(0, state.speed)
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}

export function mountAllFluidBackgrounds(root = document) {
  const instances = []
  root.querySelectorAll('[data-fluid]').forEach((el) => {
    const canvas = el.querySelector('canvas.fluid-canvas, canvas')
    if (!canvas) return
    const colors = (el.dataset.colors || DEFAULT_COLORS.join(','))
      .split(',')
      .map((s) => s.trim())
    const instance = initLightStrings(el, canvas, {
      colors,
      scale: el.dataset.scale,
      noise: el.dataset.noise,
      intensity: el.dataset.intensity,
      speed: el.dataset.speed,
      angle: el.dataset.angle,
      offsetX: el.dataset.offsetX,
      offsetY: el.dataset.offsetY,
    })
    instances.push(instance)
  })
  return instances
}
