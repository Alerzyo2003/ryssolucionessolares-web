import 'server-only'
import { adminEmail as getAdminEmail, button, emailLayout, escapeHtml, formatCLP, mailerConfigured, sendMail } from '@/lib/mailer'
import { SITE } from '@/lib/site'
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
  const adminEmail = getAdminEmail()

  if (!mailerConfigured()) {
    console.error('No se envió el aviso de compra: configura SMTP_HOST, SMTP_USER y SMTP_PASS.')
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

  const rows = (order.items ?? []).map((item) =>
    `<tr><td style="padding:6px 0">${item.quantity} × ${escapeHtml(item.name)}</td><td align="right" style="padding:6px 0;white-space:nowrap">${formatCLP(item.unit_price * item.quantity, currency)}</td></tr>`
  ).join('')
  const table = `<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;margin:16px 0">${rows}
<tr><td style="padding:10px 0;border-top:1px solid #e2e8f0;font-weight:bold">Total</td><td align="right" style="padding:10px 0;border-top:1px solid #e2e8f0;font-weight:bold;color:#0B3A63">${formatCLP(amount, currency)}</td></tr></table>
<p style="font-size:13px;color:#64748b">Orden: ${escapeHtml(order.id)}<br>Comprobante: ${escapeHtml(String(reference))}<br>Medio de pago: ${providerName}</p>`
  const whatsapp = `https://wa.me/${SITE.whatsapp}`

  try {
    await Promise.all([
      sendMail({
        to: order.customer_email,
        replyTo: adminEmail,
        subject: 'Compra confirmada - R&S Soluciones Solares',
        text: `Hola, tu pago fue aprobado. Gracias por comprar en R&S Soluciones Solares.\n\n${details}\n\nDudas: ${SITE.telefonoVisible}`,
        html: emailLayout(`<h1 style="font-size:22px;color:#0B3A63;margin:0 0 8px">¡Gracias por tu compra!</h1>
<p>Tu pago fue <strong style="color:#16a34a">aprobado</strong>. Pronto te contactaremos para coordinar la entrega o instalación.</p>${table}
<p>${button(whatsapp, 'Escríbenos por WhatsApp', '#16a34a')}</p>`),
      }),
      sendMail({
        to: adminEmail,
        replyTo: order.customer_email,
        subject: `Nueva compra pagada - ${reference}`,
        text: `Se aprobó una compra en R&S Soluciones Solares.\n\n${details}`,
        html: emailLayout(`<h1 style="font-size:22px;color:#0B3A63;margin:0 0 8px">Nueva compra pagada 🎉</h1>
<p>Cliente: <strong>${escapeHtml(order.customer_email)}</strong></p>${table}`),
      }),
    ])

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