import { NextResponse } from 'next/server'
import { 
  WebpayPlus, 
  Options, 
  IntegrationApiKeys, 
  Environment, 
  IntegrationCommerceCodes 
} from 'transbank-sdk'

export async function POST(request: Request) {
  try {
    const { buyOrder, sessionId, amount } = await request.json()

    // Inyectamos las credenciales de prueba nativas del SDK de Transbank
    const tx = new WebpayPlus.Transaction(
      new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
      )
    )

    const returnUrl = `${request.headers.get('origin')}/api/webpay/commit`
    const numericAmount = Math.round(Number(amount))

    const response = await tx.create(buyOrder, sessionId, numericAmount, returnUrl)

    return NextResponse.json({
      url: response.url,
      token: response.token,
    })
  } catch (error: any) {
    console.error('Error detallado de Webpay en servidor:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}