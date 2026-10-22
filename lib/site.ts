/* ------------------------------------------------------------------ */
/*  Datos del negocio en un solo lugar (los usa Google y todo el sitio) */
/*  Si cambia el dominio, el teléfono o la dirección, se cambia aquí.  */
/* ------------------------------------------------------------------ */

export const SITE = {
  nombre: 'R&S Soluciones Solares',
  // Dirección oficial del sitio. Puede sobrescribirse con NEXT_PUBLIC_SITE_URL en Vercel.
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://ryssolucionessolares.cl').replace(/\/$/, ''),
  descripcion:
    'Venta e instalación de paneles solares en Santiago. Sistemas on-grid, híbridos y con baterías para hogares, comercios e industrias. Evaluación sin costo.',

  /** Imagen que se muestra al compartir el link en WhatsApp/Facebook y que ve Google. */
  imagen: '/instalacion1.jpg',

  telefono: '+56988317681',
  telefonoVisible: '+56 9 8831 7681',
  whatsapp: '56988317681',

  direccion: {
    calle: 'Av. Santa Rosa 8065',
    comuna: 'San Ramón',
    region: 'Región Metropolitana',
    codigoPostal: '8860536',
    pais: 'CL',
  },
  mapsUrl: 'https://maps.google.com/?q=Av.+Sta.+Rosa+8065,+San+Ramón,+Santiago',

  redes: {
    instagram: 'https://www.instagram.com/rys_solucionessolares/',
    facebook: 'https://www.facebook.com/p/R-S-Soluciones-Solares-100065456444686/',
  },
} as const

/** Datos estructurados (schema.org): le dicen a Google qué es el negocio y dónde está. */
export function negocioJsonLd() {
  const { direccion } = SITE
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#negocio`,
    name: SITE.nombre,
    description: SITE.descripcion,
    url: SITE.url,
    image: `${SITE.url}${SITE.imagen}`,
    telephone: SITE.telefono,
    address: {
      '@type': 'PostalAddress',
      streetAddress: direccion.calle,
      addressLocality: direccion.comuna,
      addressRegion: direccion.region,
      postalCode: direccion.codigoPostal,
      addressCountry: direccion.pais,
    },
    hasMap: SITE.mapsUrl,
    areaServed: { '@type': 'Country', name: 'Chile' },
    knowsAbout: ['Paneles solares', 'Energía solar fotovoltaica', 'Inversores', 'Baterías solares'],
    sameAs: [SITE.redes.instagram, SITE.redes.facebook],
  }
}

/** Convierte un objeto a JSON seguro para meterlo en un <script> (evita inyección de HTML). */
export function jsonLdSeguro(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
