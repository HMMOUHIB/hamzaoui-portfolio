import { useEffect, useState } from 'react'

// Fires once when the element comes within `margin` of the viewport.
export function useNearViewport(ref, margin = '400px') {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setNear(true),
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin, near])
  return near
}
