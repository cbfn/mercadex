"use client";

/**
 * Contexto e store global do carrinho de compras.
 *
 * Estratégia de persistência:
 * - Usuário não autenticado: estado mantido em localStorage (Zustand persist).
 * - Usuário autenticado: ao fazer login, o carrinho do backend é carregado e
 *   sobrescreve o estado local. Mutações (add/remove/update/clear) são enviadas
 *   ao backend em background (fire-and-forget) para manter a consistência.
 *
 * O CartProvider deve ser filho de AuthProvider no layout.
 */

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { addItem, cartQuantity, cartSubtotal, cartTotal, removeItem, updateItemQty } from "@/shared/lib/cart";
import type { CartItem } from "@/shared/types/cart";
import type { Product } from "@/shared/types/catalog";
import { useAuth } from "@/features/auth/model/auth-context";
import { cartApi, type ApiCartItem } from "@/shared/lib/api/cart";

// ---------------------------------------------------------------------------
// Store Zustand (estado local + localStorage)
// ---------------------------------------------------------------------------

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  quantity: number;
  subtotal: number;
  total: number;
}

interface CartActions {
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: Product["id"]) => void;
  updateQty: (id: Product["id"], delta: number) => void;
  openCart: () => void;
  closeCart: () => void;
  finishOrder: () => void;
  /** Substitui os itens do carrinho com os dados vindos da API do backend. */
  setItemsFromApi: (items: CartItem[]) => void;
}

export type CartStore = CartState & CartActions;

const STORAGE_KEY = "mercadex:cart-state";

// ---------------------------------------------------------------------------
// UUID validation for cart-item hydration cleanup
// ---------------------------------------------------------------------------

const CART_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string | number | undefined | null): boolean {
  return typeof value === "string" && CART_UUID_REGEX.test(value);
}

/** Returns true when the item carries a valid backend product UUID. */
function isValidCartItem(item: CartItem): boolean {
  return isValidUuid(item.backendProductId) || isValidUuid(item.id);
}

/**
 * Module-level counter set synchronously inside the Zustand `merge` callback
 * (before any React component mounts). CartProvider reads it once to decide
 * whether to show the stale-items toast.
 */
let staleItemsRemovedOnHydration = 0;

const initialState: CartState = {
  items: [],
  isOpen: false,
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
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      finishOrder: () => set({ ...withDerived([]), isOpen: false }),
      setItemsFromApi: (items) => set(withDerived(items))
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        isOpen: state.isOpen
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartState>;
        const rawItems = persisted.items ?? currentState.items;
        const validItems = rawItems.filter(isValidCartItem);
        staleItemsRemovedOnHydration = rawItems.length - validItems.length;
        return {
          ...currentState,
          ...persisted,
          ...withDerived(validItems)
        };
      }
    }
  )
);

// ---------------------------------------------------------------------------
// Mapeamento backend → CartItem local
// ---------------------------------------------------------------------------

/**
 * Converte um item do backend (ApiCartItem) para o formato local (CartItem).
 *
 * Nota: CartItem.id é number no modelo local (legado dos mocks).
 * Usa o índice como id numérico temporário até que os tipos do catálogo
 * sejam migrados para UUID string na integração completa.
 */
function mapApiItemToLocal(apiItem: ApiCartItem, index: number): CartItem {
  return {
    id: index,
    backendProductId: apiItem.productId,
    title: apiItem.product.title,
    price: apiItem.product.price,
    image: apiItem.product.images[0] ?? "",
    condition: mapCondition(apiItem.product.condition),
    qty: apiItem.quantity
  };
}

function mapCondition(
  condition: "NOVO" | "EXCELENTE" | "BOM" | "USADO"
): "Novo" | "Excelente" | "Bom" | "Usado" {
  const map = { NOVO: "Novo", EXCELENTE: "Excelente", BOM: "Bom", USADO: "Usado" } as const;
  return map[condition];
}

// ---------------------------------------------------------------------------
// CartProvider — sincroniza com o backend quando autenticado
// ---------------------------------------------------------------------------

/**
 * Provedor que sincroniza o carrinho local com o backend ao autenticar.
 * Deve ser filho de AuthProvider no layout raiz.
 *
 * - Login detectado: busca carrinho do backend e substitui estado local.
 * - Logout: mantém carrinho local (não limpa, preserva UX).
 * - Erros de API ignorados silenciosamente (Trilha 3 pode estar pendente).
 *
 * @example
 * <AuthProvider>
 *   <CartProvider>{children}</CartProvider>
 * </AuthProvider>
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);

  // Show a one-time toast if stale (non-UUID) items were removed during hydration.
  useEffect(() => {
    if (staleItemsRemovedOnHydration > 0) {
      const count = staleItemsRemovedOnHydration;
      staleItemsRemovedOnHydration = 0;
      toast.info(
        count === 1
          ? "Um item do carrinho foi removido por ser incompatível com o catálogo atual."
          : `${count} itens do carrinho foram removidos por serem incompatíveis com o catálogo atual.`
      );
    }
  }, []);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const currentUserId = user?.id ?? null;
    prevUserIdRef.current = currentUserId;

    // Detecta transição de não-autenticado → autenticado
    if (currentUserId && currentUserId !== prevUserId) {
      // Preserva o carrinho local: itens adicionados antes do login não podem ser perdidos.
      // Só sincroniza do backend se o carrinho local estiver vazio.
      // O endpoint /api/cart é @legacy (ADR-007) — a chamada pode retornar 404.
      const localItems = useCart.getState().items;
      if (localItems.length === 0) {
        cartApi
          .get()
          .then((res) => {
            if (res.data.items.length > 0) {
              const mapped = res.data.items.map(mapApiItemToLocal);
              useCart.getState().setItemsFromApi(mapped);
            }
          })
          .catch(() => {
            // Backend do carrinho não disponível (ADR-007 @legacy). Mantém carrinho local.
          });
      }
    }
  }, [user?.id]);

  return children;
}

export function resetCartStore() {
  useCart.setState(initialState);
}
