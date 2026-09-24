'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function StoreSortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentSort = searchParams.get('orden') || 'recientes'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value === 'recientes') {
      params.delete('orden')
    } else {
      params.set('orden', e.target.value)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <select 
      value={currentSort}
      onChange={handleChange}
      className="text-sm font-medium text-slate-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] bg-[length:1.25em_1.25em] transition-all hover:border-slate-300"
    >
      <option value="recientes">Más recientes</option>
      <option value="precio-asc">Precio: Menor a Mayor</option>
      <option value="precio-desc">Precio: Mayor a Menor</option>
      <option value="nombre-asc">Nombre: A - Z</option>
    </select>
  )
}