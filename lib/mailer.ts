import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import nodemailer from 'nodemailer'
import { SITE } from '@/lib/site'

/*
  Envío de correos por SMTP (correo de cPanel).
  Variables en Netlify: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
  SMTP_FROM (opcional) y ADMIN_NOTIFICATION_EMAIL.
*/

export type MailMessage = {
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
  headers?: Record<string, string>
}

export const adminEmail = () =>
  process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'contacto@ryssolucionessolares.cl'

export function mailerConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter
  const port = Number(process.env.SMTP_PORT || 465)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transporter
}

export async function sendMail(message: MailMessage) {
  if (!mailerConfigured()) {
    throw new Error('Falta configurar SMTP_HOST, SMTP_USER y SMTP_PASS.')
  }
  const from = process.env.SMTP_FROM || `"${SITE.nombre}" <${process.env.SMTP_USER}>`
  await getTransporter().sendMail({ from, ...message })
}

/* ---------- utilidades para correos HTML ---------- */

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export const formatCLP = (value: number, currency = 'CLP') =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)

/** Plantilla base con los colores de la marca. `body` es HTML ya escapado. */
export function emailLayout(body: string, footer = '') {
  return `<!doctype html>
<html lang="es"><body style="margin:0;background:#F6F8FB;font-family:Arial,Helvetica,sans-serif;color:#1e293b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F8FB;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="height:5px;background:#FF6200;background:linear-gradient(90deg,#FDBA2D,#FF6200,#0B3A63)"></td></tr>
<tr><td style="padding:28px 32px 8px">
<a href="${SITE.url}" style="text-decoration:none;font-size:20px;font-weight:bold;color:#0B3A63">R&amp;S <span style="color:#FF6200">Soluciones Solares</span></a>
</td></tr>
<tr><td style="padding:8px 32px 28px;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:18px 32px;background:#0B3A63;color:#cbd5e1;font-size:12px;line-height:1.6">
${escapeHtml(SITE.nombre)} · ${escapeHtml(SITE.direccion.calle)}, ${escapeHtml(SITE.direccion.comuna)} · ${escapeHtml(SITE.telefonoVisible)}<br>
<a href="${SITE.url}" style="color:#FDBA2D">${SITE.url.replace(/^https?:\/\//, '')}</a>${footer ? `<br>${footer}` : ''}
</td></tr>
</table></td></tr></table></body></html>`
}

export const button = (href: string, label: string, color = '#FF6200') =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:10px">${escapeHtml(label)}</a>`

/* ---------- enlace para darse de baja (firmado, no se puede falsificar) ---------- */

function unsubscribeSecret() {
  const base = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SMTP_PASS || 'rys'
  return createHash('sha256').update(`unsubscribe:${base}`).digest()
}

export function unsubscribeToken(email: string) {
  return createHmac('sha256', unsubscribeSecret()).update(email.trim().toLowerCase()).digest('hex').slice(0, 32)
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = Buffer.from(unsubscribeToken(email))
  const given = Buffer.from(String(token))
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export function unsubscribeUrl(email: string) {
  const params = new URLSearchParams({ email: email.trim().toLowerCase(), token: unsubscribeToken(email) })
  return `${SITE.url}/api/correos/baja?${params}`
}

/** Clave para que la tarea programada de Netlify pueda llamar a la API. */
export function cronSecret() {
  const base = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createHash('sha256').update(`cron:${base}`).digest('hex')
}
