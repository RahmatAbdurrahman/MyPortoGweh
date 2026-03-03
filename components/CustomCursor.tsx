'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const blurRef = useRef<HTMLDivElement>(null)
  const discoverRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const blurPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const dot = dotRef.current
    const blur = blurRef.current
    const discover = discoverRef.current
    if (!dot || !blur || !discover) return

    // QuickTo for performant lerp cursor
    const xDot = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' })
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' })
    const xBlur = gsap.quickTo(blur, 'x', { duration: 0.5, ease: 'power3.out' })
    const yBlur = gsap.quickTo(blur, 'y', { duration: 0.5, ease: 'power3.out' })
    const xDiscover = gsap.quickTo(discover, 'x', { duration: 0.2, ease: 'power3.out' })
    const yDiscover = gsap.quickTo(discover, 'y', { duration: 0.2, ease: 'power3.out' })

    const onMouseMove = (e: MouseEvent) => {
      xDot(e.clientX)
      yDot(e.clientY)
      xBlur(e.clientX)
      yBlur(e.clientY)
      xDiscover(e.clientX)
      yDiscover(e.clientY)
    }

    const onProjectEnter = () => {
      discover.classList.add('active')
      dot.style.opacity = '0'
    }

    const onProjectLeave = () => {
      discover.classList.remove('active')
      dot.style.opacity = '1'
    }

    const onLinkEnter = () => {
      gsap.to(dot, { scale: 2, duration: 0.2 })
    }

    const onLinkLeave = () => {
      gsap.to(dot, { scale: 1, duration: 0.2 })
    }

    document.addEventListener('mousemove', onMouseMove)

    // Project images get discover cursor
    const bindProjectCursors = () => {
      document.querySelectorAll('.project-image-container').forEach((el) => {
        el.addEventListener('mouseenter', onProjectEnter)
        el.addEventListener('mouseleave', onProjectLeave)
      })

      document.querySelectorAll('a, button, .magnetic-btn, .social-link').forEach((el) => {
        el.addEventListener('mouseenter', onLinkEnter)
        el.addEventListener('mouseleave', onLinkLeave)
      })
    }

    // Observe DOM changes to bind new elements
    const observer = new MutationObserver(bindProjectCursors)
    observer.observe(document.body, { childList: true, subtree: true })
    bindProjectCursors()

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={blurRef} className="cursor-blur" />
      <div ref={discoverRef} className="cursor-discover">
        DISCOVER
      </div>
    </>
  )
}
