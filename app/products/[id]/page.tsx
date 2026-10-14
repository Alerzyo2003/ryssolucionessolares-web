import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import { FaWhatsapp } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'
import ProductGallery from '@/components/ProductGallery'
import ProductPurchase from '@/components/ProductPurchase'
import { ChevronRight, Truck, ShieldCheck, Headphones, FileText, CreditCard, ImageOff, Sun, ArrowRight } from 'lucide-react'
import TrackViewContent from '@/components/TrackViewContent'

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'] })

// Ajusta estos valores (o defínelos en .env)
const SITE_NAME = 'R&S Soluciones Solares'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ryssolucionessolares.cl'
// Número con código de país y sin "+"
const WHATSAPP_NUMBER = '56991363439'

interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  image_url?: string | null
  category?: string | null
  brand?: string | null
  images?: string[] | null
  warranty?: string | null
  specs?: Record<string, string | number> | { label: string; value: string | number }[] | null
}

interface RelatedProduct {
  id: string
  name: string
  price: number
  image_url?: string | null
  brand?: string | null
}

type PageProps = { params: Promise<{ id: string }> }

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

const getProduct = cache(async (id: string): Promise<Product | null> => {
  const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  return (data as Product) ?? null
})

function toSpecRows(specs: Product['specs']): { label: string; value: string }[] {
  if (!specs) return []
  if (Array.isArray(specs)) {
    return specs
      .filter((s) => s && s.label && s.value !== undefined && s.value !== '')
      .map((s) => ({ label: String(s.label), value: String(s.value) }))
  }
  return Object.entries(specs)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => ({ label: k, value: String(v) }))
}

