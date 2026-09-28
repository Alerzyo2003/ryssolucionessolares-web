import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { sendPaidOrderEmails } from '@/lib/purchaseNotifications'

export async function GET(request: Request) {
  try {
    const paymentId = new URL(request.url).searchParams.get('payment_id')
    const expectedOrderId = new URL(request.url).searchParams.get('order_id')
    const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!paymentId || !expectedOrderId) {
      return NextResponse.json({ error: 'Faltan los datos de la transacción.' }, { status: 400 })
    }
    if (!accessToken) {
      return NextResponse.json({ error: 'Falta configurar el token de Mercado Pago.' }, { status: 500 })
    }

    const payment = await new Payment(new MercadoPagoConfig({ accessToken }))
      .get({ id: paymentId })

    if (payment.status !== 'approved') {
      return NextResponse.json(
        { error: 'Mercado Pago todavía no confirma el pago.', status: payment.status },
        { status: 409 }
      )
    }
    if (payment.external_reference !== expectedOrderId) {
      return NextResponse.json({ error: 'La transacción no corresponde a esta orden.' }, { status: 400 })
    }

    const admin = createSupabaseAdmin()
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, provider, amount')
      .eq('id', expectedOrderId)
      .single()

    if (orderError || !order || order.provider !== 'mercadopago') {
      return NextResponse.json({ error: 'No se encontró la orden de Mercado Pago.' }, { status: 404 })
    }
    if (
      payment.currency_id !== 'CLP' ||
      Math.round(Number(payment.transaction_amount)) !== Number(order.amount)
    ) {
      return NextResponse.json({ error: 'El monto confirmado no coincide con la orden.' }, { status: 409 })
    }

    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'paid',
        provider_payment_id: String(payment.id),
        paid_at: payment.date_approved || new Date().toISOString(),
      })
      .eq('id', order.id)

    if (updateError) throw updateError
    await sendPaidOrderEmails(order.id)

    return NextResponse.json({
      paymentId: String(payment.id),
      amount: Number(payment.transaction_amount),
      transactionDate: payment.date_approved || payment.date_created || null,
      authorizationCode: payment.authorization_code || null,
      cardLast4: payment.card?.last_four_digits || null,
      paymentMethod: payment.payment_method_id || payment.payment_type_id || null,
      status: 'paid',
    })
  } catch (error) {
    console.error('Error al verificar el pago de Mercado Pago:', error)
    return NextResponse.json({ error: 'No se pudo verificar el pago con Mercado Pago.' }, { status: 500 })
  }
}