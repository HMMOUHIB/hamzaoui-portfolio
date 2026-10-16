import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import capsuleUrl from '../assets/3d/capsule-web.glb?url'

/**
 * The capsule (src/ref/capsule.glb, textures shrunk to a 2 MB web copy) turning slowly in the frame, leaning toward the
 * pointer. `progressRef.current` (0..1) is the scroll progress of the path beside it: two rim lights, red from the
 * left and blue from the right, come up with it, like the tiers lighting from the surface downward.
 * Renders only while visible; every GPU resource is disposed on unmount.
 */
export default function NetworkScene({ progressRef }) {
  const mount = useRef(null)

  useEffect(() => {
    const el = mount.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envMap
    scene.environmentIntensity = 0.55

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50)
    camera.position.set(0, 0.25, 4.6)
    camera.lookAt(0, 0, 0)

    const red = new THREE.PointLight(0xe23a47, 0, 14, 1.6)
    red.position.set(-2.6, 1.4, 2.2)
    const blue = new THREE.PointLight(0x4f8dff, 0, 14, 1.6)
    blue.position.set(2.8, -0.6, 2.4)
    scene.add(red, blue, new THREE.DirectionalLight(0xffffff, 0.8))

    const group = new THREE.Group()
    scene.add(group)

    // load, centre on its bounds and fit to a unit-ish size so any export lands framed
    let model = null
    let alive = true
    new GLTFLoader().load(capsuleUrl, (gltf) => {
      if (!alive) return
      model = gltf.scene
      // the file marks every material as alpha-blended, which makes the hull see-through and shows its inside:
      // draw it solid, keeping only hard cut-outs (the ragged sand patch) from the texture alpha
      model.traverse((o) => {
        if (!o.isMesh) return
        ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
          m.transparent = false
          m.depthWrite = true
          m.alphaTest = 0.5
          m.needsUpdate = true
        })
      })
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const centre = box.getCenter(new THREE.Vector3())
      model.position.sub(centre)
      group.scale.setScalar(2.3 / Math.max(size.x, size.y, size.z))
      group.add(model)
    })

    const mouse = { x: 0, y: 0 }
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    let raf = 0
    let rot = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const p = progressRef?.current ?? 1
      red.intensity = 2 + 26 * Math.min(1, p * 1.6)
      blue.intensity = 2 + 26 * Math.max(0, Math.min(1, (p - 0.25) * 1.5))
      rot += 0.0035
      group.rotation.y = rot + mouse.x * 0.35
      group.rotation.x += ((mouse.y * 0.16) - group.rotation.x) * 0.05
      group.position.y = Math.sin(performance.now() / 1400) * 0.05 // a slow float
      renderer.render(scene, camera)
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(frame)
      if (!e.isIntersecting) { cancelAnimationFrame(raf); raf = 0 }
    })
    io.observe(el)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        if (!o.isMesh) return
        o.geometry.dispose()
        ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
          Object.values(m).forEach((v) => v?.isTexture && v.dispose())
          m.dispose()
        })
      })
      envMap.dispose(); pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [progressRef])

  return <div className="net" ref={mount} aria-hidden="true" />
}
