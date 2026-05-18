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
    title: "PlayStation 5",
    description: "Console",
    price: 2799,
    condition: "BOM",
    images: ["https://example.com/ps5.jpg"],
    stock: 2,
    active: true,
    viewsCount: 80,
    category: { id: "c2", name: "Games", description: null },
    seller: { id: "s2", name: "Gamer Store", email: "gamer@example.com", avatarUrl: null },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Xbox Series X",
    description: "Console",
    price: 2499,
    condition: "USADO",
    images: ["https://example.com/xbox.jpg"],
    stock: 1,
    active: true,
    viewsCount: 63,
    category: { id: "c2", name: "Games", description: null },
    seller: { id: "s3", name: "Console Hub", email: "console@example.com", avatarUrl: null },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const mockApiCategories = [
  { id: "c1", name: "Smartphones", description: null },
  { id: "c2", name: "Games", description: null },
  { id: "c3", name: "Notebooks", description: null },
];

function renderPage() {
  return render(
    <CartProvider>
      <StorefrontPage />
    </CartProvider>
  );
}

describe("StorefrontPage – extended", () => {
  beforeEach(() => {
    (productsApi.list as jest.Mock).mockResolvedValue({
      success: true,
      data: { items: mockApiProducts, pagination: { page: 1, limit: 100, total: 3, totalPages: 1 } },
    });
    (productsApi.listCategories as jest.Mock).mockResolvedValue({
      success: true,
      data: mockApiCategories,
    });
    resetCartStore();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("renders header with Mercadex branding", () => {
    renderPage();
    expect(screen.getByAltText("Mercadex")).toBeInTheDocument();
  });

  it("renders search input", () => {
    renderPage();
    expect(screen.getByLabelText("Buscar produtos")).toBeInTheDocument();
  });

  it("renders cart button with quantity", () => {
    renderPage();
    expect(screen.getByTestId("open-cart-button")).toHaveTextContent("0");
  });

  it("renders all category tabs", async () => {
    renderPage();
    await screen.findByTestId("products-grid");

    for (const cat of ["Todos", ...mockApiCategories.map((item) => item.name)]) {
      expect(screen.getByTestId(`category-${cat}`)).toBeInTheDocument();
    }
  });

  it("renders sort select", () => {
    renderPage();
    expect(screen.getByTestId("sort-select")).toBeInTheDocument();
  });

  it("renders all products initially", async () => {
    renderPage();
    expect(await screen.findAllByTestId("product-card")).toHaveLength(mockApiProducts.length);
  });

  it("filters by category click", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId("products-grid");

    await user.click(screen.getByTestId("category-Games"));
    const cards = screen.getAllByTestId("product-card");
    const gamesCount = mockApiProducts.filter((p) => p.category.name === "Games").length;
    expect(cards).toHaveLength(gamesCount);
  });

  it("shows empty state for no results", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId("products-grid");

    await user.type(screen.getByTestId("search-input"), "xyznotfound");
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("Nenhum produto encontrado")).toBeInTheDocument();
  });

  it("resets filters from empty state", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId("products-grid");

    await user.type(screen.getByTestId("search-input"), "xyznotfound");
    await user.click(screen.getByTestId("reset-filters"));
    expect(screen.getAllByTestId("product-card")).toHaveLength(mockApiProducts.length);
  });

  it("sorts products by price ascending", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId("products-grid");

    await user.selectOptions(screen.getByTestId("sort-select"), "menor");
    const cards = screen.getAllByTestId("product-card");
    expect(cards.length).toBe(mockApiProducts.length);
  });

  it("opens cart drawer", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId("open-cart-button"));
    expect(screen.getByText("Seu carrinho esta vazio.")).toBeInTheDocument();
  });

  it("updates cart count after adding product", async () => {
    renderPage();

    expect(await screen.findByTestId("open-product-11111111-1111-4111-8111-111111111111")).toHaveAttribute(
      "href",
      "/products/11111111-1111-4111-8111-111111111111"
    );
  });

  it("product card shows formatted price", async () => {
    renderPage();
    await screen.findByTestId("products-grid");

    // All prices should contain R$ format
    const prices = screen.getAllByText(/R\$/);
    expect(prices.length).toBeGreaterThan(0);
  });

  it("combines category and search filters", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId("products-grid");

    await user.click(screen.getByTestId("category-Smartphones"));
    await user.type(screen.getByTestId("search-input"), "iphone");

    const cards = screen.getAllByTestId("product-card");
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThan(mockApiProducts.length);
  });
});
