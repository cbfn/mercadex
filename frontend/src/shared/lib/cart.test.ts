import { addItem, cartQuantity, cartSubtotal, cartTotal, removeItem, updateItemQty } from "@/shared/lib/cart";
import { PRODUCTS } from "@/shared/mocks/products";

describe("cart logic", () => {
  it("adds an item and updates quantity", () => {
    const withItem = addItem([], PRODUCTS[0], 1);
    const updated = addItem(withItem, PRODUCTS[0], 2);
    expect(updated).toHaveLength(1);
    expect(updated[0]?.qty).toBe(3);
  });

  it("updates item qty with floor at 1", () => {
    const list = addItem([], PRODUCTS[0], 1);
    const updated = updateItemQty(list, PRODUCTS[0].id, -3);
    expect(updated[0]?.qty).toBe(1);
  });

  it("removes item", () => {
    const list = addItem([], PRODUCTS[0], 1);
    const updated = removeItem(list, PRODUCTS[0].id);
    expect(updated).toHaveLength(0);
  });

  it("calculates totals", () => {
    const first = addItem([], PRODUCTS[0], 1);
    const second = addItem(first, PRODUCTS[1], 2);
    expect(cartQuantity(second)).toBe(3);
    expect(cartSubtotal(second)).toBe(PRODUCTS[0].price + PRODUCTS[1].price * 2);
    expect(cartTotal(second)).toBeGreaterThan(cartSubtotal(second));
  });
});
