'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

const clp = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

// Estimación orientativa: un sistema bien dimensionado cubre ~60–80% de la cuenta.
const LOW = 0.6
const HIGH = 0.8

export default function SavingsCalculator() {
  const [bill, setBill] = useState(60000)
  const monthlyLow = Math.round(bill * LOW)
  const monthlyHigh = Math.round(bill * HIGH)

  return (
    <div className="rounded-3xl bg-white p-6 md:p-7 shadow-2xl shadow-black/30 ring-1 ring-white/20">
      <h3 className="text-lg font-bold text-[#0A2A4A]">¿Cuánto podrías ahorrar?</h3>
      <p className="text-sm text-slate-500 mt-1">Mueve la barra según tu cuenta de luz mensual.</p>

      <div className="mt-6 flex items-baseline justify-between">
        <label htmlFor="bill" className="text-sm text-slate-600">Cuenta mensual</label>
        <output className="text-2xl font-extrabold text-[#0A2A4A]">{clp(bill)}</output>
      </div>
      <input
        id="bill"
        type="range"
        min={20000}
        max={500000}
        step={5000}
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
        className="mt-3 w-full accent-orange-600 cursor-pointer"
      />

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 p-5 text-white">
        <p className="text-sm font-medium text-white/90">Ahorro estimado por mes</p>
        <p className="mt-1 text-2xl md:text-3xl font-extrabold leading-tight">
          {clp(monthlyLow)} – {clp(monthlyHigh)}
        </p>
        <p className="mt-2 text-sm text-white/90">
          Hasta {clp(monthlyHigh * 12)} al año
        </p>
      </div>

      <a
        href="#contacto"
        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#0A2A4A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12395f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
      >
        Pedir cotización con mi consumo real
        <ArrowRight className="h-4 w-4" />
      </a>
      <p className="mt-3 text-xs text-slate-400">
        Estimación referencial. El ahorro real depende de tu techo, orientación y consumo.
      </p>
    </div>
  )
}