import { Hero } from '../components/hero/Hero'
import { Intro } from '../components/intro/Intro'
import { DescentTicket } from '../components/ticket/DescentTicket'
import { WritingList } from '../components/writing/WritingList'
import { ProjectList } from '../components/projects/ProjectList'
import { Records } from '../components/shelf/Records'
import { Books } from '../components/shelf/Books'
import { MUSIC } from '../lib/content'
import { BagMat } from '../components/bag/BagMat'
import { PhotosSection } from '../components/photos/Photos'

interface HomePageProps {
  onOpen: (path: string, trigger: HTMLElement) => void
  go: (path: string) => void
}

export function HomePage({ onOpen, go }: HomePageProps) {
  return (
    <>
      <Hero />
      <Intro go={go} />
      <DescentTicket />
      <WritingList onOpen={onOpen} go={go} />
      <ProjectList onOpen={onOpen} go={go} />
      {/* On Rotation stays hidden until albums land in LIBRARY again. */}
      {MUSIC.length > 0 ? <Records go={go} /> : null}
      <Books go={go} />
      <BagMat />
      <PhotosSection onOpen={onOpen} go={go} />
    </>
  )
}
