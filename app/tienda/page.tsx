import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import AddToCartButton from '@/components/AddToCartButton'
import ScrollReveal from '@/components/ScrollReveal'
import StoreFilterSidebar from '@/components/StoreFilterSidebar'
import StoreSortSelect from '@/components/StoreSortSelect'
import {
  PackageSearch, X,
  ChevronLeft, ChevronRight, ImageOff, Search, ArrowRight, Sun,
  Truck, ShieldCheck, FileText, Lock, Wrench, MessageCircle, Flame,
} from 'lucide-react'

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'] })

// Ajusta estos valores (o defínelos en .env)
const SITE_NAME = 'R&S Soluciones Solares'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tutienda.cl'

const WHATSAPP_NUMBER = '56991363439'
const wa = (msg: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`

const TRUST = [
  { Icon: Truck, t: 'Despacho a todo Chile' },
  { Icon: ShieldCheck, t: 'Garantía de fábrica' },
  { Icon: FileText, t: 'Boleta o factura' },
  { Icon: Lock, t: 'Pago 100% seguro' },
  { Icon: Wrench, t: 'Instalación disponible' },
]

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
  featured?: boolean
}

type SearchParams = { [key: string]: string | string[] | undefined }
type Props = { searchParams: Promise<SearchParams> }

const PAGE_SIZE = 12
const NEW_DAYS = 14

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
const str = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '')
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)
const sanitizeSearch = (s: string) => s.replace(/[,()%_*\\"']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)

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
  const [color, dot, label] =
    stock <= 0 ? ['text-red-600', 'bg-red-500', 'Sin stock']
    : stock <= 5 ? ['text-amber-600', 'bg-amber-500', `Últimas ${stock} unidades`]
    : ['text-emerald-600', 'bg-emerald-500', 'En stock']
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} /> {label}
    </span>
  )
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams
  const cat = str(p.categoria)
  const brand = str(p.marca)
  const q = str(p.q)
  const label = [cat && cap(cat), brand && cap(brand)].filter(Boolean).join(' ')

  const title = label ? `${label} – Equipos solares | ${SITE_NAME}` : `Catálogo de equipos solares | ${SITE_NAME}`
  const description = label
    ? `Compra ${label.toLowerCase()} en ${SITE_NAME}. Equipos solares con garantía, factura y envío a todo Chile.`
    : `Paneles solares, inversores, baterías y más. Equipos con garantía, factura y envío a todo Chile.`

  const noindex = Boolean(q || p.min || p.max || p.pagina)
  const canonical = new URLSearchParams()
  if (cat) canonical.set('categoria', cat)
  if (brand) canonical.set('marca', brand)
  const qs = canonical.toString()

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/tienda${qs ? `?${qs}` : ''}` },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, type: 'website', siteName: SITE_NAME },
  }
}

