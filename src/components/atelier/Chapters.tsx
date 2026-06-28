'use client'

/**
 * The editorial layer — oversized serif typography drifting over the WebGL
 * world. Each <section> is one full-viewport "chapter" of the fashion film.
 * Animation (reveal / parallax) is wired up in AtelierExperience via the
 * data-reveal and data-parallax hooks below.
 */

export function Chapters() {
  return (
    <div className="atelier__film">
      {/* Overture */}
      <section className="chapter chapter--hero">
        <p className="kicker" data-reveal>
          Spring/Summer · MMXXVI
        </p>
        <h1 className="display" data-parallax="0.12">
          <span data-reveal>RENAISSANCE</span>
          <span className="display__italic" data-reveal>
            in&nbsp;motion
          </span>
        </h1>
        <p className="lede" data-reveal>
          A digital museum where five centuries of painting drift past
          weightless streetwear. Scroll to enter the canvas.
        </p>
        <p className="scroll-cue" data-reveal>
          ↓ scroll to drift
        </p>
      </section>

      {/* Chapter I */}
      <section className="chapter chapter--right">
        <p className="chapter__no" data-reveal>
          I
        </p>
        <h2 className="heading" data-reveal>
          The&nbsp;Gallery
          <br />
          <em>Reawakened</em>
        </h2>
        <p className="body" data-reveal>
          Botticelli&rsquo;s Venus surfaces from the varnish. A single sneaker
          turns in the gilded light — sacred geometry rebuilt for the street.
        </p>
        <p className="tag" data-parallax="0.3">
          AIR · SANCTUS
        </p>
      </section>

      {/* Chapter II */}
      <section className="chapter chapter--left">
        <p className="chapter__no" data-reveal>
          II
        </p>
        <h2 className="heading" data-reveal>
          Divine
          <br />
          <em>Velocity</em>
        </h2>
        <p className="body" data-reveal>
          Beneath the Creation of Adam, a deck hangs mid-kickflip in the haze.
          The spark between two fingers, the spark beneath four wheels.
        </p>
        <p className="tag" data-parallax="0.35">
          DECK · DIVINO
        </p>
      </section>

      {/* Chapter III */}
      <section className="chapter chapter--center">
        <p className="chapter__no" data-reveal>
          III
        </p>
        <h2 className="heading heading--xl" data-reveal>
          Still&nbsp;Life,
          <br />
          <em>Reborn</em>
        </h2>
        <p className="body" data-reveal>
          The shopping bag as reliquary. Gold leaf and matte couture, suspended
          in fog — luxury rendered as devotional object.
        </p>
        <p className="tag" data-parallax="0.25">
          MAISON · ÆTERNA
        </p>
      </section>

      {/* Colophon / CTA */}
      <section className="chapter chapter--colophon">
        <h2 className="display display--small" data-reveal>
          Wear&nbsp;the
          <span className="display__italic">&nbsp;masterpiece.</span>
        </h2>
        <p className="lede" data-reveal>
          An interactive editorial blending Three.js, GSAP &amp; Lenis into a
          cinematic drift through art history.
        </p>
        <div className="credits" data-reveal>
          <span>Direction — Atelier Renaissance</span>
          <span>WebGL — Three.js / R3F</span>
          <span>Motion — GSAP · Lenis</span>
        </div>
        <a className="cta" href="/" data-reveal>
          Return to the foyer
        </a>
      </section>
    </div>
  )
}
