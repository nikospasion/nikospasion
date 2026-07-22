import type { ReactNode } from 'react'

interface SectionHeaderProps {
  num: string
  label: string
  meta?: ReactNode
}

/** Numbered header framed by two full-bleed rules: `03 ▨ ON ROTATION  meta`. */
export function SectionHeader({ num, label, meta }: SectionHeaderProps) {
  return (
    <div className="section-head">
      <span className="section-hr section-hr-top" aria-hidden="true" />
      <span className="section-hr section-hr-bottom" aria-hidden="true" />
      <span className="section-num mono">{num}</span>
      <span className="section-mark" aria-hidden="true" />
      <h2 className="section-title mono">{label}</h2>
      {meta ? <span className="section-meta mono">{meta}</span> : null}
    </div>
  )
}
