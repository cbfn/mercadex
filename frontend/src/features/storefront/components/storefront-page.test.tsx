import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartProvider } from "@/features/cart/model/cart-context";
import { StorefrontPage } from "@/features/storefront/components/storefront-page";

function renderPage() {
  return render(
    <CartProvider>
      <StorefrontPage />
    </CartProvider>
  );
}

describe("StorefrontPage", () => {
  it("shows product grid", () => {
    renderPage();
    expect(screen.getAllByTestId("product-card").length).toBeGreaterThan(0);
  });

  it("filters by query", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByTestId("search-input"), "MacBook");
    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(1);
    expect(screen.getByText(/MacBook/i)).toBeInTheDocument();
  });

  it("opens modal and adds product to cart", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId("open-product-1"));
    expect(screen.getByRole("dialog", { name: "Detalhes do produto" })).toBeInTheDocument();

    await user.click(screen.getByTestId("modal-add-to-cart"));
    expect(screen.getByTestId("cart-step")).toBeInTheDocument();
    expect(screen.getAllByTestId("cart-item")).toHaveLength(1);
  });

  it("finishes checkout flow", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId("open-product-1"));
    await user.click(screen.getByTestId("modal-add-to-cart"));
    await user.click(screen.getByTestId("go-to-delivery"));

    await user.type(screen.getByLabelText("Nome completo"), "Joao da Silva");
    await user.type(screen.getByLabelText("CPF"), "00000000000");
    await user.type(screen.getByLabelText("Telefone"), "11999999999");
    await user.type(screen.getByLabelText("CEP"), "01001000");
    await user.type(screen.getByLabelText("Endereco"), "Rua A");
    await user.type(screen.getByLabelText("Cidade"), "Sao Paulo");
    await user.selectOptions(screen.getByLabelText("UF"), "SP");

    await user.click(screen.getByRole("button", { name: "Continuar para pagamento" }));
    expect(screen.getByTestId("payment-step")).toBeInTheDocument();
    expect(screen.getByTestId("pix-content")).toBeInTheDocument();
    expect(screen.getByTestId("copy-pix-button")).toBeInTheDocument();

    await user.click(screen.getByTestId("confirm-order-button"));
    expect(screen.getByTestId("confirm-step")).toBeInTheDocument();
    expect(screen.getByTestId("order-status")).toHaveTextContent("PENDENTE_PAGAMENTO");
    expect(screen.getByTestId("order-validity")).toBeInTheDocument();
  });
});
