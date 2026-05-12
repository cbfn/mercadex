import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CartDrawer } from "./cart-drawer";
import * as cartContext from "@/features/cart/model/cart-context";
import { PRODUCTS } from "@/shared/mocks/products";

// Mock Object
const mockProduct = { ...PRODUCTS[0], qty: 2 };

// Mock global.navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe("CartDrawer", () => {
  it("should render cart items and allow removing and updating qty", () => {
    const removeFromCartMock = vi.fn();
    const updateQtyMock = vi.fn();

    vi.spyOn(cartContext, "useCart").mockReturnValue({
      isOpen: true,
      items: [mockProduct],
      removeFromCart: removeFromCartMock,
      updateQty: updateQtyMock,
      closeCart: vi.fn(),
      openCart: vi.fn(),
      addToCart: vi.fn(),
      subtotal: 5998,
      total: 6048,
      checkoutStep: 0,
      setStep: vi.fn(),
      openProduct: vi.fn(),
      closeProduct: vi.fn(),
      selectedProductId: null,
      finishOrder: vi.fn(),
      quantity: 0,
    } as any);

    render(<CartDrawer />);
    
    expect(screen.getByText("iPhone 14 Pro 256GB")).toBeInTheDocument();
    
    const removeBtn = screen.getByLabelText("Remover");
    fireEvent.click(removeBtn);
    expect(removeFromCartMock).toHaveBeenCalledWith(mockProduct.id);

    const minusBtn = screen.getByText("-");
    const plusBtn = screen.getByText("+");
    fireEvent.click(minusBtn);
    expect(updateQtyMock).toHaveBeenCalledWith(mockProduct.id, -1);
    fireEvent.click(plusBtn);
    expect(updateQtyMock).toHaveBeenCalledWith(mockProduct.id, 1);
  });

  it("should progress checkout step 1 -> 2", () => {
    const setStepMock = vi.fn();
    vi.spyOn(cartContext, "useCart").mockReturnValue({
      isOpen: true,
      items: [mockProduct],
      removeFromCart: vi.fn(),
      updateQty: vi.fn(),
      closeCart: vi.fn(),
      openCart: vi.fn(),
      addToCart: vi.fn(),
      subtotal: 5998,
      total: 6048,
      checkoutStep: 1,
      setStep: setStepMock,
      openProduct: vi.fn(),
      closeProduct: vi.fn(),
      selectedProductId: null,
      finishOrder: vi.fn(),
      quantity: 0,
    } as any);

    render(<CartDrawer />);
    fireEvent.submit(screen.getByTestId("delivery-step"));
    expect(setStepMock).toHaveBeenCalledWith(2);
  });

  it("should copy pix and confirm order step 2", async () => {
    const setStepMock = vi.fn();
    vi.spyOn(cartContext, "useCart").mockReturnValue({
      isOpen: true,
      items: [mockProduct],
      removeFromCart: vi.fn(),
      updateQty: vi.fn(),
      closeCart: vi.fn(),
      openCart: vi.fn(),
      addToCart: vi.fn(),
      subtotal: 5998,
      total: 6048,
      checkoutStep: 2,
      setStep: setStepMock,
      openProduct: vi.fn(),
      closeProduct: vi.fn(),
      selectedProductId: null,
      finishOrder: vi.fn(),
      quantity: 0,
    } as any);

    render(<CartDrawer />);
    const btn = screen.getByTestId("copy-pix-button");
    fireEvent.click(btn);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("mercadex@pagamentos.com.br");
    });
  });

  it("should finish order step 3", () => {
    const finishOrderMock = vi.fn();
    vi.spyOn(cartContext, "useCart").mockReturnValue({
      isOpen: true,
      items: [mockProduct],
      removeFromCart: vi.fn(),
      updateQty: vi.fn(),
      closeCart: vi.fn(),
      openCart: vi.fn(),
      addToCart: vi.fn(),
      subtotal: 5998,
      total: 6048,
      checkoutStep: 3,
      setStep: vi.fn(),
      openProduct: vi.fn(),
      closeProduct: vi.fn(),
      selectedProductId: null,
      finishOrder: finishOrderMock,
      quantity: 0,
    } as any);

    render(<CartDrawer />);
    const btn = screen.getByTestId("finish-order-button");
    fireEvent.click(btn);
    expect(finishOrderMock).toHaveBeenCalled();
  });
});
