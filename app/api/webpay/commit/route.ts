import { NextResponse } from 'next/server'
import { WebpayPlus, Options, Environment } from 'transbank-sdk'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

async function updateOrderStatus(
  buyOrder: string,
  status: 'paid' | 'failed'
) {
  try {
    const admin = createSupabaseAdmin()
    const { error } = await admin
      .from('orders')
      .update({
        status,
        provider_payment_id: status === 'paid' ? buyOrder : null,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
      })
      .eq('provider', 'webpay')
      .eq('provider_reference', buyOrder)

    if (error) console.error('No se pudo actualizar la orden Webpay:', error)
  } catch (error) {
    console.error('No se pudo conectar con las órdenes Webpay:', error)
  }
}

async function commitTransaction(request: Request, token: string) {
  try {
    // INICIALIZACIÓN EN PRODUCCIÓN
    const tx = new WebpayPlus.Transaction(
      new Options(
        process.env.WEBPAY_COMMERCE_CODE as string,
        process.env.WEBPAY_API_KEY as string,
        Environment.Production
      )
    )

    const response = await tx.commit(token)

    if (response.status === 'AUTHORIZED' && response.response_code === 0) {
      await updateOrderStatus(String(response.buy_order), 'paid')
      const paymentUrl = new URL('/pago-realizado', request.url)
      paymentUrl.searchParams.set('payment_id', response.buy_order)
      paymentUrl.searchParams.set('amount', String(response.amount))
      paymentUrl.searchParams.set('transaction_date', String(response.transaction_date || ''))
      paymentUrl.searchParams.set('authorization_code', String(response.authorization_code || ''))
      paymentUrl.searchParams.set('card_last4', String(response.card_detail?.card_number || ''))
      paymentUrl.searchParams.set('payment_type_code', String(response.payment_type_code || ''))

      return NextResponse.redirect(paymentUrl)
    }

    if (response.buy_order) await updateOrderStatus(String(response.buy_order), 'failed')
    return NextResponse.redirect(new URL('/pago-rechazado', request.url))
  } catch (error) {
    console.error('Error al confirmar pago:', error)
    return NextResponse.redirect(new URL('/pago-rechazado?error=error_procesamiento', request.url))
  }
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token_ws')
  if (token) return commitTransaction(request, token)
  return NextResponse.redirect(new URL('/pago-anulado', request.url))
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const token = formData.get('token_ws')
  if (!token) return NextResponse.redirect(new URL('/pago-anulado', request.url))
  return commitTransaction(request, token.toString())
}