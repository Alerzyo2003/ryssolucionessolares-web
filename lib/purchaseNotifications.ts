import 'server-only'
import { Resend } from 'resend'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

type OrderItem = {
  name: string
  quantity: number
  unit_price: number
}

type PaidOrder = {
  id: string
  provider: string
  provider_reference: string | null
  provider_payment_id: string | null
  customer_email: string
  amount: number
  total_amount: number | null
  currency: string | null
  items: OrderItem[] | null
}

const formatPrice = (value: number, currency: string) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)

export async function sendPaidOrderEmails(orderId: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'contacto@ryssolucionessolares.cl'

  if (!apiKey || !from) {
    console.error('No se envió el aviso de compra: configura RESEND_API_KEY y RESEND_FROM_EMAIL.')
    return
  }

  const supabase = createSupabaseAdmin()
  const now = new Date()
  const staleClaim = new Date(now.getTime() - 10 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('orders')
    .update({ notification_email_claimed_at: now.toISOString() })
    .eq('id', orderId)
    .eq('status', 'paid')
    .is('notification_email_sent_at', null)
    .or(`notification_email_claimed_at.is.null,notification_email_claimed_at.lt.${staleClaim}`)
    .select('id, provider, provider_reference, provider_payment_id, customer_email, amount, total_amount, currency, items')
    .maybeSingle()

  if (error) {
    console.error('No se pudo reservar el aviso de compra:', error)
    return
  }
  if (!data) return

  const order = data as PaidOrder
  const currency = order.currency || 'CLP'
  const amount = Number(order.total_amount ?? order.amount)
  const reference = order.provider_payment_id || order.provider_reference || order.id
  const providerName = order.provider === 'mercadopago' ? 'Mercado Pago' : 'Webpay'
  const itemLines = (order.items ?? []).map((item) =>
    `- ${item.quantity} x ${item.name}: ${formatPrice(item.unit_price * item.quantity, currency)}`
  )
  const details = [
    `Orden: ${order.id}`,
    `Comprobante: ${reference}`,
    `Fecha: ${now.toLocaleString('es-CL')}`,
    `Medio de pago: ${providerName}`,
    `Estado: PAGADO`,
    `Cliente: ${order.customer_email}`,
    '',
    'Productos:',
    ...(itemLines.length ? itemLines : ['- Sin detalle de productos']),
    '',
    `Total: ${formatPrice(amount, currency)}`,
  ].join('\n')

  const resend = new Resend(apiKey)
  try {
    const results = await Promise.all([
      resend.emails.send({
        from,
        to: order.customer_email,
        subject: 'Compra confirmada - R&S Soluciones Solares',
        text: `Hola, tu pago fue aprobado. Gracias por comprar en R&S Soluciones Solares.\n\n${details}`,
      }),
      resend.emails.send({
        from,
        to: adminEmail,
        subject: `Nueva compra pagada - ${reference}`,
        text: `Se aprobó una compra en R&S Soluciones Solares.\n\n${details}`,
      }),
    ])
    const failedEmail = results.find((result) => result.error)

    if (failedEmail?.error) {
      await supabase
        .from('orders')
        .update({ notification_email_claimed_at: null })
        .eq('id', order.id)
      console.error('Resend no pudo enviar los avisos de compra:', failedEmail.error)
      return
    }

    const { error: sentError } = await supabase
      .from('orders')
      .update({ notification_email_sent_at: new Date().toISOString() })
      .eq('id', order.id)

    if (sentError) console.error('Se enviaron los avisos, pero no se pudo registrar el envío:', sentError)
  } catch (error) {
    await supabase
      .from('orders')
      .update({ notification_email_claimed_at: null })
      .eq('id', order.id)
    console.error('Error al enviar notificación de compra:', error)
  }
}