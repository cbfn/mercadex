import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "./card";

describe("Card", () => {
  it("should render correctly", () => {
    render(<Card>Test Card</Card>);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });
});
