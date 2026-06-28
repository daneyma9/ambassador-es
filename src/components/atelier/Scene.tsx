'use client'

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Environment, Lightformer, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { scrollState, chapterAt } from './scroll-store'
import { Sneaker, Skateboard, ShoppingBag } from './Products'
import { Paintings } from './Paintings'

/**
 * Camera keyframes — one per editorial chapter. The rig lerps between them as
 * the page scrolls, so the whole 3D world is choreographed like a tracking shot
 * through a digital museum.
 */
const CAMERA_KEYFRAMES: { pos: THREE.Vector3; look: THREE.Vector3 }[] = [
  { pos: new THREE.Vector3(0, 0.5, 9), look: new THREE.Vector3(0, 0, 0) },
  { pos: new THREE.Vector3(-3.5, 1.2, 4), look: new THREE.Vector3(-5, 1, -8) },
  { pos: new THREE.Vector3(3, -0.5, 2), look: new THREE.Vector3(4, 0.5, -10) },
  { pos: new THREE.Vector3(-1.5, 2, -4), look: new THREE.Vector3(2, 2.5, -18) },
  { pos: new THREE.Vector3(0, 0, -14), look: new THREE.Vector3(0, -0.5, -24) },
]

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()

function CameraRig() {
  const { camera } = useThree()

  useFrame(() => {
    const { index, local } = chapterAt(scrollState.progress)
    const a = CAMERA_KEYFRAMES[Math.min(index, CAMERA_KEYFRAMES.length - 1)]
    const b = CAMERA_KEYFRAMES[Math.min(index + 1, CAMERA_KEYFRAMES.length - 1)]
    // Smootherstep easing for that premium, weighty camera motion.
    const e = local * local * local * (local * (local * 6 - 15) + 10)
    _pos.copy(a.pos).lerp(b.pos, e)
    _look.copy(a.look).lerp(b.look, e)
    // A touch of mouse-free idle sway keeps it cinematic.
    const t = performance.now() * 0.0002
    camera.position.lerp(_pos, 0.06)
    camera.position.x += Math.sin(t) * 0.05
    camera.position.y += Math.cos(t * 0.8) * 0.04
    camera.lookAt(_look)
  })

  return null
}

/** Slow-turning dust/light motes layered at several depths for atmosphere. */
function Atmosphere() {
  return (
    <>
      <Sparkles count={120} scale={[20, 12, 20]} size={2.4} speed={0.25} color="#e8d4a0" opacity={0.6} />
      <Sparkles count={80} scale={[14, 8, 14]} size={1.2} speed={0.4} color="#fff4d6" opacity={0.4} />
      <Sparkles count={200} scale={[30, 16, 30]} size={0.6} speed={0.15} color="#b9a06a" opacity={0.3} />
    </>
  )
}

function World() {
  const group = useRef<THREE.Group>(null)

  return (
    <group ref={group}>
      {/* Warm renaissance key light + cool rim for contrast */}
      <ambientLight intensity={0.35} color="#5a4a36" />
      <spotLight
        position={[6, 10, 6]}
        angle={0.5}
        penumbra={1}
        intensity={180}
        color="#ffd9a0"
        castShadow
      />
      <pointLight position={[-8, -2, 2]} intensity={40} color="#5b6cff" />
      <pointLight position={[0, 2, 6]} intensity={25} color="#ffceb0" />

      <Paintings />

      {/* Floating streetwear at staggered depths for parallax */}
      <Sneaker position={[0, 0.4, 1]} rotation={[0.1, 0.4, 0.05]} scale={1.1} drift={1.2} />
      <ShoppingBag position={[-4.6, 1, -7]} rotation={[0, 0.3, 0]} scale={1} drift={0.9} />
      <Skateboard position={[4.2, 0.2, -9]} rotation={[0.2, -0.4, 0.3]} scale={1} drift={1.1} />
      <Sneaker position={[-1.5, 2.4, -17]} rotation={[0.2, 1.2, -0.1]} scale={0.9} drift={1.4} />
      <ShoppingBag position={[1.6, -1.4, -22]} rotation={[0, -0.2, 0]} scale={1.2} drift={0.7} />
      <Skateboard position={[-2.4, -0.5, -24]} rotation={[0.1, 0.6, -0.2]} scale={1.1} drift={1} />

      <Atmosphere />
    </group>
  )
}

export default function Scene() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.5, 9], fov: 42, near: 0.1, far: 100 }}
      onCreated={({ scene, gl }) => {
        scene.background = new THREE.Color('#100a08')
        // Exponential fog: products dissolve into a warm, dreamy haze.
        scene.fog = new THREE.FogExp2('#140d0a', 0.045)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.15
      }}
    >
      <CameraRig />
      <World />
      {/* Procedural environment map (no external HDR fetch) for warm reflections. */}
      <Environment resolution={256} environmentIntensity={0.5}>
        <Lightformer intensity={3} color="#ffd9a0" position={[0, 5, -7]} scale={[12, 8, 1]} />
        <Lightformer intensity={1.4} color="#caa45a" position={[-7, 1, 3]} scale={[6, 10, 1]} />
        <Lightformer intensity={1} color="#5b6cff" position={[7, -2, 2]} scale={[6, 6, 1]} />
        <Lightformer intensity={0.6} color="#ffceb0" position={[0, -5, 4]} scale={[10, 4, 1]} />
      </Environment>
      <AdaptiveDpr pixelated />
      <EffectComposer multisampling={4}>
        <DepthOfField focusDistance={0.02} focalLength={0.06} bokehScale={3} height={480} />
        <Bloom intensity={1.1} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
      </EffectComposer>
    </Canvas>
  )
}
