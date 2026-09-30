'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabase'
import { CART_LANDED_EVENT } from '@/lib/flyToCart'
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  UserRound,
  ChevronRight,
} from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/acerca', label: 'Acerca de' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/calculadora', label: 'Calculadora de gastos' },
]

interface SearchResult {
  id: string
  name: string
  price: number
  image_url: string
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=200&auto=format&fit=crop'

const formatCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const items = useCartStore((state) => state.items)
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  // Animación del carrito cuando aterriza un producto
  const [cartBump, setCartBump] = useState(false)

  // Estados para el buscador en tiempo real
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setShowResults(false)
    setSearchTerm('')
  }, [pathname])

  // Rebote del carrito cuando la imagen del producto llega (evento de flyToCart)
  useEffect(() => {
    let timer: number | undefined

    const onLanded = () => {
      setCartBump(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setCartBump(false), 500)
    }

    window.addEventListener(CART_LANDED_EVENT, onLanded)
    return () => {
      window.removeEventListener(CART_LANDED_EVENT, onLanded)
      window.clearTimeout(timer)
    }
  }, [])

  // Cerrar el dropdown del buscador si se hace clic afuera (escritorio y móvil)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const insideDesktop = searchRef.current?.contains(target)
      const insideMobile = mobileSearchRef.current?.contains(target)

      if (!insideDesktop && !insideMobile) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar en Supabase mientras el usuario escribe (debounce 300ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const term = searchTerm.trim().replace(/[%_,()]/g, ' ')

      if (term.length >= 2) {
        setIsSearching(true)
        setShowResults(true)

        const { data } = await supabase
          .from('products')
          .select('id, name, price, image_url')
          .ilike('name', `%${term}%`)
          .limit(5)

        setSearchResults(data || [])
        setIsSearching(false)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  // Ir a la tienda con el término de búsqueda
  const goToSearch = () => {
    const term = searchTerm.trim()
    if (!term) return

    setShowResults(false)
    setIsMobileMenuOpen(false)
    router.push(`/tienda?q=${encodeURIComponent(term)}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goToSearch()
  }

  // Al hacer clic en un producto del buscador
  const handleResultClick = (id: string) => {
    setShowResults(false)
    setSearchTerm('')
    setIsMobileMenuOpen(false)
    router.push(`/products/${id}`)
  }

  return (
    <>
      {/* Barra superior */}
      <div className="relative z-[60] overflow-hidden bg-[#08111f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(249,115,22,0.14),transparent_28%),radial-gradient(circle_at_90%_50%,rgba(59,130,246,0.10),transparent_25%)]" />

        <div className="relative mx-auto flex min-h-9 max-w-[1500px] items-center justify-between gap-3 px-4 py-1.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 text-[10px] font-medium text-slate-300 sm:text-[11px]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 ring-1 ring-orange-400/20">
              <span className="text-[10px]">✦</span>
            </span>
            <span className="truncate">
              Energía limpia hoy, un mejor mañana
            </span>
          </div>

          <Link
            href="/iniciar-sesion"
            className="group flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white sm:text-[11px]"
          >
            <UserRound className="h-3.5 w-3.5 text-orange-400 transition-transform duration-200 group-hover:scale-110" />
            <span>Mi cuenta</span>
          </Link>
        </div>
      </div>

      {/* Navbar principal */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
        <div className="mx-auto max-w-[1500px] px-3 sm:px-5 lg:px-8">
          <div className="flex min-h-[68px] items-center justify-between gap-3 lg:min-h-[78px]">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Ir al inicio"
              className="group flex shrink-0 items-center rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
            >
              <div className="relative h-9 w-36 transition-transform duration-300 group-hover:scale-[1.02] sm:h-10 sm:w-40 lg:h-11 lg:w-48">
                <Image
                  src="/header/imagen-cabezera-app.png"
                  alt="Logo R&S Soluciones Solares"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
            </Link>

            {/* Navegación escritorio */}
            <div className="hidden xl:flex flex-1 items-center justify-center">
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-1.5 shadow-inner">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group relative flex items-center rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-250 ${
                        isActive
                          ? 'bg-white text-orange-600 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.30)] ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:bg-white/80 hover:text-slate-950'
                      }`}
                    >
                      <span>{link.label}</span>

                      {isActive && (
                        <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-orange-500" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              {/* Buscador escritorio */}
              <div className="relative hidden lg:block" ref={searchRef}>
                <form
                  onSubmit={handleSearchSubmit}
                  className="group flex w-48 items-center rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 transition-all duration-300 focus-within:w-64 focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-[0_8px_24px_-16px_rgba(249,115,22,0.45)] focus-within:ring-4 focus-within:ring-orange-500/10"
                >
                  <button
                    type="submit"
                    aria-label="Buscar"
                    className="mr-2 shrink-0 text-slate-400 transition-colors hover:text-orange-500"
                  >
                    <Search className="h-4 w-4" strokeWidth={2.2} />
                  </button>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      if (searchTerm.trim().length >= 2) setShowResults(true)
                    }}
                    placeholder="Buscar equipos..."
                    className="w-full bg-transparent text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    aria-label="Buscar equipos"
                  />

                  {isSearching && (
                    <div className="ml-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                  )}
                </form>

                {/* Resultados escritorio */}
                {showResults && !isMobileMenuOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]">
                    {searchResults.length > 0 ? (
                      <div className="max-h-[350px] overflow-y-auto py-2">
                        {searchResults.map((product) => (
                          <button
                            type="button"
                            key={product.id}
                            onClick={() => handleResultClick(product.id)}
                            className="flex w-full items-center gap-3 border-b border-slate-100 px-3.5 py-3 text-left transition-colors last:border-0 hover:bg-slate-50"
                          >
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
                              <Image
                                src={product.image_url || FALLBACK_IMG}
                                alt={product.name}
                                fill
                                sizes="44px"
                                className="object-contain p-1"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-[13px] font-bold text-slate-900">
                                {product.name}
                              </h4>
                              <p className="mt-0.5 text-xs font-bold text-orange-600">
                                {formatCLP(product.price)}
                              </p>
                            </div>

                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={goToSearch}
                          className="w-full bg-slate-50 px-4 py-3 text-center text-[11px] font-bold text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
                        >
                          Ver todos los resultados
                        </button>
                      </div>
                    ) : (
                      !isSearching && (
                        <div className="px-4 py-7 text-center">
                          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                            <Search className="h-4 w-4 text-slate-400" />
                          </div>
                          <p className="text-xs font-medium text-slate-500">
                            No encontramos coincidencias para{' '}
                            <span className="font-bold text-slate-800">
                              &ldquo;{searchTerm}&rdquo;
                            </span>
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Carrito (destino de la animación de "añadir") */}
              <Link
                href="/cart"
                data-cart-target
                aria-label={`Abrir carrito. ${totalItems} productos`}
                className={`group relative flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3 text-white shadow-[0_8px_20px_-12px_rgba(15,23,42,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_14px_28px_-14px_rgba(15,23,42,0.6)] active:translate-y-0 sm:h-11 sm:px-4 lg:rounded-2xl ${
                  cartBump ? 'cart-bump' : ''
                }`}
              >
                <span className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500/0 via-orange-500/15 to-orange-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:rounded-2xl" />

                <ShoppingBag className="relative h-4 w-4 text-orange-400 transition-transform duration-300 group-hover:scale-110 sm:h-[17px] sm:w-[17px]" />

                <span className="relative hidden 2xl:flex items-center gap-2 text-xs font-semibold">
                  <span>Carrito</span>
                  <span className="h-3.5 w-px bg-white/10" />
                  <span className="text-orange-300">{formatCLP(totalPrice)}</span>
                </span>

                <span
                  className={`relative flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-extrabold text-white shadow-sm ${
                    cartBump ? 'cart-pop' : ''
                  }`}
                >
                  {totalItems}
                </span>
              </Link>

              {/* Menú móvil/tablet */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMobileMenuOpen}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 lg:h-11 lg:w-11 lg:rounded-2xl ${
                  isMobileMenuOpen
                    ? 'border-orange-200 bg-orange-50 text-orange-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" strokeWidth={2.4} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={2.4} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil / tablet */}
        <div
          className={`overflow-hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out ${
            isMobileMenuOpen
              ? 'max-h-[85vh] opacity-100 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.45)]'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mx-auto max-w-[1500px] px-4 pb-5 pt-4 sm:px-6 lg:px-8">
            {/* Cuenta */}
            <Link
              href="/iniciar-sesion"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mb-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-colors hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-orange-400">
                  <UserRound className="h-4 w-4" />
                </span>

                <div>
                  <p className="text-sm font-bold text-slate-900">Mi cuenta</p>
                  <p className="text-[11px] text-slate-500">
                    Accede a tu cuenta
                  </p>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            {/* Buscador móvil */}
            <div className="relative mb-4" ref={mobileSearchRef}>
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10"
              >
                <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar equipos solares..."
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  aria-label="Buscar equipos"
                />

                {isSearching && (
                  <div className="ml-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                )}
              </form>

              {/* Resultados móvil */}
              {showResults && searchTerm.length >= 2 && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  {searchResults.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          type="button"
                          key={product.id}
                          onClick={() => handleResultClick(product.id)}
                          className="flex w-full items-center gap-3 border-b border-slate-100 px-3.5 py-3 text-left last:border-0 hover:bg-slate-50"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
                            <Image
                              src={product.image_url || FALLBACK_IMG}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-contain p-1"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-xs font-bold text-slate-900">
                              {product.name}
                            </h4>
                            <p className="mt-0.5 text-[11px] font-bold text-orange-600">
                              {formatCLP(product.price)}
                            </p>
                          </div>

                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={goToSearch}
                        className="w-full bg-slate-50 px-4 py-3 text-center text-[11px] font-bold text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
                      >
                        Ver todos los resultados
                      </button>
                    </div>
                  ) : (
                    !isSearching && (
                      <div className="px-4 py-6 text-center">
                        <p className="text-xs font-medium text-slate-500">
                          No hay resultados para &ldquo;{searchTerm}&rdquo;
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="grid gap-1.5 sm:grid-cols-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'border-orange-100 bg-orange-50 text-orange-600 shadow-sm'
                        : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full transition-colors ${
                          isActive
                            ? 'bg-orange-500'
                            : 'bg-slate-300 group-hover:bg-orange-400'
                        }`}
                      />
                      {link.label}
                    </span>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 ${
                        isActive ? 'text-orange-400' : 'text-slate-300'
                      }`}
                    />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Animaciones del carrito */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes cart-bump {
                0%, 100% { transform: translateY(0) scale(1); }
                35% { transform: translateY(-2px) scale(1.12); }
                70% { transform: translateY(0) scale(0.97); }
              }
              @keyframes cart-pop {
                0% { transform: scale(1); }
                40% { transform: scale(1.6); }
                100% { transform: scale(1); }
              }
              .cart-bump { animation: cart-bump 0.45s ease-out; }
              .cart-pop { animation: cart-pop 0.45s ease-out; }
              @media (prefers-reduced-motion: reduce) {
                .cart-bump, .cart-pop { animation: none; }
              }
            `,
          }}
        />
      </nav>
    </>
  )
}