import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CartProvider, useCart } from "./cart-context";
import { ReactNode } from "react";

const MOCK_PRODUCT = { id: 1, title: "Phone", price: 1000, image: "", category: "test", description: "test desc", seller: "test", condition: "novo" } as any;

describe("CartContext", () => {
  it("should add, update, and remove items", () => {
    const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(MOCK_PRODUCT);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.quantity).toBe(1);

    act(() => {
      result.current.updateQty(1, 1); // add 1
    });

    expect(result.current.quantity).toBe(2);

    act(() => {
      result.current.removeFromCart(1);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("should handle checkout steps and cart visibility", () => {
    const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.openCart();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setStep(1);
    });
    expect(result.current.checkoutStep).toBe(1);

    act(() => {
      result.current.closeCart();
    });
    expect(result.current.isOpen).toBe(false);
    
    // finishing order should clear cart and reset
    act(() => {
      result.current.finishOrder();
    });
    expect(result.current.items).toHaveLength(0);
  });
});
