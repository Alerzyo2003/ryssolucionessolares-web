'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false) // Estado para el botón de eliminar
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: '',
    category: ''
  })

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          stock: data.stock || 0,
          image_url: data.image_url || '',
          category: data.category || ''
        })
      } else if (error) {
        alert('Error al cargar el producto: ' + error.message)
      }
      setLoading(false)
    }

    fetchProduct()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    let finalImageUrl = formData.image_url

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, imageFile)

      if (uploadError) {
        alert('Error al subir la imagen a Supabase: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      finalImageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        image_url: finalImageUrl,
        category: formData.category
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      alert('Error al actualizar el producto: ' + error.message)
    } else {
      alert('Producto actualizado con éxito')
      router.push('/tienda') 
      router.refresh() 
    }
  }

  // Nueva función para eliminar el producto
  const handleDelete = async () => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.")
    
    if (!confirmDelete) return;

    setIsDeleting(true)

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    setIsDeleting(false)

    if (error) {
      alert('Error al eliminar el producto: ' + error.message)
    } else {
      alert('Producto eliminado con éxito')
      router.push('/tienda')
      router.refresh()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-600">Cargando producto...</div>

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-[#0F172A] mb-6">Editar Producto</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Producto</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
            <select 
              name="category" value={formData.category} onChange={handleChange} required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none"
            >
              <option value="">Selecciona una categoría...</option>
              <option value="BATERIAS">BATERIAS</option>
              <option value="CABLES">CABLES</option>
              <option value="EQUIPOS SOLARES">EQUIPOS SOLARES</option>
              <option value="INVERSORES">INVERSORES</option>
              <option value="PANELES SOLARES">PANELES SOLARES</option>
              <option value="PERIFERICOS">PERIFERICOS</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Precio (CLP)</label>
              <input 
                type="number" name="price" value={formData.price} onChange={handleChange} required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Stock Disponible</label>
              <input 
                type="number" name="stock" value={formData.stock} onChange={handleChange} required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block text-sm font-bold text-slate-700 mb-4">Fotografía del Producto</label>
            
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300 bg-white flex-shrink-0">
                {(imageFile || formData.image_url) ? (
                  <Image 
                    src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} 
                    alt="Vista previa" 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center p-2">Sin imagen</div>
                )}
              </div>

              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#0F172A] file:text-white
                    hover:file:bg-slate-800 transition-colors cursor-pointer"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Si no seleccionas un archivo, se mantendrá la fotografía actual.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange} rows={4} required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F172A] focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center border-t border-slate-200 pt-6">
            {/* Botón de eliminar alineado a la izquierda */}
            <button 
              type="button" 
              onClick={handleDelete} 
              disabled={isDeleting || saving}
              className="px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar Producto'}
            </button>

            {/* Botones de guardar y cancelar alineados a la derecha */}
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => router.back()} 
                disabled={isDeleting || saving}
                className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving || isDeleting} 
                className="px-6 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-lg disabled:opacity-50 transition-colors shadow-md"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}