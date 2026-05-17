import type { CartItem } from "@/shared/types/cart";
import type { Product } from "@/shared/types/catalog";

export const SHIPPING = 19.9;

export function addItem(items: CartItem[], product: Product, qty: number): CartItem[] {
  const existing = items.find((item) => item.id === product.id);

  if (!existing) {
    return [
      ...items,
      {
        id: product.id,
        backendProductId: product.backendProductId,
        title: product.title,
        price: product.price,
        image: product.image,
        condition: product.condition,
        qty
      }
    ];
  }

  return items.map((item) => {
    if (item.id !== product.id) return item;
    return { ...item, qty: item.qty + qty };
  });
}

export function updateItemQty(items: CartItem[], id: number, delta: number): CartItem[] {
  return items.map((item) => {
    if (item.id !== id) return item;
    return { ...item, qty: Math.max(1, item.qty + delta) };
  });
}

export function removeItem(items: CartItem[], id: number): CartItem[] {
  return items.filter((item) => item.id !== id);
}

export const cartQuantity = (items: CartItem[]) => items.reduce((sum, item) => sum + item.qty, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.price * item.qty, 0);
export const cartTotal = (items: CartItem[]) => cartSubtotal(items) + (items.length ? SHIPPING : 0);
