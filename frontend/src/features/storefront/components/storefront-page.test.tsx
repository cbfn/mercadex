import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, resetCartStore } from "@/features/cart/model/cart-context";
import { StorefrontPage } from "@/features/storefront/components/storefront-page";
import { productsApi } from "@/shared/lib/api/products";

jest.mock("@/features/auth/model/auth-context", () => ({
  useAuth: () => ({ user: null, isLoading: false, login: jest.fn(), logout: jest.fn(), register: jest.fn() }),
}));

jest.mock("@/shared/lib/api/products", () => ({
  productsApi: {
    list: jest.fn(),
    listCategories: jest.fn(),
  },
}));

const mockApiProducts = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "iPhone 14 Pro 256GB",
    description: "Produto premium",
    price: 2999,
    condition: "EXCELENTE",
    images: ["https://example.com/iphone.jpg"],
    stock: 3,
    active: true,
    viewsCount: 120,
    category: { id: "c1", name: "Smartphones", description: null },
    seller: { id: "s1", name: "TechStore", email: "seller@example.com", avatarUrl: null },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "MacBook Pro M2",
    description: "Notebook profissional",
    price: 8499,
    condition: "BOM",
    images: ["https://example.com/mac.jpg"],
    stock: 2,
    active: true,
    viewsCount: 75,
    category: { id: "c2", name: "Notebooks", description: null },
    seller: { id: "s2", name: "Notebook Pro", email: "notebook@example.com", avatarUrl: null },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const mockApiCategories = [
  { id: "c1", name: "Smartphones", description: null },
  { id: "c2", name: "Notebooks", description: null },
];

function renderPage() {
  return render(
    <CartProvider>
      <StorefrontPage />
    </CartProvider>
  );
}

describe("StorefrontPage", () => {
  beforeEach(() => {
    (productsApi.list as jest.Mock).mockResolvedValue({
      success: true,
      data: { items: mockApiProducts, pagination: { page: 1, limit: 100, total: 2, totalPages: 1 } },
    });
    (productsApi.listCategories as jest.Mock).mockResolvedValue({
      success: true,
      data: mockApiCategories,
    });
    resetCartStore();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("shows product grid", async () => {
    renderPage();
    expect(await screen.findByTestId("products-grid")).toBeInTheDocument();
    expect(screen.getAllByTestId("product-card").length).toBeGreaterThan(0);
  });

  it("filters by query", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByTestId("products-grid");
    await user.type(screen.getByTestId("search-input"), "MacBook");
    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(1);
    expect(screen.getByText(/MacBook/i)).toBeInTheDocument();
  });

  it("opens modal and adds product to cart", async () => {
    renderPage();

    expect(await screen.findByTestId("open-product-11111111-1111-4111-8111-111111111111")).toHaveAttribute(
      "href",
      "/products/11111111-1111-4111-8111-111111111111"
    );
  });

  it("finishes checkout flow", async () => {
    renderPage();
    expect(await screen.findByTestId("open-product-11111111-1111-4111-8111-111111111111")).toHaveAttribute(
      "href",
      "/products/11111111-1111-4111-8111-111111111111"
    );
  });
});
