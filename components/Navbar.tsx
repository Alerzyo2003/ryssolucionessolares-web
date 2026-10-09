'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabase'
import { CART_LANDED_EVENT } from '@/lib/flyToCart'
import { Menu, X, Search, ShoppingBag, UserRound, ChevronRight, ArrowRight, Phone, MessageCircle } from 'lucide-react'

/*
  Colores tomados del logo:
  - Azul marino del texto "R & S SOLUCIONES": #0B3A63
  - Naranjo de "SOLARES":                      #FF6200
  - Amarillo de los cuadrados:                  #FDBA2D
*/

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/acerca', label: 'Acerca de' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/calculadora', label: 'Calculadora' },
  { href: '/contacto', label: 'Contacto' },
]

const PHONE_DISPLAY = '+56 9 9136 3439'
const PHONE_TEL = '+56991363439'
const WHATSAPP_URL = `https://wa.me/56991363439?text=${encodeURIComponent('Hola, quiero cotizar un sistema solar')}`

interface SearchResult {
  id: string
  name: string
  price: number
  image_url: string
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=200&auto=format&fit=crop'

const formatCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value)

function Results({
  results, loading, term, onPick, onAll,
}: { results: SearchResult[]; loading: boolean; term: string; onPick: (id: string) => void; onAll: () => void }) {
  if (results.length === 0) {
    return loading ? null : (
      <p className="px-4 py-6 text-center text-sm text-slate-500">
        No encontramos resultados para <span className="font-semibold text-slate-800">&ldquo;{term}&rdquo;</span>
      </p>
    )
  }
  return (
    <div className="max-h-80 overflow-y-auto py-1">
      {results.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPick(p.id)}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
        >
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">
            <Image src={p.image_url || FALLBACK_IMG} alt="" fill sizes="44px" className="object-contain p-1" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[#0B3A63]">{p.name}</span>
            <span className="block text-xs font-semibold text-[#FF6200]">{formatCLP(p.price)}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
        </button>
      ))}
      <button
        type="button"
        onClick={onAll}
        className="mt-1 w-full border-t border-slate-100 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-600 transition-colors hover:bg-orange-50 hover:text-[#FF6200]"
      >
        Ver todos los resultados
      </button>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((a, i) => a + i.quantity, 0)
  const totalPrice = items.reduce((a, i) => a + i.price * i.quantity, 0)
  const [cartBump, setCartBump] = useState(false)

  const [term, setTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  useEffect(() => {
    setOpen(false)
    setShowResults(false)
    setTerm('')
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setShowResults(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey) }
  }, [open])

  useEffect(() => {
    let timer: number | undefined
    const onLanded = () => {
      setCartBump(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setCartBump(false), 500)
    }
    window.addEventListener(CART_LANDED_EVENT, onLanded)
    return () => { window.removeEventListener(CART_LANDED_EVENT, onLanded); window.clearTimeout(timer) }
  }, [])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setShowResults(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    const id = setTimeout(async () => {
      const q = term.trim().replace(/[%_,()]/g, ' ')
      if (q.length >= 2) {
        setSearching(true)
        setShowResults(true)
        const { data } = await supabase.from('products').select('id, name, price, image_url').ilike('name', `%${q}%`).limit(5)
        setResults(data || [])
        setSearching(false)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)
    return () => clearTimeout(id)
  }, [term])

  const goToSearch = () => {
    const q = term.trim()
    if (!q) return
    setShowResults(false)
    setOpen(false)
    router.push(`/tienda?q=${encodeURIComponent(q)}`)
  }
  const pick = (id: string) => {
    setShowResults(false)
    setTerm('')
    setOpen(false)
    router.push(`/products/${id}`)
  }
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); goToSearch() }

  return (
    <>
      {/* Barra superior con los colores del logo */}
      <div className="bg-[#0B3A63] text-blue-100">
        <div className="mx-auto flex h-9 max-w-[1500px] items-center justify-between gap-4 px-4 text-xs sm:px-6 lg:px-8">
          <p className="truncate">
            <span className="mr-2 inline-block h-2 w-2 rounded-[2px] bg-[#FDBA2D] align-middle" />
            Cotización sin costo para hogares y empresas.{' '}
            <Link href="/contacto" className="font-semibold text-[#FDBA2D] underline-offset-4 hover:underline">
              Pide la tuya
            </Link>
          </p>
          <div className="flex shrink-0 items-center gap-5">
            <a href={`tel:${PHONE_TEL}`} className="hidden items-center gap-1.5 font-medium transition-colors hover:text-white sm:flex">
              <Phone className="h-3.5 w-3.5 text-[#FDBA2D]" /> {PHONE_DISPLAY}
            </a>
            <Link href="/iniciar-sesion" className="flex items-center gap-1.5 font-medium transition-colors hover:text-white">
              <UserRound className="h-3.5 w-3.5 text-[#FDBA2D]" /> Mi cuenta
            </Link>
          </div>
        </div>
      </div>

      {/* Navbar principal */}
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_10px_30px_-18px_rgba(11,58,99,0.5)]' : ''
        }`}
      >
        {/* Línea de marca: amarillo → naranjo → azul, como el logo */}
        <div aria-hidden className="h-[3px] bg-gradient-to-r from-[#FDBA2D] via-[#FF6200] to-[#0B3A63]" />

        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center gap-4 transition-all duration-300 ${scrolled ? 'h-[68px]' : 'h-[88px]'}`}>
            {/* Logo a la izquierda, más grande y protagonista */}
            <Link
              href="/"
              aria-label="R&S Soluciones Solares, ir al inicio"
              className="mr-auto shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6200] xl:mr-6"
            >
              <span
                className={`relative block transition-all duration-300 ${
                  scrolled ? 'h-12 w-[150px] sm:w-[170px]' : 'h-16 w-[180px] sm:w-[220px]'
                }`}
              >
                <Image
                  src="/header/imagen-cabezera-app.png"
                  alt="R&S Soluciones Solares"
                  fill
                  priority
                  sizes="220px"
                  className="object-contain object-left"
                />
              </span>
            </Link>

            {/* Enlaces escritorio */}
            <nav aria-label="Principal" className="hidden flex-1 items-center justify-center xl:flex">
              <ul className="flex items-center gap-0.5">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive(l.href) ? 'page' : undefined}
                      className={`group relative block rounded-lg px-3.5 py-2 text-[15px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6200] ${
                        isActive(l.href) ? 'text-[#FF6200]' : 'text-[#0B3A63] hover:text-[#FF6200]'
                      }`}
                    >
                      {l.label}
                      <span
                        className={`absolute inset-x-3.5 -bottom-0.5 h-[3px] origin-left rounded-full bg-gradient-to-r from-[#FDBA2D] to-[#FF6200] transition-transform duration-300 ${
                          isActive(l.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Acciones */}
            <div className="flex items-center gap-2.5">
              <div className="relative hidden xl:block" ref={searchRef}>
                <form
                  onSubmit={onSubmit}
                  role="search"
                  className="flex w-44 items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 transition-all duration-300 focus-within:w-60 focus-within:border-[#FF6200] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FF6200]/10 2xl:w-52 2xl:focus-within:w-72"
                >
                  <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" strokeWidth={2.2} />
                  <input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onFocus={() => term.trim().length >= 2 && setShowResults(true)}
                    placeholder="Buscar equipos"
                    aria-label="Buscar equipos"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  {searching && <span className="ml-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#FF6200] border-t-transparent" />}
                </form>
                {showResults && !open && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
                    <Results results={results} loading={searching} term={term} onPick={pick} onAll={goToSearch} />
                  </div>
                )}
              </div>

              <Link
                href="/cart"
                data-cart-target
                aria-label={`Abrir carrito, ${totalItems} productos`}
                className={`group flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-[#0B3A63] transition hover:border-[#FF6200]/40 hover:bg-orange-50 ${cartBump ? 'cart-bump' : ''}`}
              >
                <ShoppingBag className="h-[18px] w-[18px] text-[#FF6200]" />
                <span className="hidden text-sm font-semibold tabular-nums 2xl:inline">{formatCLP(totalPrice)}</span>
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6200] px-1 text-[11px] font-bold text-white ${cartBump ? 'cart-pop' : ''}`}>
                  {totalItems}
                </span>
              </Link>

              {/* CTA naranjo, como "SOLARES" del logo */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden h-11 items-center gap-2 rounded-full bg-[#FF6200] px-5 text-sm font-bold text-white shadow-md shadow-orange-500/30 transition hover:bg-[#0B3A63] hover:shadow-blue-900/30 active:scale-[.98] xl:inline-flex"
              >
                Cotizar gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={open}
                aria-controls="menu-movil"
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition xl:hidden ${
                  open ? 'border-[#FF6200]/30 bg-orange-50 text-[#FF6200]' : 'border-slate-200 text-[#0B3A63] hover:bg-slate-50'
                }`}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Panel móvil / tablet */}
        <div
          id="menu-movil"
          className={`absolute inset-x-0 top-full overflow-y-auto border-t border-slate-200 bg-white transition-all duration-300 xl:hidden ${
            open ? 'visible max-h-[calc(100dvh-88px)] opacity-100' : 'invisible max-h-0 opacity-0'
          }`}
        >
          <div className="mx-auto max-w-3xl space-y-5 px-4 pb-8 pt-5 sm:px-6">
            <div>
              <form onSubmit={onSubmit} role="search" className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#FF6200] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FF6200]/10">
                <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Buscar equipos solares"
                  aria-label="Buscar equipos"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                {searching && <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-[#FF6200] border-t-transparent" />}
              </form>
              {open && showResults && term.length >= 2 && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  <Results results={results} loading={searching} term={term} onPick={pick} onAll={goToSearch} />
                </div>
              )}
            </div>

            <ul className="divide-y divide-slate-100">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? 'page' : undefined}
                    className={`flex items-center justify-between py-4 text-lg font-bold transition-colors ${isActive(l.href) ? 'text-[#FF6200]' : 'text-[#0B3A63] hover:text-[#FF6200]'}`}
                  >
                    {l.label}
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="grid gap-3 sm:grid-cols-2">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-[#FF6200] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500">
                <MessageCircle className="h-4 w-4" /> Cotizar por WhatsApp
              </a>
              <a href={`tel:${PHONE_TEL}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#0B3A63] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0B3A63]/90">
                <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
              </a>
              <Link href="/iniciar-sesion" className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-[#0B3A63] transition hover:bg-slate-50 sm:col-span-2">
                <UserRound className="h-4 w-4 text-[#FF6200]" /> Mi cuenta
              </Link>
            </div>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes cart-bump { 0%,100% { transform: translateY(0) scale(1) } 35% { transform: translateY(-2px) scale(1.12) } 70% { transform: translateY(0) scale(.97) } }
              @keyframes cart-pop { 0% { transform: scale(1) } 40% { transform: scale(1.6) } 100% { transform: scale(1) } }
              .cart-bump { animation: cart-bump .45s ease-out }
              .cart-pop { animation: cart-pop .45s ease-out }
              @media (prefers-reduced-motion: reduce) { .cart-bump, .cart-pop { animation: none } }
            `,
          }}
        />
      </header>
    </>
  )
}