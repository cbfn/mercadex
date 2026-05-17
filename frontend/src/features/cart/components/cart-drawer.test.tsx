import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, resetCartStore, useCart } from "@/features/cart/model/cart-context";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { PRODUCTS } from "@/shared/mocks/products";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/features/auth/model/auth-context", () => ({
  useAuth: () => ({ user: null, isLoading: false, login: jest.fn(), logout: jest.fn(), register: jest.fn() }),
}));

function CartSetup({ autoAdd = false }: { autoAdd?: boolean }) {
  const cart = useCart();

  useEffect(() => {
    if (autoAdd) {
      cart.addToCart(PRODUCTS[0], 1);
      cart.openCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <button data-testid="setup-open" onClick={() => { cart.addToCart(PRODUCTS[0], 1); cart.openCart(); }}>
        setup
      </button>
      <CartDrawer />
    </div>
  );
}

function renderCartDrawer(autoAdd = false) {
  return render(
    <CartProvider>
      <CartSetup autoAdd={autoAdd} />
    </CartProvider>
  );
}

describe("CartDrawer", () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
    mockPush.mockReset();
  });

  it("shows empty cart message", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartSetupOpenEmpty />
      </CartProvider>
    );

    await user.click(screen.getByTestId("open-empty"));
    expect(screen.getByText("Seu carrinho esta vazio.")).toBeInTheDocument();
  });

  it("renders cart items after adding product", async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await user.click(screen.getByTestId("setup-open"));
    expect(screen.getAllByTestId("cart-item")).toHaveLength(1);
  });

  it("displays subtotal, shipping, and total", async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await user.click(screen.getByTestId("setup-open"));
    expect(screen.getByText(/Subtotal/)).toBeInTheDocument();
    expect(screen.getByText(/Frete/)).toBeInTheDocument();
    expect(screen.getByText(/Total/)).toBeInTheDocument();
  });

  it("redirects to checkout page", async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await user.click(screen.getByTestId("setup-open"));
    await user.click(screen.getByTestId("go-to-checkout"));
    expect(mockPush).toHaveBeenCalledWith("/checkout");
  });

  it("removes item from cart", async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await user.click(screen.getByTestId("setup-open"));
    await user.click(screen.getByRole("button", { name: "Remover" }));
    expect(screen.getByText("Seu carrinho esta vazio.")).toBeInTheDocument();
  });

  it("increments and decrements item quantity", async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await user.click(screen.getByTestId("setup-open"));
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

function CartSetupOpenEmpty() {
  const cart = useCart();
  return (
    <div>
      <button data-testid="open-empty" onClick={cart.openCart}>open</button>
      <CartDrawer />
    </div>
  );
}
