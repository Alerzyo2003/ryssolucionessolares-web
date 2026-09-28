import { NextResponse } from 'next/server'
import { WebpayPlus, Options, Environment } from 'transbank-sdk'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { createPendingOrder, parseCheckoutLines } from '@/lib/orders'

export async function POST(request: Request) {
  let admin: ReturnType<typeof createSupabaseAdmin> | undefined
  let orderId: string | undefined

  try {
    const { buyOrder, sessionId, items, customerEmail } = await request.json()

    if (!process.env.WEBPAY_COMMERCE_CODE || !process.env.WEBPAY_API_KEY) {
      return NextResponse.json(
        { error: 'Credenciales de Transbank no encontradas en el servidor.' },
        { status: 500 }
      )
    }
    if (typeof buyOrder !== 'string' || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Datos de compra inválidos.' }, { status: 400 })
    }

    admin = createSupabaseAdmin()
    const lines = parseCheckoutLines(items)
    const order = await createPendingOrder(admin, 'webpay', lines, String(customerEmail ?? ''))
    orderId = order.id

    const tx = new WebpayPlus.Transaction(
      new Options(
        process.env.WEBPAY_COMMERCE_CODE,
        process.env.WEBPAY_API_KEY,
        Environment.Production
      )
    )

    const returnUrl = `${request.headers.get('origin')}/api/webpay/commit`
    const response = await tx.create(buyOrder, sessionId, order.amount, returnUrl)
    await admin.from('orders').update({ provider_reference: buyOrder }).eq('id', order.id)

    return NextResponse.json({
      url: response.url,
      token: response.token,
    })
  } catch (error) {
    if (admin && orderId) {
      await admin.from('orders').update({ status: 'failed' }).eq('id', orderId)
    }
    console.error('Error detallado de Webpay en servidor:', error)
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}