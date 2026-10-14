import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get('order_id')

  if (!orderId) {
    return NextResponse.json({ error: 'Falta el identificador de la orden.' }, { status: 400 })
  }

  try {
    const admin = createSupabaseAdmin()
    const { data: order, error } = await admin
      .from('orders')
      .select('id, created_at, paid_at, provider, provider_reference, provider_payment_id, customer_email, amount, total_amount, currency, items, status')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'No se encontró la orden.' }, { status: 404 })
    }
    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'El comprobante estará disponible cuando el pago esté aprobado.' }, { status: 409 })
    }

    return NextResponse.json({
      orderId: order.id,
      createdAt: order.paid_at || order.created_at,
      provider: order.provider,
      reference: order.provider_payment_id || order.provider_reference || order.id,
      customerEmail: order.customer_email,
      amount: Number(order.total_amount ?? order.amount),
      currency: order.currency || 'CLP',
      items: order.items,
      status: order.status,
    })
  } catch (error) {
    console.error('Error al cargar el comprobante:', error)
    return NextResponse.json({ error: 'No se pudo cargar el comprobante.' }, { status: 500 })
  }
}