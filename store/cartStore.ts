import { create } from 'zustand'
// 1. Importamos la herramienta 'persist' de Zustand
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string | number
  name: string
  price: number
  quantity: number
}

type NewCartItem = Omit<CartItem, 'quantity'>

interface CartState {
  items: CartItem[]
  addItem: (item: NewCartItem) => void
  removeItem: (id: string | number) => void
  clearCart: () => void; 
}

// 2. Envolvemos la creación del store con persist()
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const existing = state.items.find((item) => item.id === newItem.id)
        if (existing) {
          return { items: state.items.map((item) => item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item) }
        }
        return { items: [...state.items, { ...newItem, quantity: 1 }] }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),

      clearCart: () => set({ items: [] }),
    }),
    {
      // 3. Le damos un nombre único para guardarlo en el navegador
      name: 'rs-soluciones-carrito', 
    }
  )
)