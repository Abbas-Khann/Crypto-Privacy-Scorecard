import type { Metadata } from 'next'
import { Orbitron, Share_Tech_Mono } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-orbitron',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-share-tech-mono',
})

export const metadata: Metadata = {
  title: 'Crypto Privacy Scorecard',
  description: 'Analyze your wallet privacy across multiple chains',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${shareTechMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Vaporwave background effects */}
        <div className="sun-gradient" aria-hidden="true" />
        <div className="grid-floor" aria-hidden="true" />

        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* CRT effects overlay */}
        <div className="rgb-shift" aria-hidden="true" />
        <div className="scanlines" aria-hidden="true" />
      </body>
    </html>
  )
}
