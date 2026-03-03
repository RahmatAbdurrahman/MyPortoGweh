'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

interface VideoGateProps {
  /** Called when user makes a choice. true = unmute, false = muted */
  onChoice: (unmuted: boolean) => void
}

export default function VideoGate({ onChoice }: VideoGateProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const [isExiting, setIsExiting] = useState(false)

  // ── Entrance animation ─────────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline()

    // Overlay fades in from total black
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' })

    // Box pulls out of darkness: blur + scale
    tl.fromTo(
      boxRef.current,
      { opacity: 0, scale: 0.82, filter: 'blur(20px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' },
      '-=0.2'
    )

    // Stagger children up
    const children = boxRef.current?.querySelectorAll('.gate-child')
    if (children) {
      tl.fromTo(
        children,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      )
    }
  }, [])

  // ── Choice handler ─────────────────────────────────────────────────────────
  const handleChoice = (unmuted: boolean) => {
    if (isExiting) return
    setIsExiting(true)

    // 🔥 EKSEKUSI LANGSUNG DI SINI! (Bypass blokir Autoplay Browser)
    // Sinyal dikirim detik ini juga ke parent/VideoPlayer, jangan nunggu animasi beres!
    onChoice(unmuted)

    // Mulai animasi kehancuran gerbang (tanpa menunda audio)
    const tl = gsap.timeline()

    if (unmuted) {
      // "BIARKAN BERGEMA" — dramatic gold implosion
      tl.to(boxRef.current, {
        scale: 1.05,
        duration: 0.15,
        ease: 'power2.in',
      })
      tl.to(boxRef.current, {
        scale: 0.72,
        opacity: 0,
        filter: 'blur(24px)',
        duration: 0.65,
        ease: 'expo.in',
      })

      // Spawn gold particles
      spawnGoldParticles()

      // Overlay fades out after box disappears
      tl.to(overlayRef.current, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.2')
    } else {
      // "MASUK DALAM HENING" — quiet fade
      tl.to(boxRef.current, {
        opacity: 0,
        y: -16,
        filter: 'blur(8px)',
        duration: 0.6,
        ease: 'power2.inOut',
      })
      tl.to(overlayRef.current, { opacity: 0, duration: 0.5 }, '-=0.2')
    }
  }

  // ── Gold particles burst ────────────────────────────────────────────────────
  const spawnGoldParticles = () => {
    if (!particlesRef.current || !boxRef.current) return
    const rect = boxRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    for (let i = 0; i < 28; i++) {
      const dot = document.createElement('div')
      const size = Math.random() * 5 + 2
      const angle = (i / 28) * Math.PI * 2
      const dist = Math.random() * 180 + 60
      dot.style.cssText = `
        position: fixed;
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: ${Math.random() > 0.5 ? '#C9A84C' : '#F0D080'};
        left: ${cx}px; top: ${cy}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 10001;
        opacity: 1;
      `
      particlesRef.current.appendChild(dot)

      gsap.to(dot, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
        duration: Math.random() * 0.6 + 0.5,
        ease: 'expo.out',
        onComplete: () => dot.remove(),
      })
    }
  }

  return (
    <>
      {/* Full-screen overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(10,10,11,0.92)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0,
        }}
      >
        {/* Glassmorphism box */}
        <div
          ref={boxRef}
          style={{
            background: 'rgba(18, 6, 6, 0.75)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '4px',
            padding: 'clamp(2.5rem, 5vw, 4rem) clamp(2rem, 6vw, 5rem)',
            maxWidth: '540px',
            width: '90vw',
            textAlign: 'center',
            position: 'relative',
            opacity: 0,
          }}
        >
          {/* Corner decorations */}
          {['tl','tr','bl','br'].map((c) => (
            <div key={c} className={`corner-decoration ${c}`} style={{ width: '24px', height: '24px' }} />
          ))}

          {/* Ambient red glow behind */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '4px',
            background: 'radial-gradient(ellipse at 50% 80%, rgba(192,39,45,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* ── Content ── */}

          {/* Eyebrow */}
          <div className="gate-child" style={{ opacity: 0 }}>
            <span style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.58rem', letterSpacing: '0.5em',
              color: 'rgba(201,168,76,0.55)', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
            }}>
              <span style={{ width: '20px', height: '1px', background: 'rgba(201,168,76,0.4)' }} />
              DEKRIT KERAJAAN
              <span style={{ width: '20px', height: '1px', background: 'rgba(201,168,76,0.4)' }} />
            </span>
          </div>

          {/* Headline */}
          <div className="gate-child" style={{ opacity: 0, margin: '1.6rem 0 1rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
              fontWeight: 400, lineHeight: 1.2,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}>
              RUANG TAHTA<br />
              <span style={{ color: 'var(--accent-gold)' }}>MEMILIKI RESONANSI.</span>
            </h2>
          </div>

          {/* Thin divider */}
          <div className="gate-child" style={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '1px', background: 'rgba(201,168,76,0.3)', margin: '1.2rem auto' }} />
          </div>

          {/* Sub-text */}
          <div className="gate-child" style={{ opacity: 0 }}>
            <p style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.85,
              color: 'rgba(240,234,214,0.5)',
            }}>
              Untuk merasakan pengalaman visual dan audio yang utuh dari Imperial Majesty, izinkan harmoni bergema. Pilihan ada di tanganmu.
            </p>
          </div>

          {/* Buttons */}
          <div className="gate-child" style={{ opacity: 0, marginTop: '2.4rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Primary — unmute */}
            <button
              onClick={() => handleChoice(true)}
              disabled={isExiting}
              style={{
                width: '100%', padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #C9A84C 0%, #F0D080 50%, #C9A84C 100%)',
                backgroundSize: '200% auto',
                border: 'none', borderRadius: '2px',
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.72rem', letterSpacing: '0.3em', textTransform: 'uppercase',
                color: '#0A0A0B', cursor: 'pointer',
                animation: 'goldShimmer 2.5s linear infinite',
                transition: 'transform 0.2s, opacity 0.2s',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scaleY(1.02)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scaleY(1)' }}
            >
              BIARKAN BERGEMA
            </button>

            {/* Secondary — stay muted */}
            <button
              onClick={() => handleChoice(false)}
              disabled={isExiting}
              style={{
                width: '100%', padding: '0.9rem 1.5rem',
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.3)', borderRadius: '2px',
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.68rem', letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.55)', cursor: 'pointer',
                transition: 'border-color 0.3s, color 0.3s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(201,168,76,0.6)'
                el.style.color = 'rgba(201,168,76,0.85)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(201,168,76,0.3)'
                el.style.color = 'rgba(201,168,76,0.55)'
              }}
            >
              MASUK DALAM HENING
            </button>
          </div>

        </div>
      </div>

      {/* Particle container (fixed, no pointer events) */}
      <div ref={particlesRef} style={{ position: 'fixed', inset: 0, zIndex: 10002, pointerEvents: 'none' }} />
    </>
  )
}