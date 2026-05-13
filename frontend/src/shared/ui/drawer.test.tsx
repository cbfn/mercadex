import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Drawer } from "@/shared/ui/drawer";

describe("Drawer", () => {
  it("renders children when open", () => {
    render(
      <Drawer open title="Test Drawer" onClose={jest.fn()}>
        <p>Drawer content</p>
      </Drawer>
    );
    expect(screen.getByText("Drawer content")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <Drawer open={false} title="Test" onClose={jest.fn()}>
        <p>Hidden</p>
      </Drawer>
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders title", () => {
    render(
      <Drawer open title="Carrinho" onClose={jest.fn()}>
        content
      </Drawer>
    );
    expect(screen.getByText("Carrinho")).toBeInTheDocument();
  });

  it("has aria-label matching title", () => {
    render(
      <Drawer open title="Carrinho" onClose={jest.fn()}>
        content
      </Drawer>
    );
    expect(screen.getByLabelText("Carrinho")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Drawer open title="Test" onClose={onClose}>
        content
      </Drawer>
    );

    await user.click(screen.getByLabelText("Fechar carrinho"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders as aside element", () => {
    render(
      <Drawer open title="Test" onClose={jest.fn()}>
        content
      </Drawer>
    );
    expect(screen.getByLabelText("Test").tagName).toBe("ASIDE");
  });
});
