import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import AddToCartButton from '@/components/AddToCartButton'
import ContactForm from '@/components/ContactForm'
import BrandCarousel from '@/components/BrandCarousel'
import ScrollReveal from '@/components/ScrollReveal'
import AnimatedCounter from '@/components/AnimatedCounter'
import SavingsCalculator from '@/components/SavingsCalculator'
import EnergyFlow from '@/components/EnergyFlow'
import { SunProgress, HeroSun, NightSky, DayClock } from '@/components/SunScroll'
import {
  ArrowRight, MessageCircle, ClipboardCheck, Wrench, Gauge,
  Globe2, Star, Tag, Lock, Award, BadgeCheck, Zap, ShieldCheck,
  House, Building2, Factory, Plus, Check, CreditCard, CalendarCheck,
  MapPin, Sun, TrendingDown, Phone, FileText,
} from 'lucide-react'

/* Las versiones nuevas de lucide-react ya no incluyen logos de marcas, así que van como SVG propios */
function Facebook({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M14 8V6.5c0-.7.5-1 1-1h2V2h-3c-3 0-4 2-4 4.5V8H7.5v3.5H10V22h4V11.5h2.8L17.5 8H14z" />
    </svg>
  )
}

function Instagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['500', '700', '800'] })

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category?: string
}

export const dynamic = 'force-dynamic'

/* ================== DATOS DEL NEGOCIO ================== */
const PHONE_DISPLAY = '+56 9 9136 3439'
const PHONE_TEL = '+56991363439'
const WHATSAPP_NUMBER = '56991363439'
const FACEBOOK_URL = 'https://www.facebook.com/p/R-S-Soluciones-Solares-100065456444686/'
const INSTAGRAM_URL = 'https://www.instagram.com/rys_solucionessolares/'

