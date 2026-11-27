import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyUnsubscribeToken } from '@/lib/mailer'
import { SITE } from '@/lib/site'

async function unsubscribe(request: Request) {
  const params = new URL(request.url).searchParams
  const email = String(params.get('email') || '').trim().toLowerCase()
  const token = String(params.get('token') || '')
  if (!email || !verifyUnsubscribeToken(email, token)) return false
  const { error } = await createSupabaseAdmin().from('email_optouts').upsert({ email })
  if (error) throw error
  return true
}

const page = (title: string, msg: string) =>
  new NextResponse(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;font-family:Arial,sans-serif;background:#F6F8FB;color:#0B3A63;display:grid;place-items:center;min-height:100vh;padding:16px">
<div style="max-width:440px;background:#fff;border-radius:16px;padding:32px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.08)">
<h1 style="font-size:22px">${title}</h1><p style="color:#475569;line-height:1.6">${msg}</p>
<a href="${SITE.url}" style="display:inline-block;margin-top:12px;background:#FF6200;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold">Volver al sitio</a></div></body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  )

export async function GET(request: Request) {
  try {
    return (await unsubscribe(request))
      ? page('Listo, te diste de baja', 'Ya no te enviaremos recordatorios de compra. Si compras con nosotros, igual recibirás la confirmación de tu pago.')
      : page('Enlace no válido', 'Este enlace para darse de baja no es válido o está incompleto.')
  } catch {
    return page('Algo salió mal', 'No pudimos procesar tu solicitud. Escríbenos y te damos de baja manualmente.')
  }
}

/* Baja con un clic desde Gmail/Outlook (encabezado List-Unsubscribe-Post) */
export async function POST(request: Request) {
  try {
    return NextResponse.json({ ok: await unsubscribe(request) })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
