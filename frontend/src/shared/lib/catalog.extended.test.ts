import { describe, expect, it } from "vitest";
import { discountPct, filterProducts } from "@/shared/lib/catalog";
import { PRODUCTS } from "@/shared/mocks/products";

describe("discountPct", () => {
  it("calculates correct discount percentage", () => {
    expect(discountPct(100, 70)).toBe(30);
  });

  it("returns 0 when prices are equal", () => {
    expect(discountPct(100, 100)).toBe(0);
  });

  it("returns 100 when price is zero", () => {
    expect(discountPct(100, 0)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    expect(discountPct(100, 33)).toBe(67);
  });

  it("works with real product data", () => {
    const product = PRODUCTS[0];
    const pct = discountPct(product.originalPrice, product.price);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
  });
});

describe("filterProducts – edge cases", () => {
  it("returns all products when category is Todos and no query", () => {
    const result = filterProducts(PRODUCTS, "Todos", "", "relevancia");
    expect(result).toHaveLength(PRODUCTS.length);
  });

  it("returns empty array when category has no match", () => {
    const result = filterProducts(PRODUCTS, "Inexistente", "", "relevancia");
    expect(result).toHaveLength(0);
  });

  it("trims whitespace from search query", () => {
    const result = filterProducts(PRODUCTS, "Todos", "  macbook  ", "relevancia");
    expect(result).toHaveLength(1);
  });

  it("search is case insensitive", () => {
    const lower = filterProducts(PRODUCTS, "Todos", "iphone", "relevancia");
    const upper = filterProducts(PRODUCTS, "Todos", "IPHONE", "relevancia");
    expect(lower).toEqual(upper);
  });

  it("filters by seller name", () => {
    const result = filterProducts(PRODUCTS, "Todos", "AudioWorld", "relevancia");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.seller === "AudioWorld")).toBe(true);
  });

  it("filters by condition", () => {
    const result = filterProducts(PRODUCTS, "Todos", "Usado", "relevancia");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.condition === "Usado")).toBe(true);
  });

  it("combines category and search filters", () => {
    const result = filterProducts(PRODUCTS, "Smartphones", "iphone", "relevancia");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === "Smartphones")).toBe(true);
  });

  it("sorts by highest price", () => {
    const result = filterProducts(PRODUCTS, "Todos", "", "maior");
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].price).toBeGreaterThanOrEqual(result[i + 1].price);
    }
  });

  it("returns empty for query with no matches", () => {
    const result = filterProducts(PRODUCTS, "Todos", "zzzznotfound", "relevancia");
    expect(result).toHaveLength(0);
  });

  it("handles empty products array", () => {
    const result = filterProducts([], "Todos", "", "relevancia");
    expect(result).toHaveLength(0);
  });
});
