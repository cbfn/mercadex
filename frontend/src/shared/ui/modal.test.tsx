import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "./modal";

describe("Modal", () => {
  it("should render and close", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} title="Test Modal" onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText("Modal Content")).toBeInTheDocument();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText("Fechar modal");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("should not render when closed", () => {
    render(<Modal open={false} title="Test Modal" onClose={vi.fn()}><div /></Modal>);
    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });
});
