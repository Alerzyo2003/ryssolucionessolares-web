import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: 'Falta configurar el token de Mercado Pago.' }, { status: 500 })
    }

    const url = new URL(request.url)
    const body = await request.json().catch(() => ({}))
    const paymentId = url.searchParams.get('data.id') || body.data?.id || url.searchParams.get('id')

    if (!paymentId) return NextResponse.json({ received: true })

    const payment = await new Payment(new MercadoPagoConfig({ accessToken }))
      .get({ id: String(paymentId) })

    if (!payment.external_reference) {
      return NextResponse.json({ received: true })
    }

    const admin = createSupabaseAdmin()
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, provider, amount')
      .eq('id', payment.external_reference)
      .single()

    if (orderError || !order || order.provider !== 'mercadopago') {
      return NextResponse.json({ error: 'La orden asociada no existe.' }, { status: 404 })
    }

    if (
      payment.currency_id !== 'CLP' ||
      Math.round(Number(payment.transaction_amount)) !== Number(order.amount)
    ) {
      return NextResponse.json({ error: 'El monto de pago no coincide con la orden.' }, { status: 400 })
    }

    const status = payment.status === 'approved'
      ? 'paid'
      : payment.status === 'rejected'
        ? 'failed'
        : payment.status === 'cancelled'
          ? 'cancelled'
          : 'pending'

    const { error: updateError } = await admin
      .from('orders')
      .update({
        status,
        provider_payment_id: String(payment.id),
        paid_at: status === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', order.id)

    if (updateError) throw updateError
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error al procesar webhook de Mercado Pago:', error)
    return NextResponse.json({ error: 'No se pudo procesar la notificación.' }, { status: 500 })
  }
}