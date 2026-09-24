'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface FilterProps {
  uniqueCategories: string[]
  uniqueBrands: string[]
  globalMin: number
  globalMax: number
}

export default function StoreFilterSidebar({ uniqueCategories, uniqueBrands, globalMin, globalMax }: FilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('categoria') || 'todos'
  const currentBrand = searchParams.get('marca') || 'todas'
  
  const initialMin = searchParams.get('min') ? parseInt(searchParams.get('min')!) : globalMin
  const initialMax = searchParams.get('max') ? parseInt(searchParams.get('max')!) : globalMax

  const [minPrice, setMinPrice] = useState(initialMin)
  const [maxPrice, setMaxPrice] = useState(initialMax)

  // Sincronizar estado si cambia la URL por fuera
  useEffect(() => {
    setMinPrice(initialMin)
    setMaxPrice(initialMax)
  }, [initialMin, initialMax])

  // Función para actualizar la URL sin recargar la página
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'todos' || value === 'todas') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Actualizar URL cuando el usuario suelta el slider de precio
  const handlePriceCommit = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice > globalMin) params.set('min', minPrice.toString())
    else params.delete('min')
    
    if (maxPrice < globalMax) params.set('max', maxPrice.toString())
    else params.delete('max')
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Cálculos para la barra visual del slider
  const range = globalMax - globalMin || 1
  const minPercent = ((minPrice - globalMin) / range) * 100
  const maxPercent = ((maxPrice - globalMin) / range) * 100

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
      
      {/* 1. FILTRO CATEGORÍAS */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Categorías</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => updateFilters('categoria', 'todos')}
            className={`text-left text-sm font-medium transition-colors ${currentCategory === 'todos' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-500'}`}
          >
            Todos los equipos
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilters('categoria', cat.toLowerCase())}
              className={`text-left text-sm font-medium transition-colors ${currentCategory === cat.toLowerCase() ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-500'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full mb-8" />

      {/* 2. FILTRO MARCAS */}
      {uniqueBrands.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Marcas</h3>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="marca" 
                checked={currentBrand === 'todas'} 
                onChange={() => updateFilters('marca', 'todas')}
                className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-600"
              />
              <span className={`text-sm font-medium ${currentBrand === 'todas' ? 'text-[#0F172A]' : 'text-slate-600 group-hover:text-orange-600'}`}>Todas</span>
            </label>
            {uniqueBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="marca" 
                  checked={currentBrand === brand.toLowerCase()} 
                  onChange={() => updateFilters('marca', brand.toLowerCase())}
                  className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-600"
                />
                <span className={`text-sm font-medium ${currentBrand === brand.toLowerCase() ? 'text-[#0F172A]' : 'text-slate-600 group-hover:text-orange-600'}`}>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-slate-100 w-full mb-8" />

      {/* 3. FILTRO DE PRECIO (DUAL SLIDER) */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Precio</h3>
        
        {/* Valores actuales mostrados */}
        <div className="flex justify-between items-center mb-4 text-xs font-bold text-[#0F172A]">
          <span>${minPrice.toLocaleString('es-CL')}</span>
          <span>${maxPrice.toLocaleString('es-CL')}</span>
        </div>

        {/* Visual Slider */}
        <div className="relative h-2 bg-slate-100 rounded-full mb-6">
          {/* Relleno naranja */}
          <div 
            className="absolute h-full bg-orange-500 rounded-full z-10" 
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }} 
          />
          
          {/* Thumb Mínimo */}
          <input
            type="range"
            min={globalMin}
            max={globalMax}
            value={minPrice}
            step={5000}
            onChange={(e) => {
              const value = Math.min(Number(e.target.value), maxPrice - 1)
              setMinPrice(value)
            }}
            onMouseUp={handlePriceCommit}
            onTouchEnd={handlePriceCommit}
            className="absolute w-full -top-1 h-4 appearance-none bg-transparent pointer-events-none z-20 slider-thumb"
          />
          
          {/* Thumb Máximo */}
          <input
            type="range"
            min={globalMin}
            max={globalMax}
            value={maxPrice}
            step={5000}
            onChange={(e) => {
              const value = Math.max(Number(e.target.value), minPrice + 1)
              setMaxPrice(value)
            }}
            onMouseUp={handlePriceCommit}
            onTouchEnd={handlePriceCommit}
            className="absolute w-full -top-1 h-4 appearance-none bg-transparent pointer-events-none z-20 slider-thumb"
          />
        </div>
      </div>
      
      {/* Estilos para ocultar el track por defecto de html y mostrar solo los círculos (thumbs) */}
      <style dangerouslySetInnerHTML={{__html: `
        .slider-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid #ea580c;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slider-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid #ea580c;
          cursor: pointer;
        }
      `}} />
    </div>
  )
}