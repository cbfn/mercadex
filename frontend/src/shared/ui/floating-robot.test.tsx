import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { FloatingRobot } from "@/shared/ui/floating-robot";
import userEvent from "@testing-library/user-event";

describe("FloatingRobot", () => {
  it("renders fixed assistant button", () => {
    render(<FloatingRobot />);

    const button = screen.getByTestId("floating-robot-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Abrir assistente virtual");
  });

  it("opens the modal and shows search results in the response box", async () => {
    const user = userEvent.setup();
    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        data: {
          query: "produtos usados",
          found: true,
          total: 2,
          message: "Sim! Encontrei 2 produtos.",
          items: [
            { id: 1, title: "Notebook Gamer RTX 4060", price: 7499.9, condition: "USADO", category: { name: "Notebooks" } },
            { id: 2, title: "Console PS5", price: 3399.9, condition: "USADO", category: { name: "Games" } },
          ],
        },
      }),
    });

    Object.defineProperty(globalThis, "fetch", {
      value: fetchMock,
      writable: true,
    });

    render(<FloatingRobot />);

    await user.click(screen.getByTestId("floating-robot-button"));

    expect(screen.getByRole("dialog", { name: "Assistente virtual" })).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Campo de busca do assistente" }), "produtos usados");
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/api/products/search?q=produtos%20usados");
    });

    await waitFor(() => {
      const responseBox = screen.getByLabelText("Resposta do assistente");
      expect(responseBox.textContent).toContain("Sim! Encontrei 2 produtos.");
      expect(responseBox.textContent).toContain("Notebook Gamer RTX 4060");
      expect(responseBox.textContent).toContain("Console PS5");
    });

    expect(screen.getByRole("link", { name: "Abrir produto Notebook Gamer RTX 4060" })).toHaveAttribute("href", "/products/1");
    expect(screen.getByRole("link", { name: "Abrir produto Console PS5" })).toHaveAttribute("href", "/products/2");

    await user.click(screen.getByRole("link", { name: "Abrir produto Notebook Gamer RTX 4060" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Assistente virtual" })).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId("floating-robot-button"));

    expect(screen.getByRole("dialog", { name: "Assistente virtual" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Campo de busca do assistente" })).toHaveValue("");
    expect(screen.getByLabelText("Resposta do assistente").textContent).toContain("Oi! Eu sou seu assistente virtual. Pode me perguntar!");
  });
});
