import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductGallery from '@/components/ProductGallery'
import ProductPurchase from '@/components/ProductPurchase'
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  Headphones,
  FileText,
  CreditCard,
  ImageOff,
} from 'lucide-react'

// ⚠️ Cambia estos valores por los de tu tienda (igual que en tienda/page.tsx)
const SITE_NAME = 'Tu Tienda'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tutienda.cl'
// Número con código de país y sin "+" (ej: 56912345678). Si no está definido, el botón no se muestra.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  image_url?: string | null
  category?: string | null
  brand?: string | null
  // Opcionales: se muestran solo si existen en tu tabla
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

const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

// Evita consultar dos veces el mismo producto (metadata + página)
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
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
        <span className="h-2 w-2 rounded-full bg-red-500" /> Sin stock
      </span>
    )
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" /> Últimas {stock} unidades
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Disponible
    </span>
  )
}

/* ---------------------------------- SEO ---------------------------------- */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) return { title: `Producto no encontrado | ${SITE_NAME}` }

  const cleanDescription = (product.description || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155)

  const title = `${product.name} | ${SITE_NAME}`
  const description =
    cleanDescription ||
    `Compra ${product.name} en ${SITE_NAME}. Envío a todo Chile, factura y asesoría técnica.`

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

/* --------------------------------- PÁGINA -------------------------------- */

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const stock = Number(product.stock ?? 0)
  const outOfStock = stock <= 0

  // Galería: imagen principal + extras (sin duplicados)
  const galleryImages = Array.from(
    new Set([product.image_url, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean))
  ) as string[]

  // Ficha técnica
  const specRows = [
    ...(product.brand ? [{ label: 'Marca', value: product.brand }] : []),
    ...(product.category ? [{ label: 'Categoría', value: product.category }] : []),
    ...toSpecRows(product.specs),
    ...(product.warranty ? [{ label: 'Garantía', value: product.warranty }] : []),
  ]

  // Productos relacionados (misma categoría si existe)
  let relatedQuery = supabase
    .from('products')
    .select('id, name, price, image_url, brand')
    .neq('id', product.id)
    .limit(4)
  if (product.category) relatedQuery = relatedQuery.eq('category', product.category)
  const { data: relatedData } = await relatedQuery
  const related = (relatedData || []) as RelatedProduct[]

  const productUrl = `${SITE_URL}/products/${product.id}`

  const trust = [
    { icon: Truck, title: 'Envío a todo Chile', text: 'Despacho a regiones' },
    {
      icon: ShieldCheck,
      title: product.warranty ? `Garantía: ${product.warranty}` : 'Garantía del fabricante',
      text: 'Equipos certificados',
    },
    { icon: FileText, title: 'Factura disponible', text: 'Para empresas y particulares' },
    { icon: Headphones, title: 'Asesoría técnica', text: 'Te ayudamos a dimensionar tu sistema' },
    { icon: CreditCard, title: 'Pago seguro', text: 'Webpay y Mercado Pago' },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
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
      availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-28 text-slate-800 lg:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Ruta de navegación"
          className="flex flex-wrap items-center gap-1.5 py-5 text-xs text-slate-400 md:py-6"
        >
          <Link href="/" className="transition-colors hover:text-orange-600">Inicio</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/tienda" className="transition-colors hover:text-orange-600">Tienda</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/tienda?categoria=${encodeURIComponent(product.category.toLowerCase())}`}
                className="transition-colors hover:text-orange-600"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="max-w-[16rem] truncate font-medium text-slate-600">{product.name}</span>
        </nav>

        {/* Bloque principal: galería + compra.
            data-fly-source: la animación al carrito toma la primera imagen de este bloque. */}
        <div data-fly-source className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <ProductGallery images={galleryImages} alt={product.name} outOfStock={outOfStock} />

          <div className="lg:sticky lg:top-28">
            {product.brand && (
              <Link
                href={`/tienda?marca=${encodeURIComponent(product.brand.toLowerCase())}`}
                className="text-sm font-semibold text-orange-600 underline-offset-4 hover:underline"
              >
                {product.brand}
              </Link>
            )}

            <h1 className="mt-1.5 text-2xl font-extrabold leading-tight tracking-tight text-[#0F172A] md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4">
              <StockBadge stock={stock} />
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
                {clp.format(product.price)}
              </span>
              <span className="text-sm font-medium text-slate-500">IVA incluido</span>
            </div>

            <div className="mt-7">
              <ProductPurchase
                product={{ id: product.id, name: product.name, price: product.price, stock }}
                productUrl={productUrl}
                whatsappNumber={WHATSAPP_NUMBER}
              />
            </div>

            <ul className="mt-8 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {trust.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-center gap-3.5 px-4 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <Icon className="h-4 w-4 text-orange-600" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm font-bold text-[#0F172A]">{title}</span>
                    <span className="block text-xs text-slate-500">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Descripción + ficha técnica */}
        {(product.description || specRows.length > 0) && (
          <section
            className={`mt-14 grid gap-8 md:mt-20 ${
              product.description && specRows.length > 0 ? 'lg:grid-cols-2' : ''
            }`}
          >
            {product.description && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
                <h2 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Descripción</h2>
                <p className="mt-4 max-w-prose whitespace-pre-wrap text-[15px] leading-relaxed text-slate-600">
                  {product.description}
                </p>
              </div>
            )}

            {specRows.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
                <h2 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Ficha técnica</h2>
                <dl className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                  {specRows.map((row, i) => (
                    <div
                      key={`${row.label}-${i}`}
                      className={`flex items-start justify-between gap-6 px-4 py-3 text-sm ${
                        i % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'
                      }`}
                    >
                      <dt className="text-slate-500">{row.label}</dt>
                      <dd className="text-right font-semibold text-[#0F172A]">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </section>
        )}

        {/* Productos relacionados */}
        {related.length > 0 && (
          <section className="mt-14 md:mt-20" aria-labelledby="relacionados">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="relacionados" className="text-xl font-extrabold tracking-tight text-[#0F172A] md:text-2xl">
                También te puede interesar
              </h2>
              <Link
                href={
                  product.category
                    ? `/tienda?categoria=${encodeURIComponent(product.category.toLowerCase())}`
                    : '/tienda'
                }
                className="shrink-0 text-sm font-semibold text-orange-600 underline-offset-4 hover:underline"
              >
                Ver todos
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-900/5"
                >
                  <div className="relative aspect-square w-full border-b border-slate-100 bg-white">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300">
                        <ImageOff className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3.5 md:p-4">
                    {item.brand && (
                      <span className="text-[11px] font-semibold text-slate-400">{item.brand}</span>
                    )}
                    <h3 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-[#0F172A] transition-colors group-hover:text-orange-600">
                      {item.name}
                    </h3>
                    <span className="mt-auto pt-3 text-base font-black tracking-tight text-[#0F172A]">
                      {clp.format(item.price)}
                    </span>
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