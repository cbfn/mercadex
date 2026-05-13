import { addItem, cartQuantity, cartSubtotal, cartTotal, removeItem, SHIPPING, updateItemQty } from "@/shared/lib/cart";
import { PRODUCTS } from "@/shared/mocks/products";
import type { CartItem } from "@/shared/types/cart";

const product = PRODUCTS[0];
const product2 = PRODUCTS[1];

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    condition: product.condition,
    qty: 1,
    ...overrides
  };
}

describe("addItem – edge cases", () => {
  it("adds multiple different products", () => {
    let items = addItem([], product, 1);
    items = addItem(items, product2, 1);
    expect(items).toHaveLength(2);
  });

  it("preserves other items when adding existing product", () => {
    let items = addItem([], product, 1);
    items = addItem(items, product2, 1);
    items = addItem(items, product, 3);
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === product.id)?.qty).toBe(4);
    expect(items.find((i) => i.id === product2.id)?.qty).toBe(1);
  });

  it("creates item with correct fields from product", () => {
    const items = addItem([], product, 2);
    expect(items[0]).toEqual({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      condition: product.condition,
      qty: 2
    });
  });
});

describe("updateItemQty – edge cases", () => {
  it("increments item quantity", () => {
    const items = [makeItem({ qty: 3 })];
    const updated = updateItemQty(items, product.id, 2);
    expect(updated[0].qty).toBe(5);
  });

  it("does not go below 1", () => {
    const items = [makeItem({ qty: 1 })];
    const updated = updateItemQty(items, product.id, -1);
    expect(updated[0].qty).toBe(1);
  });

  it("does not modify other items", () => {
    const items = [makeItem({ id: 1, qty: 2 }), makeItem({ id: 2, qty: 3 })];
    const updated = updateItemQty(items, 1, 1);
    expect(updated.find((i) => i.id === 1)?.qty).toBe(3);
    expect(updated.find((i) => i.id === 2)?.qty).toBe(3);
  });
});

describe("removeItem – edge cases", () => {
  it("does nothing when id does not exist", () => {
    const items = [makeItem()];
    const updated = removeItem(items, 9999);
    expect(updated).toHaveLength(1);
  });

  it("removes correct item from multiple", () => {
    const items = [makeItem({ id: 1 }), makeItem({ id: 2 }), makeItem({ id: 3 })];
    const updated = removeItem(items, 2);
    expect(updated).toHaveLength(2);
    expect(updated.map((i) => i.id)).toEqual([1, 3]);
  });
});

describe("cart aggregate functions", () => {
  it("cartQuantity returns 0 for empty cart", () => {
    expect(cartQuantity([])).toBe(0);
  });

  it("cartSubtotal returns 0 for empty cart", () => {
    expect(cartSubtotal([])).toBe(0);
  });

  it("cartTotal returns 0 for empty cart (no shipping)", () => {
    expect(cartTotal([])).toBe(0);
  });

  it("cartTotal includes shipping when cart has items", () => {
    const items = [makeItem({ price: 100, qty: 1 })];
    expect(cartTotal(items)).toBe(100 + SHIPPING);
  });

  it("cartSubtotal multiplies price by qty", () => {
    const items = [makeItem({ price: 50, qty: 3 })];
    expect(cartSubtotal(items)).toBe(150);
  });

  it("cartQuantity sums all quantities", () => {
    const items = [makeItem({ id: 1, qty: 2 }), makeItem({ id: 2, qty: 5 })];
    expect(cartQuantity(items)).toBe(7);
  });
});
