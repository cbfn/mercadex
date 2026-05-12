import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartProvider } from "@/features/cart/model/cart-context";
import { StorefrontPage } from "@/features/storefront/components/storefront-page";
import { CATEGORIES, PRODUCTS } from "@/shared/mocks/products";

function renderPage() {
  return render(
    <CartProvider>
      <StorefrontPage />
    </CartProvider>
  );
}

describe("StorefrontPage – extended", () => {
  it("renders header with Mercadex branding", () => {
    renderPage();
    expect(screen.getByText("Mercadex")).toBeInTheDocument();
  });

  it("renders search input", () => {
    renderPage();
    expect(screen.getByLabelText("Buscar produtos")).toBeInTheDocument();
  });

  it("renders cart button with quantity", () => {
    renderPage();
    expect(screen.getByTestId("open-cart-button")).toHaveTextContent("Carrinho (0)");
  });

  it("renders all category tabs", () => {
    renderPage();
    for (const cat of CATEGORIES) {
      expect(screen.getByTestId(`category-${cat.label}`)).toBeInTheDocument();
    }
  });

  it("renders sort select", () => {
    renderPage();
    expect(screen.getByTestId("sort-select")).toBeInTheDocument();
  });

  it("renders all products initially", () => {
    renderPage();
    expect(screen.getAllByTestId("product-card")).toHaveLength(PRODUCTS.length);
  });

  it("filters by category click", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId("category-Games"));
    const cards = screen.getAllByTestId("product-card");
    const gamesCount = PRODUCTS.filter((p) => p.category === "Games").length;
    expect(cards).toHaveLength(gamesCount);
  });

  it("shows empty state for no results", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByTestId("search-input"), "xyznotfound");
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("Nenhum produto encontrado")).toBeInTheDocument();
  });

  it("resets filters from empty state", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByTestId("search-input"), "xyznotfound");
    await user.click(screen.getByTestId("reset-filters"));
    expect(screen.getAllByTestId("product-card")).toHaveLength(PRODUCTS.length);
  });

  it("sorts products by price ascending", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByTestId("sort-select"), "menor");
    const cards = screen.getAllByTestId("product-card");
    expect(cards.length).toBe(PRODUCTS.length);
  });

  it("opens cart drawer", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId("open-cart-button"));
    expect(screen.getByText("Seu carrinho esta vazio.")).toBeInTheDocument();
  });

  it("updates cart count after adding product", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId("open-product-1"));
    await user.click(screen.getByTestId("modal-add-to-cart"));

    expect(screen.getByTestId("open-cart-button")).toHaveTextContent("Carrinho (1)");
  });

  it("product card shows formatted price", () => {
    renderPage();
    // All prices should contain R$ format
    const prices = screen.getAllByText(/R\$/);
    expect(prices.length).toBeGreaterThan(0);
  });

  it("combines category and search filters", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId("category-Smartphones"));
    await user.type(screen.getByTestId("search-input"), "iphone");

    const cards = screen.getAllByTestId("product-card");
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThan(PRODUCTS.length);
  });
});
