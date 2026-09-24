'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calculator, MapPin, Zap, Sun, DollarSign, ArrowRight, Info, PanelTop } from 'lucide-react'

// --- BASE DE DATOS DE LAS 16 REGIONES CON SUS COORDENADAS EXACTAS EN EL MAPA (%) ---
const REGIONES_CHILE = [
  { id: 'XV', nombre: 'XV Región de Arica y Parinacota', zona: 'norte', hsp: 5.8, ajustePrecio: 1.05, x: 50, y: 5 },
  { id: 'I', nombre: 'I Región de Tarapacá', zona: 'norte', hsp: 5.9, ajustePrecio: 1.05, x: 50, y: 11 },
  { id: 'II', nombre: 'II Región de Antofagasta', zona: 'norte', hsp: 6.0, ajustePrecio: 1.05, x: 45, y: 22 },
  { id: 'III', nombre: 'III Región de Atacama', zona: 'norte', hsp: 5.8, ajustePrecio: 1.0, x: 42, y: 32 },
  { id: 'IV', nombre: 'IV Región de Coquimbo', zona: 'norte', hsp: 5.4, ajustePrecio: 1.0, x: 44, y: 41 },
  { id: 'V', nombre: 'V Región de Valparaíso', zona: 'centro', hsp: 4.8, ajustePrecio: 1.0, x: 45, y: 48 },
  { id: 'RM', nombre: 'RM Región Metropolitana', zona: 'centro', hsp: 4.7, ajustePrecio: 1.0, x: 52, y: 52 },
  { id: 'VI', nombre: "VI Región de O'Higgins", zona: 'centro', hsp: 4.6, ajustePrecio: 1.0, x: 43, y: 56 },
  { id: 'VII', nombre: 'VII Región del Maule', zona: 'centro', hsp: 4.4, ajustePrecio: 1.0, x: 43, y: 62 },
  { id: 'XVI', nombre: 'XVI Región de Ñuble', zona: 'sur', hsp: 4.0, ajustePrecio: 1.05, x: 44, y: 67 },
  { id: 'VIII', nombre: 'VIII Región del Bío-Bío', zona: 'sur', hsp: 3.8, ajustePrecio: 1.05, x: 38, y: 71 },
  { id: 'IX', nombre: 'IX Región de La Araucanía', zona: 'sur', hsp: 3.6, ajustePrecio: 1.08, x: 42, y: 76 },
  { id: 'XIV', nombre: 'XIV Región de Los Ríos', zona: 'sur', hsp: 3.3, ajustePrecio: 1.1, x: 43, y: 81 },
  { id: 'X', nombre: 'X Región de Los Lagos', zona: 'sur', hsp: 3.1, ajustePrecio: 1.12, x: 41, y: 86 },
  { id: 'XI', nombre: 'XI Región de Aysén', zona: 'austral', hsp: 2.5, ajustePrecio: 1.25, x: 42, y: 92 },
  { id: 'XII', nombre: 'XII Región de Magallanes', zona: 'austral', hsp: 2.3, ajustePrecio: 1.3, x: 55, y: 96 },
]

