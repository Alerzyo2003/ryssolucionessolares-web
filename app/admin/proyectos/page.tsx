'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ImagePlus, Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Project = {
  id: string
  title: string
  tipo: string | null
  comuna: string | null
  region: string | null
  kwp: string | null
  extra: string | null
  description: string | null
  image_url: string
  inverter_image_url: string | null
  images: string[] | null
  featured: boolean
  published: boolean
  sort_order: number
}

const EMPTY = {
  title: '', tipo: '', comuna: '', region: '', kwp: '', extra: '', description: '',
  featured: false, published: true, sort_order: 0,
}

const BUCKET = 'projects'

/* Convierte cualquier imagen a WebP y la achica si es muy grande */
async function toWebp(file: File, maxSize = 1920, quality = 0.82): Promise<File> {
  // Si no es imagen (o es un GIF animado), se sube tal cual
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    // Si el navegador no soporta WebP o quedó más pesada, usamos la original
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], name, { type: 'image/webp' })
  } catch {
    // Formato que el navegador no puede leer (por ejemplo HEIC en algunos equipos): se sube la original
    return file
  }
}

async function uploadImage(original: File) {
  const file = await toWebp(original)
  const ext = file.type === 'image/webp' ? 'webp' : file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type })
  if (error) throw new Error(`No se pudo subir ${original.name}: ${error.message}`)
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

