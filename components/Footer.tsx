'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/RahmatAbdurrahman' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Email', href: 'mailto:rahmat@example.com' },
]

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const monogramRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo(
      monogramRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 80%',
          once: true,
        },
      }
    )
  }, { scope: footerRef })

  const year = new Date().getFullYear()

  return (
    <footer ref={footerRef} className="footer-section">
      {/* Decorative line */}
      <div className="imperial-divider" />

      <div className="relative py-16">
        {/* Monogram watermark */}
        <div ref={monogramRef} className="footer-monogram" style={{ opacity: 0 }}>
          RA
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-12">
          {/* Logo / Name */}
          <div className="text-center">
            <p
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.6rem',
                letterSpacing: '0.5em',
                color: 'rgba(201,168,76,0.4)',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              The Empire Never Sleeps
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                color: 'var(--text-primary)',
                fontWeight: 400,
                letterSpacing: '0.05em',
              }}
            >
              Rahmat Abdurrahman
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1rem',
                color: 'rgba(240,234,214,0.4)',
                fontStyle: 'italic',
                marginTop: '0.5rem',
              }}
            >
              Full-Stack Developer &amp; Creative Engineer
            </p>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap gap-8 justify-center">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-16 h-[1px] bg-gold-gradient opacity-30" />

          {/* Copyright */}
          <p
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: 'rgba(240,234,214,0.25)',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            © {year} Rahmat Abdurrahman. The Empire Never Sleeps.
          </p>
        </div>
      </div>

      {/* Bottom decorative border */}
      <div
        style={{
          height: '1px',
          background:
            'linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)',
        }}
      />
    </footer>
  )
}
