import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useCatalogFilters } from "./use-catalog-filters";
import type { Product } from "@/shared/types/catalog";

const MOCK_PRODUCTS: Product[] = [
  { id: 1, title: "Product A", price: 100, category: "Eletronicos", image: "", description: "", condition: "novo", seller: "A" }
];

describe("useCatalogFilters", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useCatalogFilters(MOCK_PRODUCTS));
    expect(result.current.category).toBe("Todos");
    expect(result.current.searchQuery).toBe("");
    expect(result.current.sortBy).toBe("relevancia");
  });

  it("should update category, search, and sort", () => {
    const { result } = renderHook(() => useCatalogFilters(MOCK_PRODUCTS));
    
    act(() => {
      result.current.setCategory("Eletronicos");
      result.current.setSearchQuery("Test");
      result.current.setSortBy("menor");
    });
    
    expect(result.current.category).toBe("Eletronicos");
    expect(result.current.searchQuery).toBe("Test");
    expect(result.current.sortBy).toBe("menor");
  });

  it("should reset filters", () => {
    const { result } = renderHook(() => useCatalogFilters(MOCK_PRODUCTS));
    
    act(() => {
      result.current.setCategory("Eletronicos");
      result.current.setSearchQuery("Test");
      result.current.setSortBy("menor");
    });
    
    act(() => {
      result.current.resetFilters();
    });
    
    expect(result.current.category).toBe("Todos");
    expect(result.current.searchQuery).toBe("");
    expect(result.current.sortBy).toBe("relevancia");
  });
});
