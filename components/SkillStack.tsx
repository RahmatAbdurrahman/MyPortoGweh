'use client'

// ─── Imperial Bookshelf ("The Codex") ─────────────────────────────────────────
//  REST  : spine (±X, thin) faces camera  →  group.rotation.y = +π/2 + fanAngle
//  HOVER : cover (±Z, wide) faces camera  →  group.rotation.y animates → fanAngle
//          + hovered book pulls forward (PULL_Z)
//          + neighbours slide sideways to open space (SPREAD_X)
//  Background: pure blood red (#1a0000)
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Stars, Environment, Float, MeshDistortMaterial, Image } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

// ─── Font Lokal ───────────────────────────────────────────────────────────────
const FONT  = '/fonts/cinzel.ttf'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-+ ◆·/'

// ─── Book dimensions ──────────────────────────────────────────────────────────
const BW      = 0.92    // cover width  (X)
const BH      = 5.4     // height       (Y)
const BD      = 0.32    // spine depth  (Z) — thicker now
const GAP     = 0.18    // gap between books — wider now
const STEP    = BD + GAP
const PULL_Z  = 2.6     // hovered book moves toward camera
const SPREAD  = 0.9     // neighbour books spread sideways

// ─── Anti-lag globals ─────────────────────────────────────────────────────────
const SCROLL_STATE = { progress: 0 }
const CAM = { targetX: 0, targetY: 0.4, targetZ: 12 }

// ─── Shared hover state (which index is hovered) ──────────────────────────────
const HOVER_STATE = { index: -1 }

// ─── Skill data ───────────────────────────────────────────────────────────────
const SKILLS = [
  { name: 'Next.js',    logo: '/logos/nextjs.png',       accent: '#C9A84C', dim: '#7a6228', body: '#0a0906' },
  { name: 'React',      logo: '/logos/react.png',      accent: '#e05060', dim: '#7a2535', body: '#0a0308' },
  { name: 'TypeScript', logo: '/logos/typescript.png', accent: '#C9A84C', dim: '#7a6228', body: '#0a0906' },
  { name: 'Tailwind',   logo: '/logos/tailwind.png',   accent: '#e05060', dim: '#7a2535', body: '#0a0308' },
  { name: 'Supabase',   logo: '/logos/supabase.png',   accent: '#C9A84C', dim: '#7a6228', body: '#0a0906' },
  { name: 'GSAP',       logo: '/logos/gsap.png',       accent: '#e05060', dim: '#7a2535', body: '#0a0308' },
  { name: 'Three.js',   logo: '/logos/threejs.png',      accent: '#C9A84C', dim: '#7a6228', body: '#0a0906' },
  { name: 'OpenCV',     logo: '/logos/opencv.png',     accent: '#e05060', dim: '#7a2535', body: '#0a0308' },
  { name: 'Python',     logo: '/logos/python.png',     accent: '#C9A84C', dim: '#7a6228', body: '#0a0906' },
  { name: 'Node.js',    logo: '/logos/nodejs.png',     accent: '#e05060', dim: '#7a2535', body: '#0a0308' },
  { name: 'PostgreSQL', logo: '/logos/postgresql.png', accent: '#C9A84C', dim: '#7a6228', body: '#0a0906' },
  { name: 'Framer',     logo: '/logos/framer.png',     accent: '#e05060', dim: '#7a2535', body: '#0a0308' },
] as const

// ─── Row layout ───────────────────────────────────────────────────────────────
function buildRow(count: number) {
  const total = (count - 1) * STEP
  return Array.from({ length: count }, (_, i) => {
    const t         = i / (count - 1)
    const baseX     = (t - 0.5) * total
    const zArc      = -Math.pow((t - 0.5) * 1.8, 2) * 0.28
    const fanAngle  = (t - 0.5) * 0.07
    const delay     = i * 0.068
    return { baseX, zArc, fanAngle, delay }
  })
}
const ROW = buildRow(SKILLS.length)

