import type { ReactNode } from 'react'
import { metaPagina } from '@/lib/seo'

export const metadata = metaPagina({
  titulo: 'Quiénes somos',
  descripcion:
    'Empresa chilena de energía solar: diseñamos e instalamos sistemas fotovoltaicos para residencias, comercios e industrias, con equipos de marcas líderes.',
  ruta: '/acerca',
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
