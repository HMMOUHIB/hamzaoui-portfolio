import { useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { certificationPath } from '../data/skills'
import { useReducedMotion } from '../hooks/useMediaQuery'
import ChapterIntro from './ChapterIntro'
import IconBox from './IconBox'
import { Polaroid } from './Zine'
import eclipseSrc from '../assets/bleach/eclipse.webp'
import '../styles/nextworld.css'

// The route ahead, drawn as an ascent. Targets, clearly marked as targets.
export default function NextWorld() {
  const root = useRef(null)
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (reduced) return
    gsap.fromTo('.nw__step', { autoAlpha: 0, x: -40 }, {
      autoAlpha: 1, x: 0, stagger: 0.12, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.nw__route', start: 'top 75%', once: true },
    })
  }, { scope: root, dependencies: [reduced] })

  return (
    <section id="next" className="nw" ref={root} aria-labelledby="next-title">
      <Polaroid className="nw__print" tilt={-6} tape caption="the next world">
        <img src={eclipseSrc} alt="" loading="lazy" decoding="async" />
      </Polaroid>
      <ChapterIntro
        id="next-title"
        num="06"
        garden="nextworld"
        title="The next world"
        lead={['Targets, not trophies.', 'The path I am walking toward the cloud.']}
      />

      <p className="nw__disclaimer">
        None of these certifications are held yet. This is the route, in order.
      </p>

      <ol className="nw__route">
        {certificationPath.map((c, i) => (
          <li className="nw__step ibox-host" key={c.name} style={{ '--i': i }}>
            <span className="nw__idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <IconBox name={c.name} size="md" i={i} />
            <span className="nw__name">{c.name}</span>
            <span className="nw__kind">{c.kind}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
