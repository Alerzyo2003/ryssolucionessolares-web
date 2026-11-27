import { createHash } from 'node:crypto'

/*
  Tarea programada de Netlify: cada hora le pide al sitio que envíe
  los recordatorios de carrito abandonado (app/api/cron/carritos).
*/
export default async () => {
  const site = process.env.URL || 'https://ryssolucionessolares.cl'
  const secret = createHash('sha256').update(`cron:${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`).digest('hex')
  const res = await fetch(`${site}/api/cron/carritos`, { method: 'POST', headers: { 'x-cron-secret': secret } })
  console.log('Recordatorios de carrito:', res.status, await res.text())
}

export const config = { schedule: '@hourly' }
