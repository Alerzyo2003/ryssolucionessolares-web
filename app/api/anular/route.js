import { NextResponse } from 'next/server'
import { 
  WebpayPlus, 
  Options, 
  IntegrationApiKeys, 
  Environment, 
  IntegrationCommerceCodes 
} from 'transbank-sdk'

export async function GET() {
  try {
    const tx = new WebpayPlus.Transaction(
      new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
      )
    )

    // Tus dos tokens listos para ser anulados
    const TOKEN_PARCIAL = '01ab5cfdf49ee95eeece1aacb34d806d2485784da5ed817272d478e7b745779b'
    const TOKEN_TOTAL = '01ab0e76d98a8ec4362a2431ed41eae0a2b82b5a3b52305ad81f6fbbfecd48a8'

    console.log('Procesando anulación parcial en Transbank...')
    const parcialResponse = await tx.refund(TOKEN_PARCIAL, 1)

    console.log('Procesando anulación total en Transbank...')
    const totalResponse = await tx.refund(TOKEN_TOTAL, 1)

    return NextResponse.json({
      success: true,
      mensaje: "¡Anulaciones aprobadas con éxito en Transbank!",
      tokens_validos: {
        parcial: TOKEN_PARCIAL,
        total: TOKEN_TOTAL
      },
      detalle: { parcialResponse, totalResponse }
    })

  } catch (error) {
    console.error('Error al anular en Transbank:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error inesperado al anular" 
    }, { status: 500 })
  }
}
