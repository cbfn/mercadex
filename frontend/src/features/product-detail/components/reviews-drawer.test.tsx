import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewsDrawer } from './reviews-drawer';

const mockList = jest.fn();
const mockUseAuth = jest.fn();
const mockPush = jest.fn();

jest.mock('@/shared/lib/api/reviews', () => ({
  reviewsApi: {
    list: (...args: unknown[]) => mockList(...args),
  },
}));

jest.mock('@/features/auth/model/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Stub sub-components to keep tests focused on the orchestrator
jest.mock('./review-list', () => ({
  ReviewList: ({ reviews }: { reviews: unknown[] }) => (
    <div data-testid="review-list">reviews: {reviews.length}</div>
  ),
}));

jest.mock('./review-form', () => ({
  ReviewForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <button data-testid="review-form-submit" onClick={onSuccess}>
      Enviar
    </button>
  ),
}));

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  productId: 'produto-42',
  productTitle: 'iPhone 14',
};

const mockUser = { id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'CUSTOMER' as const };

beforeEach(() => {
  mockList.mockReset();
  mockPush.mockReset();
  mockList.mockResolvedValue({ success: true, data: [] });
  mockUseAuth.mockReturnValue({ user: null });
});

describe('ReviewsDrawer', () => {
  it('busca reviews ao abrir o drawer', async () => {
    render(<ReviewsDrawer {...defaultProps} />);

    await waitFor(() => expect(mockList).toHaveBeenCalledWith('produto-42'));
    expect(screen.getByTestId('review-list')).toBeInTheDocument();
  });

  it('exibe botão "Entrar e avaliar" quando usuário não está autenticado', async () => {
    render(<ReviewsDrawer {...defaultProps} />);

    await waitFor(() => screen.getByTestId('review-list'));
    expect(screen.getByTestId('login-to-review-button')).toBeInTheDocument();
  });

  it('redireciona para login com returnTo correto ao clicar em "Entrar e avaliar"', async () => {
    const user = userEvent.setup();
    render(<ReviewsDrawer {...defaultProps} />);

    await waitFor(() => screen.getByTestId('login-to-review-button'));
    await user.click(screen.getByTestId('login-to-review-button'));

    expect(mockPush).toHaveBeenCalledWith(
      `/login?redirect=${encodeURIComponent('/products/produto-42?reviews=open')}`,
    );
  });

  it('exibe botão "Escrever avaliação" quando usuário está autenticado', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });
    render(<ReviewsDrawer {...defaultProps} />);

    await waitFor(() => screen.getByTestId('show-review-form-button'));
    expect(screen.getByTestId('show-review-form-button')).toBeInTheDocument();
    expect(screen.queryByTestId('login-to-review-button')).not.toBeInTheDocument();
  });

  it('exibe formulário após clicar em "Escrever avaliação"', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: mockUser });
    render(<ReviewsDrawer {...defaultProps} />);

    await waitFor(() => screen.getByTestId('show-review-form-button'));
    await user.click(screen.getByTestId('show-review-form-button'));

    expect(screen.getByTestId('review-form-submit')).toBeInTheDocument();
    expect(screen.queryByTestId('show-review-form-button')).not.toBeInTheDocument();
  });

  it('refetch reviews e oculta formulário após envio bem-sucedido', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: mockUser });
    render(<ReviewsDrawer {...defaultProps} />);

    await waitFor(() => screen.getByTestId('show-review-form-button'));
    await user.click(screen.getByTestId('show-review-form-button'));
    await user.click(screen.getByTestId('review-form-submit'));

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
    expect(screen.queryByTestId('review-form-submit')).not.toBeInTheDocument();
    expect(screen.getByTestId('show-review-form-button')).toBeInTheDocument();
  });

  it('não busca reviews quando drawer está fechado', () => {
    render(<ReviewsDrawer {...defaultProps} open={false} />);
    expect(mockList).not.toHaveBeenCalled();
  });
});
