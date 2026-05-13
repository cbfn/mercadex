import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/shared/ui/badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Novo</Badge>);
    expect(screen.getByText("Novo")).toBeInTheDocument();
  });

  it("applies neutral variant class by default", () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("uiBadge");
    expect(badge.className).toContain("uiBadgeNeutral");
  });

  it("applies success variant class", () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("uiBadgeSuccess");
  });

  it("applies info variant class", () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("uiBadgeInfo");
  });

  it("applies warning variant class", () => {
    const { container } = render(<Badge variant="warning">Warn</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("uiBadgeWarning");
  });

  it("forwards extra className", () => {
    const { container } = render(<Badge className="extra">Test</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("extra");
  });

  it("forwards HTML attributes", () => {
    render(<Badge data-testid="badge-test">Test</Badge>);
    expect(screen.getByTestId("badge-test")).toBeInTheDocument();
  });

  it("renders as a span element", () => {
    const { container } = render(<Badge>Test</Badge>);
    expect(container.firstChild?.nodeName).toBe("SPAN");
  });
});