export default async function TiendaPage({ searchParams }: Props) {
  const resolvedParams = await searchParams
  const currentCategory = str(resolvedParams.categoria).toLowerCase() || 'todos'
  const currentBrand = str(resolvedParams.marca).toLowerCase() || 'todas'
  const minParam = resolvedParams.min ? parseInt(str(resolvedParams.min)) : null
  const maxParam = resolvedParams.max ? parseInt(str(resolvedParams.max)) : null
  const sortParam = str(resolvedParams.orden) || 'recientes'
  const searchText = sanitizeSearch(str(resolvedParams.q))
  const currentPage = Math.max(1, parseInt(str(resolvedParams.pagina) || '1') || 1)

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

  // Filtros y contadores
  const { data: filterData } = await supabase.from('products').select('price, category, brand')
  const filterRows = filterData || []
  const prices = filterRows.map((p) => Number(p.price))
  const globalMin = prices.length > 0 ? Math.min(...prices) : 0
  const globalMax = prices.length > 0 ? Math.max(...prices) : 10000000
  const uniqueCategories = Array.from(new Set(filterRows.map((p) => p.category).filter(Boolean))) as string[]
  const uniqueBrands = Array.from(new Set(filterRows.map((p) => p.brand).filter(Boolean))) as string[]

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

  // Consulta filtrada
  let query = supabase.from('products').select('*', { count: 'exact' })
  if (currentCategory !== 'todos') query = query.ilike('category', `%${escapeLike(currentCategory)}%`)
  if (currentBrand !== 'todas') query = query.ilike('brand', escapeLike(currentBrand))
  if (minParam !== null && !Number.isNaN(minParam)) query = query.gte('price', minParam)
  if (maxParam !== null && !Number.isNaN(maxParam)) query = query.lte('price', maxParam)
  if (searchText) query = query.or(`name.ilike.%${searchText}%,description.ilike.%${searchText}%`)

  if (sortParam === 'precio-asc') query = query.order('price', { ascending: true })
  else if (sortParam === 'precio-desc') query = query.order('price', { ascending: false })
  else if (sortParam === 'nombre-asc') query = query.order('name', { ascending: true })
  else query = query.order('created_at', { ascending: false })

  const from = (currentPage - 1) * PAGE_SIZE
  query = query.range(from, from + PAGE_SIZE - 1)

  const { data: filteredProductsData, count } = await query
  const filteredProducts = (filteredProductsData || []) as Product[]
  const totalProducts = count ?? filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))

  const categoryLabel = uniqueCategories.find((c) => c.toLowerCase() === currentCategory) ?? cap(currentCategory)
  const brandLabel = uniqueBrands.find((b) => b.toLowerCase() === currentBrand) ?? cap(currentBrand)

  const activeFilters: { label: string; href: string }[] = []
  if (searchText) activeFilters.push({ label: `Búsqueda: “${searchText}”`, href: buildHref({ q: null, pagina: null }) })
  if (currentCategory !== 'todos') activeFilters.push({ label: `Categoría: ${categoryLabel}`, href: buildHref({ categoria: null, pagina: null }) })
  if (currentBrand !== 'todas') activeFilters.push({ label: `Marca: ${brandLabel}`, href: buildHref({ marca: null, pagina: null }) })
  if (minParam !== null || maxParam !== null) {
    activeFilters.push({
      label: `Precio: ${clp.format(minParam ?? globalMin)} – ${clp.format(maxParam ?? globalMax)}`,
      href: buildHref({ min: null, max: null, pagina: null }),
    })
  }

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
                availability: Number(p.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              },
            },
          })),
        }
      : null

  const hiddenKeys = ['categoria', 'marca', 'min', 'max', 'orden'] as const
  const pageBtn = 'inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition'

  return (
    <div className="min-h-screen bg-[#F6F8FB] pb-20 text-slate-800">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      )}

      {/* ENCABEZADO COMPACTO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-5">
          <div className="min-w-0">
            <nav aria-label="Ruta de navegación" className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/" className="transition-colors hover:text-orange-600">Inicio</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/tienda" className="transition-colors hover:text-orange-600">Tienda</Link>
              {currentCategory !== 'todos' && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span aria-current="page" className="font-medium text-slate-700">{categoryLabel}</span>
                </>
              )}
            </nav>
            <h1 className={`${display.className} text-2xl font-extrabold tracking-tight text-[#0A2A4A] md:text-3xl`}>
              {currentCategory !== 'todos' ? categoryLabel : 'Equipos solares'}
            </h1>
          </div>

          {/* Buscador (formulario GET, no necesita JS) */}
          <form action="/tienda" method="get" role="search" className="relative w-full md:max-w-sm lg:max-w-md">
            {hiddenKeys.map((key) => {
              const v = str(resolvedParams[key])
              return v ? <input key={key} type="hidden" name={key} value={v} /> : null
            })}
            <label htmlFor="buscar" className="sr-only">Buscar equipos</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="buscar"
              type="search"
              name="q"
              defaultValue={searchText}
              placeholder="Buscar paneles, inversores, baterías"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-24 text-sm text-[#0A2A4A] outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[#0A2A4A] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-orange-600">
              Buscar
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto mt-5 max-w-7xl px-5 md:mt-6 md:px-8">
        <div className="flex flex-col items-start gap-6 lg:flex-row md:gap-8">
          <div className="w-full shrink-0 lg:w-1/4">
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

          <main className="w-full lg:w-3/4">
            <div className="mb-6 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible">
              {TRUST.map(({ Icon, t }) => (
                <div key={t} className="flex shrink-0 snap-start items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="text-xs font-semibold leading-tight text-[#0A2A4A]">{t}</span>
                </div>
              ))}
            </div>

            <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              
              <p className="text-sm text-slate-600">
                <span className={`${display.className} text-2xl font-extrabold text-[#0A2A4A]`}>{totalProducts}</span>{' '}
                {totalProducts === 1 ? 'equipo encontrado' : 'equipos encontrados'}
              </p>
              <div className="w-full sm:w-auto"><StoreSortSelect /></div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {activeFilters.map((f) => (
                  <Link key={f.label} href={f.href} scroll={false} className="group inline-flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-3.5 pr-2.5 text-xs font-semibold text-[#0A2A4A] ring-1 ring-slate-200 transition hover:bg-orange-50 hover:ring-orange-300">
                    {f.label}
                    <X className="h-3.5 w-3.5 text-slate-400 group-hover:text-orange-600" />
                    <span className="sr-only">Quitar filtro</span>
                  </Link>
                ))}
                <Link href="/tienda" className="ml-1 text-xs font-semibold text-slate-500 underline underline-offset-4 hover:text-orange-600">Limpiar todo</Link>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const stock = Number(product.stock ?? 0)
                  const outOfStock = stock <= 0
                  return (
                    <ScrollReveal key={product.id} as="fade-up" delay={(index % 3) * 80}>
                      <article className={`group flex h-full flex-col overflow-hidden rounded-3xl bg-white transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-900/10 hover:ring-orange-300 ${product.featured && !outOfStock ? 'ring-2 ring-orange-300' : 'ring-1 ring-slate-200'}`}>                        <Link href={`/products/${product.id}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className={`object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
                              <ImageOff className="h-10 w-10" />
                              <span className="text-xs font-medium">Sin imagen</span>
                            </div>
                          )}
                          {product.brand && (
                            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#0A2A4A] shadow-sm ring-1 ring-slate-100">{product.brand}</span>
                          )}
                          {isNew(product.created_at) && !outOfStock && (
                            <span className="absolute right-3 top-3 rounded-full bg-orange-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">Nuevo</span>
                          )}
                          {product.featured && !outOfStock && (
                            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#0A2A4A] px-3 py-1 text-[11px] font-bold text-white shadow-md">
                              <Flame className="h-3.5 w-3.5 text-amber-400" /> Más vendido
                            </span>
                          )}
                        </Link>

                         <div className="flex flex-1 flex-col p-3 sm:p-4">
                          <span className="truncate text-[11px] font-semibold text-orange-600 sm:text-xs">{product.category || 'Equipo solar'}</span>
                          <Link href={`/products/${product.id}`} className="mt-1 block">
                            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#0A2A4A] transition-colors group-hover:text-orange-600 sm:text-base">{product.name}</h3>
                          </Link>
<p className="mt-1.5 hidden text-sm leading-relaxed text-slate-500 sm:line-clamp-2">{product.description}</p>                          <div className="mt-auto pt-2 sm:pt-3"><StockLabel stock={stock} /></div>
                        </div>

                        <div className="space-y-2 border-t border-slate-100 bg-slate-50/70 p-3 sm:space-y-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                            <span className={`${display.className} text-lg font-extrabold tracking-tight text-[#0A2A4A] sm:text-2xl`}>{clp.format(product.price)}</span>
                            <span className="text-[10px] text-slate-500 sm:text-xs">IVA incluido</span>
                          </div>
                          {outOfStock ? (
<a
  href={wa(`Hola, me interesa el producto "${product.name}" pero aparece sin stock. ¿Cuándo vuelve a estar disponible o tienen alguna alternativa?`)}
  target="_blank"
  rel="noopener noreferrer"
  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
>
  <MessageCircle className="h-4 w-4" /> <span className="sm:hidden">Consultar</span><span className="hidden sm:inline">Consultar disponibilidad</span></a>                          ) : (
                            <div className="w-full [&>button]:w-full"><AddToCartButton product={product} /></div>
                          )}
                        </div>
                      </article>
                    </ScrollReveal>
                  )
                })
              ) : (
                <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center md:py-24">
                  <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600"><PackageSearch className="h-8 w-8" /></span>
                  <h3 className={`${display.className} text-2xl font-extrabold text-[#0A2A4A]`}>No encontramos equipos</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">Prueba con otra búsqueda o ajusta los filtros de precio, marca o categoría.</p>
                  <Link href="/tienda" className="mt-6 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500">Limpiar todos los filtros</Link>
                </div>
              )}
            </div>

            {totalPages > 1 && filteredProducts.length > 0 && (
              <nav aria-label="Paginación" className="mt-12 flex flex-wrap items-center justify-center gap-1.5">
                {currentPage > 1 ? (
                  <Link href={buildHref({ pagina: currentPage - 1 === 1 ? null : String(currentPage - 1) })} aria-label="Página anterior" className={`${pageBtn} bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-orange-300 hover:text-orange-600`}><ChevronLeft className="h-4 w-4" /></Link>
                ) : (
                  <span className={`${pageBtn} bg-slate-100 text-slate-300`}><ChevronLeft className="h-4 w-4" /></span>
                )}
                {getPageItems(currentPage, totalPages).map((item, i) =>
                  item === '…' ? (
                    <span key={`dots-${i}`} className="w-8 select-none text-center text-slate-400">…</span>
                  ) : item === currentPage ? (
                    <span key={item} aria-current="page" className={`${pageBtn} bg-[#0A2A4A] font-bold text-white`}>{item}</span>
                  ) : (
                    <Link key={item} href={buildHref({ pagina: item === 1 ? null : String(item) })} className={`${pageBtn} bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-orange-300 hover:text-orange-600`}>{item}</Link>
                  )
                )}
                {currentPage < totalPages ? (
                  <Link href={buildHref({ pagina: String(currentPage + 1) })} aria-label="Página siguiente" className={`${pageBtn} bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-orange-300 hover:text-orange-600`}><ChevronRight className="h-4 w-4" /></Link>
                ) : (
                  <span className={`${pageBtn} bg-slate-100 text-slate-300`}><ChevronRight className="h-4 w-4" /></span>
                )}
              </nav>
            )}

            {/* Asesoría */}
            <div className="mt-14 flex flex-col items-start gap-5 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-amber-500 p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
              <div className="flex items-start gap-4">
                <Sun className="mt-1 h-9 w-9 shrink-0" strokeWidth={1.75} />
                <div>
                  <h2 className={`${display.className} text-2xl font-extrabold md:text-3xl`}>¿No sabes qué equipo elegir?</h2>
                  <p className="mt-1 max-w-md text-orange-50">Cuéntanos tu consumo y te recomendamos el sistema adecuado, sin costo.</p>
                </div>
              </div>
              <Link href="/contacto" className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-orange-600 shadow-lg transition hover:-translate-y-0.5">
                Pedir asesoría <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
  
