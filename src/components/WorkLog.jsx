import { useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import IconBox from './IconBox'
import { process, terminalSession } from '../data/timeline'
import { useReducedMotion } from '../hooks/useMediaQuery'
import '../styles/worklog.css'

export default function WorkLog() {
  const root = useRef(null)
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (reduced) return
    const q = gsap.utils.selector(root)


    const term = gsap.timeline({ paused: true })
    q('.term__line').forEach((line, i) => {
      const cmd = line.querySelector('.term__cmd')
      const out = line.querySelector('.term__out')
      const full = terminalSession[i].cmd
      const state = { n: 0 }
      cmd.textContent = ''
      gsap.set(line, { autoAlpha: 0 })
      if (out) gsap.set(out, { autoAlpha: 0 })
      term.set(line, { autoAlpha: 1 })
        .add(() => line.classList.add('is-typing'))
        .to(state, {
          n: full.length, duration: full.length * 0.028, ease: 'none',
          onUpdate: () => { cmd.textContent = full.slice(0, Math.round(state.n)) },
        })
        .add(() => line.classList.remove('is-typing'))
      if (out) term.to(out, { autoAlpha: 1, duration: 0.15 }, '+=0.15')
      term.to({}, { duration: 0.25 })
    })

    // Process — each icon draws itself, the red thread runs between them.
    const paths = q('.proc__icon path')
    paths.forEach((p) => {
      const len = p.getTotalLength?.() || 60
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
    })
    const proc = gsap.timeline({ paused: true })
    q('.proc__step').forEach((step, i) => {
      proc.to(step.querySelectorAll('path'), { strokeDashoffset: 0, duration: 0.7, stagger: 0.05, ease: 'power2.out' }, i * 0.3)
        .fromTo(step.querySelector('.proc__link'), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, i * 0.3 + 0.4)
        .fromTo(step.querySelectorAll('.proc__label, .proc__note'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05 }, i * 0.3 + 0.2)
    })

    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
      .add(() => { term.play(); proc.play() })
  }, { scope: root, dependencies: [reduced] })

  return (
    <div className="worklog" ref={root}>
      <div className="term">
        <div className="term__bar" aria-hidden="true">
          <i /><i /><i />
          <span>~/projects — zsh</span>
        </div>
        <ol className="term__body" aria-label="Example terminal session">
          {terminalSession.map((l) => (
            <li className="term__line" key={l.cmd}>
              <span className="term__prompt" aria-hidden="true">$</span>
              <span className="term__cmd">{l.cmd}</span>
              {l.out && <span className="term__out">{l.out}</span>}
            </li>
          ))}
        </ol>
      </div>

      <div className="proc">
        <p className="proc__title">The loop, every project</p>
        <ol className="proc__steps">
          {process.map((p, i) => {
            return (
              <li className="proc__step ibox-host" key={p.id}>
                <span className="proc__icon"><IconBox name={p.id} size="lg" i={i} /></span>
                <span className="proc__link" aria-hidden="true" />
                <span className="proc__idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="proc__label">{p.label}</span>
                <span className="proc__note">{p.note}</span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
