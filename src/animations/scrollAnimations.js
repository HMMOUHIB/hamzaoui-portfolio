import { gsap } from './gsap'
import { riseChars } from './textAnimations'

// One trigger per chapter header: kicker, title rises, the dingbats pop, the lead lifts.
export function chapterReveal(root) {
  const q = gsap.utils.selector(root)
  return gsap
    .timeline({ scrollTrigger: { trigger: root, start: 'top 80%', once: true } })
    .fromTo(q('.chapter__num'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0)
    .add(riseChars(q('.chapter__title .char')), 0.1)
    .fromTo(q('.chapter__dingbats svg'), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }, 0.35)
    .fromTo(q('.chapter__lead .line-inner'), { yPercent: 105 }, { yPercent: 0, duration: 1, stagger: 0.1, ease: 'expo.out' }, 0.45)
}

// Clip-path reveal for large visuals.
export function wipeReveal(target, trigger, from = 'inset(0% 100% 0% 0%)') {
  return gsap.fromTo(
    target,
    { clipPath: from },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger, start: 'top 75%', once: true } },
  )
}
