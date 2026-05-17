import { authApi } from '@/shared/lib/api/auth';

const mockApiRequest = jest.fn();
const mockSetToken = jest.fn();

jest.mock('@/shared/lib/api-client', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  setToken: (...args: unknown[]) => mockSetToken(...args),
}));

const USER_CACHE_KEY = 'mercadex:auth-user';

const mockUser = {
  id: 'user-1',
  name: 'João',
  email: 'joao@test.com',
  role: 'CUSTOMER' as const,
};

beforeEach(() => {
  mockApiRequest.mockReset();
  mockSetToken.mockReset();
  localStorage.clear();
});

describe('authApi.login', () => {
  it('chama apiRequest e retorna dados do usuário', async () => {
    mockApiRequest.mockResolvedValueOnce({
      success: true,
      data: { accessToken: 'tok', user: mockUser },
    });

    const result = await authApi.login('joao@test.com', 'senha123');
    expect(mockSetToken).toHaveBeenCalledWith('tok');
    expect(result).toEqual(mockUser);
  });

  it('armazena usuário em localStorage', async () => {
    mockApiRequest.mockResolvedValueOnce({
      success: true,
      data: { accessToken: 'tok', user: mockUser },
    });

    await authApi.login('joao@test.com', 'senha123');
    const cached = JSON.parse(localStorage.getItem(USER_CACHE_KEY) ?? 'null');
    expect(cached).toEqual(mockUser);
  });

  it('propaga erros do apiRequest', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Network error'));
    await expect(authApi.login('joao@test.com', 'senha123')).rejects.toThrow('Network error');
  });

  it('chama endpoint correto com skipAuth', async () => {
    mockApiRequest.mockResolvedValueOnce({
      success: true,
      data: { accessToken: 'tok', user: mockUser },
    });

    await authApi.login('joao@test.com', 'senha123');
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST', skipAuth: true }),
    );
  });
});

describe('authApi.register', () => {
  it('chama endpoint de registro', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });

    await authApi.register('João', 'joao@test.com', 'senha123');
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST', skipAuth: true }),
    );
  });

  it('propaga erros', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Conflict'));
    await expect(authApi.register('João', 'joao@test.com', 'senha123')).rejects.toThrow('Conflict');
  });
});

describe('authApi.logout', () => {
  it('limpa token e cache do usuário em localStorage', async () => {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mockUser));
    mockApiRequest.mockResolvedValueOnce({ success: true });

    await authApi.logout();
    expect(mockSetToken).toHaveBeenCalledWith(null);
    expect(localStorage.getItem(USER_CACHE_KEY)).toBeNull();
  });

  it('limpa token mesmo quando apiRequest lança erro (finally block)', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Server error'));

    await expect(authApi.logout()).rejects.toThrow('Server error');
    expect(mockSetToken).toHaveBeenCalledWith(null);
  });
});

describe('getCachedUser', () => {
  it('retorna null quando localStorage está vazio', async () => {
    const { getCachedUser } = await import('@/shared/lib/api/auth');
    expect(getCachedUser()).toBeNull();
  });

  it('retorna usuário quando há cache válido', async () => {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mockUser));
    const { getCachedUser } = await import('@/shared/lib/api/auth');
    expect(getCachedUser()).toEqual(mockUser);
  });
});
