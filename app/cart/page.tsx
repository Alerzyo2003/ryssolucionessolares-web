'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Package, CreditCard, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import MercadoPagoButton from '@/components/MercadoPagoButton'
import WebpayButton from '@/components/WebpayButton'

export default function CartPage() {
  const items = useCartStore((state) => state.items)

  const totalAmount = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 px-4 py-10 sm:px-6 lg:px-8">

      {/* Fondo decorativo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.15,
                type: 'spring',
                stiffness: 180,
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
            >
              <ShoppingCart size={23} strokeWidth={2.2} />
            </motion.div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Tu carrito
              </h1>

              <p className="text-sm text-slate-500">
                Revisa tus productos antes de continuar
              </p>
            </div>
          </div>
        </motion.div>

        {items.length === 0 ? (

          /* CARRITO VACÍO */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/40 sm:p-16"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                type: 'spring',
              }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-cyan-50"
            >
              <ShoppingCart
                size={40}
                className="text-cyan-600"
                strokeWidth={1.8}
              />
            </motion.div>

            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Tu carrito está vacío
            </h2>

            <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">
              Aún no has agregado productos. Cuando agregues una prestación o
              producto, aparecerá aquí.
            </p>
          </motion.div>

        ) : (

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* PRODUCTOS */}
            <motion.section
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 sm:p-7"
            >

              {/* Cabecera */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Productos seleccionados
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {items.length}{' '}
                    {items.length === 1 ? 'producto' : 'productos'} en tu carrito
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Package size={19} />
                </div>
              </div>

              {/* Lista */}
              <div className="space-y-3">

                {items.map((item: any, index: number) => (

                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.15 + index * 0.08,
                    }}
                    whileHover={{
                      scale: 1.01,
                      y: -2,
                    }}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-cyan-200 hover:bg-cyan-50/30 hover:shadow-md"
                  >

                    {/* Producto */}
                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm ring-1 ring-slate-100 transition-colors group-hover:bg-cyan-500 group-hover:text-white">
                        <Package size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-800">
                          {item.name}
                        </h3>

                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <span>
                            Cantidad: {item.quantity}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-slate-300" />

                          <span>
                            {formatPrice(item.price)} c/u
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="shrink-0 text-right">
                      <p className="text-base font-black text-slate-900 sm:text-lg">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                  </motion.div>

                ))}

              </div>
            </motion.section>

            {/* RESUMEN */}
            <motion.aside
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-7 lg:sticky lg:top-6"
            >

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CreditCard size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Resumen de pago
                  </h2>

                  <p className="text-xs text-slate-500">
                    Pago seguro
                  </p>
                </div>
              </div>

              {/* Subtotal */}
              <div className="space-y-3 border-b border-slate-100 pb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Productos
                  </span>

                  <span className="font-semibold text-slate-700">
                    {items.length}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-slate-700">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* TOTAL */}
              <div className="my-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Total a pagar
                </p>

                <motion.p
                  key={totalAmount}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-black tracking-tight"
                >
                  {formatPrice(totalAmount)}
                </motion.p>
              </div>

              {/* MÉTODOS DE PAGO */}
              <div className="mb-4">
                <p className="mb-3 text-sm font-bold text-slate-800">
                  Selecciona tu medio de pago
                </p>

                <div className="space-y-3">

                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MercadoPagoButton items={items} />
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <WebpayButton totalAmount={totalAmount} />
                  </motion.div>

                </div>
              </div>

              {/* Seguridad */}
              <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />

                <p className="text-xs font-medium text-slate-500">
                  Tus datos están protegidos durante el pago
                </p>
              </div>

            </motion.aside>

          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400"
          >
            <span>Proceso de compra</span>
            <ArrowRight size={13} />
            <span className="font-medium text-slate-500">
              Pago seguro
            </span>
          </motion.div>
        )}

      </div>
    </main>
  )
}