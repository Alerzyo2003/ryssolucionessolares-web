import { NextResponse } from 'next/server'
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk'

export async function GET() {
  try {
    const tx = new WebpayPlus.Transaction(
      new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
      )
    )

    const tokenParcial = process.env.TBK_TOKEN_PARCIAL
    const tokenTotal = process.env.TBK_TOKEN_TOTAL

    if (!tokenParcial || !tokenTotal) {
      return NextResponse.json({
        success: false,
        error: 'Faltan TBK_TOKEN_PARCIAL y TBK_TOKEN_TOTAL en las variables de entorno.'
      }, { status: 400 })
    }

    console.log('Procesando anulación parcial en Transbank...')
    const parcialResponse = await tx.refund(tokenParcial, 1)

    console.log('Procesando anulación total en Transbank...')
    const totalResponse = await tx.refund(tokenTotal, 1)

    return NextResponse.json({
      success: true,
      mensaje: 'Anulaciones aprobadas con éxito en Transbank!',
      detalle: { parcialResponse, totalResponse }
    })

  } catch (error: unknown) {
    console.error('Error al anular en Transbank:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error inesperado al anular'
    }, { status: 500 })
  }
}
