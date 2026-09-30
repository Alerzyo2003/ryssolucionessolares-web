import type { Metadata } from 'next'
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
  Search,
} from 'lucide-react'

// ⚠️ Cambia estos valores por los de tu tienda
const SITE_NAME = 'Tu Tienda'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tutienda.cl'

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

type SearchParams = { [key: string]: string | string[] | undefined }
type Props = { searchParams: Promise<SearchParams> }

const PAGE_SIZE = 12
const NEW_DAYS = 14

const BENEFITS = [
  { icon: Truck, title: 'Envío a todo Chile', text: 'Despacho a regiones' },
  { icon: ShieldCheck, title: 'Garantía del fabricante', text: 'Equipos certificados' },
  { icon: Headphones, title: 'Asesoría técnica', text: 'Te ayudamos a dimensionar' },
  { icon: FileText, title: 'Factura disponible', text: 'Para empresas y particulares' },
]

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

const str = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '')
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Escapa comodines de LIKE para que una marca con % o _ no cambie el patrón
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)

// Limpia el texto de búsqueda para usarlo dentro de .or() de PostgREST
const sanitizeSearch = (s: string) =>
  s.replace(/[,()%_*\\"']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)

function isNew(createdAt?: string) {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < NEW_DAYS * 24 * 60 * 60 * 1000
}

function getPageItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) items.push('…')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 1) items.push('…')
  items.push(total)
  return items
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

