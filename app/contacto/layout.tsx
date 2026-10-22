import type { ReactNode } from 'react'
import { metaPagina } from '@/lib/seo'

export const metadata = metaPagina({
  titulo: 'Contacto y cotización de paneles solares',
  descripcion:
    'Cotiza tu sistema solar sin costo. Escríbenos por WhatsApp al +56 9 8831 7681 o visítanos en Av. Santa Rosa 8065, San Ramón, Santiago.',
  ruta: '/contacto',
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
