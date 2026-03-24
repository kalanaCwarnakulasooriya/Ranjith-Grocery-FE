import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { item (the product obj), quantity }
      
      addToCart: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(i => i.item.id === product.id);
        
        if (existingItem) {
          if (existingItem.quantity < product.quantity) {
             set({
               items: currentItems.map(i => 
                 i.item.id === product.id 
                 ? { ...i, quantity: i.quantity + 1 } 
                 : i
               )
             });
          }
        } else {
          set({ items: [...currentItems, { item: product, quantity: 1 }] });
        }
      },
      
      removeFromCart: (productId) => {
        set({ items: get().items.filter(i => i.item.id !== productId) });
      },
      
      updateQuantity: (productId, quantity) => {
        set({
          items: get().items.map(i => 
            i.item.id === productId ? { ...i, quantity } : i
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, i) => total + (i.item.price * i.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
