import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutPage } from './checkout-page';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockFinishOrder = jest.fn();
const mockApiRequest = jest.fn();
const mockToastSuccess = jest.fn();
let mockCartItems: Array<{
  id: number | string;
  backendProductId?: string;
  title: string;
  price: number;
  qty: number;
}> = [];

let mockUser: { id: string; name: string; role: 'CUSTOMER' | 'ADMIN' } | null = {
  id: 'u1',
  name: 'Ana',
  role: 'CUSTOMER',
};
let mockIsAuthLoading = false;

jest.mock('@/features/cart/model/cart-context', () => ({
  useCart: () => ({
    items: mockCartItems,
    finishOrder: mockFinishOrder,
  }),
}));

jest.mock('@/features/auth/model/auth-context', () => ({
  useAuth: () => ({ user: mockUser, isLoading: mockIsAuthLoading }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
}));

jest.mock('@/shared/lib/api-client', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

describe('CheckoutPage', () => {
  beforeEach(() => {
    mockCartItems = [
      {
        id: 1,
        backendProductId: '11111111-1111-4111-8111-111111111111',
        title: 'iPhone',
        price: 4999,
        qty: 1,
      },
    ];
    mockUser = { id: 'u1', name: 'Ana', role: 'CUSTOMER' };
    mockIsAuthLoading = false;
    mockPush.mockReset();
    mockReplace.mockReset();
    mockBack.mockReset();
    mockFinishOrder.mockReset();
    mockApiRequest.mockReset();
    mockToastSuccess.mockReset();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ city: 'Sao Paulo', state: 'SP' }),
    } as Response);
  });

  it('renderiza etapa de endereco por padrao', () => {
    render(<CheckoutPage />);

    expect(screen.getByTestId('address-step')).toBeInTheDocument();
    expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar para pagamento/i })).toBeDisabled();
  });

  it('preenche cidade e estado via CEP e avanca para etapa pix', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/cep/i), '01001-000');

    await waitFor(() => {
      expect(screen.getByLabelText(/cidade/i)).toHaveValue('Sao Paulo');
      expect(screen.getByLabelText(/estado/i)).toHaveValue('SP');
    });

    await user.type(screen.getByLabelText(/rua/i), 'Rua das Flores');
    await user.type(screen.getByLabelText(/numero/i), '123');

    await user.click(screen.getByRole('button', { name: /continuar para pagamento/i }));

    expect(screen.getByTestId('pix-step')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar pedido/i })).toBeInTheDocument();
  });

  it('envia pedido e redireciona quando confirmacao da certo', async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValue({ success: true, data: { id: 'order-1' } });

    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/cep/i), '01001-000');
    await waitFor(() => {
      expect(screen.getByLabelText(/cidade/i)).toHaveValue('Sao Paulo');
      expect(screen.getByLabelText(/estado/i)).toHaveValue('SP');
    });

    await user.type(screen.getByLabelText(/rua/i), 'Rua das Flores');
    await user.type(screen.getByLabelText(/numero/i), '123');
    await user.type(screen.getByLabelText(/complemento/i), 'Apto 12');
    await user.click(screen.getByRole('button', { name: /continuar para pagamento/i }));

    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 1 }],
          shippingAddress: {
            cep: '01001000',
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 12',
            city: 'Sao Paulo',
            state: 'SP',
          },
        }),
      });
    });

    expect(mockFinishOrder).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/orders/order-1');
  });

  it('permite preenchimento manual quando consulta CEP falha', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false } as Response);

    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/cep/i), '01001-000');

    expect(await screen.findByRole('status')).toHaveTextContent(/falha ao consultar o cep|nao foi possivel/i);
  });

  it('mostra erro quando criacao do pedido falha', async () => {
    const user = userEvent.setup();
    mockApiRequest.mockRejectedValue(new Error('order failed'));

    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/cep/i), '01001-000');
    await waitFor(() => {
      expect(screen.getByLabelText(/cidade/i)).toHaveValue('Sao Paulo');
      expect(screen.getByLabelText(/estado/i)).toHaveValue('SP');
    });

    await user.type(screen.getByLabelText(/rua/i), 'Rua das Flores');
    await user.type(screen.getByLabelText(/numero/i), '123');
    await user.click(screen.getByRole('button', { name: /continuar para pagamento/i }));
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/erro ao criar pedido/i);
    expect(mockFinishOrder).not.toHaveBeenCalled();
  });

  it('redireciona para login quando nao existe usuario autenticado', async () => {
    mockUser = null;

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login?redirect=/checkout');
    });
  });

  it('busca productId na API quando item nao possui backendProductId', async () => {
    const user = userEvent.setup();
    mockCartItems = [
      {
        id: 1,
        title: 'iPhone',
        price: 4999,
        qty: 1,
      },
    ];

    mockApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: {
          items: [{ id: '22222222-2222-4222-8222-222222222222', title: 'iPhone' }],
        },
      })
      .mockResolvedValueOnce({ success: true, data: { id: 'order-1' } });

    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/cep/i), '01001-000');
    await waitFor(() => {
      expect(screen.getByLabelText(/cidade/i)).toHaveValue('Sao Paulo');
      expect(screen.getByLabelText(/estado/i)).toHaveValue('SP');
    });

    await user.type(screen.getByLabelText(/rua/i), 'Rua das Flores');
    await user.type(screen.getByLabelText(/numero/i), '123');
    await user.click(screen.getByRole('button', { name: /continuar para pagamento/i }));
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenNthCalledWith(1, '/api/products?search=iPhone&limit=20', {
        skipAuth: true,
      });
      expect(mockApiRequest).toHaveBeenNthCalledWith(2, '/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: '22222222-2222-4222-8222-222222222222', quantity: 1 }],
          shippingAddress: {
            cep: '01001000',
            street: 'Rua das Flores',
            number: '123',
            complement: undefined,
            city: 'Sao Paulo',
            state: 'SP',
          },
        }),
      });
    });
  });

  it('mostra erro quando nao consegue resolver productId para checkout', async () => {
    const user = userEvent.setup();
    mockCartItems = [
      {
        id: 1,
        title: 'Produto sem mapeamento',
        price: 4999,
        qty: 1,
      },
    ];

    mockApiRequest.mockResolvedValueOnce({ success: true, data: { items: [] } });

    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/cep/i), '01001-000');
    await waitFor(() => {
      expect(screen.getByLabelText(/cidade/i)).toHaveValue('Sao Paulo');
      expect(screen.getByLabelText(/estado/i)).toHaveValue('SP');
    });

    await user.type(screen.getByLabelText(/rua/i), 'Rua das Flores');
    await user.type(screen.getByLabelText(/numero/i), '123');
    await user.click(screen.getByRole('button', { name: /continuar para pagamento/i }));
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/nao foi possivel identificar um ou mais produtos/i);
    expect(mockFinishOrder).not.toHaveBeenCalled();
  });
});