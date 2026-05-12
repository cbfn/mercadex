"use client";

import { useMemo, useState } from "react";
import { filterProducts } from "@/shared/lib/catalog";
import type { Product, SortBy } from "@/shared/types/catalog";

interface UseCatalogFiltersResult {
  category: string;
  searchQuery: string;
  sortBy: SortBy;
  filteredProducts: Product[];
  setCategory: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setSortBy: (value: SortBy) => void;
  resetFilters: () => void;
}

export function useCatalogFilters(products: Product[]): UseCatalogFiltersResult {
  const [category, setCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("relevancia");

  const filteredProducts = useMemo(() => {
    return filterProducts(products, category, searchQuery, sortBy);
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
