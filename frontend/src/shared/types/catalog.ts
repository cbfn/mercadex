export type SortBy = "relevancia" | "menor" | "maior" | "vendidos";

export interface Category {
  label: string;
  icon: string;
}

export type ProductCondition = "Novo" | "Excelente" | "Bom" | "Usado";

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  condition: ProductCondition;
  seller: string;
  sellerRating: number;
  sales: number;
  description: string;
  specs: string[];
  image: string;
  views: number;
}
