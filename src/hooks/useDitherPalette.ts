import { useEffect, useState } from 'react'

export interface DitherPalette {
  front: string
  back: string
}

function read(): DitherPalette {
  if (typeof window === 'undefined') return { front: 'rgb(24,24,24)', back: 'rgb(246,246,245)' }
  const cs = getComputedStyle(document.documentElement)
  const front = cs.getPropertyValue('--dither-front').trim() || '24,24,24'
  const back = cs.getPropertyValue('--dither-back').trim() || '246,246,245'
  return { front: `rgb(${front})`, back: `rgb(${back})` }
}

/** Two-tone dither palette from CSS tokens; re-reads when the theme flips. */
export function useDitherPalette(): DitherPalette {
  const [pal, setPal] = useState(read)
  useEffect(() => {
    const update = () => setPal(read())
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', update)
    return () => {
      mo.disconnect()
      mq.removeEventListener('change', update)
    }
  }, [])
  return pal
}
