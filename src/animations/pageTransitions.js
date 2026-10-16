import { gsap } from './gsap'

// Black → paper: a red seam opens the black cover from the centre outward
// as the section arrives. The cover spans the first viewport of the section.
export function seamOpen(section) {
  const q = gsap.utils.selector(section)
  return gsap
    .timeline({ scrollTrigger: { trigger: section, start: 'top 85%', end: 'top top', scrub: true } })
    .fromTo(q('.seam__line'), { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, ease: 'none', duration: 0.3 })
    .fromTo(q('.seam__half'), { scaleY: 1 }, { scaleY: 0, ease: 'power2.inOut', duration: 0.7 })
    .to(q('.seam__line'), { autoAlpha: 0, duration: 0.2 }, '<0.25')
}

// Paper → black: a curtain drops at the end of a light section.
export function curtainClose(section) {
  const q = gsap.utils.selector(section)
  return gsap.fromTo(
    q('.curtain'),
    { scaleY: 0 },
    { scaleY: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'bottom bottom', end: 'bottom top', scrub: true } },
  )
}
