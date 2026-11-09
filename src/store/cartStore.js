// src/store/cartStore.js
import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set(({ items }) => ({ items: [...items, item] })),
  removeItem: (cart_key) => set(({ items }) => ({ items: items.filter((i) => i.cart_key !== cart_key) })),
  clear: () => set({ items: [] }),
  totalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));