function StockBadge({ stock }: { stock: number }) {
  const [bg, dot, text, label] =
    stock <= 0
      ? ['bg-red-50 text-red-700', 'bg-red-500', '', 'Sin stock']
      : stock <= 5
        ? ['bg-amber-50 text-amber-700', 'bg-amber-500', '', `Últimas ${stock} unidades`]
        : ['bg-emerald-50 text-emerald-700', 'bg-emerald-500', '', 'Disponible']
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${bg} ${text}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
    </span>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: `Producto no encontrado | ${SITE_NAME}` }

  const clean = (product.description || '').replace(/\s+/g, ' ').trim().slice(0, 155)
  const title = `${product.name} | ${SITE_NAME}`
  const description = clean || `Compra ${product.name} en ${SITE_NAME}. Envío a todo Chile, factura y asesoría técnica.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/products/${product.id}` },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: SITE_NAME,
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const stock = Number(product.stock ?? 0)
  const outOfStock = stock <= 0

  const galleryImages = Array.from(
    new Set([product.image_url, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean))
  ) as string[]

  const customSpecs = toSpecRows(product.specs)
  const highlights = customSpecs.slice(0, 3)
  const specRows = [
    ...(product.brand ? [{ label: 'Marca', value: product.brand }] : []),
    ...(product.category ? [{ label: 'Categoría', value: product.category }] : []),
    ...customSpecs,
    ...(product.warranty ? [{ label: 'Garantía', value: product.warranty }] : []),
  ]

  let relatedQuery = supabase.from('products').select('id, name, price, image_url, brand').neq('id', product.id).limit(4)
  if (product.category) relatedQuery = relatedQuery.eq('category', product.category)
  const { data: relatedData } = await relatedQuery
  const related = (relatedData || []) as RelatedProduct[]

  const productUrl = `${SITE_URL}/products/${product.id}`
  // Mensaje de WhatsApp con el nombre del producto y el enlace a esta página
  const whatsappMessage = `Hola, me gustaría recibir más información sobre "${product.name}" (${clp.format(product.price)}). ${productUrl}`
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`
  const categoryHref = product.category ? `/tienda?categoria=${encodeURIComponent(product.category.toLowerCase())}` : '/tienda'

  const trust = [
    { icon: Truck, title: 'Envío a todo Chile', text: 'Despacho a regiones' },
    { icon: ShieldCheck, title: product.warranty ? `Garantía: ${product.warranty}` : 'Garantía del fabricante', text: 'Equipos certificados' },
    { icon: FileText, title: 'Factura disponible', text: 'Para empresas y particulares' },
    { icon: CreditCard, title: 'Pago seguro', text: 'Webpay y Mercado Pago' },
  ]

  const sections = [
    product.description && { id: 'descripcion', label: 'Descripción' },
    specRows.length > 0 && { id: 'ficha', label: 'Ficha técnica' },
    related.length > 0 && { id: 'relacionados', label: 'Relacionados' },
  ].filter(Boolean) as { id: string; label: string }[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        description: product.description || undefined,
        image: galleryImages.length ? galleryImages : undefined,
        sku: product.id,
        category: product.category || undefined,
        brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'CLP',
          price: product.price,
          itemCondition: 'https://schema.org/NewCondition',
          availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: SITE_NAME },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/tienda` },
          { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
        ],
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[#F6F8FB] pb-28 text-slate-800 lg:pb-24">
      <style>{`
        @keyframes enter { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
        .enter { animation: enter .7s cubic-bezier(.16,1,.3,1) both }
        @media (prefers-reduced-motion: reduce) { .enter { animation: none } }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
<TrackViewContent
        id={product.id}
        name={product.name}
        price={product.price}
        category={product.category ?? undefined}
      />
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-1.5 py-5 text-xs text-slate-500 md:py-6">
          <Link href="/" className="transition-colors hover:text-orange-600">Inicio</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/tienda" className="transition-colors hover:text-orange-600">Tienda</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link href={categoryHref} className="transition-colors hover:text-orange-600">{product.category}</Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span aria-current="page" className="max-w-[16rem] truncate font-medium text-slate-700">{product.name}</span>
        </nav>

        {/* data-fly-source: la animación al carrito toma la primera imagen de este bloque */}
        <div data-fly-source className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="enter rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200 md:p-5">
            <ProductGallery images={galleryImages} alt={product.name} outOfStock={outOfStock} />
          </div>

          <div className="enter lg:sticky lg:top-28" style={{ animationDelay: '.12s' }}>
            <div className="flex flex-wrap items-center gap-3">
              {product.brand && (
                <Link
                  href={`/tienda?marca=${encodeURIComponent(product.brand.toLowerCase())}`}
                  className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100"
                >
                  {product.brand}
                </Link>
              )}
              <StockBadge stock={stock} />
            </div>

            <h1 className={`${display.className} mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-[#0A2A4A] md:text-4xl`}>
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className={`${display.className} text-4xl font-extrabold tracking-tight text-[#0A2A4A] md:text-5xl`}>
                {clp.format(product.price)}
              </span>
              <span className="text-sm font-medium text-slate-500">IVA incluido</span>
            </div>

            {highlights.length > 0 && (
              <dl className="mt-6 grid grid-cols-3 gap-2">
                {highlights.map((h) => (
                  <div key={h.label} className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200">
                    <dt className="truncate text-[11px] text-slate-500">{h.label}</dt>
                    <dd className="mt-0.5 truncate text-sm font-bold text-[#0A2A4A]">{h.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-7">
              <ProductPurchase
                product={{ id: product.id, name: product.name, price: product.price, stock }}
                productUrl={productUrl}
              />

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-[#25D366] bg-white px-5 py-3.5 text-sm font-bold text-[#128C7E] transition hover:bg-[#25D366] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30"
              >
                <FaWhatsapp aria-hidden="true" size={20} />
                Pedir más información por WhatsApp
              </a>
            </div>

            <ul className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {trust.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <Icon className="h-4 w-4 text-orange-600" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm font-bold text-[#0A2A4A]">{title}</span>
                    <span className="block text-xs text-slate-500">{text}</span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Asesoría: ayuda a decidir si el equipo es el adecuado */}
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#0A2A4A] p-5 text-white">
              <Sun className="h-8 w-8 shrink-0 text-amber-300" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">¿No sabes si este equipo es para tu consumo?</p>
                <p className="mt-0.5 text-xs text-slate-300">Te ayudamos a dimensionar tu sistema, sin costo.</p>
              </div>
              <Link href="/contacto" className="group flex shrink-0 items-center gap-1.5 rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold transition hover:bg-orange-500">
                Consultar <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Navegación interna (sticky bajo el navbar) */}
        {sections.length > 1 && (
          <nav aria-label="Secciones" className="sticky top-16 z-30 -mx-5 mt-14 overflow-x-auto bg-[#F6F8FB]/90 px-5 py-3 backdrop-blur md:mx-0 md:mt-20 md:px-0">
            <ul className="flex gap-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0A2A4A] ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700 hover:ring-orange-200">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {(product.description || specRows.length > 0) && (
          <section className={`mt-6 grid gap-6 ${product.description && specRows.length > 0 ? 'lg:grid-cols-2' : ''}`}>
            {product.description && (
              <div id="descripcion" className="scroll-mt-32 rounded-3xl bg-white p-6 ring-1 ring-slate-200 md:p-8">
                <h2 className={`${display.className} text-2xl font-extrabold tracking-tight text-[#0A2A4A]`}>Descripción</h2>
                <p className="mt-4 max-w-prose whitespace-pre-wrap text-[15px] leading-relaxed text-slate-600">{product.description}</p>
              </div>
            )}
            {specRows.length > 0 && (
              <div id="ficha" className="scroll-mt-32 rounded-3xl bg-white p-6 ring-1 ring-slate-200 md:p-8">
                <h2 className={`${display.className} text-2xl font-extrabold tracking-tight text-[#0A2A4A]`}>Ficha técnica</h2>
                <dl className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-100">
                  {specRows.map((row, i) => (
                    <div key={`${row.label}-${i}`} className={`flex items-start justify-between gap-6 px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                      <dt className="text-slate-500">{row.label}</dt>
                      <dd className="text-right font-semibold text-[#0A2A4A]">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </section>
        )}

        {related.length > 0 && (
          <section id="relacionados" className="mt-14 scroll-mt-32 md:mt-20" aria-labelledby="relacionados-titulo">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="relacionados-titulo" className={`${display.className} text-2xl font-extrabold tracking-tight text-[#0A2A4A] md:text-3xl`}>
                También te puede interesar
              </h2>
              <Link href={categoryHref} className="group flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#0A2A4A] hover:text-orange-600">
                Ver todos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-orange-300"
                >
                  <div className="relative aspect-square w-full border-b border-slate-100 bg-white">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300"><ImageOff className="h-8 w-8" /></div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    {item.brand && <span className="text-[11px] font-semibold text-slate-500">{item.brand}</span>}
                    <h3 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-[#0A2A4A] transition-colors group-hover:text-orange-600">{item.name}</h3>
                    <span className="mt-auto pt-3 text-base font-extrabold tracking-tight text-[#0A2A4A]">{clp.format(item.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}