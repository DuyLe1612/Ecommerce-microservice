import { ProductCard } from '@/type/product'
import { Item } from '@radix-ui/react-accordion';
import { steps } from 'motion/react';
import { create } from 'zustand'
import {persist} from 'zustand/middleware'

export interface CartItem{
    product: ProductCard;
    quantity: number;
}

export interface StoreState{
    items: CartItem[];
    addItem: (product: ProductCard) => void;
    removeItem: (productId: number) => void;
    deleteCartProduct: (productId: number) => void;
    resetCart: () => void;
    getTotalPrice: () => number;
    getSubTotalPrice: () => number;
    getItemCount: (productId: number) => number;
    getGroupItems: () => CartItem[];
    //favor
    favorProducts: ProductCard[];
    addToFavor: (product: ProductCard) => Promise<void>;
    removeFavor: (productId: number) => void;
    resetFavor: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      favorProducts: [],
      // CART
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item?.product?.id === product.id
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity: 1 }],
          };
        }),

      removeItem: (productId) =>
          set((state) => ({
              items: state.items.reduce((acc, item) => {
                  if (item.product.id === productId) {
                    if (item.quantity > 1) { acc.push({...item, quantity: item.quantity -1})}
                  } else {
                      acc.push(item);
                  }
                  return acc;
            }, [] as CartItem[],)
        })),

      deleteCartProduct: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      resetCart: () => set({ items: [] }),

      getTotalPrice: () =>
        get()
          .items.reduce(
            (total, item) => total + item.product.finalPrice * item.quantity,
            0
          ),

      getSubTotalPrice: () =>
        get()
          .items.reduce(
            (total, item) => total + item.product.finalPrice * item.quantity,
            0
          ),

      getItemCount: (productId) =>
      {
          const item = get().items.find((item) => item.product.id === productId);
          return item ? item.quantity : 0;
      },

      getGroupItems: () => get().items,

      // =====================
      // ❤️ FAVORITE
      // =====================
      addToFavor: (product) =>
      {
          return new Promise<void>((resolve) => {
              set((state: StoreState) => {
                  const isFavor = state.favorProducts.some(
                      (item) => item.id === product.id
                  );
                  return {
                      favorProducts: isFavor
                          ? state.favorProducts.filter(
                              (item) => item.id !== product.id
                          )
                          : [...state.favorProducts, { ...product }],
                  };
              });
              resolve();
          });
      },

      removeFavor: (productId: number) =>
        set((state: StoreState) => ({
          favorProducts: state.favorProducts.filter((p) => p.id !== productId),
        })),

      resetFavor: () => set({ favorProducts: [] }),
    }),
    { name: "cart-store" }
  )
);