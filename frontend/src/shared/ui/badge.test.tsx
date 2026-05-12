import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("should render correctly", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });
  
  it("should render correctly var", () => {
    render(<Badge variant="secondary">Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });
});
