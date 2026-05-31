import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { FloatingRobot } from "@/shared/ui/floating-robot";
import userEvent from "@testing-library/user-event";
import * as apiClient from "@/shared/lib/api-client";

jest.mock("@/shared/lib/api-client", () => ({
  apiRequest: jest.fn(),
}));

const mockApiRequest = apiClient.apiRequest as jest.Mock;

describe("FloatingRobot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders fixed assistant button", () => {
    render(<FloatingRobot />);

    const button = screen.getByTestId("floating-robot-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Abrir assistente virtual");
  });

  it("shows default message before any search", async () => {
    const user = userEvent.setup();
    render(<FloatingRobot />);

    await user.click(screen.getByTestId("floating-robot-button"));

    expect(screen.getByLabelText("Resposta do assistente")).toHaveTextContent(
      "Oi! Eu sou seu assistente virtual. Pode me perguntar!"
    );
  });

  it("opens the modal and shows search results in the response box", async () => {
    const user = userEvent.setup();

    mockApiRequest.mockResolvedValue({
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
    });

    render(<FloatingRobot />);

    await user.click(screen.getByTestId("floating-robot-button"));

    expect(screen.getByRole("dialog", { name: "Assistente virtual" })).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Campo de busca do assistente" }), "produtos usados");
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(
        "/api/products/search?q=produtos%20usados",
        expect.objectContaining({ skipAuth: true })
      );
    });

    await waitFor(() => {
      const responseBox = screen.getByLabelText("Resposta do assistente");
      expect(responseBox.textContent).toContain("Sim! Encontrei 2 produtos.");
      expect(responseBox.textContent).toContain("Notebook Gamer RTX 4060");
      expect(responseBox.textContent).toContain("Console PS5");
      expect(responseBox.textContent).toContain("Notebooks");
      expect(responseBox.textContent).toContain("Games");
      expect(responseBox.textContent).toContain("R$ 7.499,90");
      expect(responseBox.textContent).toContain("R$ 3.399,90");
    });

    const firstProductLink = screen.getByRole("link", { name: "Abrir produto Notebook Gamer RTX 4060" });
    expect(firstProductLink).toHaveAttribute("href", "/products/1");
    expect(screen.getByRole("link", { name: "Abrir produto Console PS5" })).toHaveAttribute("href", "/products/2");

    firstProductLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(firstProductLink);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Assistente virtual" })).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId("floating-robot-button"));

    expect(screen.getByRole("dialog", { name: "Assistente virtual" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Campo de busca do assistente" })).toHaveValue("");
    expect(screen.getByLabelText("Resposta do assistente").textContent).toContain("Oi! Eu sou seu assistente virtual. Pode me perguntar!");
  });

  it("shows error message when API call fails", async () => {
    const user = userEvent.setup();

    mockApiRequest.mockRejectedValue(new Error("network error"));

    render(<FloatingRobot />);

    await user.click(screen.getByTestId("floating-robot-button"));
    await user.type(screen.getByRole("textbox", { name: "Campo de busca do assistente" }), "falha");
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Resposta do assistente")).toHaveTextContent(
        "Não consegui consultar os produtos agora."
      );
    });
  });

  it("shows 'not found' message when API returns found=false", async () => {
    const user = userEvent.setup();

    mockApiRequest.mockResolvedValue({
      success: true,
      data: { query: "xyz", found: false, total: 0, message: "Não encontrei nada.", items: [] },
    });

    render(<FloatingRobot />);

    await user.click(screen.getByTestId("floating-robot-button"));
    await user.type(screen.getByRole("textbox", { name: "Campo de busca do assistente" }), "xyz");
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Resposta do assistente")).toHaveTextContent("Não encontrei nada.");
    });
  });

  it("does not call API when query is empty", async () => {
    const user = userEvent.setup();
    render(<FloatingRobot />);

    await user.click(screen.getByTestId("floating-robot-button"));
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it("closes modal via close button", async () => {
    const user = userEvent.setup();
    render(<FloatingRobot />);

    await user.click(screen.getByTestId("floating-robot-button"));
    expect(screen.getByRole("dialog", { name: "Assistente virtual" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fechar modal" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Assistente virtual" })).not.toBeInTheDocument();
    });
  });

  it("permite rolagem quando a resposta é texto longo", async () => {
    const user = userEvent.setup();

    mockApiRequest.mockResolvedValue({
      success: true,
      data: {
        query: "horario de funcionamento",
        found: false,
        total: 0,
        message: "Claro! Aqui estão as informações da Mercadex. ".repeat(20),
        items: [],
      },
    });

    render(<FloatingRobot />);

    await user.click(screen.getByTestId("floating-robot-button"));
    await user.type(screen.getByRole("textbox", { name: "Campo de busca do assistente" }), "horario de funcionamento");
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(screen.getByLabelText("Resposta do assistente")).toHaveClass("overflow-y-auto");
  });
});
