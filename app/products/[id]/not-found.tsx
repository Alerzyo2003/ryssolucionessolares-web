import Link from 'next/link'
import { PackageSearch } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5 py-20">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
          <PackageSearch className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
          Este producto ya no está disponible
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Puede que haya sido retirado del catálogo o que el enlace esté incompleto. Revisa el
          catálogo para encontrar equipos similares.
        </p>
        <Link
          href="/tienda"
          className="mt-7 inline-block rounded-xl bg-orange-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-700"
        >
          Ir a la tienda
        </Link>
      </div>
    </main>
  )
}