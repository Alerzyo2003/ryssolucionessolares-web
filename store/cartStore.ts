import { create } from 'zustand'
// 1. Importamos la herramienta 'persist' de Zustand
import { persist } from 'zustand/middleware'

interface CartState {
  items: any[];
  addItem: (item: any) => void;
  clearCart: () => void; 
}

// 2. Envolvemos la creación del store con persist()
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const existing = state.items.find((i: any) => i.id === newItem.id);
        if (existing) {
          return { items: state.items.map((i: any) => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i) };
        }
        return { items: [...state.items, { ...newItem, quantity: 1 }] };
      }),

      clearCart: () => set({ items: [] }),
    }),
    {
      // 3. Le damos un nombre único para guardarlo en el navegador
      name: 'rs-soluciones-carrito', 
    }
  )
)