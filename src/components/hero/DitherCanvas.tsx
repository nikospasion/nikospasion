import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useDitherPalette } from '../../hooks/useDitherPalette'

const CELL_CSS_PX = 2
const MAX_DPR = 1.5
const FAR = -99999

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_back;
uniform vec3 u_front;
uniform float u_cell;

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cellId = floor(gl_FragCoord.xy / u_cell);
  vec2 p = cellId * u_cell;
  vec2 uv = p / u_res;

  float wave = 0.0;
  wave += sin(uv.x * 9.0 + u_time * 0.5) * 0.10;
  wave += sin(uv.x * 4.0 - u_time * 0.3) * 0.14;
  wave += sin(uv.x * 17.0 + u_time * 0.9) * 0.045;

  float lum = smoothstep(-0.38, 0.42, uv.y - (0.42 + wave));

  float d = distance(p, u_mouse);
  float sigma = u_res.y * 0.45;
  float ripple = exp(-(d * d) / (2.0 * sigma * sigma)) * 0.35 * sin(d * 0.045 - u_time * 2.6);
  lum = clamp(lum + ripple, 0.0, 1.0);

  float on = step(bayer4(cellId), lum);
  gl_FragColor = vec4(mix(u_front, u_back, on), 1.0);
}
`

function parseRgb(rgb: string): [number, number, number] {
  const m = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (!m) return [0, 0, 0]
  return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255]
}

/**
 * The one living surface on the site: a cursor-reactive Bayer-dither wave.
 * Raw WebGL, a single context, mounted eagerly at load (compile cost lands
 * inside the initial load, never during scroll). Pauses when offscreen or
 * the tab hides; renders a single static frame under reduced motion.
 */
export function DitherCanvas({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const palette = useDitherPalette()
  const paletteRef = useRef(palette)
  paletteRef.current = palette
  const drawOnceRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    // A fresh canvas per mount: a context lost on cleanup (StrictMode,
    // page swaps) can never brick a reused element.
    const canvas = document.createElement('canvas')
    canvas.className = 'hero-canvas-inner'
    host.appendChild(canvas)
    const gl = canvas.getContext('webgl', { antialias: false, depth: false })
    if (!gl) {
      host.removeChild(canvas)
      return
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const loc = {
      res: gl.getUniformLocation(program, 'u_res'),
      time: gl.getUniformLocation(program, 'u_time'),
      mouse: gl.getUniformLocation(program, 'u_mouse'),
      back: gl.getUniformLocation(program, 'u_back'),
      front: gl.getUniformLocation(program, 'u_front'),
      cell: gl.getUniformLocation(program, 'u_cell'),
    }

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const mouse = { x: FAR, y: FAR, tx: FAR, ty: FAR }
    let raf = 0
    let running = false
    let inView = true
    const start = performance.now()

    const resize = () => {
      const w = Math.max(1, Math.round(host.clientWidth * dpr))
      const h = Math.max(1, Math.round(host.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    const draw = (timeSec: number) => {
      resize()
      const [br, bg, bb] = parseRgb(paletteRef.current.back)
      const [fr, fg, fb] = parseRgb(paletteRef.current.front)
      gl.uniform2f(loc.res, canvas.width, canvas.height)
      gl.uniform1f(loc.time, timeSec)
      gl.uniform2f(loc.mouse, mouse.x, canvas.height - mouse.y)
      gl.uniform3f(loc.back, br, bg, bb)
      gl.uniform3f(loc.front, fr, fg, fb)
      gl.uniform1f(loc.cell, CELL_CSS_PX * dpr)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const tick = () => {
      if (!running) return
      // Ease the ripple center toward the pointer.
      mouse.x += (mouse.tx - mouse.x) * 0.12
      mouse.y += (mouse.ty - mouse.y) * 0.12
      draw((performance.now() - start) / 1000)
      raf = requestAnimationFrame(tick)
    }

    const setRunning = (next: boolean) => {
      if (next === running) return
      running = next
      if (running) raf = requestAnimationFrame(tick)
      else cancelAnimationFrame(raf)
    }

    const update = () => setRunning(!reduced && inView && !document.hidden)

    drawOnceRef.current = () => {
      resize()
      draw((performance.now() - start) / 1000)
    }

    if (reduced) {
      resize()
      draw(0)
    } else {
      update()
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - rect.left) * dpr
      mouse.ty = (e.clientY - rect.top) * dpr
    }
    const onPointerLeave = () => {
      mouse.tx = FAR
      mouse.ty = FAR
    }
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerleave', onPointerLeave)

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    })
    io.observe(canvas)
    const onVisibility = () => update()
    document.addEventListener('visibilitychange', onVisibility)
    const ro = new ResizeObserver(() => {
      if (reduced) {
        resize()
        draw(0)
      }
    })
    ro.observe(canvas)

    return () => {
      setRunning(false)
      drawOnceRef.current = null
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      io.disconnect()
      ro.disconnect()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [reduced])

  // Theme flip under reduced motion needs a one-off redraw; the running loop
  // picks palette changes up automatically via paletteRef.
  useEffect(() => {
    if (reduced) drawOnceRef.current?.()
  }, [palette, reduced])

  return <div className={className} ref={hostRef} aria-hidden="true" />
}
