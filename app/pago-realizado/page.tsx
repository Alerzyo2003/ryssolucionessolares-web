"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useCartStore } from '@/store/cartStore'

// Creamos un componente interno para poder usar useSearchParams dentro de Suspense (Requisito de Next.js)
type MercadoPagoDetails = {
  paymentId: string
  amount: number
  transactionDate: string | null
  authorizationCode: string | null
  cardLast4: string | null
  paymentMethod: string | null
  status: 'paid'
}

type ReceiptItem = {
  name: string
  quantity: number
  unit_price: number
}

type ReceiptData = {
  orderId: string
  createdAt: string
  provider: string
  reference: string
  customerEmail: string
  amount: number
  currency: string
  items: ReceiptItem[]
  status: 'paid'
}

function downloadPurchaseReceipt(
  receipt: ReceiptData,
  authorizationCode: string | null,
  paymentType: string
) {
  const document = new jsPDF()
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: receipt.currency,
      maximumFractionDigits: 0,
    }).format(value)

  document.setFontSize(18)
  document.setFont('helvetica', 'bold')
  document.text('R&S Soluciones Solares', 20, 22)
  document.setFontSize(13)
  document.text('Comprobante de compra', 20, 32)
  document.setFontSize(10)
  document.setFont('helvetica', 'normal')
  document.text(`Orden: ${receipt.orderId}`, 20, 44)
  document.text(`Comprobante: ${receipt.reference}`, 20, 51)
  document.text(`Fecha: ${new Date(receipt.createdAt).toLocaleString('es-CL')}`, 20, 58)
  document.text(`Cliente: ${receipt.customerEmail}`, 20, 65)
  document.text(`Medio de pago: ${receipt.provider === 'mercadopago' ? 'Mercado Pago' : 'Webpay'}`, 20, 72)
  document.text(`Estado: PAGADO`, 20, 79)

  if (authorizationCode) document.text(`Autorización: ${authorizationCode}`, 20, 86)
  document.text(`Tipo de pago: ${paymentType}`, 20, authorizationCode ? 93 : 86)

  let y = authorizationCode ? 107 : 100
  document.setFont('helvetica', 'bold')
  document.text('Producto', 20, y)
  document.text('Cantidad', 135, y, { align: 'right' })
  document.text('Subtotal', 190, y, { align: 'right' })
  y += 8
  document.setFont('helvetica', 'normal')

  for (const item of receipt.items) {
    const nameLines = document.splitTextToSize(item.name, 95) as string[]
    if (y + nameLines.length * 6 > 270) {
      document.addPage()
      y = 20
    }

    document.text(nameLines, 20, y)
    document.text(String(item.quantity), 135, y, { align: 'right' })
    document.text(formatPrice(item.unit_price * item.quantity), 190, y, { align: 'right' })
    y += Math.max(nameLines.length * 6, 7) + 2
  }

  if (y > 270) {
    document.addPage()
    y = 20
  }

  document.setFont('helvetica', 'bold')
  document.line(20, y, 190, y)
  document.text('Total pagado', 20, y + 9)
  document.text(formatPrice(receipt.amount), 190, y + 9, { align: 'right' })
  document.save(`comprobante-${receipt.orderId}.pdf`)
}

