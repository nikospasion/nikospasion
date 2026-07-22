/* Generates placeholder SVG images into /public/img for every image slot in
   content.ts. Run: `bun run scripts/gen-placeholders.ts`. Swap the files for
   real photos/covers anytime — the paths in content.ts stay the same. */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { PROJECTS, LIBRARY, BAG, PHOTOS, ABOUT } from '../src/lib/content.ts'
import { assembleWriting } from '../src/lib/markdown.ts'

const PUBLIC = join(import.meta.dir, '..', 'public')

/* Writing entries are markdown files; read them the fs way (the app itself
   loads them through Vite's glob in src/lib/writing.ts). */
const WRITING_DIR = join(import.meta.dir, '..', 'src', 'content', 'writing')
const WRITING = assembleWriting(
  readdirSync(WRITING_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.replace(/\.md$/, ''), raw: readFileSync(join(WRITING_DIR, f), 'utf8') })),
)

const PAIRS: [string, string][] = [
  ['#e9c7a8', '#8a6d8f'],
  ['#a8c3d6', '#3a5a7a'],
  ['#cdae8a', '#6a5c4a'],
  ['#b7d0c4', '#4a7a6a'],
  ['#d6b3b0', '#7a4a55'],
  ['#c3c8d6', '#40465e'],
  ['#e2cf9c', '#7a6a3a'],
  ['#b0c6d0', '#3a5560'],
  ['#d8bfd0', '#5a3a55'],
  ['#c9d1b8', '#5a6a45'],
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface Spec {
  w: number
  h: number
  from: string
  to: string
  label?: string
  ink?: string
  sub?: string
  labelSize?: number
}

function svg({ w, h, from, to, label, ink = '#fff', sub, labelSize = 26 }: Spec): string {
  const a = hash((label ?? '') + from) % 90
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${(a / 180).toFixed(2)}" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.1"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#g)" filter="url(#n)"/>
  ${label ? `<text x="${w / 2}" y="${h / 2}" fill="${ink}" font-family="Georgia, serif" font-size="${labelSize}" font-weight="600" text-anchor="middle" dominant-baseline="middle" opacity="0.92">${esc(label)}</text>` : ''}
  ${sub ? `<text x="${w / 2}" y="${h / 2 + labelSize}" fill="${ink}" font-family="system-ui, sans-serif" font-size="${Math.round(labelSize * 0.5)}" text-anchor="middle" opacity="0.7">${esc(sub)}</text>` : ''}
</svg>`
}

/** A "cut-out object" tile for the bag mat: rounded card, soft shadow, label. */
function objectSvg(name: string, from: string, to: string): string {
  const short = name.split(' ').slice(0, 2).join(' ')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 170" width="240" height="170">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="228" height="158" rx="14" fill="url(#g)" stroke="#ffffff" stroke-width="5"/>
  <text x="120" y="90" fill="#fff" font-family="system-ui, sans-serif" font-size="20" font-weight="600" text-anchor="middle" opacity="0.9">${esc(short)}</text>
</svg>`
}

function write(relPath: string, content: string | Uint8Array) {
  const abs = join(PUBLIC, relPath)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, content)
}

/* ---------------------------------------------------------------------------
   Build-time dithering: instead of running a WebGL
   shader at runtime, we bake the Bayer-dithered look into tiny 2-color
   indexed PNGs (one per theme). The gradient is analytic, so we can compute
   luminance per cell directly. Rendered at 1px per dither cell and upscaled
   with image-rendering: pixelated.
--------------------------------------------------------------------------- */

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/* Must match --dither-back / --dither-front in src/styles/tokens.css */
const DITHER_PALETTES = {
  light: { back: [244, 237, 231], front: [22, 23, 24] },
  dark: { back: [22, 23, 24], front: [234, 225, 210] },
} as const

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').slice(0, 6)
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function luminance([r, g, b]: [number, number, number]): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

/* CRC32 (PNG chunks) */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function adler32(bytes: Uint8Array): number {
  let a = 1
  let b = 0
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521
    b = (b + a) % 65521
  }
  return ((b << 16) | a) >>> 0
}

function u32(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff])
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const t = new TextEncoder().encode(type)
  const body = new Uint8Array(t.length + data.length)
  body.set(t)
  body.set(data, t.length)
  const out = new Uint8Array(4 + body.length + 4)
  out.set(u32(data.length))
  out.set(body, 4)
  out.set(u32(crc32(body)), 4 + body.length)
  return out
}