// ─── Mystic cloth backdrop ────────────────────────────────────────────────────
function MysticCloth() {
  return (
    <Float speed={0.36} rotationIntensity={0.05} floatIntensity={0.45} floatingRange={[-0.18, 0.18]}>
      <mesh position={[0, 0.6, -20]} rotation={[0.04, 0, 0]}>
        <planeGeometry args={[32, 22, 36, 28]} />
        <MeshDistortMaterial
          color="#3a0000"
          distort={0.14}
          speed={0.5}
          roughness={0.86}
          metalness={0.04}
          emissive="#220000"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  )
}

// ─── Safe <Text> with wireframe fallback ─────────────────────────────────────
function SafeText({
  position, rotation, fontSize, letterSpacing, maxWidth,
  anchorX = 'center', anchorY = 'middle', color, children,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  fontSize: number
  letterSpacing?: number
  maxWidth?: number
  anchorX?: 'left' | 'center' | 'right'
  anchorY?: 'top' | 'middle' | 'bottom'
  color: string
  children: string
}) {
  return (
    <Suspense fallback={
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[fontSize * 2, fontSize * 1.4, 0.002]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
    }>
      <Text
        position={position} rotation={rotation}
        fontSize={fontSize} letterSpacing={letterSpacing}
        maxWidth={maxWidth} anchorX={anchorX} anchorY={anchorY}
        font={FONT} 
      >
        <meshBasicMaterial color={color} toneMapped={false} />
        {children}
      </Text>
    </Suspense>
  )
}

