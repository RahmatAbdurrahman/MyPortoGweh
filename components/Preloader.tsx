'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

interface PreloaderProps {
  onComplete: () => void
}

gsap.registerPlugin()

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const textCharsRef = useRef<HTMLSpanElement[]>([])
  const [counter, setCounter] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Preload minimum time + simulate loading
    const startTime = Date.now()
    const minDuration = 2800

    const intervalMs = 30
    let current = 0

    const interval = setInterval(() => {
      current += Math.random() * 3 + 1
      if (current >= 100) {
        current = 100
        clearInterval(interval)

        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, minDuration - elapsed)

        setTimeout(() => {
          animateOut()
        }, remaining)
      }
      setCounter(Math.floor(current))
      if (fillRef.current) {
        fillRef.current.style.width = `${Math.floor(current)}%`
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [])

  const animateOut = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false)
        onComplete()
      },
    })

    tl.to(containerRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: 'power4.inOut',
    })
  }

  if (!visible) return null

  const letters = 'IMPERIAL MAJESTY'.split('')

  return (
    <div id="preloader" ref={containerRef}>
      <div className="preloader-inner">
        {/* Background counter watermark */}
        <div className="counter" ref={counterRef}>
          {String(counter).padStart(3, '0')}
        </div>

        {/* Character by character title */}
        <div className="preloader-text flex gap-[0.08em] overflow-hidden">
          {letters.map((char, i) =>
            char === ' ' ? (
              <span key={i} className="inline-block w-[0.4em]" />
            ) : (
              <span
                key={i}
                ref={(el) => {
                  if (el) textCharsRef.current[i] = el
                }}
                className="inline-block"
                style={{
                  animationName: 'charReveal',
                  animationDuration: '0.6s',
                  animationDelay: `${i * 0.06}s`,
                  animationFillMode: 'both',
                  animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              >
                {char}
              </span>
            )
          )}
        </div>

        {/* Progress bar */}
        <div className="progress-line">
          <div className="progress-fill" ref={fillRef} />
        </div>

        {/* Percentage text */}
        <p
          className="mt-4 text-center"
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            color: 'rgba(201, 168, 76, 0.5)',
          }}
        >
          {counter}%
        </p>
      </div>

      <style jsx>{`
        @keyframes charReveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
