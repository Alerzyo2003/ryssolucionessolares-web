import { NextResponse } from 'next/server'
import { 
  WebpayPlus, 
  Options, 
  IntegrationApiKeys, 
  Environment, 
  IntegrationCommerceCodes 
} from 'transbank-sdk'

async function commitTransaction(request: Request, token: string) {
  try {
    const tx = new WebpayPlus.Transaction(
      new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
      )
    )

    const response = await tx.commit(token)

    if (response.status === 'AUTHORIZED' && response.response_code === 0) {
      return NextResponse.redirect(new URL(`/pago-realizado?payment_id=${response.buy_order}`, request.url))
    }

    return NextResponse.redirect(new URL('/pago-rechazado', request.url))
  } catch (error) {
    console.error('Error al confirmar pago:', error)
    return NextResponse.redirect(new URL('/pago-rechazado?error=error_procesamiento', request.url))
  }
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token_ws')

  if (token) {
    return commitTransaction(request, token)
  }

  const returnUrl = new URL('/cart', request.url)
  returnUrl.searchParams.set('error', 'transaccion_cancelada')
  return NextResponse.redirect(returnUrl)
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const token = formData.get('token_ws')

  if (!token) {
    const returnUrl = new URL('/cart', request.url)
    returnUrl.searchParams.set('error', 'transaccion_cancelada')
    return NextResponse.redirect(returnUrl)
  }

  return commitTransaction(request, token.toString())
}