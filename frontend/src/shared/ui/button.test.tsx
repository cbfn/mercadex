import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/shared/ui/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    const { container } = render(<Button>Test</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("uiButton");
    expect(btn.className).toContain("uiButtonPrimary");
  });

  it("applies secondary variant", () => {
    const { container } = render(<Button variant="secondary">Test</Button>);
    expect((container.firstChild as HTMLElement).className).toContain("uiButtonSecondary");
  });

  it("applies ghost variant", () => {
    const { container } = render(<Button variant="ghost">Test</Button>);
    expect((container.firstChild as HTMLElement).className).toContain("uiButtonGhost");
  });

  it("applies danger variant", () => {
    const { container } = render(<Button variant="danger">Test</Button>);
    expect((container.firstChild as HTMLElement).className).toContain("uiButtonDanger");
  });

  it("calls onClick handler", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("forwards extra className", () => {
    const { container } = render(<Button className="custom">Test</Button>);
    expect((container.firstChild as HTMLElement).className).toContain("custom");
  });

  it("supports type attribute", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
