import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Typer } from '../../lib/typer'

interface TaglineCyclerProps {
  words: string[]
  className?: string
}

const FPS = 24
const AUTO_ADVANCE_MS = 5000

function durationMs(word: string): number {
  const frames = FPS * (1 + word.length * 0.01)
  return (frames / FPS) * 1000 + 80
}

/**
 * A single word that ripples through pill/border states (lib/typer.ts),
 * auto-advancing to the next word every 5s (looping back to the start).
 * Clicking jumps ahead early and resets the 5s countdown from there. The
 * Typer engine owns this element's DOM once mounted, so React is given the
 * same static children on every render (safe: React diffs against its own
 * last render, not the live DOM) and only re-renders for the aria-label.
 * Falls back to a plain clickable word swap under reduced motion.
 */
export function TaglineCycler({ words, className }: TaglineCyclerProps) {
  const reduced = useReducedMotion()
  const hostRef = useRef<HTMLButtonElement>(null)
  const typerRef = useRef<Typer | null>(null)
  const indexRef = useRef(0)
  const [index, setIndex] = useState(0)
  const busyRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced || !hostRef.current) return
    typerRef.current = new Typer(hostRef.current, {
      fps: FPS,
      cycles: 2,
      cycleLength: 0.55,
      // starts invisible (data-typer-type="initial") and plays the ripple-in
      // below, instead of skipping straight to the settled word.
      initVisible: false,
    })
    // Let the boot sequence's own hero-tagline fade/slide land first
    // (see useBoot.ts — the tagline rises in around ~0.55–0.75s), then run
    // the ripple-in so the two reveals read as one deliberate sequence.
    const reveal = window.setTimeout(() => typerRef.current?.in(), 650)
    return () => {
      window.clearTimeout(reveal)
      typerRef.current?.destroy()
      typerRef.current = null
    }
  }, [reduced])

  const advance = () => {
    if (busyRef.current) return
    const next = (indexRef.current + 1) % words.length
    indexRef.current = next
    setIndex(next)
    if (reduced || !typerRef.current) return
    busyRef.current = true
    typerRef.current.reset(words[next])
    typerRef.current.in()
    window.setTimeout(() => {
      busyRef.current = false
    }, durationMs(words[next]))
  }

  // `advanceRef` always points at the latest `advance` closure, so the one
  // long-lived interval below never goes stale.
  const advanceRef = useRef(advance)
  advanceRef.current = advance

  // Auto-advance every 5s, looping.
  useEffect(() => {
    timerRef.current = window.setInterval(() => advanceRef.current(), AUTO_ADVANCE_MS)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const handleClick = () => {
    advance()
    // Jumping early resets the countdown, so it doesn't double-advance soon after.
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => advanceRef.current(), AUTO_ADVANCE_MS)
  }

  return (
    <button
      type="button"
      ref={hostRef}
      className={className ? `tagline-word ${className}` : 'tagline-word'}
      data-typer
      data-typer-type="initial"
      onClick={handleClick}
      aria-label={`Click to cycle — currently ${words[index]}`}
    >
      {reduced ? words[index] : words[0]}
    </button>
  )
}
