/**
 * A chunky pixel wordmark rendered as SVG rects — the ticket-stamp look
 * (Departure-Mono style) built from the site's own dither-pixel language.
 * Crisp at any size, no extra font to load.
 */

const GLYPH_W = 5
const GLYPH_H = 7
const GLYPH_GAP = 1

/* prettier-ignore */
const PIXEL_FONT: Record<string, string[]> = {
  D: ['XXXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'XXXX.'],
  E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
  S: ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'],
  C: ['.XXXX', 'X....', 'X....', 'X....', 'X....', 'X....', '.XXXX'],
  N: ['X...X', 'XX..X', 'X.X.X', 'X.X.X', 'X..XX', 'X...X', 'X...X'],
  T: ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', '..X..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
}

interface PixelWordmarkProps {
  text: string
  className?: string
}

export function PixelWordmark({ text, className }: PixelWordmarkProps) {
  const letters = text.toUpperCase().split('')
  const width = letters.length * (GLYPH_W + GLYPH_GAP) - GLYPH_GAP

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${GLYPH_H}`}
      fill="currentColor"
      role="img"
      aria-label={text}
    >
      {letters.map((ch, li) => {
        const glyph = PIXEL_FONT[ch]
        if (!glyph) return null
        const ox = li * (GLYPH_W + GLYPH_GAP)
        return glyph.map((row, r) =>
          row.split('').map((cell, c) =>
            cell === 'X' ? (
              <rect
                key={`${li}-${r}-${c}`}
                x={ox + c + 0.04}
                y={r + 0.04}
                width={0.92}
                height={0.92}
              />
            ) : null,
          ),
        )
      })}
    </svg>
  )
}