export default function CalculadoraPage() {
  const [gastoMensual, setGastoMensual] = useState<number>(50000)
  const [regionId, setRegionId] = useState<string>('RM')

  const regionSeleccionada = REGIONES_CHILE.find(r => r.id === regionId) || REGIONES_CHILE[6]

  // --- LÓGICA DE CÁLCULO SOLAR ---
  const calculos = useMemo(() => {
    const COSTO_KWH = 140 
    const consumoMensualKwh = gastoMensual / COSTO_KWH
    const consumoDiarioKwh = consumoMensualKwh / 30

    const EFICIENCIA_SISTEMA = 0.8
    const potenciaRequeridaKw = consumoDiarioKwh / (regionSeleccionada.hsp * EFICIENCIA_SISTEMA)

    const POTENCIA_PANEL = 0.5
    const cantidadPaneles = Math.ceil(potenciaRequeridaKw / POTENCIA_PANEL)
    const potenciaInstaladaReal = cantidadPaneles * POTENCIA_PANEL

    const PRECIO_BASE_KW = 1100000
    let costoEstimado = potenciaInstaladaReal * PRECIO_BASE_KW * regionSeleccionada.ajustePrecio
    if (costoEstimado < 1800000) costoEstimado = 1800000

    const ahorroAnual = gastoMensual * 12 * 0.8

    return {
      paneles: cantidadPaneles,
      potencia: potenciaInstaladaReal.toFixed(1),
      costo: costoEstimado,
      ahorroAnual: ahorroAnual,
      retornoInversion: (costoEstimado / ahorroAnual).toFixed(1)
    }
  }, [gastoMensual, regionSeleccionada])

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* HEADER */}
      <section className="bg-[#0B1221] text-white pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-6">
            <Calculator className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Simulador Inteligente</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Calcula tu proyecto solar en <span className="text-orange-500">segundos</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Descubre cuántos paneles necesitas y la inversión aproximada ajustada a la radiación solar real de tu región en Chile.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* PANEL IZQUIERDO */}
          <div className="w-full lg:w-5/12 bg-slate-50/50 p-8 md:p-10 border-r border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-[#0F172A] mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">1</span>
                Ingresa tus datos
              </h3>

              <div className="mb-8">
                <label className="flex justify-between items-end mb-4">
                  <span className="text-sm font-bold text-slate-700">Gasto mensual en luz</span>
                  <span className="text-xl font-black text-orange-600">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(gastoMensual)}
                  </span>
                </label>
                <input 
                  type="range" 
                  min="20000" 
                  max="500000" 
                  step="5000"
                  value={gastoMensual}
                  onChange={(e) => setGastoMensual(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-xs font-semibold text-slate-400 mt-2">
                  <span>$20.000</span>
                  <span>$500.000+</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN MAPA INTERACTIVO ESTILO REFERENCIA */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wide">
                  <MapPin className="w-4 h-4" />
                  <span>Selecciona tu Región</span>
                </div>
                <span className="text-[11px] font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full uppercase">
                  Zona {regionSeleccionada.zona}
                </span>
              </div>

              <div className="flex gap-4 items-center">
                
                {/* CONTENEDOR DEL MAPA ESTILO INFOGRAFÍA */}
                <div className="w-32 h-[380px] shrink-0 flex items-center justify-center bg-slate-900 rounded-xl relative overflow-hidden shadow-inner border border-slate-800 p-2">
                  
                  {/* Silueta SVG estática y elegante de Chile */}
                  <svg viewBox="0 0 120 500" className="w-full h-full opacity-90 drop-shadow" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60 10 C68 30, 62 70, 58 120 C55 160, 52 200, 48 240 C45 270, 42 300, 40 350 C38 380, 25 420, 35 460 Z" fill="#334155" stroke="#475569" strokeWidth="1"/>
                  </svg>

                  {/* PUNTOS INTERACTIVOS (HOTSPOTS) PARA CADA UNA DE LAS 16 REGIONES */}
                  {REGIONES_CHILE.map((reg) => {
                    const isSelected = reg.id === regionId
                    return (
                      <button
                        key={reg.id}
                        onClick={() => setRegionId(reg.id)}
                        className={`absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-center group cursor-pointer ${
                          isSelected ? 'bg-orange-500 scale-125 ring-4 ring-orange-500/30 z-30' : 'bg-slate-300 hover:bg-orange-400 z-10'
                        }`}
style={{ top: `${reg.y}%`, left: `${reg.x}%` }}                        title={reg.nombre}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-700'}`} />
                        
                        {/* Tooltip flotante al pasar el mouse */}
                        <div className="absolute left-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40">
                          {reg.nombre}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* SELECTOR DESPLEGABLE DE LAS 16 REGIONES */}
                <div className="flex-1">
                  <select 
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-3 py-3 outline-none mb-3 cursor-pointer"
                  >
                    {REGIONES_CHILE.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.nombre}
                      </option>
                    ))}
                  </select>
                  
                  <div className="text-xs text-slate-500 flex flex-col gap-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>Radiación: <strong className="text-slate-700">{regionSeleccionada.hsp} hrs/día</strong></span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* PANEL DERECHO: RESULTADOS */}
          <div className="w-full lg:w-7/12 p-8 md:p-10 flex flex-col justify-center bg-white relative">
            <h3 className="text-xl font-extrabold text-[#0F172A] mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">2</span>
              Tu sistema ideal
            </h3>

            <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 rounded-2xl p-6 md:p-8 text-white mb-6 relative overflow-hidden shadow-lg shadow-slate-900/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-8 justify-between items-center relative z-10">
                <div>
                  <p className="text-slate-400 font-semibold text-sm mb-1 uppercase tracking-wide">Inversión Estimada *</p>
                  <div className="text-4xl md:text-5xl font-black text-white flex items-baseline gap-1">
                    <span className="text-2xl text-orange-500">$</span>
                    {calculos.costo.toLocaleString('es-CL')}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 bg-white/10 inline-block px-3 py-1 rounded-full">
                    Factor regional {regionSeleccionada.nombre}: {(regionSeleccionada.ajustePrecio * 100 - 100).toFixed(0)}% por logística
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 w-full md:w-auto shrink-0 text-center">
                  <p className="text-xs text-slate-300 font-bold mb-1">RECUPERACIÓN APROX.</p>
                  <div className="text-2xl font-black text-emerald-400">{calculos.retornoInversion} años</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center text-center">
                <PanelTop className="w-8 h-8 text-orange-500 mb-3" />
                <p className="text-2xl font-black text-[#0F172A]">{calculos.paneles}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">Paneles de 500W</p>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center text-center">
                <Zap className="w-8 h-8 text-orange-500 mb-3" />
                <p className="text-2xl font-black text-[#0F172A]">{calculos.potencia} kW</p>
                <p className="text-xs font-bold text-slate-500 uppercase">Potencia del Sistema</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center text-center col-span-2 sm:col-span-1">
                <DollarSign className="w-8 h-8 text-emerald-500 mb-3" />
                <p className="text-2xl font-black text-[#0F172A]">
                  ${calculos.ahorroAnual.toLocaleString('es-CL')}
                </p>
                <p className="text-xs font-bold text-slate-500 uppercase">Ahorro Anual Estimado</p>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col items-center text-center col-span-2 sm:col-span-1 justify-center relative overflow-hidden group cursor-pointer hover:bg-orange-100 transition-colors">
                <Link href="/contacto" className="absolute inset-0 z-10" />
                <span className="text-sm font-extrabold text-orange-600 mb-1">Obtener cotización formal</span>
                <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-white px-3 py-1.5 rounded-full shadow-sm group-hover:translate-x-1 transition-transform">
                  Contactar Asesor <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-start text-slate-400">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                * Estimación aproximada para proyectos "Llave en mano" (equipos, instalación estándar, estructuras y trámite SEC). Los precios se ajustan en función de la zona geográfica debido a los costos de despacho y logística de carga pesada.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
