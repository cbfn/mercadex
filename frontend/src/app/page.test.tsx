import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the StorefrontPage component", () => {
    render(
      <HomePage />
    );
    expect(screen.getByAltText("Mercadex")).toBeInTheDocument();
    expect(screen.getAllByTestId("product-card").length).toBeGreaterThan(0);
  });
});
