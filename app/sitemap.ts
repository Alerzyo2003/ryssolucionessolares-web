import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { SITE } from '@/lib/site'

// Se vuelve a generar cada 12 horas para incluir productos nuevos de la tienda.
export const revalidate = 43200

const PAGINAS: { ruta: string; prioridad: number; frecuencia: 'weekly' | 'monthly' }[] = [
  { ruta: '/', prioridad: 1, frecuencia: 'weekly' },
  { ruta: '/servicios', prioridad: 0.9, frecuencia: 'monthly' },
  { ruta: '/tienda', prioridad: 0.9, frecuencia: 'weekly' },
  { ruta: '/calculadora', prioridad: 0.8, frecuencia: 'monthly' },
  { ruta: '/proyectos', prioridad: 0.8, frecuencia: 'weekly' },
  { ruta: '/politica-de-devoluciones', prioridad: 0.3, frecuencia: 'monthly' },
  { ruta: '/acerca', prioridad: 0.6, frecuencia: 'monthly' },
  { ruta: '/contacto', prioridad: 0.7, frecuencia: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginas: MetadataRoute.Sitemap = PAGINAS.map(({ ruta, prioridad, frecuencia }) => ({
    url: `${SITE.url}${ruta === '/' ? '' : ruta}`,
    changeFrequency: frecuencia,
    priority: prioridad,
  }))

  // Fichas de productos. Si Supabase falla, el sitemap sale igual con las páginas fijas.
  let productos: MetadataRoute.Sitemap = []
  try {
    const { data, error } = await supabase.from('products').select('id, created_at')
    if (!error && data) {
      productos = data.map((p: { id: string; created_at?: string | null }) => ({
        url: `${SITE.url}/products/${p.id}`,
        ...(p.created_at ? { lastModified: p.created_at } : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch {
    // sin productos
  }

  return [...paginas, ...productos]
}
