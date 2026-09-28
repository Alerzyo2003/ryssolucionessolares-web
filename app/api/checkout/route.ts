import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { createPendingOrder, parseCheckoutLines } from '@/lib/orders'

export async function POST(request: Request) {
  let admin: ReturnType<typeof createSupabaseAdmin> | undefined
  let orderId: string | undefined

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: 'Falta configurar el token de Mercado Pago.' }, { status: 500 })
    }

    const { items: submittedItems, customerEmail } = await request.json()
    const lines = parseCheckoutLines(submittedItems)
    admin = createSupabaseAdmin()
    const order = await createPendingOrder(admin, 'mercadopago', lines, String(customerEmail ?? ''))
    orderId = order.id

    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    const appUrl = new URL(configuredAppUrl)
    if (appUrl.protocol !== 'https:' && appUrl.protocol !== 'http:') {
      throw new Error('La URL pública de la aplicación no es válida.')
    }
    const appOrigin = appUrl.origin
    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: order.items.map((item) => ({
          id: item.id,
          title: item.name,
          unit_price: item.unit_price,
          quantity: item.quantity,
          currency_id: 'CLP',
        })),
        external_reference: order.id,
        payer: { email: order.customerEmail },
        notification_url: `${appOrigin}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${appOrigin}/pago-realizado?order_id=${order.id}`,
          failure: `${appOrigin}/tienda?status=failure`,
          pending: `${appOrigin}/tienda?status=pending`,
        },
        ...(appUrl.protocol === 'https:' ? { auto_return: 'approved' as const } : {}),
      }
    })

    if (!result.init_point) throw new Error('Mercado Pago no devolvió una URL de pago.')

    await admin.from('orders').update({ provider_reference: String(result.id) }).eq('id', order.id)
    return NextResponse.json({ url: result.init_point })

  } catch (error) {
    if (admin && orderId) {
      await admin.from('orders').update({ status: 'failed' }).eq('id', orderId)
    }
    const message = error instanceof Error ? error.message : 'Error al procesar el pago.'
    console.error('Error al crear pago de Mercado Pago:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}