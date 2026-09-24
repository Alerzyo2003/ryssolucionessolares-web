import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import ContactForm from '@/components/ContactForm'
import BrandCarousel from '@/components/BrandCarousel'
import BrandsAndFeatures from '@/components/BrandsAndFeatures'
import ScrollReveal from '@/components/ScrollReveal'
import AnimatedCounter from '@/components/AnimatedCounter'
import {
  Leaf,
  TrendingUp,
  Home as HomeIcon,
  ShieldCheck,
  Globe2,
  Star,
  Tag,
  Lock,
  MessageCircle,
  ArrowRight,
  Sun,
  ClipboardCheck,
  Wrench,
  Gauge,
  Award,
  BadgeCheck,
  Zap,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category?: string
}

function SectionKicker({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 mb-3 ${dark ? 'text-orange-400' : 'text-orange-600'}`}>
      <Sun className="w-4 h-4" strokeWidth={2} />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}

export default async function HomePage() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <style>{`
        @keyframes heroEnter {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes softFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.06); }
        }
        @keyframes ctaRing {
          0% { transform: scale(1); opacity: 0.45; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .hero-anim {
          opacity: 0;
          animation: heroEnter 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .float-anim {
          animation: softFloat 5s ease-in-out infinite;
        }
        .glow-anim {
          animation: glowPulse 4.5s ease-in-out infinite;
        }
        .cta-ring {
          animation: ctaRing 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-anim, .float-anim, .glow-anim, .cta-ring {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

     {/* HERO SECTION */}
      <section className="relative bg-slate-100 text-slate-900 overflow-hidden pt-10 pb-16 md:pt-6 md:pb-14">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://dceupbfonovchzinruai.supabase.co/storage/v1/object/public/imagenes-pagina/ChatGPT%20Image%207%20sept%202026,%2012_08_39.webp" 
            alt="Panel solar background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2340] via-[#0B2340]/90 md:via-[#0B2340]/85 to-[#0B2340]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B2340] via-transparent to-transparent opacity-70 md:opacity-60" />
          <div className="absolute -top-24 -right-24 w-[350px] h-[350px] rounded-full bg-orange-500/20 blur-3xl glow-anim" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-8">
            <div className="hero-anim flex items-center gap-2.5 mb-4 text-orange-400" style={{ animationDelay: '0.05s' }}>
              <span className="w-6 h-px bg-current" />
              <span className="text-xs font-semibold tracking-wide">Energía solar para un futuro mejor</span>
            </div>

            <h1 className="hero-anim text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4 text-white max-w-2xl" style={{ animationDelay: '0.15s' }}>
              Soluciones solares integrales para hogares y empresas
            </h1>

            <p className="hero-anim text-base md:text-lg text-slate-300 mb-8 leading-relaxed max-w-lg font-light" style={{ animationDelay: '0.3s' }}>
              Transformamos la luz del sol en energía que impulsa tu vida, con los más altos estándares de ingeniería y autonomía.
            </p>

            <div className="hero-anim flex flex-col sm:flex-row gap-4" style={{ animationDelay: '0.45s' }}>
              <a 
                href="#tienda"
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white px-6 py-3.5 md:py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md shadow-orange-950/40 flex items-center justify-center gap-2 group text-center"
              >
                <span>Cotiza tus productos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#servicios"
                className="w-full sm:w-auto border border-white/30 hover:bg-white/10 active:scale-[0.98] text-white px-6 py-3.5 md:py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-center"
              >
                <span>Conoce nuestros servicios</span>
              </a>
            </div>
          </div>

          {/* Right Floating Card */}
          <div className="hidden lg:flex lg:col-span-4 justify-end">
            <div
              className="hero-anim float-anim bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl w-60 border-l-4 border-orange-500"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                <Leaf className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-[#0F172A] text-sm leading-snug">
                Energía limpia hoy, un mejor mañana
              </h4>
            </div>
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 mt-4">
          <div className="hero-anim bg-white rounded-2xl shadow-xl p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100" style={{ animationDelay: '0.75s' }}>
            <div className="flex items-center gap-4 pt-0 sm:pt-0">
              <div className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                <Leaf className="w-5 h-5 md:w-4 md:h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-[#0F172A] text-sm md:text-xs">Energía limpia</h4>
                <p className="text-xs md:text-[11px] text-slate-500">Cuida el planeta</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-5">
              <div className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                <TrendingUp className="w-5 h-5 md:w-4 md:h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-[#0F172A] text-sm md:text-xs">Ahorro real</h4>
                <p className="text-xs md:text-[11px] text-slate-500">Reduce tus costos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 sm:pt-4 lg:pt-0 lg:pl-5">
              <div className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                <HomeIcon className="w-5 h-5 md:w-4 md:h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-[#0F172A] text-sm md:text-xs">Soluciones a medida</h4>
                <p className="text-xs md:text-[11px] text-slate-500">Hogares y empresas</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 sm:pt-4 lg:pt-0 sm:pl-5">
              <div className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 md:w-4 md:h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-[#0F172A] text-sm md:text-xs">Asesoría experta</h4>
                <p className="text-xs md:text-[11px] text-slate-500">En todo el proceso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating WhatsApp Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
          <a 
            href="https://whatsapp.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-6 h-6 fill-white" />
          </a>
        </div>
      </section>

      {/* BRAND CAROUSEL */}
      <section className="bg-white py-10 md:py-14 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="text-center text-sm text-slate-500 mb-6 md:mb-8">
            Trabajamos con las mejores marcas del mercado
          </p>
          <BrandCarousel />
        </div>
      </section>

      {/* ACERCA DE SECTION */}
      <section id="acerca" className="py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">
          <ScrollReveal as="slide-right">
            <SectionKicker label="Sobre R&S Soluciones Solares" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-6 leading-tight max-w-lg">
              Impulsando la transición energética en Chile con ingeniería de vanguardia
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8 max-w-lg">
              Somos una empresa especializada en el diseño, suministro e instalación de sistemas fotovoltaicos avanzados. Nuestro propósito es otorgar independencia energética y reducción drástica de costos operativos a residencias, comercios e industrias.
            </p>
            <div className="flex flex-row gap-6 sm:gap-10 pt-6 border-t border-slate-200">
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-orange-600 mb-1">
                  <AnimatedCounter value={500} prefix="+" />
                </div>
                <div className="text-xs md:text-sm text-slate-500">Proyectos instalados</div>
              </div>
              <div className="pl-6 sm:pl-10 border-l border-slate-200">
                <div className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-1">
                  <AnimatedCounter value={25} suffix=" años" />
                </div>
                <div className="text-xs md:text-sm text-slate-500">Garantía en paneles</div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal as="scale" delay={150}>
            <div className="relative h-[250px] sm:h-[350px] md:h-96 rounded-2xl overflow-hidden shadow-lg bg-slate-100">
              <Image 
                src="https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=800&auto=format&fit=crop" 
                alt="Instalación solar" 
                fill
                className="object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <ScrollReveal className="max-w-2xl mb-12 md:mb-16">
            <SectionKicker label="Cómo funciona" />
            <h2 className="text-3xl font-extrabold text-[#0F172A] mb-3">De la cotización a tu factura más baja</h2>
            <p className="text-slate-600">Un proceso simple y acompañado en cada etapa, sin sorpresas.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-7 left-[16.5%] right-[16.5%] h-px bg-slate-300" />

            <ScrollReveal as="scale" delay={0}>
              <div className="relative bg-white rounded-2xl border border-slate-200 p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-orange-200">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-base md:text-lg mb-5 md:mb-6 relative z-10">01</div>
                <ClipboardCheck className="w-6 h-6 text-orange-600 mb-4" strokeWidth={1.75} />
                <h3 className="font-bold text-lg text-[#0F172A] mb-2">Diagnóstico y cotización</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Evaluamos tu consumo y techo para diseñar el sistema que mejor se ajusta a tu presupuesto.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal as="scale" delay={120}>
              <div className="relative bg-white rounded-2xl border border-slate-200 p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-orange-200">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-base md:text-lg mb-5 md:mb-6 relative z-10">02</div>
                <Wrench className="w-6 h-6 text-orange-600 mb-4" strokeWidth={1.75} />
                <h3 className="font-bold text-lg text-[#0F172A] mb-2">Instalación certificada</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Nuestro equipo técnico instala y conecta tu sistema cumpliendo toda la normativa vigente.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal as="scale" delay={240}>
              <div className="relative bg-white rounded-2xl border border-slate-200 p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-orange-200">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-base md:text-lg mb-5 md:mb-6 relative z-10">03</div>
                <Gauge className="w-6 h-6 text-orange-600 mb-4" strokeWidth={1.75} />
                <h3 className="font-bold text-lg text-[#0F172A] mb-2">Monitoreo y ahorro</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Sigue tu generación en tiempo real y observa la reducción en tu cuenta de luz mes a mes.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="tienda" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <ScrollReveal className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12">
          <div>
            <SectionKicker label="Nuestros productos" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Todo lo que necesitas para aprovechar el sol
            </h2>
          </div>
          <Link href="/tienda" className="text-sm font-semibold text-[#0F172A] hover:text-orange-600 transition-colors mt-4 md:mt-0 flex items-center gap-2 group border border-slate-200 md:border-transparent px-4 py-2 md:px-0 md:py-0 rounded-lg w-full justify-center md:w-auto">
            Ver otros productos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products && products.length > 0 ? (
            products.map((product: Product, index: number) => (
              <ScrollReveal key={product.id} as="fade-up" delay={(index % 4) * 90}>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full">
                  <div>
                    <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                      <Image 
                        src={product.image_url || 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=600&auto=format&fit=crop'} 
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0F172A] text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
                        {product.category || 'Equipo Solar'}
                      </div>
                    </div>

                    <div className="p-5">
                      <Link href={`/products/${product.id}`} className="block group">
                        <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 pt-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block">IVA incluido</span>
                      <span className="text-xl md:text-lg font-extrabold text-[#0F172A]">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                      </span>
                    </div>
                    <AddToCartButton product={product} />
                  </div>
                </div>
              </ScrollReveal>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500 font-medium">No hay productos publicados todavía.</p>
              <Link href="/login" className="inline-block mt-4 text-orange-600 font-semibold hover:underline">
                Accede como administrador para crear productos →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* SERVICES & VALUE PROPOSITION */}
      <section id="servicios" className="bg-white py-16 md:py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <ScrollReveal className="max-w-2xl mb-12 md:mb-16">
            <SectionKicker label="Por qué elegirnos" />
            <h2 className="text-3xl font-extrabold text-[#0F172A] mb-3">Excelencia en ingeniería solar</h2>
            <p className="text-slate-600">Garantizamos proyectos de alta durabilidad respaldados por los mejores fabricantes globales.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <ScrollReveal delay={0}>
              <div className="p-6 md:p-8 bg-white h-full transition-colors duration-300 hover:bg-orange-50/40">
                <Globe2 className="w-7 h-7 md:w-6 md:h-6 text-orange-600 mb-4 md:mb-5" strokeWidth={1.75} />
                <h3 className="font-bold text-base text-[#0F172A] mb-2">Marcas mundiales</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Trabajamos con las principales marcas del mundo en inversores y paneles.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={90}>
              <div className="p-6 md:p-8 bg-white h-full transition-colors duration-300 hover:bg-orange-50/40">
                <Star className="w-7 h-7 md:w-6 md:h-6 text-orange-600 mb-4 md:mb-5" strokeWidth={1.75} />
                <h3 className="font-bold text-base text-[#0F172A] mb-2">Calidad garantizada</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Todos nuestros equipos cuentan con certificación internacional y garantía de hasta 25 años.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={180}>
              <div className="p-6 md:p-8 bg-white h-full transition-colors duration-300 hover:bg-orange-50/40">
                <Tag className="w-7 h-7 md:w-6 md:h-6 text-orange-600 mb-4 md:mb-5" strokeWidth={1.75} />
                <h3 className="font-bold text-base text-[#0F172A] mb-2">Ofertas y retorno</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Optimiza tu inversión con kits diseñados para el máximo retorno financiero.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={270}>
              <div className="p-6 md:p-8 bg-white h-full transition-colors duration-300 hover:bg-orange-50/40">
                <Lock className="w-7 h-7 md:w-6 md:h-6 text-orange-600 mb-4 md:mb-5" strokeWidth={1.75} />
                <h3 className="font-bold text-base text-[#0F172A] mb-2">Seguridad y soporte</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Métodos de pago confiables y soporte técnico especializado post-venta.</p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-x-6 gap-y-4 md:gap-x-12 md:gap-y-6 mt-12 md:mt-14 pt-10 md:pt-14 border-t border-slate-200">
            <div className="flex items-center gap-2.5 text-slate-500">
              <Award className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
              <span className="text-sm font-medium">Certificación SEC</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <BadgeCheck className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
              <span className="text-sm font-medium">Instaladores autorizados</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <Zap className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
              <span className="text-sm font-medium">Conexión a la red eléctrica</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <ShieldCheck className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
              <span className="text-sm font-medium">Garantía extendida</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* TESTIMONIALS & SOCIALS */}
      <section className="bg-[#0B2340] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <ScrollReveal className="max-w-2xl mb-12 md:mb-16">
            <SectionKicker label="Testimonios reales" dark />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Lo que dicen nuestros clientes en Facebook</h2>
            <p className="text-slate-400 text-sm">Comentarios y experiencias extraídas directamente de nuestra comunidad.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
            <ScrollReveal as="slide-right">
              <blockquote className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 flex flex-col justify-between h-full transition-colors duration-300 hover:bg-white/[0.08]">
                <p className="text-slate-200 text-base mb-6 md:mb-8 leading-relaxed">
                  &ldquo;Excelente atención y servicio de instalación. Totalmente recomendado para quienes buscan reducir sus costos de energía de forma segura y profesional.&rdquo;
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <h4 className="font-semibold text-white text-sm">María Elena Soto</h4>
                    <p className="text-xs text-orange-400">Opinión verificada</p>
                  </div>
                  <span className="text-blue-300 text-[10px] md:text-xs font-medium bg-blue-500/10 px-2.5 md:px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </span>
                </div>
              </blockquote>
            </ScrollReveal>

            <ScrollReveal as="slide-left">
              <blockquote className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 flex flex-col justify-between h-full transition-colors duration-300 hover:bg-white/[0.08]">
                <p className="text-slate-200 text-base mb-6 md:mb-8 leading-relaxed">
                  &ldquo;Muy buena asesoría desde el primer contacto. El kit solar funciona a la perfección y el equipo técnico resolvió todas nuestras dudas paso a paso.&rdquo;
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <h4 className="font-semibold text-white text-sm">Carlos Morales</h4>
                    <p className="text-xs text-orange-400">Opinión verificada</p>
                  </div>
                  <span className="text-blue-300 text-[10px] md:text-xs font-medium bg-blue-500/10 px-2.5 md:px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </span>
                </div>
              </blockquote>
            </ScrollReveal>
          </div>

          <ScrollReveal as="scale">
            <div className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 text-center max-w-xl mx-auto">
              <h3 className="text-lg font-bold mb-2">Síguenos en redes sociales</h3>
              <p className="text-slate-400 text-sm mb-6">Conoce más opiniones y proyectos ejecutados en nuestras plataformas oficiales.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto justify-center bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white px-6 py-3.5 md:py-3 rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 text-white px-6 py-3.5 md:py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative bg-orange-600 py-16 overflow-hidden">
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/10 float-anim" style={{ animationDuration: '7s' }} />
        <div className="absolute -top-10 right-10 w-40 h-40 rounded-full bg-white/10 float-anim" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <ScrollReveal as="scale" className="relative max-w-4xl mx-auto px-5 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
            ¿Listo para reducir tu cuenta de luz?
          </h2>
          <p className="text-orange-50 mb-8 max-w-xl mx-auto text-sm md:text-base">
            Solicita una cotización sin costo y te asesoramos según tu consumo, tu techo y tu presupuesto.
          </p>
          <a
            href="#contacto"
            className="relative flex sm:inline-flex items-center justify-center gap-2.5 bg-white text-orange-600 px-8 py-4 rounded-lg font-bold hover:bg-orange-50 hover:-translate-y-0.5 transition-all duration-200 group w-full sm:w-auto"
          >
            <span className="absolute inset-0 rounded-lg bg-white cta-ring" />
            <span className="relative">Solicitar cotización gratis</span>
            <ArrowRight className="relative w-5 h-5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </ScrollReveal>
      </section>

      {/* CONTACT SECTION */}
      <section id="contacto" className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <ScrollReveal as="fade-up" className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-center mb-8 md:mb-10">
              <div className="flex items-center justify-center gap-2.5 mb-3 text-orange-600">
                <Sun className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-semibold">Ponte en contacto</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#0F172A]">Contáctanos</h2>
              <p className="text-slate-600 mt-2 text-sm md:text-base">Completa el formulario y un especialista en energía solar te responderá a la brevedad.</p>
            </div>

            <ContactForm />
          </ScrollReveal>
        </div>
      </section>

    </div>
  )
}
