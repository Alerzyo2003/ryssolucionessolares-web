'use client'

import { useEffect, useState } from 'react'

// Simulación ilustrativa: no son datos reales de un sistema.
export default function EnergyFlow() {
  const [t, setT] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setT((v) => v + 0.12), 120)
    return () => clearInterval(id)
  }, [])

  const gen = 4.2 + Math.sin(t) * 0.5          // kW generados
  const home = 1.6 + Math.sin(t * 1.7 + 1) * 0.3 // kW consumidos
  const grid = Math.max(gen - home, 0)         // kW inyectados

  return (
    <div className="rounded-3xl bg-[#071A30] p-5 text-white shadow-2xl ring-1 ring-white/10 md:p-7">
      <style>{`
        @keyframes flow { to { stroke-dashoffset: -24 } }
        @keyframes ray { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        .flow { stroke-dasharray: 6 6; animation: flow 1s linear infinite }
        .ray { animation: ray 2.4s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .flow, .ray { animation: none } }
      `}</style>

      <svg viewBox="0 0 640 260" className="w-full" role="img" aria-label="Diagrama: el sol alimenta los paneles, el inversor entrega energía a la casa y los excedentes a la red">
        {/* Sol */}
        <circle cx="62" cy="70" r="26" fill="#FDB92E" />
        <circle cx="62" cy="70" r="40" fill="#FF6A00" opacity=".25" className="ray" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="62" y1="70" x2={62 + Math.cos((a * Math.PI) / 180) * 50} y2={70 + Math.sin((a * Math.PI) / 180) * 50} stroke="#FDB92E" strokeWidth="2" strokeLinecap="round" className="ray" style={{ animationDelay: `${a / 360}s` }} opacity=".6" />
        ))}
        <text x="62" y="140" textAnchor="middle" fontSize="13" fill="#94A3B8">Sol</text>

        {/* Paneles */}
        <g transform="translate(150 40) skewX(-18)">
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} x={c * 34} y={r * 24} width="30" height="20" rx="2" fill="#0B4F8A" stroke="#38BDF8" strokeOpacity=".5" />
          )))}
        </g>
        <text x="205" y="140" textAnchor="middle" fontSize="13" fill="#94A3B8">Paneles</text>

        {/* Inversor */}
        <rect x="300" y="82" width="64" height="56" rx="10" fill="#0A2A4A" stroke="#FF6A00" strokeWidth="2" />
        <text x="332" y="116" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FDB92E">DC→AC</text>
        <text x="332" y="158" textAnchor="middle" fontSize="13" fill="#94A3B8">Inversor</text>

        {/* Casa */}
        <path d="M500 96 L545 58 L590 96 V138 H500 Z" fill="#0A2A4A" stroke="#38BDF8" strokeWidth="2" strokeLinejoin="round" />
        <rect x="533" y="110" width="24" height="28" rx="2" fill="#FDB92E" opacity=".9" />
        <text x="545" y="158" textAnchor="middle" fontSize="13" fill="#94A3B8">Tu casa</text>

        {/* Red */}
        <path d="M530 200 L545 232 L560 200 M520 212 H570 M526 224 H564" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" />
        <text x="545" y="252" textAnchor="middle" fontSize="13" fill="#94A3B8">Red eléctrica</text>

        {/* Flujos */}
        <path d="M108 78 C 130 78, 135 78, 150 80" stroke="#FDB92E" strokeWidth="3" fill="none" className="flow" />
        <path d="M250 90 H300" stroke="#FDB92E" strokeWidth="3" fill="none" className="flow" />
        <path d="M364 106 H500" stroke="#38BDF8" strokeWidth="3" fill="none" className="flow" />
        <path d="M332 138 C 332 190, 420 200, 520 205" stroke="#34D399" strokeWidth="3" fill="none" className="flow" />
      </svg>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          { l: 'Generas', v: gen, c: 'text-amber-300' },
          { l: 'Consume tu casa', v: home, c: 'text-sky-300' },
          { l: 'Inyectas a la red', v: grid, c: 'text-emerald-300' },
        ].map(({ l, v, c }) => (
          <div key={l} className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <dt className="text-[11px] text-slate-400 md:text-xs">{l}</dt>
            <dd className={`mt-1 text-xl font-extrabold tabular-nums md:text-2xl ${c}`}>{v.toFixed(1)} <span className="text-xs font-medium text-slate-400">kW</span></dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-center text-xs text-slate-500">Simulación ilustrativa de un sistema residencial conectado a la red.</p>
    </div>
  )
}