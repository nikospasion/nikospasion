import {
  IconHome,
  IconUser,
  IconWriting,
  IconProjects,
  IconLibrary,
  IconPhotos,
  IconX,
  IconInstagram,
  IconGithub,
  IconLinkedin,
} from '../ui/Icons'
import { CONTACT } from '../../lib/content'

export interface NavItem {
  path: string
  label: string
  Icon: (p: { className?: string }) => React.ReactNode
}

/** Sidebar navigation — each item is a page. */
export const NAV: NavItem[] = [
  { path: '/', label: 'Home', Icon: IconHome },
  { path: '/about', label: 'About', Icon: IconUser },
  { path: '/writing', label: 'Writing', Icon: IconWriting },
  { path: '/projects', label: 'Projects', Icon: IconProjects },
  { path: '/library', label: 'Library', Icon: IconLibrary },
  { path: '/photos', label: 'Photos', Icon: IconPhotos },
]

export interface SocialItem {
  label: string
  href: string
  Icon: (p: { className?: string }) => React.ReactNode
}

export const SOCIAL: SocialItem[] = [
  { label: 'X', href: CONTACT.x, Icon: IconX },
  { label: 'Instagram', href: CONTACT.instagram, Icon: IconInstagram },
  { label: 'GitHub', href: CONTACT.github, Icon: IconGithub },
  { label: 'LinkedIn', href: CONTACT.linkedin, Icon: IconLinkedin },
]
