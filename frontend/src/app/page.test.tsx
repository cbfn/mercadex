import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

jest.mock("@/features/auth/model/auth-context", () => ({
  useAuth: () => ({ user: null, isLoading: false, login: jest.fn(), logout: jest.fn(), register: jest.fn() }),
}));

jest.mock("@/shared/lib/api/products", () => ({
  productsApi: {
    list: jest.fn().mockResolvedValue({
      data: {
        items: [
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
            seller: { id: "s1", name: "TechStore", email: "s@e.com", avatarUrl: null },
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        total: 1,
      },
    }),
    listCategories: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

describe("HomePage", () => {
  it("renders the StorefrontPage component with products", async () => {
    render(<HomePage />);

    expect(screen.getByAltText("Mercadex")).toBeInTheDocument();
    expect(await screen.findAllByTestId("product-card")).toHaveLength(1);
  });
});
