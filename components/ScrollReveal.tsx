'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

type RevealStyle = 'fade-up' | 'fade' | 'scale' | 'slide-left' | 'slide-right'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: RevealStyle
}

const HIDDEN_STYLES: Record<RevealStyle, string> = {
  'fade-up': 'opacity-0 translate-y-8',
  fade: 'opacity-0',
  scale: 'opacity-0 scale-95',
  'slide-left': 'opacity-0 -translate-x-8',
  'slide-right': 'opacity-0 translate-x-8',
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  as = 'fade-up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : HIDDEN_STYLES[as]
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}