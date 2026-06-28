import type { Metadata } from 'next'
import AtelierExperience from '@/components/atelier/AtelierExperience'
import './atelier.css'

export const metadata: Metadata = {
  title: 'Atelier Renaissance — A Streetwear Fashion Film',
  description:
    'A cinematic, scroll-driven digital museum where renaissance masterworks blend with floating streetwear. Built with Three.js, GSAP and Lenis.',
}

// AtelierExperience is a client component; it lazy-loads the WebGL canvas
// (ssr: false) internally, so the page itself can stay a server component.
export default function AtelierPage() {
  return <AtelierExperience />
}
