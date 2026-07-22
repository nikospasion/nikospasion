import { useState } from 'react'

interface DitherImageProps {
  src: string
  alt: string
  className?: string
}

function ditherSrc(src: string, mode: 'light' | 'dark'): string {
  return src.replace(/\.(svg|png|jpg|jpeg|webp)$/i, `.dither-${mode}.png`)
}

/**
 * Idle = a pre-dithered bitmap baked at build time (no runtime shaders,
 * no WebGL, no scroll cost); hover/focus of an ancestor `.reveal`
 * cross-fades to the crisp image. Theme variants swap via CSS.
 * If the dither asset is missing (e.g. a freshly swapped real image before
 * re-running scripts/gen-placeholders.ts), the crisp image shows instead.
 */
export function DitherImage({ src, alt, className }: DitherImageProps) {
  const [missing, setMissing] = useState(false)

  return (
    <span
      className={`dither${missing ? ' dither-missing' : ''}${className ? ` ${className}` : ''}`}
    >
      {missing ? null : (
        <>
          <img
            className="dither-shader dither-static dither-static-light"
            src={ditherSrc(src, 'light')}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={() => setMissing(true)}
          />
          <img
            className="dither-shader dither-static dither-static-dark"
            src={ditherSrc(src, 'dark')}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
        </>
      )}
      <img className="dither-crisp" src={src} alt={alt} loading="lazy" decoding="async" />
    </span>
  )
}
