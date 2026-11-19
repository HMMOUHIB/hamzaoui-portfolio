import { useEffect } from 'react'

// Marks each top-level section `data-idle` while it is well off screen, so its looping CSS animations pause
// (see global.css). Off-screen loops still cost style recalcs and compositing on every frame, phones feel it most.
export default function usePauseOffscreen(selector = 'main > *, body > #root footer') {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.removeAttribute('data-idle')
        else e.target.setAttribute('data-idle', '')
      }
    }, { rootMargin: '300px 0px' })
    const els = [...document.querySelectorAll(selector)]
    els.forEach((el) => io.observe(el))
    return () => { io.disconnect(); els.forEach((el) => el.removeAttribute('data-idle')) }
  }, [selector])
}
