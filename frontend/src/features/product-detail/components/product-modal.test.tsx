import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, resetCartStore, useCart } from "@/features/cart/model/cart-context";
import { ProductModal } from "@/features/product-detail/components/product-modal";
import { PRODUCTS } from "@/shared/mocks/products";

function ModalSetup({ productId }: { productId: number }) {
  const cart = useCart();
  return (
    <div>
      <button data-testid="trigger" onClick={() => cart.openProduct(productId)}>
        open
      </button>
      <span data-testid="cart-qty">{cart.quantity}</span>
      <span data-testid="is-open">{String(cart.isOpen)}</span>
      <ProductModal />
    </div>
  );
}

function renderModal(productId = PRODUCTS[0].id) {
  return render(
    <CartProvider>
      <ModalSetup productId={productId} />
    </CartProvider>
  );
}

describe("ProductModal", () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
  });

  it("renders nothing when no product is selected", () => {
    const { container } = render(
      <CartProvider>
        <ProductModal />
      </CartProvider>
    );
    expect(container.querySelector("[role=dialog]")).toBeNull();
  });

  it("opens modal when product is selected", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByRole("dialog", { name: "Detalhes do produto" })).toBeInTheDocument();
  });

  it("displays product details", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByText(PRODUCTS[0].title)).toBeInTheDocument();
    expect(screen.getByText(PRODUCTS[0].description)).toBeInTheDocument();
    expect(screen.getByText(PRODUCTS[0].condition)).toBeInTheDocument();
  });

  it("displays discount percentage", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByText(/-\d+%/)).toBeInTheDocument();
  });

  it("starts with quantity 1", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByTestId("modal-qty")).toHaveTextContent("1");
  });

  it("increments quantity", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);
    expect(screen.getByTestId("modal-qty")).toHaveTextContent("2");
  });

  it("decrements quantity but not below 1", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    const minusButtons = screen.getAllByRole("button", { name: "-" });
    await user.click(minusButtons[0]);
    expect(screen.getByTestId("modal-qty")).toHaveTextContent("1");
  });

  it("adds product to cart and opens cart drawer", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    await user.click(screen.getByTestId("modal-add-to-cart"));

    expect(screen.getByTestId("cart-qty")).toHaveTextContent("1");
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
  });

  it("adds correct quantity to cart", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);
    await user.click(plusButtons[0]);
    await user.click(screen.getByTestId("modal-add-to-cart"));

    expect(screen.getByTestId("cart-qty")).toHaveTextContent("3");
  });

  it("resets quantity after adding to cart", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);
    await user.click(screen.getByTestId("modal-add-to-cart"));

    // Re-open modal
    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByTestId("modal-qty")).toHaveTextContent("1");
  });

  it("closes modal via X button", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Fechar modal"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
