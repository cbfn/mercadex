import { render, screen } from "@testing-library/react";
import { Skeleton } from "@/shared/ui/skeleton";

describe("Skeleton", () => {
  it("renders with default classes", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("bg-muted");
  });

  it("merges custom className", () => {
    render(<Skeleton data-testid="skeleton" className="h-10 w-24" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("h-10");
    expect(skeleton).toHaveClass("w-24");
  });
});
