import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, resetCartStore, useCart } from '@/features/cart/model/cart-context';
import { CartDrawer } from '@/features/cart/components/cart-drawer';
import { PRODUCTS } from '@/shared/mocks/products';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/auth/model/auth-context', () => ({
  useAuth: () => ({ user: null, isLoading: false, login: jest.fn(), logout: jest.fn(), register: jest.fn() }),
}));

function CartSetup() {
  const cart = useCart();

  useEffect(() => {
    cart.addToCart(PRODUCTS[0], 1);
    cart.openCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <CartDrawer />;
}

function renderCartDrawer() {
  return render(
    <CartProvider>
      <CartSetup />
    </CartProvider>,
  );
}

describe('CartDrawer – fluxo integrado ao /checkout', () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
    mockPush.mockReset();
  });

  it('renderiza itens e totais quando carrinho tem produtos', () => {
    renderCartDrawer();

    expect(screen.getByTestId('cart-step')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item')).toBeInTheDocument();
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/frete/i)).toBeInTheDocument();
    expect(screen.getAllByText(/total/i).length).toBeGreaterThan(0);
  });

  it('redireciona para /checkout ao clicar em finalizar compra', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await user.click(screen.getByTestId('go-to-checkout'));

    expect(mockPush).toHaveBeenCalledWith('/checkout');
  });

  it('remove item do carrinho pelo botao remover', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await user.click(screen.getByRole('button', { name: /remover/i }));

    expect(screen.getByText(/seu carrinho esta vazio/i)).toBeInTheDocument();
  });

  it('atualiza quantidade com botoes de incremento/decremento', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    const plusButtons = screen.getAllByRole('button', { name: '+' });
    await user.click(plusButtons[0]);
    expect(screen.getByText('2')).toBeInTheDocument();

    const minusButtons = screen.getAllByRole('button', { name: '-' });
    await user.click(minusButtons[0]);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
