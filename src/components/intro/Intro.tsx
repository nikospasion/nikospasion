import { useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import type { MotionValue } from 'motion/react'
import { CONTACT, INTRO, INTRO_IMAGES, PROFILE } from '../../lib/content'
import { IconArrow } from '../ui/Icons'
import { PageLink } from '../ui/PageLink'
import { FlyingCursors } from '../../lib/flyingCursors'

const REVEAL_SPREAD = 4

/** Andrew + David — the two friends' cursors, in the site's own inks. */
const FRIEND_CURSORS = [
  { name: 'Andrew', color: '#d44b2c' },
  { name: 'David', color: '#223488' },
]

type Unit =
  | { kind: 'word'; text: string; em: boolean }
  | { kind: 'img'; name: string; suffix?: string }
  | { kind: 'link'; text: string; href: string; suffix?: string }
  | { kind: 'friends'; text: string; suffix?: string }

/**
 * Inline markup: `*em*` accent runs, `{img:name}` chips (INTRO_IMAGES),
 * `[text](url)` underlined links with a trailing arrow, `~text~` the
 * flying-cursors phrase. Every unit takes one slot in the karaoke reveal.
 */
function parseIntro(paragraph: string): Unit[] {
  const units: Unit[] = []
  const TOKEN = /\{img:([a-z-]+)\}|\[([^\]]+)\]\(([^)]+)\)|~([^~]+)~/g

  let last = 0
  let em = false

  const pushWords = (segment: string) => {
    for (let token of segment.split(' ')) {
      if (!token) continue
      if (token.startsWith('*')) {
        em = true
        token = token.slice(1)
      }
      const trailing = token.match(/^(.*?)\*([.,!?]*)$/)
      let endsEm = false
      if (trailing) {
        token = trailing[1] + trailing[2]
        endsEm = true
      }
      if (token) units.push({ kind: 'word', text: token, em })
      if (endsEm) em = false
    }
  }

  for (const match of paragraph.matchAll(TOKEN)) {
    pushWords(paragraph.slice(last, match.index))
    last = match.index + match[0].length
    // Attach punctuation that immediately follows a token, so it hugs the
    // element instead of floating as its own space-separated word.
    const punct = paragraph.slice(last).match(/^[.,!?;:]+/)
    const suffix = punct ? punct[0] : undefined
    if (punct) last += punct[0].length
    if (match[1]) units.push({ kind: 'img', name: match[1], suffix })
    else if (match[2]) units.push({ kind: 'link', text: match[2], href: match[3], suffix })
    else if (match[4]) units.push({ kind: 'friends', text: match[4], suffix })
  }
  pushWords(paragraph.slice(last))
  return units
}

interface IntroProps {
  go: (path: string) => void
}

/** Top block: name + role, then a bio that lights up word-by-word on scroll. */
export function Intro({ go }: IntroProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const paragraphs = useMemo(() => INTRO.map(parseIntro), [])

  return (
    <section className="intro col" id="about" aria-label="About">
      <p className="intro-eyebrow mono">
        {PROFILE.role} · {PROFILE.location}
      </p>

      <div ref={bodyRef}>
        {paragraphs.map((units, pIndex) => (
          <IntroParagraph
            key={pIndex}
            units={units}
            reduced={reduced ?? false}
            bodyRef={bodyRef}
          />
        ))}
      </div>

      <p className="intro-links">
        get to know more <PageLink className="pill-link" to="/about" go={go}>about me</PageLink>,
        read my <PageLink className="pill-link" to="/writing" go={go}>writings</PageLink>, browse my{' '}
        <PageLink className="pill-link" to="/projects" go={go}>projects</PageLink>, see what i've consumed on{' '}
        <PageLink className="pill-link" to="/library" go={go}>my library</PageLink>, or say hi at{' '}
        <a className="pill-link" href={`mailto:${CONTACT.email}`}>nikos@descent.dev</a>.
      </p>
    </section>
  )
}

interface IntroParagraphProps {
  units: Unit[]
  reduced: boolean
  bodyRef: React.RefObject<HTMLDivElement | null>
}

/**
 * One virtual "reading line" at ~62% of the viewport: each paragraph's
 * progress is how far that line has swept through IT (the narrow band makes
 * the offset behave like a single line, not a zone). Guarantees strict
 * top-to-bottom order — a paragraph can't start lighting until the line has
 * finished sweeping the one above — and makes the load state deterministic:
 * everything above the line lit, everything below dim.
 */
