import type { Metadata } from 'next'
import { Cinzel, Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rahmat Abdurrahman — Imperial Portfolio',
  description: 'Full-Stack Developer & Creative Engineer. Code forged in discipline. Interfaces carved in eternity.',
  keywords: ['developer', 'portfolio', 'front-end', 'creative engineer', 'Next.js'],
  authors: [{ name: 'Rahmat Abdurrahman' }],
  openGraph: {
    title: 'Rahmat Abdurrahman — Imperial Portfolio',
    description: 'Code forged in discipline. Interfaces carved in eternity.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${inter.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
