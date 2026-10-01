import Link from 'next/link'
import { Sun, Home, ArrowLeft, Search, PhoneCall } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Elementos decorativos de fondo acordes al diseño solar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-[#0B2340]/10 blur-2xl pointer-events-none" />

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-20 my-auto text-center">
        {/* Kicker estilo R&S */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-orange-100/80 text-orange-600 text-sm font-semibold mb-6">
          <Sun className="w-4 h-4" strokeWidth={2} />
          <span>Error 404 — Página no encontrada</span>
        </div>

        {/* Número 404 estilizado */}
        <h1 className="text-7xl md:text-9xl font-extrabold text-[#0F172A] tracking-tight mb-4">
          4<span className="text-orange-600">0</span>4
        </h1>

        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-4">
          Esta ruta no produce energía
        </h2>

        <p className="text-slate-600 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          La página que estás buscando ya no existe, cambió de dirección o fue retirada en la actualización de nuestra plataforma.
        </p>

        {/* Botones de acción principal */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/"
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white px-7 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md shadow-orange-950/20 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>

          <Link
            href="/tienda"
            className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-100 active:scale-[0.98] text-[#0F172A] px-7 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-orange-600" />
            <span>Ver catálogo de productos</span>
          </Link>
        </div>

        {/* Tarjetas de ayuda / accesos directos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto pt-8 border-t border-slate-200">
          <Link 
            href="/servicios" 
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group flex items-start gap-3.5"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </div>
            <div>
              <h4 className="font-semibold text-[#0F172A] text-sm group-hover:text-orange-600 transition-colors">
                Nuestros Servicios
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Diseño e instalación de sistemas fotovoltaicos.
              </p>
            </div>
          </Link>

          <a 
            href="https://wa.me/56991363439" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 group flex items-start gap-3.5"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-[#0F172A] text-sm group-hover:text-emerald-600 transition-colors">
                ¿Necesitas soporte?
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Contáctanos directamente por WhatsApp para asistirte.
              </p>
            </div>
          </a>
        </div>
      </main>

      {/* Footer simplificado */}
      <footer className="relative z-10 text-center py-6 border-t border-slate-200 text-xs text-slate-400 bg-white">
        © {new Date().getFullYear()} R&S Soluciones Solares. Todos los derechos reservados.
      </footer>
    </div>
  )
}