const input = 'h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-orange-500'
const label = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [inverterFile, setInverterFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [gallery, setGallery] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setProjects((data || []) as Project[])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setMainFile(null); setInverterFile(null); setGalleryFiles([]); setGallery([])
    setShowForm(true)
  }

  const openEdit = (p: Project) => {
    setEditing(p)
    setForm({
      title: p.title, tipo: p.tipo || '', comuna: p.comuna || '', region: p.region || '',
      kwp: p.kwp || '', extra: p.extra || '', description: p.description || '',
      featured: p.featured, published: p.published, sort_order: p.sort_order,
    })
    setMainFile(null); setInverterFile(null); setGalleryFiles([]); setGallery(p.images || [])
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!editing && !mainFile) { setError('Sube la foto principal de la instalación.'); return }

    setSaving(true)
    try {
      const image_url = mainFile ? await uploadImage(mainFile) : editing!.image_url
      const inverter_image_url = inverterFile ? await uploadImage(inverterFile) : editing?.inverter_image_url ?? null
      const newGallery = await Promise.all(galleryFiles.map(uploadImage))

      const payload = {
        ...form,
        tipo: form.tipo || null, comuna: form.comuna || null, region: form.region || null,
        kwp: form.kwp || null, extra: form.extra || null, description: form.description || null,
        sort_order: Number(form.sort_order) || 0,
        image_url, inverter_image_url,
        images: [...gallery, ...newGallery],
      }

      const { error } = editing
        ? await supabase.from('projects').update(payload).eq('id', editing.id)
        : await supabase.from('projects').insert(payload)
      if (error) throw new Error(error.message)

      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p: Project) => {
    if (!window.confirm(`¿Eliminar el proyecto "${p.title}"?`)) return
    const { error } = await supabase.from('projects').delete().eq('id', p.id)
    if (error) setError(error.message)
    else setProjects((list) => list.filter((x) => x.id !== p.id))
  }

  const toggle = async (p: Project, field: 'featured' | 'published') => {
    const { error } = await supabase.from('projects').update({ [field]: !p[field] }).eq('id', p.id)
    if (error) setError(error.message)
    else setProjects((list) => list.map((x) => (x.id === p.id ? { ...x, [field]: !p[field] } : x)))
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-orange-600">
            <ArrowLeft size={14} /> Volver al panel
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Proyectos realizados</h1>
        </div>
        {!showForm && (
          <button onClick={openNew} className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700">
            <Plus size={16} /> Nuevo proyecto
          </button>
        )}
      </div>

      {error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {showForm && (
        <form onSubmit={save} className="mb-10 space-y-5 border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{editing ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
          </div>

          <div>
            <label className={label}>Título *</label>
            <input required className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sistema on-grid 34,72 kWp" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Tipo</label>
              <input className={input} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Vivienda, Comercio, Híbrido…" list="tipos" />
              <datalist id="tipos">
                <option value="Vivienda" /><option value="Comercio" /><option value="Industria" />
                <option value="Híbrido con batería" /><option value="Parcela / cabaña" />
              </datalist>
            </div>
            <div>
              <label className={label}>Comuna</label>
              <input className={input} value={form.comuna} onChange={(e) => setForm({ ...form, comuna: e.target.value })} placeholder="El Bosque" />
            </div>
            <div>
              <label className={label}>Región</label>
              <input className={input} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Región Metropolitana" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Potencia</label>
              <input className={input} value={form.kwp} onChange={(e) => setForm({ ...form, kwp: e.target.value })} placeholder="34,72 kWp" />
            </div>
            <div>
              <label className={label}>Dato extra</label>
              <input className={input} value={form.extra} onChange={(e) => setForm({ ...form, extra: e.target.value })} placeholder="Batería 15,36 kWh" />
            </div>
            <div>
              <label className={label}>Orden (menor = primero)</label>
              <input type="number" className={input} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className={label}>Descripción</label>
            <textarea rows={3} className="w-full border border-slate-300 p-3 text-sm outline-none focus:border-orange-500" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: `Foto de la instalación ${editing ? '' : '*'}`, current: editing?.image_url, file: mainFile, set: setMainFile },
              { title: 'Foto del inversor', current: editing?.inverter_image_url, file: inverterFile, set: setInverterFile },
            ].map((f) => (
              <div key={f.title}>
                <label className={label}>{f.title}</label>
                <label className="flex h-40 cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 hover:border-orange-400">
                  {f.file || f.current ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.file ? URL.createObjectURL(f.file) : f.current!} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-xs text-slate-500"><ImagePlus size={22} /> Elegir imagen</span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => f.set(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            ))}
          </div>

          <div>
            <label className={label}>Fotos adicionales (galería)</label>
            <div className="flex flex-wrap gap-2">
              {gallery.map((url) => (
                <div key={url} className="relative h-20 w-20 overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setGallery((g) => g.filter((x) => x !== url))} className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-red-600"><X size={12} /></button>
                </div>
              ))}
              {galleryFiles.map((file, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden border border-orange-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setGalleryFiles((g) => g.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-red-600"><X size={12} /></button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 hover:border-orange-400">
                <Plus size={20} />
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setGalleryFiles((g) => [...g, ...Array.from(e.target.files || [])])} />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-400">Las fotos se convierten automáticamente a WebP y se achican para que la web cargue rápido.</p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publicado</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Mostrar en la portada</label>
          </div>

          <div className="flex gap-2">
            <button disabled={saving} className="h-10 rounded-md bg-orange-600 px-5 text-sm font-bold text-white hover:bg-orange-500 disabled:opacity-60">
              {saving ? 'Optimizando y subiendo fotos…' : 'Guardar proyecto'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="p-8 text-center text-sm text-slate-500">Cargando proyectos…</p>
      ) : projects.length === 0 ? (
        <p className="border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Aún no hay proyectos. Crea el primero.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className={`overflow-hidden border bg-white shadow-sm ${p.published ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-70'}`}>
              <div className="relative h-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                {p.featured && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white"><Star size={10} /> Portada</span>}
                {!p.published && <span className="absolute right-2 top-2 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white">Borrador</span>}
              </div>
              <div className="p-4">
                <p className="font-bold">{p.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{[p.comuna, p.region].filter(Boolean).join(', ') || 'Sin ubicación'}{p.kwp ? ` · ${p.kwp}` : ''}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-3 text-xs">
                    <button onClick={() => void toggle(p, 'published')} className="font-semibold text-slate-600 hover:text-orange-600">{p.published ? 'Ocultar' : 'Publicar'}</button>
                    <button onClick={() => void toggle(p, 'featured')} className="font-semibold text-slate-600 hover:text-orange-600">{p.featured ? 'Quitar de portada' : 'A portada'}</button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} title="Editar" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"><Pencil size={15} /></button>
                    <button onClick={() => void remove(p)} title="Eliminar" className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}