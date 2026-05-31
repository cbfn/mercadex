import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useCatalogFilters } from "@/features/catalog/model/use-catalog-filters";
import { PRODUCTS } from "@/shared/mocks/products";

describe("useCatalogFilters", () => {
  it("starts with default values", () => {
    const { result } = renderHook(() => useCatalogFilters(PRODUCTS));

    expect(result.current.category).toBe("Todos");
    expect(result.current.searchQuery).toBe("");
    expect(result.current.sortBy).toBe("relevancia");
    expect(result.current.filteredProducts).toHaveLength(PRODUCTS.length);
  });

  it("filters by category", () => {
    const { result } = renderHook(() => useCatalogFilters(PRODUCTS));

    act(() => result.current.setCategory("Games"));

    expect(result.current.category).toBe("Games");
    expect(result.current.filteredProducts.every((p) => p.category === "Games")).toBe(true);
    expect(result.current.filteredProducts.length).toBeGreaterThan(0);
  });

  it("filters by search query", () => {
    const { result } = renderHook(() => useCatalogFilters(PRODUCTS));

    act(() => result.current.setSearchQuery("macbook"));

    expect(result.current.filteredProducts.length).toBeGreaterThanOrEqual(1);
    expect(result.current.filteredProducts.some((p) => p.title.includes("MacBook"))).toBe(true);
  });

  it("sorts by lowest price", () => {
    const { result } = renderHook(() => useCatalogFilters(PRODUCTS));

    act(() => result.current.setSortBy("menor"));

    const prices = result.current.filteredProducts.map((p) => p.price);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  it("sorts by highest price", () => {
    const { result } = renderHook(() => useCatalogFilters(PRODUCTS));

    act(() => result.current.setSortBy("maior"));

    const prices = result.current.filteredProducts.map((p) => p.price);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });

  it("sorts by most sold", () => {
    const { result } = renderHook(() => useCatalogFilters(PRODUCTS));

    act(() => result.current.setSortBy("vendidos"));

    const sales = result.current.filteredProducts.map((p) => p.sales);
    for (let i = 0; i < sales.length - 1; i++) {
      expect(sales[i]).toBeGreaterThanOrEqual(sales[i + 1]);
    }
  });

  it("combines category and search", () => {
    const { result } = renderHook(() => useCatalogFilters(PRODUCTS));

    act(() => {
      result.current.setCategory("Smartphones");
      result.current.setSearchQuery("iphone");
    });

    expect(result.current.filteredProducts.length).toBeGreaterThan(0);
    expect(result.current.filteredProducts.every((p) => p.category === "Smartphones")).toBe(true);
  });

  it("returns empty when no match", () => {
    const { result } = renderHook(() => useCatalogFilters(PRODUCTS));

    act(() => result.current.setSearchQuery("xyznotfound"));

    expect(result.current.filteredProducts).toHaveLength(0);
  });

  it("resets all filters", () => {
    const { result } = renderHook(() => useCatalogFilters(PRODUCTS));

    act(() => {
      result.current.setCategory("Games");
      result.current.setSearchQuery("playstation");
      result.current.setSortBy("menor");
    });

    act(() => result.current.resetFilters());

    expect(result.current.category).toBe("Todos");
    expect(result.current.searchQuery).toBe("");
    expect(result.current.sortBy).toBe("relevancia");
    expect(result.current.filteredProducts).toHaveLength(PRODUCTS.length);
  });

  it("handles empty products array", () => {
    const { result } = renderHook(() => useCatalogFilters([]));
    expect(result.current.filteredProducts).toHaveLength(0);
  });
});
