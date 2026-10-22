import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

/**
 * Título, descripción, URL canónica y vista previa al compartir de una página.
 * - `titulo` va SIN " | R&S Soluciones Solares": la plantilla del layout raíz lo agrega.
 * - `descripcion` ojalá bajo 160 caracteres (Google corta lo que sigue).
 * - `ruta` es la dirección de la página, por ejemplo '/servicios'.
 */
export function metaPagina({
  titulo,
  descripcion,
  ruta,
  imagen = SITE.imagen,
}: {
  titulo: string
  descripcion: string
  ruta: string
  imagen?: string
}): Metadata {
  return {
    title: titulo,
    description: descripcion,
    // Cada página declara su propia URL canónica; si no, hereda la del inicio.
    alternates: { canonical: ruta },
    openGraph: {
      type: 'website',
      locale: 'es_CL',
      siteName: SITE.nombre,
      title: `${titulo} | ${SITE.nombre}`,
      description: descripcion,
      url: ruta,
      images: [{ url: imagen }],
    },
  }
}

/** Para páginas que no deben aparecer en Google (carrito, login, pagos, admin). */
export const NO_INDEXAR: Metadata = { robots: { index: false, follow: false } }