function PagoExitosoContenido() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id')
  const orderId = searchParams.get('order_id') || searchParams.get('external_reference')
  const paymentProvider = searchParams.get('provider')
  const isMercadoPago = paymentProvider
    ? paymentProvider === 'mercadopago'
    : Boolean(orderId && paymentId && !paymentId.startsWith('O-'))
  const webpayAmount = Number(searchParams.get('amount'))
  const webpayDate = searchParams.get('transaction_date')
  const webpayAuthorization = searchParams.get('authorization_code')
  const webpayCardLast4 = searchParams.get('card_last4')
  const webpayPaymentType = searchParams.get('payment_type_code')
  const [mercadoPagoDetails, setMercadoPagoDetails] = useState<MercadoPagoDetails | null>(null)
  const [verificationError, setVerificationError] = useState('')
  const [verifying, setVerifying] = useState(Boolean(isMercadoPago && orderId && paymentId))
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [receiptError, setReceiptError] = useState('')
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    if (!isMercadoPago || !orderId || !paymentId) return

    const controller = new AbortController()
    const verifyPayment = async () => {
      setVerifying(true)
      setVerificationError('')

      try {
        const query = new URLSearchParams({ payment_id: paymentId, order_id: orderId })
        const response = await fetch(`/api/payments/mercadopago?${query}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        const result = await response.json()

        if (!response.ok) throw new Error(result.error || 'No se pudo verificar el pago.')
        setMercadoPagoDetails(result as MercadoPagoDetails)
      } catch (error) {
        if (!controller.signal.aborted) {
          setVerificationError(error instanceof Error ? error.message : 'No se pudo verificar el pago.')
        }
      } finally {
        if (!controller.signal.aborted) setVerifying(false)
      }
    }

    void verifyPayment()
    return () => controller.abort()
  }, [isMercadoPago, orderId, paymentId])

  const amount = isMercadoPago ? mercadoPagoDetails?.amount : webpayAmount
  const transactionDate = isMercadoPago ? mercadoPagoDetails?.transactionDate : webpayDate
  const authorizationCode = isMercadoPago ? mercadoPagoDetails?.authorizationCode : webpayAuthorization
  const cardLast4 = isMercadoPago ? mercadoPagoDetails?.cardLast4 : webpayCardLast4
  const paymentTypeCode = isMercadoPago ? mercadoPagoDetails?.paymentMethod : webpayPaymentType
  const formattedAmount = amount
    ? new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }).format(amount)
    : 'Pendiente de verificación'

  const formattedDate = transactionDate
    ? new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }).format(new Date(transactionDate))
    : 'Pendiente de verificación'

  const paymentTypeLabels: Record<string, string> = {
    credit_card: 'Tarjeta de crédito',
    debit_card: 'Tarjeta de débito',
    account_money: 'Dinero en cuenta',
    ticket: 'Efectivo',
    VD: 'Débito',
    VN: 'Crédito',
    VP: 'Prepago',
  }
  const paymentType = paymentTypeCode
    ? paymentTypeLabels[paymentTypeCode] || paymentTypeCode
    : 'Pendiente de verificación'

  const paymentIsConfirmed = isMercadoPago
    ? mercadoPagoDetails?.status === 'paid'
    : Boolean(paymentId && orderId)

  useEffect(() => {
    if (!orderId || !paymentIsConfirmed) return

    const controller = new AbortController()
    const loadReceipt = async () => {
      setReceiptLoading(true)
      setReceiptError('')

      try {
        const query = new URLSearchParams({ order_id: orderId })
        const response = await fetch(`/api/orders/receipt?${query}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'No se pudo cargar el comprobante.')
        setReceipt(result as ReceiptData)
      } catch (error) {
        if (!controller.signal.aborted) {
          setReceiptError(error instanceof Error ? error.message : 'No se pudo cargar el comprobante.')
        }
      } finally {
        if (!controller.signal.aborted) setReceiptLoading(false)
      }
    }

    void loadReceipt()
    return () => controller.abort()
  }, [orderId, paymentIsConfirmed])

  useEffect(() => {
    const clearAfterConfirmedPayment = isMercadoPago
      ? mercadoPagoDetails?.status === 'paid'
      : Boolean(paymentId)

    if (clearAfterConfirmedPayment) clearCart()
  }, [clearCart, isMercadoPago, mercadoPagoDetails?.status, paymentId])

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-10">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        {isMercadoPago && !mercadoPagoDetails
          ? verifying ? 'Verificando tu pago...' : 'No pudimos verificar el pago'
          : '¡Pago Realizado con Éxito!'}
      </h1>
      <p className="text-slate-600 mb-8">
        {isMercadoPago && !mercadoPagoDetails
          ? 'Estamos confirmando la transacción con Mercado Pago. No cierres esta página todavía.'
          : 'Muchas gracias por tu compra en R&S Soluciones Solares. Hemos recibido tu pedido y comenzaremos a procesarlo pronto.'}
      </p>

      {verificationError && (
        <p role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
          {verificationError} Revisa el estado de la operación en Mercado Pago antes de volver a pagar.
        </p>
      )}
      {receiptError && (
        <p role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
          El pago está aprobado, pero no se pudo cargar el detalle del comprobante: {receiptError}
        </p>
      )}

      <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detalles de la Transacción</h3>
        <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
          <span className="text-slate-600">Estado</span>
          <span className={`font-bold ${isMercadoPago && !mercadoPagoDetails ? 'text-amber-700' : 'text-emerald-600'}`}>
            {isMercadoPago && !mercadoPagoDetails ? verifying ? 'Verificando' : 'Sin confirmar' : 'Aprobado'}
          </span>
        </div>
        <div className="flex justify-between items-center pb-3">
          <span className="text-slate-600">N° de Comprobante (ID)</span>
          <span className="font-bold text-slate-800">{mercadoPagoDetails?.paymentId || paymentId || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-200 py-3">
          <span className="text-slate-600">Monto</span>
          <span className="font-bold text-slate-800">{formattedAmount}</span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-200 py-3 gap-4">
          <span className="text-slate-600">Fecha y hora</span>
          <span className="font-bold text-slate-800 text-right">{formattedDate}</span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-200 py-3">
          <span className="text-slate-600">Código de autorización</span>
          <span className="font-bold text-slate-800">{authorizationCode || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-200 py-3">
          <span className="text-slate-600">Tarjeta</span>
          <span className="font-bold text-slate-800">**** **** **** {cardLast4 || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center pt-3">
          <span className="text-slate-600">Tipo de pago</span>
          <span className="font-bold text-slate-800">{paymentType}</span>
        </div>
        {isMercadoPago && !mercadoPagoDetails && verifying && (
          <p className="mt-4 text-center text-xs text-slate-500">Consultando los detalles confirmados de la transacción.</p>
        )}
      </div>

      {receipt && paymentIsConfirmed && (
        <button
          type="button"
          onClick={() => downloadPurchaseReceipt(receipt, authorizationCode ?? null, paymentType)}
          className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-8 py-4 font-bold text-white shadow-md transition-colors hover:bg-emerald-800"
        >
          <Download size={18} /> Descargar comprobante PDF
        </button>
      )}
      {receiptLoading && (
        <p className="mb-4 text-sm text-slate-500">Preparando comprobante...</p>
      )}

      <Link 
        href="/tienda" 
        className="inline-block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-md"
      >
        Volver a la Tienda
      </Link>
    </div>
  )
}

// El componente principal exportado
export default function PagoRealizadoPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 flex items-center justify-center font-sans">
      <Suspense fallback={<div className="text-center text-slate-500">Cargando detalles de tu pago...</div>}>
        <PagoExitosoContenido />
      </Suspense>
    </div>
  )
}