import type { Product, SortBy } from "@/shared/types/catalog";

export const discountPct = (originalPrice: number, price: number) => Math.round((1 - price / originalPrice) * 100);

export function filterProducts(products: Product[], category: string, query: string, sortBy: SortBy): Product[] {
  let list = [...products];

  if (category !== "Todos") {
    list = list.filter((product) => product.category === category);
  }

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter((product) => {
      return (
        product.title.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.condition.toLowerCase().includes(q) ||
        product.seller.toLowerCase().includes(q)
      );
    });
  }

  if (sortBy === "menor") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === "maior") {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === "vendidos") {
    list.sort((a, b) => b.sales - a.sales);
  }

  return list;
}
