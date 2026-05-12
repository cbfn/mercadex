import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("should render button with ref as child", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    const btn = screen.getByText("Click me");
    expect(btn).toBeInTheDocument();
    
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
  
  it("should render varying variants text", () => {
    render(<Button variant="outline" size="sm">Small Outline</Button>);
    const btn = screen.getByText("Small Outline");
    expect(btn).toBeInTheDocument();
  });
});
