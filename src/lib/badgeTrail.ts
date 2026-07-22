// Badge trail — word + color source for BadgeTrailCard. Recolored from the
// original neon palette to a retro/analog set: a handful of curated,
// deliberately-chosen hues (not a full hue sweep) that read as stamped ink
// rather than screen-glow, with richness (not hue) reacting to cursor speed.

export const WORDS = [
  // Engineering
  'claude',
  'codex',
  'sprint',
  'api',
  'sprint',
  'git',
  'dev',
  'repo',
  // typography
  'kerning',
  'baseline',
  'tracking',
  'ligature',
  'glyph',
  'widow',
  'weight',
  'grid',
  // photography (film, XM5)
  'aperture',
  'exposure',
  'bokeh',
  'grain',
  'shutter',
  'fujifilm',
  // blueprint / the site's own vocabulary
  'blueprint',
  'dither',
  'halftone',
  'ascii',
  'vector',
  'parallax'
]

/** Curated retro swatches — vermilion + indigo (the site's own accents)
 * plus a handful of period-appropriate companions: mustard, teal, plum,
 * olive, steel blue, brick rose. Deliberately mid-saturation, not neon. */
export const PALETTE: Array<{ h: number; s: number; l: number }> = [
  { h: 14, s: 0.62, l: 0.7 }, // vermilion — site accent
  { h: 231, s: 0.5, l: 0.7 }, // indigo — site accent-2
  { h: 42, s: 0.6, l: 0.7 }, // mustard
  { h: 168, s: 0.42, l: 0.7 }, // teal
  { h: 285, s: 0.32, l: 0.7 }, // plum
  { h: 70, s: 0.38, l: 0.7 }, // olive
  { h: 210, s: 0.38, l: 0.7 }, // steel blue
  { h: 355, s: 0.4, l: 0.7 }, // brick rose
]

function hslHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const hex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

/** Fixed hex render of each palette entry — used for the static (reduced
 * motion / touch) fallback badges, so they don't depend on the walker. */
export const PALETTE_HEX = PALETTE.map((c) => hslHex(c.h, c.s, c.l))

/**
 * Steps through PALETTE in order (so adjacent badges always differ — no
 * hue-walking into muddy in-between colors), nudging richness — a touch
 * darker and more saturated — the faster the cursor is moving. Solid ink,
 * not a pastel wash, at any speed.
 */
export function makePaletteWalker(startIndex = 0) {
  let i = startIndex
  return (intensity = 1) => {
    i = (i + 1) % PALETTE.length
    const base = PALETTE[i]
    const t = Math.max(0, Math.min(1, intensity))
    const s = Math.min(1, base.s + 0.12 * t)
    const l = Math.max(0, base.l - 0.05 * t)
    return hslHex(base.h, s, l)
  }
}
