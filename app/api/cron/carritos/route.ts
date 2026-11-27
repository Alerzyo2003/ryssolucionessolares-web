import { NextResponse } from 'next/server'
import { sendAbandonedCartEmails } from '@/lib/abandonedCart'
import { cronSecret } from '@/lib/mailer'

/* La llama cada hora la tarea programada netlify/functions/carritos-abandonados.mts */
export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || request.headers.get('x-cron-secret') !== cronSecret()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    return NextResponse.json(await sendAbandonedCartEmails())
  } catch (error) {
    console.error('Error en recordatorios de carrito:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
