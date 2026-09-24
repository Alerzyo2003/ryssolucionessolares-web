import Link from 'next/link'

export default function PagoRechazadoPage() {
	return (
		<main className="min-h-screen bg-slate-50 px-4 py-20 flex items-center justify-center font-sans">
			<div className="max-w-xl w-full mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-10">
				<div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 6l12 12M18 6L6 18" />
					</svg>
				</div>

				<h1 className="text-3xl font-extrabold text-slate-900 mb-3">Pago no aprobado</h1>
				<p className="text-slate-600 mb-8">
					Webpay no pudo aprobar esta transacción. No se realizó ningún cobro.
					Puedes volver al carrito e intentarlo nuevamente.
				</p>

				<div className="bg-red-50 rounded-xl p-5 mb-8 text-left border border-red-100">
					<h2 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-2">Qué puedes hacer</h2>
					<p className="text-sm text-red-900">
						Revisa los datos de la tarjeta o prueba con otro medio de pago.
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
