import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { riseChars } from '../animations/textAnimations'
import { identity } from '../data/identity'
import { useReducedMotion } from '../hooks/useMediaQuery'
import IconBox from './IconBox'
import SplitText from './SplitText'
import { Dingbats } from './Zine'
import kaguneVideo from '../assets/zine/kagune-4k.webm'
import kaguneStill from '../assets/zine/kagune-4k-poster.webp'
import meArt from '../assets/zine/me-4k.webp'
import '../styles/contact.css'

export default function Contact() {
  const root = useRef(null)
  const reduced = useReducedMotion()

  // the 4K burst (transparent VP9) only plays while the section is on screen
  const kagune = useRef(null)
  useEffect(() => {
    const v = kagune.current
    if (!v) return undefined
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.1 })
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])

  useGSAP(() => {
    if (reduced) return
    const q = gsap.utils.selector(root)
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 60%', once: true } })
      .fromTo(q('.contact__art'), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power3.out' })
      .add(riseChars(q('.contact__headline .char'), { stagger: 0.015 }), 0.2)
      .fromTo(q('.contact__reveal'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.8 }, 0.8)
  }, { scope: root, dependencies: [reduced] })

  return (
    <section id="contact" className="contact" ref={root} aria-labelledby="contact-title">
      {/* 3840×2160 artwork: me full-length, and the kagune burst (Rize removed, black keyed out) growing from behind my shoulder */}
      <div className="contact__art" aria-hidden="true">
        {reduced
          ? <img className="contact__kagune" src={kaguneStill} alt="" loading="lazy" decoding="async" draggable="false" />
          : <video className="contact__kagune" ref={kagune} src={kaguneVideo} poster={kaguneStill} muted loop playsInline preload="none" disablePictureInPicture />}
        <img className="contact__me" src={meArt} alt="" loading="lazy" decoding="async" draggable="false" />
      </div>

      <div className="contact__inner">
        <p className="contact__chapter">
          <span>Chapter 07</span> Contact <Dingbats />
        </p>
        <h2 className="contact__headline" id="contact-title">
          <SplitText text="Let's build something worth entering." className="display" />
        </h2>

        <div className="contact__id contact__reveal">
          <p className="contact__name">{identity.lastName} {identity.firstName}</p>
          <ul className="contact__roles">
            {identity.roles.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>

        <a className="contact__cta contact__reveal" href={`mailto:${identity.email}`} data-cursor="link">
          <span className="contact__cta-text">Start a conversation</span>
          <span className="contact__cta-mail">{identity.email}</span>
        </a>

        <ul className="contact__links contact__reveal">
          <li>
            <a href={identity.links.github} target="_blank" rel="noreferrer">
              <IconBox name="GitHub" size="md" i={0} /> GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={identity.links.linkedin} target="_blank" rel="noreferrer">
              <IconBox name="LinkedIn" size="md" i={1} /> LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={`mailto:${identity.email}`}>
              <IconBox name="Email" size="md" i={2} /> Email
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}
