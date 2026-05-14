import { filterProducts } from "@/shared/lib/catalog";
import { PRODUCTS } from "@/shared/mocks/products";

describe("filterProducts", () => {
  it("filters by category", () => {
    const result = filterProducts(PRODUCTS, "Games", "", "relevancia");
    expect(result.every((item) => item.category === "Games")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters by search query", () => {
    const result = filterProducts(PRODUCTS, "Todos", "macbook", "relevancia");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toContain("MacBook");
  });

  it("sorts by lowest price", () => {
    const result = filterProducts(PRODUCTS, "Todos", "", "menor");
    expect(result[0]?.price).toBe(199);
  });

  it("sorts by highest sales", () => {
    const result = filterProducts(PRODUCTS, "Todos", "", "vendidos");
    expect(result[0]?.sales).toBeGreaterThanOrEqual(result[1]?.sales ?? 0);
  });
});
