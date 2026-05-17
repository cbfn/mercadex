import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewForm } from './review-form';

const mockCreate = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/features/auth/model/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/shared/lib/api/reviews', () => ({
  reviewsApi: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

const mockUser = { id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'CUSTOMER' as const };

beforeEach(() => {
  mockCreate.mockReset();
  mockUseAuth.mockReturnValue({ user: mockUser });
});

describe('ReviewForm', () => {
  it('não renderiza nada quando usuário não está autenticado', () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { container } = render(<ReviewForm productId="p1" onSuccess={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza campos de nota, título e avaliação quando autenticado', () => {
    render(<ReviewForm productId="p1" onSuccess={jest.fn()} />);
    expect(screen.getByLabelText(/nota/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comentário/i)).toBeInTheDocument();
  });

  it('chama onSuccess e limpa os campos após envio bem-sucedido', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    mockCreate.mockResolvedValueOnce({ success: true, data: {} });

    render(<ReviewForm productId="p1" onSuccess={onSuccess} />);

    await user.clear(screen.getByLabelText(/título/i));
    await user.type(screen.getByLabelText(/título/i), 'Muito bom');
    await user.clear(screen.getByLabelText(/comentário/i));
    await user.type(screen.getByLabelText(/comentário/i), 'Produto excelente!');
    await user.click(screen.getByRole('button', { name: /enviar avaliação/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText(/título/i)).toHaveValue('');
    expect(screen.getByLabelText(/comentário/i)).toHaveValue('');
  });

  it('exibe mensagem de erro quando a API falha', async () => {
    const user = userEvent.setup();
    mockCreate.mockRejectedValueOnce(new Error('Server error'));

    render(<ReviewForm productId="p1" onSuccess={jest.fn()} />);

    await user.type(screen.getByLabelText(/título/i), 'Título');
    await user.type(screen.getByLabelText(/comentário/i), 'Corpo');
    await user.click(screen.getByRole('button', { name: /enviar avaliação/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/não foi possível enviar/i);
  });

  it('chama reviewsApi.create com os dados do produto e do formulário', async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValueOnce({ success: true, data: {} });

    render(<ReviewForm productId="produto-123" onSuccess={jest.fn()} />);

    await user.type(screen.getByLabelText(/título/i), 'Top');
    await user.type(screen.getByLabelText(/comentário/i), 'Valeu a pena.');
    await user.click(screen.getByRole('button', { name: /enviar avaliação/i }));

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith('produto-123', {
        rating: 5,
        title: 'Top',
        body: 'Valeu a pena.',
      }),
    );
  });
});
