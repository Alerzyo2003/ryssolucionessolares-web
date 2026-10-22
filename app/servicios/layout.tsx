import type { ReactNode } from 'react'
import { metaPagina } from '@/lib/seo'

// Título y descripción que muestra Google para esta página.
export const metadata = metaPagina({
  titulo: 'Venta e instalación de paneles solares',
  descripcion:
    'Venta de paneles solares, instalación profesional, mantención y asesoría energética. Sistemas on-grid, híbridos y con baterías en Santiago. Evaluación gratis.',
  ruta: '/servicios',
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
