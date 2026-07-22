import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface SheetProps {
  titleId: string
  crumb: string
  onClose: () => void
  children: ReactNode
}

const FOCUSABLE = 'button, a[href], [tabindex]:not([tabindex="-1"])'

/**
 * A page presented as a sheet: slides up over the receding home surface,
 * iOS-style, leaving a strip of it visible at the top. Owns dialog
 * semantics, Escape, focus trapping, and the grab handle.
 */
export function Sheet({ titleId, crumb, onClose, children }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !sheetRef.current) return
      const focusables = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <motion.div
      className="project-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      ref={sheetRef}
      data-lenis-prevent
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="sheet-handle" aria-hidden="true" />
      <div className="col sheet-col">
        <nav aria-label="Breadcrumb" className="crumb sheet-crumb">
          <button type="button" className="text-link crumb-name" onClick={onClose}>
            Nikos Pasion
          </button>
          <span className="crumb-sep" aria-hidden="true">
            —
          </span>
          <span className="muted">{crumb}</span>
          <button type="button" className="sheet-close mono" onClick={onClose} ref={closeRef}>
            esc ✕
          </button>
        </nav>
        {children}
      </div>
    </motion.div>
  )
}
