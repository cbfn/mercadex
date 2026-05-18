import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, resetCartStore, useCart } from "@/features/cart/model/cart-context";
import { PRODUCTS } from "@/shared/mocks/products";

// CartProvider agora usa useAuth para sincronizar com o backend.
// Nos testes unitários do store, mockamos o contexto de auth sem sessão ativa.
jest.mock("@/features/auth/model/auth-context", () => ({
  useAuth: jest.fn(() => ({ user: null, isLoading: false, login: jest.fn(), logout: jest.fn(), register: jest.fn() })),
}));

jest.mock("@/shared/lib/api/cart", () => ({
  cartApi: {
    get: jest.fn(),
  },
}));

import { useAuth } from "@/features/auth/model/auth-context";
import { cartApi } from "@/shared/lib/api/cart";

const mockUseAuth = useAuth as jest.Mock;
const mockCartGet = cartApi.get as jest.Mock;

function TestHarness() {
  const cart = useCart();
  return (
    <div>
      <span data-testid="qty">{cart.quantity}</span>
      <span data-testid="subtotal">{cart.subtotal}</span>
      <span data-testid="total">{cart.total}</span>
      <span data-testid="is-open">{String(cart.isOpen)}</span>
      <button data-testid="add" onClick={() => cart.addToCart(PRODUCTS[0], 1)}>add</button>
      <button data-testid="add2" onClick={() => cart.addToCart(PRODUCTS[1], 2)}>add2</button>
      <button data-testid="remove" onClick={() => cart.removeFromCart(PRODUCTS[0].id)}>remove</button>
      <button data-testid="inc" onClick={() => cart.updateQty(PRODUCTS[0].id, 1)}>inc</button>
      <button data-testid="dec" onClick={() => cart.updateQty(PRODUCTS[0].id, -1)}>dec</button>
      <button data-testid="open" onClick={cart.openCart}>open</button>
      <button data-testid="close" onClick={cart.closeCart}>close</button>
      <button data-testid="finish" onClick={cart.finishOrder}>finish</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <CartProvider>
      <TestHarness />
    </CartProvider>
  );
}

describe("CartProvider / useCart", () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, login: jest.fn(), logout: jest.fn(), register: jest.fn() });
  });

  it("starts with empty cart", () => {
    renderWithProvider();
    expect(screen.getByTestId("qty")).toHaveTextContent("0");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("0");
    expect(screen.getByTestId("total")).toHaveTextContent("0");
  });

  it("adds a product to cart", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    expect(screen.getByTestId("qty")).toHaveTextContent("1");
    expect(Number(screen.getByTestId("subtotal").textContent)).toBe(PRODUCTS[0].price);
  });

  it("adds multiple products", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("add2"));
    expect(screen.getByTestId("qty")).toHaveTextContent("3"); // 1 + 2
  });

  it("removes a product", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("remove"));
    expect(screen.getByTestId("qty")).toHaveTextContent("0");
  });

  it("increments item quantity", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("inc"));
    expect(screen.getByTestId("qty")).toHaveTextContent("2");
  });

  it("decrements but does not go below 1", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("dec"));
    expect(screen.getByTestId("qty")).toHaveTextContent("1");
  });

  it("opens and closes cart", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    await user.click(screen.getByTestId("open"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    await user.click(screen.getByTestId("close"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  it("finishes order and resets state", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    await user.click(screen.getByTestId("open"));
    expect(screen.getByTestId("qty")).toHaveTextContent("1");

    await user.click(screen.getByTestId("finish"));
    expect(screen.getByTestId("qty")).toHaveTextContent("0");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  it("updates zustand store state after add", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    expect(useCart.getState().items).toHaveLength(1);
  });

  it("works outside provider because state is global", () => {
    function Orphan() {
      const cart = useCart();
      return <span data-testid="orphan-qty">{cart.quantity}</span>;
    }

    render(<Orphan />);
    expect(screen.getByTestId("orphan-qty")).toHaveTextContent("0");
  });

  it("total includes shipping when cart has items", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("add"));
    const subtotal = Number(screen.getByTestId("subtotal").textContent);
    const total = Number(screen.getByTestId("total").textContent);
    expect(total).toBeGreaterThan(subtotal);
  });

  it("isValidCartItem accepts item where id is a valid UUID", () => {
    // Exercise the branch: backendProductId invalid, id valid UUID
    const uuidItem = {
      id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      backendProductId: undefined,
      title: "Produto",
      price: 100,
      image: "",
      condition: "Novo" as const,
      qty: 1,
    };

    useCart.getState().setItemsFromApi([uuidItem as never]);
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].id).toBe(uuidItem.id);
  });

  it("syncs cart from backend when user logs in with empty local cart", async () => {
    const { waitFor } = await import("@testing-library/react");

    mockCartGet.mockResolvedValue({
      data: {
        items: [
          {
            productId: "11111111-1111-4111-8111-111111111111",
            quantity: 2,
            product: {
              title: "iPhone 14 Pro",
              price: 2999,
              images: [],
              condition: "EXCELENTE",
            },
          },
        ],
      },
    });

    // Start unauthenticated
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    const { rerender } = renderWithProvider();

    // Simulate login
    mockUseAuth.mockReturnValue({ user: { id: "user-uuid-123", email: "test@test.com" }, isLoading: false });
    rerender(
      <CartProvider>
        <TestHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(mockCartGet).toHaveBeenCalled();
    });
  });

  it("does not sync from backend if local cart already has items", async () => {
    const { waitFor } = await import("@testing-library/react");

    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    const { rerender } = renderWithProvider();

    // Add item to local cart first
    useCart.getState().addToCart(PRODUCTS[0], 1);

    // Simulate login
    mockUseAuth.mockReturnValue({ user: { id: "user-uuid-456", email: "test@test.com" }, isLoading: false });
    rerender(
      <CartProvider>
        <TestHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(mockCartGet).not.toHaveBeenCalled();
    });
  });
});
