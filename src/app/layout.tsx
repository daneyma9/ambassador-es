import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaxDown Ambassador Portal',
  description: 'Earn money by collaborating with TaxDown',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
