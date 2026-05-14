import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabButton } from "@/shared/ui/tabs";

describe("TabButton", () => {
  it("renders children text", () => {
    render(
      <TabButton active={false} onClick={jest.fn()}>
        PIX
      </TabButton>
    );
    expect(screen.getByText("PIX")).toBeInTheDocument();
  });

  it("applies active class when active", () => {
    const { container } = render(
      <TabButton active onClick={jest.fn()}>
        Tab
      </TabButton>
    );
    expect((container.firstChild as HTMLElement).className).toContain("tabButtonActive");
  });

  it("does not apply active class when inactive", () => {
    const { container } = render(
      <TabButton active={false} onClick={jest.fn()}>
        Tab
      </TabButton>
    );
    expect((container.firstChild as HTMLElement).className).not.toContain("tabButtonActive");
  });

  it("always has base tabButton class", () => {
    const { container } = render(
      <TabButton active={false} onClick={jest.fn()}>
        Tab
      </TabButton>
    );
    expect((container.firstChild as HTMLElement).className).toContain("tabButton");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(
      <TabButton active={false} onClick={handleClick}>
        Tab
      </TabButton>
    );

    await user.click(screen.getByText("Tab"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
