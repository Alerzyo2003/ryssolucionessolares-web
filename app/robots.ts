import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

// Le dice a Google qué puede revisar y dónde está el sitemap.
// Se bloquean el panel de administración, la API, el carrito, el login y las páginas de pago.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api/',
        '/cart',
        '/login',
        '/iniciar-sesion',
        '/pago-realizado',
        '/pago-rechazado',
        '/pago-anulado',
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
