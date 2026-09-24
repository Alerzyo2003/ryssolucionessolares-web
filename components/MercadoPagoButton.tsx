'use client'

import { useState } from 'react'

// Cambiamos totalAmount por items
export default function MercadoPagoButton({ items }: { items: any[] }) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    
    // Mapeamos los items reales del carrito
    const formattedItems = items.map(item => ({
      title: item.name || 'Producto R&S',
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      id: String(item.id)
    }))

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: formattedItems }),
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