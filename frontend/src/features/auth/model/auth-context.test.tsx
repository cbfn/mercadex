import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/features/auth/model/auth-context';

const mockGetToken = jest.fn<string | null, []>();
const mockGetCachedUser = jest.fn();
const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockRegister = jest.fn();

jest.mock('@/shared/lib/api-client', () => ({
  getToken: () => mockGetToken(),
}));

jest.mock('@/shared/lib/api/auth', () => ({
  authApi: {
    login: (...args: unknown[]) => mockLogin(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
    register: (...args: unknown[]) => mockRegister(...args),
  },
  getCachedUser: () => mockGetCachedUser(),
}));

const mockUser = {
  id: 'user-1',
  name: 'João',
  email: 'joao@test.com',
  role: 'CUSTOMER' as const,
};

beforeEach(() => {
  mockGetToken.mockReset();
  mockGetCachedUser.mockReset();
  mockLogin.mockReset();
  mockLogout.mockReset();
  mockRegister.mockReset();

  // Default: sem sessão
  mockGetToken.mockReturnValue(null);
  mockGetCachedUser.mockReturnValue(null);
});

function TestConsumer() {
  const { user, isLoading, login, logout, register } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <button data-testid="login" onClick={() => void login('joao@test.com', 'senha123')}>
        Login
      </button>
      <button data-testid="logout" onClick={() => void logout()}>
        Logout
      </button>
      <button
        data-testid="register"
        onClick={() => void register('João', 'joao@test.com', 'senha123')}
      >
        Register
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe('AuthProvider – restauração de sessão', () => {
  it('finaliza carregamento com user null quando localStorage está vazio', async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('restaura usuário quando token e cache existem no localStorage', async () => {
    mockGetToken.mockReturnValue('tok');
    mockGetCachedUser.mockReturnValue(mockUser);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email);
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('mantém user null quando token existe mas não há cache', async () => {
    mockGetToken.mockReturnValue('tok');
    mockGetCachedUser.mockReturnValue(null);

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('mantém user null quando há cache mas não há token', async () => {
    mockGetToken.mockReturnValue(null);
    mockGetCachedUser.mockReturnValue(mockUser);

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });
});

describe('useAuth – login', () => {
  it('define user após login bem-sucedido', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(mockUser);
    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    await user.click(screen.getByTestId('login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email);
    });
  });

  it('mantém user null quando login lança erro', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    function SafeConsumer() {
      const { user: authUser, login } = useAuth();
      return (
        <div>
          <span data-testid="user">{authUser ? authUser.email : 'null'}</span>
          <button
            data-testid="login-safe"
            onClick={() => login('joao@test.com', 'senha123').catch(() => {})}
          >
            Login
          </button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <SafeConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('login-safe'));
    await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });
});

describe('useAuth – logout', () => {
  it('limpa user após logout', async () => {
    const user = userEvent.setup();
    mockGetToken.mockReturnValue('tok');
    mockGetCachedUser.mockReturnValue(mockUser);
    mockLogout.mockResolvedValueOnce(undefined);

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email));
    await user.click(screen.getByTestId('logout'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });
});

describe('useAuth – register', () => {
  it('chama API de registro com parâmetros corretos', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);
    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    await user.click(screen.getByTestId('register'));

    expect(mockRegister).toHaveBeenCalledWith('João', 'joao@test.com', 'senha123');
  });
});

describe('useAuth – fora do provider', () => {
  it('lança erro quando usado fora de AuthProvider', () => {
    function BadComponent() {
      useAuth();
      return null;
    }

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BadComponent />)).toThrow('useAuth deve ser usado dentro de <AuthProvider>');
    consoleSpy.mockRestore();
  });
});
