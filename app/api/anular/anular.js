import { WebpayPlus, Options, Environment } from 'transbank-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
  const MI_COMMERCE_CODE = '597048808451';
  // Vercel inyecta automáticamente la API Key secreta aquí:
  const MI_API_KEY = process.env.WEBPAY_API_KEY; 

  // Configuración segura del SDK
  const tx = new WebpayPlus.Transaction(
    new Options(MI_COMMERCE_CODE, MI_API_KEY, Environment.Integration)
  );

  const tokenParcial = process.env.TBK_TOKEN_PARCIAL;
  const tokenTotal = process.env.TBK_TOKEN_TOTAL;

  if (!tokenParcial || !tokenTotal) {
    return NextResponse.json({
      success: false,
      error: 'Faltan TBK_TOKEN_PARCIAL y TBK_TOKEN_TOTAL en las variables de entorno.'
    }, { status: 400 });
  }

  try {
    // 1. Ejecutar anulación parcial
    const parcialResponse = await tx.refund(tokenParcial, 1);

    // 2. Ejecutar anulación total
    const totalResponse = await tx.refund(tokenTotal, 1);

    return NextResponse.json({
      success: true,
      mensaje: "¡Anulaciones procesadas con éxito en Transbank!",
      detalle: { parcialResponse, totalResponse }
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error inesperado en Transbank" 
    }, { status: 500 });
  }
}