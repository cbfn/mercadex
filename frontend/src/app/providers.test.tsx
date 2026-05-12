import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Providers } from "@/app/providers";

describe("Providers", () => {
  it("renders children inside CartProvider", () => {
    render(
      <Providers>
        <p>child content</p>
      </Providers>
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
