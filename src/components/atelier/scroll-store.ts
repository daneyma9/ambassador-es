/**
 * A tiny mutable store that bridges the smooth-scroll layer (Lenis + GSAP)
 * and the WebGL render loop (react-three-fiber's useFrame).
 *
 * We deliberately avoid React state here: scroll updates fire every frame and
 * routing them through setState would thrash reconciliation. Instead the scroll
 * driver writes plain numbers and the 3D scene reads them inside useFrame.
 */

export interface ScrollState {
  /** Normalised scroll position of the whole page, 0 → 1. */
  progress: number
  /** Instantaneous scroll velocity reported by Lenis (signed). */
  velocity: number
  /** Raw scroll offset in pixels. */
  scroll: number
  /** Total scrollable height in pixels. */
  limit: number
}

export const scrollState: ScrollState = {
  progress: 0,
  velocity: 0,
  scroll: 0,
  limit: 1,
}

/**
 * Number of editorial chapters in the experience. The 3D camera rig and the
 * DOM sections both derive their keyframes from this value so they stay in sync.
 */
export const CHAPTERS = 5

/**
 * Maps the global 0 → 1 progress onto a chapter index plus the local 0 → 1
 * progress within that chapter. Used to orchestrate per-scene choreography.
 */
export function chapterAt(progress: number): { index: number; local: number } {
  const scaled = Math.min(0.999999, Math.max(0, progress)) * CHAPTERS
  const index = Math.floor(scaled)
  return { index, local: scaled - index }
}
