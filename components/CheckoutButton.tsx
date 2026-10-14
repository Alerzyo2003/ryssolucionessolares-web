'use client'

import { useState } from 'react'

export default function MercadoPagoButton({ totalAmount }: { totalAmount: number }) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    
    const items = [
      {
        title: 'Servicio / Producto - R&S Soluciones Solares',
        unit_price: Number(totalAmount),
        quantity: 1,
      }
    ]

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error al conectar con Mercado Pago: ' + (data.error || 'Respuesta inválida'))
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión al procesar el pago.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-[#009EE3] hover:bg-[#0081B8] text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
    >
      {loading ? 'Conectando con Mercado Pago...' : 'Pagar con Mercado Pago'}
    </button>
  )
}