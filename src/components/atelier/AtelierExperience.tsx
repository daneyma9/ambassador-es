'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from './scroll-store'
import { Chapters } from './Chapters'

// The WebGL canvas is strictly client-side; never server-render it.
const Scene = dynamic(() => import('./Scene'), { ssr: false })

export default function AtelierExperience() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [enter, setEnter] = useState(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // 1 — Lenis buttery smooth scrolling, the drift-through-a-museum feel.
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    })

    // 2 — Feed Lenis scroll data into the shared store + ScrollTrigger.
    lenis.on('scroll', ({ scroll, limit, velocity, progress }: any) => {
      scrollState.scroll = scroll
      scrollState.limit = limit
      scrollState.velocity = velocity
      scrollState.progress = progress
      ScrollTrigger.update()
    })

    // 3 — Drive Lenis from GSAP's ticker so both animation systems share a clock.
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // 4 — Cinematic per-chapter text reveals tied to scroll position.
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 18, opacity: 0, filter: 'blur(14px)' },
          {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            ease: 'power3.out',
            duration: 1.4,
            scrollTrigger: {
              trigger: el,
              start: 'top 82%',
              end: 'top 40%',
              scrub: true,
            },
          }
        )
      })

      // Parallax drift on foreground editorial labels.
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const depth = parseFloat(el.dataset.parallax || '0.2')
        gsap.to(el, {
          yPercent: -depth * 100,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, rootRef)

    // Fade the overture in once mounted.
    const t = window.setTimeout(() => setEnter(true), 80)

    return () => {
      window.clearTimeout(t)
      gsap.ticker.remove(raf)
      ctx.revert()
      lenis.destroy()
      ScrollTrigger.getAll().forEach((s) => s.kill())
    }
  }, [])

  return (
    <div ref={rootRef} className={`atelier ${enter ? 'is-entered' : ''}`}>
      {/* Fixed WebGL backdrop — the world the editorial drifts through. */}
      <div className="atelier__canvas">
        <Suspense fallback={<div className="atelier__loading">loading the gallery…</div>}>
          <Scene />
        </Suspense>
      </div>

      {/* Foreground editorial film — scroll-driven typographic chapters. */}
      <Chapters />

      {/* Grain + scanline atmosphere on top of everything. */}
      <div className="atelier__grain" aria-hidden />
    </div>
  )
}
