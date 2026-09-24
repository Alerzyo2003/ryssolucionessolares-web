'use client'

import { useState } from 'react'

export default function WebpayButton({ totalAmount }: { totalAmount: number }) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    const buyOrder = 'O-' + Math.floor(Math.random() * 1000000)
    const sessionId = 'S-' + Math.floor(Math.random() * 1000000)

    try {
      const res = await fetch('/api/webpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyOrder,
          sessionId,
          amount: totalAmount,
        }),
      })

      const data = await res.json()

      if (data.url && data.token) {
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.url

        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'token_ws'
        input.value = data.token

        form.appendChild(input)
        document.body.appendChild(form)
        form.submit()
      } else {
        alert('Error al conectar con Webpay: ' + (data.error || 'Respuesta inválida'))
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión con Webpay.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
    >
      {loading ? 'Conectando con Webpay...' : 'Pagar con Webpay Plus'}
    </button>
  )
}