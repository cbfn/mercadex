import { useEffect } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, resetCartStore, useCart } from '@/features/cart/model/cart-context';
import { CartDrawer } from '@/features/cart/components/cart-drawer';
import { PRODUCTS } from '@/shared/mocks/products';

jest.mock('@/features/auth/model/auth-context', () => ({
  useAuth: () => ({ user: null, isLoading: false, login: jest.fn(), logout: jest.fn(), register: jest.fn() }),
}));

const mockWriteText = jest.fn().mockResolvedValue(undefined);

// Garante que navigator.clipboard existe antes de espionar
beforeAll(() => {
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn() },
      configurable: true,
      writable: true,
    });
  }
  jest.spyOn(navigator.clipboard, 'writeText').mockImplementation(mockWriteText);
});

function CartSetup() {
  const cart = useCart();
  return (
    <div>
      <button
        data-testid="setup-open"
        onClick={() => {
          cart.addToCart(PRODUCTS[0], 1);
          cart.openCart();
        }}
      >
        open
      </button>
      <CartDrawer />
    </div>
  );
}

function renderCartDrawer() {
  return render(
    <CartProvider>
      <CartSetup />
    </CartProvider>,
  );
}

async function navigateToPayment(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('setup-open'));
  await user.click(screen.getByTestId('go-to-delivery'));
  // Usa fireEvent.submit para contornar validação HTML5 dos campos required
  fireEvent.submit(screen.getByTestId('delivery-step'));
}

describe('CartDrawer – etapas estendidas', () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
    mockWriteText.mockClear();
    mockWriteText.mockResolvedValue(undefined);
  });

  it('navega carrinho → entrega → pagamento via envio do formulário', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await user.click(screen.getByTestId('setup-open'));
    await user.click(screen.getByTestId('go-to-delivery'));
    expect(screen.getByTestId('delivery-step')).toBeInTheDocument();

    fireEvent.submit(screen.getByTestId('delivery-step'));
    expect(screen.getByTestId('payment-step')).toBeInTheDocument();
  });

  it('etapa de pagamento exibe informações PIX', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await navigateToPayment(user);

    expect(screen.getByTestId('pix-content')).toBeInTheDocument();
    expect(screen.getByText(/mercadex@pagamentos/i)).toBeInTheDocument();
    expect(screen.getByTestId('pix-qrcode')).toBeInTheDocument();
  });

  it('botão copiar exibe chave PIX na interface', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await navigateToPayment(user);

    // Verifica que a chave PIX está visível para o usuário copiar
    expect(screen.getByText('mercadex@pagamentos.com.br')).toBeInTheDocument();
    expect(screen.getByTestId('copy-pix-button')).toBeInTheDocument();
  });

  it('botão copiar exibe "Copiado!" após clique', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await navigateToPayment(user);

    const copyBtn = screen.getByTestId('copy-pix-button');
    expect(copyBtn).toHaveTextContent(/copiar chave/i);

    await user.click(copyBtn);

    await waitFor(() => {
      expect(screen.getByTestId('copy-pix-button')).toHaveTextContent(/copiado/i);
    });
  });

  it('botão confirmar pedido fica habilitado após envio da entrega', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await navigateToPayment(user);

    const confirmBtn = screen.getByTestId('confirm-order-button');
    expect(confirmBtn).not.toBeDisabled();
  });

  it('navega para etapa de confirmação após clicar em Confirmar pedido', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await navigateToPayment(user);
    await user.click(screen.getByTestId('confirm-order-button'));

    expect(screen.getByTestId('confirm-step')).toBeInTheDocument();
  });

  it('etapa de confirmação exibe número do pedido e status', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await navigateToPayment(user);
    await user.click(screen.getByTestId('confirm-order-button'));

    expect(screen.getByText(/pedido confirmado/i)).toBeInTheDocument();
    expect(screen.getByTestId('order-status')).toBeInTheDocument();
    expect(screen.getByTestId('order-validity')).toBeInTheDocument();
  });

  it('etapa de confirmação exibe itens do pedido', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await navigateToPayment(user);
    await user.click(screen.getByTestId('confirm-order-button'));

    expect(screen.getByText(new RegExp(PRODUCTS[0].title))).toBeInTheDocument();
  });

  it('botão Continuar comprando limpa carrinho e fecha drawer', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await navigateToPayment(user);
    await user.click(screen.getByTestId('confirm-order-button'));
    await user.click(screen.getByTestId('finish-order-button'));

    expect(useCart.getState().items).toHaveLength(0);
    expect(useCart.getState().isOpen).toBe(false);
  });

  it('botão Voltar na etapa de pagamento retorna para entrega', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await navigateToPayment(user);

    const backButtons = screen.getAllByText('Voltar');
    await user.click(backButtons[0]);

    expect(screen.getByTestId('delivery-step')).toBeInTheDocument();
  });

  it('botão – decrementa quantidade de item no carrinho', async () => {
    const user = userEvent.setup();
    renderCartDrawer();

    await user.click(screen.getByTestId('setup-open'));

    const plusButtons = screen.getAllByRole('button', { name: '+' });
    await user.click(plusButtons[0]);
    expect(screen.getByText('2')).toBeInTheDocument();

    const minusButtons = screen.getAllByRole('button', { name: '-' });
    await user.click(minusButtons[0]);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
