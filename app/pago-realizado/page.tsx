"use client"

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'

// Creamos un componente interno para poder usar useSearchParams dentro de Suspense (Requisito de Next.js)
function PagoExitosoContenido() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const clearCart = useCartStore((state) => state.clearCart)

  // Apenas cargue esta página, vaciamos el carrito
  useEffect(() => {
    if (clearCart) {
      clearCart()
    }
  }, [clearCart])

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-10">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">¡Pago Realizado con Éxito!</h1>
      <p className="text-slate-600 mb-8">
        Muchas gracias por tu compra en R&S Soluciones Solares. Hemos recibido tu pedido y comenzaremos a procesarlo pronto.
      </p>

      <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detalles de la Transacción</h3>
        <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
          <span className="text-slate-600">Estado</span>
          <span className="font-bold text-emerald-600">Aprobado</span>
        </div>
        <div className="flex justify-between items-center pb-3">
          <span className="text-slate-600">N° de Comprobante (ID)</span>
          <span className="font-bold text-slate-800">{paymentId || 'N/A'}</span>
        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">
          * Hemos enviado un correo con el recibo detallado a la cuenta asociada a tu pago.
        </p>
      </div>

      <Link 
        href="/tienda" 
        className="inline-block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-md"
      >
        Volver a la Tienda
      </Link>
    </div>
  )
}

// El componente principal exportado
export default function PagoRealizadoPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 flex items-center justify-center font-sans">
      <Suspense fallback={<div className="text-center text-slate-500">Cargando detalles de tu pago...</div>}>
        <PagoExitosoContenido />
      </Suspense>
    </div>
  )
}