/* ---------------------------------- SEO ---------------------------------- */

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams
  const cat = str(p.categoria)
  const brand = str(p.marca)
  const q = str(p.q)

  const parts = [cat && cap(cat), brand && cap(brand)].filter(Boolean) as string[]
  const label = parts.join(' ')

  const title = label
    ? `${label} – Equipos solares | ${SITE_NAME}`
    : `Catálogo de equipos solares | ${SITE_NAME}`

  const description = label
    ? `Compra ${label.toLowerCase()} en ${SITE_NAME}. Equipos solares con garantía, factura y envío a todo Chile.`
    : `Paneles solares, inversores, baterías y más. Equipos de grado industrial con garantía, factura y envío a todo Chile.`

  // Búsquedas, rangos de precio y páginas > 1 no deberían indexarse
  const noindex = Boolean(q || p.min || p.max || p.pagina)

  const canonicalParams = new URLSearchParams()
  if (cat) canonicalParams.set('categoria', cat)
  if (brand) canonicalParams.set('marca', brand)
  const canonicalQs = canonicalParams.toString()

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/tienda${canonicalQs ? `?${canonicalQs}` : ''}` },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, type: 'website', siteName: SITE_NAME },
  }
}

/* --------------------------------- PÁGINA -------------------------------- */

export default async function TiendaPage({ searchParams }: Props) {
  const resolvedParams = await searchParams
  const currentCategory = str(resolvedParams.categoria).toLowerCase() || 'todos'
  const currentBrand = str(resolvedParams.marca).toLowerCase() || 'todas'
  const minParam = resolvedParams.min ? parseInt(str(resolvedParams.min)) : null
  const maxParam = resolvedParams.max ? parseInt(str(resolvedParams.max)) : null
  const sortParam = str(resolvedParams.orden) || 'recientes'
  const searchText = sanitizeSearch(str(resolvedParams.q))
  const currentPage = Math.max(1, parseInt(str(resolvedParams.pagina) || '1') || 1)

  // Arma una URL de /tienda conservando los filtros actuales
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

  // 1. Consulta liviana para filtros y contadores
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

  // Contadores (claves en minúscula, igual que la URL)
  const categoryCounts: Record<string, number> = {}
  const brandCounts: Record<string, number> = {}
  for (const row of filterRows) {
    if (row.category) {
      const k = String(row.category).toLowerCase()
      categoryCounts[k] = (categoryCounts[k] || 0) + 1
    }
    if (row.brand) {
      const k = String(row.brand).toLowerCase()
      brandCounts[k] = (brandCounts[k] || 0) + 1
    }
  }

  // 2. Consulta filtrada + total
  let query = supabase.from('products').select('*', { count: 'exact' })

  if (currentCategory !== 'todos') {
    query = query.ilike('category', `%${escapeLike(currentCategory)}%`)
  }
  if (currentBrand !== 'todas') {
    query = query.ilike('brand', escapeLike(currentBrand))
  }
  if (minParam !== null && !Number.isNaN(minParam)) {
    query = query.gte('price', minParam)
  }
  if (maxParam !== null && !Number.isNaN(maxParam)) {
    query = query.lte('price', maxParam)
  }
  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%,description.ilike.%${searchText}%`)
  }

  // 3. Orden
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

  // Etiquetas "bonitas" para chips y breadcrumb
  const categoryLabel =
    uniqueCategories.find((c) => c.toLowerCase() === currentCategory) ?? cap(currentCategory)
  const brandLabel =
    uniqueBrands.find((b) => b.toLowerCase() === currentBrand) ?? cap(currentBrand)

  // Chips de filtros activos
  const activeFilters: { label: string; href: string }[] = []
  if (searchText) {
    activeFilters.push({
      label: `Búsqueda: “${searchText}”`,
      href: buildHref({ q: null, pagina: null }),
    })
  }
  if (currentCategory !== 'todos') {
    activeFilters.push({
      label: `Categoría: ${categoryLabel}`,
      href: buildHref({ categoria: null, pagina: null }),
    })
  }
  if (currentBrand !== 'todas') {
    activeFilters.push({
      label: `Marca: ${brandLabel}`,
      href: buildHref({ marca: null, pagina: null }),
    })
  }
  if (minParam !== null || maxParam !== null) {
    activeFilters.push({
      label: `Precio: ${clp.format(minParam ?? globalMin)} – ${clp.format(maxParam ?? globalMax)}`,
      href: buildHref({ min: null, max: null, pagina: null }),
    })
  }

  // Datos estructurados para Google
  const jsonLd =
    filteredProducts.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: filteredProducts.map((p, i) => ({
            '@type': 'ListItem',
            position: from + i + 1,
            item: {
              '@type': 'Product',
              name: p.name,
              description: p.description,
              image: p.image_url || undefined,
              sku: p.id,
              brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
              offers: {
                '@type': 'Offer',
                url: `${SITE_URL}/products/${p.id}`,
                priceCurrency: 'CLP',
                price: p.price,
                availability:
                  Number(p.stock ?? 0) > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
              },
            },
          })),
        }
      : null

  const hiddenKeys = ['categoria', 'marca', 'min', 'max', 'orden'] as const

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 md:pb-24">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}

      {/* ENCABEZADO */}
      <div className="relative bg-white border-b border-slate-200 overflow-hidden mb-6 md:mb-8">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(234,88,12,0.08),_transparent_55%)]"
        />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8 pt-5 md:pt-6 pb-6 md:pb-8">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-orange-600 transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/tienda" className="hover:text-orange-600 transition-colors">Tienda</Link>
            {currentCategory !== 'todos' && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-600 font-medium">{categoryLabel}</span>
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
          {/* FILTROS: drawer en móvil, sticky en desktop (ver el componente) */}
          <div className="w-full lg:w-1/4 shrink-0">
            <StoreFilterSidebar
              uniqueCategories={uniqueCategories}
              uniqueBrands={uniqueBrands}
              globalMin={globalMin}
              globalMax={globalMax}
              categoryCounts={categoryCounts}
              brandCounts={brandCounts}
              totalProducts={totalProducts}
            />
          </div>

          {/* RESULTADOS */}
          <div className="w-full lg:w-3/4">
            {/* Buscador (formulario GET, no necesita JS) */}
            <form action="/tienda" method="get" role="search" className="relative mb-5">
              {hiddenKeys.map((key) => {
                const v = str(resolvedParams[key])
                return v ? <input key={key} type="hidden" name={key} value={v} /> : null
              })}
              <label htmlFor="buscar" className="sr-only">Buscar equipos</label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="buscar"
                type="search"
                name="q"
                defaultValue={searchText}
                placeholder="Buscar paneles, inversores, baterías…"
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-28 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Buscar
              </button>
            </form>

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
                    <span>{f.label}</span>
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
                    Prueba con otra búsqueda o ajusta los filtros de precio, marca o categoría.
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

            {/* Paginación numerada */}
            {totalPages > 1 && filteredProducts.length > 0 && (
              <nav
                aria-label="Paginación"
                className="flex flex-wrap items-center justify-center gap-1.5 mt-10 pt-6 border-t border-slate-200"
              >
                {currentPage > 1 ? (
                  <Link
                    href={buildHref({ pagina: currentPage - 1 === 1 ? null : String(currentPage - 1) })}
                    aria-label="Página anterior"
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300">
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                )}

                {getPageItems(currentPage, totalPages).map((item, i) =>
                  item === '…' ? (
                    <span key={`dots-${i}`} className="w-8 text-center text-slate-400 select-none">…</span>
                  ) : item === currentPage ? (
                    <span
                      key={item}
                      aria-current="page"
                      className="w-10 h-10 inline-flex items-center justify-center rounded-lg bg-orange-600 text-white text-sm font-bold shadow-sm"
                    >
                      {item}
                    </span>
                  ) : (
                    <Link
                      key={item}
                      href={buildHref({ pagina: item === 1 ? null : String(item) })}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                    >
                      {item}
                    </Link>
                  )
                )}

                {currentPage < totalPages ? (
                  <Link
                    href={buildHref({ pagina: String(currentPage + 1) })}
                    aria-label="Página siguiente"
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}