"use client";

import { useMemo, useState } from "react";
import { filterProducts } from "@/shared/lib/catalog";
import type { Product, SortBy } from "@/shared/types/catalog";

interface UseCatalogFiltersResult<TProduct extends Product> {
  category: string;
  searchQuery: string;
  sortBy: SortBy;
  filteredProducts: TProduct[];
  setCategory: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setSortBy: (value: SortBy) => void;
  resetFilters: () => void;
}

export function useCatalogFilters<TProduct extends Product>(products: TProduct[]): UseCatalogFiltersResult<TProduct> {
  const [category, setCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("relevancia");

  const filteredProducts = useMemo(() => {
    return filterProducts(products, category, searchQuery, sortBy) as TProduct[];
  }, [products, category, searchQuery, sortBy]);

  return {
    category,
    searchQuery,
    sortBy,
    filteredProducts,
    setCategory,
    setSearchQuery,
    setSortBy,
    resetFilters: () => {
      setCategory("Todos");
      setSearchQuery("");
      setSortBy("relevancia");
    }
  };
}
