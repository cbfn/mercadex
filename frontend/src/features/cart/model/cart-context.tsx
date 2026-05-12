"use client";

import type { ReactNode } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { addItem, cartQuantity, cartSubtotal, cartTotal, removeItem, updateItemQty } from "@/shared/lib/cart";
import type { CartItem, CheckoutStep, PaymentTab } from "@/shared/types/cart";
import type { Product } from "@/shared/types/catalog";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  checkoutStep: CheckoutStep;
  paymentTab: PaymentTab;
  selectedProductId: number | null;
  quantity: number;
  subtotal: number;
  total: number;
}

interface CartActions {
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  openCart: () => void;
  closeCart: () => void;
  setStep: (step: CheckoutStep) => void;
  setTab: (tab: PaymentTab) => void;
  openProduct: (id: number) => void;
  closeProduct: () => void;
  finishOrder: () => void;
}

export type CartStore = CartState & CartActions;

const STORAGE_KEY = "mercadex:cart-state";

const initialState: CartState = {
  items: [],
  isOpen: false,
  checkoutStep: 0,
  paymentTab: "pix",
  selectedProductId: null,
  quantity: 0,
  subtotal: 0,
  total: 0
};

function withDerived(items: CartItem[]) {
  return {
    items,
    quantity: cartQuantity(items),
    subtotal: cartSubtotal(items),
    total: cartTotal(items)
  };
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      addToCart: (product, qty = 1) => {
        const items = addItem(get().items, product, qty);
        set(withDerived(items));
      },
      removeFromCart: (id) => {
        const items = removeItem(get().items, id);
        set(withDerived(items));
      },
      updateQty: (id, delta) => {
        const items = updateItemQty(get().items, id, delta);
        set(withDerived(items));
      },
      openCart: () => set({ isOpen: true, checkoutStep: 0 }),
      closeCart: () => set({ isOpen: false }),
      setStep: (step) => set({ checkoutStep: step }),
      setTab: (tab) => set({ paymentTab: tab }),
      openProduct: (id) => set({ selectedProductId: id }),
      closeProduct: () => set({ selectedProductId: null }),
      finishOrder: () => set({ ...withDerived([]), isOpen: false, checkoutStep: 0, paymentTab: "pix" })
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        isOpen: state.isOpen,
        checkoutStep: state.checkoutStep,
        paymentTab: state.paymentTab,
        selectedProductId: state.selectedProductId
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartState>;
        const items = persisted.items ?? currentState.items;
        return {
          ...currentState,
          ...persisted,
          ...withDerived(items)
        };
      }
    }
  )
);

export function CartProvider({ children }: { children: ReactNode }) {
  return children;
}

export function resetCartStore() {
  useCart.setState(initialState);
}
