import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-[#0B2340] border-t border-slate-800 text-slate-200 font-sans relative overflow-hidden">
      {/* Decorative background glow matching the main page theme */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-center relative z-10">
        
        {/* Columna Izquierda: Medios de pago (solo imagen) */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
          <div className="mb-4 md:mb-5">
            <span className="h-[2px] w-10 md:w-12 bg-orange-500 inline-block mb-2 md:mb-2.5 rounded-full" />
            <h3 className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-widest block">
              Aceptamos todas las formas de pago
            </h3>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/10 shadow-lg transition-all duration-300 hover:border-orange-500/50 inline-block w-full max-w-sm md:max-w-md">
            <div className="relative w-full h-16 sm:h-20 md:h-24">
              <Image 
                src="/webpay.png" 
                alt="Webpay Plus y Formas de Pago" 
                fill
                className="object-contain object-center lg:object-left"
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Mapa de Google Maps Interactivo y Estilizado */}
        <div className="lg:col-span-7">
          <div className="mb-4 md:mb-5 flex flex-col sm:flex-row justify-between items-center lg:items-end gap-3 sm:gap-0 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start">
              <span className="h-[2px] w-10 md:w-12 bg-orange-500 inline-block mb-2 md:mb-2.5 rounded-full" />
              <h3 className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-widest">
                Estamos ubicados en
              </h3>
            </div>
            <a 
              href="https://maps.google.com/?q=Av.+Sta.+Rosa+8065,+San+Ramón,+Santiago" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-[10px] md:text-xs font-semibold text-orange-400 hover:text-white bg-white/10 border border-white/15 px-3 md:px-4 py-2 rounded-lg md:rounded-xl backdrop-blur-sm transition-all duration-200 hover:bg-orange-600 hover:border-orange-600 shadow-xs"
            >
              <span>Abrir en Google Maps</span>
              <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl h-64 sm:h-72 w-full relative bg-slate-900 group">
            <iframe
              title="Ubicación R&S Soluciones Solares"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.849331512531!2d-70.63749732446254!3d-33.533575473356706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662da633f85dfb9%3A0xdbdd1bbd7099ff4c!2sAv.%20Sta.%20Rosa%208065%2C%208860536%20Santiago%2C%20San%20Ram%C3%B3n%2C%20Regi%C3%B3n%20Metropolitana!5e1!3m2!1ses-419!2scl!4v1788798278423!5m2!1ses-419!2scl"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>

      {/* Barra inferior de Copyright */}
      <div className="bg-[#08172c] text-slate-400 py-5 px-5 md:px-8 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto flex justify-center items-center text-[10px] md:text-xs font-medium">
          <div className="text-center">
            Copyright 2026 © <span className="text-white font-semibold">R&S Soluciones Solares</span>. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}
