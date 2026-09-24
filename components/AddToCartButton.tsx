"use client" // Directiva obligatoria para habilitar interactividad en Next.js

import { useCartStore } from '@/store/cartStore'

export default function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <button 
      onClick={() => {
        addItem(product)
        alert(`¡${product.name} añadido al carrito!`)
      }}
      className="bg-corp-accent hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
    >
      Añadir
    </button>
  )
}