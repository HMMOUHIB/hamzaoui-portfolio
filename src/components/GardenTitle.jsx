import { useEffect, useRef } from 'react'
import { plant } from '../animations/garden'
import { useReducedMotion } from '../hooks/useMediaQuery'
import SplitText from './SplitText'
import '../styles/garden.css'

// One garden per title: same engine, different seed, flowers, colours and temper.
export const GARDENS = {
  // Abril Fatface · red roses on ink
  hello:     { seed: 11, flowers: ['rose'], flower: '#e0182d', stem: '#111111', leaf: '#1b1b1b', roseP: 0.55, dens: 1.1, reach: 0.9, big: 0.9 },
  // Fraunces · cream daisies on cobalt
  education: { seed: 23, flowers: ['daisy'], flower: '#fff6e0', core: '#ffb703', stem: '#1c2b8f', leaf: '#2547c4', roseP: 0.4, leafy: 0.8, dens: 0.6, bridgeP: 0.3, reach: 1.2, big: 1.15, stagger: 90 },
  // Shrikhand · magenta tulips on plum
  mind:      { seed: 37, flowers: ['tulip'], flower: '#d11fd0', stem: '#4a1d6b', leaf: '#6b2a9a', roseP: 0.3, curvy: 1.5, bridgeP: 0.95, reach: 0.8, stagger: 180 },
  // Bagel Fat One · sunflowers on forest green
  arsenal:   { seed: 41, flowers: ['sunflower'], flower: '#ffc107', core: '#6b3f12', stem: '#14532d', leaf: '#1f7a3f', roseP: 0.35, dens: 1.2, reach: 0.7, big: 1.1, stagger: 110 },
  // Rozha One · orange poppies on olive
  work:      { seed: 53, flowers: ['poppy'], flower: '#ff5a1f', core: '#1a1a1a', stem: '#3b4a12', leaf: '#56701c', roseP: 0.85, dens: 0.65, big: 1.1, reach: 0.65, bridgeP: 0.4, stagger: 220 },
  // Gloock · pink lotus on teal
  evolution: { seed: 67, flowers: ['lotus'], flower: '#ff5c9e', core: '#ffd23f', stem: '#0f766e', leaf: '#14917f', roseP: 0.3, leafy: 2, reach: 1, curvy: 0.8, stagger: 100 },
  // Cormorant Garamond italic · cherry blossom on indigo
  nextworld: { seed: 71, flowers: ['blossom'], flower: '#ff9ac6', core: '#ff3d81', stem: '#2b1d6e', leaf: '#4630a8', roseP: 0.5, dens: 1.4, reach: 1.05, lean: 0.4, bridgeP: 0.8, stagger: 70, speed: 1.15 },
  // the 3-second opener's H and M: big crimson roses, grown fast
  intro:     { seed: 29, flowers: ['rose'], flower: '#e0182d', stem: '#111111', leaf: '#1b1b1b', roseP: 0.78, dens: 1.35, leafy: 1.5, reach: 1.0, big: 1.2, bridgeP: 0.85, behind: true, stagger: 90, speed: 1.75, delay: 0 },
  // Playfair Display italic · blue dahlias on navy: the "Full-Stack Developer / Cloud" line in the hero
  role:      { seed: 83, flowers: ['dahlia'], flower: '#58a6ff', core: '#ffd23f', stem: '#0b3a6b', leaf: '#1763a8', roseP: 0.4, leafy: 0.5, dens: 0.55, big: 3, reach: 1.45, bridgeP: 0.15, every: 4, behind: true, stagger: 80, delay: 1100 },
}

// A heading whose letters grow stems, leaves and flowers. The real text stays in the DOM; two canvases sit under
// and over it so stems can weave in front of and behind the letters.
export default function GardenTitle({ as: Tag = 'h2', text, garden, className = '', ...rest }) {
  const host = useRef(null)
  const back = useRef(null)
  const front = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => plant(host.current, back.current, front.current, GARDENS[garden], reduced), [garden, text, reduced])

  return (
    <Tag className={`garden garden--${garden} display ${className}`} ref={host} {...rest}>
      <canvas className="garden__cv garden__cv--back" ref={back} aria-hidden="true" />
      <SplitText text={text} className="display" />
      <canvas className="garden__cv garden__cv--front" ref={front} aria-hidden="true" />
    </Tag>
  )
}
