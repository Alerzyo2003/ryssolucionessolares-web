import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import ScrollReveal from '@/components/ScrollReveal'
import StoreFilterSidebar from '@/components/StoreFilterSidebar'
import StoreSortSelect from '@/components/StoreSortSelect'
import { PackageSearch, Zap } from 'lucide-react'

// Agregamos brand a la interfaz
interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category?: string
  brand?: string 
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TiendaPage({ searchParams }: Props) {
  const resolvedParams = await searchParams
  const currentCategory = (resolvedParams.categoria as string) || 'todos'
  const currentBrand = (resolvedParams.marca as string) || 'todas'
  const minParam = resolvedParams.min ? parseInt(resolvedParams.min as string) : null
  const maxParam = resolvedParams.max ? parseInt(resolvedParams.max as string) : null
  const sortParam = (resolvedParams.orden as string) || 'recientes'

  // 1. Consulta base para extraer dinámicamente precios, categorías y marcas
  const { data: allProductsData } = await supabase
    .from('products')
    .select('*')

  const allProducts = allProductsData || []

  // Calcular precios mínimos y máximos globales
  const prices = allProducts.map(p => Number(p.price))
  const globalMin = prices.length > 0 ? Math.min(...prices) : 0
  const globalMax = prices.length > 0 ? Math.max(...prices) : 10000000

  // Extraer Categorías y Marcas únicas
  const uniqueCategories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  ) as string[]

  const uniqueBrands = Array.from(
    new Set(allProducts.map((p) => p.brand).filter(Boolean))
  ) as string[]

  // 2. Aplicar los filtros de la URL a la consulta de Supabase
  let query = supabase.from('products').select('*')

  if (currentCategory !== 'todos') {
    query = query.ilike('category', `%${currentCategory}%`)
  }
  if (currentBrand !== 'todas') {
    query = query.ilike('brand', currentBrand)
  }
  if (minParam !== null) {
    query = query.gte('price', minParam)
  }
  if (maxParam !== null) {
    query = query.lte('price', maxParam)
  }

  // 3. Aplicar el ordenamiento de la consulta
  if (sortParam === 'precio-asc') {
    query = query.order('price', { ascending: true })
  } else if (sortParam === 'precio-desc') {
    query = query.order('price', { ascending: false })
  } else if (sortParam === 'nombre-asc') {
    query = query.order('name', { ascending: true })
  } else {
    // Por defecto: Más recientes
    query = query.order('created_at', { ascending: false })
  }

  const { data: filteredProductsData } = await query
  const filteredProducts = filteredProductsData || []

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 md:pb-24">
      
      {/* TÍTULO DE LA SECCIÓN */}
      <div className="bg-white border-b border-slate-200 pt-6 md:pt-8 pb-6 md:pb-8 mb-6 md:mb-8">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <ScrollReveal as="slide-right">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2 md:mb-1.5">
              Catálogo de <span className="text-orange-600">Equipos Solares</span>
            </h1>
            <p className="text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
              Configura tu sistema con componentes de grado industrial. Usa los filtros para encontrar exactamente lo que necesitas.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
          
          {/* BARRA LATERAL IZQUIERDA (FILTROS) */}
          <div className="w-full lg:w-1/4 shrink-0">
            <StoreFilterSidebar 
              uniqueCategories={uniqueCategories}
              uniqueBrands={uniqueBrands}
              globalMin={globalMin}
              globalMax={globalMax}
            />
          </div>

          {/* GRILLA DE PRODUCTOS DERECHA */}
          <div className="w-full lg:w-3/4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg md:text-xl font-bold text-[#0F172A]">Resultados</h2>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-auto">
                  <StoreSortSelect />
                </div>
                
                <div className="hidden sm:flex text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 items-center gap-2 shrink-0">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span><span className="font-bold text-[#0F172A]">{filteredProducts.length}</span> equipos</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: Product, index: number) => (
                  <ScrollReveal key={product.id} as="fade-up" delay={(index % 3) * 80}>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-orange-900/5 hover:border-orange-200 transition-all duration-500 flex flex-col justify-between group h-full md:hover:-translate-y-1">
                      
                      <div className="relative aspect-square w-full bg-white overflow-hidden border-b border-slate-50">
                        <Image 
                          src={product.image_url || 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=600&auto=format&fit=crop'} 
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-5 md:p-6 group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/[0.02] transition-colors duration-300 pointer-events-none z-10" />
                        
                        <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md text-[#0F172A] shadow-sm border border-slate-100 text-[9px] md:text-[10px] font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-full uppercase tracking-wider group-hover:-translate-y-0.5 transition-transform duration-300">
                          {product.category || 'Equipo'}
                        </div>

                        {product.brand && (
                          <div className="absolute top-3 right-3 z-20 bg-orange-50/95 backdrop-blur-md text-orange-700 shadow-sm border border-orange-100 text-[9px] md:text-[10px] font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-full uppercase tracking-wider group-hover:-translate-y-0.5 transition-transform duration-300">
                            {product.brand}
                          </div>
                        )}
                      </div>

                      <div className="p-4 md:p-5 flex-grow flex flex-col">
                        <Link href={`/products/${product.id}`} className="block group/link mb-1.5 md:mb-2">
                          <h3 className="text-base md:text-lg font-bold text-[#0F172A] group-hover/link:text-orange-600 transition-colors line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-auto">
                          {product.description}
                        </p>
                      </div>

                      <div className="p-4 md:p-5 pt-3 md:pt-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between group-hover:bg-orange-50/30 transition-colors duration-300">
                        <div>
                          <span className="text-[9px] md:text-[10px] text-slate-400 block font-semibold uppercase tracking-wider mb-0.5">IVA Incluido</span>
                          <span className="text-lg md:text-xl font-black text-[#0F172A]">
                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                          </span>
                        </div>
                        
                        <div className="shrink-0 z-20 relative">
                          <AddToCartButton product={product} />
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))
              ) : (
                <div className="col-span-full py-12 md:py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center px-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-5 text-slate-400">
                    <PackageSearch className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold text-[#0F172A] mb-2">No encontramos equipos</h3>
                  <p className="text-slate-500 text-xs md:text-sm max-w-sm mx-auto mb-5 md:mb-6">
                    Ajusta los filtros de precio, marca o categoría para ver más resultados.
                  </p>
                  <Link href="/tienda" className="w-full sm:w-auto px-6 py-3 md:py-2.5 bg-orange-600 text-white text-sm md:text-base font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-sm">
                    Limpiar todos los filtros
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
