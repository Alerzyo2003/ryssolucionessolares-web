'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let active = true

    const verifyAdmin = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.replace('/iniciar-sesion')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (!active) return

        if (profileError || profile?.is_admin !== true) {
          await supabase.auth.signOut()
          router.replace('/iniciar-sesion')
          return
        }

        setAuthorized(true)
      } finally {
        if (active) setChecking(false)
      }
    }

    void verifyAdmin()

    return () => {
      active = false
    }
  }, [router])

  if (checking || !authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
        Verificando acceso...
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/admin" className="text-lg font-black tracking-tight">
            R&S <span className="font-medium text-slate-500">Administración</span>
          </Link>
          <nav aria-label="Administración" className="flex items-center gap-2 text-sm">
            <Link href="/admin" className="rounded-md px-3 py-2 font-semibold hover:bg-slate-100">
              Panel
            </Link>
            <Link href="/admin/new-product" className="rounded-md px-3 py-2 font-semibold hover:bg-slate-100">
              Nuevo producto
            </Link>
            <Link href="/tienda" className="rounded-md px-3 py-2 font-semibold text-slate-500 hover:bg-slate-100">
              Ver tienda
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}