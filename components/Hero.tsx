'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import MagneticButton from './MagneticButton'

gsap.registerPlugin()

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.3 })

    tl.to(eyebrowRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    })
      .to(
        line1Ref.current,
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power4.out',
        },
        '-=0.5'
      )
      .to(
        line2Ref.current,
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power4.out',
        },
        '-=0.9'
      )
      .to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
        },
        '-=0.7'
      )
      .to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.5'
      )
      .to(
        scrollRef.current,
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.3'
      )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="hero-section">
      {/* Background effects */}
      <div className="hero-noise" />
      <div className="hero-radial-glow" />

      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[90vw]">
        <p
          ref={eyebrowRef}
          className="hero-eyebrow mb-6"
          style={{ transform: 'translateY(20px)' }}
        >
          Full-Stack Developer &amp; Creative Engineer
        </p>

        <div className="mb-4">
          <div className="hero-title-line">
            <span ref={line1Ref} className="hero-title-inner">
              THE EMPEROR
            </span>
          </div>
          <div className="hero-title-line">
            <span ref={line2Ref} className="hero-title-inner gold">
              BUILDS.
            </span>
          </div>
        </div>

        <p ref={subtitleRef} className="hero-subtitle mb-12 max-w-2xl"
           style={{ transform: 'translateY(30px)' }}>
          Code forged in discipline. Interfaces carved in eternity.
        </p>

        <div
          ref={ctaRef}
          style={{ opacity: 0, transform: 'translateY(20px)' }}
        >
          <MagneticButton href="#projects" label="LIHAT KARYA →" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className="scroll-indicator" style={{ opacity: 0 }}>
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>

      {/* Corner decorations */}
      <div className="corner-decoration tl" />
      <div className="corner-decoration tr" />
      <div className="corner-decoration bl" />
      <div className="corner-decoration br" />
    </section>
  )
}
