'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  ShoppingCart, 
  Wrench, 
  Settings2, 
  Lightbulb, 
  MessageSquare,
  CheckCircle2
} from 'lucide-react'

// Configuraciones de animación
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

export default function ServiciosPage() {
  const servicios = [
    {
      num: "01",
      icon: <ShoppingCart size={24} className="md:w-7 md:h-7" />,
      title: "Venta de Paneles Solares",
      desc: "En R&S Soluciones Solares, disponemos de una variedad de paneles solares eficientes, diseñados para maximizar la captación de energía. Nuestros productos son ideales para viviendas y empresas, garantizando durabilidad y rendimiento óptimo en condiciones diversas.",
      img: "https://dceupbfonovchzinruai.supabase.co/storage/v1/object/public/imagenes-pagina/ChatGPT%20Image%207%20sept%202026,%2010_49_27%20p.webp",
      bullets: ["Equipos Tier 1", "Máxima eficiencia", "Garantía de fábrica"]
    },
    {
      num: "02",
      icon: <Wrench size={24} className="md:w-7 md:h-7" />,
      title: "Instalación Profesional",
      desc: "Nuestro equipo de expertos realiza instalaciones de sistemas solares con precisión y seguridad. Garantizamos que cada proyecto cumple con los estándares más exigentes, proporcionando tranquilidad y confianza a nuestros clientes para el uso de energías limpias en su día a día.",
      img: "https://dceupbfonovchzinruai.supabase.co/storage/v1/object/public/imagenes-pagina/ChatGPT%20Image%207%20sept%202026,%2011_11_51%20p.webp",
      bullets: ["Técnicos certificados", "Estructuras sismo-resistentes", "Normativa SEC"]
    },
    {
      num: "03",
      icon: <Settings2 size={24} className="md:w-7 md:h-7" />,
      title: "Soporte y Mantenimiento",
      desc: "Ofrecemos un servicio de soporte y mantenimiento integral para los sistemas solares instalados. Nuestro equipo está disponible para resolver problemas y realizar chequeos periódicos, asegurando que su inversión siga funcionando de manera eficiente y prolongue su vida útil.",
      img: "https://dceupbfonovchzinruai.supabase.co/storage/v1/object/public/imagenes-pagina/ChatGPT%20Image%208%20sept%202026,%2012_15_59%20a.webp",
      bullets: ["Limpieza especializada", "Monitoreo remoto", "Asistencia rápida"]
    },
    {
      num: "04",
      icon: <Lightbulb size={24} className="md:w-7 md:h-7" />,
      title: "Consulta Energética",
      desc: "Brindamos asesorías personalizadas para evaluar sus necesidades energéticas. Nuestro objetivo es ofrecer soluciones a medida, analizando el consumo y potencial de ahorro, ayudando a nuestros clientes a tomar decisiones informadas sobre la transición hacia energías renovables.",
      img: "https://dceupbfonovchzinruai.supabase.co/storage/v1/object/public/imagenes-pagina/ChatGPT%20Image%208%20sept%202026,%2012_18_44%20a.webp",
      bullets: ["Estudios de factibilidad", "Proyección de ahorro", "Proyectos a medida"]
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* HERO SECTION DE SERVICIOS */}
      <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-center pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://dceupbfonovchzinruai.supabase.co/storage/v1/object/public/imagenes-pagina/ChatGPT%20Image%207%20sept%202026,%2010_36_30%20p.webp" 
            alt="Detalle de instalación de paneles solares"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/95 via-[#0F172A]/85 md:via-[#0F172A]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 md:from-[#0F172A]/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 w-full">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl text-white">
            <motion.div variants={fadeUp} className="inline-block border border-orange-500/50 bg-orange-500/10 rounded-full px-4 py-1.5 mb-5 md:mb-6 backdrop-blur-sm">
              <span className="text-orange-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                Soluciones sustentables
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-[1.15] md:leading-[1.1] tracking-tight">
              Expertos en <span className="text-orange-500">Energías Solares</span> para Todos
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-base md:text-lg text-slate-300 mb-8 md:mb-10 leading-relaxed font-light">
              Desde la selección del equipo ideal hasta la instalación y el mantenimiento. Ofrecemos un ciclo completo para asegurar que tu transición a la energía solar sea un éxito rotundo.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* SERVICIOS - ESTILO EDITORIAL ALTERNADO */}
      <section className="relative py-16 md:py-32 px-5 md:px-8 z-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-16 md:gap-32">
          {servicios.map((servicio, index) => (
            <motion.div 
              key={index}
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-100px" }} 
              variants={staggerContainer}
              className={`flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Mitad Imagen */}
              <motion.div variants={fadeUp} className="w-full lg:w-1/2 relative">
                <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl group border border-slate-200">
                  <Image 
                    src={servicio.img} 
                    alt={servicio.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Ícono flotante sobre la foto */}
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 w-12 h-12 md:w-14 md:h-14 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center text-orange-600 shadow-xl border border-white/50">
                    {servicio.icon}
                  </div>
                </div>
              </motion.div>

              {/* Mitad Texto */}
              <motion.div variants={fadeUp} className="w-full lg:w-1/2 relative px-2 lg:px-0">
                {/* Marca de agua del número gigante detrás del texto */}
                <div className="absolute -top-8 right-0 lg:-top-10 lg:right-10 text-[100px] md:text-[150px] lg:text-[200px] font-black text-slate-100 leading-none pointer-events-none -z-10 select-none">
                  {servicio.num}
                </div>
                
                <div className="relative z-10 pt-4 md:pt-0">
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <span className="text-orange-500 font-black text-lg md:text-xl">{servicio.num}.</span>
                    <div className="h-[2px] w-10 md:w-12 bg-orange-500"></div>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#0F172A] mb-4 md:mb-6 leading-tight">
                    {servicio.title}
                  </h2>
                  
                  <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                    {servicio.desc}
                  </p>

                  {/* Viñetas decorativas (Bullets) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
                    {servicio.bullets.map((bullet, i) => (
                      <div key={i} className="flex items-center gap-2.5 md:gap-3">
                        <CheckCircle2 className="text-orange-500 flex-shrink-0 w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-[#0F172A] font-bold text-xs md:text-sm">{bullet}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/contacto" className="inline-flex items-center gap-2 text-[#0F172A] font-bold text-sm md:text-base hover:text-orange-600 transition-colors group">
                    Solicitar este servicio 
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION (CTA) FINAL ULTRA PREMIUM */}
      <section className="relative bg-[#0F172A] py-16 md:py-32 px-5 md:px-8 overflow-hidden">
        {/* Foto de fondo oscuro con paneles solares para el CTA */}
        <div className="absolute inset-0 z-0 opacity-20">
          <Image 
            src="https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=1920&auto=format&fit=crop" 
            alt="Paneles solares CTA" 
            fill 
            className="object-cover" 
          />
        </div>
        
        {/* Gradientes y Glows encima de la foto */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#0F172A]/90 to-[#0F172A] z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[400px] bg-orange-600/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-10" />
        
        <div className="relative z-20 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center shadow-2xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="w-16 h-16 md:w-20 md:h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-orange-500/30 text-orange-400"
            >
              <Lightbulb size={32} className="md:w-9 md:h-9" />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 leading-tight tracking-tight"
            >
              ¿Listo para dar el paso hacia la <span className="text-orange-400">independencia energética?</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }}
              className="text-slate-300 text-base md:text-lg lg:text-xl mb-8 md:mb-12 max-w-2xl mx-auto font-light"
            >
              Ya sea que necesites equipos, instalación o simplemente asesoría, nuestro equipo está listo para ayudarte a diseñar el proyecto perfecto.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center"
            >
              <Link 
                href="/contacto" 
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 md:py-4 px-8 md:px-10 rounded-full transition-all shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:shadow-[0_0_50px_rgba(234,88,12,0.5)] flex items-center justify-center gap-3 group text-base md:text-lg"
              >
                <MessageSquare size={18} className="md:w-5 md:h-5" /> Cotizar Proyecto
              </Link>
              <Link 
                href="/tienda" 
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold py-3.5 md:py-4 px-8 md:px-10 rounded-full transition-all flex items-center justify-center gap-3 backdrop-blur-md text-base md:text-lg"
              >
                Ir a la Tienda <ArrowRight size={18} className="md:w-5 md:h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
