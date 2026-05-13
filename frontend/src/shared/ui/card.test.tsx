import React from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "@/shared/ui/card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies uiCard base class", () => {
    const { container } = render(<Card>Test</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("uiCard");
  });

  it("merges extra className", () => {
    const { container } = render(<Card className="extra">Test</Card>);
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).toContain("uiCard");
    expect(cls).toContain("extra");
  });

  it("renders as a div", () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("forwards HTML attributes", () => {
    render(<Card data-testid="card-1">Test</Card>);
    expect(screen.getByTestId("card-1")).toBeInTheDocument();
  });
});
