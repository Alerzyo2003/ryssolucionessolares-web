import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim()

  if (!query || query.length < 4) {
    return NextResponse.json({ error: 'Escribe al menos 4 caracteres para buscar.' }, { status: 400 })
  }

  const searchUrl = new URL('https://nominatim.openstreetmap.org/search')
  searchUrl.searchParams.set('format', 'jsonv2')
  searchUrl.searchParams.set('countrycodes', 'cl')
  searchUrl.searchParams.set('limit', '5')
  searchUrl.searchParams.set('addressdetails', '1')
  searchUrl.searchParams.set('dedupe', '1')
  searchUrl.searchParams.set('accept-language', 'es')
  searchUrl.searchParams.set('q', query)

  try {
    const response = await fetch(searchUrl, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'es',
        'User-Agent': 'RYS-Soluciones-Solares/1.0 (contacto@ryssolucionessolares.cl)',
      },
      next: { revalidate: 3600 },
    })

    if (response.status === 429) {
      return NextResponse.json(
        { error: 'El buscador recibió demasiadas consultas. Espera un momento e inténtalo otra vez.' },
        { status: 429 }
      )
    }
    if (!response.ok) {
      console.error('Nominatim respondió con estado:', response.status)
      return NextResponse.json(
        { error: 'El servicio de direcciones no está disponible temporalmente.' },
        { status: 502 }
      )
    }

    const results: unknown = await response.json()
    if (!Array.isArray(results)) {
      return NextResponse.json(
        { error: 'El servicio devolvió una respuesta inesperada. Inténtalo otra vez.' },
        { status: 502 }
      )
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error al consultar Nominatim:', error)
    return NextResponse.json(
      { error: 'No se pudo conectar al servicio de direcciones. Revisa tu conexión e inténtalo otra vez.' },
      { status: 502 }
    )
  }
}