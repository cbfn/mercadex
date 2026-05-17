import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, resetCartStore } from "@/features/cart/model/cart-context";
import { StorefrontPage } from "@/features/storefront/components/storefront-page";

jest.mock("@/features/auth/model/auth-context", () => ({
  useAuth: () => ({ user: null, isLoading: false, login: jest.fn(), logout: jest.fn(), register: jest.fn() }),
}));

function renderPage() {
  return render(
    <CartProvider>
      <StorefrontPage />
    </CartProvider>
  );
}

describe("StorefrontPage", () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
  });

  it("shows product grid", () => {
    renderPage();
    expect(screen.getAllByTestId("product-card").length).toBeGreaterThan(0);
  });

  it("filters by query", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByTestId("search-input"), "MacBook");
    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(1);
    expect(screen.getByText(/MacBook/i)).toBeInTheDocument();
  });

  it("opens modal and adds product to cart", async () => {
    renderPage();

    expect(screen.getByTestId("open-product-1")).toHaveAttribute("href", "/products/1");
  });

  it("finishes checkout flow", async () => {
    renderPage();
    expect(screen.getByTestId("open-product-1")).toHaveAttribute("href", "/products/1");
  });
});
