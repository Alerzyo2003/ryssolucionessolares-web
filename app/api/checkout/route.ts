import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'No se recibieron los items del carrito' }, { status: 400 })
    }

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: items.map((item: any, index: number) => ({
          id: String(item.id || index + 1),
          title: String(item.title || item.name || 'Producto R&S'),
          unit_price: Math.round(Number(item.unit_price || item.price)),
          quantity: Number(item.quantity || 1),
          currency_id: 'CLP',
        })),
        // URLs oficiales de tu aplicación en Vercel
        back_urls: {
          // 👇 CAMBIAMOS EL SUCCESS A TU NUEVA PÁGINA 👇
          success: "https://ryssolucionessolares.vercel.app/pago-realizado",
          failure: "https://ryssolucionessolares.vercel.app/tienda?status=failure",
          pending: "https://ryssolucionessolares.vercel.app/tienda?status=pending",
        },
        auto_return: "approved",
      }
    })

    return NextResponse.json({ url: result.init_point })

  } catch (error: any) {
    console.error("DETALLE DEL ERROR MERCADO PAGO:", error)
    return NextResponse.json({ 
      error: error.message || 'Error al procesar el pago' 
    }, { status: 500 })
  }
}