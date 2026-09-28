'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Package, PackagePlus, Pencil, RefreshCw, Search, ShoppingBag, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Product = {
  id: string | number
  name: string
  category: string | null
  brand: string | null
  price: number
  stock: number | null
}

type OrderItem = {
  id: string
  name: string
  quantity: number
  unit_price: number
}

type Order = {
  id: string
  created_at: string
  provider: 'mercadopago' | 'webpay' | 'unknown'
  provider_reference: string | null
  customer_email: string | null
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'unknown'
  amount: number
  items: OrderItem[]
}

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  failed: 'Rechazada',
  cancelled: 'Anulada',
  unknown: 'Sin datos',
}

async function fetchAdminOverview(ordersOnly = false) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) throw new Error('La sesión administrativa expiró. Inicia sesión otra vez.')

  const endpoint = ordersOnly ? '/api/admin/overview?scope=orders' : '/api/admin/overview'
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  })
  const result = await response.json()

  if (!response.ok) throw new Error(result.error || 'No se pudieron cargar los datos del panel.')
  return result as { products: Product[]; orders: Order[] }
}

export default function AdminDashboardPage() {
  const [view, setView] = useState<'products' | 'orders'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [productError, setProductError] = useState('')
  const [orderError, setOrderError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      setLoading(true)
      try {
        const result = await fetchAdminOverview()
        if (!active) return
        setProducts(result.products)
        setOrders(result.orders)
        setProductError('')
        setOrderError('')
      } catch (error) {
        if (!active) return
        const message = error instanceof Error ? error.message : 'Error desconocido.'
        setProductError(message)
        setOrderError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [refreshKey])

  useEffect(() => {
    if (view !== 'orders') return

    let active = true
    const loadOrders = async () => {
      try {
        const result = await fetchAdminOverview(true)
        if (!active) return
        setOrders(result.orders)
        setOrderError('')
      } catch (error) {
        if (!active) return
        setOrderError(error instanceof Error ? error.message : 'No se pudieron cargar las compras.')
      }
    }

    const refreshOrders = () => void loadOrders()
    refreshOrders()
    const intervalId = window.setInterval(refreshOrders, 15_000)
    window.addEventListener('focus', refreshOrders)

    return () => {
      active = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshOrders)
    }
  }, [view])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es-CL')
    if (!term) return products

    return products.filter((product) =>
      [product.name, product.category, product.brand]
        .some((value) => value?.toLocaleLowerCase('es-CL').includes(term))
    )
  }, [products, search])

  const paidTotal = orders
    .filter((order) => order.status === 'paid')
    .reduce((total, order) => total + Number(order.amount), 0)

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return

    setActionError('')
    const { error } = await supabase.from('products').delete().eq('id', product.id)

    if (error) {
      setActionError(`No se pudo eliminar ${product.name}: ${error.message}`)
      return
    }

    setProducts((current) => current.filter((item) => item.id !== product.id))
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-orange-600">Administración</p>
          <h1 className="text-3xl font-black tracking-tight">Panel de control</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Actualizar
          </button>
          <Link
            href="/admin/new-product"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700"
          >
            <PackagePlus size={16} /> Crear producto
          </Link>
        </div>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-3" aria-label="Resumen">
        <div className="border-l-4 border-orange-500 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Productos</p>
          <p className="mt-2 text-2xl font-black">{products.length}</p>
        </div>
        <div className="border-l-4 border-amber-500 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Órdenes recibidas</p>
          <p className="mt-2 text-2xl font-black">{orders.length}</p>
        </div>
        <div className="border-l-4 border-emerald-600 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ventas pagadas</p>
          <p className="mt-2 text-2xl font-black">{formatPrice(paidTotal)}</p>
        </div>
      </section>

      <div className="mb-4 flex gap-1 border-b border-slate-300" role="tablist" aria-label="Secciones del panel">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'products'}
          onClick={() => setView('products')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${view === 'products' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <Package size={16} /> Productos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'orders'}
          onClick={() => setView('orders')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${view === 'orders' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <ShoppingBag size={16} /> Compras
        </button>
      </div>

      {actionError && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}

      {view === 'products' ? (
        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm" aria-label="Productos">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <h2 className="font-bold">Catálogo de productos</h2>
            <label className="relative block w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto, marca o categoría"
                className="h-10 w-full border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
              />
            </label>
          </div>
          {productError && <p role="alert" className="m-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">Error al cargar productos: {productError}</p>}
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">Cargando productos...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">No hay productos que coincidan con la búsqueda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Categoría / marca</th>
                    <th className="px-4 py-3 text-right">Precio</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4 font-semibold">{product.name}</td>
                      <td className="px-4 py-4 text-slate-600">{product.category || '—'}{product.brand ? ` · ${product.brand}` : ''}</td>
                      <td className="px-4 py-4 text-right tabular-nums">{formatPrice(Number(product.price))}</td>
                      <td className="px-4 py-4 text-right tabular-nums">{product.stock ?? '—'}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/editar/${product.id}`}
                            aria-label={`Editar ${product.name}`}
                            title="Editar producto"
                            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleDelete(product)}
                            aria-label={`Eliminar ${product.name}`}
                            title="Eliminar producto"
                            className="flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm" aria-label="Compras">
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-bold">Órdenes de compra</h2>
            <p className="mt-1 text-xs text-slate-500">Los datos de pago se registran desde esta implementación en adelante.</p>
          </div>
          {orderError ? (
            <p role="alert" className="m-4 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              No se pudieron cargar las órdenes. Aplica la migración SQL del proyecto en Supabase y vuelve a actualizar. Detalle: {orderError}
            </p>
          ) : loading ? (
            <p className="p-8 text-center text-sm text-slate-500">Cargando compras...</p>
          ) : orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">Todavía no hay órdenes registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Orden / fecha</th>
                    <th className="px-4 py-3">Correo cliente</th>
                    <th className="px-4 py-3">Productos</th>
                    <th className="px-4 py-3">Medio</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold">{order.provider_reference || order.id.slice(0, 8)}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(order.created_at).toLocaleString('es-CL')}</p>
                      </td>
                      <td className="px-4 py-4">{order.customer_email || '—'}</td>
                      <td className="px-4 py-4 text-slate-600">
                        {(order.items ?? []).map((item) => `${item.quantity} × ${item.name}`).join(', ') || 'Sin detalle'}
                      </td>
                      <td className="px-4 py-4">{order.provider === 'mercadopago' ? 'Mercado Pago' : order.provider === 'webpay' ? 'Webpay' : 'Sin datos'}</td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums">{formatPrice(Number(order.amount))}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${order.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  )
}