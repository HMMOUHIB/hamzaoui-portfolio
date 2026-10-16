import { gsap } from './gsap'

// Characters rise out of a masked line (the line wrapper clips overflow).
export function riseChars(targets, vars = {}) {
  return gsap.fromTo(
    targets,
    { yPercent: 115, rotate: 4 },
    { yPercent: 0, rotate: 0, duration: 1, ease: 'expo.out', stagger: 0.025, ...vars },
  )
}

// Soft fade-up for supporting copy — used sparingly.
export function liftIn(targets, vars = {}) {
  return gsap.fromTo(
    targets,
    { autoAlpha: 0, y: 24 },
    { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ...vars },
  )
}

// Scatter characters — the "break" moment.
export function fractureChars(targets, vars = {}) {
  return gsap.to(targets, {
    yPercent: () => gsap.utils.random(-140, 140),
    xPercent: () => gsap.utils.random(-60, 60),
    rotate: () => gsap.utils.random(-35, 35),
    autoAlpha: 0,
    duration: 0.8,
    ease: 'power2.in',
    stagger: { each: 0.015, from: 'random' },
    ...vars,
  })
}
