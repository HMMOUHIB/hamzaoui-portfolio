import { lazy, Suspense, useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { evolutionPath } from '../data/skills'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useNearViewport } from '../hooks/useInView'
import ChapterIntro from './ChapterIntro'
import IconBox from './IconBox'
import NetworkFallback from './NetworkFallback'
import Transformation from './Transformation'
import '../styles/evolution.css'

const NetworkScene = lazy(() => import('./NetworkScene'))

export default function Evolution() {
  const root = useRef(null)
  const path = useRef(null)
  const progressRef = useRef(0)
  const reduced = useReducedMotion()
  const near = useNearViewport(path, '600px')
  // the capsule shows on every screen; reduced motion just holds it still
  const useWebGL = near

  useGSAP(() => {
    const steps = gsap.utils.toArray('.evo__step', path.current)
    const fill = path.current.querySelector('.evo__line-fill')
    if (reduced) {
      steps.forEach((s) => s.classList.add('is-lit'))
      gsap.set(fill, { scaleY: 1 })
      progressRef.current = 1
      return
    }
    let last = -1
    gsap.to(fill, {
      scaleY: 1, ease: 'none',
      scrollTrigger: {
        trigger: path.current, start: 'top 65%', end: 'bottom 55%', scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress
          const idx = Math.floor(self.progress * (steps.length - 0.001))
          if (idx === last) return
          last = idx
          steps.forEach((s, i) => s.classList.toggle('is-lit', i <= idx))
        },
      },
    })
  }, { scope: root, dependencies: [reduced] })

  return (
    <section id="evolution" className="evo" ref={root} aria-labelledby="evolution-title">
      <Transformation />

      <ChapterIntro
        id="evolution-title"
        num="05"
        garden="evolution"
        title="Evolution"
        lead={['Interfaces taught me how users think.', 'Systems are teaching me how everything works.']}
      />

      <div className="evo__body">
        <div className="evo__path" ref={path}>
          <span className="evo__line" aria-hidden="true"><span className="evo__line-fill" /></span>
          <ol className="evo__steps" aria-label="Progression">
          {evolutionPath.map((s, i) => (
            <li className={`evo__step ${i === evolutionPath.length - 1 ? 'evo__step--goal' : ''}`} key={s}>
              <span className="evo__dot" aria-hidden="true" />
              <span className="evo__idx">{String(i + 1).padStart(2, '0')}</span>
              <IconBox name={s} size="md" i={i} className="evo__ibox" />
              <span className="evo__name">{s}</span>
              {i === evolutionPath.length - 1 && <span className="evo__tag">Destination</span>}
            </li>
          ))}
          </ol>
        </div>

        <div className="evo__viz">
          <div className="evo__viz-frame">
            {useWebGL ? (
              <Suspense fallback={<NetworkFallback />}>
                <NetworkScene progressRef={progressRef} still={reduced} />
              </Suspense>
            ) : (
              <NetworkFallback />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
