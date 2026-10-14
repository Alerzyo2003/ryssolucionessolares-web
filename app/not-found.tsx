import Link from 'next/link'
import { Sun, ArrowRight, Home as HomeIcon, ShoppingBag, MessageCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Animaciones inline compartidas con la Home */}
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
        @media (prefers-reduced-motion: reduce) {
          .hero-anim, .float-anim, .glow-anim {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* HEADER BÁSICO / BRANDING */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-5 md:px-8 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0B2340] text-orange-500 flex items-center justify-center font-bold">
            <Sun className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-[#0B2340] tracking-tight text-lg">
            R&S Soluciones Solares
          </span>
        </Link>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-12 text-center my-auto">
        {/* Fondo decorativo con resplandor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[500px] h-[350px] md:h-[500px] rounded-full bg-orange-500/10 blur-3xl glow-anim -z-10" />

        {/* Kicker superior */}
        <div className="hero-anim inline-flex items-center gap-2.5 mb-4 text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100" style={{ animationDelay: '0.05s' }}>
          <Sun className="w-4 h-4" strokeWidth={2} />
          <span className="text-xs md:text-sm font-semibold">Error 404 • Página no encontrada</span>
        </div>

        {/* Número gigante decorativo */}
        <div className="hero-anim relative my-2" style={{ animationDelay: '0.15s' }}>
          <h1 className="text-8xl md:text-9xl font-black text-[#0B2340]/10 select-none tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0B2340] tracking-tight">
              Parece que esta página se apago
            </h2>
          </div>
        </div>

        {/* Mensaje explicativo enfocado en el cambio de sitio */}
        <p className="hero-anim text-base md:text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed font-light" style={{ animationDelay: '0.3s' }}>
          Hemos actualizado nuestro sitio web a una plataforma más moderna. Es muy probable que la página o enlace que buscas haya cambiado de dirección.
        </p>

        {/* Botones de acción principal */}
        <div className="hero-anim flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-12" style={{ animationDelay: '0.45s' }}>
          <Link
            href="/"
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white px-6 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md shadow-orange-950/20 flex items-center justify-center gap-2 group"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Volver al inicio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/tienda"
            className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-100 text-[#0F172A] px-6 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-orange-600" />
            <span>Ver Catálogo de Productos</span>
          </Link>
        </div>

        {/* Tarjeta flotante con accesos rápidos */}
        <div className="hero-anim bg-white rounded-2xl border border-slate-200 shadow-lg p-6 max-w-xl mx-auto text-left" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Enlaces útiles recomendados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link 
              href="/#servicios" 
              className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50/60 border border-slate-100 hover:border-orange-200 transition-all text-sm font-semibold text-[#0F172A] flex items-center justify-between group"
            >
              <span>Nuestros Servicios</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link 
              href="/#acerca" 
              className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50/60 border border-slate-100 hover:border-orange-200 transition-all text-sm font-semibold text-[#0F172A] flex items-center justify-between group"
            >
              <span>Sobre Nosotros</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER BÁSICO */}
      <footer className="relative z-10 py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <p>Copyright {new Date().getFullYear()} © R&S Soluciones Solares. Todos los derechos reservados.</p>
      </footer>

      {/* Botón flotante de WhatsApp (mismo que en la Home) */}
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
    </div>
  )
}