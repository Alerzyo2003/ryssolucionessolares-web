'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'

interface Props {
  images: string[]
  alt: string
  outOfStock?: boolean
}

export default function ProductGallery({ images, alt, outOfStock = false }: Props) {
  const [active, setActive] = useState(0)
  const current = images[active]

  return (
    <div>
      {/* Imagen principal (debe ser la primera <img> del bloque para la animación al carrito) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(234,88,12,0.07),transparent_62%)]"
        />

        {current ? (
          <Image
            key={current}
            src={current}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className={`object-contain p-8 md:p-14 transition-opacity duration-300 ${
              outOfStock ? 'opacity-60 grayscale' : ''
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
            <ImageOff className="h-14 w-14" />
            <span className="text-sm font-medium">Sin imagen disponible</span>
          </div>
        )}

        {outOfStock && (
          <span className="absolute left-4 top-4 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            Sin stock
          </span>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <ul className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                aria-current={i === active}
                className={`relative block aspect-square w-full overflow-hidden rounded-xl border bg-white transition-all ${
                  i === active
                    ? 'border-orange-500 ring-2 ring-orange-500/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Image src={src} alt="" fill sizes="96px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}