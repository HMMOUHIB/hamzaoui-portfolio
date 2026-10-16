import { useRef } from 'react'
import { useGSAP } from '../animations/gsap'
import { chapterReveal } from '../animations/scrollAnimations'
import { useReducedMotion } from '../hooks/useMediaQuery'
import GardenTitle from './GardenTitle'
import { Lines } from './SplitText'
import { Dingbats } from './Zine'
import '../styles/chapter.css'

// Centred chapter header in the zine voice: small kicker, extended black title (it grows its own garden), the dingbat row, the lead.
export default function ChapterIntro({ num, title, lead, id, garden }) {
  const root = useRef(null)
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (!reduced) chapterReveal(root.current)
  }, { scope: root, dependencies: [reduced] })

  return (
    <header className="chapter" ref={root}>
      <p className="chapter__num">Chapter {num}</p>
      <GardenTitle as="h2" className="chapter__title" id={id} text={title} garden={garden} />
      <Dingbats className="chapter__dingbats" />
      {lead && (
        <p className="chapter__lead">
          <Lines lines={lead} />
        </p>
      )}
    </header>
  )
}
