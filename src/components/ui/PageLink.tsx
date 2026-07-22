import type { ReactNode } from 'react'

interface PageLinkProps {
  to: string
  go: (path: string) => void
  className?: string
  children: ReactNode
}

/** An internal link that navigates client-side but keeps a real href. */
export function PageLink({ to, go, className, children }: PageLinkProps) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        event.preventDefault()
        go(to)
      }}
    >
      {children}
    </a>
  )
}
