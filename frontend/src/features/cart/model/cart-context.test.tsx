import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, resetCartStore, useCart } from "@/features/cart/model/cart-context";
import { PRODUCTS } from "@/shared/mocks/products";

function TestHarness() {
  const cart = useCart();
  return (
    <div>
      <span data-testid="qty">{cart.quantity}</span>
      <span data-testid="subtotal">{cart.subtotal}</span>
      <span data-testid="total">{cart.total}</span>
      <span data-testid="is-open">{String(cart.isOpen)}</span>
      <span data-testid="step">{cart.checkoutStep}</span>
      <span data-testid="selected">{String(cart.selectedProductId)}</span>
      <button data-testid="add" onClick={() => cart.addToCart(PRODUCTS[0], 1)}>add</button>
      <button data-testid="add2" onClick={() => cart.addToCart(PRODUCTS[1], 2)}>add2</button>
      <button data-testid="remove" onClick={() => cart.removeFromCart(PRODUCTS[0].id)}>remove</button>
      <button data-testid="inc" onClick={() => cart.updateQty(PRODUCTS[0].id, 1)}>inc</button>
      <button data-testid="dec" onClick={() => cart.updateQty(PRODUCTS[0].id, -1)}>dec</button>
      <button data-testid="open" onClick={cart.openCart}>open</button>
      <button data-testid="close" onClick={cart.closeCart}>close</button>
      <button data-testid="step1" onClick={() => cart.setStep(1)}>step1</button>
      <button data-testid="step2" onClick={() => cart.setStep(2)}>step2</button>
      <button data-testid="open-product" onClick={() => cart.openProduct(5)}>openProduct</button>
      <button data-testid="close-product" onClick={cart.closeProduct}>closeProduct</button>
      <button data-testid="finish" onClick={cart.finishOrder}>finish</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <CartProvider>
      <TestHarness />
    </CartProvider>
  );
}

describe("CartProvider / useCart", () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
  });

  it("starts with empty cart", () => {
    renderWithProvider();
    expect(screen.getByTestId("qty")).toHaveTextContent("0");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("0");
    expect(screen.getByTestId("total")).toHaveTextContent("0");
  });

  it("adds a product to cart", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    expect(screen.getByTestId("qty")).toHaveTextContent("1");
    expect(Number(screen.getByTestId("subtotal").textContent)).toBe(PRODUCTS[0].price);
  });

  it("adds multiple products", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("add2"));
    expect(screen.getByTestId("qty")).toHaveTextContent("3"); // 1 + 2
  });

  it("removes a product", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("remove"));
    expect(screen.getByTestId("qty")).toHaveTextContent("0");
  });

  it("increments item quantity", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("inc"));
    expect(screen.getByTestId("qty")).toHaveTextContent("2");
  });

  it("decrements but does not go below 1", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("dec"));
    expect(screen.getByTestId("qty")).toHaveTextContent("1");
  });

  it("opens and closes cart", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    await user.click(screen.getByTestId("open"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    await user.click(screen.getByTestId("close"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  it("resets checkout step to 0 when opening cart", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("step1"));
    expect(screen.getByTestId("step")).toHaveTextContent("1");
    await user.click(screen.getByTestId("open"));
    expect(screen.getByTestId("step")).toHaveTextContent("0");
  });

  it("navigates checkout steps", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("step1"));
    expect(screen.getByTestId("step")).toHaveTextContent("1");
    await user.click(screen.getByTestId("step2"));
    expect(screen.getByTestId("step")).toHaveTextContent("2");
  });

  it("opens and closes product detail", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("open-product"));
    expect(screen.getByTestId("selected")).toHaveTextContent("5");
    await user.click(screen.getByTestId("close-product"));
    expect(screen.getByTestId("selected")).toHaveTextContent("null");
  });

  it("finishes order and resets state", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("open"));
    expect(screen.getByTestId("qty")).toHaveTextContent("1");

    await user.click(screen.getByTestId("finish"));
    expect(screen.getByTestId("qty")).toHaveTextContent("0");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    expect(screen.getByTestId("step")).toHaveTextContent("0");
  });

  it("updates zustand store state after add", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    expect(useCart.getState().items).toHaveLength(1);
  });

  it("works outside provider because state is global", () => {
    function Orphan() {
      const cart = useCart();
      return <span data-testid="orphan-qty">{cart.quantity}</span>;
    }

    render(<Orphan />);
    expect(screen.getByTestId("orphan-qty")).toHaveTextContent("0");
  });

  it("total includes shipping when cart has items", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    const subtotal = Number(screen.getByTestId("subtotal").textContent);
    const total = Number(screen.getByTestId("total").textContent);
    expect(total).toBeGreaterThan(subtotal);
  });
});
