'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from './scroll-store'

/**
 * Streetwear icons rebuilt from primitives so the experience is fully
 * self-contained (no external GLTF fetch required). Each form is deliberately
 * stylised — chunky, sculptural silhouettes that read as "product" against the
 * renaissance backdrops. Drop a Blender/Spline GLTF in here later by swapping
 * the meshes for a <primitive object={gltf.scene} />; the float + scroll motion
 * wrappers below stay identical.
 */

type ProductProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  /** Parallax depth factor — how strongly scroll velocity pushes the object. */
  drift?: number
}

const GOLD = new THREE.Color('#caa45a')
const IVORY = new THREE.Color('#efe7d6')

/** Wraps a product so it gently bobs and reacts to scroll velocity (physics-ish). */
function FloatingBody({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  drift = 1,
}: ProductProps & { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const spin = useRef(0)

  useFrame((_, delta) => {
    if (!group.current) return
    // Scroll velocity nudges rotation, giving an inertial, physics-inspired feel.
    spin.current += (scrollState.velocity * 0.00025 + 0.04) * drift * delta * 60
    group.current.rotation.y = rotation[1] + spin.current
    // Parallax bob driven by overall scroll progress.
    const p = scrollState.progress
    group.current.position.y =
      position[1] + Math.sin(p * Math.PI * 4 + position[0]) * 0.25 * drift
  })

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        {children}
      </Float>
    </group>
  )
}

export function Sneaker(props: ProductProps) {
  return (
    <FloatingBody {...props}>
      {/* Sole */}
      <RoundedBox args={[2.3, 0.36, 0.95]} radius={0.17} smoothness={4} position={[0, -0.45, 0]}>
        <meshStandardMaterial color="#1b1b1e" roughness={0.6} metalness={0.2} />
      </RoundedBox>
      {/* Glowing midsole stripe — picks up bloom */}
      <RoundedBox args={[2.32, 0.1, 0.97]} radius={0.05} smoothness={3} position={[0, -0.27, 0]}>
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.6} roughness={0.3} />
      </RoundedBox>
      {/* Upper / toe box */}
      <RoundedBox args={[1.55, 0.78, 0.84]} radius={0.34} smoothness={4} position={[-0.18, 0.18, 0]}>
        <meshStandardMaterial color={IVORY} roughness={0.45} metalness={0.1} />
      </RoundedBox>
      {/* Heel counter */}
      <RoundedBox args={[0.7, 0.85, 0.82]} radius={0.32} smoothness={4} position={[0.85, 0.12, 0]}>
        <meshStandardMaterial color="#7c1f2b" roughness={0.4} metalness={0.25} />
      </RoundedBox>
      {/* Ankle collar */}
      <mesh position={[0.78, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.12, 16, 32]} />
        <meshStandardMaterial color={IVORY} roughness={0.5} />
      </mesh>
    </FloatingBody>
  )
}

export function Skateboard(props: ProductProps) {
  const wheel = (x: number, z: number) => (
    <mesh position={[x, -0.28, z]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.16, 0.16, 0.14, 24]} />
      <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.6} roughness={0.3} metalness={0.6} />
    </mesh>
  )
  return (
    <FloatingBody {...props}>
      {/* Deck */}
      <RoundedBox args={[3.6, 0.13, 0.95]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#241a12" roughness={0.55} metalness={0.15} />
      </RoundedBox>
      {/* Grip-tape glow line */}
      <RoundedBox args={[3.4, 0.02, 0.78]} radius={0.01} smoothness={2} position={[0, 0.08, 0]}>
        <meshStandardMaterial color="#e7d9b8" emissive={'#e7d9b8'} emissiveIntensity={0.5} roughness={0.9} />
      </RoundedBox>
      {/* Trucks */}
      <mesh position={[1.2, -0.16, 0]}>
        <boxGeometry args={[0.28, 0.18, 0.7]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[-1.2, -0.16, 0]}>
        <boxGeometry args={[0.28, 0.18, 0.7]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.3} metalness={0.8} />
      </mesh>
      {wheel(1.2, 0.34)}
      {wheel(1.2, -0.34)}
      {wheel(-1.2, 0.34)}
      {wheel(-1.2, -0.34)}
    </FloatingBody>
  )
}

export function ShoppingBag(props: ProductProps) {
  return (
    <FloatingBody {...props}>
      {/* Bag body */}
      <RoundedBox args={[1.5, 1.8, 0.85]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#2b2f3a" roughness={0.35} metalness={0.15} />
      </RoundedBox>
      {/* Gilded top band */}
      <RoundedBox args={[1.54, 0.18, 0.89]} radius={0.04} smoothness={3} position={[0, 0.9, 0]}>
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.3} roughness={0.25} metalness={0.7} />
      </RoundedBox>
      {/* Handles */}
      <mesh position={[-0.4, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.04, 12, 24, Math.PI]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.4, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.04, 12, 24, Math.PI]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Embossed crest */}
      <mesh position={[0, 0.05, 0.44]}>
        <circleGeometry args={[0.34, 32]} />
        <meshStandardMaterial color={IVORY} emissive={IVORY} emissiveIntensity={0.25} roughness={0.6} />
      </mesh>
    </FloatingBody>
  )
}
