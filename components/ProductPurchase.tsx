'use client'

import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, ShoppingCart, Check, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { flyToCart } from '@/lib/flyToCart'

interface Props {
  product: { id: string | number; name: string; price: number; stock: number }
  productUrl: string
  whatsappNumber?: string
}

const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export default function ProductPurchase({ product, productUrl, whatsappNumber }: Props) {
  const addItem = useCartStore((state) => state.addItem)

  const stock = Number(product.stock ?? 0)
  const outOfStock = stock <= 0

  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [showBar, setShowBar] = useState(false)

  const mainButtonRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<number | null>(null)

  // Barra fija en móvil: aparece solo cuando el botón principal sale de la pantalla
  useEffect(() => {
    const el = mainButtonRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleAdd = async (source: HTMLElement | null) => {
    if (outOfStock || adding) return
    setAdding(true)

    await flyToCart(source)
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price })
    }

    setAdding(false)
    setAdded(true)
    setQty(1)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setAdded(false), 1800)
  }

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        outOfStock
          ? `Hola, ¿cuándo vuelve a estar disponible "${product.name}"? ${productUrl}`
          : `Hola, quiero cotizar ${qty > 1 ? `${qty} unidades de ` : ''}"${product.name}". ${productUrl}`
      )}`
    : null

  const addLabel = added ? (
    <>
      <Check className="h-5 w-5" strokeWidth={3} /> Agregado
    </>
  ) : adding ? (
    'Agregando…'
  ) : (
    <>
      <ShoppingCart className="h-5 w-5" /> Agregar al carrito
    </>
  )

  return (
    <div>
      <div className="flex gap-3">
        {/* Cantidad */}
        <div
          className={`flex h-12 shrink-0 items-center rounded-xl border bg-white ${
            outOfStock ? 'border-slate-200 opacity-50' : 'border-slate-300'
          }`}
        >
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || qty <= 1}
            aria-label="Disminuir cantidad"
            className="flex h-full w-11 items-center justify-center rounded-l-xl text-slate-600 transition-colors hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span
            aria-live="polite"
            aria-label={`Cantidad: ${qty}`}
            className="w-9 select-none text-center text-base font-bold tabular-nums text-[#0F172A]"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            disabled={outOfStock || qty >= stock}
            aria-label="Aumentar cantidad"
            className="flex h-full w-11 items-center justify-center rounded-r-xl text-slate-600 transition-colors hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Agregar */}
        <button
          ref={mainButtonRef}
          type="button"
          onClick={(e) => handleAdd(e.currentTarget)}
          disabled={outOfStock || adding}
          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-base font-bold text-white shadow-sm transition-all active:scale-[0.99] disabled:cursor-not-allowed ${
            outOfStock
              ? 'bg-slate-300'
              : added
                ? 'bg-emerald-600'
                : 'bg-orange-600 hover:bg-orange-700 disabled:opacity-80'
          }`}
        >
          {outOfStock ? 'Sin stock' : addLabel}
        </button>
      </div>

      {qty > 1 && !outOfStock && (
        <p className="mt-2 text-right text-sm text-slate-500">
          Total: <span className="font-bold text-[#0F172A]">{clp.format(product.price * qty)}</span>
        </p>
      )}

      {/* WhatsApp */}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <MessageCircle className="h-5 w-5" />
          {outOfStock ? 'Consultar disponibilidad por WhatsApp' : 'Cotizar por WhatsApp'}
        </a>
      )}

      {/* Barra fija móvil */}
      <div
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 shadow-[0_-12px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur transition-transform duration-300 lg:hidden ${
          showBar && !outOfStock ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-500">{product.name}</p>
            <p className="text-lg font-black tracking-tight text-[#0F172A]">
              {clp.format(product.price)}
            </p>
          </div>
          <button
            type="button"
            tabIndex={showBar ? 0 : -1}
            onClick={(e) => handleAdd(e.currentTarget)}
            disabled={outOfStock || adding}
            className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition-colors ${
              added ? 'bg-emerald-600' : 'bg-orange-600 active:bg-orange-700'
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
        </div>
      </div>
    </div>
  )
}