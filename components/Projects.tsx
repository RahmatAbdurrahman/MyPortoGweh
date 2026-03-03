'use client'

import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

// ─── Types & Data ─────────────────────────────────────────────────────────────
type Category = 'ALL' | 'LIVE APPS' | 'SYSTEMS'

interface Project {
  id: string
  title: string
  subtitle: string
  desc: string
  tags: string[]
  category: Category[]
  accentColor: string
  year: string
}

const PROJECTS: Project[] = [
  {
    id: '01', title: 'BUDGY', subtitle: 'Personal Financial Management',
    desc: 'Platform manajemen keuangan personal — anggaran, investasi, dan laporan keuangan secara cerdas dalam satu domain.',
    tags: ['Next.js', 'Supabase', 'Chart.js'],
    category: ['LIVE APPS'], accentColor: '#C9A84C', year: '2024',
  },
  {
    id: '02', title: 'DESA JANTI', subtitle: 'Official Village Portal',
    desc: 'Portal resmi desa yang membawa pelayanan publik ke era digital — transparansi data dan aksesibilitas masyarakat.',
    tags: ['Next.js', 'CMS', 'PostgreSQL'],
    category: ['LIVE APPS'], accentColor: '#C0272D', year: '2024',
  },
  {
    id: '03', title: 'SCHOLAR', subtitle: 'Scholar Management System',
    desc: 'Sistem manajemen beasiswa komprehensif untuk administrasi, seleksi, dan monitoring penerima beasiswa secara terpusat.',
    tags: ['React', 'Node.js', 'MySQL'],
    category: ['SYSTEMS'], accentColor: '#C9A84C', year: '2023',
  },
  {
    id: '04', title: 'NUTRICALC+', subtitle: 'Health & Nutrition Platform',
    desc: 'Platform kesehatan dan nutrisi bertenaga AI — rekomendasi diet personal berdasarkan data biometrik pengguna.',
    tags: ['React', 'Python', 'FastAPI'],
    category: ['LIVE APPS', 'SYSTEMS'], accentColor: '#C0272D', year: '2024',
  },
  {
    id: '05', title: 'HIRELYTICS', subtitle: 'Recruitment Analytics Platform',
    desc: 'Dashboard analitik rekrutmen — mengubah data hiring menjadi insight strategis untuk keputusan talenta lebih cerdas.',
    tags: ['Next.js', 'D3.js', 'Supabase'],
    category: ['SYSTEMS'], accentColor: '#C9A84C', year: '2024',
  },
  {
    id: '06', title: 'AR MOBILE', subtitle: 'Interactive AR Project',
    desc: 'Aplikasi mobile berbasis Augmented Reality dengan logika interaktif yang mengaburkan batas antara dunia digital dan fisik.',
    tags: ['Unity', 'AR Foundation', 'C#'],
    category: ['LIVE APPS'], accentColor: '#C0272D', year: '2023',
  },
  {
    id: '07', title: 'NOTES APP', subtitle: 'Productivity Application',
    desc: 'Aplikasi catatan dengan organisasi cerdas, pencarian semantik, dan sinkronisasi real-time lintas perangkat.',
    tags: ['React Native', 'Expo', 'Firebase'],
    category: ['LIVE APPS'], accentColor: '#C9A84C', year: '2023',
  },
]

const TABS: Category[] = ['ALL', 'LIVE APPS', 'SYSTEMS']

