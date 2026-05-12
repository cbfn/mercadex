"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { addItem, cartQuantity, cartSubtotal, cartTotal, removeItem, updateItemQty } from "@/shared/lib/cart";
import type { CartItem, CheckoutStep, PaymentTab } from "@/shared/types/cart";
import type { Product } from "@/shared/types/catalog";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  checkoutStep: CheckoutStep;
  paymentTab: PaymentTab;
  selectedProductId: number | null;
}

type Action =
  | { type: "ADD"; product: Product; qty: number }
  | { type: "REMOVE"; id: number }
  | { type: "UPDATE_QTY"; id: number; delta: number }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "SET_STEP"; step: CheckoutStep }
  | { type: "SET_TAB"; tab: PaymentTab }
  | { type: "OPEN_PRODUCT"; id: number }
  | { type: "CLOSE_PRODUCT" }
  | { type: "FINISH_ORDER" };

const initialState: CartState = {
  items: [],
  isOpen: false,
  checkoutStep: 0,
  paymentTab: "pix",
  selectedProductId: null
};

function loadFromStorage(): CartState {
  if (typeof window === "undefined") return initialState;

  const raw = window.localStorage.getItem("mercadex:cart-state");
  if (!raw) return initialState;

  try {
    return { ...initialState, ...(JSON.parse(raw) as Partial<CartState>) };
  } catch {
    return initialState;
  }
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD":
      return { ...state, items: addItem(state.items, action.product, action.qty) };
    case "REMOVE":
      return { ...state, items: removeItem(state.items, action.id) };
    case "UPDATE_QTY":
      return { ...state, items: updateItemQty(state.items, action.id, action.delta) };
    case "OPEN_CART":
      return { ...state, isOpen: true, checkoutStep: 0 };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "SET_STEP":
      return { ...state, checkoutStep: action.step };
    case "SET_TAB":
      return { ...state, paymentTab: action.tab };
    case "OPEN_PRODUCT":
      return { ...state, selectedProductId: action.id };
    case "CLOSE_PRODUCT":
      return { ...state, selectedProductId: null };
    case "FINISH_ORDER":
      return { ...state, items: [], isOpen: false, checkoutStep: 0, paymentTab: "pix" };
    default:
      return state;
  }
}

interface CartContextValue extends CartState {
  quantity: number;
  subtotal: number;
  total: number;
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

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadFromStorage);

  useEffect(() => {
    window.localStorage.setItem("mercadex:cart-state", JSON.stringify(state));
  }, [state]);

  const value = useMemo<CartContextValue>(() => {
    return {
      ...state,
      quantity: cartQuantity(state.items),
      subtotal: cartSubtotal(state.items),
      total: cartTotal(state.items),
      addToCart: (product, qty = 1) => dispatch({ type: "ADD", product, qty }),
      removeFromCart: (id) => dispatch({ type: "REMOVE", id }),
      updateQty: (id, delta) => dispatch({ type: "UPDATE_QTY", id, delta }),
      openCart: () => dispatch({ type: "OPEN_CART" }),
      closeCart: () => dispatch({ type: "CLOSE_CART" }),
      setStep: (step) => dispatch({ type: "SET_STEP", step }),
      setTab: (tab) => dispatch({ type: "SET_TAB", tab }),
      openProduct: (id) => dispatch({ type: "OPEN_PRODUCT", id }),
      closeProduct: () => dispatch({ type: "CLOSE_PRODUCT" }),
      finishOrder: () => dispatch({ type: "FINISH_ORDER" })
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
