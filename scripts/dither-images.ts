/* Bakes the site's Bayer-dither treatment into real images (the same trick
   gen-placeholders.ts plays on analytic gradients): for every raster image
   under /public/img that isn't itself a dither artifact, resize the original
   to a sane web size in place, then write 2-color indexed
   `<name>.dither-light.png` / `<name>.dither-dark.png` siblings that
   DitherImage swaps for the crisp file on hover.

   Run: `bun run scripts/dither-images.ts` */

import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import sharp from 'sharp'

const IMG_ROOT = join(import.meta.dir, '..', 'public', 'img')

/** Longest edge for the crisp asset — originals get resized down in place. */
const MAX_EDGE = 1600
/** Source pixels per dither cell (rendered pixelated, so cells read chunky). */
const CELL = 3
/** Cap the dithered raster so thumbnails stay a few KB. */
const MAX_DITHER_W = 480

/* Must match --dither-back / --dither-front in src/styles/tokens.css */
const DITHER_PALETTES = {
  light: { back: [243, 238, 231], front: [35, 35, 35] },
  dark: { back: [22, 23, 24], front: [234, 225, 210] },
} as const

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/* ---- minimal indexed-PNG encoder (same as gen-placeholders.ts) ---- */

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

function encodeIndexedPng(
  width: number,
  height: number,
  pixels: Uint8Array,
  palette: readonly (readonly number[])[],
): Uint8Array {
  const ihdr = new Uint8Array(13)
  ihdr.set(u32(width))
  ihdr.set(u32(height), 4)
  ihdr[8] = 8
  ihdr[9] = 3
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

/* ---- pipeline ---- */

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name)
    if (statSync(abs).isDirectory()) walk(abs, out)
    else out.push(abs)
  }
  return out
}

const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp'])

async function process(abs: string) {
  const meta = await sharp(abs).metadata()
  const w = meta.width ?? 0
  const h = meta.height ?? 0
  if (!w || !h) return

  // 1. Resize the crisp original in place if it's oversized.
  if (Math.max(w, h) > MAX_EDGE) {
    const buf = await sharp(abs)
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside' })
      .toBuffer()
    writeFileSync(abs, buf)
  }

  // 2. Bake the two dither variants from a grayscale downsample.
  const dw = Math.min(MAX_DITHER_W, Math.round(Math.min(w, MAX_EDGE) / CELL))
  const { data, info } = await sharp(abs)
    .resize({ width: dw })
    .grayscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const dh = info.height
  const pixels = new Uint8Array(dw * dh)
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const lum = data[(y * dw + x) * info.channels] / 255
      const threshold = (BAYER[y % 4][x % 4] + 0.5) / 16
      // dark pixels → front color (index 1)
      pixels[y * dw + x] = lum < threshold ? 1 : 0
    }
  }

  const base = abs.slice(0, -extname(abs).length)
  for (const [mode, pal] of Object.entries(DITHER_PALETTES)) {
    writeFileSync(`${base}.dither-${mode}.png`, encodeIndexedPng(dw, dh, pixels, [pal.back, pal.front]))
  }
}

const files = walk(IMG_ROOT).filter(
  (f) => RASTER.has(extname(f).toLowerCase()) && !/\.dither-(light|dark)\.png$/.test(f),
)

for (const f of files) {
  await process(f)
  console.log(`dithered ${f.replace(IMG_ROOT, 'img')}`)
}
console.log(`processed ${files.length} images`)
