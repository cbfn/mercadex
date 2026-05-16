import { authApi } from '@/shared/lib/api/auth';

const mockApiRequest = jest.fn();
const mockSetAccessToken = jest.fn();

jest.mock('@/shared/lib/api-client', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const USER_CACHE_KEY = 'mercadex:auth-user';

const mockUser = {
  id: 'user-1',
  name: 'João',
  email: 'joao@test.com',
  role: 'CUSTOMER' as const,
};

beforeEach(() => {
  mockApiRequest.mockReset();
  mockSetAccessToken.mockReset();
  mockFetch.mockReset();
  localStorage.clear();
});

describe('authApi.login', () => {
  it('chama apiRequest e retorna dados do usuário', async () => {
    mockApiRequest.mockResolvedValueOnce({
      success: true,
      data: { accessToken: 'tok', user: mockUser },
    });

    const result = await authApi.login('joao@test.com', 'senha123');
    expect(mockSetAccessToken).toHaveBeenCalledWith('tok');
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
  it('limpa access token e cache do usuário', async () => {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mockUser));
    mockApiRequest.mockResolvedValueOnce({ success: true });

    await authApi.logout();
    expect(mockSetAccessToken).toHaveBeenCalledWith(null);
    expect(localStorage.getItem(USER_CACHE_KEY)).toBeNull();
  });

  it('limpa token mesmo quando apiRequest lança erro (finally block)', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Server error'));

    // try-finally re-lança o erro, mas o finally limpa o token antes
    await expect(authApi.logout()).rejects.toThrow('Server error');
    expect(mockSetAccessToken).toHaveBeenCalledWith(null);
  });
});

describe('authApi.me', () => {
  it('retorna usuário do cache quando refresh funciona', async () => {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mockUser));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { accessToken: 'new-tok' } }),
    });

    const result = await authApi.me();
    expect(result).toEqual(mockUser);
    expect(mockSetAccessToken).toHaveBeenCalledWith('new-tok');
  });

  it('retorna null quando não há cache mesmo com refresh ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { accessToken: 'new-tok' } }),
    });

    const result = await authApi.me();
    expect(result).toBeNull();
  });

  it('retorna null quando refresh falha', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await authApi.me();
    expect(result).toBeNull();
  });

  it('limpa cache quando refresh falha', async () => {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mockUser));
    mockFetch.mockResolvedValueOnce({ ok: false });

    const result = await authApi.me();
    expect(result).toBeNull();
    expect(localStorage.getItem(USER_CACHE_KEY)).toBeNull();
  });

  it('retorna null quando fetch lança erro de rede', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const result = await authApi.me();
    expect(result).toBeNull();
  });
});
