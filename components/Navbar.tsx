'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import CartDrawer from '@/components/CartDrawer'
import { supabase } from '@/lib/supabase'
import { Menu, X, Search } from 'lucide-react'

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

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  const items = useCartStore((state) => state.items)
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  // Estados para el buscador en tiempo real
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setShowResults(false)
    setSearchTerm('')
  }, [pathname])

  // Cerrar el dropdown del buscador si se hace clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar en Supabase mientras el usuario escribe (con un pequeño retraso/debounce de 300ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true)
        setShowResults(true)
        
        const { data } = await supabase
          .from('products')
          .select('id, name, price, image_url')
          .ilike('name', `%${searchTerm.trim()}%`)
          .limit(5) // Mostrar máximo 5 resultados rápidos
          
        setSearchResults(data || [])
        setIsSearching(false)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  // Manejar el submit por defecto (por si presiona Enter en vez de hacer clic)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setShowResults(false)
      setIsMobileMenuOpen(false)
      router.push(`/tienda?q=${encodeURIComponent(searchTerm.trim())}`)
    }
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
      {/* Top Banner with Subtle Slide-Down Entry */}
      <div className="bg-[#0F172A] text-slate-300 text-[10px] md:text-xs py-2 px-5 md:px-8 flex justify-between items-center border-b border-slate-800 animate-fadeIn relative z-[60]">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-orange-400 font-medium inline-block animate-pulse truncate max-w-[200px] md:max-w-none">
            🌱 Energía limpia hoy, un mejor mañana
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/login" className="hover:text-white transition-colors font-medium">
            Mi cuenta
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 md:py-3.5 flex justify-between items-center">
          
          {/* Logo with Smooth Scaling */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none shrink-0">
            <div className="relative w-36 h-8 md:w-48 md:h-11 transition-transform duration-300 group-hover:scale-[1.03]">
              <Image 
                src="/header/imagen-cabezera-app.png" 
                alt="Logo R&S Soluciones Solares" 
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 font-medium text-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'text-orange-600 font-semibold bg-orange-50/70 shadow-xs' 
                      : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {!isActive && (
                    <span className="absolute bottom-1.5 left-4 right-4 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Search, Cart & Mobile Actions */}
          <div className="flex items-center gap-3 md:gap-4" ref={searchRef}>
            
            {/* Buscador Interactivo Flotante (Desktop) */}
            <div className="relative hidden lg:block">
              <form 
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-slate-50/80 rounded-full px-4 py-2 border border-slate-200/80 w-64 focus-within:w-80 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-300 ease-out z-50 relative"
              >
                <button type="submit" className="text-slate-400 hover:text-orange-500 transition-colors mr-2.5 shrink-0">
                  <Search className="w-4 h-4" />
                </button>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchTerm.trim().length >= 2) setShowResults(true) }}
                  placeholder="Buscar equipos..." 
                  className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder-slate-400"
                />
                
                {/* Loader mientras busca */}
                {isSearching && (
                  <div className="absolute right-4 w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                )}
              </form>

              {/* Menú Desplegable de Resultados (Desktop) */}
              {showResults && !isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchResults.length > 0 ? (
                    <div className="max-h-[350px] overflow-y-auto py-2">
                      {searchResults.map((product) => (
                        <div 
                          key={product.id}
                          onClick={() => handleResultClick(product.id)}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <div className="relative w-12 h-12 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0">
                            <Image 
                              src={product.image_url || 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=200&auto=format&fit=crop'}
                              alt={product.name}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-[#0F172A] truncate group-hover:text-orange-600">
                              {product.name}
                            </h4>
                            <p className="text-xs font-semibold text-orange-600 mt-0.5">
                              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
                        className="w-full text-center px-4 py-3 bg-slate-50 text-xs font-bold text-slate-500 hover:text-orange-600 cursor-pointer transition-colors"
                      >
                        Ver todos los resultados
                      </div>
                    </div>
                  ) : (
                    !isSearching && (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm font-medium text-slate-500">No encontramos coincidencias para "<span className="text-[#0F172A] font-bold">{searchTerm}</span>".</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Cart Button (Responsive) */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative group flex items-center gap-1.5 md:gap-2.5 bg-[#0F172A] hover:bg-slate-900 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden shrink-0"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-600/0 via-orange-600/20 to-orange-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <svg className="w-4 h-4 md:w-4 md:h-4 text-orange-400 transition-transform duration-300 group-hover:scale-110 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4.4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              
              <span className="relative flex items-center gap-1.5">
                <span className="hidden md:inline">Carrito</span>
                <span className="hidden md:inline text-slate-400">/</span>
                <span className="text-orange-400 hidden sm:inline">
                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalPrice)}
                </span>
              </span>

              <span className="relative bg-orange-500 text-white text-[10px] md:text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0">
                {totalItems}
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 -mr-1.5 text-slate-600 hover:text-orange-600 transition-colors focus:outline-none shrink-0"
            >
              {isMobileMenuOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-100 shadow-xl ${isMobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-5 flex flex-col gap-4">
            
            {/* Buscador Móvil */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar equipos solares..." 
                  className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder-slate-400"
                />
                {isSearching && <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin shrink-0 ml-2" />}
              </form>

              {/* Resultados de Búsqueda Móvil */}
              {showResults && searchTerm.length >= 2 && (
                <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                  {searchResults.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div 
                          key={product.id}
                          onClick={() => handleResultClick(product.id)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                        >
                          <div className="relative w-10 h-10 rounded-md bg-white border border-slate-100 overflow-hidden shrink-0">
                            <Image src={product.image_url} alt={product.name} fill className="object-contain p-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#0F172A] truncate">{product.name}</h4>
                            <p className="text-[11px] font-semibold text-orange-600 mt-0.5">
                              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !isSearching && (
                      <div className="px-4 py-6 text-center">
                        <p className="text-xs font-medium text-slate-500">No hay resultados para "{searchTerm}"</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Enlaces de Navegación Móvil */}
            <div className="flex flex-col gap-1 mt-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-between ${
                      isActive 
                        ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
                    }`}
                  >
                    {link.label}
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
