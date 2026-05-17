import type { Product } from "@/shared/types/catalog";

export interface CartItem {
  id: Product["id"];
  backendProductId?: string;
  title: Product["title"];
  price: Product["price"];
  image: Product["image"];
  condition: Product["condition"];
  qty: number;
}
