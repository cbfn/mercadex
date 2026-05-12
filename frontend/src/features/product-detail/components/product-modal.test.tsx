import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProductModal } from "./product-modal";
import * as cartContext from "@/features/cart/model/cart-context";
import { PRODUCTS } from "@/shared/mocks/products";

describe("ProductModal", () => {
  it("should render product details and add to cart", () => {
    const addToCartMock = vi.fn();
    const closeProductMock = vi.fn();

    vi.spyOn(cartContext, "useCart").mockReturnValue({
      selectedProductId: 1,
      closeProduct: closeProductMock,
      addToCart: addToCartMock,
      isOpen: false,
      items: [],
      openCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateQty: vi.fn(),
      subtotal: 0,
      total: 0,
      checkoutStep: 0,
      setStep: vi.fn(),
      openProduct: vi.fn(),
      finishOrder: vi.fn(),
      quantity: 0,
    } as any);

    render(<ProductModal />);
    
    // Product 1 is from MOCK that is 'Smartphone Pro Max'
    expect(screen.getByText(PRODUCTS[0].title)).toBeInTheDocument();
    
    const addBtn = screen.getByText("Adicionar ao carrinho");
    fireEvent.click(addBtn);
    expect(addToCartMock).toHaveBeenCalledWith(PRODUCTS[0], 1);
    expect(closeProductMock).toHaveBeenCalled();
  });
});
