import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '../animations/gsap'
import { plates } from './plates'
import { fragmentShader, vertexShader } from './shaders'

const MoodMaterial = shaderMaterial(
  {
    uTime: 0, uRes: new THREE.Vector2(1, 1), uMouse: new THREE.Vector2(), uFrom: 0, uTo: 0, uMix: 0,
    uEcl: null, uEclMask: null, uSwd: null, uSwdMask: null,
  },
  vertexShader,
  fragmentShader,
)
extend({ MoodMaterial })

/**
 * Picks the chapter whose element crosses the middle of the viewport.
 * Sections declare their mood with data-bg; "none" means the section paints
 * its own opaque background, so the shader can rest.
 */
function useChapterMood() {
  const [mood, setMood] = useState('0')
  useEffect(() => {
    const els = [...document.querySelectorAll('[data-bg]')]
    const live = new Set()
    const pick = () => {
      // The most deeply nested intersecting element wins (the interlude inside Evolution).
      const inner = [...live].filter((el) => ![...live].some((o) => o !== el && el.contains(o)))
      if (inner[0]) setMood(inner[0].dataset.bg)
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target)))
        pick()
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return mood
}

// The painted plates arrive on their own (they were prefetched during the opener); the smoke moods never wait for them.
function Plates({ mat }) {
  const [uEcl, uEclMask, uSwd, uSwdMask] = useTexture(plates)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    Object.assign(mat.current, { uEcl, uEclMask, uSwd, uSwdMask })
    invalidate()
  }, [mat, uEcl, uEclMask, uSwd, uSwdMask, invalidate])
  return null
}

function Mood({ mood, reduced }) {
  const mat = useRef(null)
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const invalidate = useThree((s) => s.invalidate)
  const shown = useRef({ from: 0, to: 0 })
  const mouse = useRef(new THREE.Vector2())

  // Chapter change → crossfade from what is on screen now to the new mood.
  useEffect(() => {
    if (mood === 'none' || !mat.current) return
    const next = Number(mood)
    const u = mat.current
    if (next === shown.current.to && u.uMix >= 0.999) return
    const current = u.uMix > 0.5 ? shown.current.to : shown.current.from
    shown.current = { from: current, to: next }
    u.uFrom = current
    u.uTo = next
    gsap.killTweensOf(u)
    if (reduced) { u.uMix = 1; invalidate(); return }
    u.uMix = 0
    gsap.to(u, { uMix: 1, duration: 1.6, ease: 'power2.inOut' })
  }, [mood, reduced, invalidate])

  useEffect(() => {
    const onMove = (e) => mouse.current.set(e.clientX / window.innerWidth - 0.5, 0.5 - e.clientY / window.innerHeight)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    const u = mat.current
    if (!u) return
    u.uTime += Math.min(delta, 0.05)
    u.uRes.set(size.width * dpr, size.height * dpr)
    u.uMouse.lerp(mouse.current, 0.04)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <moodMaterial ref={mat} depthTest={false} depthWrite={false} />
      <Suspense fallback={null}><Plates mat={mat} /></Suspense>
    </mesh>
  )
}

// Frame-rate cap: the shader only redraws `fps` times a second, and not at
// all while an opaque chapter covers it or the page is hidden.
function Driver({ fps, active }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!active) return
    let raf = 0, last = 0
    const interval = 1000 / fps
    const loop = (t) => {
      raf = requestAnimationFrame(loop)
      if (t - last >= interval - 1) { last = t; invalidate() }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [fps, active, invalidate])
  return null
}

class WebGLBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

export default function BackgroundCanvas() {
  const mood = useChapterMood()
  const [ready, setReady] = useState(false)
  const { mobile, reduced } = useMemo(() => ({
    mobile: window.matchMedia('(max-width: 899px)').matches,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }), [])
  // Render below native resolution — soft noise fields do not need full DPR. The painted plates (03, 06)
  // do, so the buffer steps up only while one of them is the chapter on screen.
  const [plate, setPlate] = useState(false)
  const nextPlate = mood === 'none' ? plate : mood === '2' || mood === '5' // opaque chapters keep the current buffer
  if (nextPlate !== plate) setPlate(nextPlate)
  const dpr = plate
    ? (mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.25) * 0.8)
    : (mobile ? 0.45 : Math.min(window.devicePixelRatio || 1, 1) * 0.7)

  return (
    <div className={`bg-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true">
      <WebGLBoundary>
        <Canvas
          dpr={dpr}
          frameloop="demand"
          gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: false }}
          onCreated={({ gl }) => { gl.setClearColor('#000000'); setReady(true) }}
        >
          <Mood mood={mood} reduced={reduced} />
          <Driver fps={mobile ? 30 : 50} active={!reduced && mood !== 'none'} />
        </Canvas>
      </WebGLBoundary>
    </div>
  )
}