/** Minimal PNG: indexed color (2-entry palette), one byte per pixel. */
function encodeIndexedPng(
  width: number,
  height: number,
  pixels: Uint8Array,
  palette: readonly (readonly number[])[],
): Uint8Array {
  const ihdr = new Uint8Array(13)
  ihdr.set(u32(width))
  ihdr.set(u32(height), 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 3 // indexed
  const plte = new Uint8Array(palette.length * 3)
  palette.forEach((c, i) => plte.set(c, i * 3))
  const raw = new Uint8Array((width + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width + 1)] = 0
    raw.set(pixels.subarray(y * width, (y + 1) * width), y * (width + 1) + 1)
  }
  const deflated = Bun.deflateSync(raw)
  const idat = new Uint8Array(2 + deflated.length + 4)
  idat[0] = 0x78
  idat[1] = 0x9c
  idat.set(deflated, 2)
  idat.set(u32(adler32(raw)), 2 + deflated.length)
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
  const parts = [sig, chunk('IHDR', ihdr), chunk('PLTE', plte), chunk('IDAT', idat), chunk('IEND', new Uint8Array(0))]
  const total = parts.reduce((s, p) => s + p.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const p of parts) {
    out.set(p, off)
    off += p.length
  }
  return out
}

/** Dither the analytic gradient into light+dark PNGs next to the SVG. */
function writeDithered(relPath: string, spec: Spec, cell = 2) {
  const w = Math.round(spec.w / cell)
  const h = Math.round(spec.h / cell)
  const a = hash((spec.label ?? '') + spec.from) % 90
  const dx = a / 180
  const dy = 1
  const dd = dx * dx + dy * dy
  const lumFrom = luminance(hexToRgb(spec.from))
  const lumTo = luminance(hexToRgb(spec.to))
  let seed = hash(relPath) || 1
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xffffffff
  }
  const pixels = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = Math.min(1, Math.max(0, ((x / w) * dx + (y / h) * dy) / dd))
      const lum = lumFrom + (lumTo - lumFrom) * t + (rand() - 0.5) * 0.06
      const threshold = (BAYER[y % 4][x % 4] + 0.5) / 16
      // dark pixels → front color (index 1)
      pixels[y * w + x] = lum < threshold ? 1 : 0
    }
  }
  const base = relPath.replace(/\.svg$/, '')
  for (const [mode, pal] of Object.entries(DITHER_PALETTES)) {
    write(`${base}.dither-${mode}.png`, encodeIndexedPng(w, h, pixels, [pal.back, pal.front]))
    n++
  }
}

let n = 0
function pair(seed: string): [string, string] {
  return PAIRS[hash(seed) % PAIRS.length]
}

/* Real raster assets (photos, covers exported from decks) are handled by
   scripts/dither-images.ts — this script only owns generated .svg slots. */
function isPlaceholder(path: string): boolean {
  return path.endsWith('.svg')
}

for (const p of PROJECTS) {
  if (!isPlaceholder(p.cover)) continue
  const [from, to] = pair(p.id)
  const spec = { w: 480, h: 300, from, to, label: p.name, labelSize: 34 }
  write(p.cover, svg(spec))
  writeDithered(p.cover, spec)
  n++
}
for (const w of WRITING) {
  if (!isPlaceholder(w.thumbnail)) continue
  const [from, to] = pair(w.slug)
  const initials = w.title.split(' ').slice(0, 2).map((x) => x[0]).join('').toUpperCase()
  const spec = { w: 240, h: 180, from, to, label: initials, labelSize: 44 }
  write(w.thumbnail, svg(spec))
  writeDithered(w.thumbnail, spec)
  n++
}
for (const item of LIBRARY) {
  if (!isPlaceholder(item.cover)) continue
  if (item.kind === 'book') {
    const to = item.spineColor ?? '#444'
    const from = (item.spineColor ?? '#444') + 'cc'
    write(item.cover, svg({ w: 260, h: 340, from, to, ink: item.spineInk ?? '#fff', label: item.title, labelSize: 22 }))
  } else if (item.kind === 'album') {
    const [from, to] = pair(item.title)
    write(item.cover, svg({ w: 320, h: 320, from, to, label: item.title, sub: item.creator, labelSize: 26 }))
  } else {
    const [from, to] = pair(item.title)
    write(item.cover, svg({ w: 260, h: 380, from, to, label: item.title, sub: item.creator, labelSize: 22 }))
  }
  n++
}
for (const b of BAG) {
  if (!isPlaceholder(b.image)) continue
  const [from, to] = pair(b.name)
  write(b.image, objectSvg(b.name, from, to))
  n++
}
for (const ph of PHOTOS) {
  if (!isPlaceholder(ph.src)) continue
  const [from, to] = pair(ph.caption)
  const spec = { w: 400, h: ph.tall ? 560 : 400, from, to }
  write(ph.src, svg(spec))
  writeDithered(ph.src, spec)
  n++
}
if (isPlaceholder(ABOUT.portrait)) {
  write(ABOUT.portrait, svg({ w: 480, h: 560, from: '#d6b3b0', to: '#40465e', label: 'NP', labelSize: 64 }))
  n++
}

console.log(`wrote ${n} placeholder images to public/img`)
