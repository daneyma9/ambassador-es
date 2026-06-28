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
  /** Index into the procedural old-master palette used as the offline fallback. */
  variant: number
}

/**
 * Procedurally paints an abstract "old master" canvas — luminous sky, a darker
 * landscape band, a soft central figure draped in robe colour, vignette and
 * craquelure. Used as the offline/blocked fallback so the panels still read as
 * classical art even when the real artwork can't be fetched. Varied per panel.
 */
type Palette = { sky: string; mid: string; earth: string; robe: string; flesh: string }

const PALETTES: Palette[] = [
  { sky: '#caa45a', mid: '#7c5a32', earth: '#241608', robe: '#7c1f2b', flesh: '#e8cdab' }, // Venus
  { sky: '#9fb6c4', mid: '#6d6a4e', earth: '#1c160d', robe: '#b9442f', flesh: '#e7c9a3' }, // Adam
  { sky: '#8a6a3c', mid: '#4f3a22', earth: '#171009', robe: '#2a3c52', flesh: '#e3c39a' }, // Mona Lisa
  { sky: '#c2a567', mid: '#7a6336', earth: '#20180c', robe: '#3a5a4a', flesh: '#ead0a8' }, // Athens
  { sky: '#b6a35e', mid: '#5f6b39', earth: '#1a1709', robe: '#883b46', flesh: '#e6cda4' }, // Primavera
]

function oldMasterTexture(variant: number): THREE.Texture {
  const size = 512
  const canvas =
    typeof document !== 'undefined' ? document.createElement('canvas') : null
  if (!canvas) return new THREE.Texture()
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const p = PALETTES[variant % PALETTES.length]

  // Luminous sky → earth gradient
  const g = ctx.createLinearGradient(0, 0, 0, size)
  g.addColorStop(0, p.sky)
  g.addColorStop(0.45, p.mid)
  g.addColorStop(1, p.earth)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  // Soft divine light bloom, upper third
  const halo = ctx.createRadialGradient(size * 0.5, size * 0.32, 10, size * 0.5, size * 0.32, size * 0.5)
  halo.addColorStop(0, 'rgba(255,240,200,0.55)')
  halo.addColorStop(1, 'rgba(255,240,200,0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, size, size)

  // Rolling landscape / ground mass with a curved horizon
  ctx.fillStyle = p.earth
  ctx.beginPath()
  ctx.moveTo(0, size * 0.72)
  ctx.quadraticCurveTo(size * 0.5, size * 0.6, size, size * 0.74)
  ctx.lineTo(size, size)
  ctx.lineTo(0, size)
  ctx.closePath()
  ctx.fill()

  // Central robed figure — body, draped robe, head with soft glow
  ctx.fillStyle = p.robe
  ctx.beginPath()
  ctx.moveTo(size * 0.5, size * 0.42)
  ctx.quadraticCurveTo(size * 0.34, size * 0.6, size * 0.4, size * 0.92)
  ctx.lineTo(size * 0.6, size * 0.92)
  ctx.quadraticCurveTo(size * 0.66, size * 0.6, size * 0.5, size * 0.42)
  ctx.fill()
  ctx.fillStyle = p.flesh
  ctx.beginPath() // torso/neck
  ctx.ellipse(size * 0.5, size * 0.46, size * 0.07, size * 0.13, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath() // head
  ctx.ellipse(size * 0.5, size * 0.33, size * 0.055, size * 0.07, 0, 0, Math.PI * 2)
  ctx.fill()

  // Chiaroscuro vignette
  const vg = ctx.createRadialGradient(size * 0.5, size * 0.45, size * 0.25, size * 0.5, size * 0.5, size * 0.75)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(8,5,3,0.85)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, size, size)

  // Craquelure: fine varnish speckle + a few hairline cracks
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(${200 + Math.random() * 55},${150 + Math.random() * 60},90,${Math.random() * 0.05})`
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.4, 1.4)
  }
  ctx.strokeStyle = 'rgba(20,12,6,0.25)'
  ctx.lineWidth = 0.6
  for (let i = 0; i < 18; i++) {
    ctx.beginPath()
    let x = Math.random() * size
    let y = Math.random() * size
    ctx.moveTo(x, y)
    for (let s = 0; s < 4; s++) {
      x += (Math.random() - 0.5) * 40
      y += (Math.random() - 0.5) * 40
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function usePaintingTexture(src: string, variant: number): THREE.Texture {
  const [tex, setTex] = useState<THREE.Texture>(() => oldMasterTexture(variant))

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
  }, [src, variant])

  return tex
}

function Painting({ def }: { def: PaintingDef }) {
  const tex = usePaintingTexture(def.src, def.variant)
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
        variant: 0,
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/640px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
        position: [7, 0.5, -10],
        rotation: [0, -0.5, 0],
        width: 7,
        variant: 1,
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/480px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
        position: [-7.5, -2, -14],
        rotation: [0, 0.4, 0],
        width: 4,
        variant: 2,
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/640px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
        position: [6, 3.5, -18],
        rotation: [0, -0.35, 0],
        width: 8,
        variant: 3,
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Sandro_Botticelli_-_Primavera_-_Google_Art_Project.jpg/640px-Sandro_Botticelli_-_Primavera_-_Google_Art_Project.jpg',
        position: [0, -1, -24],
        rotation: [0, 0, 0],
        width: 9,
        variant: 4,
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
