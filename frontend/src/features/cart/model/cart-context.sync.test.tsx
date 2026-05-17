import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, resetCartStore, useCart } from '@/features/cart/model/cart-context';

let mockUserResult: { id: string } | null = null;

jest.mock('@/features/auth/model/auth-context', () => ({
  useAuth: () => ({
    user: mockUserResult,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  }),
}));

const mockCartGet = jest.fn();

jest.mock('@/shared/lib/api/cart', () => ({
  cartApi: {
    get: (...args: unknown[]) => mockCartGet(...args),
  },
}));

function TestChild() {
  const cart = useCart();
  return (
    <div>
      <span data-testid="qty">{cart.quantity}</span>
      <span data-testid="tab">{cart.paymentTab}</span>
      <button data-testid="set-tab-credit" onClick={() => cart.setTab('credit')}>
        set-credit
      </button>
      <button data-testid="set-tab-pix" onClick={() => cart.setTab('pix')}>
        set-pix
      </button>
      <button data-testid="set-items" onClick={() => cart.setItemsFromApi([])}>
        set-items
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <CartProvider>
      <TestChild />
    </CartProvider>,
  );
}

describe('CartProvider – setTab', () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
    mockUserResult = null;
    mockCartGet.mockReset();
    mockCartGet.mockResolvedValue({ data: { items: [], total: 0, id: 'c1', userId: 'u1' } });
  });

  it('começa com paymentTab "pix"', () => {
    renderProvider();
    expect(screen.getByTestId('tab')).toHaveTextContent('pix');
  });

  it('setTab atualiza paymentTab para credit', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByTestId('set-tab-credit'));
    expect(screen.getByTestId('tab')).toHaveTextContent('credit');
  });

  it('setTab atualiza paymentTab de volta para pix', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByTestId('set-tab-credit'));
    await user.click(screen.getByTestId('set-tab-pix'));
    expect(screen.getByTestId('tab')).toHaveTextContent('pix');
  });
});

describe('CartProvider – setItemsFromApi', () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
    mockUserResult = null;
    mockCartGet.mockReset();
    mockCartGet.mockResolvedValue({ data: { items: [], total: 0, id: 'c1', userId: 'u1' } });
  });

  it('setItemsFromApi atualiza itens e recalcula derivados', async () => {
    const user = userEvent.setup();
    renderProvider();

    expect(screen.getByTestId('qty')).toHaveTextContent('0');
    await user.click(screen.getByTestId('set-items'));
    expect(screen.getByTestId('qty')).toHaveTextContent('0');
  });
});

