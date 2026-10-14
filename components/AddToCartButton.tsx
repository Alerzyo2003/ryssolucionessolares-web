'use client'

import { useRef, useState, useEffect } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { flyToCart } from '@/lib/flyToCart'

// Solo los campos que necesita el carrito. Cualquier objeto Product con
// más propiedades (description, stock, etc.) también es válido.
interface CartProduct {
  id: string | number
  name: string
  price: number
}

export default function AddToCartButton({ product }: { product: CartProduct }) {
  const addItem = useCartStore((state) => state.addItem)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const [added, setAdded] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleClick = async () => {
    // 1. La imagen vuela hacia el carrito
    await flyToCart(buttonRef.current)

    // 2. Al aterrizar, se agrega al carrito (el contador sube en ese momento)
    addItem({ id: product.id, name: product.name, price: product.price })

    // 3. Feedback breve en el botón
    setAdded(true)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-live="polite"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 active:scale-[0.98] ${
        added ? 'bg-emerald-600' : 'bg-orange-600 hover:bg-orange-700'
      }`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" strokeWidth={3} /> Agregado
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" /> Agregar
        </>
      )}
    </button>
  )
}
