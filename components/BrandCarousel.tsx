"use client"

import Image from 'next/image'

const brands = [
  { name: 'Growatt', image: '/brands/victron.png' },
  { name: 'Solis', image: '/brands/solis.png' },
  { name: 'Browatt', image: '/brands/growatt.png' },
  
]

export default function BrandCarousel() {
  return (
    <div className="py-12 bg-white border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 mb-8 text-center">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Trabajamos con las marcas líderes de la industria fotovoltaica
        </h3>
      </div>
      
      <div className="flex animate-marquee gap-12 items-center whitespace-nowrap">
          {brands.concat(brands).map((brand, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center bg-white px-8 py-5 rounded-2xl border border-slate-200/60 shadow-sm transition-all min-w-[240px] h-24 group"
            >
              {/* Cambiamos w-32 h-10 por w-40 h-14 y quitamos el filtro grayscale */}
              <div className="relative w-40 h-14 flex items-center justify-center transition-all">
                <Image 
                  src={brand.image} 
                  alt={brand.name} 
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      
    </div>
  )
}