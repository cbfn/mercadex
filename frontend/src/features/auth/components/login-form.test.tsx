import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';

const mockLogin = jest.fn();
const mockPush = jest.fn();
const mockSearchParamsGet = jest.fn<string | null, [string]>();

jest.mock('../model/auth-context', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockPush.mockReset();
    mockSearchParamsGet.mockReturnValue(null); // sem redirect por padrão
  });

  it('renderiza campos de e-mail e senha', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('redireciona para / após login bem-sucedido quando não há redirect param', async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), 'user@test.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'senha123'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('redireciona para URL do redirect param após login bem-sucedido', async () => {
    mockSearchParamsGet.mockReturnValue('/products/42?reviews=open');
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), 'user@test.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/products/42?reviews=open'));
  });

  it('exibe mensagem de erro para credenciais inválidas (401)', async () => {
    const { ApiError } = await import('@/shared/lib/api-client');
    mockLogin.mockRejectedValue(new ApiError(401, {}));
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), 'wrong@test.com');
    await user.type(screen.getByLabelText(/senha/i), 'errada');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/e-mail ou senha inválidos/i);
  });

  it('exibe mensagem genérica para erros de servidor', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), 'user@test.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/não foi possível conectar/i);
  });

  it('desabilita o botão e os campos durante o carregamento', async () => {
    let resolveLogin!: () => void;
    mockLogin.mockReturnValue(new Promise<void>((res) => { resolveLogin = res; }));
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), 'user@test.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();

    resolveLogin();
    await waitFor(() => expect(screen.getByRole('button', { name: /entrar/i })).not.toBeDisabled());
  });

  it('exibe link para a página de registro', () => {
    render(<LoginForm />);
    expect(screen.getByRole('link', { name: /criar conta/i })).toHaveAttribute('href', '/register');
  });
});
