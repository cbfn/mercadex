import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductPage from "./page";
import { productsApi } from "@/shared/lib/api/products";
import { ApiError } from "@/shared/lib/api-client";

const mockAddToCart = jest.fn();
const mockOpenCart = jest.fn();
const mockSearchParamsGet = jest.fn();

jest.mock("@/features/cart/model/cart-context", () => ({
  useCart: () => ({
    quantity: 0,
    addToCart: mockAddToCart,
    openCart: mockOpenCart,
  }),
}));

jest.mock("@/features/auth/model/auth-context", () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock("@/shared/lib/api/products", () => ({
  productsApi: {
    get: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

jest.mock("@/features/cart/components/cart-drawer", () => ({
  CartDrawer: () => <div data-testid="cart-drawer" />,
}));

jest.mock("@/features/product-detail/components/reviews-drawer", () => ({
  ReviewsDrawer: ({ productId, productTitle }: { productId: string; productTitle: string }) => (
    <div data-testid="reviews-drawer">{productId}:{productTitle}</div>
  ),
}));

const apiProduct = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "iPhone 14 Pro 256GB",
  description: "Detalhes completos",
  price: 2999,
  condition: "EXCELENTE" as const,
  images: ["https://example.com/iphone.jpg"],
  stock: 3,
  active: true,
  viewsCount: 120,
  category: { id: "cat-1", name: "Smartphones", description: null },
  seller: { id: "seller-1", name: "TechStore", email: "seller@example.com", avatarUrl: null },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("ProductPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParamsGet.mockReturnValue(null);
    (productsApi.get as jest.Mock).mockResolvedValue({ success: true, data: apiProduct });
  });

  function renderPage(id = apiProduct.id) {
    return render(<ProductPage params={Promise.resolve({ id })} />);
  }

  it("renderiza loading e depois dados do produto da API", async () => {
    renderPage();

    expect(await screen.findByTestId("product-loading")).toBeInTheDocument();
    expect(await screen.findByText("iPhone 14 Pro 256GB")).toBeInTheDocument();
    expect(screen.getByTestId("product-page-content")).toBeInTheDocument();
    expect(productsApi.get).toHaveBeenCalledWith(apiProduct.id);
  });

  it("renderiza estado de nao encontrado quando API retorna 404", async () => {
    (productsApi.get as jest.Mock).mockRejectedValueOnce(new ApiError(404, {}));

    renderPage("missing-id");

    expect(await screen.findByTestId("product-not-found")).toBeInTheDocument();
    expect(screen.getByText(/produto nao encontrado/i)).toBeInTheDocument();
  });

  it("renderiza estado de erro e permite tentar novamente", async () => {
    const user = userEvent.setup();

    (productsApi.get as jest.Mock)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ success: true, data: apiProduct });

    renderPage();

    expect(await screen.findByTestId("product-error")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    await waitFor(() => {
      expect(productsApi.get).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("iPhone 14 Pro 256GB")).toBeInTheDocument();
  });

  it("adiciona produto ao carrinho com backendProductId", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText("iPhone 14 Pro 256GB");
    await user.click(screen.getByTestId("modal-add-to-cart"));

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        id: apiProduct.id,
        backendProductId: apiProduct.id,
        title: apiProduct.title,
      }),
      1
    );
    expect(mockOpenCart).toHaveBeenCalledTimes(1);
  });
});
