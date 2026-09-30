import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import ScrollReveal from '@/components/ScrollReveal'
import StoreFilterSidebar from '@/components/StoreFilterSidebar'
import StoreSortSelect from '@/components/StoreSortSelect'
import {
  PackageSearch,
  Zap,
  Truck,
  ShieldCheck,
  Headphones,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  ChevronRight as Crumb,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category?: string
  brand?: string
  created_at?: string
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const PAGE_SIZE = 12
const NEW_DAYS = 14

const BENEFITS = [
  { icon: Truck, title: 'Envío a todo Chile', text: 'Despacho a regiones' },
  { icon: ShieldCheck, title: 'Garantía del fabricante', text: 'Equipos certificados' },
  { icon: Headphones, title: 'Asesoría técnica', text: 'Te ayudamos a dimensionar' },
  { icon: FileText, title: 'Factura disponible', text: 'Para empresas y particulares' },
]

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

function isNew(createdAt?: string) {
  if (!createdAt) return false
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff < NEW_DAYS * 24 * 60 * 60 * 1000
}

function StockLabel({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Sin stock
      </span>
    )
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Últimas {stock} unidades
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> En stock
    </span>
  )
}

export default async function TiendaPage({ searchParams }: Props) {
  const resolvedParams = await searchParams
  const currentCategory = (resolvedParams.categoria as string) || 'todos'
  const currentBrand = (resolvedParams.marca as string) || 'todas'
  const minParam = resolvedParams.min ? parseInt(resolvedParams.min as string) : null
  const maxParam = resolvedParams.max ? parseInt(resolvedParams.max as string) : null
  const sortParam = (resolvedParams.orden as string) || 'recientes'
  const currentPage = Math.max(1, parseInt((resolvedParams.pagina as string) || '1') || 1)

  // Helper: arma una URL de /tienda conservando los filtros actuales
  const buildHref = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(resolvedParams)) {
      if (typeof value === 'string' && value) params.set(key, value)
    }
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null) params.delete(key)
      else params.set(key, value)
    }
    const qs = params.toString()
    return qs ? `/tienda?${qs}` : '/tienda'
  }

  // 1. Consulta liviana: solo las columnas necesarias para los filtros
  const { data: filterData } = await supabase
    .from('products')
    .select('price, category, brand')

  const filterRows = filterData || []
  const prices = filterRows.map((p) => Number(p.price))
  const globalMin = prices.length > 0 ? Math.min(...prices) : 0
  const globalMax = prices.length > 0 ? Math.max(...prices) : 10000000

  const uniqueCategories = Array.from(
    new Set(filterRows.map((p) => p.category).filter(Boolean))
  ) as string[]

  const uniqueBrands = Array.from(
    new Set(filterRows.map((p) => p.brand).filter(Boolean))
  ) as string[]

  // 2. Consulta filtrada con paginación y total
  let query = supabase.from('products').select('*', { count: 'exact' })

  if (currentCategory !== 'todos') {
    query = query.ilike('category', `%${currentCategory}%`)
  }
  if (currentBrand !== 'todas') {
    query = query.eq('brand', currentBrand)
  }
  if (minParam !== null && !Number.isNaN(minParam)) {
    query = query.gte('price', minParam)
  }
  if (maxParam !== null && !Number.isNaN(maxParam)) {
    query = query.lte('price', maxParam)
  }

  // 3. Ordenamiento
  if (sortParam === 'precio-asc') {
    query = query.order('price', { ascending: true })
  } else if (sortParam === 'precio-desc') {
    query = query.order('price', { ascending: false })
  } else if (sortParam === 'nombre-asc') {
    query = query.order('name', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // 4. Paginación
  const from = (currentPage - 1) * PAGE_SIZE
  query = query.range(from, from + PAGE_SIZE - 1)

  const { data: filteredProductsData, count } = await query
  const filteredProducts = (filteredProductsData || []) as Product[]
  const totalProducts = count ?? filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))

  // Chips de filtros activos
  const activeFilters: { label: string; href: string }[] = []
  if (currentCategory !== 'todos') {
    activeFilters.push({
      label: `Categoría: ${currentCategory}`,
      href: buildHref({ categoria: null, pagina: null }),
    })
  }
  if (currentBrand !== 'todas') {
    activeFilters.push({
      label: `Marca: ${currentBrand}`,
      href: buildHref({ marca: null, pagina: null }),
    })
  }
  if (minParam !== null || maxParam !== null) {
    const minLabel = clp.format(minParam ?? globalMin)
    const maxLabel = clp.format(maxParam ?? globalMax)
    activeFilters.push({
      label: `Precio: ${minLabel} – ${maxLabel}`,
      href: buildHref({ min: null, max: null, pagina: null }),
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 md:pb-24">
      {/* ENCABEZADO */}
      <div className="relative bg-white border-b border-slate-200 overflow-hidden mb-6 md:mb-8">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(234,88,12,0.08),_transparent_55%)]"
        />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8 pt-5 md:pt-6 pb-6 md:pb-8">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-orange-600 transition-colors">Inicio</Link>
            <Crumb className="w-3 h-3" />
            <Link href="/tienda" className="hover:text-orange-600 transition-colors">Tienda</Link>
            {currentCategory !== 'todos' && (
              <>
                <Crumb className="w-3 h-3" />
                <span className="text-slate-600 font-medium capitalize">{currentCategory}</span>
              </>
            )}
          </nav>

          <ScrollReveal as="slide-right">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2 md:mb-1.5">
              Catálogo de <span className="text-orange-600">Equipos Solares</span>
            </h1>
            <p className="text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
              Configura tu sistema con componentes de grado industrial. Usa los filtros para encontrar exactamente lo que necesitas.
            </p>
          </ScrollReveal>

          {/* Franja de beneficios */}
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-7">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                </span>
                <span className="leading-tight">
                  <span className="block text-xs md:text-sm font-bold text-[#0F172A]">{title}</span>
                  <span className="hidden sm:block text-[11px] md:text-xs text-slate-500">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
          {/* FILTROS (sticky en desktop) */}
          <div className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-24">
            <StoreFilterSidebar
              uniqueCategories={uniqueCategories}
              uniqueBrands={uniqueBrands}
              globalMin={globalMin}
              globalMax={globalMax}
            />
          </div>

          {/* RESULTADOS */}
          <div className="w-full lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-200">
              <h2 className="text-lg md:text-xl font-bold text-[#0F172A]">Resultados</h2>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-auto">
                  <StoreSortSelect />
                </div>

                <div className="hidden sm:flex text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 items-center gap-2 shrink-0">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span>
                    <span className="font-bold text-[#0F172A]">{totalProducts}</span>{' '}
                    {totalProducts === 1 ? 'equipo' : 'equipos'}
                  </span>
                </div>
              </div>
            </div>

            {/* Chips de filtros activos */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs font-medium text-slate-500 mr-1">Filtros activos:</span>
                {activeFilters.map((f) => (
                  <Link
                    key={f.label}
                    href={f.href}
                    scroll={false}
                    className="group inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-100 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                  >
                    <span className="capitalize">{f.label}</span>
                    <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    <span className="sr-only">Quitar filtro</span>
                  </Link>
                ))}
                <Link
                  href="/tienda"
                  className="text-xs font-semibold text-slate-500 hover:text-orange-600 underline underline-offset-2 ml-1"
                >
                  Limpiar todo
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const stock = Number(product.stock ?? 0)
                  const outOfStock = stock <= 0

                  return (
                    <ScrollReveal key={product.id} as="fade-up" delay={(index % 3) * 80}>
                      <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-orange-900/5 hover:border-orange-200 transition-all duration-300 flex flex-col group h-full">
                        {/* Imagen */}
                        <Link
                          href={`/products/${product.id}`}
                          className="relative block aspect-square w-full bg-white overflow-hidden border-b border-slate-100"
                        >
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className={`object-contain p-5 md:p-6 group-hover:scale-105 transition-transform duration-500 ease-out ${
                                outOfStock ? 'opacity-50 grayscale' : ''
                              }`}
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300 bg-slate-50">
                              <ImageOff className="w-10 h-10" />
                              <span className="text-xs font-medium">Sin imagen</span>
                            </div>
                          )}

                          {product.brand && (
                            <span className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md text-[#0F172A] shadow-sm border border-slate-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {product.brand}
                            </span>
                          )}

                          {isNew(product.created_at) && !outOfStock && (
                            <span className="absolute top-3 right-3 z-10 bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                              Nuevo
                            </span>
                          )}
                        </Link>

                        {/* Contenido */}
                        <div className="p-4 md:p-5 flex-grow flex flex-col">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {product.category || 'Equipo'}
                          </span>

                          <Link href={`/products/${product.id}`} className="block group/link mb-2">
                            <h3 className="text-base md:text-lg font-bold text-[#0F172A] group-hover/link:text-orange-600 transition-colors line-clamp-2 leading-tight">
                              {product.name}
                            </h3>
                          </Link>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                            {product.description}
                          </p>

                          <div className="mt-auto">
                            <StockLabel stock={stock} />
                          </div>
                        </div>

                        {/* Precio + acción */}
                        <div className="p-4 md:p-5 pt-4 bg-slate-50/60 border-t border-slate-100 space-y-3">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">
                              {clp.format(product.price)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              IVA incluido
                            </span>
                          </div>

                          {outOfStock ? (
                            <button
                              type="button"
                              disabled
                              className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-500 text-sm font-semibold cursor-not-allowed"
                            >
                              Sin stock
                            </button>
                          ) : (
                            <div className="w-full [&>button]:w-full">
                              <AddToCartButton product={product} />
                            </div>
                          )}
                        </div>
                      </article>
                    </ScrollReveal>
                  )
                })
              ) : (
                <div className="col-span-full py-12 md:py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center px-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-5 text-slate-400">
                    <PackageSearch className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold text-[#0F172A] mb-2">No encontramos equipos</h3>
                  <p className="text-slate-500 text-xs md:text-sm max-w-sm mx-auto mb-5 md:mb-6">
                    Ajusta los filtros de precio, marca o categoría para ver más resultados.
                  </p>
                  <Link
                    href="/tienda"
                    className="w-full sm:w-auto px-6 py-3 md:py-2.5 bg-orange-600 text-white text-sm md:text-base font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
                  >
                    Limpiar todos los filtros
                  </Link>
                </div>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <nav aria-label="Paginación" className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
                {currentPage > 1 ? (
                  <Link
                    href={buildHref({ pagina: String(currentPage - 1) })}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </Link>
                ) : (
                  <span />
                )}

                <span className="text-sm text-slate-500">
                  Página <span className="font-bold text-[#0F172A]">{currentPage}</span> de {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={buildHref({ pagina: String(currentPage + 1) })}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-colors"
                  >
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}