// ─── Single Book ──────────────────────────────────────────────────────────────
function Book({
  skill, row, idx, seed,
}: {
  skill: typeof SKILLS[number]
  row:   typeof ROW[number]
  idx:   number
  seed:  number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [hov, setHov] = useState(false)

  // Animated refs (no state → no re-render)
  const rotYRef    = useRef(Math.PI / 2 + row.fanAngle)
  const posXRef    = useRef(row.baseX)
  const posZRef    = useRef(row.zArc)
  const revealYRef = useRef(-5)

  const bodyVec   = new THREE.Color(skill.body)
  const accentVec = new THREE.Color(skill.accent)

  // Surface offsets
  const SX  = BW / 2 + 0.006
  const CZ  = BD / 2 + 0.006
  // Spine text rotation: face +X direction
  const SR0: [number, number, number] = [0, Math.PI / 2, 0]
  const SR1: [number, number, number] = [0, Math.PI / 2, -Math.PI / 2]  // vertical

  useFrame((_, dt) => {
    if (!groupRef.current) return
    const k6 = Math.min(1, dt * 6.5)
    const k5 = Math.min(1, dt * 5.5)

    // ── Scroll reveal ──
    const raw   = SCROLL_STATE.progress
    const lp    = Math.max(0, Math.min(1, (raw - row.delay * 0.82) / 0.58))
    const eased = lp === 0 ? 0 : 1 - Math.pow(2, -10 * lp)
    revealYRef.current += (-5 + eased * 5 - revealYRef.current) * k5
    groupRef.current.position.y = revealYRef.current

    // ── Hover: pull forward + rotate to cover ──
    const hovered = HOVER_STATE.index === idx
    const targetRot = hovered ? row.fanAngle : (Math.PI / 2 + row.fanAngle)
    rotYRef.current += (targetRot - rotYRef.current) * k6
    groupRef.current.rotation.y = rotYRef.current

    const targetZ = row.zArc + (hovered ? PULL_Z : 0)
    posZRef.current += (targetZ - posZRef.current) * k6
    groupRef.current.position.z = posZRef.current

    // ── Neighbour spread ──
    const hi = HOVER_STATE.index
    let spreadX = 0
    if (hi >= 0 && hi !== idx) {
      const dir = idx < hi ? -1 : 1
      const dist = Math.abs(idx - hi)
      const falloff = Math.max(0, 1 - (dist - 1) * 0.35)
      spreadX = dir * SPREAD * falloff
    }
    const targetX = row.baseX + spreadX
    posXRef.current += (targetX - posXRef.current) * k6
    groupRef.current.position.x = posXRef.current
  })

  const handleEnter = (e: any) => {
    e.stopPropagation()
    HOVER_STATE.index = idx
    setHov(true)
  }
  const handleLeave = () => {
    HOVER_STATE.index = -1
    setHov(false)
  }

  return (
    <group ref={groupRef} position={[row.baseX, -5, row.zArc]}>
      <Float
        speed={0.42 + seed * 0.3}
        rotationIntensity={0.01 + seed * 0.007}
        floatIntensity={0.05 + seed * 0.04}
        floatingRange={[-0.04, 0.04]}
      >
        {/* ── Body ── */}
        <mesh castShadow onPointerEnter={handleEnter} onPointerLeave={handleLeave}>
          <boxGeometry args={[BW, BH, BD]} />
          <meshStandardMaterial
            color={bodyVec}
            roughness={0.16}
            metalness={0.5}
            emissive={accentVec}
            emissiveIntensity={hov ? 0.12 : 0.028}
            envMapIntensity={2.2}
          />
        </mesh>

        {/* ── Spine: gold edge strip ── */}
        <mesh position={[BW / 2, 0, 0]}>
          <boxGeometry args={[0.008, BH, BD + 0.006]} />
          <meshBasicMaterial color={hov ? skill.accent : skill.dim} toneMapped={false} />
        </mesh>

        {/* ── Binding bands top & bottom ── */}
        {[BH / 2 - 0.22, -(BH / 2 - 0.22)].map((y, li) => (
          <mesh key={li} position={[0, y, 0]}>
            <boxGeometry args={[BW + 0.01, 0.13, BD + 0.01]} />
            <meshBasicMaterial color="#500000" toneMapped={false} />
          </mesh>
        ))}

        {/* ── SPINE CONTENT ── */}
        {/* Logo top (Punggung Buku) */}
        <Suspense fallback={null}>
          <Image
            url={skill.logo}
            position={[SX, BH * 0.3, 0]}
            rotation={SR0}
            scale={0.16} 
            transparent={true}
            color={hov ? skill.accent : skill.dim} // Memberi warna (tint) emas/merah ke logo
          />
        </Suspense>

        {/* Center rule on spine */}
        <mesh position={[SX - 0.004, 0, 0]}>
          <planeGeometry args={[BH - 1.2, 0.006]} />
          <meshBasicMaterial color={hov ? skill.accent : skill.dim} toneMapped={false} side={THREE.FrontSide} />
        </mesh>

        {/* Skill name vertical */}
        <SafeText
          position={[SX, -BH * 0.05, 0]}
          rotation={SR1}
          fontSize={0.1}
          letterSpacing={0.5}
          maxWidth={BH - 1.4}
          color={hov ? skill.accent : skill.dim}
        >{skill.name.toUpperCase()}</SafeText>

        {/* Ornament bottom */}
        <SafeText
          position={[SX, -(BH / 2 - 0.46), 0]}
          rotation={SR0}
          fontSize={0.046}
          color={skill.dim}
        >{'◆'}</SafeText>

        {/* ── COVER CONTENT ── */}
        {/* Border frame */}
        {[
          { p: [0,  BH/2-0.08, CZ] as [number,number,number], s: [BW-0.05, 0.006] as [number,number] },
          { p: [0, -BH/2+0.08, CZ] as [number,number,number], s: [BW-0.05, 0.006] as [number,number] },
          { p: [-(BW/2-0.07), 0, CZ] as [number,number,number], s: [0.006, BH-0.16] as [number,number] },
          { p: [ BW/2-0.07,  0, CZ] as [number,number,number], s: [0.006, BH-0.16] as [number,number] },
        ].map((e, i) => (
          <mesh key={i} position={e.p}>
            <planeGeometry args={[e.s[0], e.s[1]]} />
            <meshBasicMaterial color={skill.accent} toneMapped={false} />
          </mesh>
        ))}

        {/* Inner border */}
        {[
          { p: [0,  BH/2-0.19, CZ] as [number,number,number], s: [BW-0.26, 0.003] as [number,number] },
          { p: [0, -BH/2+0.19, CZ] as [number,number,number], s: [BW-0.26, 0.003] as [number,number] },
        ].map((e, i) => (
          <mesh key={i} position={e.p}>
            <planeGeometry args={[e.s[0], e.s[1]]} />
            <meshBasicMaterial color={skill.dim} toneMapped={false} />
          </mesh>
        ))}

        {/* Large Logo (Sampul Depan) */}
        <Suspense fallback={null}>
          <Image 
            url={skill.logo} 
            position={[0, BH*0.15, CZ]} 
            scale={0.45} 
            transparent={true}
            color={skill.accent} // Memberi warna (tint) emas/merah ke logo
          />
        </Suspense>

        {/* Divider */}
        <mesh position={[0, -BH*0.09, CZ]}>
          <planeGeometry args={[BW-0.26, 0.005]} />
          <meshBasicMaterial color={skill.accent} toneMapped={false} />
        </mesh>

        {/* Skill name */}
        <SafeText position={[0, -BH*0.18, CZ]} fontSize={0.092} letterSpacing={0.36} color={skill.accent}>
          {skill.name.toUpperCase()}
        </SafeText>

        {/* Subtitle */}
        <SafeText position={[0, -BH*0.275, CZ]} fontSize={0.05} letterSpacing={0.28} color={skill.dim}>
          {'IMPERIAL CODEX'}
        </SafeText>

        {/* Ornament */}
        <SafeText position={[0, -(BH/2-0.32), CZ]} fontSize={0.062} letterSpacing={0.5} color={skill.accent}>
          {'◆  ·  ◆'}
        </SafeText>

        {/* ── Lights ── */}
        <pointLight position={[0, 0, -BD/2-0.6]} color={skill.accent} intensity={hov ? 8 : 0} distance={12} decay={2} />
        <pointLight position={[0, 0,  BD/2+1.0]} color={skill.accent} intensity={hov ? 4 : 0} distance={6}  decay={2} />
      </Float>
    </group>
  )
}

// ─── Camera rig ───────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree()
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 2.2)
    camera.position.x += (CAM.targetX - camera.position.x) * k
    camera.position.y += (CAM.targetY - camera.position.y) * k
    camera.position.z += (CAM.targetZ - camera.position.z) * k
    camera.lookAt(0, 0.3, -2)
  })
  return null
}

