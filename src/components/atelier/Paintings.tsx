'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from './scroll-store'

/**
 * Floating classical-painting panels. Real public-domain artwork (Wikimedia,
 * which serves CORS-enabled images) is used as the primary texture so the
 * renaissance contrast lands; if the network blocks it, we fall back to a
 * procedurally generated sfumato canvas so the scene never renders empty.
 */

export type PaintingDef = {
  src: string
  position: [number, number, number]
  rotation?: [number, number, number]
  width: number
  fallback: string
}

/** A warm, cracked-varnish gradient generated on a canvas — the offline fallback. */
function sfumatoTexture(base: string): THREE.Texture {
  const size = 512
  const canvas =
    typeof document !== 'undefined' ? document.createElement('canvas') : null
  if (!canvas) return new THREE.Texture()
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size * 0.4, size * 0.35, 40, size * 0.5, size * 0.5, size * 0.8)
  g.addColorStop(0, base)
  g.addColorStop(0.6, '#2a1d12')
  g.addColorStop(1, '#0d0907')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  // subtle varnish speckle
  for (let i = 0; i < 1600; i++) {
    const a = Math.random() * 0.06
    ctx.fillStyle = `rgba(${200 + Math.random() * 55},${150 + Math.random() * 60},${90},${a})`
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function usePaintingTexture(src: string, fallback: string): THREE.Texture {
  const [tex, setTex] = useState<THREE.Texture>(() => sfumatoTexture(fallback))

  useEffect(() => {
    let active = true
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      src,
      (loaded) => {
        if (!active) return
        loaded.colorSpace = THREE.SRGBColorSpace
        setTex(loaded)
      },
      undefined,
      () => {
        /* keep the procedural fallback */
      }
    )
    return () => {
      active = false
    }
  }, [src, fallback])

  return tex
}

function Painting({ def }: { def: PaintingDef }) {
  const tex = usePaintingTexture(def.src, def.fallback)
  const group = useRef<THREE.Group>(null)
  // Derive panel height from the loaded image aspect so artwork isn't squashed.
  const aspect =
    tex.image && (tex.image as HTMLImageElement).width
      ? (tex.image as HTMLImageElement).height / (tex.image as HTMLImageElement).width
      : 1.3
  const height = def.width * aspect

  useFrame((state) => {
    if (!group.current) return
    // Slow parallax sway so the gallery feels alive and dreamlike.
    const t = state.clock.elapsedTime
    group.current.position.x = def.position[0] + Math.sin(t * 0.2 + def.position[2]) * 0.12
    group.current.rotation.y =
      (def.rotation?.[1] ?? 0) + Math.sin(t * 0.15) * 0.04 + scrollState.velocity * 0.00004
  })

  return (
    <group ref={group} position={def.position} rotation={def.rotation}>
      {/* Gilded ornate frame */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[def.width + 0.5, height + 0.5, 0.2]} />
        <meshStandardMaterial color="#b78b3c" metalness={0.85} roughness={0.3} emissive="#3a2a0e" emissiveIntensity={0.4} />
      </mesh>
      {/* Inner mat */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[def.width + 0.12, height + 0.12]} />
        <meshStandardMaterial color="#0a0706" />
      </mesh>
      {/* Canvas */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[def.width, height]} />
        <meshStandardMaterial map={tex} roughness={0.85} metalness={0} toneMapped />
      </mesh>
    </group>
  )
}

export function Paintings() {
  // Public-domain renaissance masterworks (Wikimedia thumbnails, CORS-enabled).
  const defs = useMemo<PaintingDef[]>(
    () => [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/640px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
        position: [-6.5, 1.2, -8],
        rotation: [0, 0.5, 0],
        width: 6,
        fallback: '#7a5a34',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/640px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
        position: [7, 0.5, -10],
        rotation: [0, -0.5, 0],
        width: 7,
        fallback: '#6b4f33',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/480px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
        position: [-7.5, -2, -14],
        rotation: [0, 0.4, 0],
        width: 4,
        fallback: '#5c4a2e',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/640px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
        position: [6, 3.5, -18],
        rotation: [0, -0.35, 0],
        width: 8,
        fallback: '#6e5836',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Sandro_Botticelli_-_Primavera_-_Google_Art_Project.jpg/640px-Sandro_Botticelli_-_Primavera_-_Google_Art_Project.jpg',
        position: [0, -1, -24],
        rotation: [0, 0, 0],
        width: 9,
        fallback: '#5f5230',
      },
    ],
    []
  )

  return (
    <group>
      {defs.map((def, i) => (
        <Painting key={i} def={def} />
      ))}
    </group>
  )
}
