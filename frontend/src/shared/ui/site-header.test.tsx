import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteHeader } from "@/shared/ui/site-header";

// Radix UI's NavigationMenuContent uses ResizeObserver which is unavailable in JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockLogout = jest.fn();
const mockOpenCart = jest.fn();

jest.mock("@/features/auth/model/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/features/cart/model/cart-context", () => ({
  useCart: jest.fn(),
}));

import { useAuth } from "@/features/auth/model/auth-context";
import { useCart } from "@/features/cart/model/cart-context";

const mockUseAuth = useAuth as unknown as jest.Mock;
const mockUseCart = useCart as unknown as jest.Mock;

describe("SiteHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCart.mockReturnValue({ quantity: 0, openCart: mockOpenCart });
  });

  describe("when unauthenticated", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null, isLoading: false, logout: mockLogout });
    });

    it("renders the Mercadex logo link", () => {
      render(<SiteHeader />);
      expect(screen.getByRole("link", { name: "Mercadex" })).toBeInTheDocument();
    });

    it("shows login link when user is not authenticated", () => {
      render(<SiteHeader />);
      expect(screen.getByTestId("login-button")).toBeInTheDocument();
      expect(screen.getByTestId("login-button")).toHaveTextContent("Entrar");
    });

    it("does not show user nav trigger when unauthenticated", () => {
      render(<SiteHeader />);
      expect(screen.queryByTestId("user-nav-trigger")).not.toBeInTheDocument();
    });

    it("renders cart button with zero quantity", () => {
      render(<SiteHeader />);
      expect(screen.getByTestId("open-cart-button")).toBeInTheDocument();
      expect(screen.getByTestId("open-cart-button")).toHaveTextContent("0");
    });

    it("calls openCart when cart button is clicked", async () => {
      const user = userEvent.setup();
      render(<SiteHeader />);

      await user.click(screen.getByTestId("open-cart-button"));

      expect(mockOpenCart).toHaveBeenCalledTimes(1);
    });

    it("renders cart button with correct quantity", () => {
      mockUseCart.mockReturnValue({ quantity: 3, openCart: mockOpenCart });
      render(<SiteHeader />);

      expect(screen.getByTestId("open-cart-button")).toHaveTextContent("3");
    });

    it("does not render children slot when no children passed", () => {
      render(<SiteHeader />);
      // no slot wrapper rendered — spacer div used instead
      expect(screen.queryByTestId("search-slot")).not.toBeInTheDocument();
    });

    it("renders children slot when children are passed", () => {
      render(
        <SiteHeader>
          <input data-testid="search-slot" placeholder="Buscar..." />
        </SiteHeader>
      );

      expect(screen.getByTestId("search-slot")).toBeInTheDocument();
    });
  });

  describe("when authenticated", () => {
    const mockUser = { id: "uuid-1", name: "João Silva", email: "joao@example.com" };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser, isLoading: false, logout: mockLogout });
    });

    it("shows user navigation trigger with user name", () => {
      render(<SiteHeader />);
      expect(screen.getByTestId("user-nav-trigger")).toHaveTextContent("João Silva");
    });

    it("shows email when user has no name", () => {
      mockUseAuth.mockReturnValue({
        user: { id: "uuid-2", name: undefined, email: "test@mercadex.com" },
        isLoading: false,
        logout: mockLogout,
      });
      render(<SiteHeader />);

      expect(screen.getByTestId("user-nav-trigger")).toHaveTextContent("test@mercadex.com");
    });

    it("does not show login link when authenticated", () => {
      render(<SiteHeader />);
      expect(screen.queryByTestId("login-button")).not.toBeInTheDocument();
    });

    it("shows orders link inside user menu", async () => {
      const user = userEvent.setup();
      render(<SiteHeader />);

      await user.click(screen.getByTestId("user-nav-trigger"));
      expect(screen.getByTestId("nav-orders-link")).toBeInTheDocument();
      expect(screen.getByTestId("nav-orders-link")).toHaveAttribute("href", "/orders");
    });

    it("calls logout when logout button is clicked", async () => {
      const user = userEvent.setup();
      render(<SiteHeader />);

      await user.click(screen.getByTestId("user-nav-trigger"));
      await user.click(screen.getByTestId("logout-button"));

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe("when auth is loading", () => {
    it("does not render user nav or login while loading", () => {
      mockUseAuth.mockReturnValue({ user: null, isLoading: true, logout: mockLogout });
      render(<SiteHeader />);

      expect(screen.queryByTestId("login-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("user-nav-trigger")).not.toBeInTheDocument();
    });
  });
});
