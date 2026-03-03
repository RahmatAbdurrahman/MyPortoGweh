'use client'

import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Shared audio context so SoundToggle widget can control same video ───────
export const VideoAudioContext = createContext<{
  videoRef: React.RefObject<HTMLVideoElement> | null
  isMuted: boolean
  audioLevel: number
  toggle: () => void
}>({
  videoRef: null,
  isMuted: true,
  audioLevel: 0,
  toggle: () => {},
})

export function useVideoAudio() {
  return useContext(VideoAudioContext)
}

// ─── Visualizer bar component ─────────────────────────────────────────────────
function VisualizerBars({
  audioLevel,
  count = 48,
}: {
  audioLevel: number
  count?: number
}) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const animate = () => {
      barsRef.current.forEach((bar, i) => {
        if (!bar) return
        // Create organic wave across bars using sine + audio level
        const wave = Math.sin(Date.now() * 0.003 + i * 0.4) * 0.5 + 0.5
        const bass = Math.sin(Date.now() * 0.006 + i * 0.2) * 0.3 + 0.3
        const height = 4 + wave * (audioLevel * 0.8) + bass * (audioLevel * 0.4)
        bar.style.height = `${Math.max(4, Math.min(height, 80))}px`
        bar.style.opacity = `${0.4 + wave * 0.6}`
      })
      frameRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frameRef.current)
  }, [audioLevel])

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[3px] px-8 pb-0"
      style={{ height: '100px', zIndex: 4 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el }}
          style={{
            width: '3px',
            height: '4px',
            background: i % 3 === 0 ? 'var(--accent-gold)' : 'rgba(201,168,76,0.5)',
            borderRadius: '1px 1px 0 0',
            transition: 'height 0.04s ease, opacity 0.04s ease',
          }}
        />
      ))}
      {/* Gradient fade at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,11,0.8), transparent)',
        }}
      />
    </div>
  )
}

// ─── Main VideoPlayer SECTION ─────────────────────────────────────────────────
// 🔥 PERBAIKAN: Tambahkan interface untuk menerima prop startUnmuted
interface VideoPlayerProps {
  startUnmuted?: boolean;
}

export default function VideoPlayer({ startUnmuted = false }: VideoPlayerProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  const [isMuted, setIsMuted] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number>(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  // Expose to global context so the fixed SoundToggle widget works
  useEffect(() => {
    // Attach refs to window for cross-component access
    ;(window as any).__imperialVideoRef = videoRef
    ;(window as any).__imperialToggleMute = toggleMute
  })

  const setupAudioAnalyser = () => {
    if (!videoRef.current || audioCtxRef.current) return
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const source = ctx.createMediaElementSource(videoRef.current)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    analyser.connect(ctx.destination)
    audioCtxRef.current = ctx
    analyserRef.current = analyser
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      if (!analyserRef.current || !dataArrayRef.current) return
      analyserRef.current.getByteFrequencyData(dataArrayRef.current as any)      
      const avg = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length
      setAudioLevel(avg)
      animFrameRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.muted = false
      videoRef.current.volume = 0.5
      setIsMuted(false)
      setupAudioAnalyser()
      // Dispatch event for SoundToggle widget
      window.dispatchEvent(new CustomEvent('imperial-mute-change', { detail: { muted: false } }))
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
      window.dispatchEvent(new CustomEvent('imperial-mute-change', { detail: { muted: true } }))
    }
  }

  // 🔥 PERBAIKAN: Jalankan unmuting seketika saat komponen di-render jika startUnmuted true
  useEffect(() => {
    if (startUnmuted && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 0.5;
      setIsMuted(false);
      
      // Setup analyser sedikit didelay agar DOM video siap sepenuhnya
      setTimeout(() => {
        setupAudioAnalyser();
        // Beritahu widget SoundToggle kalau audio sudah menyala
        window.dispatchEvent(new CustomEvent('imperial-mute-change', { detail: { muted: false } }));
      }, 50);
    }
  }, [startUnmuted]);

  // 🔥 PERBAIKAN: Menangkap custom event dari page.tsx (opsional sebagai fallback)
  useEffect(() => {
    const handleAutoStart = () => {
      if (isMuted) toggleMute();
    };
    window.addEventListener('imperial-autostart-unmuted', handleAutoStart);
    return () => window.removeEventListener('imperial-autostart-unmuted', handleAutoStart);
  }, [isMuted]);

  // GSAP: section heading reveal
  useGSAP(() => {
    gsap.fromTo(
      headingRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      }
    )
  }, { scope: sectionRef })

  // Dynamic glow intensity
  const glowIntensity = Math.min(audioLevel / 55, 1)

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      audioCtxRef.current?.close()
    }
  }, [])

  return (
    <section ref={sectionRef} id="showreel" className="px-[5vw] py-[10vh]">
      {/* Section header */}
      <div ref={headingRef} className="mb-10" style={{ opacity: 0 }}>
        <div className="section-eyebrow">Imperial Showreel</div>
        <h2 className="section-title">
          The Emperor&apos;s<br />
          <span className="text-gold">Cinematic Domain.</span>
        </h2>
      </div>

      {/* Video container — full width, cinematic ratio */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderRadius: '8px',
          aspectRatio: '16 / 7',
          border: '1px solid rgba(201,168,76,0.15)',
          boxShadow: isMuted
            ? '0 0 60px rgba(10,10,11,0.8)'
            : `0 0 ${60 + glowIntensity * 80}px rgba(192,39,45,${0.2 + glowIntensity * 0.4}), 0 0 ${30 + glowIntensity * 40}px rgba(201,168,76,${0.1 + glowIntensity * 0.2}), inset 0 0 ${20 + glowIntensity * 30}px rgba(192,39,45,${glowIntensity * 0.1})`,
          transition: 'box-shadow 0.15s ease',
        }}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/video/imperial-theme.mp4" type="video/mp4" />
        </video>

        {/* Fallback gradient when no video file */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(192,39,45,0.25) 0%, rgba(10,10,11,0.95) 45%, rgba(201,168,76,0.15) 100%)',
            zIndex: 0,
          }}
        />

        {/* Scan-line overlay for cinematic feel */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
            zIndex: 1,
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,11,0.7) 100%)',
            zIndex: 2,
          }}
        />

        {/* Audio-reactive aura on border */}
        {!isMuted && (
          <div
            className="absolute inset-0 pointer-events-none rounded"
            style={{
              boxShadow: `inset 0 0 ${30 + glowIntensity * 60}px rgba(192,39,45,${glowIntensity * 0.3})`,
              zIndex: 3,
            }}
          />
        )}

        {/* Visualizer bars at the bottom */}
        <VisualizerBars audioLevel={isMuted ? 0 : audioLevel} count={56} />

        {/* Center play indicator / branding */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 5 }}
        >
          {isMuted && (
            <div className="flex flex-col items-center gap-3 opacity-60">
              <div
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
                  letterSpacing: '0.4em',
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                }}
              >
                Sound Off — Click to Unmute
              </div>
              <div
                style={{
                  width: '40px',
                  height: '1px',
                  background: 'rgba(201,168,76,0.4)',
                }}
              />
            </div>
          )}
        </div>

        {/* Click-to-unmute overlay (entire video area) */}
        <button
          onClick={toggleMute}
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'transparent',
            zIndex: 6,
            cursor: 'none',
          }}
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        />

        {/* Corner decoration */}
        <div className="corner-decoration tl" style={{ zIndex: 7 }} />
        <div className="corner-decoration tr" style={{ zIndex: 7 }} />
        <div className="corner-decoration bl" style={{ zIndex: 7 }} />
        <div className="corner-decoration br" style={{ zIndex: 7 }} />
      </div>

      {/* Caption below video */}
      <div className="flex items-center justify-between mt-4 px-1">
        <p
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            color: 'rgba(201,168,76,0.4)',
            textTransform: 'uppercase',
          }}
        >
          {isMuted ? '— Sound Off' : '— Sound On'}
        </p>
      </div>
    </section>
  )
}