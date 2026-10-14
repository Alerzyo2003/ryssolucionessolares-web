'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const SolarBuild3D = dynamic(() => import('./SolarBuild3D'), { ssr: false })

/* ---------- utilidades ---------- */

function useScroll() {
  const [s, setS] = useState({ y: 0, page: 0, vh: 1 })
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setS({ y: window.scrollY, page: max > 0 ? Math.min(window.scrollY / max, 1) : 0, vh: window.innerHeight })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return s
}

/* ---------- barra superior ---------- */

export function SunProgress() {
  const { page } = useScroll()
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1">
      <div
        className="h-full bg-gradient-to-r from-[#FDBA2D] via-[#FF6200] to-[#3B82F6]"
        style={{ width: `${page * 100}%` }}
      />
    </div>
  )
}

/* ---------- sol del hero ---------- */

export function HeroSun() {
  const { y, vh } = useScroll()
  const t = Math.min(y / (vh * 0.9), 1)
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[620px] w-[620px] will-change-transform"
      style={{ transform: `translate(${-t * 120}px, ${t * 200}px) scale(${1 + t * 0.25})` }}
    >
      <div
        className="sunrise h-full w-full rounded-full blur-2xl"
        style={{ background: 'radial-gradient(circle at 40% 40%, #FDB92E 0%, #FF6A00 45%, transparent 70%)', opacity: 0.6 }}
      />
    </div>
  )
}

/* ---------- ya no se usa (se deja para no romper page.tsx) ---------- */

export function NightSky() {
  return null
}

/* ---------- panel 3D que se arma con el scroll ---------- */

export function DayClock() {
  return <SolarBuild3D />
}