// ─── Force scene background color ────────────────────────────────────────────
function SceneBG() {
  const { scene } = useThree()
  useEffect(() => {
    scene.background = new THREE.Color('#1a0000')
  }, [scene])
  return null
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene() {
  const seeds = useRef(SKILLS.map(() => Math.random())).current
  return (
    <>
      <SceneBG />
      <CameraRig />
      <Environment preset="city" />
      <Stars radius={80} depth={50} count={700} factor={2} saturation={0} fade speed={0.15} />

      {/* Lighting tuned for blood-red void */}
      <ambientLight intensity={0.7}  color="#2a0808" />
      <spotLight position={[0, 18, 5]} angle={0.5} penumbra={0.9} intensity={100} color="#E8C860"
        castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[0, 3, -14]} intensity={1.5} color="#800000" />
      <pointLight position={[-12, 3, 2]} intensity={5}   color="#C0272D" distance={26} decay={2} />
      <pointLight position={[ 12, 3, 2]} intensity={3.5} color="#C9A84C" distance={26} decay={2} />
      <pointLight position={[  0,-1, 3]} intensity={3}   color="#C9A84C" distance={14} decay={2} />

      <MysticCloth />

      {SKILLS.map((skill, i) => (
        <Book key={skill.name} skill={skill} row={ROW[i]} idx={i} seed={seeds[i]} />
      ))}
    </>
  )
}

