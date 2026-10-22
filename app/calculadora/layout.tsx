import type { ReactNode } from 'react'
import { metaPagina } from '@/lib/seo'

export const metadata = metaPagina({
  titulo: 'Calculadora solar: cuántos paneles necesitas',
  descripcion:
    'Busca tu dirección, dibuja tu techo en el mapa y calcula cuántos paneles solares caben, cuánta energía producen y cuánto ahorras en tu cuenta de luz.',
  ruta: '/calculadora',
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
