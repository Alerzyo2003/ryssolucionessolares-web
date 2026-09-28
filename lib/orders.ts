import type { SupabaseClient } from '@supabase/supabase-js'

type CheckoutLine = {
  id: string
  quantity: number
}

type ProductRow = {
  id: string | number
  name: string
  price: number
  stock: number | null
}

export function parseCheckoutLines(value: unknown): CheckoutLine[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('El carrito está vacío.')
  }

  const quantities = new Map<string, number>()

  for (const valueItem of value) {
    if (!valueItem || typeof valueItem !== 'object') {
      throw new Error('El carrito contiene un producto inválido.')
    }

    const item = valueItem as Record<string, unknown>
    const id = String(item.id ?? '').trim()
    const quantity = Number(item.quantity)

    if (!id || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error('El carrito contiene un producto inválido.')
    }

    quantities.set(id, (quantities.get(id) ?? 0) + quantity)
  }

  return Array.from(quantities, ([id, quantity]) => ({ id, quantity }))
}

export async function createPendingOrder(
  supabase: SupabaseClient,
  provider: 'mercadopago' | 'webpay',
  lines: CheckoutLine[],
  customerEmail: string
) {
  const normalizedEmail = customerEmail.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Ingresa un correo electrónico válido.')
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, stock')
    .in('id', lines.map((line) => line.id))

  if (error) throw new Error(`No se pudieron validar los productos: ${error.message}`)

  const products = (data ?? []) as ProductRow[]
  const productsById = new Map(products.map((product) => [String(product.id), product]))
  const orderItems = lines.map((line) => {
    const product = productsById.get(line.id)

    if (!product) throw new Error(`No se encontró el producto ${line.id}.`)

    const unitPrice = Number(product.price)
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`El producto ${product.name} tiene un precio inválido.`)
    }

    if (product.stock !== null && Number(product.stock) < line.quantity) {
      throw new Error(`Stock insuficiente para ${product.name}.`)
    }

    return {
      id: String(product.id),
      name: product.name,
      quantity: line.quantity,
      unit_price: Math.round(unitPrice),
    }
  })

  const amount = orderItems.reduce(
    (total, item) => total + item.unit_price * item.quantity,
    0
  )

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      provider,
      status: 'pending',
      amount,
      total_amount: amount,
      items: orderItems,
      customer_email: normalizedEmail,
    })
    .select('id')
    .single()

  if (orderError) throw new Error(`No se pudo registrar la orden: ${orderError.message}`)

  return { id: String(order.id), amount, items: orderItems, customerEmail: normalizedEmail }
}