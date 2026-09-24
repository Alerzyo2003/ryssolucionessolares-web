import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params

  // Consultar un solo producto por su ID en Supabase
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    return (
      <div className="min-h-screen bg-corp-light p-16 text-center">
        <h1 className="text-2xl font-bold text-corp-blue mb-4">Producto no encontrado</h1>
        <Link href="/" className="text-corp-accent underline">Volver al catálogo</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-corp-light py-12 px-6 md:px-16">
        <div className="flex justify-between items-start">
  <h1 className="text-3xl font-extrabold text-[#0F172A] mb-4">{product.name}</h1>
  
  {/* Botón de edición temporal (luego lo puedes ocultar para que solo lo vea el admin) */}
  <Link 
    href={`/admin/editar/${product.id}`}
    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 text-xs font-bold rounded-lg transition-colors"
  >
    ✏️ Editar Producto
  </Link>
</div>
      <div className="max-w-5xl mx-auto">
        
        {/* Botón de retorno */}
        <Link href="/" className="inline-block text-corp-gray hover:text-corp-blue mb-8 font-medium transition-colors">
          ← Volver al catálogo
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
          
          {/* Imagen del producto optimizada 1:1 */}
          <div className="relative aspect-square w-full bg-slate-50 rounded-xl overflow-hidden shadow-xs">
            <Image 
              src={product.image_url || 'https://via.placeholder.com/600'} 
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Información técnica y compra */}
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-xs font-semibold tracking-wider text-corp-accent uppercase bg-blue-50 px-3 py-1 rounded-full">
                Sistema Fotovoltaico
              </span>
              <h1 className="text-3xl font-bold text-corp-blue mt-4 mb-4">
                {product.name}
              </h1>
              <p className="text-corp-gray text-base leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Especificaciones de stock */}
              <div className="border-t border-b border-slate-100 py-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-corp-gray">Disponibilidad:</span>
                  <span className="font-semibold text-corp-blue">
                    {product.stock > 0 ? `${product.stock} unidades en bodega` : 'Agotado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-corp-gray">Garantía del fabricante:</span>
                  <span className="font-semibold text-corp-blue">25 años de eficiencia</span>
                </div>
              </div>
            </div>

            {/* Precio y Botón */}
            <div>
              <div className="text-3xl font-bold text-corp-blue mb-6">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
              </div>
              <div className="flex gap-4">
                <AddToCartButton product={product} />
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}