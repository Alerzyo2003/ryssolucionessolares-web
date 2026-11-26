import localFont from 'next/font/local'

/*
  Bricolage Grotesque (fuente de títulos) servida desde el propio sitio.
  Antes se descargaba de Google Fonts en cada build, y eso hacía fallar
  el deploy en Netlify. Es una fuente variable: cubre los pesos 200 a 800.
*/
export const display = localFont({
  src: [
    { path: './bricolage-grotesque-latin-wght-normal.woff2', weight: '200 800', style: 'normal' },
    { path: './bricolage-grotesque-latin-ext-wght-normal.woff2', weight: '200 800', style: 'normal' },
  ],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
})
