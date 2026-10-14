"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let active = true

    const redirectAuthenticatedAdmin = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        if (active) setCheckingSession(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!active) return

      if (!profileError && profile?.is_admin === true) {
        router.replace('/admin')
      } else {
        setCheckingSession(false)
      }
    }

    void redirectAuthenticatedAdmin()

    return () => {
      active = false
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciales incorrectas o usuario no encontrado.')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single()

    if (profile?.is_admin) {
      router.push('/admin')
    } else {
      setError('No tienes permisos de administrador.')
      await supabase.auth.signOut()
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-corp-light p-6 text-sm font-medium text-corp-gray">
        Verificando sesión...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-corp-light flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
        <h1 className="text-2xl font-bold text-corp-blue mb-6 text-center">Acceso Administrador</h1>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-corp-gray mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-corp-blue focus:outline-none focus:border-corp-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-corp-gray mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-corp-blue focus:outline-none focus:border-corp-accent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-corp-accent hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  )
}