// ─── Filter Tab Item ──────────────────────────────────────────────────────────
function TabItem({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  const xOff = useMotionValue(0)
  const springX = useSpring(xOff, { damping: 20, stiffness: 300 })
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        ref={btnRef}
        onClick={onClick}
        style={{ x: springX, cursor: 'none', background: 'none', border: 'none', padding: '0.25rem 0', display: 'block' }}
        onMouseMove={(e) => {
          if (!btnRef.current) return
          const rect = btnRef.current.getBoundingClientRect()
          xOff.set((e.clientX - (rect.left + rect.width / 2)) * 0.22)
        }}
        onMouseLeave={() => xOff.set(0)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <span style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: '0.7rem',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: isActive ? 'var(--accent-gold)' : 'rgba(240,234,214,0.32)',
          transition: 'color 0.35s ease',
          display: 'block',
        }}>
          {label}
        </span>
      </motion.button>

      {isActive && (
        <motion.div
          layoutId="tab-dot"
          style={{
            position: 'absolute', bottom: '-5px', left: '50%',
            transform: 'translateX(-50%)',
            width: '4px', height: '4px', borderRadius: '50%',
            background: 'var(--accent-gold)',
          }}
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        />
      )}
    </div>
  )
}

// ─── Single Project Item (Aristide Style) ──────────────────────────────────────
function ProjectItem({ project, index }: { project: Project; index: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const clipBoxRef = useRef<HTMLDivElement>(null)
  const imgInnerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Curtain: clip-path lifts from bottom
    gsap.fromTo(clipBoxRef.current,
      { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
      {
        clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
        duration: 1.5, ease: 'expo.out',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top 82%', once: true },
      }
    )

    // Parallax
    gsap.fromTo(imgInnerRef.current, { yPercent: 15 }, {
      yPercent: -15, ease: 'none',
      scrollTrigger: { trigger: wrapperRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    })

    // Title chars (Masking reveal)
    const chars = titleRef.current?.querySelectorAll('.ab-char')
    if (chars) {
      gsap.fromTo(chars, { y: '105%' }, {
        y: '0%', duration: 1.1, stagger: 0.035, ease: 'expo.out',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top 75%', once: true },
      })
    }

    // Meta fade (Muncul dari bawah perlahan)
    gsap.fromTo(metaRef.current, { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.2,
      scrollTrigger: { trigger: wrapperRef.current, start: 'top 70%', once: true },
    })
  }, { scope: wrapperRef })

  const hoverIn = () => {
    gsap.to(imgInnerRef.current, { scale: 1.05, duration: 1.2, ease: 'expo.out' })
    gsap.to(overlayRef.current, { opacity: 1, duration: 0.5 })
    window.dispatchEvent(new CustomEvent('project-hover', { detail: { active: true } }))
  }
  const hoverOut = () => {
    gsap.to(imgInnerRef.current, { scale: 1, duration: 1.2, ease: 'expo.out' })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.5 })
    window.dispatchEvent(new CustomEvent('project-hover', { detail: { active: false } }))
  }

  const isEven = index % 2 === 1
  const chars = project.title.split('')

  return (
    <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '28vh', width: '100%' }}>
      
      {/* 1. IMAGE CONTAINER (Massive, 80vw width, alternating sides) */}
      <div style={{
        width: '85vw',
        height: '75vh',
        marginLeft: isEven ? 'auto' : '0',
        marginRight: isEven ? '0' : 'auto',
        position: 'relative',
      }}>
        <div
          ref={clipBoxRef}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          style={{
            clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            position: 'relative',
            cursor: 'none',
          }}
        >
          <div
            ref={imgInnerRef}
            style={{ width: '100%', height: '130%', marginTop: '-15%', position: 'relative', transformOrigin: 'center center' }}
          >
            {/* Placeholder Background - Nanti lu bisa ganti pakai <Image /> Next.js */}
            <div style={{
              width: '100%', height: '100%', position: 'relative',
              background: `linear-gradient(135deg, ${project.accentColor}22 0%, rgba(10,10,11,0.96) 55%, ${project.accentColor}12 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Pattern grid halus biar elegan */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `linear-gradient(${project.accentColor}08 1px, transparent 1px), linear-gradient(90deg, ${project.accentColor}08 1px, transparent 1px)`,
                backgroundSize: '100px 100px',
              }} />
            </div>
          </div>
          {/* Hover overlay for darkening */}
          <div ref={overlayRef} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.4)', opacity: 0, zIndex: 2, pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* 2. GIANT FLOATING TITLE (Aristide Signature) */}
      <div
        ref={titleRef}
        style={{
          position: 'absolute',
          top: '35%',
          left: isEven ? '-2%' : 'auto',
          right: isEven ? 'auto' : '-2%',
          fontFamily: 'var(--font-cinzel)',
          fontSize: 'clamp(3rem, 11vw, 12rem)', // Brutal size
          fontWeight: 400, lineHeight: 0.85, letterSpacing: '-0.03em',
          display: 'flex', flexWrap: 'wrap', gap: '0 0.02em',
          zIndex: 10,
          pointerEvents: 'none', // Biar gak ganggu hover gambar
          textShadow: '0 10px 40px rgba(0,0,0,0.8)', // Depth shadow
        }}
      >
        {chars.map((ch, i) => (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.1em' }}>
            <span className="ab-char" style={{ display: 'inline-block', transform: 'translateY(105%)', color: 'var(--text-primary)' }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          </span>
        ))}
      </div>

      {/* 3. META DATA (Floating Box) */}
      <div
        ref={metaRef}
        style={{
          position: 'absolute',
          bottom: '-12%',
          left: isEven ? '5%' : 'auto',
          right: isEven ? 'auto' : '5%',
          width: '90%',
          maxWidth: '400px',
          background: 'rgba(10, 10, 11, 0.85)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${project.accentColor}30`,
          padding: '2rem',
          zIndex: 15,
          opacity: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.3em', color: project.accentColor }}>{project.id}</span>
          <span style={{ flex: 1, height: '1px', background: `${project.accentColor}30` }} />
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(240,234,214,0.4)' }}>{project.year}</span>
        </div>

        <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', letterSpacing: '0.2em', color: project.accentColor, textTransform: 'uppercase', marginBottom: '1rem' }}>
          {project.subtitle}
        </p>

        <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(240,234,214,0.6)', marginBottom: '1.8rem' }}>
          {project.desc}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {project.tags.map((t) => (
            <span key={t} style={{
              fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', letterSpacing: '0.15em',
              color: `${project.accentColor}90`, border: `1px solid ${project.accentColor}30`,
              padding: '0.3rem 0.6rem', borderRadius: '2px',
            }}>{t}</span>
          ))}
        </div>

        <a href="#" onClick={(e) => e.preventDefault()} style={{
          fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.25em',
          color: project.accentColor, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'none',
          borderBottom: `1px solid ${project.accentColor}40`, paddingBottom: '4px',
          transition: 'gap 0.3s, border-color 0.3s',
        }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.gap = '1rem'; el.style.borderColor = project.accentColor }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.gap = '0.6rem'; el.style.borderColor = `${project.accentColor}40` }}
        >EXPLORE DOMAIN ↗</a>
      </div>

    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<Category>('ALL')

  const filtered = activeTab === 'ALL' ? PROJECTS : PROJECTS.filter((p) => p.category.includes(activeTab))

  useGSAP(() => {
    gsap.fromTo(headerRef.current, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: headerRef.current, start: 'top 80%', once: true },
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="projects" style={{ padding: '10vh 5vw', overflow: 'hidden' }}>
      {/* Header */}
      <div ref={headerRef} style={{ marginBottom: '15vh', opacity: 0 }}>
        <div className="section-eyebrow">Selected Works</div>
        <h2 className="section-title" style={{ marginBottom: '3rem' }}>
          Projects Carved<br />
          <span className="text-gold">Into History.</span>
        </h2>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', marginBottom: '3rem' }}>
          {TABS.map((tab) => (
            <TabItem key={tab} label={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} />
          ))}
          <span style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', letterSpacing: '0.22em',
            color: 'rgba(240,234,214,0.22)', textTransform: 'uppercase',
          }}>
            {filtered.length} / {PROJECTS.length}
          </span>
        </div>

        {/* Separator */}
        <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, rgba(201,168,76,0.28), rgba(201,168,76,0.04))' }} />
      </div>

      {/* List */}
      <div style={{ paddingTop: '5vh' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
          >
            {filtered.map((p, i) => <ProjectItem key={p.id} project={p} index={i} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}