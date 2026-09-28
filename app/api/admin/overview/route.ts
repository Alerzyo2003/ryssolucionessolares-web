import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

    if (!accessToken) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
    }

    const admin = createSupabaseAdmin()
    const { data: { user }, error: userError } = await admin.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json({ error: 'La sesión no es válida.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.is_admin !== true) {
      return NextResponse.json({ error: 'No tienes permisos de administrador.' }, { status: 403 })
    }

    const ordersOnly = new URL(request.url).searchParams.get('scope') === 'orders'
    const ordersPromise = admin.from('orders').select('*').order('created_at', { ascending: false })
    const productsPromise = ordersOnly
      ? Promise.resolve({ data: [], error: null })
      : admin.from('products').select('*').order('name')

    const [productsResult, ordersResult] = await Promise.all([
      productsPromise,
      ordersPromise,
    ])

    if (productsResult.error || ordersResult.error) {
      const message = productsResult.error?.message || ordersResult.error?.message
      console.error('Error al leer datos del panel:', message)
      return NextResponse.json({ error: `No se pudieron cargar los datos del panel: ${message}` }, { status: 500 })
    }

    return NextResponse.json({
      products: productsResult.data ?? [],
      orders: ordersResult.data ?? [],
    })
  } catch (error) {
    console.error('Error al cargar el panel administrativo:', error)
    return NextResponse.json({ error: 'No se pudo cargar el panel administrativo.' }, { status: 500 })
  }
}