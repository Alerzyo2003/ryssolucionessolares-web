'use client'

import { useState } from 'react'
import { useCartStore, type CartItem } from '@/store/cartStore'
import MercadoPagoButton from '@/components/MercadoPagoButton'
import WebpayButton from '@/components/WebpayButton'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [customerEmail, setCustomerEmail] = useState('')
  const items = useCartStore((state) => state.items)

  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null

  // Calcular el total a pagar
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro traslúcido */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />

      {/* Panel deslizante */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Cabecera del Panel */}
          <div className="flex items-center justify-between px-6 py-4 bg-corp-blue text-white">
            <h2 className="text-lg font-bold">Tu Carrito de Compras</h2>
            <button 
              onClick={onClose}
              className="text-slate-300 hover:text-white text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Lista de productos seleccionados */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <p className="text-center text-corp-gray mt-10">Tu carrito está vacío.</p>
            ) : (
              items.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-semibold text-corp-blue">{item.name}</h3>
                    <p className="text-sm text-corp-gray">Cantidad: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-corp-blue">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.price * item.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pie de página con el total y botones de pago */}
          {items.length > 0 && (
            <div className="border-t p-6 bg-corp-light space-y-4">
              <div className="flex justify-between text-lg font-bold text-corp-blue">
                <span>Total:</span>
                <span>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalPrice)}</span>
              </div>
              
              {/* Ambos métodos de pago disponibles en el panel lateral */}
              <div className="space-y-3">
                {/* Le pasamos la lista de items en lugar de solo el total */}
                <label className="block text-sm font-semibold text-slate-700">
                  Correo para tu compra
                  <input
                    type="email"
                    autoComplete="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    placeholder="tu@correo.com"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500"
                  />
                </label>
                <MercadoPagoButton items={items} customerEmail={customerEmail} />
                <WebpayButton items={items} customerEmail={customerEmail} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}