describe('CartProvider – sincronização com backend', () => {
  beforeEach(() => {
    resetCartStore();
    localStorage.clear();
    mockCartGet.mockReset();
  });

  it('não faz fetch quando user é null', async () => {
    mockUserResult = null;
    mockCartGet.mockResolvedValue({ data: { items: [], total: 0, id: 'c1', userId: 'u1' } });

    renderProvider();
    await waitFor(() => {});

    expect(mockCartGet).not.toHaveBeenCalled();
  });

  it('busca carrinho do backend quando usuário faz login', async () => {
    const apiItem = {
      id: 'item-1',
      cartId: 'cart-1',
      productId: 'prod-1',
      quantity: 2,
      product: {
        id: 'prod-1',
        title: 'Test Product',
        price: 100,
        images: ['image.jpg'],
        condition: 'NOVO' as const,
        stock: 5,
      },
    };

    mockUserResult = { id: 'user-1' };
    mockCartGet.mockResolvedValueOnce({
      data: { items: [apiItem], total: 200, id: 'cart-1', userId: 'user-1' },
    });

    renderProvider();

    await waitFor(() => {
      expect(mockCartGet).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(useCart.getState().quantity).toBe(2);
    });
  });

  it('não atualiza estado quando API retorna itens vazios', async () => {
    mockUserResult = { id: 'user-1' };
    mockCartGet.mockResolvedValueOnce({
      data: { items: [], total: 0, id: 'cart-1', userId: 'user-1' },
    });

    renderProvider();

    await waitFor(() => {
      expect(mockCartGet).toHaveBeenCalled();
    });

    expect(useCart.getState().quantity).toBe(0);
  });

  it('ignora erros de API silenciosamente', async () => {
    mockUserResult = { id: 'user-1' };
    mockCartGet.mockRejectedValueOnce(new Error('Backend not available'));

    renderProvider();

    await waitFor(() => {
      expect(mockCartGet).toHaveBeenCalled();
    });

    expect(useCart.getState().quantity).toBe(0);
  });

  it('mapeia condition NOVO para "Novo"', async () => {
    const apiItem = {
      id: 'i1', cartId: 'c1', productId: 'p1', quantity: 1,
      product: { id: 'p1', title: 'P', price: 100, images: [], condition: 'NOVO' as const, stock: 1 },
    };

    mockUserResult = { id: 'user-1' };
    mockCartGet.mockResolvedValueOnce({ data: { items: [apiItem], total: 100, id: 'c1', userId: 'u1' } });

    renderProvider();

    await waitFor(() => expect(useCart.getState().items).toHaveLength(1));
    expect(useCart.getState().items[0].condition).toBe('Novo');
  });

  it('mapeia condition EXCELENTE para "Excelente"', async () => {
    const apiItem = {
      id: 'i1', cartId: 'c1', productId: 'p1', quantity: 1,
      product: { id: 'p1', title: 'P', price: 100, images: [], condition: 'EXCELENTE' as const, stock: 1 },
    };

    mockUserResult = { id: 'user-1' };
    mockCartGet.mockResolvedValueOnce({ data: { items: [apiItem], total: 100, id: 'c1', userId: 'u1' } });

    renderProvider();

    await waitFor(() => expect(useCart.getState().items).toHaveLength(1));
    expect(useCart.getState().items[0].condition).toBe('Excelente');
  });

  it('mapeia condition BOM para "Bom"', async () => {
    const apiItem = {
      id: 'i1', cartId: 'c1', productId: 'p1', quantity: 1,
      product: { id: 'p1', title: 'P', price: 100, images: [], condition: 'BOM' as const, stock: 1 },
    };

    mockUserResult = { id: 'user-1' };
    mockCartGet.mockResolvedValueOnce({ data: { items: [apiItem], total: 100, id: 'c1', userId: 'u1' } });

    renderProvider();

    await waitFor(() => expect(useCart.getState().items).toHaveLength(1));
    expect(useCart.getState().items[0].condition).toBe('Bom');
  });

  it('mapeia condition USADO para "Usado"', async () => {
    const apiItem = {
      id: 'i1', cartId: 'c1', productId: 'p1', quantity: 1,
      product: { id: 'p1', title: 'P', price: 100, images: [], condition: 'USADO' as const, stock: 1 },
    };

    mockUserResult = { id: 'user-1' };
    mockCartGet.mockResolvedValueOnce({ data: { items: [apiItem], total: 100, id: 'c1', userId: 'u1' } });

    renderProvider();

    await waitFor(() => expect(useCart.getState().items).toHaveLength(1));
    expect(useCart.getState().items[0].condition).toBe('Usado');
  });

  it('usa index como id numérico ao mapear item do backend', async () => {
    const apiItems = [
      {
        id: 'i1', cartId: 'c1', productId: 'p1', quantity: 1,
        product: { id: 'p1', title: 'A', price: 50, images: ['a.jpg'], condition: 'NOVO' as const, stock: 2 },
      },
      {
        id: 'i2', cartId: 'c1', productId: 'p2', quantity: 3,
        product: { id: 'p2', title: 'B', price: 80, images: [], condition: 'USADO' as const, stock: 1 },
      },
    ];

    mockUserResult = { id: 'user-1' };
    mockCartGet.mockResolvedValueOnce({ data: { items: apiItems, total: 290, id: 'c1', userId: 'u1' } });

    renderProvider();

    await waitFor(() => expect(useCart.getState().items).toHaveLength(2));

    const items = useCart.getState().items;
    expect(items[0].id).toBe(0);
    expect(items[1].id).toBe(1);
    expect(items[0].image).toBe('a.jpg');
    expect(items[1].image).toBe('');
    expect(useCart.getState().quantity).toBe(4);
  });
});
