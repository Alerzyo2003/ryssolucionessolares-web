import 'server-only'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import {
  adminEmail, button, emailLayout, escapeHtml, formatCLP, mailerConfigured, sendMail, unsubscribeUrl,
} from '@/lib/mailer'
import { SITE } from '@/lib/site'

/*
  Recordatorio de carrito abandonado.
  Una orden "pending" es alguien que llegó a Webpay / Mercado Pago y no pagó.
  Pasadas ABANDONED_CART_DELAY_HOURS horas (2 por defecto) se le envía UN correo,
  y te llega un aviso a ti. Nunca se repite para la misma orden.
*/

type Item = { id?: string; name: string; quantity: number; unit_price: number }
type PendingOrder = {
  id: string
  customer_email: string
  amount: number
  total_amount: number | null
  currency: string | null
  items: Item[] | null
  created_at: string
}

const MAX_AGE_DAYS = 7 // no escribir por órdenes muy antiguas
const MAX_PER_RUN = 20

export async function sendAbandonedCartEmails() {
  if (!mailerConfigured()) return { sent: 0, skipped: 'SMTP no configurado' }

  const supabase = createSupabaseAdmin()
  const delayHours = Number(process.env.ABANDONED_CART_DELAY_HOURS || 2)
  const now = Date.now()
  const olderThan = new Date(now - delayHours * 3600_000).toISOString()
  const newerThan = new Date(now - MAX_AGE_DAYS * 86400_000).toISOString()

  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_email, amount, total_amount, currency, items, created_at')
    .eq('status', 'pending')
    .is('abandoned_email_sent_at', null)
    .is('abandoned_email_claimed_at', null)
    .lt('created_at', olderThan)
    .gt('created_at', newerThan)
    .order('created_at', { ascending: true })
    .limit(MAX_PER_RUN)

  if (error) throw new Error(`No se pudieron leer las órdenes pendientes: ${error.message}`)

  let sent = 0
  const alreadyWritten = new Set<string>()

  for (const order of (data ?? []) as PendingOrder[]) {
    const email = order.customer_email.trim().toLowerCase()

    // Reservar la orden para que dos ejecuciones no envíen el mismo correo
    const { data: claimed } = await supabase
      .from('orders')
      .update({ abandoned_email_claimed_at: new Date().toISOString() })
      .eq('id', order.id)
      .is('abandoned_email_claimed_at', null)
      .select('id')
      .maybeSingle()
    if (!claimed) continue

    const markDone = () =>
      supabase.from('orders').update({ abandoned_email_sent_at: new Date().toISOString() }).eq('id', order.id)

    // No escribir si: ya pagó después, se dio de baja, o ya le escribimos en esta vuelta
    const [{ count: paidLater }, { data: optout }] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true })
        .eq('customer_email', order.customer_email).eq('status', 'paid').gte('created_at', order.created_at),
      supabase.from('email_optouts').select('email').eq('email', email).maybeSingle(),
    ])
    if ((paidLater ?? 0) > 0 || optout || alreadyWritten.has(email)) {
      await markDone()
      continue
    }

    try {
      await sendReminder(order, email)
      await markDone()
      alreadyWritten.add(email)
      sent++
    } catch (err) {
      // liberar para reintentar en la próxima ejecución
      await supabase.from('orders').update({ abandoned_email_claimed_at: null }).eq('id', order.id)
      console.error('No se pudo enviar el recordatorio de carrito:', order.id, err)
    }
  }

  return { sent }
}

async function sendReminder(order: PendingOrder, email: string) {
  const currency = order.currency || 'CLP'
  const total = Number(order.total_amount ?? order.amount)
  const items = order.items ?? []
  const firstProduct = items.find((i) => i.id)
  const backUrl = firstProduct ? `${SITE.url}/products/${firstProduct.id}` : `${SITE.url}/tienda`
  const productNames = items.map((i) => i.name).join(', ')
  const whatsapp = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    `Hola, quería comprar ${productNames} en su web y no pude terminar el pago. ¿Me ayudan?`
  )}`
  const baja = unsubscribeUrl(email)

  const rows = items.map((i) => {
    const name = i.id
      ? `<a href="${SITE.url}/products/${encodeURIComponent(i.id)}" style="color:#0B3A63">${escapeHtml(i.name)}</a>`
      : escapeHtml(i.name)
    return `<tr><td style="padding:6px 0">${i.quantity} × ${name}</td><td align="right" style="padding:6px 0;white-space:nowrap">${formatCLP(i.unit_price * i.quantity, currency)}</td></tr>`
  }).join('')

  const html = emailLayout(
    `<h1 style="font-size:22px;color:#0B3A63;margin:0 0 8px">Dejaste productos en tu carrito</h1>
<p>Hola, vimos que empezaste una compra y no alcanzaste a terminar el pago. Tus productos todavía están disponibles:</p>
<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;margin:16px 0">${rows}
<tr><td style="padding:10px 0;border-top:1px solid #e2e8f0;font-weight:bold">Total</td><td align="right" style="padding:10px 0;border-top:1px solid #e2e8f0;font-weight:bold;color:#0B3A63">${formatCLP(total, currency)}</td></tr></table>
<p>${button(backUrl, 'Terminar mi compra')}</p>
<p style="font-size:14px">¿Tuviste algún problema con el pago o prefieres transferencia o cuotas? Escríbenos y te ayudamos:</p>
<p>${button(whatsapp, 'Hablar por WhatsApp', '#16a34a')}</p>`,
    `<a href="${baja}" style="color:#94a3b8">Darme de baja de estos correos</a>`
  )

  const text = [
    'Dejaste productos en tu carrito',
    '',
    'Hola, vimos que empezaste una compra y no alcanzaste a terminar el pago:',
    ...items.map((i) => `- ${i.quantity} x ${i.name}: ${formatCLP(i.unit_price * i.quantity, currency)}`),
    `Total: ${formatCLP(total, currency)}`,
    '',
    `Terminar mi compra: ${backUrl}`,
    `WhatsApp: ${whatsapp}`,
    '',
    `Darme de baja: ${baja}`,
  ].join('\n')

  await sendMail({
    to: order.customer_email,
    replyTo: adminEmail(),
    subject: 'Dejaste productos en tu carrito - R&S Soluciones Solares',
    text,
    html,
    headers: { 'List-Unsubscribe': `<${baja}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  })

  // Aviso para ti, para que puedas contactar al cliente directamente
  await sendMail({
    to: adminEmail(),
    replyTo: order.customer_email,
    subject: `Carrito abandonado - ${formatCLP(total, currency)} - ${order.customer_email}`,
    text: `Se envió un recordatorio a ${order.customer_email}.\n\n${items
      .map((i) => `- ${i.quantity} x ${i.name}`).join('\n')}\nTotal: ${formatCLP(total, currency)}\nOrden: ${order.id}`,
    html: emailLayout(`<h1 style="font-size:20px;color:#0B3A63;margin:0 0 8px">Carrito abandonado</h1>
<p><strong>${escapeHtml(order.customer_email)}</strong> llegó al pago y no lo terminó. Ya le enviamos un recordatorio automático.</p>
<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;margin:16px 0">${rows}
<tr><td style="padding:10px 0;border-top:1px solid #e2e8f0;font-weight:bold">Total</td><td align="right" style="padding:10px 0;border-top:1px solid #e2e8f0;font-weight:bold">${formatCLP(total, currency)}</td></tr></table>
<p style="font-size:13px;color:#64748b">Puedes responder este correo para escribirle directamente. Orden: ${escapeHtml(order.id)}</p>`),
  })
}
