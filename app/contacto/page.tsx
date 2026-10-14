'use client'

import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { Phone, MapPin, Send } from 'lucide-react'

// Número de WhatsApp (formato internacional, solo dígitos)
const WHATSAPP_NUMBER = '56988317681'

// Íconos SVG personalizados
const IconFacebook = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const IconInstagram = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const IconWhatsApp = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41"/>
  </svg>
)

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

const inputClass = "w-full px-4 md:px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none text-sm md:text-base text-slate-700"

export default function ContactoPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const get = (k: string) => String(data.get(k) ?? '').trim()

    const lineas = [
      '¡Hola! Quisiera hacer una consulta:',
      '',
      `*Nombre:* ${get('Nombre')}`,
      `*Región:* ${get('Region')}`,
      `*Motivo:* ${get('Motivo')}`,
    ]
    const mensaje = get('Mensaje')
    if (mensaje) lineas.push(`*Mensaje:* ${mensaje}`)

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lineas.join('\n'))}`
    window.open(url, '_blank', 'noopener,noreferrer')
    e.currentTarget.reset()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">

      <section className="relative w-full min-h-[50vh] flex items-center pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://dceupbfonovchzinruai.supabase.co/storage/v1/object/public/imagenes-pagina/ChatGPT%20Image%208%20sept%202026,%2012_36_54%20a.webp"
            alt="Atención al cliente"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/95 via-[#0F172A]/85 md:via-[#0F172A]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 md:from-[#0F172A]/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 w-full">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl text-white">
            <motion.div variants={fadeUp} className="inline-block border border-orange-500/50 bg-orange-500/10 rounded-full px-4 py-1.5 mb-5 md:mb-6 backdrop-blur-sm">
              <span className="text-orange-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                Contáctanos
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-[1.15] md:leading-[1.1] tracking-tight">
              Estamos aquí para <span className="text-orange-500">ayudarte</span> con tus dudas
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base md:text-lg text-slate-300 mb-8 md:mb-10 leading-relaxed font-light">
              Nuestro equipo de ingenieros y especialistas está listo para asesorarte. Hablemos sobre tu próximo proyecto solar y cómo podemos optimizar tu consumo.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="relative py-12 md:py-20 px-5 md:px-8 z-20 -mt-8 md:-mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="lg:col-span-5 flex flex-col gap-6 md:gap-8"
          >
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-slate-100">
              <motion.h2 variants={fadeUp} className="text-xl md:text-2xl font-black text-[#0F172A] mb-2">Conéctate con nosotros</motion.h2>
              <motion.p variants={fadeUp} className="text-sm md:text-base text-slate-500 mb-6 md:mb-8 font-medium">Tu voz es importante.</motion.p>

              <div className="space-y-6 md:space-y-8">
                <motion.div variants={fadeUp} className="flex items-start gap-4 md:gap-5 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-sm border border-orange-100">
                    <Phone size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Teléfono</h4>
                    <a href={`tel:+${WHATSAPP_NUMBER}`} className="text-base md:text-lg font-black text-[#0F172A]">+56 9 8831 7681</a>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex items-start gap-4 md:gap-5 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-green-100">
                    <IconWhatsApp size={22} />
                  </div>
                  <div>
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp</h4>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm md:text-base font-bold text-[#0F172A] hover:text-green-600 transition-colors"
                    >
                      Escríbenos directamente
                    </a>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex items-start gap-4 md:gap-5 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-sm border border-orange-100">
                    <MapPin size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dirección</h4>
                    <p className="text-sm md:text-base font-bold text-[#0F172A] leading-tight">
                      Santa Rosa 8065<br/>Local 2-3<br/>San Ramón, Santiago
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-100">
                <h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Redes Sociales</h4>
                <div className="flex gap-3 md:gap-4">
                  {[
                    { icon: <IconInstagram size={20} />, link: "#" },
                    { icon: <IconFacebook size={20} />, link: "#" }
                  ].map((social, idx) => (
                    <a key={idx} href={social.link} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-[#0F172A] hover:text-white transition-colors duration-300 border border-slate-200">
                      {social.icon}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-10 lg:p-14 shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-orange-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/4 pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-2">Escríbenos por WhatsApp</h3>
                <p className="text-sm md:text-base text-slate-500 mb-8 md:mb-10">Completa los datos y te abriremos WhatsApp con tu mensaje listo para enviar.</p>

                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-xs md:text-sm font-bold text-slate-700">Nombre completo</label>
                      <input type="text" name="Nombre" required placeholder="Ej. Juan Pérez" className={inputClass} />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-xs md:text-sm font-bold text-slate-700">Región</label>
                      <select name="Region" required className={`${inputClass} appearance-none`}>
                        <option value="">—Elige una opción—</option>
                        <option value="Arica y Parinacota">Región de Arica y Parinacota</option>
                        <option value="Tarapacá">Región de Tarapacá</option>
                        <option value="Antofagasta">Región de Antofagasta</option>
                        <option value="Atacama">Región de Atacama</option>
                        <option value="Coquimbo">Región de Coquimbo</option>
                        <option value="Valparaíso">Región de Valparaíso</option>
                        <option value="Metropolitana">Región Metropolitana</option>
                        <option value="O’Higgins">Región de O’Higgins</option>
                        <option value="Maule">Región del Maule</option>
                        <option value="Ñuble">Región del Ñuble</option>
                        <option value="Biobío">Región del Biobío</option>
                        <option value="La Araucanía">Región de La Araucanía</option>
                        <option value="Los Ríos">Región de Los Ríos</option>
                        <option value="Los Lagos">Región de Los Lagos</option>
                        <option value="Aysén">Región de Aysén</option>
                        <option value="Magallanes">Región de Magallanes</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs md:text-sm font-bold text-slate-700">Motivo de contacto</label>
                    <input type="text" name="Motivo" required placeholder="Ej. Cotización de paneles para empresa" className={inputClass} />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs md:text-sm font-bold text-slate-700">Mensaje (Opcional)</label>
                    <textarea name="Mensaje" rows={4} placeholder="Cuéntanos un poco más sobre tu proyecto..." className={`${inputClass} resize-none`}></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold py-4 rounded-xl md:rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    <IconWhatsApp size={20} />
                    Enviar por WhatsApp
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>

                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
