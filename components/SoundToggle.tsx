'use client'

import { useEffect, useState } from 'react'

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(true)

  // Listen for mute state changes dispatched by VideoPlayer section
  useEffect(() => {
    const handler = (e: Event) => {
      const { muted } = (e as CustomEvent<{ muted: boolean }>).detail
      setIsMuted(muted)
    }
    window.addEventListener('imperial-mute-change', handler)
    return () => window.removeEventListener('imperial-mute-change', handler)
  }, [])

  const handleClick = () => {
    // Delegate to VideoPlayer's toggle function stored on window
    const toggle = (window as any).__imperialToggleMute
    if (typeof toggle === 'function') toggle()
    // Scroll to showreel section
    const el = document.getElementById('showreel')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isMuted ? 'Sound off — click to unmute' : 'Sound on — click to mute'}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        background: 'rgba(10,10,11,0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(201,168,76,0.18)',
        borderRadius: '999px',
        padding: '0.45rem 0.9rem 0.45rem 0.6rem',
        cursor: 'none',
        transition: 'border-color 0.3s ease, background 0.3s ease',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.45)'
        ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(18,6,6,0.85)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.18)'
        ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,10,11,0.75)'
      }}
    >
      {/* Icon: speaker */}
      <SpeakerIcon muted={isMuted} />

      {/* Label */}
      <span
        style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: isMuted ? 'rgba(201,168,76,0.45)' : 'var(--accent-gold)',
          whiteSpace: 'nowrap',
          transition: 'color 0.3s ease',
        }}
      >
        Sound: {isMuted ? 'Off' : 'On'}
      </span>
    </button>
  )
}

// ─── Speaker SVG icon ─────────────────────────────────────────────────────────
function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={muted ? 'rgba(201,168,76,0.4)' : 'var(--accent-gold)'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'stroke 0.3s ease', flexShrink: 0 }}
    >
      {/* Speaker body */}
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />

      {muted ? (
        // X lines when muted
        <>
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </>
      ) : (
        // Sound waves when unmuted
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  )
}
