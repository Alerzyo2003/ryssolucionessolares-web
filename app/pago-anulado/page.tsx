import Link from 'next/link'

export default function PagoAnuladoPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-20 flex items-center justify-center font-sans">
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-10">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Pago anulado</h1>
        <p className="text-slate-600 mb-8">
          La compra fue anulada y no se realizó ningún cobro. Puedes volver al carrito
          para intentarlo nuevamente cuando quieras.
        </p>

        <div className="bg-amber-50 rounded-xl p-5 mb-8 text-left border border-amber-100">
          <h2 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2">Estado de la compra</h2>
          <p className="text-sm text-amber-950">
            La transacción no fue confirmada por Webpay.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/cart"
            className="inline-block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md"
          >
            Volver al carrito
          </Link>
          <Link
            href="/tienda"
            className="inline-block w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-xl transition-colors"
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    </main>
  )
}
