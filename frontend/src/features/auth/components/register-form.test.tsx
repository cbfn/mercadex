import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './register-form';

const mockRegister = jest.fn();
const mockPush = jest.fn();

jest.mock('../model/auth-context', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{ name: string; email: string; password: string; confirm: string }> = {},
) => {
  const values = {
    name: 'João Silva',
    email: 'joao@test.com',
    password: 'senha1234',
    confirm: 'senha1234',
    ...overrides,
  };
  await user.type(screen.getByLabelText(/nome completo/i), values.name);
  await user.type(screen.getByLabelText(/^e-mail/i), values.email);
  await user.type(screen.getByLabelText(/^senha$/i), values.password);
  await user.type(screen.getByLabelText(/confirmar senha/i), values.confirm);
};

describe('RegisterForm', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockPush.mockReset();
  });

  it('renderiza todos os campos do formulário', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('redireciona para /login após cadastro bem-sucedido', async () => {
    mockRegister.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<RegisterForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith('João Silva', 'joao@test.com', 'senha1234'),
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
  });

  it('exibe erro quando as senhas não conferem', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);
    await fillForm(user, { confirm: 'outraSenha' });
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/senhas não conferem/i);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('exibe erro quando o nome tem menos de 2 caracteres', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);
    await fillForm(user, { name: 'A' });
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/pelo menos 2 caracteres/i);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('exibe erro quando a senha tem menos de 8 caracteres', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);
    await fillForm(user, { password: '1234567', confirm: '1234567' });
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/pelo menos 8 caracteres/i);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('exibe erro de e-mail duplicado (409)', async () => {
    const { ApiError } = await import('@/shared/lib/api-client');
    mockRegister.mockRejectedValue(new ApiError(409, {}));
    const user = userEvent.setup();

    render(<RegisterForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/já está cadastrado/i);
  });

  it('exibe mensagem genérica para erros de servidor', async () => {
    mockRegister.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<RegisterForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/não foi possível concluir/i);
  });

  it('exibe link para a página de login', () => {
    render(<RegisterForm />);
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login');
  });
});
