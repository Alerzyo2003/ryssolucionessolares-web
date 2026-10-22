import type { ReactNode } from 'react'
import { NO_INDEXAR } from '@/lib/seo'

// Página privada: no debe aparecer en Google.
export const metadata = NO_INDEXAR

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
