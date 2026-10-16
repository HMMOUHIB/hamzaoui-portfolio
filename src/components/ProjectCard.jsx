import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import drawCard from './cardArt'
import HoloCard from './HoloCard'
import IconBox from './IconBox'

const TILTS = [-4, 3, -2.5]

// A project as a holo trading card (tilt, foil and glare follow the cursor), with its notes typed underneath.
export default function ProjectCard({ project, index }) {
  const root = useRef(null)
  const tilt = TILTS[index % TILTS.length]
  const [face, setFace] = useState()

  useEffect(() => {
    let alive = true
    drawCard(project).then((url) => alive && setFace(url))
    return () => { alive = false }
  }, [project])

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 80%', once: true } })
        .fromTo(q('.holo-card'), { autoAlpha: 0, y: -50, rotate: tilt * 3 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 1, ease: 'back.out(1.4)' })
        .fromTo(q('.work__detail'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.6 }, 0.35)
    })
  }, { scope: root })

  return (
    <article className="work__item" ref={root} aria-labelledby={`${project.id}-title`}>
      <a className="work__shot" href={project.url} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">
        <HoloCard image={face} alt={`${project.name} project card`} style={{ '--hc-w': 'min(100%, 340px)' }} />
      </a>

      <div className="work__info">
        <p className="work__num work__detail">Project {project.num}</p>
        <h3 className="work__title display work__detail" id={`${project.id}-title`}>{project.name}</h3>
        <p className="work__role work__detail">{project.role}</p>
        {project.stack.length > 0 && (
          <ul className="work__stack work__detail" aria-label="Stack">
            {project.stack.map((t, k) => (
              <li key={t}><IconBox name={t} size="xs" i={k} />{t}</li>
            ))}
          </ul>
        )}
        <p className="work__summary work__detail">{project.summary}</p>
        {project.points.length > 0 && (
          <ul className="work__points work__detail">
            {project.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        )}
        <a className="work__cta work__detail" href={project.url} target="_blank" rel="noreferrer">
          {project.cta} <span aria-hidden="true">→</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </article>
  )
}
