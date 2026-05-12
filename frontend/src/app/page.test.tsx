import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider } from "@/features/cart/model/cart-context";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the StorefrontPage component", () => {
    render(
      <CartProvider>
        <HomePage />
      </CartProvider>
    );
    expect(screen.getByAltText("Mercadex")).toBeInTheDocument();
    expect(screen.getAllByTestId("product-card").length).toBeGreaterThan(0);
  });
});