// ─── Section export ───────────────────────────────────────────────────────────
export default function SkillStack() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const wrapRef    = useRef<HTMLDivElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const legendRef  = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { rootMargin: '250px' }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  useGSAP(() => {
    if (!sectionRef.current) return

    gsap.fromTo(headerRef.current, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: headerRef.current, start: 'top 80%', once: true },
    })

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 68%', end: 'top 12%',
      onUpdate: (st) => { SCROLL_STATE.progress = st.progress },
    })

    gsap.to(CAM, {
      targetZ: 6.5, targetY: 0.2, ease: 'none',
      scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: 2 },
    })

    const xTl = gsap.timeline({
      scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: 3.5 },
    })
    xTl.to(CAM, { targetX: -0.6, ease: 'sine.inOut' })
       .to(CAM, { targetX:  0.6, ease: 'sine.inOut' })
       .to(CAM, { targetX:  0,   ease: 'sine.inOut' })

    gsap.fromTo(legendRef.current, { opacity: 0 }, {
      opacity: 1, duration: 1.5,
      scrollTrigger: { trigger: wrapRef.current, start: 'top 55%', once: true },
    })
  }, { scope: sectionRef })

  useEffect(() => () => {
    CAM.targetX = 0; CAM.targetY = 0.4; CAM.targetZ = 12
    SCROLL_STATE.progress = 0
    HOVER_STATE.index = -1
  }, [])

  return (
    <div ref={sectionRef} id="skills" style={{ position: 'relative', background: '#1a0000' }}>

      <div ref={headerRef} style={{ padding: '10vh 5vw 4vh', opacity: 0, background: '#1a0000' }}>
        <div className="section-eyebrow">The Codex</div>
        <h2 className="section-title">
          Weapons of<br />
          <span className="text-gold">Digital Conquest.</span>
        </h2>
        <p style={{
          fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
          fontSize: '1.1rem', color: 'rgba(240,234,214,0.42)',
          marginTop: '1rem', maxWidth: '460px',
        }}>
          Dua belas kodeks kekaisaran berjejer dalam keabadian. Hover untuk membuka sisi depan. Buku lainnya akan memberi ruang.
        </p>
      </div>

      <div style={{ height: '280vh', position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%' }}>
          <div ref={wrapRef} style={{ width: '100%', height: '100%', position: 'relative', background: '#1a0000' }}>

            {visible ? (
              <Canvas
                camera={{ position: [0, 0.4, 12], fov: 46 }}
                gl={{
                  antialias: true, alpha: false,
                  powerPreference: 'high-performance',
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.2,
                }}
                dpr={[1, 1.6]}
                style={{ width: '100%', height: '100%' }}
              >
                <Suspense fallback={null}>
                  <Scene />
                </Suspense>
              </Canvas>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a0000' }}>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', letterSpacing: '0.4em', color: 'rgba(201,168,76,0.35)', textTransform: 'uppercase' }}>
                  Awakening The Codex...
                </span>
              </div>
            )}

            {/* Vignettes */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
              <div style={{ position: 'absolute', top:    0, left: 0, right: 0, height: '20%', background: 'linear-gradient(to bottom, #1a0000, transparent)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%', background: 'linear-gradient(to top,    #1a0000, transparent)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 28%, rgba(20,0,0,0.65) 100%)' }} />
            </div>

            {/* Legend */}
            <div ref={legendRef} style={{
              position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.9rem', justifyContent: 'center',
              maxWidth: '640px', zIndex: 6, opacity: 0, pointerEvents: 'none',
            }}>
              {SKILLS.map((s) => (
                <span key={s.name} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: s.accent + 'AA' }}>
                  {s.name}
                </span>
              ))}
            </div>

            {/* Hints */}
            <div style={{ position: 'absolute', top: '1.8rem', left: '2rem', zIndex: 6 }}>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.28em', color: 'rgba(201,168,76,0.3)', textTransform: 'uppercase' }}>Hover A Codex</span>
            </div>
            <div style={{ position: 'absolute', top: '1.8rem', right: '2rem', zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.28em', color: 'rgba(201,168,76,0.3)', textTransform: 'uppercase' }}>Scroll To Enter</span>
              <div style={{ width: '1px', height: '34px', background: 'linear-gradient(to bottom, rgba(201,168,76,0.4), transparent)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}