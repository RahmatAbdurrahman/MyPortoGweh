'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Preloader from '@/components/Preloader'
import CustomCursor from '@/components/CustomCursor'
import VideoGate from '@/components/VideoGate'
import Hero from '@/components/Hero'
import Profile from '@/components/Profile'
import Projects from '@/components/Projects'
import VideoPlayer from '@/components/VideoPlayer'
  import SoundToggle from '@/components/SoundToggle'
import Footer from '@/components/Footer'
import LenisProvider from '@/components/LenisProvider'

const SkillStack = dynamic(() => import('@/components/SkillStack'), {
  ssr: false,
  loading: () => (
    <div className="arsenal-section">
      <div className="physics-canvas-wrapper flex items-center justify-center">
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.3)', textTransform: 'uppercase' }}>
          Loading The Arsenal...
        </span>
      </div>
    </div>
  ),
})

type Stage = 'loading' | 'gate' | 'site'

export default function Home() {
  const [stage, setStage] = useState<Stage>('loading')
  // true = user chose unmute, false = muted (set before site renders)
  const [startUnmuted, setStartUnmuted] = useState(false)

  const handlePreloaderComplete = () => {
    setStage('gate')
  }

  const handleGateChoice = (unmuted: boolean) => {
    setStartUnmuted(unmuted)
    setStage('site')
    // Tell VideoPlayer to unmute on mount if user chose "BIARKAN BERGEMA"
    if (unmuted) {
      window.dispatchEvent(new CustomEvent('imperial-autostart-unmuted'))
    }
  }

  return (
    <>
      <CustomCursor />

      {/* Stage 1 — Preloader */}
      {stage === 'loading' && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      {/* Stage 2 — Audio Gate popup (overlay above black screen) */}
      {stage === 'gate' && (
        <VideoGate onChoice={handleGateChoice} />
      )}

      {/* Stage 3 — Main site */}
      {stage === 'site' && (
        <>
          {/* Fixed bottom-left sound toggle */}
          <SoundToggle />

          <LenisProvider>
            <main className="relative bg-[#0A0A0B] min-h-screen">
              <Hero />
              <Profile />
              <Projects />
              <SkillStack />
              <VideoPlayer startUnmuted={startUnmuted} />
              <Footer />
            </main>
          </LenisProvider>
        </>
      )}
    </>
  )
}
