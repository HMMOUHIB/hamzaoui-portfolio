import { useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { liftIn } from '../animations/textAnimations'
import { identity } from '../data/identity'
import { ribbons } from '../data/ribbons'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { story } from '../data/story'
import { experience } from '../data/timeline'
import GardenTitle from './GardenTitle'
import PokeBall from './PokeBall'
import Ribbon from './Ribbon'
import Timeline from './Timeline'
import WorkLog from './WorkLog'
import { SelectionBox } from './Zine'
import cardLoop from '../assets/zine/card-loop.webp'
import cardStill from '../assets/zine/card-still.webp'
import '../styles/about.css'

const SKILLS = ['React.js', 'Symfony', 'Spring Boot', 'MySQL', 'Linux', 'AWS']
const EDUCATION = [story[0].facts[0], story[2].facts[0]]

/**
 * The HELLO row (after mainref.mp4): the figure in a selection box swapping poses behind a white flash,
 * the introduction and education, then skills and experience. The torn band with the sticker follows it.
 */
export default function About() {
  const root = useRef(null)
  const reduced = useReducedMotion()

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      liftIn(q('.hello__col'), { scrollTrigger: { trigger: q('.hello')[0], start: 'top 80%', once: true } })
    })
  }, { scope: root })

  return (
    <section id="origin" className="origin" ref={root} aria-labelledby="origin-title">
      <div className="hello">
        <div className="hello__col hello__col--fig">
          <SelectionBox className="hello__fig">
            <img className="hello__pose hello__card" src={reduced ? cardStill : cardLoop} alt="An ace of spades that keeps redrawing itself in a new style" loading="lazy" decoding="async" draggable="false" />
          </SelectionBox>
        </div>

        <div className="hello__col">
          <GardenTitle as="h2" className="hello__title" id="origin-title" text="Hello" garden="hello" />
          <p className="hello__hi">Hi, I&apos;m {identity.firstName} {identity.lastName}.</p>
          <p>{identity.statement.join(' ')}</p>
          <p>{story.map((s) => s.tale).join(' ')}</p>
          <p>Right now I&apos;m in the 4th year of the engineering cycle at TEK-UP, heading for Cloud &amp; Infrastructure Engineering.</p>

          <GardenTitle as="h3" className="hello__head" text="Education" garden="education" />
          <ul className="hello__list">
            {EDUCATION.map((e) => (
              <li key={e.title}>
                <strong>{e.title}</strong>
                <span>{e.org} | {e.when}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hello__col">
          <h3 className="hello__head display">Skills</h3>
          <ul className="hello__skills">
            {SKILLS.map((s, i) => (
              <li key={s} title={s}><PokeBall name={s} i={i} /><span className="sr-only">{s}</span></li>
            ))}
          </ul>

          <h3 className="hello__head display">Experience</h3>
          <ul className="hello__list">
            {experience.map((x) => (
              <li key={x.role}>
                <b>{x.period}</b>
                <strong>{x.role}</strong>
                <span>{x.org}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Ribbon items={ribbons.afterHello} sticker />

      <WorkLog />
      <Timeline />
    </section>
  )
}