function IntroParagraph({ units, reduced, bodyRef }: IntroParagraphProps) {
  const pRef = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: pRef,
    offset: ['start 0.59', 'end 0.59'],
  })
  const total = units.length

  return (
    <p className="intro-statement" ref={pRef}>
      {units.map((unit, uIndex) => (
        <KaraokeUnit
          key={uIndex}
          unit={unit}
          index={uIndex}
          total={total}
          progress={scrollYProgress}
          reduced={reduced}
          bodyRef={bodyRef}
        />
      ))}
    </p>
  )
}

interface KaraokeUnitProps {
  unit: Unit
  index: number
  total: number
  progress: MotionValue<number>
  reduced: boolean
  bodyRef: React.RefObject<HTMLDivElement | null>
}

function KaraokeUnit({ unit, index, total, progress, reduced, bodyRef }: KaraokeUnitProps) {
  const start = index / total
  const end = Math.min((index + REVEAL_SPREAD) / total, 1)
  const opacity = useTransform(progress, [start, end], [0.14, 1])
  const style = reduced ? undefined : { opacity }

  if (unit.kind === 'img') {
    const img = INTRO_IMAGES[unit.name]
    if (!img) return null
    return (
      <>
        <motion.span className="intro-chip-wrap" style={style}>
          {img.kind === 'scribble' ? (
            <img className="intro-scribble" src={img.src} alt="" aria-hidden="true" />
          ) : (
            <span className="chip-hover">
              {img.label ? (
                <span className="chip-tip" aria-hidden="true">
                  {img.label}
                </span>
              ) : null}
              <span className="chip-stack">
                <img className="intro-chip" src={img.src} alt={img.label ?? ''} />
              </span>
            </span>
          )}
        </motion.span>
        {unit.suffix ? <motion.span style={style}>{unit.suffix}</motion.span> : null}{' '}
      </>
    )
  }

  if (unit.kind === 'link') {
    return (
      <>
        <motion.a
          className="intro-link"
          href={unit.href}
          target="_blank"
          rel="noopener noreferrer"
          style={style}
        >
          {unit.text}
          <IconArrow className="intro-link-arrow" />
        </motion.a>
        {unit.suffix ? <motion.span style={style}>{unit.suffix}</motion.span> : null}{' '}
      </>
    )
  }

  if (unit.kind === 'friends') {
    return (
      <>
        <FriendsWord
          text={unit.text}
          threshold={start}
          progress={progress}
          reduced={reduced}
          style={style}
          bodyRef={bodyRef}
        />
        {unit.suffix ? <motion.span style={style}>{unit.suffix}</motion.span> : null}{' '}
      </>
    )
  }

  return (
    <>
      <motion.span className={unit.em ? 'grad-text' : undefined} style={style}>
        {unit.text}
      </motion.span>{' '}
    </>
  )
}

interface FriendsWordProps {
  text: string
  threshold: number
  progress: MotionValue<number>
  reduced: boolean
  style?: { opacity: MotionValue<number> }
  bodyRef: React.RefObject<HTMLDivElement | null>
}

/**
 * "two friends" — plain gradient text, with Andrew's and David's cursors
 * drifting around it once the karaoke reveal reaches the phrase (and only
 * while it's on screen). The cursor field never intercepts the pointer;
 * scatter listens on the whole intro body instead.
 */
function FriendsWord({ text, threshold, progress, reduced, style, bodyRef }: FriendsWordProps) {
  const fieldRef = useRef<HTMLSpanElement>(null)
  const engineRef = useRef<FlyingCursors | null>(null)
  const [near, setNear] = useState(false)
  const [inView, setInView] = useState(false)

  useMotionValueEvent(progress, 'change', (v) => {
    setNear(v >= Math.max(0, threshold - 0.08))
  })

  useEffect(() => {
    const el = fieldRef.current
    if (!el || reduced) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const active = near && inView && !reduced

  useEffect(() => {
    if (!active) {
      engineRef.current?.stop()
      return
    }
    const field = fieldRef.current
    const listen = bodyRef.current
    if (!field) return
    if (!engineRef.current) {
      engineRef.current = new FlyingCursors(field, FRIEND_CURSORS, listen ?? field)
    }
    engineRef.current.start()
    return () => engineRef.current?.stop()
  }, [active, bodyRef])

  useEffect(() => {
    return () => {
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [])

  return (
    <motion.span className="cursor-word" style={style}>
      <span className="cursor-word-field" ref={fieldRef} data-active={active} aria-hidden="true" />
      <span className="grad-text">{text}</span>
    </motion.span>
  )
}
