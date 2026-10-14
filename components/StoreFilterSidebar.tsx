'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'

interface FilterProps {
  uniqueCategories: string[]
  uniqueBrands: string[]
  globalMin: number
  globalMax: number
  categoryCounts: Record<string, number>
  brandCounts: Record<string, number>
  totalProducts: number
}

export default function StoreFilterSidebar({
  uniqueCategories,
  uniqueBrands,
  globalMin,
  globalMax,
  categoryCounts,
  brandCounts,
  totalProducts,
}: FilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = (searchParams.get('categoria') || 'todos').toLowerCase()
  const currentBrand = (searchParams.get('marca') || 'todas').toLowerCase()

  const initialMin = searchParams.get('min') ? parseInt(searchParams.get('min')!) : globalMin
  const initialMax = searchParams.get('max') ? parseInt(searchParams.get('max')!) : globalMax

  const [minPrice, setMinPrice] = useState(initialMin)
  const [maxPrice, setMaxPrice] = useState(initialMax)
  const [open, setOpen] = useState(false)

  // Sincronizar estado si cambia la URL por fuera
  useEffect(() => {
    setMinPrice(initialMin)
    setMaxPrice(initialMax)
  }, [initialMin, initialMax])

  // Drawer móvil: bloquear scroll del fondo y cerrar con Escape
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const push = (params: URLSearchParams) => {
    params.delete('pagina') // al cambiar un filtro, volver a la página 1
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'todos' || value === 'todas') params.delete(key)
    else params.set(key, value)
    push(params)
  }

  const handlePriceCommit = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice > globalMin) params.set('min', minPrice.toString())
    else params.delete('min')

    if (maxPrice < globalMax) params.set('max', maxPrice.toString())
    else params.delete('max')

    if (params.toString() === searchParams.toString()) return // sin cambios
    push(params)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;['categoria', 'marca', 'min', 'max'].forEach((k) => params.delete(k))
    push(params)
  }

  const activeCount =
    (currentCategory !== 'todos' ? 1 : 0) +
    (currentBrand !== 'todas' ? 1 : 0) +
    (searchParams.get('min') || searchParams.get('max') ? 1 : 0)

  // Slider
  const range = globalMax - globalMin || 1
  const minPercent = ((minPrice - globalMin) / range) * 100
  const maxPercent = ((maxPrice - globalMin) / range) * 100

  const renderFilters = (idPrefix: string) => (
    <>
      {/* CATEGORÍAS */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Categorías</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => updateFilters('categoria', 'todos')}
            className={`text-left text-sm font-medium transition-colors ${
              currentCategory === 'todos' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-500'
            }`}
          >
            Todos los equipos
          </button>
          {uniqueCategories.map((cat) => {
            const key = cat.toLowerCase()
            const active = currentCategory === key
            return (
              <button
                key={cat}
                onClick={() => updateFilters('categoria', key)}
                className={`flex items-center justify-between gap-2 w-full text-left text-sm font-medium transition-colors ${
                  active ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-500'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-xs tabular-nums px-1.5 py-0.5 rounded-md ${
                    active ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {categoryCounts[key] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full mb-8" />

      {/* MARCAS */}
      {uniqueBrands.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Marcas</h3>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={`${idPrefix}-marca`}
                checked={currentBrand === 'todas'}
                onChange={() => updateFilters('marca', 'todas')}
                className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-600"
              />
              <span
                className={`text-sm font-medium ${
                  currentBrand === 'todas' ? 'text-[#0F172A]' : 'text-slate-600 group-hover:text-orange-600'
                }`}
              >
                Todas
              </span>
            </label>
            {uniqueBrands.map((brand) => {
              const key = brand.toLowerCase()
              return (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={`${idPrefix}-marca`}
                    checked={currentBrand === key}
                    onChange={() => updateFilters('marca', key)}
                    className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-600"
                  />
                  <span
                    className={`flex-1 text-sm font-medium ${
                      currentBrand === key ? 'text-[#0F172A]' : 'text-slate-600 group-hover:text-orange-600'
                    }`}
                  >
                    {brand}
                  </span>
                  <span className="text-xs tabular-nums text-slate-400">{brandCounts[key] ?? 0}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      <div className="h-px bg-slate-100 w-full mb-8" />

      {/* PRECIO */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Precio</h3>

        <div className="flex justify-between items-center mb-4 text-xs font-bold text-[#0F172A]">
          <span>${minPrice.toLocaleString('es-CL')}</span>
          <span>${maxPrice.toLocaleString('es-CL')}</span>
        </div>

        <div className="relative h-2 bg-slate-100 rounded-full mb-6">
          <div
            className="absolute h-full bg-orange-500 rounded-full z-10"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />

          <input
            type="range"
            aria-label="Precio mínimo"
            min={globalMin}
            max={globalMax}
            value={minPrice}
            step={5000}
            onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))}
            onPointerUp={handlePriceCommit}
            onKeyUp={handlePriceCommit}
            className="absolute w-full -top-1 h-4 appearance-none bg-transparent pointer-events-none z-20 slider-thumb"
          />

          <input
            type="range"
            aria-label="Precio máximo"
            min={globalMin}
            max={globalMax}
            value={maxPrice}
            step={5000}
            onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))}
            onPointerUp={handlePriceCommit}
            onKeyUp={handlePriceCommit}
            className="absolute w-full -top-1 h-4 appearance-none bg-transparent pointer-events-none z-20 slider-thumb"
          />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* MÓVIL: botón + drawer */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm text-sm font-semibold text-[#0F172A] active:bg-slate-50"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-orange-600" />
            Filtros
          </span>
          {activeCount > 0 && (
            <span className="bg-orange-600 text-white text-xs font-bold min-w-5 h-5 px-1.5 rounded-full inline-flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {open && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filtros">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />

            <div className="drawer-in absolute inset-y-0 left-0 w-[88%] max-w-sm bg-white flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-[#0F172A]">Filtros</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar filtros"
                  className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">{renderFilters('m')}</div>

              <div className="p-4 border-t border-slate-100 flex gap-3">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors"
                >
                  Ver {totalProducts} {totalProducts === 1 ? 'equipo' : 'equipos'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP: panel sticky */}
      <div className="hidden lg:block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
        {renderFilters('d')}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
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
        @keyframes drawer-in {
          from { transform: translateX(-100%); }
          to { transform: none; }
        }
        .drawer-in { animation: drawer-in 0.25s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .drawer-in { animation: none; }
        }
      `,
        }}
      />
    </>
  )
}