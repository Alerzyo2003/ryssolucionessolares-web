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
    const TOKEN_PARCIAL = '01ab22f82d4319e2fc9256ba131c257b0ae3bdb179ba12e9a6ee879d0d8ec3c9'
    const TOKEN_TOTAL = '01ab4bb98ae6761cd2e062e3793d23db0a93271b82156e8247333bedd380442f'

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
