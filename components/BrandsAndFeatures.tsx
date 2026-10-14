"use client"

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const brands = [
  { name: 'risen' },
  { name: 'DYNESS' },
  { name: 'SAKO' },
  { name: 'GRUNTEK' },
  { name: 'victron energy' },
  { name: 'GROWATT' },
  { name: 'SOLIS' },
]

export default function BrandsAndFeatures() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const offset = direction === 'left' ? -clientWidth / 2 : clientWidth / 2
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* HEADER DE MARCAS */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="h-[1px] w-8 bg-orange-500"></span>
            <span className="text-orange-600 font-bold text-xs uppercase tracking-widest">Marcas que nos respaldan</span>
            <span className="h-[1px] w-8 bg-orange-500"></span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Trabajamos con las <span className="text-orange-600">mejores marcas</span> de la industria
          </h2>
          <p className="text-slate-600 text-sm mt-3">
            Equipos de alta calidad, eficiencia y respaldo mundial.
          </p>
        </div>

        {/* CARRUSEL DE MARCAS CON BOTONES */}
        <div className="relative mb-20">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer hidden md:flex"
          >
            ←
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none py-4 px-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {brands.map((brand, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-64 h-28 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md flex items-center justify-center p-6 transition-all group cursor-pointer"
              >
                <span className="text-2xl font-black tracking-wider text-slate-700 group-hover:text-orange-600 uppercase transition-colors">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer hidden md:flex"
          >
            →
          </button>
        </div>

        {/* LAS 3 TARJETAS INFERIORES DE CARACTERÍSTICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tarjeta 1: Kits Solares */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div>
              <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                Kits Completos
              </span>
              <h3 className="text-2xl font-black text-[#0F172A] mb-3">
                Todo en Kits Solares
              </h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Encuentra todo lo que necesitas en un solo lugar. Equipos, accesorios y asesoría experta.
              </p>
              <a 
                href="#tienda"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-orange-600/20 text-sm"
              >
                <span>Ver productos</span>
                <span>→</span>
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-orange-600 font-bold text-lg mb-1">📦</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">Envíos a todo Chile</div>
              </div>
              <div>
                <div className="text-orange-600 font-bold text-lg mb-1">🛡️</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">Garantía oficial</div>
              </div>
              <div>
                <div className="text-orange-600 font-bold text-lg mb-1">🎧</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">Asesoría personalizada</div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Proyectos Garantizados (Fondo Oscuro) */}
          <div className="bg-[#0F172A] text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <Image 
                src="https://images.unsplash.com/photo-1509391366360-525628172322?q=80&w=600&auto=format&fit=crop" 
                alt="Background" 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="relative z-10">
              <div className="w-8 h-[2px] bg-orange-500 mb-4"></div>
              <h3 className="text-2xl font-black mb-3">
                Proyectos <span className="text-orange-500">garantizados</span>
              </h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Todas nuestras instalaciones y productos tienen garantía certificada de alto rendimiento.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">✓</span>
                  <span>Calidad certificada</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">✓</span>
                  <span>Instalación profesional</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">✓</span>
                  <span>Clientes nos recomiendan</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <a 
                href="#contacto"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-orange-600/20 text-sm w-full justify-center"
              >
                <span>Conoce más</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Tarjeta 3: Llegamos a todo Chile */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="w-8 h-[2px] bg-orange-500 mb-4"></div>
              <h3 className="text-2xl font-black text-[#0F172A] mb-3">
                Llegamos a <span className="text-orange-600">todo Chile</span>
              </h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Instalación incluida en las regiones IV, V, VI, VII, VIII y RM (pregunte valores para su región).
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 text-white p-6 rounded-2xl flex items-center justify-between shadow-md mt-4">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block mb-1">Todo Incluido</span>
                <span className="font-bold text-sm">Ahorra cotizando por tu kit completo</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 text-2xl">
                ⚡
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}