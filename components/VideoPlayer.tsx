'use client'

import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Shared audio context (Diperbarui untuk mendukung Iframe) ─────────────────
export const VideoAudioContext = createContext<{
  mediaRef: React.RefObject<HTMLIFrameElement> | null
  isMuted: boolean
  audioLevel: number
  toggle: () => void
}>({
  mediaRef: null,
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
interface VideoPlayerProps {
  startUnmuted?: boolean;
}

export default function VideoPlayer({ startUnmuted = false }: VideoPlayerProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  const [isMuted, setIsMuted] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)
  const animFrameRef = useRef<number>(0)

  // Expose to global context
  useEffect(() => {
    ;(window as any).__imperialVideoRef = iframeRef
    ;(window as any).__imperialToggleMute = toggleMute
  })

  // FAKE AUDIO ANALYSER
  useEffect(() => {
    if (isMuted) {
      setAudioLevel(0)
      cancelAnimationFrame(animFrameRef.current)
      return
    }

    const generateFakeAudio = () => {
      const time = Date.now() * 0.002
      const bass = (Math.sin(time) * 0.5 + 0.5) * 40
      const treble = Math.random() * 20
      setAudioLevel(bass + treble + 10) 
      animFrameRef.current = requestAnimationFrame(generateFakeAudio)
    }
    generateFakeAudio()

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isMuted])

  const toggleMute = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return
    
    // Sinyal ini cuma jalan kalau ada enablejsapi=1 di URL
    if (isMuted) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*')
      setIsMuted(false)
      window.dispatchEvent(new CustomEvent('imperial-mute-change', { detail: { muted: false } }))
    } else {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*')
      setIsMuted(true)
      window.dispatchEvent(new CustomEvent('imperial-mute-change', { detail: { muted: true } }))
    }
  }

  useEffect(() => {
    if (startUnmuted && iframeRef.current) {
      setTimeout(() => {
        if (!iframeRef.current?.contentWindow) return
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*')
        setIsMuted(false);
        window.dispatchEvent(new CustomEvent('imperial-mute-change', { detail: { muted: false } }));
      }, 500);
    }
  }, [startUnmuted]);

  useEffect(() => {
    const handleAutoStart = () => {
      if (isMuted) toggleMute();
    };
    window.addEventListener('imperial-autostart-unmuted', handleAutoStart);
    return () => window.removeEventListener('imperial-autostart-unmuted', handleAutoStart);
  }, [isMuted]);

  useGSAP(() => {
    gsap.fromTo(
      headingRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      }
    )
  }, { scope: sectionRef })

  const glowIntensity = Math.min(audioLevel / 55, 1)

  return (
    <section ref={sectionRef} id="showreel" className="px-[5vw] py-[10vh]">
      <div ref={headingRef} className="mb-10" style={{ opacity: 0 }}>
        <div className="section-eyebrow">Imperial Showreel</div>
        <h2 className="section-title">
          The Emperor&apos;s<br />
          <span className="text-gold">Cinematic Domain.</span>
        </h2>
      </div>

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
          backgroundColor: '#050203'
        }}
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <iframe
            ref={iframeRef}
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100%] min-w-[177.77%] -translate-x-1/2 -translate-y-1/2"
            src="https://www.youtube.com/embed/3d5BvyOkJs8?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=3d5BvyOkJs8&modestbranding=1&enablejsapi=1"
            title="Imperial Background Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(192,39,45,0.25) 0%, rgba(10,10,11,0.85) 45%, rgba(201,168,76,0.15) 100%)',
            zIndex: 0,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
            zIndex: 1,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,11,0.8) 100%)',
            zIndex: 2,
          }}
        />

        {!isMuted && (
          <div
            className="absolute inset-0 pointer-events-none rounded"
            style={{
              boxShadow: `inset 0 0 ${30 + glowIntensity * 60}px rgba(192,39,45,${glowIntensity * 0.3})`,
              zIndex: 3,
            }}
          />
        )}

        <VisualizerBars audioLevel={isMuted ? 0 : audioLevel} count={56} />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
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
              <div style={{ width: '40px', height: '1px', background: 'rgba(201,168,76,0.4)' }} />
            </div>
          )}
        </div>

        <button
          onClick={toggleMute}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'transparent', zIndex: 6, cursor: 'none' }}
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        />

        <div className="corner-decoration tl" style={{ zIndex: 7 }} />
        <div className="corner-decoration tr" style={{ zIndex: 7 }} />
        <div className="corner-decoration bl" style={{ zIndex: 7 }} />
        <div className="corner-decoration br" style={{ zIndex: 7 }} />
      </div>

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