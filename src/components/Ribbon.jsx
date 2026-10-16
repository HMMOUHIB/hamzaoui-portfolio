import { useRef } from 'react'
import MarqueeModule from 'react-fast-marquee'
import { useNearViewport } from '../hooks/useInView'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { Dingbats, TornEdge } from './Zine'
import stickerSrc from '../assets/zine/sticker.webp'

// react-fast-marquee ships CommonJS; unwrap the default export when bundled.
const Marquee = MarqueeModule.default ?? MarqueeModule

/**
 * A torn black band with giant type running right to left, ✸ ✦ ♣ between the words. With `sticker`, the
 * red-outlined cut-out stands on the band in front of the type. Paused when off-screen.
 */
export default function Ribbon({ items, sticker = false }) {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const near = useNearViewport(root, '200px')

  return (
    <div className={`band ${sticker ? 'band--sticker' : ''}`} ref={root} aria-hidden="true">
      <TornEdge side="top" />
      <div className="band__body">
        <div className="band__row band__marquee">
          <Marquee autoFill speed={70} play={near && !reduced} gradient={false}>
            {items.map((w) => (
              <span className="band__item" key={w}>{w}<Dingbats /></span>
            ))}
          </Marquee>
        </div>
      </div>
      {sticker && <img className="band__sticker" src={stickerSrc} alt="" loading="lazy" decoding="async" draggable="false" />}
      <TornEdge side="bottom" />
    </div>
  )
}
