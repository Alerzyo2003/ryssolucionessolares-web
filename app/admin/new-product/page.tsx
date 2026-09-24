'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  
  // Estados para Categoría
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false)

  // Estados para Marca
  const [brand, setBrand] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [isAddingCustomBrand, setIsAddingCustomBrand] = useState(false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const router = useRouter()

  // Manejadores para los selects
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === 'CUSTOM') {
      setIsAddingCustomCategory(true)
      setCategory('')
    } else {
      setIsAddingCustomCategory(false)
      setCategory(val)
      setCustomCategory('')
    }
  }

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === 'CUSTOM') {
      setIsAddingCustomBrand(true)
      setBrand('')
    } else {
      setIsAddingCustomBrand(false)
      setBrand(val)
      setCustomBrand('')
    }
  }

  // Función para comprimir y redimensionar la imagen en el navegador
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Fallo al comprimir la imagen'))
                return
              }
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            },
            'image/jpeg',
            0.82
          )
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Determinar la categoría y marca finales a enviar a la BD
    const finalCategory = isAddingCustomCategory ? customCategory.toUpperCase() : category
    const finalBrand = isAddingCustomBrand ? customBrand : brand

    if (!finalCategory) {
      alert('Por favor, selecciona o ingresa una categoría.')
      setLoading(false)
      return
    }

    if (!finalBrand) {
      alert('Por favor, selecciona o ingresa una marca.')
      setLoading(false)
      return
    }

    let imageUrl = ''

    if (imageFile) {
      try {
        setLoadingText('Optimizando imagen...')
        const optimizedFile = await compressImage(imageFile)

        setLoadingText('Subiendo a Supabase Storage...')
        const fileExt = optimizedFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, optimizedFile)

        if (uploadError) {
          alert('Error al subir la imagen: ' + uploadError.message)
          setLoading(false)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)

        imageUrl = publicUrlData.publicUrl
      } catch (err) {
        alert('Error procesando la imagen.')
        setLoading(false)
        return
      }
    }

    setLoadingText('Guardando producto...')
    
    // Insertar el producto con los valores finales
    const { error } = await supabase.from('products').insert([
      {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: imageUrl,
        category: finalCategory,
        brand: finalBrand
      }
    ])

    setLoading(false)

    if (error) {
      alert('Error al crear el producto: ' + error.message)
    } else {
      alert('¡Producto creado y optimizado con éxito!')
      router.push('/tienda')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Nuevo Producto</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Fila para Categoría y Marca */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            
            {/* CATEGORÍA */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
              <select 
                value={isAddingCustomCategory ? 'CUSTOM' : category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none text-slate-700 mb-2"
                required={!isAddingCustomCategory}
              >
                <option value="">Selecciona...</option>
                <option value="BATERIAS">BATERIAS</option>
                <option value="CABLES">CABLES</option>
                <option value="EQUIPOS SOLARES">EQUIPOS SOLARES</option>
                <option value="INVERSORES">INVERSORES</option>
                <option value="PANELES SOLARES">PANELES SOLARES</option>
                <option value="PERIFERICOS">PERIFERICOS</option>
                <option value="CUSTOM" className="font-bold text-orange-600">+ Añadir nueva...</option>
              </select>

              {/* Input que aparece si elige "Añadir nueva..." */}
              {isAddingCustomCategory && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Plus className="h-4 w-4 text-orange-500" />
                  </div>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Escribe la categoría"
                    className="w-full pl-9 pr-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-700 bg-orange-50/50"
                    required
                  />
                </div>
              )}
            </div>

            {/* MARCA */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Marca</label>
              <select 
                value={isAddingCustomBrand ? 'CUSTOM' : brand}
                onChange={handleBrandChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none text-slate-700 mb-2"
                required={!isAddingCustomBrand}
              >
                <option value="">Selecciona...</option>
                <option value="Nimac">Nimac</option>
                <option value="Narada">Narada</option>
                <option value="Voltronic Power">Voltronic Power</option>
                <option value="Estar Solar">Estar Solar</option>
                <option value="Risen">Risen</option>
                <option value="Dyness">Dyness</option>
                <option value="Sake">Sake</option>
                <option value="Gruntek">Gruntek</option>
                <option value="Victron Energy">Victron Energy</option>
                <option value="Solis">Solis</option>
                <option value="Growatt">Growatt</option>
                <option value="Longi">Longi</option>
                <option value="CUSTOM" className="font-bold text-orange-600">+ Añadir nueva...</option>
              </select>

              {/* Input que aparece si elige "Añadir nueva..." */}
              {isAddingCustomBrand && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Plus className="h-4 w-4 text-orange-500" />
                  </div>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="Escribe la marca"
                    className="w-full pl-9 pr-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-700 bg-orange-50/50"
                    required
                  />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Producto</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej: Kit Solar On-Grid 5kW"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none text-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Descripción Técnica</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Detalle de paneles, inversor y estructuras..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Precio (CLP)</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="1500000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Stock Inicial</label>
              <input 
                type="number" 
                value={stock} 
                onChange={(e) => setStock(e.target.value)}
                required
                placeholder="5"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Imagen del Producto</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0])
                }
              }}
              required
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0F172A] file:text-white hover:file:bg-slate-800 transition-colors cursor-pointer"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-3 rounded-lg font-bold transition-colors mt-4 shadow-md disabled:opacity-50"
          >
            {loading ? loadingText : 'Publicar Producto'}
          </button>
        </form>
      </div>
    </main>
  )
}