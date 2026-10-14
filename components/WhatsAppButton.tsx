import { FaWhatsapp } from 'react-icons/fa'

const whatsappUrl = `https://wa.me/56991363439?text=${encodeURIComponent('Hola, me gustaría recibir asesoría para mi proyecto solar.')}`

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir chat de WhatsApp para recibir ayuda"
      title="Chatea con nosotros por WhatsApp"
      className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-900/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/40 sm:bottom-6 sm:right-6"
    >
      <FaWhatsapp aria-hidden="true" size={32} />
    </a>
  )
}