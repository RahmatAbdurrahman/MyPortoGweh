'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import MagneticButton from './MagneticButton'

gsap.registerPlugin(ScrollTrigger)

export default function Profile() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Image: slide in from left + blur removal
    gsap.fromTo(
      imageRef.current,
      { x: -60, opacity: 0, filter: 'blur(10px)' },
      {
        x: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: imageRef.current,
          start: 'top 80%',
          once: true,
        },
      }
    )

    // Scroll parallax on image
    gsap.to(imageRef.current, {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    // Text lines stagger reveal
    const lines = textRef.current?.querySelectorAll('.reveal-line')
    if (lines) {
      gsap.fromTo(
        lines,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      )
    }
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="profile-section" id="profile">
      {/* Section eyebrow */}
      <div className="section-eyebrow mb-16">The Sovereign</div>

      {/* Glass card container */}
      <div className="glass-card p-8 md:p-16 relative overflow-hidden">
        {/* Background grain */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* MENGGUNAKAN ITEMS-STRETCH AGAR KOLOM KIRI DAN KANAN SAMA TINGGI */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-stretch">
          
          {/* Image Column — 2fr */}
          <div className="md:col-span-2 relative min-h-[400px] w-full h-full">
            <div ref={imageRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0 }}>
              
              {/* Aura glow behind */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(192,39,45,0.5), rgba(201,168,76,0.3), rgba(192,39,45,0.5))',
                  filter: 'blur(25px)',
                  transform: 'scale(1.1)',
                  animation: 'auraPulse 3s ease-in-out infinite, auraRotate 10s linear infinite',
                  zIndex: 0,
                }}
              />

              {/* Image wrapper */}
              <div
                className="profile-image-wrapper absolute inset-0 z-10 w-full h-full rounded-2xl overflow-hidden group cursor-none"
                style={{ transition: 'transform 0.4s ease' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                }}
              >
                <div className="absolute inset-0 w-full h-full border border-accent-gold/20 shadow-2xl">
                  <Image
                    src="/images/potrait.png"
                    alt="Portrait of The Sovereign"
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                  />

                  {/* Gradient Overlay Biar Auranya Tetap Dapet (Di atas foto) */}
                  <div
                    className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-70"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(192,39,45,0.3) 0%, transparent 40%, rgba(201,168,76,0.2) 100%)',
                      mixBlendMode: 'overlay', 
                    }}
                  />

                  {/* Inner shadow biar pinggiran fotonya nge-blend sama background web lu */}
                  <div className="absolute inset-0 z-20 pointer-events-none" style={{
                    boxShadow: 'inset 0 0 40px 10px rgba(10,10,11,0.8)'
                  }} />
                </div>
                
                {/* Overlay gradient */}
                <div
                  className="absolute inset-0 pointer-events-none z-30"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(10,10,11,0.6) 0%, transparent 50%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Text Column — 3fr */}
          <div ref={textRef} className="md:col-span-3 space-y-6 flex flex-col justify-center py-4">
            <p
              className="reveal-line section-eyebrow"
              style={{ opacity: 0 }}
            >
              The Architect
            </p>

            <h2
              className="reveal-line section-title"
              style={{ opacity: 0, fontFamily: 'var(--font-cinzel)' }}
            >
              Building a Digital Empire Through Precision and Aesthetics.
            </h2>

            <div className="imperial-divider reveal-line" style={{ opacity: 0 }} />

            <p
              className="reveal-line"
              style={{
                opacity: 0,
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.15rem',
                lineHeight: 1.9,
                color: 'rgba(240, 234, 214, 0.7)',
                fontStyle: 'italic',
              }}
            >
              Sebagai kaisar dalam domain digital, saya tidak sekadar menulis kode; saya merancang
              fondasi dari sebuah kerajaan. Setiap komponen adalah batu bata dari istana yang kokoh,
              setiap fungsi adalah perintah yang tak terbantahkan.
            </p>

            <p
              className="reveal-line"
              style={{
                opacity: 0,
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.15rem',
                lineHeight: 1.9,
                color: 'rgba(240, 234, 214, 0.7)',
              }}
            >
              Setiap piksel adalah presisi, setiap interaksi adalah dominasi. Saya adalah{' '}
              <span className="text-gold">Rahmat Abdurrahman</span> — seorang Front-End Developer
              &amp; Creative Engineer yang membangun antarmuka dengan disiplin militer dan estetika
              kaisar.
            </p>

            <div className="reveal-line flex flex-wrap gap-6 pt-4" style={{ opacity: 0 }}>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '1.8rem',
                    color: 'var(--accent-gold)',
                    lineHeight: 1,
                  }}
                >
                  7+
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.2em',
                    color: 'rgba(240,234,214,0.4)',
                    textTransform: 'uppercase',
                    marginTop: '0.25rem',
                  }}
                >
                  Projects Forged
                </p>
              </div>
              <div
                style={{
                  width: '1px',
                  background: 'rgba(201,168,76,0.2)',
                }}
              />
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '1.8rem',
                    color: 'var(--accent-gold)',
                    lineHeight: 1,
                  }}
                >
                  ∞
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.2em',
                    color: 'rgba(240,234,214,0.4)',
                    textTransform: 'uppercase',
                    marginTop: '0.25rem',
                  }}
                >
                  Lines of Command
                </p>
              </div>
            </div>

            <div className="reveal-line pt-4" style={{ opacity: 0 }}>
              <MagneticButton
                href="https://github.com/RahmatAbdurrahman"
                label="BUKA DOMAIN GITHUB →"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}