import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/shared/ui/modal";

describe("Modal", () => {
  it("renders children when open", () => {
    render(
      <Modal open title="Details" onClose={jest.fn()}>
        <p>Modal body</p>
      </Modal>
    );
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} title="Details" onClose={jest.fn()}>
        <p>Hidden</p>
      </Modal>
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders title in header", () => {
    render(
      <Modal open title="My Title" onClose={jest.fn()}>
        content
      </Modal>
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("has role=dialog and aria-modal=true", () => {
    render(
      <Modal open title="Test" onClose={jest.fn()}>
        content
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("has aria-label matching title", () => {
    render(
      <Modal open title="Product Details" onClose={jest.fn()}>
        content
      </Modal>
    );
    expect(screen.getByLabelText("Product Details")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal open title="Test" onClose={onClose}>
        content
      </Modal>
    );

    await user.click(screen.getByLabelText("Fechar modal"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
