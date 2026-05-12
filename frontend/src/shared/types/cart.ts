import type { Product } from "@/shared/types/catalog";

export interface CartItem {
  id: Product["id"];
  title: Product["title"];
  price: Product["price"];
  image: Product["image"];
  condition: Product["condition"];
  qty: number;
}

export type CheckoutStep = 0 | 1 | 2 | 3;
export type PaymentTab = "pix";
