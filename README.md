# 👑 Imperial Portfolio — Rahmat Abdurrahman

> *Code forged in discipline. Interfaces carved in eternity.*

A world-class personal portfolio website built with the "Imperial Majesty" aesthetic — dark, regal, mysterious. Inspired by Qin Shi Huang from Record of Ragnarok.

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v3 + CSS Custom Properties |
| Animations | GSAP 3.12 + @gsap/react (useGSAP hook) |
| Smooth Scroll | Lenis (inertia/momentum) |
| 3D Physics | @react-three/fiber + @react-three/rapier |
| UI Motion | Framer Motion (magnetic buttons) |
| Fonts | Cinzel + Cormorant Garamond + Inter (next/font) |

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 🎨 Color Tokens

```css
--bg:         #0A0A0B    /* Page background (deep charcoal) */
--bg-glass:   #12060699  /* Glassmorphism surfaces (red tint) */
--accent-red: #C0272D    /* Primary accent (crimson) */
--accent-gold:#C9A84C    /* Interactive elements & highlights */
--text-primary:#F0EAD6   /* Body text (warm off-white) */
```

---

## 📁 Project Structure

```
imperial-portfolio/
├── app/
│   ├── globals.css          # All CSS variables, base styles
│   ├── layout.tsx           # Root layout with Cinzel/Cormorant fonts
│   └── page.tsx             # Main page orchestrator
├── components/
│   ├── LenisProvider.tsx    # Lenis smooth scroll + GSAP integration
│   ├── CustomCursor.tsx     # Lerp cursor + DISCOVER state
│   ├── Preloader.tsx        # Counter preloader with GSAP slide-out
│   ├── Hero.tsx             # Hero section with staggered GSAP animations
│   ├── MagneticButton.tsx   # Framer Motion magnetic CTA button
│   ├── Profile.tsx          # "The Sovereign" section with glass card
│   ├── Projects.tsx         # Aristide-style project showcase
│   ├── SkillStack.tsx       # 3D physics skill blocks (R3F + Rapier)
│   ├── VideoPlayer.tsx      # Audio-reactive fixed video widget
│   └── Footer.tsx           # "The Legacy" footer
└── public/
    ├── video/
    │   └── imperial-theme.mp4   ← ADD YOUR VIDEO HERE
    └── images/
        └── portrait.jpg         ← ADD YOUR PHOTO HERE
```

---

## 🖼️ Adding Your Content

### Portrait Photo (Profile Section)

Replace the placeholder in `components/Profile.tsx`:

```tsx
// Find the profile-placeholder div and replace with:
<Image
  src="/images/portrait.jpg"
  alt="Rahmat Abdurrahman"
  fill
  className="object-cover object-top"
  priority
/>
```

### Project Images

In `components/Projects.tsx`, add images to each project:

```tsx
// Inside project-image-container, replace placeholder with:
<Image
  src={`/images/projects/${project.id}.jpg`}
  alt={project.title}
  fill
  className="object-cover"
/>
```

### Background Video

Place your video at: `public/video/imperial-theme.mp4`

Recommended: Dark, cinematic loop (30–60 seconds)  
Consider: A slow pan of imperial/oriental architecture, smoke effects, or abstract dark visuals.

---

## ⌨️ Easter Eggs

- **Press any key** while viewing The Arsenal section → a new skill block falls from the sky
- **Click any skill block** → launches it with physics impulse
- **Drag mouse over blocks** → push them around with invisible cursor sphere

---

## 🔧 GSAP Integration Notes

All GSAP animations use the `useGSAP()` hook from `@gsap/react` for proper cleanup:

```tsx
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

useGSAP(() => {
  gsap.to(element, { ... })
}, { scope: containerRef })
```

ScrollTrigger is registered globally in `LenisProvider.tsx` and synced with Lenis scroll events.

---

## 🎵 Audio Visualizer

The video player uses the **Web Audio API**:
1. Creates an `AudioContext` on first unmute (browser policy)
2. Routes audio through an `AnalyserNode`
3. Reads frequency data at 60fps
4. Drives the `box-shadow` glow effect proportionally to bass

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npx vercel
```

### Netlify

```bash
npm run build
# Upload the .next folder
```

---

## 📝 Customization

### Change Name/Bio
Edit `components/Profile.tsx` — the bio text and stats.

### Add/Remove Projects  
Edit the `PROJECTS` array in `components/Projects.tsx`.

### Change Skill Blocks  
Edit the `SKILLS` array in `components/SkillStack.tsx`.

### Adjust Animation Timing  
In `components/Preloader.tsx`, change `minDuration` (milliseconds).

---

## 🏛️ "The Empire Never Sleeps."

*© Rahmat Abdurrahman*