const wa = (msg: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
const WHATSAPP_URL = wa('Hola, quiero cotizar un sistema solar')

/*
  PROYECTOS REALES — reemplaza estos datos con tus instalaciones reales
  (foto de tu proyecto, comuna, potencia y ahorro que vio el cliente).
  Si un campo no lo conoces, déjalo vacío ('') y no se mostrará.
*/
const PROJECTS: { img: string; tipo: string; comuna: string; kwp: string; ahorro: string }[] = [
  { img: 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=800&auto=format&fit=crop', tipo: 'Vivienda', comuna: 'TODO: comuna', kwp: 'TODO kWp', ahorro: '' },
  { img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop', tipo: 'Comercio', comuna: 'TODO: comuna', kwp: 'TODO kWp', ahorro: '' },
  { img: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=800&auto=format&fit=crop', tipo: 'Industria', comuna: 'TODO: comuna', kwp: 'TODO kWp', ahorro: '' },
]

/* Planes: ajusta potencias y textos a tus kits reales. Precio opcional (deja null para "Cotizar"). */
const PLANS: { name: string; kwp: string; para: string; price: number | null; popular?: boolean; items: string[]; msg: string }[] = [
  {
    name: 'Hogar Básico',
    kwp: '~2 kWp',
    para: 'Cuentas de luz bajas o departamentos con techo',
    price: null,
    items: ['Paneles + inversor on-grid', 'Estructura de montaje', 'Instalación y trámite SEC', 'Monitoreo desde el celular'],
    msg: '¡Hola! 👋 Vi el *Plan Hogar Básico (~2 kWp)* en su web y me gustaría cotizarlo.\n\n📍 Comuna: \n💡 Pago aprox. de luz al mes: $\n🏠 Tipo de techo (zinc, teja, losa…): \n\nSi quieren, les envío una foto de mi boleta. ¡Gracias!',
  },
  {
    name: 'Hogar Familiar',
    kwp: '~4 kWp',
    para: 'Familias con consumo medio-alto',
    price: null,
    popular: true,
    items: ['Paneles + inversor on-grid', 'Estructura de montaje', 'Instalación y trámite SEC', 'Monitoreo desde el celular', 'Visita técnica post-instalación'],
    msg: '¡Hola! 👋 Me interesa el *Plan Hogar Familiar (~4 kWp)* para bajar la cuenta de luz de mi casa.\n\n📍 Comuna: \n💡 Pago aprox. de luz al mes: $\n👨‍👩‍👧 Personas en la casa: \n🏠 Tipo de techo: \n\n¿Podemos agendar la visita técnica sin costo? Les puedo enviar foto de mi boleta.',
  },
  {
    name: 'Comercio / Pyme',
    kwp: 'A medida',
    para: 'Locales, oficinas y talleres',
    price: null,
    items: ['Estudio de consumo', 'Diseño de ingeniería', 'Instalación y puesta en marcha', 'Soporte técnico'],
    msg: '¡Hola! 👋 Tengo un negocio y quiero evaluar el *Plan Comercio / Pyme* para reducir nuestros costos de energía.\n\n🏢 Tipo de negocio: \n📍 Comuna: \n💡 Gasto mensual en luz aprox.: $\n\nMe gustaría coordinar un estudio de consumo. ¿Qué información necesitan de mi parte?',
  },
]

const clp = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n)

export default async function HomePage() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-[#F6F8FB] pb-20 text-slate-800 antialiased md:pb-0">
      <style>{`
        @keyframes rise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
        @keyframes sunrise { from { transform: translateY(40px) scale(.9); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes drift { 0%,100% { transform: translateX(0) } 50% { transform: translateX(14px) } }
        .rise { opacity: 0; animation: rise .8s cubic-bezier(.16,1,.3,1) forwards }
        .sunrise { animation: sunrise 1.6s cubic-bezier(.16,1,.3,1) both }
        .drift { animation: drift 9s ease-in-out infinite }
        @keyframes shimmer { from { transform: translateX(-120%) skewX(-20deg) } to { transform: translateX(320%) skewX(-20deg) } }
        .shimmer::after { content: ''; position: absolute; inset: 0; width: 35%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent); animation: shimmer 3.2s ease-in-out infinite; }
        @keyframes grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        .progress { transform-origin: 0 50%; animation: grow linear both; animation-timeline: scroll(root); }
        @keyframes panelIn { from { opacity: 0; transform: perspective(900px) rotateX(10deg) translateY(30px) } to { opacity: 1; transform: none } }
        .tilt-in { animation: panelIn 1s cubic-bezier(.16,1,.3,1) .5s both }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.55) } 100% { box-shadow: 0 0 0 18px rgba(16,185,129,0) } }
        .pulse-ring { animation: pulseRing 2s ease-out infinite }
        @media (prefers-reduced-motion: reduce) {
          .rise, .sunrise, .drift, .tilt-in, .progress, .shimmer::after, .pulse-ring { animation: none !important; opacity: 1 !important; transform: none !important }
        }
      `}</style>

      <SunProgress />
      <NightSky />
      <DayClock />

      {/* FRANJA SUPERIOR: oferta + contacto directo */}
      <div className="bg-orange-600 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 py-2 text-center text-xs font-medium md:justify-between md:px-8 md:text-sm">
          <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Evaluación y cotización sin costo · Agenda tu visita técnica</span>
          <a href={`tel:${PHONE_TEL}`} className="hidden items-center gap-2 hover:underline md:flex"><Phone className="h-4 w-4" /> {PHONE_DISPLAY}</a>
        </div>
      </div>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#071A30] text-white">
        <Image
          src="https://dceupbfonovchzinruai.supabase.co/storage/v1/object/public/imagenes-pagina/ChatGPT%20Image%207%20sept%202026,%2012_08_39.webp"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-40 -z-20"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071A30] via-[#071A30]/90 to-[#071A30]/40" />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <HeroSun />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="rise text-sm font-medium text-amber-300" style={{ animationDelay: '.05s' }}>
              Energía solar para hogares y empresas en Chile
            </p>
            <h1 className={`${display.className} rise mt-4 text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl`} style={{ animationDelay: '.15s' }}>
              Tu techo ya recibe energía gratis. Úsala.
            </h1>
            <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-slate-300" style={{ animationDelay: '.3s' }}>
              Baja tu cuenta de luz con un sistema fotovoltaico diseñado según tu consumo real. Nosotros nos encargamos de todo: diseño, equipos, instalación y trámites.
            </p>
            <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '.45s' }}>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="shimmer group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-orange-600 px-7 py-4 text-sm font-semibold shadow-lg shadow-orange-950/40 transition hover:bg-orange-500 active:scale-[.98]">
                <MessageCircle className="h-4 w-4" />
                Cotizar gratis por WhatsApp
              </a>
              <a href="#planes" className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-7 py-4 text-sm font-semibold transition hover:bg-white/10">
                Ver planes
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            <div className="rise mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-300" style={{ animationDelay: '.6s' }}>
              <span className="flex items-center gap-2"><Award className="h-4 w-4 text-amber-300" /> Instalación certificada SEC</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-300" /> Paneles con garantía de hasta 25 años</span>
              <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-300" /> Facilidades de pago</span>
            </div>
          </div>

          <div className="tilt-in lg:col-span-5">
            <SavingsCalculator />
            <a href={wa('Hola, usé la calculadora de ahorro de su web y quiero una cotización exacta para mi casa')} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
              <MessageCircle className="h-4 w-4" /> Quiero mi cotización exacta
            </a>
          </div>
        </div>
      </section>

      {/* MARCAS */}
      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="mb-6 text-center text-sm text-slate-500">Instalamos equipos de las marcas que lideran el mercado</p>
          <BrandCarousel />
        </div>
      </section>

      {/* PRODUCTOS */}
      <section id="tienda" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <ScrollReveal className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2 className={`${display.className} text-4xl font-extrabold tracking-tight text-[#0A2A4A] md:text-5xl`}>Paneles, inversores y kits solares</h2>
            <p className="mt-3 text-slate-600">Equipos de marcas líderes con despacho y opción de instalación. Compra en línea o cotiza con nosotros.</p>
          </div>
          <Link href="/tienda" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#0A2A4A] hover:text-orange-600">
            Ver todos los productos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products && products.length > 0 ? (
            products.map((product: Product, index: number) => (
              <ScrollReveal key={product.id} as="fade-up" delay={(index % 4) * 90}>
                <div className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-orange-300">
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                      <Image
                        src={product.image_url || 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=600&auto=format&fit=crop'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#0A2A4A] shadow-sm">{product.category || 'Equipo solar'}</span>
                      {product.stock > 0 && product.stock <= 5 && (
                        <span className="absolute right-3 top-3 rounded-full bg-orange-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">Últimas {product.stock} unidades</span>
                      )}
                      {product.stock === 0 && (
                        <span className="absolute right-3 top-3 rounded-full bg-slate-700 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">Agotado</span>
                      )}
                    </div>
                    <div className="p-5">
                      <Link href={`/products/${product.id}`} className="block">
                        <h3 className="line-clamp-1 text-lg font-bold text-[#0A2A4A] transition-colors group-hover:text-orange-600">{product.name}</h3>
                      </Link>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{product.description}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] text-slate-400">IVA incluido</span>
                        <span className="text-xl font-extrabold text-[#0A2A4A]">{clp(product.price)}</span>
                      </div>
                      <AddToCartButton product={product} />
                    </div>
                    <a href={wa(`Hola, tengo una consulta sobre el producto: ${product.name}`)} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline">
                      <MessageCircle className="h-3.5 w-3.5" /> Consultar por WhatsApp
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            ))
          ) : (
            <div className="col-span-full rounded-2xl bg-white py-16 text-center ring-1 ring-slate-200">
              <p className="font-medium text-slate-500">Aún no hay productos publicados.</p>
              <Link href="/iniciar-sesion" className="mt-4 inline-block font-semibold text-orange-600 hover:underline">Entra como administrador para crear el primero</Link>
            </div>
          )}
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ScrollReveal className="mb-12 max-w-2xl">
            <h2 className={`${display.className} text-4xl font-extrabold tracking-tight text-[#0A2A4A] md:text-5xl`}>Elige tu plan solar</h2>
            <p className="mt-4 text-slate-600">Todo incluido: equipos, instalación, trámite de conexión y monitoreo. Ajustamos la potencia exacta a tu consumo.</p>
          </ScrollReveal>
          <div className="grid items-stretch gap-6 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <ScrollReveal key={p.name} delay={i * 110}>
                <div className={`relative flex h-full flex-col rounded-3xl p-8 ${p.popular ? 'bg-[#0A2A4A] text-white shadow-2xl ring-2 ring-orange-500 md:-translate-y-3' : 'bg-[#F6F8FB] ring-1 ring-slate-200'}`}>
                  {p.popular && (
                    <span className="absolute -top-3 left-8 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">Más elegido</span>
                  )}
                  <h3 className={`${display.className} text-2xl font-bold ${p.popular ? '' : 'text-[#0A2A4A]'}`}>{p.name}</h3>
                  <p className={`mt-1 text-sm ${p.popular ? 'text-slate-300' : 'text-slate-500'}`}>{p.para}</p>
                  <div className={`${display.className} mt-6 text-4xl font-extrabold ${p.popular ? 'text-amber-400' : 'text-orange-600'}`}>
                    {p.price ? clp(p.price) : p.kwp}
                  </div>
                  <p className={`text-xs ${p.popular ? 'text-slate-400' : 'text-slate-400'}`}>{p.price ? `${p.kwp} · IVA incluido · consulta cuotas` : 'Precio según tu techo y consumo'}</p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {p.items.map((x) => (
                      <li key={x} className="flex items-start gap-2"><Check className={`mt-0.5 h-4 w-4 flex-none ${p.popular ? 'text-amber-400' : 'text-orange-600'}`} /> {x}</li>
                    ))}
                  </ul>
                  <a
                    href={wa(p.msg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition ${p.popular ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-white text-[#0A2A4A] ring-1 ring-slate-300 hover:ring-orange-500'}`}
                  >
                    Cotizar este plan <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
            <CreditCard className="h-4 w-4 text-orange-600" /> Pregúntanos por las opciones de pago y cuotas disponibles.
          </p>
        </div>
      </section>

      {/* RETORNO DE INVERSIÓN */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ScrollReveal className="mb-10 max-w-2xl">
            <h2 className={`${display.className} text-4xl font-extrabold tracking-tight text-[#0A2A4A] md:text-5xl`}>No es un gasto, es una inversión que se paga sola</h2>
            <p className="mt-4 text-slate-600">Lo que hoy pagas en la cuenta de luz se convierte en un sistema que es tuyo y produce energía por décadas.</p>
          </ScrollReveal>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { Icon: TrendingDown, t: 'Baja tu cuenta desde el primer mes', d: 'Consumes tu propia energía durante el día y los excedentes se descuentan vía Net Billing.' },
              { Icon: Sun, t: 'Décadas de generación', d: 'Los paneles tienen una vida útil de 25 años o más, con muy poca mantención.' },
              { Icon: House, t: 'Tu propiedad vale más', d: 'Una casa con energía solar es más atractiva para vender o arrendar.' },
            ].map(({ Icon, t, d }, i) => (
              <ScrollReveal key={t} delay={i * 100}>
                <div className="h-full rounded-3xl bg-[#F6F8FB] p-7 ring-1 ring-slate-200">
                  <Icon className="mb-5 h-7 w-7 text-orange-600" strokeWidth={1.75} />
                  <h3 className="text-lg font-bold text-[#0A2A4A]">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SISTEMA EN ACCIÓN */}
      <section className="bg-[#F6F8FB] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-12">
          <ScrollReveal className="lg:col-span-5">
            <h2 className={`${display.className} text-4xl font-extrabold leading-tight tracking-tight text-[#0A2A4A] md:text-5xl`}>Así trabaja tu sistema cada día</h2>
            <p className="mt-5 leading-relaxed text-slate-600">
              Los paneles generan energía, el inversor la convierte en corriente para tu casa y los excedentes se inyectan a la red para descontarlos de tu cuenta.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {['Consumes primero lo que generas', 'Los excedentes van a la red, no se pierden', 'Monitoreas todo desde tu celular'].map((x) => (
                <li key={x} className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 flex-none text-orange-600" /> {x}</li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal as="scale" delay={120} className="lg:col-span-7">
            <EnergyFlow />
          </ScrollReveal>
        </div>
      </section>

      {/* ACERCA */}
      <section id="acerca" className="bg-[#F6F8FB] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-2">
          <ScrollReveal as="slide-right">
            <h2 className={`${display.className} max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-[#0A2A4A] md:text-5xl`}>
              Ingeniería solar hecha en Chile, para que dejes de depender de la cuenta de luz
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-slate-600">
              R&amp;S Soluciones Solares diseña, suministra e instala sistemas fotovoltaicos para casas, comercios e industrias. Cada proyecto parte de tu consumo real, no de un kit genérico.
            </p>
            <div className="mt-10 flex gap-10 border-t border-slate-200 pt-8">
              <div>
                {/* Verifica que esta cifra sea real antes de publicar */}
                <div className={`${display.className} text-5xl font-extrabold text-orange-600`}><AnimatedCounter value={500} prefix="+" /></div>
                <div className="mt-1 text-sm text-slate-500">Proyectos instalados</div>
              </div>
              <div className="border-l border-slate-200 pl-10">
                <div className={`${display.className} text-5xl font-extrabold text-[#0A2A4A]`}><AnimatedCounter value={25} suffix=" años" /></div>
                <div className="mt-1 text-sm text-slate-500">Garantía en paneles</div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal as="scale" delay={150}>
            <div className="relative h-[320px] overflow-hidden rounded-[2rem] shadow-2xl md:h-[460px]">
              <Image src="https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=1000&auto=format&fit=crop" alt="Instalación de paneles solares" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071A30]/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 text-sm font-semibold text-[#0A2A4A] backdrop-blur">
                Instaladores autorizados, con equipos certificados
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PROYECTOS REALIZADOS */}
      <section id="proyectos" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ScrollReveal className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className={`${display.className} text-4xl font-extrabold tracking-tight text-[#0A2A4A] md:text-5xl`}>Proyectos que ya están ahorrando</h2>
              <p className="mt-4 text-slate-600">Algunas de nuestras instalaciones. Más fotos y videos en nuestras redes.</p>
            </div>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#0A2A4A] hover:text-orange-600">
              <Instagram className="h-4 w-4" /> Ver más en Instagram <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3">
            {PROJECTS.map((p, i) => (
              <ScrollReveal key={i} as="fade-up" delay={i * 100}>
                <article className="group overflow-hidden rounded-3xl bg-[#F6F8FB] ring-1 ring-slate-200">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={p.img} alt={`Proyecto solar ${p.tipo} en ${p.comuna}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#0A2A4A]">{p.tipo}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 p-5 text-sm text-slate-600">
                    {p.comuna && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-600" /> {p.comuna}</span>}
                    {p.kwp && <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-orange-600" /> {p.kwp}</span>}
                    {p.ahorro && <span className="flex items-center gap-1.5 font-semibold text-emerald-600"><TrendingDown className="h-4 w-4" /> {p.ahorro}</span>}
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SEGMENTOS */}
      <section className="bg-[#F6F8FB] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ScrollReveal className="mb-12 max-w-2xl">
            <h2 className={`${display.className} text-4xl font-extrabold tracking-tight text-[#0A2A4A] md:text-5xl`}>Una solución para cada techo</h2>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { Icon: House, t: 'Hogares', d: 'Reduce tu cuenta de luz con un sistema a la medida de tu familia.', l: ['Kits residenciales', 'Instalación en techo', 'Monitoreo en el celular'] },
              { Icon: Building2, t: 'Comercios', d: 'Baja tus costos fijos de energía y estabiliza tus gastos.', l: ['Proyectos a medida', 'Evaluación de retorno', 'Soporte técnico'] },
              { Icon: Factory, t: 'Industrias', d: 'Sistemas de mayor potencia, con ingeniería y puesta en marcha.', l: ['Estudio de consumo', 'Diseño de ingeniería', 'Mantención programada'] },
            ].map(({ Icon, t, d, l }, i) => (
              <ScrollReveal key={t} delay={i * 110}>
                <article className="group relative h-full overflow-hidden rounded-3xl bg-white p-8 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:ring-orange-300">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 opacity-0 blur-2xl transition duration-500 group-hover:opacity-30" />
                  <div className="relative">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white"><Icon className="h-6 w-6" strokeWidth={1.75} /></span>
                    <h3 className={`${display.className} mt-6 text-2xl font-bold text-[#0A2A4A]`}>{t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
                    <ul className="mt-5 space-y-2 text-sm text-slate-700">
                      {l.map((x) => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-orange-600" /> {x}</li>)}
                    </ul>
                    <a href={wa(`Hola, quiero cotizar un sistema solar para ${t.toLowerCase()}`)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0A2A4A] hover:text-orange-600">
                      Cotizar para {t.toLowerCase()} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section id="proceso" className="bg-[#0A2A4A] py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ScrollReveal className="mb-14 max-w-2xl">
            <h2 className={`${display.className} text-4xl font-extrabold tracking-tight md:text-5xl`}>De la cotización a una cuenta de luz más baja</h2>
            <p className="mt-4 text-slate-300">Tres etapas, con acompañamiento en cada una.</p>
          </ScrollReveal>
          <ol className="grid gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-3">
            {[
              { n: '1', Icon: ClipboardCheck, t: 'Diagnóstico y cotización', d: 'Evaluamos tu consumo y tu techo para diseñar el sistema que se ajusta a tu presupuesto. Sin costo.' },
              { n: '2', Icon: Wrench, t: 'Instalación certificada', d: 'Nuestro equipo técnico instala, conecta y realiza los trámites ante la SEC y la distribuidora.' },
              { n: '3', Icon: Gauge, t: 'Monitoreo y ahorro', d: 'Revisa tu generación en tiempo real y compara tu cuenta de luz mes a mes.' },
            ].map(({ n, Icon, t, d }, i) => (
              <li key={n} className="bg-[#0A2A4A] p-8 md:p-10">
                <ScrollReveal as="fade-up" delay={i * 120}>
                  <div className="mb-8 flex items-center justify-between">
                    <span className={`${display.className} text-6xl font-extrabold text-amber-400`}>{n}</span>
                    <Icon className="h-7 w-7 text-orange-400" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-xl font-bold">{t}</h3>
                  <p className="mt-3 leading-relaxed text-slate-300">{d}</p>
                </ScrollReveal>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-7 py-4 text-sm font-semibold transition hover:bg-orange-500">
              <MessageCircle className="h-4 w-4" /> Empezar con el paso 1
            </a>
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section id="servicios" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ScrollReveal className="mb-12 max-w-2xl">
            <h2 className={`${display.className} text-4xl font-extrabold tracking-tight text-[#0A2A4A] md:text-5xl`}>Por qué elegirnos</h2>
            <p className="mt-4 text-slate-600">Proyectos pensados para durar, respaldados por fabricantes reconocidos.</p>
          </ScrollReveal>
          <div className="grid gap-5 md:grid-cols-3">
            <ScrollReveal className="md:col-span-2 md:row-span-2">
              <div className="flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-orange-600 to-amber-500 p-8 text-white md:p-10">
                <Star className="h-8 w-8" strokeWidth={1.75} />
                <div className="mt-16">
                  <h3 className={`${display.className} text-3xl font-extrabold md:text-4xl`}>Garantías claras, por escrito</h3>
                  <ul className="mt-5 grid max-w-lg gap-3 text-orange-50 sm:grid-cols-3">
                    {/* Ajusta los plazos a los que realmente ofreces */}
                    <li><span className="block text-2xl font-extrabold text-white">Hasta 25 años</span>Rendimiento de paneles (fabricante)</li>
                    <li><span className="block text-2xl font-extrabold text-white">Según marca</span>Inversor (fabricante)</li>
                    <li><span className="block text-2xl font-extrabold text-white">R&amp;S</span>Garantía de nuestra instalación</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
            {[
              { Icon: Globe2, t: 'Marcas mundiales', d: 'Inversores y paneles de los principales fabricantes.' },
              { Icon: Tag, t: 'Kits con retorno', d: 'Kits armados para recuperar tu inversión lo antes posible.' },
              { Icon: Lock, t: 'Pago seguro y soporte', d: 'Métodos de pago confiables y soporte técnico después de la venta.' },
              { Icon: BadgeCheck, t: 'Instaladores autorizados', d: 'Trámites y conexión a la red resueltos por nuestro equipo.' },
            ].map(({ Icon, t, d }, i) => (
              <ScrollReveal key={t} delay={i * 90}>
                <div className="h-full rounded-3xl bg-[#F6F8FB] p-7 ring-1 ring-slate-200">
                  <Icon className="mb-5 h-6 w-6 text-orange-600" strokeWidth={1.75} />
                  <h3 className="font-bold text-[#0A2A4A]">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="bg-[#071A30] py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ScrollReveal className="mb-12 max-w-2xl">
            <h2 className={`${display.className} text-4xl font-extrabold tracking-tight md:text-5xl`}>Lo que dicen nuestros clientes</h2>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { q: 'Excelente atención y servicio de instalación. Totalmente recomendado para quienes buscan reducir sus costos de energía de forma segura y profesional.', n: 'María Elena Soto' },
              { q: 'Muy buena asesoría desde el primer contacto. El kit solar funciona a la perfección y el equipo técnico resolvió todas nuestras dudas paso a paso.', n: 'Carlos Morales' },
            ].map(({ q, n }, i) => (
              <ScrollReveal key={n} as={i ? 'slide-left' : 'slide-right'}>
                <blockquote className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8">
                  <div>
                    <div className="mb-4 flex gap-1 text-amber-400">{[...Array(5)].map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}</div>
                    <p className="text-lg leading-relaxed text-slate-100">&ldquo;{q}&rdquo;</p>
                  </div>
                  <footer className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                    <span className="font-semibold">{n}</span>
                    <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-amber-300 hover:underline">
                      <Facebook className="h-4 w-4" /> Ver en Facebook
                    </a>
                  </footer>
                </blockquote>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="text-sm text-slate-400">Más proyectos y opiniones:</span>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"><Instagram className="h-4 w-4" /> Instagram</a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"><Facebook className="h-4 w-4" /> Facebook</a>
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-12">
          <ScrollReveal className="lg:col-span-4">
            <h2 className={`${display.className} text-4xl font-extrabold tracking-tight text-[#0A2A4A]`}>Preguntas frecuentes</h2>
            <p className="mt-4 text-slate-600">¿Tienes otra duda? Escríbenos y te respondemos.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
              <MessageCircle className="h-4 w-4" /> Preguntar por WhatsApp
            </a>
          </ScrollReveal>
          <ScrollReveal className="lg:col-span-8">
            <div className="divide-y divide-slate-200 rounded-3xl ring-1 ring-slate-200">
              {[
                ['¿Cuánto cuesta un sistema solar?', 'Depende de tu consumo, el espacio en tu techo y los equipos que elijas. Por eso la evaluación y la cotización son sin costo: te damos un precio cerrado, con todo incluido, antes de que decidas.'],
                ['¿En cuánto tiempo recupero la inversión?', 'Depende de cuánto pagas hoy de luz y del tamaño del sistema. En la cotización te mostramos el ahorro estimado y el plazo de retorno para tu caso.'],
                ['¿Hay facilidades de pago?', 'Sí, consúltanos por las alternativas de pago y cuotas disponibles al momento de cotizar.'],
                ['¿Funciona en días nublados?', 'Sí, pero genera menos que en un día despejado. Dimensionamos el sistema con tu consumo y la radiación de tu zona.'],
                ['¿Qué pasa con la energía que no consumo?', 'En Chile existe la generación distribuida (Net Billing): los excedentes se inyectan a la red y se descuentan en tu cuenta. Te explicamos cómo aplica a tu caso.'],
                ['¿Necesito baterías?', 'No es obligatorio en un sistema conectado a la red. Las baterías sirven si quieres respaldo ante cortes de luz.'],
                ['¿Ustedes hacen los trámites?', 'Sí. Nos encargamos de la declaración ante la SEC y la conexión con la distribuidora eléctrica.'],
                ['¿Cuánto demora la instalación?', 'Depende del tamaño del proyecto y de los trámites. Te entregamos un plazo concreto junto con la cotización.'],
                ['¿Qué mantención requiere?', 'Poca: limpieza periódica de los paneles y revisión del monitoreo. Nuestro soporte técnico te acompaña después de la instalación.'],
              ].map(([q, a]) => (
                <details key={q} className="group p-6 open:bg-slate-50 first:rounded-t-3xl last:rounded-b-3xl">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#0A2A4A] [&::-webkit-details-marker]:hidden">
                    {q}
                    <Plus className="h-5 w-5 flex-none text-orange-600 transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{a}</p>
                </details>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-amber-500 py-20">
        <div className="drift pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/15" />
        <ScrollReveal as="scale" className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <h2 className={`${display.className} text-4xl font-extrabold leading-tight text-white md:text-5xl`}>¿Listo para bajar tu cuenta de luz?</h2>
          <p className="mx-auto mt-4 max-w-xl text-orange-50">Envíanos una foto de tu boleta de luz por WhatsApp y te preparamos una cotización sin costo.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={wa('Hola, les envío mi boleta de luz para que me coticen un sistema solar')} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-orange-600 shadow-lg transition hover:-translate-y-0.5">
              <FileText className="h-5 w-5" /> Enviar mi boleta
            </a>
            <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition hover:bg-white/10">
              <Phone className="h-5 w-5" /> Llamar
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:px-8 lg:grid-cols-3">
          <ScrollReveal as="fade-up" className="space-y-4 lg:col-span-1">
            <h2 className={`${display.className} text-4xl font-extrabold text-[#0A2A4A]`}>Contáctanos</h2>
            <p className="text-slate-600">Un especialista en energía solar te responderá a la brevedad.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:ring-emerald-400">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><MessageCircle className="h-5 w-5" /></span>
              <span><span className="block text-xs text-slate-500">WhatsApp</span><span className="font-semibold text-[#0A2A4A]">{PHONE_DISPLAY}</span></span>
            </a>
            <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:ring-orange-400">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Phone className="h-5 w-5" /></span>
              <span><span className="block text-xs text-slate-500">Teléfono</span><span className="font-semibold text-[#0A2A4A]">{PHONE_DISPLAY}</span></span>
            </a>
            <div className="flex gap-3 pt-2">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0A2A4A] ring-1 ring-slate-200 hover:text-orange-600"><Facebook className="h-5 w-5" /></a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0A2A4A] ring-1 ring-slate-200 hover:text-orange-600"><Instagram className="h-5 w-5" /></a>
            </div>
          </ScrollReveal>
          <ScrollReveal as="fade-up" delay={100} className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10 lg:col-span-2">
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>


      {/* Barra fija inferior (móvil) */}
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <a href={`tel:${PHONE_TEL}`} className="flex items-center justify-center gap-2 rounded-xl bg-[#0A2A4A] py-3 text-sm font-semibold text-white">
          <Phone className="h-4 w-4" /> Llamar
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </div>
  )
}